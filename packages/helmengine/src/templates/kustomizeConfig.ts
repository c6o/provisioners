import { keyValue, Resource } from '@c6o/kubeclient-contracts'
import yaml from 'js-yaml'
import { AppDocumentLabels } from '@provisioner/contracts'

/**
 * Create JSON Patch commands to add system.codezero.io labels
 * at specific path.
 *
 * @see http://jsonpatch.com/ for more details.
 *
 * @param path
 * @param labels
 * @returns
 */
const generateLabelsPatch = (path, labels) => {
    return Object.keys(labels)
        .filter(k => labels[k]) // Ensure a value exists.
        .filter(k => k.startsWith('system.codezero.io')) // Only add system.codezero.io labels
        .map(k => ({
            op: 'add',
            path: `${path}/${k.replace('/', '~1')}`,
            value: labels[k],
        }))
}

/**
 * Generates a ConfigMap that contains a Kusomization script used by post-rendered to update all
 * Helm generated resources.
 *
 * This ConfigMap should be mounted into the helm job, and executed as a post-renderer script.
 *
 * Adds:
 *  - system.codezero.io lables
 *  - ownerReferences to the App Resource.
 *
 * @param name
 * @param namespace
 * @param labels
 * @param owner
 * @returns
 */
export async function getKustomizationConfigs(name: string, namespace: string, labels: AppDocumentLabels, owner: Resource) {
    // Shell script to run kustomize script.
    const postRender = [
        '#!/bin/sh',
        'cat > input.yaml',                            // Save incoming data as file.
        'cp $(dirname "$0")/kustomization.yaml ./',    // Copy kustomization scripts to cwd
        'exec kustomize build',                        // Execute kustomize
    ].join('\n')

    const patchOwner = [
        {
            op: 'add',
            path: '/metadata/ownerReferences',
            value: [{
                apiVersion: owner.apiVersion,
                kind: owner.kind,
                name: owner.metadata.name,
                uid: owner.metadata.uid,
                blockOwnerDeletion: true,
            }],
        },
    ]

    // Applies commonLabels to metadata, and template metadata.
    const kustomization = {
        resources: ['input.yaml'],
        patches: [
            { patch: yaml.dump(patchOwner), target: { namespace } },
            {
                patch: yaml.dump(generateLabelsPatch('/spec/template/metadata/labels', labels)),
                target: { namespace, kind: 'Deployment' },
            },
            {
                patch: yaml.dump(generateLabelsPatch('/metadata/labels', labels)),
                target: { namespace, labelSelector: `app.kubernetes.io/instance=${name}` },
            },
        ],
    }

    // Creates mountable postrender.sh script, and kustomize configs.
    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}-kustomization`,
            namespace: namespace,
        },
        data: {
            'postrender.sh': postRender,
            'kustomization.yaml': yaml.dump(kustomization),
        },
    }
}