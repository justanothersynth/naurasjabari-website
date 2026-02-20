# Crons Package

This package contains background cron jobs for automated tasks.

## Run (dev) 
```bash
bun run dev
```

## Test
```bash
bun run test
```

## Build
Build for your target platform using one of the build scripts. For example:

```bash
bun run build:linux
```

## Run (Prod)
Run the built artifact with arguments to specify job and cron (if necessary)
```bash
./dist/crons-linux run -h
```

## Running with PM2
Utilize the `--cron` flag or `cron_restart` config line to run on a schedule.

Example ecosystem config
```js
{
  name: 'JOB_NAME',
  instances: 1,
  exec_mode: 'fork',
  interpreter: 'bun',
  cwd: '/home/<user_dir>/<project_dir>/crons',
  script: './dist/crons-linux run JOB_NAME',
  args: '',
  log_date_format: 'D MMM YYYY | HH:mm:ss.SSS',
  watch: false,
  cron_restart: '*/5 * * * *',
  env: { 
    ...backendEnv,
    FORCE_COLOR: 1
  }
}
```
