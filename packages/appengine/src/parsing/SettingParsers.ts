import { SettingsParser, Setting } from './parser'

class BasicSettingParser implements SettingsParser {

    parse(args: any, type: string, verbose: boolean): Setting[] {

        const results = []

        if(!args || !args[type]) return []

        if(verbose) console.log(`Settings Inputs: (${type}):\n`, args)

        const rawValues = args[type]

        if (rawValues) {
            if (typeof rawValues == 'string') {
                results.push(this.parseSingle(rawValues))
            } else {
                for (const single of rawValues) {
                    results.push(this.parseSingle(single))
                }
            }
        }
        if(verbose) console.log(`Settings Outputs (${type}):\n`, results)
        return results
    }


    parseSingle(single: string) : Setting {
        const pos = single.indexOf(':')
        const value = { name: '', value: '', env: '' }

        if (pos > 0) {
            value.name = single.substr(0, pos)
            const right = single.substr(pos + 1)
            const comma = right.indexOf(',')
            if (comma > 0) {
                value.value = right.substr(0, comma)
                value.env = right.substr(comma + 1)
            } else {
                value.value = right
            }
        }
        if(!value.env || value.env === '') value.env = value.name
        return value
    }
}
export { BasicSettingParser }
