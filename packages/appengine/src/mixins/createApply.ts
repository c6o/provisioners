import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'
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
        await this.ensureServiceNamespacesExist()
        await this.installApp()
        await this.ensureAppIsRunning()
    }

    async installApp() {

        this.spec.env = ''

        if (this.spec.secrets) {
            this.spec.secretsContent = ''
            for (const item of this.spec.secrets) {
                if (!item.env || item.env === '') item.env = item.name
                const value = Buffer.from(item.value).toString('base64')
                this.spec.secretsContent += `    ${item.name}: '${value}'\n`
                this.spec.env += `        - name: ${item.env}\n          valueFrom:\n            secretKeyRef:\n                name: ${this.spec.name}secrets\n                key: ${item.name}\n`
            }

            if(this.spec.verbose && this.spec.verbose!='') console.log(`secretsContent:\n`, this.spec.secretsContent)

            await this.manager.cluster
                .begin('Installing the Secrets')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/1-secrets.yaml', { ...this.spec, namespace: this.serviceNamespace })
                .end()
        }

        if (this.spec.configs) {
            this.spec.configsContent = ''
            for (const item of this.spec.configs) {
                if (!item.env || item.env === '') item.env = item.name
                this.spec.configsContent += `    ${item.name}: '${item.value}'\n`
                this.spec.env += `        - name: ${item.env}\n          valueFrom:\n            configMapKeyRef:\n              name: ${this.spec.name}configs\n              key: ${item.name}\n`
            }
            if(this.spec.verbose && this.spec.verbose!='') console.log(`configsContent:\n`, this.spec.configsContent)

            await this.manager.cluster
                .begin('Installing the Configuration Settings')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/2-configmap.yaml', { ...this.spec, namespace: this.serviceNamespace })
                .end()
        }

        this.spec.portsContent = ''   //deployment

        if (this.spec.ports && this.spec.ports.length > 0) {

            this.spec.portsContent = '        ports:\n'   //deployment
            this.spec.servicePortContent = '  ports:\n'   //service/nodePort

            for (const item of this.spec.ports) {
                this.spec.portsContent += `            - name: '${item.name}'\n              containerPort: ${item.number}\n`
                this.spec.servicePortContent += `    - name: '${item.name}'\n      port: ${item.number}\n      targetPort: '${item.targetPort}'\n`
            }
            if(this.spec.verbose && this.spec.verbose!='') console.log(`portsContent:\n`, this.spec.portsContent)
            if(this.spec.verbose && this.spec.verbose!='') console.log(`servicePortContent:\n`, this.spec.servicePortContent)

            await this.manager.cluster
                .begin('Installing Networking Services')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/5-service.yaml', { ...this.spec, namespace: this.serviceNamespace })
                .end()

        }

        this.spec.volumeMounts = ''
        this.spec.deployVolumes = ''

        if (this.spec.volumes && this.spec.volumes.length > 0) {
            this.spec.volumeMounts = '        volumeMounts:\n'
            this.spec.deployVolumes = '      volumes:\n'

            for (const item of this.spec.volumes) {
                if (item.name && item.name !== '') {
                    this.spec.volumeMounts += `        - name: '${item.name}'\n          mountPath: ${item.mountPath}\n`
                    this.spec.deployVolumes += `      - name: '${item.name}'\n        persistentVolumeClaim:\n          claimName: ${item.name}\n`

                    await this.manager.cluster
                        .begin(`Installing Volume ${item.name}`)
                        .addOwner(this.manager.document)
                        .upsertFile('../../k8s/latest/3-pvc.yaml', { ...this.spec, namespace: this.serviceNamespace, size: item.size, volumeName: item.name })
                        .end()
                }
            }
        }
        if(this.spec.verbose && this.spec.verbose!='') console.log(`volumeMounts:\n`, this.spec.volumeMounts)
        if(this.spec.verbose && this.spec.verbose!='') console.log(`deployVolumes:\n`, this.spec.deployVolumes)

        await this.manager.cluster
            .begin('Installing the Deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/4-deployment.yaml', { ...this.spec, namespace: this.serviceNamespace })
            .end()


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