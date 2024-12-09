import * as chai from 'chai'
import {expect} from 'chai'
import 'mocha'
import {Cache} from '@classlink/cache'
import {DatabaseFactory, IDatabaseOptions} from '@classlink/database'
import * as sinonChai from 'sinon-chai'
import * as  chaiAsPromised from 'chai-as-promised'
import {
  GetRequest
} from '../src/EndpointContainer'
import {mockReq, mockRes} from 'sinon-express-mock'
import sinon = require('sinon')
import {EndpointContainer} from '../src/EndpointContainer'
import {Logger} from '@classlink/logger'
import {SecretsManager} from '@classlink/secrets-manager-sdk'

chai.use(chaiAsPromised)
chai.use(sinonChai)

async function getEndpointContainer(): Promise<EndpointContainer> {
  const secretsManager = SecretsManager.getInstance()
  const resourceConfig = await secretsManager.getResourceConfigurations({
    exampleCache: {
      resourceType: 'cache',
      resourceId: 'exampleCache'
    },
    exampleDB: {
      resourceType: 'db',
      resourceId: 'exampleDb'
    }
  })
  const exampleCache = new Cache(resourceConfig.exampleCache)
  const exampleDB = DatabaseFactory.getInstance(resourceConfig.exampleDB as IDatabaseOptions)
  return new EndpointContainer({}, {
    exampleCache,
    exampleDB
  })
}

function getMocks<T>() {
  return {
    req: mockReq() as T,
    res: mockRes(),
    next: sinon.stub()
  }
}

describe('EndpointContainer',
  () => {
    let OUT
    before(async () => {
      OUT = await getEndpointContainer()
    })
    let example
    it('helloWorld()', async function () {
      const {req, res, next} = getMocks<GetRequest>()
      res.json.callsFake(function (responseJson) {
        example = responseJson
      })
      await OUT.helloWorld(req, res, next)
      console.log(example.data)
    }).timeout(10000)
  })
