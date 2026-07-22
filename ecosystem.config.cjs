// PM2 Ecosystem Configuration — Institut Rayhanah ERP
// Usage: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: "rayhanah-api",
      script: "server.ts",
      interpreter: "npx",
      interpreter_args: "tsx",
      cwd: "/var/www/rayhanah",
      
      // Environnement
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Stabilité
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      // Logs
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "/var/log/pm2/rayhanah-api-out.log",
      error_file: "/var/log/pm2/rayhanah-api-error.log",
      merge_logs: true,

      // Redémarrage exponentiel
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
    },
  ],
};
