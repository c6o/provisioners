import { ParserFactory as parserFactory } from './parsing'
import createDebug from 'debug'

const debug = createDebug('@appengine:Parser')

class Parser {

    parseInputsToSpec(args, spec) {

        if(args === null) args = {}

        spec.parsed = true
        const configParserType = spec.configParser || 'BasicSettingParser'
        spec.configs = []
        spec.configs = spec.configs.concat(parserFactory.getSettingsParser(configParserType).parse(args, spec, 'config'))
        if(spec.config) delete spec.config

        const secretsParserType = spec.secretParser || 'BasicSettingParser'
        spec.secrets = []
        spec.secrets = spec.secrets.concat(parserFactory.getSettingsParser(secretsParserType).parse(args, spec, 'secret'))
        if(spec.secret) delete spec.secret

        const portParserType = spec.portParser || 'BasicPortParser'
        spec.ports = parserFactory.getPortParser(portParserType).parse(args, spec)
        if(spec.port) delete spec.port

        const volumeParserType = spec.volumeParser || 'BasicVolumeParser'
        spec.volumes = parserFactory.getVolumeParser(volumeParserType).parse(args, spec)
        if(spec.volume) delete spec.volume

    }
}

const parser = new Parser()
export { parser }