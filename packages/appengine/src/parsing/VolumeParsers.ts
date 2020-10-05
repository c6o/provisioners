import { VolumeParser, Volume } from './parser'

class BasicVolumeParser implements VolumeParser {

    parse(args: any, verbose: boolean): Volume[] {

        const results = []
        const rawValues = args.volume
        if (!rawValues || rawValues == '') return []

        if(verbose) console.log(`Volume Inputs:\n`, args)

        if (typeof (rawValues) == 'string') {
            results.push(this.parseSingleVolume(rawValues))
        } else {
            for (const p of rawValues) {
                results.push(this.parseSingleVolume(p))
            }
        }

        if(verbose) console.log(`Volume Outputs:\n`, results)

        return results
    }

    parseSingleVolume(volumeSpec) : Volume {
        //size:path
        //5Gi:/etc/config/
        const items = volumeSpec.split(':')
        const volume = { size: items[0], mountPath: items[1], name: 'data' }
        volume.name = `data-${Math.random().toString(36).substring(7)}`
        return volume

    }
}
export { BasicVolumeParser }
