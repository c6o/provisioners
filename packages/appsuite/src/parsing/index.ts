import * as portParsers from './app'
import * as settingsParsers from './config'

export class ParserFactory{
    static getAppParser(type: string) : AppParser {
        return new portParsers[type]()
    }
    static getConfigParser(type: string) : ConfigParser {
        return new settingsParsers[type]()
    }
}


export interface AppParser {
    parse(args: any, spec: any): App[];
}
export interface ConfigParser {
    parse(args: any, spec: any): Config[];
}

export interface App {
    appId: string
    edition: string
    name: string
}

export interface Config {
    namePath: string
    valuePath: string
}
