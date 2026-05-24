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

// =======================
// ⚙️ EXPRESS SETUP
// =======================
const app = express()
app.use(express.json())
app.use(express.static(__dirname))

// =======================
// 🌐 HOME PAGE
// =======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// =======================
// ⚙️ CONFIG
// =======================
const config = {
  botName: "SAT Limited MD",
  ownerName: "SAT Limited",
  prefix: ".",
  ownerNumber: "260772697513"
}

// =======================
// 🤖 GLOBAL SOCKET
// =======================
let sock
const SESSION_DIR = "/tmp/session"
const activePairing = new Map()

// =======================
// 🚀 START BOT
// =======================
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
    generateHighQualityLinkPreview: true,
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

  await new Promise(r => setTimeout(r, 2000))
  return sock
}

// =======================
// 🔗 PAIR CODE API
// =======================
app.post("/pair", async (req, res) => {
  try {
    let number = req.body.number
    if (!number) {
      return res.json({ status: false, message: "Phone number required" })
    }

    number = number.replace(/[^0-9]/g, "")
    if (!/^[0-9]{10,15}$/.test(number)) {
      return res.json({ status: false, message: "Invalid phone number" })
    }

    if (activePairing.has(number)) {
      return res.json({ status: false, message: "Pairing already in progress" })
    }

    activePairing.set(number, true)
    const s = await getSocket()

    // 12s timeout to avoid Vercel kill
    const code = await Promise.race([
      s.requestPairingCode(number),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 12s")), 12000))
    ])

    activePairing.delete(number)

    // Close socket after 30s to save memory
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

// =======================
// 💓 KEEP ALIVE
// =======================
app.get("/ping", (_, res) => res.send("pong"))
app.get("/status", (_, res) => res.json({ 
  status: sock?.user ? "connected" : "offline" 
}))

// =======================
// 🚀 EXPORT FOR VERCEL
// =======================
module.exports = app

// Local testing only
if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(chalk.green(`Server running on ${PORT}`))
  })
}