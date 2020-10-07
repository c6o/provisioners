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

//  provisioner:
//    volume:
//      - '10Gi:/foo'
//      - '5Gi:/foo'

//  provisioner:
//    volume:
//      -
//          size: 10Gi
//          path: /foo
//      - '5Gi:/foo'


        const results = []
        const rawValues = args.volume
        if (!rawValues || rawValues == '') return []

        if (typeof (rawValues) == 'string') {
            results.push(this.parseSingleVolume(rawValues))
        } else {
            for (const p of rawValues) {
                results.push(this.parseSingleVolume(p))
            }
        }
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
