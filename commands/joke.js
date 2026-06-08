const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "What do you call a fake noodle? An impasta!",
  "Why don't eggs tell jokes? They'd crack up!",
  "What did the ocean say to the beach? Nothing, it just waved!",
  "Why did the coffee file a police report? It got mugged!",
  "How do you organize a space party? You planet!",
  "Why did the math book look sad? Because it had too many problems!",
  "What's the best thing about Switzerland? I don't know, but their flag is a big plus!",
  "Why did the chicken go to the séance? To get to the other side!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why don't skeletons fight each other? They don't have the guts!",
  "What did the blank said to the pen? You crack me up!",
  "Why did the phone go to school? It wanted to improve its cell service!",
  "What's orange and sounds like a parrot? A carrot!",
  "Why don't oysters share their pearls? Because they're shellfish!",
  "What do you call a sleeping bull? A bulldozer!",
  "Why did the kid bring a ladder to school? Because he wanted to go to high school!",
  "What do you call a three-footed aardvark? A triple threat!",
  "Why did the cookie go to the doctor? Because it felt crumbly!"
];

module.exports = {
  name: "joke",
  category: "fun",
  description: "Get a random joke",
  
  async execute(sock, msg, args, from) {
    try {
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      
      const jokeText = `
╭━━〔 😂 JOKE TIME 😂 〕━━⬣
┃
┃ ${randomJoke}
┃
╰━━━━━━━━━━━━━━⬣

> SAT Limited MD
`;
      
      await sock.sendMessage(from, {
        text: jokeText
      });
    } catch (err) {
      console.log(err);
      await sock.sendMessage(from, {
        text: `❌ Error: ${err.message}`
      });
    }
  }
};
