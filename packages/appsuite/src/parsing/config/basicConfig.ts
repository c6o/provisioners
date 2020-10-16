import { ConfigParser, Config } from '..'
import createDebug from 'debug'

const debug = createDebug('@appengine:createInquire')

class BasicConfigParser implements ConfigParser {


    parse(args: any, spec: any): Config[] {
        debug(`Config Inputs:\n`, args, spec)
        let results = this.parseObject(args)
        results = results.concat(this.parseObject(spec))
        debug(`Config Outputs:\n`,  results)
        return results
    }

    parseObject(args: any): Config[] {

        const results = []
        const rawValues = args.config

        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if(p === null) continue

                if (typeof p === 'object')
                    results.push(p as Config)
                else
                    results.push(this.parseSingle(p))

            }
        } else {

            if (typeof rawValues === 'object')
                results.push(rawValues as Config)
            else
                results.push(this.parseSingle(rawValues))

        }
        return results
    }


    parseSingle(single: string) : Config {

        console.log('------->', single, '<--------------')
        // --config mysql.provisioner.volume.data.size=10Gi
        // --config adminer.provisioner.secret.ADMINER_DEFAULT_SERVER={mysql.hostname}
        // --config adminer.provisioner.secret.username=root
        // --config adminer.provisioner.secret.password={mysql.secret.MYSQL_ROOT_PASSWORD}

        const firstSeperator = single.indexOf(':')
        return { namePath: single.substr(0, firstSeperator), valuePath: single.substr(firstSeperator+1) }

    }
}
export { BasicConfigParser }
