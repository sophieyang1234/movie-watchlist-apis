import {PM2Starter} from '@classlink/server'

async function main() {
  await PM2Starter.startWithLogs('./server.js')
}

main().catch(console.error)
