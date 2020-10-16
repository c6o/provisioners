import createDebug from 'debug'
import { App, AppParser } from '..'

const debug = createDebug('@appengine:createInquire')

class BasicAppParser implements AppParser {

    parse(args: any, spec: any): App[] {

        debug('App Inputs:\n', args, spec)
        let results = this.parseObject(args)
        results = results.concat(this.parseObject(spec))
        debug('App Outputs:\n',  JSON.stringify(results))

        return results
    }

    parseObject(args: any): App[] {

        const results = []
        const rawValues = args.app

        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if(p === null) continue

                if (typeof p === 'object')
                    results.push(p as App)
                else
                    results.push(this.parseSingleApp(p))

            }
        } else {

            if (typeof rawValues == 'object')
                results.push(rawValues as App)
            else
                results.push(this.parseSingleApp(rawValues))

        }

        return results
    }

    parseSingleApp(appSpec): App {

        // --app mysql:developerinternal:mysql
        // --app adminer:preview:adminer

        const parts = appSpec.split(':')
        if(parts.length === 3)
            return { appId: parts[0], edition: parts[1], name: parts[2] }
        else
            return { appId: parts[0], edition: parts[1], name: parts[0] }

    }
}

export { BasicAppParser }
