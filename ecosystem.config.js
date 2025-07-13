module.exports = {
  apps: [
    {
      name: 'sirschedule-app',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/sirschedule.com',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
