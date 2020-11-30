import { getSecretTemplate } from './secrets'
import { getDeploymentTemplate } from './deployment'
import { getPVCTemplate } from './volumes'
import { getConfigTemplate } from './configs'
import { getPortTemplate } from './ports'
import { getProbeTemplate } from './probes'
import { getTimeZones } from './timeZones'
import { getMySqlTemplate } from './features/mysql'


class Templates {
    getSecretTemplate = getSecretTemplate
    getDeploymentTemplate = getDeploymentTemplate
    getPVCTemplate = getPVCTemplate
    getConfigTemplate = getConfigTemplate
    getPortTemplate = getPortTemplate
    getProbeTemplate = getProbeTemplate
    getTimeZones = getTimeZones
    getMySqlTemplate = getMySqlTemplate
}

export const templates = new Templates()