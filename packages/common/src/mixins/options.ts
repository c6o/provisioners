
import { baseProvisionerMixinType } from '../provisioner'


export const optionsMixin = (base: baseProvisionerMixinType) => class extends base {

    providedDeprovisionOption(option, answers?) {
        answers = answers || {}
        return (super.spec.deprovision?.[option] !== undefined) || (answers[option] !== undefined)
    }

    getDeprovisionOption(option, defaultValue, answers?) {
        answers = answers || {}
        if (super.spec.deprovision?.[option] !== undefined)
            return super.spec.deprovision[option]

        return answers[option] !== undefined ? answers[option] : defaultValue
    }

    setDeprovisionOption(option, value) {
        super.spec.deprovision = super.spec.deprovision || {}
        super.spec.deprovision[option] = value
    }
}