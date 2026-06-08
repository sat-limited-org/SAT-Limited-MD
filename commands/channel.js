module.exports = {
  name: "channel",
  category: "info",
  description: "Get the official channel link",
  
  async execute(sock, msg, args, from) {
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
`;
      
      await sock.sendMessage(from, {
        text: channelText
      });
    } catch (err) {
      console.log(err);
      await sock.sendMessage(from, {
        text: `❌ Error: ${err.message}`
      });
    }
  }
};
