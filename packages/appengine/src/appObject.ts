import createDebug from 'debug'
import { ProvisionerManager } from '@provisioner/common'
import { AppObject } from '@provisioner/contracts'
import { AppEngineAppDocument, FlowResult, isPortNumber, keyValue, ServicePort, DeploymentPort, LabelsMetadata } from './contracts'
import * as fs from 'fs'
const debug = createDebug('@appengine:timing')

export class AppEngineAppObject extends AppObject {
    document: AppEngineAppDocument

    get flow() { return this.document.spec.provisioner?.flow  }

    get configs() { return this.document.spec.provisioner?.configs }
    get hasConfigs() { return this.document.spec.provisioner?.configs && Object.keys(this.document.spec.provisioner.configs).length }

    get secrets() { return this.document.spec.provisioner?.secrets  }
    get hasSecrets() { return this.document.spec.provisioner?.secrets && Object.keys(this.document.spec.provisioner.secrets).length }
    get base64Secrets() {
        const secrets: keyValue = { }
        for(const key in this.document.spec.provisioner?.secrets) {
            secrets[key] = Buffer.from(secrets[key]).toString('base64')
        }
        return secrets
    }


    get volumes()  { return this.document.spec.provisioner?.volumes  }
    get ports() { return this.document.spec.provisioner?.ports  }
    get hasPorts() { return !!this.ports }

    get imagePullPolicy() { return this.document.spec.provisioner?.imagePullPolicy  }
    get command() { return this.document.spec.provisioner?.command  }

    get image() { return this.document.spec.provisioner?.image  }

    constructor(document: AppEngineAppDocument) {
        super(document)
    }

    postInquire() {
        this.document.spec.provisioner['flow'] = '$unset'
    }

    processResult(result: FlowResult) {
        const provisioner = this.document.spec.provisioner
        // Merge the results
        provisioner.configs = Object.assign(provisioner.configs || {}, result.configs)
        provisioner.secrets = Object.assign(provisioner.secrets || {}, result.secrets)
    }

    getComponentLabels(): keyValue {
        const packageJSON = JSON.parse(fs.readFileSync('../package.json').toString('utf8'))
        return {
            app: this.name,
            name: this.name,
            'system.codezero.io/appengine': packageJSON .version,
            'system.codezero.io/app': this.name, // This is used to render GetInfo in Marina
            'system.codezero.io/id': this.instanceId,
            'app.kubernetes.io/name': this.name,
            'app.kubernetes.io/managed-by': 'codezero',
            'system.codezero.io/edition': this.edition
        }
    }

    getServicePorts(): ServicePort[] {
        if (!this.ports)
            return

        if (isPortNumber(this.ports))
            return [{
                port: this.ports,
                protocol: 'TCP'
            }]

        return this.ports.map(port => {
            port.protocol = port.protocol.toUpperCase()
            return port
        })
    }

    getDeploymentPorts = (): DeploymentPort[] => this.getServicePorts().map(portItem => {
        const { port, ...rest } = portItem
        return {
            containerPort: port,
            ...rest
        }
    })

}