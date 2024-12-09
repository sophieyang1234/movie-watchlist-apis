import {ResourceInitializerBase} from '@classlink/server'
import {Cache} from '@classlink/cache'
import {DatabaseFactory} from '@classlink/database'

export class ResourceInitializer extends ResourceInitializerBase {
  public constructor(props) {
    super(props)
    this.addTypeClass('cache', Cache)
    this.addTypeFactory('db', DatabaseFactory)
  }
}
