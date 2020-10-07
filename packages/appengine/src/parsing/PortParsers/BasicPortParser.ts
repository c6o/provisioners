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

        //Defaults:
        //Port:  NONE
        //PROTOCOL: HTTP
        //TargetPort: PORT
        //ExternalPort: PORT
        //Name: PROTOCOL

        //port
        //port/protocol
        //port/protocol/targetPort
        //port/protocol/targetPort/externalPort
        //port/protocol/targetPort/externalPort/name

        const items = portSpec.split('/')
        //port
        if (items.length == 1) return { name: 'http',   protocol: 'HTTP',   port: Number(items[0]), targetPort: Number(items[0]), externalPort: Number(items[0]) }

        //port/protocol
        if (items.length == 2) return { name: items[1], protocol: items[1], port: Number(items[0]), targetPort: Number(items[0]), externalPort: Number(items[0]) }

        //port/protocol/targetPort
        if (items.length == 3) return { name: items[1], protocol: items[1], port: Number(items[0]), targetPort: Number(items[2]), externalPort: Number(items[0]) }

        //port/protocol/targetPort/externalPort
        if (items.length == 4) return { name: items[4], protocol: items[1], port: Number(items[0]), targetPort: Number(items[2]), externalPort: Number(items[3]) }

        //port/protocol/targetPort/externalPort/name
        if (items.length > 4)  return { name: items[4], protocol: items[1], port: Number(items[0]), targetPort: Number(items[2]), externalPort: Number(items[3]) }

    }
}

export { BasicPortParser }
