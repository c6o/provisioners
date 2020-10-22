import { IDebugger } from 'debug'
import { Port, PortParser } from '..'
import createDebug from 'debug'

const debug = createDebug('@appengine:createInquire')

class BasicPortParser implements PortParser {

    parse(args: any, spec: any): Port[] {

        debug('Port Inputs:\n', args, spec)
        let results = this.parseObject(args)
        results = results.concat(this.parseObject(spec))
        debug('Port Outputs:\n',  JSON.stringify(results))

        return results
    }

    parseObject(args: any): Port[] {

        const results = []
        const rawValues = args.port

        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if(p === null) continue

                if (typeof p === 'object')
                    results.push(p as Port)
                else
                    results.push(this.parseSinglePort(p))

            }
        } else {

            //one of the primary use cases:
            // port: 8080
            //lets short cut the parsing, if the value is just a number or a parsable number.
            const port = Number(rawValues)
            if(port && port > 0) {
                results.push({ name: 'http', protocol: 'TCP', port: port, targetPort: port })
            } else {
                if (typeof rawValues == 'object')
                    results.push(rawValues as Port)
                else
                    results.push(this.parseSinglePort(rawValues))
            }
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

        //in case our previous check missed the basic port value
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
