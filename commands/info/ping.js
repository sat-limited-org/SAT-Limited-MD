module.exports = {
  name: "ping",
  description: "Ping the bot to check if it's working",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    const startTime = Date.now()
    await m.reply("🏓 Pong!")
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    await m.reply(`🏓 *Pong!* ⚡\n\n*Response Time:* ${responseTime}ms\n*Status:* ✅ Online`)
  }
}
