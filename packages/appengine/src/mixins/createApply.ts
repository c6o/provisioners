import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'

import jsyaml from 'js-yaml'
import fs from 'fs'


export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: this.spec.name
                }
            }
        }
    }

    async createApply() {

        if(this.spec.verbose) console.log('Verbose is on\n')

        await this.ensureServiceNamespacesExist()
        await this.installApp()
        if(!this.spec.dryRun) await this.ensureAppIsRunning()
    }

    async installApp() {

        const applierType = this.spec.applier || 'StringApplier'
        await applierFactory.getApplier(applierType).apply(this.serviceNamespace, this.spec, this.manager, this.spec.verbose)

        this.emitYamlManifest()
    }

    emitYamlManifest() {
        if(this.spec.out && this.spec.out !== '') {
            let doc: any = jsyaml.safeLoad(fs.readFileSync(`${__dirname}/../../manifest.template.yaml`, 'utf8'))
            doc.app.name = this.spec.name
            doc.app.id = this.spec.name
            let preview = {
                name: 'preview',
                scope: 'private',
                default: true,
                spec: {
                    routes : [
                    ],
                    provisioner : {
                        ui: 'ignore',
                        package: '@provisioner/appengine',
                        name: 'codeserver',
                        image: 'linuxserver/code-server:latest',
                        automated: true,
                        port: ''
                    },
                    marina: {
                        launch: {
                            type: 'inline',
                            popUp: true,
                        }
                    }
                }
            }

            for(const port of this.spec.ports) {
                //{ number: items[0], name: items[1], targetPort: items[2] }

                preview.spec.provisioner.port = `${port.number}/${port.name}/${port.targetPort}`

                let editionPort: any = {
                    type: port.targetPort,
                    targetServce: 'appengine',
                }
                if(port.targetPort.toLowerCase() === 'tcp') {
                    editionPort.tcp = {
                        name: port.name,
                        port: port.number
                    }
                }
                preview.spec.routes.push(editionPort)
            }

            doc.app.editions = []
            doc.app.editions.push(preview)

            fs.writeFileSync(this.spec.out, jsyaml.safeDump(doc))
        }

    }

    async ensureAppIsRunning() {
        await this.manager.cluster.
            begin(`Ensure ${this.spec.name} services are running`)
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}