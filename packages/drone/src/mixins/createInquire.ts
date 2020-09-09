import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {


    storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']

    scmChoices = ['GitHub', 'GitHub Enterprise', 'Bitbucket Cloud', 'Bitbucket Server', 'Gitea', 'GitLab', 'Gogs']


    async createInquire(args) {

        const answers = {
            githubClientId: args.githubClientId || this.spec.githubClientId,
            githubClientSecret: args.githubClientSecret || this.spec.githubClientSecret,
        }

        console.log('Installation help for each SCM provider can be found here: https://docs.drone.io/server/overview/\n')

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'list',
                name: 'storageSize',
                message: 'What size data volume would you like to provision?',
                choices: this.storageChoices,
                default: this.spec.storageSize || '5Gi'
            },
            {
                type: 'list',
                name: 'scmChoice',
                message: 'Which SCM Provider would you like to use?',
                choices: this.scmChoices,
                default: this.scmChoices[0]
            },

            //GitHub
            {
                type: 'input',
                name: 'githubClientId',
                message: 'GitHub Client Id:',
                validate: (githubClientId) => (githubClientId !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitHub'
            },
            {
                type: 'input',
                name: 'githubClientSecret',
                message: 'GitHub Client Secret:',
                validate: (githubClientSecret) => (githubClientSecret !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitHub'
            },

            //GitHub Enterprise
            {
                type: 'confirm',
                name: 'alwaysAuth',
                message: 'Always authenticate (If private mode enabled):',
                askAnswered: true,
                default: true,
                when: input => input.scmChoice === 'GitHub Enterprise'
            },
            {
                type: 'input',
                name: 'githubClientId',
                message: 'GitHub Client Id:',
                validate: (githubClientId) => (githubClientId !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitHub Enterprise'
            },
            {
                type: 'input',
                name: 'githubClientSecret',
                message: 'GitHub Client Secret:',
                validate: (githubClientSecret) => (githubClientSecret !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitHub Enterprise'
            },
            {
                type: 'input',
                name: 'githubServer',
                message: 'GitHub Server URL:',
                validate: (githubServer) => (githubServer !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitHub Enterprise'
            },

            //GitLab
            {
                type: 'input',
                name: 'gitlabClientId',
                message: 'GitLab Client Id:',
                validate: (gitlabClientId) => (gitlabClientId !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitLab'
            },
            {
                type: 'input',
                name: 'gitlabClientSecret',
                message: 'GitLab Client Secret:',
                validate: (gitlabClientSecret) => (gitlabClientSecret !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitLab'
            },
            {
                type: 'input',
                name: 'gitlabUrl',
                message: 'GitLab Server URL:',
                validate: (gitlabUrl) => (gitlabUrl !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'GitLab'
            },

            //GOGS
            {
                type: 'input',
                name: 'gogsServer',
                message: 'Gogs Server URL:',
                validate: (gogsServer) => (gogsServer !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Gogs'
            },

            //Gitea
            {
                type: 'input',
                name: 'giteaClientId',
                message: 'Gitea Client Id:',
                validate: (giteaClientId) => (giteaClientId !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Gitea'
            },
            {
                type: 'input',
                name: 'giteaClientSecret',
                message: 'Gitea Client Secret:',
                validate: (giteaClientSecret) => (giteaClientSecret !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Gitea'
            },
            {
                type: 'input',
                name: 'giteaUrl',
                message: 'Gitea Server URL:',
                validate: (giteaUrl) => (giteaUrl !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Gitea'
            },


            //BitBucket Cloud
            {
                type: 'input',
                name: 'bitbucketClientId',
                message: 'BitBucket Client Id:',
                validate: (bitbucketClientId) => (bitbucketClientId !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Cloud'
            },
            {
                type: 'input',
                name: 'bitbucketClientSecret',
                message: 'BitBucket Client Secret:',
                validate: (bitbucketClientSecret) => (bitbucketClientSecret !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Cloud'
            },


            //BitBucket Server
            {
                type: 'input',
                name: 'gitUsername',
                message: 'Git Username:',
                validate: (gitUsername) => (gitUsername !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Server'
            },
            {
                type: 'password',
                name: 'gitPassword',
                message: 'Git Password:',
                validate: (gitPassword) => (gitPassword !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Server'
            },
            {
                type: 'input',
                name: 'stashConsumerKey',
                message: 'Stash Consumer Key:',
                validate: (stashConsumerKey) => (stashConsumerKey !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Server'
            },
            {
                type: 'input',
                name: 'stashPrivateKey',
                message: 'Stash Private Key:',
                validate: (stashPrivateKey) => (stashPrivateKey !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Server'
            },
            {
                type: 'input',
                name: 'stashServer',
                message: 'Stash Server:',
                validate: (stashServer) => (stashServer !== '' ? true : ''),
                askAnswered: true,
                when: input => input.scmChoice === 'Bitbucket Server'
            },

        ], answers)

        this.spec.storageSize = responses.storageSize
        this.spec.scmChoice = responses.scmChoice

        if(responses.githubClientId) this.spec.githubClientId = responses.githubClientId
        if(responses.githubClientSecret) this.spec.githubClientSecret = responses.githubClientSecret
        if(responses.githubServer) this.spec.githubServer = responses.githubServer
        if(responses.alwaysAuth) this.spec.alwaysAuth = responses.alwaysAuth

        if(responses.gitlabClientId) this.spec.gitlabClientId = responses.gitlabClientId
        if(responses.gitlabClientSecret) this.spec.gitlabClientSecret = responses.gitlabClientSecret
        if(responses.gitlabUrl) this.spec.gitlabUrl = responses.gitlabUrl

        if(responses.gogsServer) this.spec.gogsServer = responses.gogsServer

        if(responses.giteaClientId) this.spec.giteaClientId = responses.giteaClientId
        if(responses.giteaClientSecret) this.spec.giteaClientSecret = responses.giteaClientSecret
        if(responses.giteaUrl) this.spec.giteaUrl = responses.giteaUrl

        if(responses.bitbucketClientId) this.spec.bitbucketClientId = responses.bitbucketClientId
        if(responses.bitbucketClientSecret) this.spec.bitbucketClientSecret = responses.bitbucketClientSecret

        if(responses.gitUsername) this.spec.gitUsername = responses.gitUsername
        if(responses.gitPassword) this.spec.gitPassword = responses.gitPassword
        if(responses.stashConsumerKey) this.spec.stashConsumerKey = responses.stashConsumerKey
        if(responses.stashPrivateKey) this.spec.stashPrivateKey = responses.stashPrivateKey
        if(responses.stashServer) this.spec.stashServer = responses.stashServer

    }
}