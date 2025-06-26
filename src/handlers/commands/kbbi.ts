import { CommandBot } from "../command.interface";

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
      lema: firstEntry.lema.trim(),
      deskripsi: firstEntry.arti.map((a: any) => `> ${a.deskripsi}`.trim()) || ["> Deskripsi tidak tersedia"],
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
  name: "kbbi",
  description: "mencari kata di kbbi",
  execute: async (msg) => {
    if (msg.args.length < 1) return await msg.reply({ text: `*Toka*.\nKBBI(unofficial) \n\nCara pakai:\n${msg.config.PREFIX}kbbi [text]` });
    const kbbiData = await fetchKBBIData(msg.args[0]);
    await msg.send({ text: `_${kbbiData.lema}_ \n${kbbiData.deskripsi.join("\n")}` });
  },
} as CommandBot;

// const kata =
