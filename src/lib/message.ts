import pino from "pino";
import { BotConfig } from "../config/bot";
import { AnyMediaMessageContent, AnyMessageContent, MiscMessageGenerationOptions, WAMessage, WASocket, downloadMediaMessage, proto } from "@whiskeysockets/baileys";
// import cmd from "../handlers/commands/ping";

export default class Message {
  /*
    config
    bot / sock
    
    */

  public config: BotConfig;
  public sock: WASocket;
  public message: WAMessage;
  public text: string | null;
  public cmd_name: string = "";
  public isCommand = false;
  public isGroub = false;
  public args: string[] = [];

  constructor(botConfig: BotConfig, sock: any, message: WAMessage) {
    this.config = botConfig;
    this.sock = sock;
    this.message = message;
    this.text = this.getText();

    if (this.getJid()?.includes("@g.us")) {
      this.isGroub = true;
    }

    convertText: {
      if (this.text) {
        if (this.isGroub) {
          if (!this.text.startsWith(`@${this.config.PHONE_NUMBER}`)) break convertText;
          else this.text = this.text.slice(`@${this.config.PHONE_NUMBER}`.length).trim();
        }

        let [n, ...p] = this.text?.split(" ");

        if (n.startsWith(this.config.PREFIX)) {
          this.cmd_name = n.slice(this.config.PREFIX.length);
          this.isCommand = true;
        } else {
          this.cmd_name = n;
        }
        this.args = p;
      }
    }

    if (this.config.AUTO_READ) {
      this.sock.readMessages([message.key]);
    }
  }

  public getText(): string | null {
    const messageType = Object.keys(this.message.message || {})[0];

    switch (messageType) {
      case "conversation":
        return this.message.message?.conversation || null;

      case "extendedTextMessage":
        return this.message.message?.extendedTextMessage?.text || null;

      case "imageMessage":
        return this.message.message?.imageMessage?.caption || "[Image]";

      case "videoMessage":
        return this.message.message?.videoMessage?.caption || "[Video]";

      //   case "documentMessage":
      //     return "[Document]";

      //   case "audioMessage":
      //     return "[Audio]";

      //   case "stickerMessage":
      //     return "[Sticker]";

      default:
        return null;
    }
  }
  public getJid(): string | null | undefined {
    return this.message.key.remoteJid;
  }
  public async send(content: AnyMessageContent, option?: MiscMessageGenerationOptions) {
    const sender = this.getJid();
    if (!sender) return;
    await this.sendTo(sender, content, option);
  }

  public async sendTo(to: string, content: AnyMessageContent, option?: MiscMessageGenerationOptions) {
    if (this.config.AUTO_REPLY_DELAY) await new Promise((x) => setTimeout(x, this.config.AUTO_REPLY_DELAY));
    await this.sock.sendMessage(to, content, option);
  }

  public async reply(content: AnyMessageContent, option: MiscMessageGenerationOptions = {}) {
    const sender = this.getJid();
    if (!sender) return;
    option.quoted = { ...this.message };
    await this.sendTo(sender, content, option);
  }

  public getMediaInfo(): null | undefined | AnyMediaMessageContent {
    const messageType = Object.keys(this.message.message || {})[0];

    if (["imageMessage", "videoMessage", "documentMessage", "audioMessage"].includes(messageType)) {
      return (this.message.message as any)[messageType];
    }
    return null;
  }

  public async DownloadMedia(): Promise<null | Buffer> {
    try {
      const messageType = Object.keys(this.message.message || {})[0];

      if (["imageMessage", "videoMessage", "documentMessage", "audioMessage"].includes(messageType)) {
        const buffer = downloadMediaMessage(this.message, "buffer", {});
        return buffer;
      }
    } catch (error) {
      return null;
    }

    return null;
  }
}
