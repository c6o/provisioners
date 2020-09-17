import { baseProvisionerType } from ".."

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ["1Gi","2Gi","5Gi","10Gi","20Gi","50Gi","100Gi"]

    async inquire(args) {
        return await this.manager.inquirer?.prompt([
<% if (pvcEnabled) { -%>
            this.inquireStorageClass({
                name: "storageClass",
                default: this.getDefaultStorageClass(),
            }),
            {
                type: "list",
                name: "storage",
                message: "What size data volume would you like for your log storage?",
                choices: this.storageChoices,
                default: "2Gi"
            },
<% } else { -%>
            {
                type: "input",
                name: "exampleQuestion"
                message: "This is an example question, what is your answer?",
            }
<% } -%>
        ], args)
    }

    async createInquire(args) {
        const answers = await this.inquire(args)

        // Update spec based on users answers.
<% if (pvcEnabled) { -%>
        this.spec.storageClass = answers.storageClass
        this.spec.storage = answers.storage
<% } else { -%>
        this.exampleQuestion = answers.exampleQuestion
<% } -%>
    }
}