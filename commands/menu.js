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

╭━━〔 📢 JOIN OUR CHANNEL 〕━━⬣
┃
┃ https://whatsapp.com/channel/0029Vb8A6Tz8qIzs2X2aFX3n
┃
┃ Type .channel for more info
╰━━━━━━━━━━━━━━⬣

✨ *Use any command with the dot (.) prefix!*
> For support, type .owner
`;

    await sock.sendMessage(from, {
      text: menuText
    })

  }
}
