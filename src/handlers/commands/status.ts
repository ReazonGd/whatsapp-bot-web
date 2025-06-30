import os, { totalmem } from "os";
import { CommandBot } from "../command.interface";

function getTimeFormat(from: number) {
  const uptimeSeconds = Math.floor(from);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);
  const uptimeFormatted = `${uptimeDays} hari, ${uptimeHours % 24} jam, ${uptimeMinutes % 60} menit`;
  return uptimeFormatted;
}

module.exports = {
  name: "stat",
  description: "Ai mitekiru...",
  execute: async (msg) => {
    const botMemoryUsage = process.memoryUsage().heapUsed;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    const cpuUsage = cpus
      .map((cpu) => cpu.times)
      .reduce(
        (acc, times) => {
          acc.user += times.user;
          acc.nice += times.nice;
          acc.sys += times.sys;
          acc.idle += times.idle;
          acc.irq += times.irq;
          return acc;
        },
        { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
      );

    const totalCpuTime = Object.values(cpuUsage).reduce((acc, time) => acc + time, 0);
    const idleCpuTime = cpuUsage.idle;
    const cpuUsagePercentage = ((totalCpuTime - idleCpuTime) / totalCpuTime) * 100;
    msg.send({
      text: `*Bot Stat*
*Versi:*
> ${msg.config.VERSION}
*Aktif selama:* 
> ${getTimeFormat(process.uptime())}
*Memori yang digunakan:* 
> *${((botMemoryUsage / totalMem) * 100).toFixed(2)}%* (${(botMemoryUsage / 1024 / 1024).toFixed(2)} MB)
      
*Server Stat*
*Waktu:*
> ${new Date().toDateString()}, ${new Date().toTimeString()}
*CPU:*
> ${cpuUsagePercentage.toFixed(2)}%
*Memori:*
> *${memoryUsage.toFixed(2)}%* (${(freeMem / 1024 / 1024).toFixed(2)} MB from ${(totalMem / 1024 / 1024).toFixed(2)} MB)
`,
    });
  },
} as CommandBot;
