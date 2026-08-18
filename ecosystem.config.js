module.exports = {
  apps: [
    {
      name: "tasas_bcv",
      script: "./index.js",
      watch: false,
      restart_delay: 1000,
      time: true,
      max_memory_restart: "500M",
      log_date_format: "DD-MM-YYYY HH:mm:ss",
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
