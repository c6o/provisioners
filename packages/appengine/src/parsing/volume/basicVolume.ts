import { IDebugger } from 'debug'
import { VolumeParser, Volume } from '..'

class BasicVolumeParser implements VolumeParser {

    parse(args: any, spec: any, debug: IDebugger): Volume[] {
        debug('Volume Inputs:\n', args, spec)
        let results = this.parseObject(args, debug)
        results = results.concat(this.parseObject(spec, debug))
        debug('Volume Outputs:\n', results)
        return results
    }

    parseObject(args: any, debug: IDebugger): Volume[] {

        const results = []
        const rawValues = args.volume
        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {

                if (p as Volume)
                    results.push(rawValues)
                else
                    results.push(this.parseSingleVolume(p))

            }
        } else {

            if (rawValues as Volume)
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
