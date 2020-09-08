import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {


    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']


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
                type: 'confirm',
                name: 'githubYesNo',
                message: 'Setup GitHub Integration:',
                default: true,
            },
                    {
                        type: 'input',
                        name: 'githubClientId',
                        message: 'GitHub Client Id:',
                        validate: (githubClientId) => (githubClientId !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.githubYesNo
                    },
                    {
                        type: 'input',
                        name: 'githubClientSecret',
                        message: 'GitHub Client Secret:',
                        validate: (githubClientSecret) => (githubClientSecret !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.githubYesNo
                    },

            {
                type: 'confirm',
                name: 'gitlabYesNo',
                message: 'Setup GitLab Integration:',
                askAnswered: true,
                default: false
            },

                    {
                        type: 'input',
                        name: 'gitlabClientId',
                        message: 'GitLab Client Id:',
                        validate: (gitlabClientId) => (gitlabClientId !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.gitlabYesNo
                    },
                    {
                        type: 'input',
                        name: 'gitlabClientSecret',
                        message: 'GitLab Client Secret:',
                        validate: (gitlabClientSecret) => (gitlabClientSecret !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.gitlabYesNo
                    },
                    {
                        type: 'input',
                        name: 'gitlabUrl',
                        message: 'GitLab Server URL:',
                        validate: (gitlabUrl) => (gitlabUrl !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.gitlabYesNo
                    },

            {
                type: 'confirm',
                name: 'gogsYesNo',
                message: 'Setup Gogs Integration:',
                askAnswered: true,
                default: false
            },
                    {
                        type: 'input',
                        name: 'gogsServer',
                        message: 'Gogs Server URL:',
                        validate: (gogsServer) => (gogsServer !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.gogsYesNo

                    },

            {
                type: 'confirm',
                name: 'giteaYesNo',
                message: 'Setup Gitea Integration:',
                askAnswered: true,
                default: false
            },

                    {
                        type: 'input',
                        name: 'giteaClientId',
                        message: 'Gitea Client Id:',
                        validate: (giteaClientId) => (giteaClientId !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.giteaYesNo
                    },
                    {
                        type: 'input',
                        name: 'giteaClientSecret',
                        message: 'Gitea Client Secret:',
                        validate: (giteaClientSecret) => (giteaClientSecret !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.giteaYesNo
                    },
                    {
                        type: 'input',
                        name: 'giteaUrl',
                        message: 'Gitea Server URL:',
                        validate: (giteaUrl) => (giteaUrl !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.giteaYesNo
                    },

            {
                type: 'confirm',
                name: 'bitBucketCloudYesNo',
                message: 'Setup BitBucket Cloud Integration:',
                askAnswered: true,
                default: false,
            },
                    {
                        type: 'input',
                        name: 'bitbucketClientId',
                        message: 'BitBucket Client Id:',
                        validate: (bitbucketClientId) => (bitbucketClientId !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketCloudYesNo
                    },
                    {
                        type: 'input',
                        name: 'bitbucketClientSecret',
                        message: 'BitBucket Client Secret:',
                        validate: (bitbucketClientSecret) => (bitbucketClientSecret !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketCloudYesNo
                    },


            {
                type: 'confirm',
                name: 'bitBucketServerYesNo',
                message: 'Setup BitBucket Server Integration:',
                askAnswered: true,
                default: false
            },

                    {
                        type: 'input',
                        name: 'gitUsername',
                        message: 'Git Username:',
                        validate: (gitUsername) => (gitUsername !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketServerYesNo
                    },
                    {
                        type: 'password',
                        name: 'gitPassword',
                        message: 'Git Password:',
                        validate: (gitPassword) => (gitPassword !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketServerYesNo
                    },
                    {
                        type: 'input',
                        name: 'stashConsumerKey',
                        message: 'Stash Consumer Key:',
                        validate: (stashConsumerKey) => (stashConsumerKey !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketServerYesNo
                    },
                    {
                        type: 'input',
                        name: 'stashPrivateKey',
                        message: 'Stash Private Key:',
                        validate: (stashPrivateKey) => (stashPrivateKey !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketServerYesNo
                    },
                    {
                        type: 'input',
                        name: 'stashServer',
                        message: 'Stash Server:',
                        validate: (stashServer) => (stashServer !== '' ? true : ''),
                        askAnswered: true,
                        when: input => input.bitBucketServerYesNo
                    },

        ], answers)

        this.spec.storageSize = responses.storageSize

        this.spec.githubClientId = responses.githubClientId
        this.spec.githubClientSecret = responses.githubClientSecret

        this.spec.gitlabClientId = responses.gitlabClientId
        this.spec.gitlabClientSecret = responses.gitlabClientSecret
        this.spec.gitlabUrl = responses.gitlabUrl

        this.spec.gogsServer = responses.gogsServer

        this.spec.giteaClientId = responses.giteaClientId
        this.spec.giteaClientSecret = responses.giteaClientSecret
        this.spec.giteaUrl = responses.giteaUrl

        this.spec.bitbucketClientId = responses.bitbucketClientId
        this.spec.bitbucketClientSecret = responses.bitbucketClientSecret

        this.spec.gitUsername = responses.gitUsername
        this.spec.gitPassword = responses.gitPassword
        this.spec.stashConsumerKey = responses.stashConsumerKey
        this.spec.stashPrivateKey = responses.stashPrivateKey
        this.spec.stashServer = responses.stashServer

    }
}
