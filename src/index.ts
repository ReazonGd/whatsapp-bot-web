import makeWASocket, { CacheStore, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, WAMessageUpdate } from "@whiskeysockets/baileys";
import { BotConfig } from "./config/bot";
import pino from "pino";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { MessageHandler } from "./handlers/messageHandler";
import Message from "./lib/message";

class WhatsAppBot {
  private config: BotConfig;
  private sock: any;
  private messageHandler: MessageHandler;
  constructor() {
    this.config = new BotConfig();
    this.messageHandler = new MessageHandler();
  }

  async start(): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
      const { version, isLatest } = await fetchLatestBaileysVersion();

      console.log(`Using WA v${version.join(".")}, isLatest: ${isLatest}`);

      this.sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        msgRetryCounterCache: {} as CacheStore,
        generateHighQualityLinkPreview: true,
      });

      this.setupEventHandlers(saveCreds);
    } catch (error) {
      console.error("Error starting bot:", error);
    }
  }

  // private initSchedule() {
  //   cron.schedule(
  //     "2 3 * * *",
  //     () => {
  //       console.log("Running daily task at 6 AM");
  //       // Your function here
  //       sendHariIniLibur(this.config, this.sock);
  //     },
  //     {
  //       timezone: "Asia/Jakarta", // Sesuaikan timezone
  //     }
  //   );
  // }

  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    // Connection updates
    this.sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📱 Scan QR Code:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Connection closed due to", lastDisconnect?.error, ", reconnecting:", shouldReconnect);

        if (shouldReconnect) {
          this.start();
        }
      } else if (connection === "open") {
        console.log("✅ WhatsApp Bot Connected Successfully!");
        console.log("Bot is ready to receive messages...");
        // if (!this.sceduled) {
        //   this.sceduled = true;
        //   this.initSchedule();
        // }
      }
    });

    // Save credentials
    this.sock.ev.on("creds.update", saveCreds);

    // Handle incoming messages
    this.sock.ev.on("messages.upsert", async (m: any) => {
      const message = m.messages[0];
      // console.log(message);
      if (!message.key.fromMe && m.type === "notify") {
        await this.messageHandler.handleMessage(new Message(this.config, this.sock, message));
      }
    });

    // Handle message updates (like read receipts, message deletions, etc.)
    // this.sock.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
    //   for (const { key, update } of messageUpdate) {
    //     if (update.pollUpdates) {
    //       // Handle poll updates if needed
    //       console.log("Poll update:", update.pollUpdates);
    //     }
    //   }
    // });

    // Handle group updates
    this.sock.ev.on("groups.update", (updates: any[]) => {
      for (const update of updates) {
        console.log("Group update:", update);
      }
    });

    // Handle presence updates (online/offline status)
    // this.sock.ev.on("presence.update", ({ id, presences }: any) => {
    //   console.log("Presence update for", id, ":", presences);
    // });
  }
}

const bot = new WhatsAppBot();
bot.start().catch(console.error);

export default WhatsAppBot;
