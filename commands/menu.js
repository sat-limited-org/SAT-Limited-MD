module.exports = {
  name: "menu",

  async execute(sock, msg, args, from) {

    const menuText = `
╭━━〔 SAT LIMITED MD 〕━━⬣
┃ 🤖 WhatsApp Multi Device Bot
┃ ⚡ Fast & Stable
╰━━━━━━━━━━━━━━⬣

╭━━〔 MAIN COMMANDS 〕━━⬣
┃ .menu
┃ .ping
┃ .owner
┃ .alive
╰━━━━━━━━━━━━━━⬣

╭━━〔 FUN COMMANDS 〕━━⬣
┃ .joke
┃ .quote
┃ .fact
╰━━━━━━━━━━━━━━⬣

╭━━〔 GROUP COMMANDS 〕━━⬣
┃ .tagall
┃ .kick
┃ .promote
┃ .demote
╰━━━━━━━━━━━━━━⬣

╭━━〔 SYSTEM 〕━━⬣
┃ Version: 1.0.0
┃ Bot: SAT Limited MD
╰━━━━━━━━━━━━━━⬣
`

    await sock.sendMessage(from, {
      text: menuText
    })

  }
}