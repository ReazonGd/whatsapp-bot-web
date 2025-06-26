import { CommandBot } from "../command.interface";

module.exports = {
  name: "stat",
  description: "Ai mitekiru...",
  execute: async (msg) => {
    msg.send({
      text: `📊 *Status:* Online ✅
🔧 *Version:* ${msg.config.VERSION}
⚡ *Framework:* Baileys + TypeScript
🕐 *Uptime:* ${process.uptime().toFixed(0)} seconds
💾 *Memory Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    });
  },
} as CommandBot;
