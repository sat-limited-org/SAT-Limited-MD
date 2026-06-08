module.exports = {
  name: "quote",
  description: "Get a random inspirational quote",
  async execute(sock, m, args, cmdName, { commands, botSettings }) {
    try {
      const quotes = [
        "\"The only way to do great work is to love what you do.\" — Steve Jobs",
        "\"Innovation distinguishes between a leader and a follower.\" — Steve Jobs",
        "\"Life is what happens when you're busy making other plans.\" — John Lennon",
        "\"The future belongs to those who believe in the beauty of their dreams.\" — Eleanor Roosevelt",
        "\"It is during our darkest moments that we must focus to see the light.\" — Aristotle",
        "\"The only impossible journey is the one you never begin.\" — Tony Robbins",
        "\"Success is not final, failure is not fatal.\" — Winston Churchill",
        "\"Believe you can and you're halfway there.\" — Theodore Roosevelt",
        "\"Do what you can, with what you have, where you are.\" — Theodore Roosevelt",
        "\"The best time to plant a tree was 20 years ago. The second best time is now.\" — Chinese Proverb",
        "\"Your time is limited, don't waste it living someone else's life.\" — Steve Jobs",
        "\"The way to get started is to quit talking and begin doing.\" — Walt Disney",
        "\"Don't watch the clock; do what it does. Keep going.\" — Sam Levenson",
        "\"Everything you want is on the other side of fear.\" — Jack Canfield",
        "\"Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.\" — Roy T. Bennett"
      ];

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      await m.reply(`✨ *Inspirational Quote*\n\n${randomQuote}`);
    } catch (error) {
      console.error("Quote command error:", error);
      await m.reply(`❌ Error fetching quote: ${error.message}`);
    }
  }
};
