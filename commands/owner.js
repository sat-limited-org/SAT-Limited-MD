const { ownerNumber } = require("../config")

module.exports = {
  name: "owner",
  category: "info",
  description: "Get owner contact information",
  execute: async (sock, m, args, cmd) => {
    const ownerJid = ownerNumber.includes("@") ? ownerNumber : `${ownerNumber}@s.whatsapp.net`
    
    const message = `
╔═══════════════════════════════╗
║      👤 OWNER INFORMATION      ║
╠═══════════════════════════════╣
║ Owner: SAT Limited            ║
║ Number: +${ownerNumber}      ║
║ Status: Available             ║
║ Chat: Available on WhatsApp   ║
╚═══════════════════════════════╝

Contact owner for assistance and support.
`

    await sock.sendMessage(m.key.remoteJid, {
      text: message
    })
  }
}
