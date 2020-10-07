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

        //name/protocol/port/targetPort/externalPort
        const items = portSpec.split('/')
        if (items.length == 1) return { name: items[0], protocol: 'HTTP', port: 80, targetPort: 80, externalPort: 0 }
        if (items.length == 2) return { name: items[0], protocol: items[0], port: 80, targetPort: 80, externalPort: 0 }
        if (items.length == 3) return { name: items[0], protocol: items[0], port: items[1], targetPort: 80, externalPort: 0 }
        if (items.length == 4) return { name: items[0], protocol: items[0], port: items[1], targetPort: items[2], externalPort: 0 }
        if (items.length >= 5) return { name: items[0], protocol: items[0], port: items[1], targetPort: items[3], externalPort: items[4] }
    }
}

export { BasicPortParser }
