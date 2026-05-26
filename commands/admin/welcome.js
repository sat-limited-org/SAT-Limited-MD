module.exports = {
  name: "welcome",
  category: "admin",
  description: "Send a welcome message to the group",
  execute: async (sock, m, args, cmd) => {
    try {
      // Check if it's a group
      if (!m.isGroup) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ This command can only be used in groups!"
        })
      }

      // Check if user is admin
      const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
      const isAdmin = groupMetadata.participants.find(
        p => p.id === m.sender && p.admin
      )

      if (!isAdmin) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ You must be a group admin to use this command!"
        })
      }

      // Get custom message or use default
      const customMessage = args.join(" ") || "Welcome to the group! 👋"

      const welcomeMessage = `
╔════════════════════════════════╗
║    👋 WELCOME TO THE GROUP     ║
╠════════════════════════════════╣
║                                ║
║  ${customMessage}
║                                ║
║  Group: ${groupMetadata.subject}
║  Members: ${groupMetadata.participants.length}
║                                ║
║  Follow the group rules and    ║
║  have a great time!            ║
║                                ║
╚════════════════════════════════╝
`

      await sock.sendMessage(m.key.remoteJid, {
        text: welcomeMessage
      })

    } catch (err) {
      console.log(err)
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ Error: ${err.message}`
      })
    }
  }
}
