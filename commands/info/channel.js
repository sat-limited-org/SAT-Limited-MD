module.exports = {
  name: "channel",
  description: "Get the official channel link",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    try {
      const channelText = `
╭━━〔 📢 SAT LIMITED CHANNEL 〕━━⬣
┃
┃ Join our official WhatsApp Channel
┃ for updates and announcements!
┃
┃ Channel Link:
┃ https://whatsapp.com/channel/0029Vb8A6Tz8qIzs2X2aFX3n
┃
┃ ✨ Stay updated with latest features
┃ 🔔 Get bot updates first
┃ 💬 Community announcements
┃
╰━━━━━━━━━━━━━━⬣

> SAT Limited MD
`
      await m.reply(channelText)
    } catch (err) {
      console.log(err)
      await m.reply(`❌ Error: ${err.message}`)
    }
  }
}
