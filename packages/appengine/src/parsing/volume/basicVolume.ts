import { VolumeParser, Volume } from '..'
import createDebug from 'debug'

const debug = createDebug('@appengine:BasicVolumeParser')

class BasicVolumeParser implements VolumeParser {

    parse(args: any, spec: any): Volume[] {
        debug(`Volume Inputs:${JSON.stringify(spec)}`)
        let results = this.parseObject(args)
        results = results.concat(this.parseObject(spec))
        debug(`Volume Outputs:${JSON.stringify(results)}`)
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
                    results.push(p as Volume)
                else
                    results.push(this.parseSingleVolume(p))

            }
        } else {

            if (typeof rawValues === 'object')
                results.push(rawValues as Volume)
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

        const volume = { size: items[0], mountPath: items[1], name: `data-${Math.random().toString(36).substring(7)}`, subPath: undefined }

        if(items.length >= 2)
            volume.name = items[2]

        if(!volume.name) volume.name = `data-${Math.random().toString(36).substring(7)}`

        volume.name = volume.name.toLowerCase()

        return volume

    }
}
export { BasicVolumeParser }
