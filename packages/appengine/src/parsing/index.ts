import * as portParsers from './PortParsers/'
import * as settingsParsers from './SettingParsers/'
import * as volumeParsers from './VolumeParsers/'


export class ParserFactory{
    static getPortParser(type: string) : PortParser {
        return new portParsers[type]()
    }
    static getSettingsParser(type: string) : SettingsParser {
        return new settingsParsers[type]()
    }
    static getVolumeParser(type: string) : VolumeParser {
        return new volumeParsers[type]()
    }
}


export interface PortParser {
    parse(args: any, spec: any, verbose: boolean): Port[];
}
export interface SettingsParser {
    parse(args: any, spec: any, type: string, verbose: boolean): Setting[];
}
export interface VolumeParser {
    parse(args: any, spec: any, verbose: boolean): Volume[];
}

export interface Setting {
    name: string
    value: string
    env: string
}

export interface Port {
    number: number
    name: string
    targetPort: string
}

export interface Volume {
    size: number
    mountPath: string
    name: string
}