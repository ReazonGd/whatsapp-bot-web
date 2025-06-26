import Message from "../lib/message";

export interface CommandBot {
  name: string;
  description: string;
  onlyAdmin?: boolean;
  execute: (msg: Message) => void;
}
