module.exports = {
  apps: [
    {
      name: 'ppa-server',
      script: 'server.js',
      cwd: __dirname + '/../server',
      env_production: {
        NODE_ENV: 'production'
      },
      restart_delay: 3000,
      max_restarts: 10
    }
  ]
}
