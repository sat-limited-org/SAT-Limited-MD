const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const express = require("express")
const path = require("path")
const P = require("pino")
const chalk = require("chalk")

// =======================
// ⚙️ EXPRESS SETUP
// =======================

const app = express()
const PORT = process.env.PORT || 3000

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

// =======================
// 🚀 START BOT
// =======================

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const { version } =
await fetchLatestBaileysVersion()

sock = makeWASocket({
version,
auth: state,
logger: P({ level: "silent" }),

browser: [
  "SAT Limited MD",
  "Chrome",
  "1.0.0"
],

// 🔗 PAIR CODE MODE
printQRInTerminal: false,

generateHighQualityLinkPreview: true,
syncFullHistory: false

})

// =======================
// 💾 SAVE SESSION
// =======================

sock.ev.on("creds.update", saveCreds)

// =======================
// 🔗 WAITING FOR PAIRING
// =======================

if (!sock.authState.creds.registered) {

console.log(
  chalk.yellow(
    "Waiting for Pair Code Request..."
  )
)

}

// =======================
// 🔌 CONNECTION UPDATE
// =======================

sock.ev.on("connection.update", async ({
connection,
lastDisconnect
}) => {

// ===== CONNECTED =====

if (connection === "open") {

  console.clear()

  console.log(
    chalk.cyan(`

╔══════════════════════╗
🤖 SAT LIMITED MD
Connected Successfully
╚══════════════════════╝
`)
)
}

// ===== DISCONNECTED =====

if (connection === "close") {

  const reason =
    lastDisconnect?.error?.output?.statusCode

  console.log(
    chalk.red("Connection closed...")
  )

  // reconnect unless logged out
  if (
    reason !== DisconnectReason.loggedOut
  ) {

    startBot()

  } else {

    console.log(
      chalk.red("Logged out.")
    )
  }
}

})

// =======================
// 💬 MESSAGE HANDLER
// =======================

sock.ev.on("messages.upsert", async ({
messages
}) => {

try {

  const msg = messages[0]

  if (!msg.message) return
  if (msg.key.fromMe) return

  // =======================
  // 📝 GET MESSAGE TEXT
  // =======================

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    ""

  if (!text.startsWith(config.prefix))
    return

  // =======================
  // 📌 COMMANDS
  // =======================

  const args =
    text.slice(config.prefix.length)
    .trim()
    .split(/ +/)

  const cmd =
    args.shift().toLowerCase()

  const from = msg.key.remoteJid

  console.log(
    chalk.yellow(`CMD: ${cmd}`)
  )

  // =======================
  // 🏓 PING
  // =======================

  if (cmd === "ping") {

    await sock.sendMessage(from, {
      text: "🏓 Pong!"
    })
  }

  // =======================
  // 📜 MENU
  // =======================

  else if (
    cmd === "menu" ||
    cmd === "help"
  ) {

    const menu = `

╔══════════════════════╗
🤖 SAT LIMITED MD
╚══════════════════════╝

🧠 AI:
➤ .ai
➤ .gpt
➤ .gemini

📥 Download:
➤ .play
➤ .song
➤ .video

🎨 Images:
➤ .imagine
➤ .sticker

👮 Admin:
➤ .ban
➤ .kick
➤ .mute

⚙️ General:
➤ .ping
➤ .owner
➤ .menu
`

    await sock.sendMessage(from, {
      text: menu
    })
  }

  // =======================
  // 👑 OWNER
  // =======================

  else if (cmd === "owner") {

    await sock.sendMessage(from, {
      text:

"👑 Owner: ${config.ownerName} 📞 ${config.ownerNumber}"
})
}

} catch (err) {

  console.log(
    chalk.red("ERROR:"),
    err
  )
}

})
}

// =======================
// 🔗 PAIR CODE API
// =======================

app.post("/pair", async (req, res) => {

try {

let number = req.body.number

if (!number) {

  return res.json({
    status: false,
    message: "Phone number required"
  })
}

// clean number
number = number.replace(/[^0-9]/g, "")

// check socket
if (!sock) {

  return res.json({
    status: false,
    message: "Socket not initialized"
  })
}

// delay helps socket initialize
await new Promise(resolve =>
  setTimeout(resolve, 2000)
)

// generate pair code
const code =
  await sock.requestPairingCode(number)

return res.json({
  status: true,
  code
})

} catch (err) {

console.log("PAIR ERROR:", err)

return res.json({
  status: false,
  message: err.message || "Pair code failed"
})

}
})

// =======================
// 🚀 START SERVER
// =======================

app.listen(PORT, () => {

console.log(
  chalk.green(`
╔══════════════════════╗
🌐 WEB PANEL ACTIVE
PORT: ${PORT}
╚══════════════════════╝
`)
)
})

// =======================
// ▶️ START BOT
// =======================

startBot()