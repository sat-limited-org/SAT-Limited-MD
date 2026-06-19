const gTTS = require("gtts")
const fs = require("fs")
const path = require("path")

module.exports = {
  name: "tts",
  description: "Convert text to speech",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    const textToSpeak = args.join(" ").trim()

    if (!textToSpeak) {
      return await m.reply("❌ Please provide text to convert to speech\n\n*Usage:* .tts Hello world")
    }

    const tempDir = path.join(__dirname, "../../temp")
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const fileName = path.join(tempDir, `${Date.now()}.mp3`)

    try {
      const gtts = new gTTS(textToSpeak, "en")

      gtts.save(fileName, async () => {
        try {
          await sock.sendMessage(m.from, {
            audio: fs.readFileSync(fileName),
            mimetype: "audio/mpeg",
            ptt: true
          }, { quoted: m })

          // Clean up temp file
          if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName)
          }
        } catch (e) {
          console.log("TTS send error:", e)
          await m.reply("❌ Failed to send TTS audio")
        }
      })
    } catch (e) {
      console.log("TTS error:", e)
      return await m.reply("❌ Failed to generate TTS audio")
    }
  }
}
