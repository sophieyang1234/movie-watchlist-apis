import {ServiceLoader, ServiceVersionLoader} from '@classlink/server'

export async function getRouter() {
  return ServiceVersionLoader.getRouter('/v1', 'spec.yml')
}

async function main() {
  await ServiceLoader.load([
    await getRouter()
  ])
}

main().catch(console.error)
