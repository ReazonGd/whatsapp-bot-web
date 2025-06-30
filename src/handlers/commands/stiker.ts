import { CommandBot } from "../command.interface";
import { convertBufferToWebP } from "../../lib/img-to-webp";
import { Image } from "node-webpmux";

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

      const sticker_name = chat.args.join(" ") || "Stiker by " + chat.config.NAME;

      const image = new Image();
      image.load(buffer);
      image.exif = Buffer.concat([Buffer.from([0x00, 0x00, 0x16, 0x00]), Buffer.from(JSON.stringify({ "sticker-pack-name": sticker_name }), "utf-8")]);

      chat.send({ sticker: await image.save() });
    } catch (error) {
      await chat.send({ text: "Terjadi kesalahan saat memproses" });
    }
  },
} as CommandBot;
