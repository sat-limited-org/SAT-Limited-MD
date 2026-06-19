module.exports = {
  name: "ownerinfo",
  description: "Show owner-only commands",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    if (!m.isOwner) {
      return await m.reply("❌ Only the bot owner can use this command.")
    }
    
    const ownerText = `
╔════════════════════════════╗
║ 👑 OWNER COMMANDS 👑
╠════════════════════════════╣
║ .pair - Generate pairing code
║ .broadcast - Send message to all
║ .setprefix - Change bot prefix
║ .restart - Restart the bot
║ .eval - Execute code
╚════════════════════════════╝
    `.trim()
    
    await m.reply(ownerText)
  }
}
