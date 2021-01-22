

export const convertManifestToAppResource = async (manifest, edition) => {
    const appResource = {
        apiVersion: 'system.codezero.io/v1',
        kind: 'App',
        metadata: {
            name: manifest.namespace || manifest.appId,
            labels: {
                'system.codezero.io/edition': edition.name
            },
            'annotations': {
                'system.codezero.io/display': manifest.name,
                'system.codezero.io/description': manifest.summary || manifest.description,
                'system.codezero.io/appId': manifest._id || manifest.appId,
                'system.codezero.io/iconUrl': manifest.iconUrl
                //'system.codezero.io/screenshotUrls': await getAssetUrls(app.assets, assetProperties['screenshot'].multi, 'apps', czApp._id, 'screenshot', assetProperties)
            }
        },
        spec: {
            package: manifest.package,
            ...edition.spec
        }
    }
    if (edition.interfaces) {
        edition.interfaces.forEach(item => {
            appResource.metadata.labels = {
                ...appResource.metadata.labels,
                [`system.codezero.io/interface-${item}`]: 'true'
            }
        })
    }
    return appResource
}