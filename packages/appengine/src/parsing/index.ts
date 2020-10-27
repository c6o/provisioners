import * as portParsers from './port'
import * as settingsParsers from './setting'
import * as volumeParsers from './volume'

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
    parse(args: any, spec: any): Port[];
}
export interface SettingsParser {
    parse(args: any, spec: any, type: string): Setting[];
}
export interface VolumeParser {
    parse(args: any, spec: any): Volume[];
}

//https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
export interface LabelsMetadata {
    id: string
    partOf: string
    component: string
    version: string
    edition: string
}

export interface Setting {
    name: string
    value: string
    env: string
    type: string
    label: string
    hint: string
    required: boolean
    autoselect: boolean
}

export interface Port {
    name: string
    protocol: string
    port: number
    targetPort: number
}

export interface Volume {
    size: string
    mountPath: string
    name: string
}