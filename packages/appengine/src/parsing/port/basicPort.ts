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

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if (p as Port)
                    results.push(p)
                else
                    results.push(this.parseSinglePort(p))

            }
        } else {

            if (rawValues as Port)
                results.push(rawValues)
            else
                results.push(this.parseSinglePort(rawValues))

        }

        return results
    }

    parseSinglePort(portSpec): Port {

        //Defaults:
        //Port:  NONE
        //PROTOCOL: TCP : "SCTP", "TCP", "UDP"
        //TargetPort: PORT
        //Name: PROTOCOL

        //port
        //port/name
        //port/name/protocol
        //port/name/protocol/targetPort

        if (typeof portSpec === 'number')
            return { name: 'http', protocol: 'TCP', port: portSpec, targetPort: portSpec }


        const items = portSpec.split('/')
        //port
        if (items.length == 1)
            return { name: 'http', protocol: 'TCP', port: Number(items[0]), targetPort: Number(items[0]) }

        //port/name
        if (items.length == 2)
            return { name: items[1].toLowerCase(), protocol: 'TCP', port: Number(items[0]), targetPort: Number(items[0]) }

        //port/name/protocol
        if (items.length == 3)
            return { name: items[1].toLowerCase(), protocol: items[2].toUpperCase(), port: Number(items[0]), targetPort: Number(items[0]) }

        //port/name/protocol/targetPort
        if (items.length == 4)
            return { name: items[1].toLowerCase(), protocol: items[2].toUpperCase(), port: Number(items[0]), targetPort: Number(items[3]) }

    }
}

export { BasicPortParser }
