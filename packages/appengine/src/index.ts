import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"
import { ParserFactory as parserFactory } from './parsing'

import {
    createApplyMixin,
    createInquireMixin,
    createValidateMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
    parseInputsToSpec(args: any)
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, createValidateMixin) {

    get isLatest() { return this.edition === 'latest' }


    parseInputsToSpec(args) {

        if(args === null) args = {}

        this.spec.parsed = true
        const configParserType = this.spec.configParser || 'BasicSettingParser'
        this.spec.configs = parserFactory.getSettingsParser(configParserType).parse(args, this.spec, 'config')

        const secretsParserType = this.spec.secretParser || 'BasicSettingParser'
        this.spec.secrets = parserFactory.getSettingsParser(secretsParserType).parse(args, this.spec, 'secret')

        const portParserType = this.spec.portParser || 'BasicPortParser'
        this.spec.ports = parserFactory.getPortParser(portParserType).parse(args, this.spec)

        const volumeParserType = this.spec.volumeParser || 'BasicVolumeParser'
        this.spec.volumes = parserFactory.getVolumeParser(volumeParserType).parse(args, this.spec)

    }

}