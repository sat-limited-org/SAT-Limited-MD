const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",

  async execute(sock, msg, args, from) {
    // Load all commands dynamically
    const commandsDir = path.join(__dirname, "../commands");
    const commandsList = [];

    function scanCommands(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          scanCommands(fullPath);
        } else if (file.name.endsWith(".js")) {
          try {
            const command = require(fullPath);
            if (command?.name && typeof command.execute === "function") {
              const category = path.basename(path.dirname(fullPath));
              const isRootCmd = category === "commands";
              commandsList.push({
                name: command.name,
                category: isRootCmd ? "MAIN" : category.toUpperCase()
              });
            }
          } catch (err) {
            // Skip failed command loads
          }
        }
      }
    }

    scanCommands(commandsDir);

    // Organize commands by category
    const categories = {};
    commandsList.forEach(cmd => {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
    });

    // Sort command names within each category
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Build menu
    let menuText = `╭━━〔 SAT LIMITED MD 〕━━⬣
┃ 🤖 WhatsApp Multi Device Bot
┃ ⚡ Fast & Stable
┃ 📱 All Commands Available
╰━━━━━━━━━━━━━━⬣\n`;

    // Add each category
    const categoryOrder = ["MAIN", "FUN", "INFO", "ADMIN", "OWNER"];
    categoryOrder.forEach(category => {
      if (categories[category]) {
        menuText += `\n╭━━〔 ${category} COMMANDS 〕━━⬣\n`;
        categories[category].forEach(cmd => {
          menuText += `┃ .${cmd.name}\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━⬣\n`;
      }
    });

    // Add other categories not in the predefined list
    Object.keys(categories).forEach(category => {
      if (!categoryOrder.includes(category)) {
        menuText += `\n╭━━〔 ${category} COMMANDS 〕━━⬣\n`;
        categories[category].forEach(cmd => {
          menuText += `┃ .${cmd.name}\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━⬣\n`;
      }
    });

    menuText += `
╭━━〔 SYSTEM 〕━━⬣
┃ Version: 1.0.0
┃ Bot: SAT Limited MD
┃ Prefix: .
┃ Total Commands: ${commandsList.length}
╰━━━━━━━━━━━━━━⬣

╭━━〔 📢 JOIN OUR CHANNEL 〕━━⬣
┃
┃ https://whatsapp.com/channel/0029Vb8A6Tz8qIzs2X2aFX3n
┃
┃ Type .channel for more info
╰━━━━━━━━━━━━━━⬣

✨ *Use any command with the dot (.) prefix!*
> For support, type .owner`;

    await sock.sendMessage(from, {
      text: menuText
    });
  }
};
