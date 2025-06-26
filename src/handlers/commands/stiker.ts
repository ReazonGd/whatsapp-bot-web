import { CommandBot } from "../command.interface";
import { convertBufferToWebP } from "../../lib/img-to-webp";

module.exports = {
  name: "stiker",
  description: "convert gambar ke stiker",
  execute: async (chat) => {
    const media_info = chat.getMediaInfo();

    if (!media_info) return await chat.send({ text: "Harap cantumkan gambar" });
    if (!media_info.mimetype?.includes("image")) return await chat.send({ text: "Format tidak valid" });

    try {
      const buffer_from = await chat.DownloadMedia();
      if (!buffer_from) return await chat.send({ text: "Terjadi kesalahan saat mengambil gambar" });

      const { buffer } = await convertBufferToWebP(buffer_from, { fit: "contain", height: 700, width: 700 });
      if (!buffer) return await chat.send({ text: "Terjadi kesalahan saat mengkonversi gambar" });

      chat.send({ sticker: buffer });
    } catch (error) {
      await chat.send({ text: "Terjadi kesalahan saat memproses" });
    }
  },
} as CommandBot;
