#!/usr/bin/env node
const server = require('@classlink/server')
async function main () {
  await server.PM2Starter.startWithLogs('./dist/server.js')
}
main().catch(console.error)
