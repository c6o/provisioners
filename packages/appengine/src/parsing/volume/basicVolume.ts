import { IDebugger } from 'debug'
import { VolumeParser, Volume } from '..'
import createDebug from 'debug'

const debug = createDebug('@appengine:createInquire')

class BasicVolumeParser implements VolumeParser {

    parse(args: any, spec: any): Volume[] {
        debug('Volume Inputs:\n', args, spec)
        let results = this.parseObject(args)
        results = results.concat(this.parseObject(spec))
        debug('Volume Outputs:\n',  JSON.stringify(results))
        return results
    }

    parseObject(args: any): Volume[] {

        const results = []
        const rawValues = args.volume
        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if(p === null) continue

                if (typeof p === 'object')
                    results.push(rawValues)
                else
                    results.push(this.parseSingleVolume(p))

            }
        } else {

            if (typeof rawValues === 'object')
                results.push(rawValues)
            else
                results.push(this.parseSingleVolume(rawValues))

        }
        return results

    }

    parseSingleVolume(volumeSpec) : Volume {
        //size:path
        //5Gi:/etc/config/
        //5Gi:/etc/config/:name
        const items = volumeSpec.split(':')

        const volume = { size: items[0], mountPath: items[1], name: `data-${Math.random().toString(36).substring(7)}` }

        if(items.length >= 2)
            volume.name = items[2]

        volume.name = volume.name.toLowerCase()
        return volume

    }
}
export { BasicVolumeParser }
