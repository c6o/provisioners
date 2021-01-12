import createDebug from 'debug'
import { AppObject } from '@provisioner/contracts'
import { AppEngineAppDocument, FlowResult, isPortNumber, keyValue, ServicePort, DeploymentPort, LabelsMetadata } from './'
// import * as fs from 'fs'
// import * as path from 'path'
const debug = createDebug('@appengine:timing')

export class AppEngineAppObject extends AppObject {
    document: AppEngineAppDocument

    get flow() { return this.document.spec.provisioner?.flow  }

    get configs() { return this.document.spec.provisioner?.configs }
    get hasConfigs() { return this.document.spec.provisioner?.configs && Object.keys(this.document.spec.provisioner.configs).length }

    get secrets() { return this.document.spec.provisioner?.secrets  }
    get hasSecrets() { return this.document.spec.provisioner?.secrets && Object.keys(this.document.spec.provisioner.secrets).length }

    get volumes()  { return this.document.spec.provisioner?.volumes  }
    get hasVolumes() { return this.document.spec.provisioner?.volumes?.length }

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
        // const packageJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString('utf8'))
        const packageJSON = { version: 'v1'}
        return {
            app: this.name,
            name: this.name,
            'system.codezero.io/appengine': packageJSON.version,
            'system.codezero.io/app': this.name, // This is used to render GetInfo in Marina
            'system.codezero.io/id': this.instanceId,
            'system.codezero.io/edition': this.edition,
            'app.kubernetes.io/name': this.name,
            'app.kubernetes.io/managed-by': 'codezero'
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