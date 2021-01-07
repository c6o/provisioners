import createDebug from 'debug'
import { generate, Options } from 'generate-password'
import { ProvisionerBase } from '@provisioner/common'
import { baseProvisionerType } from '../'
import { keyValueOrGenerator, isGenerateOptions } from '../contracts'

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
        this.systemProvisioner = await this.manager.getAppProvisioner('system', 'c6o-system')
    }

    async processTemplate(map: keyValueOrGenerator, stageName: string) {

        try {
            this.manager.status?.push(stageName)

            for (const key in map) {
                this.manager.status?.info(`Evaluating key ${key}`)

                const value = map[key]

                if (isGenerateOptions(value))
                    this._setPassword(map, key, value.generate)
                else {
                    await this.ensureSystemProvisioner()

                    if (value.includes('$PUBLIC_FQDN'))
                        this._interpolateValue(map, key, '$PUBLIC_FQDN', this.systemProvisioner.getApplicationFQDN(this.app.name, this.app.namespace))
                    else if (value.includes('$PUBLIC_URL'))
                        this._interpolateValue(map, key, '$PUBLIC_URL', this.systemProvisioner.getApplicationURL(this.app.name, this.app.namespace))

                }
            }
        }
        finally {
            this.manager.status?.pop()
        }
    }

    async _interpolateValue(map: keyValueOrGenerator, key, template, value) {
        const currentValue = map[key] as string

        this.manager.status?.info(`Interpolating value ${currentValue}`)

        map[key] = currentValue.replace(template, value)
    }

    _setPassword(map: keyValueOrGenerator, key, options: Options) {
        map[key] = generate(options)
    }
}