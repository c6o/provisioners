import createDebug from 'debug'
import { generate, GenerateOptions } from 'generate-password'
import { ProvisionerBase } from '@provisioner/common'
import { baseProvisionerType } from '../'
import { keyValueOrGenerator, isGenerateOptions } from '@provisioner/appengine-contracts'

const debug = createDebug('@appengine:template')

declare module '../' {
    export interface Provisioner {
        systemProvisioner: ProvisionerBase

        ensureSystemProvisioner(): Promise<void>
        processTemplate(map: keyValueOrGenerator, stageName: string): Promise<void>
    }
}

export const templateHelperMixin = (base: baseProvisionerType) => class extends base {

    systemProvisioner
    async ensureSystemProvisioner() {
        if (this.systemProvisioner)
            return
        this.systemProvisioner = await this.resolver.getAppProvisioner('c6o-system', 'c6o-system')
    }

    async processTemplate(map: keyValueOrGenerator, stageName: string) {

        try {
            this.status?.push(stageName)

            for (const key in map) {
                this.status?.info(`Evaluating key ${key}`)

                const value = map[key]

                if (isGenerateOptions(value))
                    this._setPassword(map, key, value.generate)
                else if (typeof value === 'string') {
                    await this.ensureSystemProvisioner()
                    if (value.includes('$PUBLIC_FQDN'))
                        this._interpolateValue(map, key, '$PUBLIC_FQDN', await this.systemProvisioner.getApplicationFQDN(this.documentHelper.name, this.documentHelper.namespace))
                    else if (value.includes('$PUBLIC_URL'))
                        this._interpolateValue(map, key, '$PUBLIC_URL', await this.systemProvisioner.getApplicationURL(this.documentHelper.name, this.documentHelper.namespace))
                }
                else if (typeof value === 'number')
                    map[key] = (value as number).toString()
            }
        }
        finally {
            this.status?.pop()
        }
    }

    async _interpolateValue(map: keyValueOrGenerator, key, template, value) {
        const currentValue = map[key] as string

        this.status?.info(`Interpolating value ${currentValue}`)

        map[key] = currentValue.replace(template, value)
    }

    _setPassword(map: keyValueOrGenerator, key, options: GenerateOptions) {
        map[key] = generate(options)
    }
}