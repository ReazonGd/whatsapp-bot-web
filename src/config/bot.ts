import * as os from "os";

export class BotConfig {
  // bot
  public NAME = "Re: Bot";
  public VERSION = "Beta 1.0";
  public PHONE_NUMBER = "6285169412094";

  // Auto reply
  public AUTO_REPLY = true;
  public AUTO_REPLY_DELAY = 1000;
  public AUTO_READ = true;

  // LIMITER
  public MAX_SESION = 10;
  public MAX_SESION_SECONDS = 10;
  public MEMORY_MAX = 500 * 1024 * 1024;
  public CPU_PERCENTAGE_MAX = 90;

  public PREFIX = "!";
  public ENABLE_COMAND = true;

  // Group settings
  public RESPOND_IN_GROUPS = true;
  // public ADMIN_ONLY_COMMANDS = false;

  // Logging settings
  public ENABLE_LOGGING = true;
  public LOG_LEVEL = "info"; // 'debug', 'info', 'warn', 'error'

  // Allowed file types for uploads
  // public ALLOWED_FILE_TYPES = [
  //   "image/jpeg",
  //   "image/png",
  //   "image/gif",
  //   "image/webp",
  //   "video/mp4",
  //   "video/quicktime",
  //   "audio/mpeg",
  //   "audio/wav",
  //   "audio/ogg",
  //   "application/pdf",
  //   "application/msword",
  //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // ];

  // Max file size (in bytes) - 10MB
  public MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Admin phone numbers (without country code prefix)
  public ADMIN_NUMBERS: string[] = ["6288239158584@s.whatsapp.net"];

  // Blocked numbers
  public BLOCKED_NUMBERS: string[] = [
    // Add blocked numbers here
  ];

  public ARGS: any = {};
  public setArgs(key: string, val: any) {
    this.ARGS[key] = val;
  }

  // Database settings (if using database)
  public DATABASE = {
    ENABLED: false,
    TYPE: "sqlite", // 'sqlite', 'mysql', 'postgresql'
    HOST: "localhost",
    PORT: 3306,
    NAME: "whatsapp_bot",
    USERNAME: "root",
    PASSWORD: "",
  };

  // Webhook settings (if using webhooks)
  public WEBHOOK = {
    ENABLED: false,
    URL: "",
    SECRET: "",
  };

  // Utility methods
  public isAdmin(phoneNumber: string): boolean {
    return this.ADMIN_NUMBERS.includes(phoneNumber);
  }

  public isBlocked(phoneNumber: string): boolean {
    return this.BLOCKED_NUMBERS.includes(phoneNumber);
  }

  public isFileSizeValid(fileSize: number): boolean {
    return fileSize <= this.MAX_FILE_SIZE;
  }

  public hasLimit(): boolean {
    const memoryUsage = process.memoryUsage().heapUsed; // 1024 / 1024

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    // const usedMem = totalMem - freeMem;

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
    // content += `- CPU Usage: ${cpuUsagePercentage.toFixed(2)}%`;

    if (memoryUsage > this.MEMORY_MAX || cpuUsagePercentage > this.CPU_PERCENTAGE_MAX) return false;

    const time_now = new Date().getTime();
    if (!this.ARGS.limiter_time || !this.ARGS.limiter_count) {
      this.ARGS.limiter_time = time_now;
      this.ARGS.limiter_count = 0;
    }

    if (new Date(this.ARGS.limiter_time - time_now).getSeconds() > this.MAX_SESION_SECONDS) {
      this.ARGS.limiter_time = time_now;
      this.ARGS.limiter_count = 0;
    }

    this.ARGS.limiter_count++;
    return this.ARGS.limiter_count >= this.MAX_SESION;
  }
}
