
import { Port, PortParser } from './parser'

class BasicPortParser implements PortParser {

    parse(args: any, verbose: boolean): Port[] {
        const results = []
        const rawValues = args.port
        if (!rawValues || rawValues == '') return []

        if(verbose) console.log(`Ports Inputs:\n`, args)

        if (typeof (rawValues) == 'string') {
            results.push(this.parseSinglePort(rawValues))
        } else {
            for (const p of rawValues) {
                results.push(this.parseSinglePort(p))
            }
        }
        if (verbose) console.log('Ports Outputs:\n', results)
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
