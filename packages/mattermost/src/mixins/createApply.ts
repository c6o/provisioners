import { Buffer } from 'buffer'
import { processPassword } from '@provisioner/common'
import { baseProvisionerType } from '../index'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mattermostPreviewPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mattermost-preview'
                }
            }
        }
    }

    get mattermostClusterPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mattermost'
                }
            }
        }
    }

    mySqlConfig: any = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: 'mysql-operator-orc',
            labels: {
                app: 'mysql-operator',
                release: 'mysql-operator'
            }
        },
        data: {
            'orchestrator.conf.json': "{\n  \"ApplyMySQLPromotionAfterMasterFailover\": false,\n  \"BackendDB\": \"sqlite\",\n  \"Debug\": false,\n  \"DetachLostReplicasAfterMasterFailover\": true,\n  \"DetectClusterAliasQuery\": \"SELECT CONCAT(SUBSTRING(@@hostname, 1, LENGTH(@@hostname) - 1 - LENGTH(SUBSTRING_INDEX(@@hostname,'-',-2))),'.',SUBSTRING_INDEX(@@report_host,'.',-1))\",\n  \"DetectInstanceAliasQuery\": \"SELECT @@hostname\",\n  \"DiscoverByShowSlaveHosts\": false,\n  \"FailMasterPromotionIfSQLThreadNotUpToDate\": true,\n  \"HTTPAdvertise\": \"http://{{ .Env.HOSTNAME }}-svc:80\",\n  \"HostnameResolveMethod\": \"none\",\n  \"InstancePollSeconds\": 5,\n  \"ListenAddress\": \":3000\",\n  \"MasterFailoverDetachReplicaMasterHost\": true,\n  \"MySQLHostnameResolveMethod\": \"@@report_host\",\n  \"MySQLTopologyCredentialsConfigFile\": \"/etc/orchestrator/orc-topology.cnf\",\n  \"OnFailureDetectionProcesses\": [\n    \"/usr/local/bin/orc-helper event -w '{failureClusterAlias}' 'OrcFailureDetection' 'Failure: {failureType}, failed host: {failedHost}, lost replcas: {lostReplicas}' || true\",\n    \"/usr/local/bin/orc-helper failover-in-progress '{failureClusterAlias}' '{failureDescription}' || true\"\n  ],\n  \"PostIntermediateMasterFailoverProcesses\": [\n    \"/usr/local/bin/orc-helper event '{failureClusterAlias}' 'OrcPostIntermediateMasterFailover' 'Failure type: {failureType}, failed hosts: {failedHost}, slaves: {countSlaves}' || true\"\n  ],\n  \"PostMasterFailoverProcesses\": [\n    \"/usr/local/bin/orc-helper event '{failureClusterAlias}' 'OrcPostMasterFailover' 'Failure type: {failureType}, new master: {successorHost}, slaves: {slaveHosts}' || true\"\n  ],\n  \"PostUnsuccessfulFailoverProcesses\": [\n    \"/usr/local/bin/orc-helper event -w '{failureClusterAlias}' 'OrcPostUnsuccessfulFailover' 'Failure: {failureType}, failed host: {failedHost} with {countSlaves} slaves' || true\"\n  ],\n  \"PreFailoverProcesses\": [\n    \"/usr/local/bin/orc-helper failover-in-progress '{failureClusterAlias}' '{failureDescription}' || true\"\n  ],\n  \"ProcessesShellCommand\": \"sh\",\n  \"RaftAdvertise\": \"{{ .Env.HOSTNAME }}-svc\",\n  \"RaftBind\": \"{{ .Env.HOSTNAME }}\",\n  \"RaftDataDir\": \"/var/lib/orchestrator\",\n  \"RaftEnabled\": true,\n  \"RaftNodes\": [],\n  \"RecoverIntermediateMasterClusterFilters\": [\n    \".*\"\n  ],\n  \"RecoverMasterClusterFilters\": [\n    \".*\"\n  ],\n  \"RecoveryIgnoreHostnameFilters\": [],\n  \"RecoveryPeriodBlockSeconds\": 300,\n  \"RemoveTextFromHostnameDisplay\": \":3306\",\n  \"SQLite3DataFile\": \"/var/lib/orchestrator/orc.db\",\n  \"SlaveLagQuery\": \"SELECT TIMESTAMPDIFF(SECOND,ts,NOW()) as drift FROM sys_operator.heartbeat ORDER BY drift ASC LIMIT 1\",\n  \"UnseenInstanceForgetHours\": 1\n}",
            'orc-topology.cnf': '[client]\nuser = {{ .Env.ORC_TOPOLOGY_USER }}\npassword = {{ .Env.ORC_TOPOLOGY_PASSWORD }}\n'
        }
    }

    async createApply() {
        await this.installMattermost()
        await this.ensureMattermostIsRunning()
    }

    installMattermost = async () =>
        this.isPreview ?
            this.installMattermostPreview() :
            this.installMattermostEnterprise()

    async installMattermostPreview() {
        const namespace = this.serviceNamespace

        await this.controller.cluster
            .begin('Installing mattermost preview edition')
                .addOwner(this.controller.resource)
                .upsertFile('../../k8s/preview/preview.yaml', { namespace })
            .end()
    }

    async installMattermostEnterprise() {
        const namespace = this.serviceNamespace

        const {
            users,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize
        } = this.spec

        this.mySqlConfig.metadata.namespace = namespace
        const topologyUser = Buffer.from(processPassword(this.spec.topologyUser)).toString('base64')
        const topologyPassword = Buffer.from(processPassword(this.spec.topologyUser)).toString('base64')

        await this.controller.cluster
            .begin('Install mysql operator')
                .addOwner(this.controller.resource)
                .upsert(this.mySqlConfig)
                .upsertFile('../../k8s/full/1-mysql-crds.yaml')
                .upsertFile('../../k8s/full/1-mysql-operator.yaml', { namespace, topologyUser, topologyPassword })
            .end()


        await this.controller.cluster
            .begin('Install minio operator')
                .addOwner(this.controller.resource)
                .upsertFile('../../k8s/full/2-minio-crds.yaml')
                .upsertFile('../../k8s/full/2-minio-operator.yaml', { namespace })
            .end()

        await this.controller.cluster
            .begin('Install mattermost operator')
                .addOwner(this.controller.resource)
                .upsertFile('../../k8s/full/3-mattermost-crds.yaml')
                .upsertFile('../../k8s/full/3-mattermost-operator.yaml', { namespace })
            .end()

        await this.controller.cluster
            .begin('Install mattermost cluster')
                .addOwner(this.controller.resource)
                .upsertFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace, users, mattermostLicenseSecret, databaseStorageSize, minioStorageSize })
            .end()
    }

    async ensureMattermostIsRunning() {
        const watchPods = this.isPreview ? this.mattermostPreviewPods : this.mattermostClusterPods
        await this.controller.cluster.
            begin('Ensure Mattermost services are running')
                .beginWatch(watchPods)
                .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}