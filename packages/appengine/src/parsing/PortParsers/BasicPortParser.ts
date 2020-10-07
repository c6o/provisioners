import { IDebugger } from 'debug'
import { Port, PortParser } from '..'

class BasicPortParser implements PortParser {

    parse(args: any, spec: any, debug: IDebugger): Port[] {
        debug('Port Inputs:\n', args, spec)
        let results = this.parseObject(args, debug)
        results = results.concat(this.parseObject(spec, debug))
        debug('Port Outputs:\n', results)
        return results
    }

    parseObject(args: any, debug: IDebugger): Port[] {
        const results = []
        const rawValues = args.port
        if (!rawValues || rawValues == '') return []

        if (typeof (rawValues) == 'string') {
            results.push(this.parseSinglePort(rawValues))
        } else {
            for (const p of rawValues) {
                results.push(this.parseSinglePort(p))
            }
        }
        return results
    }

    parseSinglePort(portSpec) : Port {
        //portNumber/portName/targetPort
        //80/http/http
        const items = portSpec.split('/')
        if (items.length == 1) return { number: Number(items[0]), name: 'http', targetPort: 'http' }
        if (items.length == 2) return { number: Number(items[0]), name: items[1], targetPort: items[1] }
        if (items.length >= 3) return { number: Number(items[0]), name: items[1], targetPort: items[2] }
    }
}

export { BasicPortParser }
