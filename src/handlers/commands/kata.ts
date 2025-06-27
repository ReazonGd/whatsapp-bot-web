import { CommandBot } from "../command.interface";
const kata: string = require("../../lib/5huruf-kata");

function isToday(inputDateStr: string) {
  const [day, month, year] = inputDateStr.split("-").map(Number);

  const inputDate = new Date(year, month - 1, day);
  const today = new Date();

  return inputDate.getDate() === today.getDate() && inputDate.getMonth() === today.getMonth() && inputDate.getFullYear() === today.getFullYear();
}

function getTodayFormatted() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

async function fetchKBBIData(word: string) {
  const url = `https://x-labs.my.id/api/kbbi/search/${encodeURIComponent(word)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();

    // Validate response structure
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error("Invalid API response structure");
    }

    const firstEntry = data.data[0];
    if (!firstEntry.lema || !firstEntry.arti || !Array.isArray(firstEntry.arti) || firstEntry.arti.length === 0) {
      throw new Error("Missing required fields in API response");
    }

    return {
      lema: firstEntry.lema,
      deskripsi: firstEntry.arti.map((a: any) => `> ${a.deskripsi}`) || ["> Deskripsi tidak tersedia"],
    };
  } catch (error) {
    console.error("Error fetching KBBI data:", error);

    // Return fallback data instead of throwing
    return {
      lema: word,
      deskripsi: ["> Deskripsi tidak tersedia (error saat mengambil data)"],
    };
  }
}

module.exports = {
  name: "toka",
  description: "Tebak huruf hari ini. penggunaan: \n[PREFIX]toka [text]",
  execute: async (chat) => {
    let today_kata: string | undefined = chat.config.ARGS.toka;
    let toka_description: string | undefined = chat.config.ARGS.toka_description;
    let toka_expired: string | undefined = chat.config.ARGS.toka_expired;
    let toka_users_attemp: { [key: string]: number } | undefined = chat.config.ARGS.toka_users_attemp;

    const userJid = chat.getJid();
    if (!userJid) return;

    if (!toka_users_attemp) toka_users_attemp = {};
    if (!toka_users_attemp[userJid]) toka_users_attemp[userJid] = 0;

    if (!today_kata || !toka_expired || !isToday(toka_expired)) {
      toka_users_attemp[userJid] = 0;
      today_kata = kata[Math.floor(Math.random() * kata.length)];
      toka_expired = getTodayFormatted();

      const kbbiData = await fetchKBBIData(today_kata);
      toka_description = `_${kbbiData.lema}_ \n${kbbiData.deskripsi.join("\n")}`;

      // console.log(`today kata: ${today_kata}`);

      chat.config.ARGS.toka_description = toka_description;
      chat.config.ARGS.toka = today_kata;
      chat.config.ARGS.toka_expired = toka_expired;
    }

    if (toka_users_attemp[userJid] >= 5) return await chat.send({ text: "*Toka* _Today kata_ \nWah! *Kesempatan kamu sudah habis*. kamu sudah tidak dapat menebak. besok lagi ya!" });
    if (chat.args.length < 1) return await chat.reply({ text: `*Toka*.\nToday kata. tebak 5 huruf kata hari ini. \n\nCara pakai:\n${chat.config.PREFIX}toka [text]` });
    if (chat.args[0].length != 5) return await chat.reply({ text: `1 kata harus 5 huruf!` });
    if (!kata.includes(chat.args[0])) return await chat.reply({ text: `kata ${chat.args[0]} tidak ditemukan.` });

    const t = chat.args[0];
    let user_kata_arr = t.split("").map((e, i) => {
      if (today_kata[i] == e) return `${e} 🟩`;
      if (today_kata.includes(e)) {
        const findIndex = today_kata.split("").findIndex((b) => b === e);
        if (t[findIndex] == today_kata[findIndex]) return `${e} ⬛`;
        return `${e} 🟧`;
      }

      return `${e} ⬛`;
    });

    const correct = chat.args[0] === today_kata;

    if (correct) toka_users_attemp[userJid] = 5;
    else toka_users_attemp[userJid] += 1;
    chat.config.ARGS.toka_users_attemp = toka_users_attemp;

    await chat.send({
      text: `*Toka* _Today kata_
\`\`\`
${user_kata_arr.join("\n")}\`\`\`${correct ? `\n\nBenar! Kata hari ini adalah: *${today_kata}*!` : ""}
> *Kesempatan:* ${5 - toka_users_attemp[userJid]}/5`,
    });
    if (correct) await chat.send({ text: `${toka_description}` });
  },
} as CommandBot;
