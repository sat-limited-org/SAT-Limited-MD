const express = require("express")
const path = require("path")
const fs = require("fs")
const P = require("pino")
const chalk = require("chalk")
const NodeCache = require("node-cache")
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const app = express()
app.use(express.json())
app.use(express.static(__dirname))

const SESSION_DIR = path.join(__dirname, "session")
const msgRetryCounterCache = new NodeCache()
const commands = new Map()
let sock = null

// Command loader
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
        if (command?.name && typeof command.execute === "function") {
          commands.set(command.name, command)
          console.log(chalk.green(`[CMD] Loaded: ${command.name}`))
        }
      } catch (err) {
        console.log(chalk.red(`[CMD] Failed: ${file.name}`), err.message)
      }
    }
  }
}
loadCommands(path.join(__dirname, "commands"))
console.log(chalk.cyan(`Total commands loaded: ${commands.size}`))

async function getSocket() {
  if (sock) return sock
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    browser: ["SAT Limited MD", "Chrome", "1.0.0"],
    printQRInTerminal: false,
    msgRetryCounterCache
  })

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log(chalk.green("✅ WhatsApp Connected"))
    if (connection === "close") sock = null
  })

  return sock
}

app.get("/pair", async (req, res) => {
  try {
    const number = req.query.number?.replace(/[^0-9]/g, "")
    if (!number) return res.json({ status: false, message: "Number required" })

    const s = await getSocket()
    if (s.authState.creds.registered) {
      return res.json({ status: true, message: "Already connected" })
    }

    const code = await s.requestPairingCode(number)
    return res.json({ status: true, code })
    
  } catch (err) {
    console.log(chalk.red("PAIR ERROR:"), err)
    return res.json({ status: false, message: err.message })
  }
})

app.get("/status", (req, res) => {
  res.json({ status: sock?.user ? "connected" : "offline" })
})

module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(chalk.cyan(`🚀 Server running on ${PORT}`)))
}