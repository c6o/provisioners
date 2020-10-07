import { SettingsParser, Setting } from '..'

class BasicSettingParser implements SettingsParser {


    parse(args: any, spec: any, type: string, verbose: boolean): Setting[] {
        if(verbose) console.log(`Settings Inputs: ${type}\n`, args, spec)
        let results = this.parseObject(args, type, verbose)
        results = results.concat(this.parseObject(spec, type, verbose))
        if(verbose) console.log(`Settings Outputs: ${type}\n`, results)
        return results
    }

    parseObject(args: any, type: string, verbose: boolean): Setting[] {

        const results = []
        if(!args || !args[type]) return []
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
        return results
    }


    parseSingle(single: string) : Setting {

        //provison takes a file as an input..

        //czctl install --local --n testing photoshow --secret foo:bar --config d:fff,D_VAR --config E:fff,D_VAR --out yaml
        //NAME:VALUE,ENV_VAR_NAME
        //split
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
