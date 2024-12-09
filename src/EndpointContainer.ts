import {Logger} from '@classlink/logger'
import {EnvType,} from './'
import {EndpointContainerBase} from '@classlink/server/dist'
import type {NextFunction, Request, Response} from 'express'
import * as boom from '@hapi/boom'
import {IDataAdapter, DataAdapter} from '@classlink/movie-watchlist-sdk'
import {IResources} from './IResources'

const {trace} = Logger.getDebuggers('EndpointContainer')

export class EndpointContainer extends EndpointContainerBase {
  protected resources: IResources
  private readonly dataAdapter: IDataAdapter

  public constructor(environmentConfiguration: EnvironmentConfiguration, resources: IResources) {
    super(environmentConfiguration, resources)
    this.dataAdapter = DataAdapter.getDataAdapter({
      mode: 'direct',
      exampleCache: resources.exampleCache,
      exampleDB: resources.exampleDB
    })
  }
  public async helloWorld(req: GetRequest, res: Response, next: NextFunction): Promise<void> {
    trace(`helloWorld(${req}, ${res}, ${next})`)
    try {
      res.json(await this.dataAdapter.helloWorld())
    } catch(err) {
      if (typeof err === 'string') return next(boom.badRequest(err))
      return next(err)
    }
  }
}
interface EnvironmentConfiguration {
  envType?: EnvType
}
export interface GetRequest extends Request {
  query: {
    data: string
  }
}
