import { WAMessage, proto } from "@whiskeysockets/baileys";
import Message from "../lib/message";
import { CommandBot } from "./command.interface";
import fs from "fs";
import path from "path";

export class MessageHandler {
  private commands: { [key: string]: CommandBot };
  constructor() {
    this.commands = {};

    const dirs = fs.readdirSync(path.join(__dirname, "commands"));
    for (let dir of dirs) {
      const file_path = path.join(__dirname, "commands", dir);
      console.log(file_path);

      const cmd = require(file_path) as CommandBot;
      this.commands[cmd.name] = cmd;
    }
    // console.log(dir);
  }
  async handleMessage(chat: Message): Promise<void> {
    try {
      const senderNumber = chat.getJid();
      const senderName = chat.message.pushName || "Unknown";

      if (chat.isStatus) return;
      if (chat.config.hasLimit()) return console.log(`message ignored because limited`);
      if (chat.config.isBlocked(senderNumber || "")) return;
      if (chat.isGroub && !chat.config.RESPOND_IN_GROUPS) return;

      if (!chat.text) return;
      // console.log(`📨 Message from ${senderName} (${senderNumber}): ${chat.text} | ${chat.cmd_name} - ${chat.args}`);

      if (chat.config.AUTO_READ) chat.markAsRead();
      if (chat.isCommand) {
        const c = this.commands[chat.cmd_name];

        if (!c) return chat.send({ text: "Perintah tidak ditemukan" });
        c.execute(chat);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
}
