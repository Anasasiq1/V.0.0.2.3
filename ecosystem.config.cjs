module.exports = {
  apps: [
    {
      name: 'hmq-platform',
      script: 'dist/server.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_SSR: 'true'
      },
      env_port3001: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_SSR: 'true'
      },
      env_port4302: {
        NODE_ENV: 'production',
        PORT: 4302,
        NEXT_PUBLIC_SSR: 'true'
      }
    }
  ]
};
