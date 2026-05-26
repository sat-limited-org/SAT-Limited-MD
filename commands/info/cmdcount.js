module.exports = {
  name: "cmdcount",
  category: "info",
  description: "Show total number of commands available",
  execute: async (sock, m, args, cmd, context) => {
    try {
      const totalCommands = context?.commands?.size || 0
      
      const message = `
╔═══════════════════════════════╗
║    📊 COMMAND COUNT           ║
╠═══════════════════════════════╣
║                               ║
║  Total Commands: ${totalCommands}
║                               ║
║  Use ${context?.botSettings?.prefix || '.'}help to see all commands
║                               ║
╚═══════════════════════════════╝
`

      await sock.sendMessage(m.key.remoteJid, {
        text: message
      })
    } catch (err) {
      console.log(err)
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ Error: ${err.message}`
      })
    }
  }
}
