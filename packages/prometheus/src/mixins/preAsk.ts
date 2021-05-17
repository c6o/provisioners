import * as yaml from 'js-yaml'
import * as path from 'path'
import { homedir } from 'os'
import { promises as fs } from 'fs'
import inquirer from 'inquirer'
import { AppHelper } from '@provisioner/common'

import { baseProvisionerType } from '../index'

// TODO: put in base class
function resolvePath(filePath: string) {
    if (!filePath)
        return ''

    // '~/folder/path' or '~'
    if (filePath[0] === '~' && (filePath[1] === '/' || filePath.length === 1))
        return filePath.replace('~', homedir())

    return path.resolve(filePath)
}

export const preAskMixin = (base: baseProvisionerType) => class extends base {

    async preask(options) {
        if (options['addJob'])
            await this.preAddJob(options)

        if (options['removeJob'])
            await this.preRemoveJob(options)

        if (options['addCert'])
            await this.preAddCert(options)
            
        if (options['removeCert'])
            await this.preRemoveCert(options)
    }

    async setPrometheusNamespace() {
        const apps = await AppHelper.from(null, 'prometheus').list(this.controller.cluster, 'Failed to find Prometheus')
        const choices = apps.map(app => app.metadata.namespace)
        if (choices.length == 1) {
            this.prometheusNamespace = choices[0]
        } else if (choices.length > 1) {
            const selection = await inquirer.prompt({
                type: 'list',
                name: 'namespace',
                message: `Which prometheus would you like to ask?`,
                choices
            })
            this.prometheusNamespace = selection.namespace
        }
    }

    async preAddJob(options) {
        await this.setPrometheusNamespace()
        const jobFile = options['addJob']
        const jobYaml = await fs.readFile(resolvePath(jobFile), 'utf8')
        this.jobConfig = yaml.load(jobYaml)
    }

    async preRemoveJob(options) {
        await this.setPrometheusNamespace()
        this.removeJobName = options['removeJob']
    }

    async preAddCert(options) {
        await this.setPrometheusNamespace()
        const certPath = options['addCert']

        // CA certificate to validate API server certificate with.
        let file = await fs.readFile(resolvePath(`${certPath}/ca.pem`), 'utf8')
        const caFile = file.toString()
        // Certificate and key files for client cert authentication to the server.
        let certFile = ''
        let keyFile = ''

        try {
            file = await fs.readFile(resolvePath(`${certPath}/cert.pem`), 'utf8')
            certFile = file.toString()
            file = await fs.readFile(resolvePath(`${certPath}/key.pem`), 'utf8')
            keyFile = file.toString()
        } catch (e) {
            // debug('error reading client cert or key file')
        }

        // use the directory name as the cert name
        this.certName  = certPath.split('/').pop()
        this.certFiles = {
            'ca_file': caFile,
            'cert_file': certFile,
            'key_file': keyFile
        }
    }

    async preRemoveCert(options) {
        await this.setPrometheusNamespace()
        this.certName = options['removeCert']
    }
}