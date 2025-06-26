import { CommandBot } from "../command.interface";

module.exports = {
  name: "ping",
  description: "Ai mitekiru...",
  execute: async (msg) => {
    msg.send({ text: "Pong!" });
  },
} as CommandBot;
