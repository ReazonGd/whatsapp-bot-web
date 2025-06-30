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
      const data = JSON.stringify({ "sticker-pack-name": sticker_name });
      await image.load(buffer);

      let exif = Buffer.concat([Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]), Buffer.from(data, "utf-8")]);
      exif.writeUintLE(new TextEncoder().encode(data).length, 14, 4);
      image.exif = exif;

      chat.send({ sticker: await image.save(null) });
    } catch (error) {
      await chat.send({ text: "Terjadi kesalahan saat memproses" });
      console.log(error);
    }
  },
} as CommandBot;
