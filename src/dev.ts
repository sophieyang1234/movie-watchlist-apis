import {PM2Starter} from '@classlink/server'

async function main() {
  await PM2Starter.startWithoutLogs('./server.js')
}

main().catch(console.error)
