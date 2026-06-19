const { useMultiFileAuthState, fetchLatestBaileysVersion, delay } = require("@whiskeysockets/baileys")
const P = require("pino")
const path = require("path")
const fs = require("fs")

module.exports = {
  name: "pair",
  description: "Get pairing code to connect WhatsApp",
  async execute(sock, m, args, cmdName, { botSettings }) {
    try {
      // Check if user is owner
      if (!m.isOwner) {
        return await m.reply("❌ Only the bot owner can use this command.")
      }

      // Check if a phone number is provided
      if (args.length === 0) {
        return await m.reply(
          "📱 *Usage:* `.pair YOUR_PHONE_NUMBER`\n\n" +
          "Example: `.pair 2348012345678`\n\n" +
          "Make sure to include your country code (e.g., 234 for Nigeria, 1 for USA)"
        )
      }

      const number = args[0].replace(/[^0-9]/g, "")

      if (!number || number.length < 10) {
        return await m.reply("❌ Invalid phone number. Please provide a valid number (at least 10 digits).")
      }

      await m.reply("⏳ Generating WhatsApp pairing code for: +" + number + "\n\nPlease wait...")

      try {
        // Create a temporary socket for pairing
        const SESSION_DIR = path.join(__dirname, "../session_pair")

        if (!fs.existsSync(SESSION_DIR)) {
          fs.mkdirSync(SESSION_DIR, { recursive: true })
        }

        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
        const { version } = await fetchLatestBaileysVersion()

        // Import baileys after getting version
        const { default: makeWASocket } = require("@whiskeysockets/baileys")

        const pairSocket = makeWASocket({
          version,
          auth: state,
          logger: P({ level: "silent" }),
          browser: ["SAT Limited MD", "Chrome", "1.0.0"],
          printQRInTerminal: false,
          markOnlineOnConnect: false,
          generateHighQualityLinkPreview: false,
          shouldSyncHistoryMessage: false,
          syncFullHistory: false
        })

        pairSocket.ev.on("creds.update", saveCreds)

        // Request pairing code
        const pairingCode = await pairSocket.requestPairingCode(number)

        // Format the code with dashes
        const formattedCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode

        const successMessage = `
✅ *Pairing Code Generated Successfully!*

📱 *Phone Number:* +${number}
🔐 *Pairing Code:* \`${formattedCode}\`

⏱️ *Valid for:* 5 minutes

📝 *Steps:*
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Enter the code above

⚠️ Do NOT share this code with anyone!
`

        await m.reply(successMessage)

        // Close the temporary socket after a delay
        setTimeout(() => {
          pairSocket?.end?.()
        }, 5000)

      } catch (pairingError) {
        console.error("Pairing error:", pairingError.message)
        await m.reply(
          `❌ Failed to generate pairing code.\n\n` +
          `Error: ${pairingError.message || "Unknown error"}\n\n` +
          `Make sure:\n` +
          `• The bot is running on a server (not localhost)\n` +
          `• Your phone number is correct\n` +
          `• WhatsApp is installed on your device`
        )
      }

    } catch (error) {
      console.error("Pair command error:", error)
      await m.reply(`❌ Error: ${error.message}`)
    }
  }
}
