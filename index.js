const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const express = require("express")
const path = require("path")
const fs = require("fs")
const P = require("pino")
const chalk = require("chalk")
const QRCode = require("qrcode")

const app = express()

app.use(express.json())
app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

const SESSION_DIR = "/tmp/session"

let sock = null
let socketConnecting = false

const activePairing = new Map()
const commands = new Map()

// =======================
// LOAD COMMANDS
// =======================

function loadCommands(dir) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      loadCommands(fullPath)
    } else if (file.name.endsWith(".js")) {
      try {
        delete require.cache[require.resolve(fullPath)]

        const command = require(fullPath)

        if (
          command &&
          command.name &&
          typeof command.execute === "function"
        ) {
          commands.set(command.name, command)

          console.log(
            chalk.green(`[CMD] Loaded: ${command.name}`)
          )
        }
      } catch (err) {
        console.log(
          chalk.red(`[CMD] Failed: ${file.name}`),
          err.message
        )
      }
    }
  }
}

const commandsPath = path.join(__dirname, "commands")

loadCommands(commandsPath)

console.log(
  chalk.cyan(`Total commands loaded: ${commands.size}`)
)

// =======================
// SOCKET
// =======================

async function getSocket() {
  if (sock?.ws?.readyState === 1) {
    return sock
  }

  if (socketConnecting) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (sock?.ws?.readyState === 1) {
          clearInterval(check)
          resolve()
        }
      }, 500)
    })

    return sock
  }

  socketConnecting = true

  try {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true })
    }

    const { state, saveCreds } =
      await useMultiFileAuthState(SESSION_DIR)

    const { version } =
      await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" }),
      browser: ["SAT Limited MD", "Chrome", "1.0.0"],
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

      if (connection === "open") {
        console.log(
          chalk.green("✅ WhatsApp Connected")
        )
      }

      if (connection === "close") {
        const reason =
          lastDisconnect?.error?.output?.statusCode

        console.log(
          chalk.red("❌ Connection closed:", reason)
        )

        if (reason !== DisconnectReason.loggedOut) {
          sock = null
        }
      }
    })

    // =======================
    // MESSAGE HANDLER
    // =======================

    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages[0]

        if (!msg.message || msg.key.fromMe) return

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          ""

        if (!text.startsWith(".")) return

        const args =
          text.slice(1).trim().split(/ +/)

        const cmd = args.shift()?.toLowerCase()

        const from = msg.key.remoteJid

        const command = commands.get(cmd)

        if (!command) return

        await command.execute(
          sock,
          msg,
          args,
          from
        )

        console.log(
          chalk.yellow(`CMD: ${cmd}`)
        )

      } catch (err) {
        console.log(
          chalk.red("Handler Error:"),
          err
        )
      }
    })

    // WAIT UNTIL READY

    await new Promise((resolve, reject) => {

      const timeout = setTimeout(() => {
        reject(new Error("Socket connection timeout"))
      }, 15000)

      sock.ev.on("connection.update", ({ connection }) => {

        if (connection === "open") {
          clearTimeout(timeout)
          resolve()
        }
      })
    })

    return sock

  } finally {
    socketConnecting = false
  }
}

// =======================
// PAIR CODE
// =======================

app.post("/pair", async (req, res) => {

  try {

    let number =
      req.body.number
        ?.replace(/[^0-9]/g, "")

    if (!/^[0-9]{10,15}$/.test(number)) {
      return res.json({
        status: false,
        message: "Invalid phone number"
      })
    }

    if (activePairing.has(number)) {
      return res.json({
        status: false,
        message: "Pairing already in progress"
      })
    }

    activePairing.set(number, true)

    const s = await getSocket()

    await new Promise(r => setTimeout(r, 3000))

    const code = await Promise.race([

      s.requestPairingCode(number),

      new Promise((_, reject) =>
        setTimeout(() =>
          reject(
            new Error("Pairing timeout")
          ),
        15000)
      )

    ])

    activePairing.delete(number)

    setTimeout(() => {
      try {
        if (sock?.ws) {
          sock.ws.close()
        }

        sock = null

      } catch {}
    }, 30000)

    return res.json({
      status: true,
      code
    })

  } catch (err) {

    console.log(
      chalk.red("PAIR ERROR:"),
      err
    )

    activePairing.delete(
      req.body.number?.replace(/[^0-9]/g, "")
    )

    return res.json({
      status: false,
      message: err.message || "Pair code failed"
    })
  }
})

// =======================
// QR CODE
// =======================

app.get("/qr", async (req, res) => {

  try {

    const s = await getSocket()

    if (s.user) {
      return res.json({
        status: "connected"
      })
    }

    const listener = async (update) => {

      if (update.qr && !res.headersSent) {

        try {

          const qrData =
            await QRCode.toDataURL(update.qr)

          res.json({
            qr: qrData
          })

          s.ev.off(
            "connection.update",
            listener
          )

        } catch (e) {

          if (!res.headersSent) {

            res.status(500).json({
              error: e.message
            })
          }
        }
      }
    }

    s.ev.on(
      "connection.update",
      listener
    )

    setTimeout(() => {

      s.ev.off(
        "connection.update",
        listener
      )

      if (!res.headersSent) {

        res.status(408).json({
          error: "QR generation timeout"
        })
      }

    }, 15000)

  } catch (err) {

    console.log(
      chalk.red("QR ERROR:"),
      err
    )

    if (!res.headersSent) {

      res.status(500).json({
        error: err.message
      })
    }
  }
})

// =======================
// STATUS
// =======================

app.get("/status", (_, res) => {

  res.json({
    status: sock?.user
      ? "connected"
      : "offline"
  })
})

app.get("/ping", (_, res) => {
  res.send("pong")
})

// =======================
// START
// =======================

module.exports = app

if (require.main === module) {

  const PORT =
    process.env.PORT || 3000

  app.listen(PORT, () => {

    console.log(
      chalk.cyan(
        `🚀 Server running on ${PORT}`
      )
    )
  })
}