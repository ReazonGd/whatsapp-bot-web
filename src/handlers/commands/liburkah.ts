import { CommandBot } from "../command.interface";

async function fetchKBBIData() {
  const url = `https://dayoffapi.vercel.app/api?year=${new Date().getFullYear()}`;

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

    const data = (await response.json()) as { tanggal: string; keterangan: string; is_cuti: boolean }[];

    // Validate response structure
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid API response structure");
    }

    return data;
  } catch (error) {
    console.error("Error fetching KBBI data:", error);

    // Return fallback data instead of throwing
    return [];
  }
}

function getTodayFormatted() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${year}-${month}-${day}`;
}

async function isHariLibur() {
  const tanggal_libur = await fetchKBBIData();
  if (!tanggal_libur.length) return;

  const hari_ini = getTodayFormatted();
  const hari_libur = tanggal_libur.find((e) => e.tanggal === hari_ini);

  return hari_libur;
}

module.exports = {
  name: "liburkah",
  description: "cek hari ini libur ga.",
  execute: async (msg) => {
    const liburkah = await isHariLibur();
    if (liburkah) {
      await msg.reply({ text: `📅 Hari ini ada: ${liburkah.keterangan}${liburkah.is_cuti ? "\nSelamat cuti!" : ""}` });
    } else {
      await msg.reply({ text: `Hari ini..\nTidak ada hari libur.` });
    }
  },
} as CommandBot;
