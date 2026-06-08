module.exports = {
  name: "menu",

  async execute(sock, msg, args, from) {

    const menuText = `
╭━━〔 SAT LIMITED MD 〕━━⬣
┃ 🤖 WhatsApp Multi Device Bot
┃ ⚡ Fast & Stable
┃ 📱 All Commands Available
╰━━━━━━━━━━━━━━⬣

╭━━〔 MAIN COMMANDS 〕━━⬣
┃ .menu - Show this menu
┃ .ping - Check bot status
┃ .owner - Get owner info
┃ .cmdcount - Total commands count
╰━━━━━━━━━━━━━━⬣

╭━━〔 FUN COMMANDS 〕━━⬣
┃ .joke - Get a random joke
┃ .quote - Get a random quote
┃ .fact - Get a random fact
╰━━━━━━━━━━━━━━⬣

╭━━〔 GROUP COMMANDS 〕━━⬣
┃ .kick - Kick a user (Admin)
┃ .promote - Make admin (Admin)
┃ .demote - Remove admin (Admin)
┃ .welcome - Welcome message (Admin)
╰━━━━━━━━━━━━━━⬣

╭━━〔 SYSTEM 〕━━⬣
┃ Version: 1.0.0
┃ Bot: SAT Limited MD
┃ Prefix: .
╰━━━━━━━━━━━━━━⬣

✨ *Use any command with the dot (.) prefix!*
> For support, type .owner
`;

    await sock.sendMessage(from, {
      text: menuText
    })

  }
}
