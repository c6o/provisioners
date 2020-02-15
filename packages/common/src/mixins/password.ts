import * as generator from 'generate-password'
import { baseProvisionerMixinType } from '../provisioner'

declare module '../provisioner' {
    export interface ProvisionerBase {

    }
}

const defaultOptions = {
    strict: true,
    length: 18,
    numbers: true,
    uppercase: true,
    excludeSimilarCharacters: true
}

export const passwordMixin = (base: baseProvisionerMixinType) => class extends base {

    generatePassword(options = defaultOptions) {
        return generator.generate(options)
    }

    /**
     *
     * @param option Is either a password or passwordOptions for generatePassword
     * @returns password
     */
    processPassword(option) {
        return option ?
        (typeof option == 'string' ?  option : this.generatePassword(option)) :
        this.generatePassword()
    }
}