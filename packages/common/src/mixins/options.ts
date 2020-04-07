
import { baseProvisionerMixinType } from '../provisioner'


export const optionsMixin = (base: baseProvisionerMixinType) => class extends base {

    providedDeprovisionOption(option) {
        return (this.spec.deprovision?.[option] !== undefined) || (this.options[option] !== undefined)
    }

    getDeprovisionOption(option, defaultValue) {
        if (this.spec.deprovision?.[option] !== undefined)
            return this.spec.deprovision[option]

        return this.options[option] !== undefined ? this.options[option] : defaultValue
    }
}