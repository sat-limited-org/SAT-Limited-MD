module.exports = {
  name: "ping",
  description: "Ping the bot to check if it's working",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    await m.reply("🏓 Pong! Bot is working fine.")
  }
}
