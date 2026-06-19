module.exports = {
  name: "vv",
  description: "View version and bot information",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    const versionInfo = `
╔════════════════════════════╗
║ 📊 BOT INFORMATION 📊
╠════════════════════════════╣
║ Bot Name: ${botSettings.botName}
║ Owner: ${botSettings.ownerName}
║ Version: 1.0.0
║ Status: ✅ Active
╚════════════════════════════╝
    `.trim()
    
    await m.reply(versionInfo)
  }
}
