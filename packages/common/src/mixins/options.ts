
import { baseProvisionerMixinType } from '../provisioner'


export const optionsMixin = (base: baseProvisionerMixinType) => class extends base {

    providedDeprovisionOption(option, answers?) {
        answers = answers || {}
        return (this.spec.deprovision?.[option] !== undefined) || (answers[option] !== undefined)
    }

    getDeprovisionOption(option, defaultValue, answers?) {
        answers = answers || {}
        if (this.spec.deprovision?.[option] !== undefined)
            return this.spec.deprovision[option]

        return answers[option] !== undefined ? answers[option] : defaultValue
    }

    setDeprovisionOption(option, value) {
        this.spec.deprovision = this.spec.deprovision || {}
        this.spec.deprovision[option] = value
    }
}