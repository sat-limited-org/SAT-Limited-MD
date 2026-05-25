module.exports = {
  name: "ping",
  aliases: ["alive", "p"],

  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      text: "🏓 Pong! Bot is running\n> SAT Limited"
    })
  }
}