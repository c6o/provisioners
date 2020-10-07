import { IDebugger } from 'debug'
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
    parse(args: any, spec: any, debug: IDebugger): Port[];
}
export interface SettingsParser {
    parse(args: any, spec: any, type: string, debug: IDebugger): Setting[];
}
export interface VolumeParser {
    parse(args: any, spec: any, debug: IDebugger): Volume[];
}

export interface Setting {
    name: string
    value: string
    env: string
}

export interface Port {
    name: string
    protocol: string
    port: number
    targetPort: number
    externalPort: number
}

export interface Volume {
    size: string
    mountPath: string
    name: string
}