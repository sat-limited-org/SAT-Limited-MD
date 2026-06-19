module.exports = {
  name: "admin",
  description: "Show admin commands",
  execute: async (sock, m, args, cmdName, { botSettings }) => {
    if (!m.isOwner) {
      return await m.reply("❌ Only the bot owner can use admin commands.")
    }
    
    const adminText = `
╔════════════════════════════╗
║ 🔐 ADMIN COMMANDS 🔐
╠════════════════════════════╣
║ .leave - Leave the group
║ .kick @user - Remove member
║ .promote @user - Make admin
║ .demote @user - Remove admin
║ .groupinfo - Show group info
╚════════════════════════════╝
    `.trim()
    
    await m.reply(adminText)
  }
}
