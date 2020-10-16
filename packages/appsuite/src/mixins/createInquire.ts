import { baseProvisionerType } from '../index'
import { ParserFactory as parserFactory } from '../parsing'
import createDebug from 'debug'
const debug = createDebug('@appsuite:createInquire')

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {

        const automated = args['automated'] || this.spec.automated
        debug('Inquire started\n', 'spec:\n', this.spec, 'args:\n', args)

        this.spec.app = await this.askApp(args, automated)
        this.spec.config = await this.askConfig(args, automated)

        debug('Inquire Completed\n', 'spec:\n', this.spec, 'args:\n', args)

        //appEngine -> provisions docker containers
        //appStudio -> UI to manage appEngine based configuration  (czctl and webui -> icon in marina)
        //appSuite  -> provisioner for provisioners


        /*CLI UI
        czctl install appsuite --local -n testing \
             --app mysql:developerinternal:mysql \
             --app adminer:preview:adminer \
             --config mysql.provisioner.volume.data.size:10Gi \
             --config adminer.provisioner.secret.ADMINER_DEFAULT_SERVER:{mysql.hostname} \
             --config adminer.provisioner.secret.username:root \
             --config adminer.provisioner.secret.password:{mysql.secret.MYSQL_ROOT_PASSWORD}

             essentially  'adminer' would point to the app 'adminer', and its 'spec' property
             we can leave out 'provisioner', because we will assume that is the default, and will first try the property path directly,
                        and if it fails, add .provisioner. and try again
        */

        /*YAML UI
            spec:
              provisioner:
                app:
                  - appId: mysql
                    edition: developerinternal
                    name: mysql
                  - appId: adminer
                    edition: preview
                    name: adminer
                config:
                  - namePath: adminer.secret.ADMINER_DEFAULT_SERVER
                    valuePath: {mysql.hostname}
                  - namePath: adminer.secret.username
                    valuePath: root  //raw value, will override what is in the provisioner spec
                  - namePath: adminer.secret.username
                    valuePath: {mysql.secret.MYSQL_ROOT_PASSWORD}
        */

        /*
        config allows for mapping between configs, secrets in one app to another
           appName.(secret|config).setting
        values are in the form of:
          plainString      //any basic value will be treated as a string
          {specialString}  //any value within curly braces we will "evaluate" it
          evalutations:
                core objects:
                    appName : refers to any of the apps which are being installed
                        appName.spec : refers to the spec on the app
                        appName.spec.provisioner
                        appName.spec.provisioner.image
                    public  : refers to the public ingress gateway, typically it can be used to get the public DNS host
                        public.hostname
        */
    }


    async askApp(args, automated) {

        const parserType = this.spec.appParser || 'BasicAppParser'
        const apps = parserFactory.getAppParser(parserType).parse(args, this.spec)
        if (apps?.length > 0 || automated) return apps

        let responses = { hasApps: false, appId: '', edition: '', name: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasApps',
                    message: 'Would you like to add an app?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'appId',
                    message: 'What is the appId of the app you would like to add?',
                    when: r => r.hasApps,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'edition',
                    message: 'What is the edtion of the app you would like to add?',
                    when: r => r.hasApps,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'name',
                    default: 'appId',
                    message: 'What would you like to name this app?',
                    when: r => r.hasApps,
                }
            ])

            if (responses.hasApps) {
                if(responses.name === 'appId' || responses.name?.trim() === '') responses.name = responses.appId
                apps.push({ appId: responses.appId, edition: responses.edition, name: responses.name })
            }
        } while (responses.hasApps)

        return apps

    }


    async askConfig(args, automated) {

        const configParserType = this.spec.configParser || 'BasicConfigParser'
        const configs = parserFactory.getConfigParser(configParserType).parse(args, this.spec)
        if (configs.length > 0 || automated) return configs

        let responses = { hasConfig: false, namePath: '', valuePath: '' }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfig',
                    message: 'Would you like to add a configuration mapping parameter?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'namePath',
                    message: 'What is configuration parameter name?',
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
                },
                {
                    type: 'input',
                    name: 'valuePath',
                    message: 'What is configuration parameter value?',
                    when: r => r.hasConfig,
                    validate: r => r !== '' //non empty string
                }
            ])

            if (responses.hasConfig)
                configs.push({ namePath: responses.namePath, valuePath: responses.valuePath })

        } while (responses.hasConfig)

        return configs

    }

}
