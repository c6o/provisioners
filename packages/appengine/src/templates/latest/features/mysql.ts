
import { LabelsMetadata } from '../../../parsing'
import { templates } from '../../latest'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMySqlTemplate(spec: any, metaData: LabelsMetadata) {

    //deployment, which will give us our pods
    //nodeport for our service/exposed port
    //secret for the password
    //configmap for our username
    //pvc and volume for storage
    //

    const name = 'mysql'

    const deployment = templates.getDeploymentTemplate(name, spec.namespace, 'mysql:latest', metaData)
    const service = templates.getPortTemplate(name, spec.namespace, metaData)
    const secret = templates.getSecretTemplate(name, spec.namespace, metaData)
    const config = templates.getConfigTemplate(name, spec.namespace, metaData)
    const volume = templates.getPVCTemplate(
        { name: `${name}-data`, size: '5Gi', mountPath : '/data'  },
        spec.namespace,
        metaData)

    return [deployment, service, secret, config, volume]
}