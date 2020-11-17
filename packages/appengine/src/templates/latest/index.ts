import { getSecretTemplate } from './secrets'
import { getDeploymentTemplate } from './deployment'
import { getPVCTemplate } from './volumes'
import { getConfigTemplate } from './configs'
import { getPortTemplate } from './ports'
import { getProbeTemplate } from './probes'


class Templates {
    getSecretTemplate = getSecretTemplate
    getDeploymentTemplate = getDeploymentTemplate
    getPVCTemplate = getPVCTemplate
    getConfigTemplate = getConfigTemplate
    getPortTemplate = getPortTemplate
    getProbeTemplate = getProbeTemplate
}

export const templates = new Templates()