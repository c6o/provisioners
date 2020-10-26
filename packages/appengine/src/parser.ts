import { ParserFactory as parserFactory } from './parsing'

class Parser {

    parseInputsToSpec(args, spec) {

        if(args === null) args = {}

        spec.parsed = true
        const configParserType = spec.configParser || 'BasicSettingParser'
        spec.configs = parserFactory.getSettingsParser(configParserType).parse(args, spec, 'config')

        const secretsParserType = spec.secretParser || 'BasicSettingParser'
        spec.secrets = parserFactory.getSettingsParser(secretsParserType).parse(args, spec, 'secret')

        const portParserType = spec.portParser || 'BasicPortParser'
        spec.ports = parserFactory.getPortParser(portParserType).parse(args, spec)

        const volumeParserType = spec.volumeParser || 'BasicVolumeParser'
        spec.volumes = parserFactory.getVolumeParser(volumeParserType).parse(args, spec)

    }
}

const parser = new Parser()
export { parser }