module.exports = {
  apps: [
    {
      name: 'juniors-client',
      exec_mode: 'cluster',
      instances: 'max', // Or a number of instances
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env_local: {
        APP_ENV: 'local' // APP_ENV=local
      },
      env_dev: {
        APP_ENV: 'dev' // APP_ENV=dev
      },
      env_prod: {
        APP_ENV: 'prod' // APP_ENV=prod
      },

      output: '/dev/null',
      error: '/dev/null',
      merge_logs: true,

      post_update: [
        'pnpm install',
        'pnpm build'
      ]
    }
  ]
}