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
const activePairing = new Map()
const commands = new Map()

// Recursive command loader
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

        if (command.name && typeof command.execute === "function") {
          commands.set(command.name, command)
          console.log(chalk.green(`[CMD] Loaded: ${command.name}`))
        }
      } catch (err) {
        console.log(chalk.red(`[CMD] Failed to load ${file.name}:`), err.message)
      }
    }
  }
}

// Load all commands from ./commands folder
const commandsPath = path.join(__dirname, "commands")
loadCommands(commandsPath)
console.log(chalk.cyan(`Total commands loaded: ${commands.size}`))

async function getSocket() {
  if (sock && sock.ws?.readyState === 1) return sock

  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

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
      console.log(chalk.cyan("✅ WhatsApp Connected"))
    }
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red("Connection closed:", reason))
      if (reason !== DisconnectReason.loggedOut) {
        sock = null
      }
    }
  })

  // Message handler
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

      const args = text.slice(1).trim().split(/ +/)
      const cmd = args.shift().toLowerCase()
      const from = msg.key.remoteJid

      const command = commands.get(cmd)
      if (!command) return

      await command.execute(sock, msg, args, from)
      console.log(chalk.yellow(`CMD: ${cmd}`))
      
    } catch (err) {
      console.log(chalk.red("Handler Error:"), err)
    }
  })

  await new Promise(r => setTimeout(r, 1500))
  return sock
}

// PAIR CODE ENDPOINT
app.post("/pair", async (req, res) => {
  try {
    let number = req.body.number?.replace(/[^0-9]/g, "")
    if (!/^[0-9]{10,15}$/.test(number)) {
      return res.json({ status: false, message: "Invalid phone number" })
    }

    if (activePairing.has(number)) {
      return res.json({ status: false, message: "Pairing already in progress" })
    }

    activePairing.set(number, true)
    const s = await getSocket()

    const code = await Promise.race([
      s.requestPairingCode(number),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 12s")), 12000))
    ])

    activePairing.delete(number)
    
    setTimeout(() => {
      if (sock?.ws) {
        try { sock.ws.close() } catch {}
        sock = null
      }
    }, 30000)

    return res.json({ status: true, code })

  } catch (err) {
    activePairing.delete(req.body.number?.replace(/[^0-9]/g, ""))
    console.log("PAIR ERROR:", err)
    return res.json({ status: false, message: err.message || "Pair code failed" })
  }
})

// QR CODE ENDPOINT
app.get("/qr", async (req, res) => {
  try {
    const s = await getSocket()
    
    if (s.user) {
      return res.json({ status: "connected" })
    }

    let sent = false
    s.ev.on("connection.update", async (update) => {
      if (update.qr && !sent) {
        sent = true
        const qrData = await QRCode.toDataURL(update.qr)
        res.json({ qr: qrData })
      }
    })

    setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "QR timeout. Refresh and try again." })
      }
    }, 8000)

  } catch (err) {
    console.log("QR ERROR:", err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/ping", (_, res) => res.send("pong"))
app.get("/status", (_, res) => res.json({ 
  status: sock?.user ? "connected" : "offline" 
}))

module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on ${PORT}`))
}