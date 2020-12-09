import { AppObject, ProvisionerManager } from '@provisioner/common'

export class Orchestration {

    // async installFeatures(namespace: string, spec: any, manager: ProvisionerManager) {

    //     // stages:
    //     // 1. Scan all "features", and create specs internally for each
    //     // 2. Take the "values" and apply them to each features spec
    //     // 3. Apply all features into the cluster
    //     // 4. Apply the "script" section to the feature.  This will be very hard coded
    //     // 5. Take the finished spec from each feature, and apply mappings to the App being installed
    //     // 6. Install the App requested

    //     // #Drawback, cant map values from one feature to another
    //     // #Scripts and their relationship with the feature will be very fixed (mysql, mariadb, etc..)  AppEngine will need to support all database types and such to execute these scripts against

    //     //make sure our current provisioner is listed as a dpeendancy so it can take part in the value and mappings
    //     if (!spec.configs) spec.configs = []
    //     if (!spec.secrets) spec.secrets = []

    //     this.PrettyPrintJsonFile(spec, 'pre-setup-spec.json')

    //     this.setupDependancies(spec)

    //     this.PrettyPrintJsonFile(spec, 'pre-link-spec.json')

    //     debug('----------------------------------VALUES----------------------------------')
    //     this.mapAndLink(spec.link.values, spec)
    //     debug('----------------------------------DONE VALUES----------------------------------')

    //     this.PrettyPrintJsonFile(spec, 'pre-install-spec.json')

    //     await this.installDependancies(spec.name, spec.link.dependancies, manifest.state.labels, manager, namespace)

    //     this.PrettyPrintJsonFile(spec, 'pre-map-spec.json')

    //     debug('----------------------------------MAPPING----------------------------------')
    //     this.mapAndLink(spec.link.mappings, spec)
    //     debug('----------------------------------DONE MAPPING----------------------------------')

    //     this.PrettyPrintJsonFile(spec)

    // }
    // setupDependancies(spec: any) {
    //     const fullAppName = `${spec.name}-${manifest.state.labels.edition}-${manifest.state.labels.instanceId}`
    //     for (const dependancy of spec.link.dependancies) {
    //         if (!dependancy.spec) dependancy.spec = { name: dependancy.name}
    //         if (!dependancy.spec.configs) dependancy.spec.configs = []
    //         if (!dependancy.spec.secrets) dependancy.spec.secrets = []
    //         if (!dependancy.spec.name) dependancy.spec.name = dependancy.name

    //         dependancy.manifest.state.labels = JSON.parse(JSON.stringify(manifest.state.labels))
    //         dependancy.manifest.state.labels.partOf = fullAppName
    //         dependancy.manifest.state.labels.component = 'database'
    //     }
    //     this.PrettyPrintJsonFile(spec, 'setup-dependancies.json')

    // }
    // async ensurePodIsRunning(manager: ProvisionerManager, namespace: string, app: string) {
    //     await manager.cluster
    //         .begin('Ensure pod is running')
    //         .beginWatch({
    //             kind: 'Pod',
    //             metadata: {
    //                 namespace,
    //                 labels: {
    //                     app
    //                 }
    //             }
    //         })
    //         .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
    //             processor.endWatch()
    //         })
    //         .end()
    // }
    // async installDependancies(rootName: string, dependancies: any, metaData: LabelsMetadata, manager: ProvisionerManager, namespace: string) {
    //     let database: any
    //     for (const dependancy of dependancies) {
    //         if(dependancy.name === 'mysql') database = dependancy
    //         if(dependancy.name === 'mariadb') database = dependancy

    //         dependancy.spec.configs.push({ name: 'DB_HOST', value: `${dependancy.name}.${namespace}` })
    //         const deployment = await templates.getDeploymentTemplate(dependancy.spec.name, namespace, dependancy.spec.image, dependancy.spec.command, dependancy.manifest.state.labels)
    //         debug('applying secrets')
    //         await this.applySecrets(namespace, dependancy.spec, manager, deployment)
    //         debug('applying configs')
    //         await this.applyConfigs(namespace, dependancy.spec, manager, deployment)
    //         debug('applying ports')
    //         await this.applyPorts(namespace, dependancy.spec, manager, deployment)
    //         debug('applying volumes')
    //         await this.applyVolumes(namespace, dependancy.spec, manager, deployment)
    //         debug('applying deployment')
    //         await this.applyDeployment(dependancy.spec, manager, deployment)
    //         debug('ensure dependancy is runing')
    //         await this.ensurePodIsRunning(manager, namespace, dependancy.name)
    //         debug('done')
    //     }

    //     if(database.spec.scripts) {

    //         debug('Waiting for 5 seconds to ensure database health...')

    //         await new Promise(resolve => setTimeout(resolve, 5000))

    //         const scripts = []
    //         for(const script of database.spec.scripts) {
    //             scripts.push(script.script)
    //         }

    //         applySql({
    //             host: database.spec.configs.filter(e=>e.name === 'DB_HOST')[0].value,
    //             port: database.spec.configs.filter(e=>e.name === 'DB_PORT')[0].value,
    //             password: database.spec.secrets.filter(e=>e.name === 'MYSQL_ROOT_PASSWORD')[0].value,
    //             user: 'root',
    //             sql: scripts,
    //             insecureAuth: true
    //         })
    //     }


    // }
    // mapAndLink(root: any, spec: any) {

    //     //iterate over all values
    //     for (const i of root) {

    //         const value = i.item
    //         const source = value.source
    //         const destination = value.destination

    //         //polyfill will our known values
    //         if (source.value) {
    //             if (typeof (source.value) === 'string' && source.value.startsWith('$RANDOM')) {
    //                 if (source.value === '$RANDOM')
    //                     source.value = this.makeRandom(10)
    //                 else {
    //                     if (source.value.indexOf(':') > 0) {
    //                         const len = Number(source.value.substr(source.value.indexOf(':') + 1))
    //                         source.value = this.makeRandom(len)
    //                     }
    //                 }
    //             }
    //         }

    //         let destinationSpec = undefined
    //         if (destination.name === spec.name) {
    //             destinationSpec = spec
    //         } else {
    //             //copy over from source to destination
    //             const featureLst = spec.link.dependancies.filter(e => e.name === destination.name)

    //             if (featureLst && featureLst.length > 0) {
    //                 if (!featureLst[0].spec) featureLst[0].spec = { configs: [], secrets: [] }
    //                 destinationSpec = featureLst[0].spec
    //             }
    //         }


    //         //we have a value and a place for it to go to
    //         if (destinationSpec) {

    //             //if the source was a straight value
    //             if (source.value) {
    //                 destinationSpec[destination.type].push({ name: destination.field, value: source.value })
    //             } else {
    //                 //need to dig the value out of the other provisioner itself

    //                 let sourceSpec = undefined

    //                 //if we need to get it from the root spec
    //                 if (source.name === spec.name) {
    //                     sourceSpec = spec
    //                 } else {
    //                     sourceSpec = spec.link.dependancies.filter(e => e.name === source.name)[0]?.spec
    //                 }

    //                 if (sourceSpec) {
    //                     const value = sourceSpec[destination.type].filter(e => e.name === source.field)[0]?.value
    //                     destinationSpec[destination.type].push({ name: destination.field, value })
    //                 }
    //             }
    //         }
    //     }
    // }

}