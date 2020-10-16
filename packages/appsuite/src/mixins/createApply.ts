import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('@appsuite:createApply')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {

        for (const app of this.spec.app) {
            console.log(app)

            //load the provsioner
            ///home/robchartier/data/source/github/node-monorepo/packages/jobs/c6o-seed/src/index.ts
            app.manifest = await this.manager.hubClient.getAppManifest(app.appId, app.edition)

            if (!app.manifest)
                throw Error('App not found')

            //transform the spec

            //install/create the app in the cluster
            app.results = await this.manager.perform(app.manifest, 'create', { local: true })

        }


    }



}