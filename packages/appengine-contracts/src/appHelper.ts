import { AppHelper, AppDocumentLabels } from '@provisioner/contracts'
import { AppEngineAppResource, FlowResult, isPortNumber, ServicePort, DeploymentPort, each } from './'

export class AppEngineAppHelper<T extends AppEngineAppResource = AppEngineAppResource> extends AppHelper<T> {

    version = '1.0'

    get flow() { return this.resource.spec.provisioner?.flow  }

    get configs() { return this.resource.spec.provisioner?.configs }
    get hasConfigs() { return this.resource.spec.provisioner?.configs && Object.keys(this.resource.spec.provisioner.configs).length }

    get configMapRefs() { return this.resource.spec.provisioner?.configMapRefs  }
    get hasConfigMapRefs() { return this.resource.spec.provisioner?.configMapRefs?.length }

    get secrets() { return this.resource.spec.provisioner?.secrets  }
    get hasSecrets() { return this.resource.spec.provisioner?.secrets && Object.keys(this.resource.spec.provisioner.secrets).length }

    get secretRefs() { return this.resource.spec.provisioner?.secretRefs  }
    get hasSecretRefs() { return this.resource.spec.provisioner?.secretRefs?.length }

    get volumes()  { return this.resource.spec.provisioner?.volumes  }
    get hasVolumes() { return this.resource.spec.provisioner?.volumes?.length }

    get ports() { return this.resource.spec.provisioner?.ports  }
    get hasPorts() { return !!this.ports }

    get imagePullPolicy() { return this.resource.spec.provisioner?.imagePullPolicy  }
    get command() { return this.resource.spec.provisioner?.command  }

    get image() { return this.resource.spec.provisioner?.image  }

    postInquire() {
        this.resource.spec.provisioner['flow'] = '$unset'
    }

    processResult(result: FlowResult) {
        const provisioner = this.resource.spec.provisioner
        // Merge the results
        provisioner.configs = Object.assign(provisioner.configs || {}, result.configs)
        provisioner.secrets = Object.assign(provisioner.secrets || {}, result.secrets)
    }

    get componentLabels(): AppDocumentLabels {
        return {
            ...super.componentLabels,
            app: this.name,
            name: this.name,
            'system.codezero.io/appengine': this.version
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

    get answers() {
        return Array.from(this.flattenPrompts()).reduce( (obj, prompt) => {
            obj[prompt.name] = prompt.c6o?.value
            return obj
        }, {})
    }

    public *flattenPrompts() {
        for(const step of each(this.flow)) {
            if (typeof step === 'string')
                continue
            if (step.prompts)
                for(const prompt of each(step.prompts))
                    yield prompt
            if (step.sections)
                for(const section of step.sections)
                    for(const prompt of each(section.prompts))
                        yield prompt
        }
    }
}