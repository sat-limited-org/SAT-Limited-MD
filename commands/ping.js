module.exports = {
  name: "ping",
  aliases: ["alive", "p"], // add all the triggers you want

  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      text: "🏓 Pong!Bot is running 

> SAT Limited"
    })
  }
}