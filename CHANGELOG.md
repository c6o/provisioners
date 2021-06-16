# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.30](https://github.com/c6o/node-monorepo/compare/v0.0.29...v0.0.30) (2021-06-16)


### 🐛 Bug Fixes

* Remove UI-Theme CSS variables from provisioners ([#256](https://github.com/c6o/node-monorepo/issues/256)) ([08d7064](https://github.com/c6o/node-monorepo/commit/08d7064020e521c0f9c9b31e20e6ad17d7ab5e71))


### ♻️ Chores

* Bumped [@c6o](https://github.com/c6o)/bundle ([1e73420](https://github.com/c6o/node-monorepo/commit/1e7342005d9c8ca3046d8d1a9c8518f6df2483a8))
* Support grabbing of environment variables ([#257](https://github.com/c6o/node-monorepo/issues/257)) ([55853fb](https://github.com/c6o/node-monorepo/commit/55853fbf16fc4834f61fd2a1955a8dbbe39589ab))





## [0.0.29](https://github.com/c6o/node-monorepo/compare/v0.0.28...v0.0.29) (2021-06-09)


### ✨ Features

* Added toKeyValues to Secretes and ConfigMap ([#254](https://github.com/c6o/node-monorepo/issues/254)) ([e91e835](https://github.com/c6o/node-monorepo/commit/e91e8353da98e1cf7d96211f8031d2df91d5c4fb))


### 🐛 Bug Fixes

* Erroneous supervisor reference and quotes ([fd65496](https://github.com/c6o/node-monorepo/commit/fd65496c8d1b9dd8f5f42e2bade1a07f5962bb38))


### ♻️ Chores

* Added cli helpers ([#253](https://github.com/c6o/node-monorepo/issues/253)) ([7dfee98](https://github.com/c6o/node-monorepo/commit/7dfee984866c85666988c5283f75f174a6e93206))
* Added missing reference to changelog-metahub ([f6e3d10](https://github.com/c6o/node-monorepo/commit/f6e3d105223e926f6e2dd01a3bb1f46fefd9361e))
* Bumped czbundle ([35ddfb7](https://github.com/c6o/node-monorepo/commit/35ddfb7f4134abd45c176e7db6578a3c07846dc2))
* Bumped kubeclient ([e9410b3](https://github.com/c6o/node-monorepo/commit/e9410b3dd57cc4bc0df5ef211cc4de534e3814aa))
* Re-factored build system ([#252](https://github.com/c6o/node-monorepo/issues/252)) ([7a7dcbe](https://github.com/c6o/node-monorepo/commit/7a7dcbe5a76ed785d0e8331614d569b696585177))
* Refactored ProvisionerManager. Migrated provisioners ([#246](https://github.com/c6o/node-monorepo/issues/246)) ([dfa682f](https://github.com/c6o/node-monorepo/commit/dfa682f90b096dd3009b782f57a740fe13896bda))
* removed reference to tslib ([#250](https://github.com/c6o/node-monorepo/issues/250)) ([b3bdbd6](https://github.com/c6o/node-monorepo/commit/b3bdbd6a1fae75be3eb4d6db8db461b3b0cd4ba3))
* Using kubeclient-resources ([#243](https://github.com/c6o/node-monorepo/issues/243)) ([7a2ffea](https://github.com/c6o/node-monorepo/commit/7a2ffea1ddb106a2f693e3b940e0a29c61a3c6e5))
* **kits:** moved kits files into provisioners/contracts ([#237](https://github.com/c6o/node-monorepo/issues/237)) ([8816669](https://github.com/c6o/node-monorepo/commit/8816669c0a1e779f03ff50ed0a6fbed12c437862))
* **kits-contracts:** added volumes to the app object, updated attach request contract. ([#240](https://github.com/c6o/node-monorepo/issues/240)) ([855e7c9](https://github.com/c6o/node-monorepo/commit/855e7c9f2b27afe7f59992cfd5b11a4e7c4674d0))





## [0.0.28](https://github.com/c6o/node-monorepo/compare/v0.0.27...v0.0.28) (2021-03-31)


### ✨ Features

* **answers file:** Ability to specific an answers file during install of an app ([#223](https://github.com/c6o/node-monorepo/issues/223)) ([3d332fe](https://github.com/c6o/node-monorepo/commit/3d332fe887c87e38ba550351c8a0e706e7f8271e))
* **HelmEngine:** Initial commit of HelmEngine provisioner ([#228](https://github.com/c6o/node-monorepo/issues/228)) ([77c8557](https://github.com/c6o/node-monorepo/commit/77c85572f0031639ee3aefe7f6ee544a7edd2056))
* **lifeboat:** Add lifeboat to the dock by default ([#203](https://github.com/c6o/node-monorepo/issues/203)) ([d56c031](https://github.com/c6o/node-monorepo/commit/d56c031f87e420cf134739ce1e19b9284ed300fa))
* **lifeboat:** Hook into c60-system [#179](https://github.com/c6o/node-monorepo/issues/179) ([e11e0e8](https://github.com/c6o/node-monorepo/commit/e11e0e81ed0d00426e7762c6b58dd6ba08a49e0e))
* **mariadb orchestration:** mariadb orchestration provisioner working, upgraded wikijs to use it ([#220](https://github.com/c6o/node-monorepo/issues/220)) ([e20cc25](https://github.com/c6o/node-monorepo/commit/e20cc25c7c94ad0ff38559a6df016654b1d40f1a))


### 🐛 Bug Fixes

* Corrected app instanceId if name/namespace is undefined ([4f2e0a9](https://github.com/c6o/node-monorepo/commit/4f2e0a9d4e38d655ceb70ed97d61b7fa9609f658))


### ♻️ Chores

* **kits:** reorganize kits-contracts into provisioners. ([#231](https://github.com/c6o/node-monorepo/issues/231)) ([6b89e3f](https://github.com/c6o/node-monorepo/commit/6b89e3fa08e90e4303357053e404f90ac6006e9e))
* **orchestration:** Enabled DB orchestration for many provisioners ([#221](https://github.com/c6o/node-monorepo/issues/221)) ([c7d3e4d](https://github.com/c6o/node-monorepo/commit/c7d3e4d7d659a634c33b32136152387353b29b35))
* **rabbitmq:** Fixed manifest. Tested provisioner ([#218](https://github.com/c6o/node-monorepo/issues/218)) ([d0faccf](https://github.com/c6o/node-monorepo/commit/d0faccf6552bc8f1491917180e32144be1c59452))
* Give AppEngine form inputs the 'compact' theme for better screen layout ([#198](https://github.com/c6o/node-monorepo/issues/198)) ([4c7d2c6](https://github.com/c6o/node-monorepo/commit/4c7d2c6e3278ec875ce298f77a0bfe044913ec20))
* Some more linter disables to suppress certain warnings ([668fd68](https://github.com/c6o/node-monorepo/commit/668fd6846260fab97afc272159c0ad671a04feba))





## [0.0.27](https://github.com/c6o/node-monorepo/compare/v0.0.26...v0.0.27) (2021-02-03)


### ✨ Features

* **c6o-system:** Ensure default namespace is managed by c6o ([#151](https://github.com/c6o/node-monorepo/issues/151)) ([88fe2de](https://github.com/c6o/node-monorepo/commit/88fe2deb0be898aa073a83eaa1b6ba0a29dc215d))
* **c6o-system:** Initial release of Harbour Master ([#154](https://github.com/c6o/node-monorepo/issues/154)) ([a500e7f](https://github.com/c6o/node-monorepo/commit/a500e7f5a0b9232ab7d6c58308b2280d7cdde1b2)), closes [#155](https://github.com/c6o/node-monorepo/issues/155) [#1239](https://github.com/c6o/node-monorepo/issues/1239)
* **cli:** add shared manifest to app conversion ([#166](https://github.com/c6o/node-monorepo/issues/166)) ([5f63f18](https://github.com/c6o/node-monorepo/commit/5f63f18e14c64d3e291678464392edcd148aceda))
* **mongo:** Support for secretRefs and configMapRefs. Migrated mongo based provisioners ([#158](https://github.com/c6o/node-monorepo/issues/158)) ([00304f2](https://github.com/c6o/node-monorepo/commit/00304f28e5044dc59567b93f9909939ea74e5b31))


### 🐛 Bug Fixes

* **AppEngine:** add fsGroup to security context to fix [#182](https://github.com/c6o/node-monorepo/issues/182) ([#183](https://github.com/c6o/node-monorepo/issues/183)) ([f456230](https://github.com/c6o/node-monorepo/commit/f4562308cc8c9682440861f7466e7848cb875626))
* **istio:** Removed http routing from virtual service ([#184](https://github.com/c6o/node-monorepo/issues/184)) ([ab0c33e](https://github.com/c6o/node-monorepo/commit/ab0c33e74618d0c8a871fadec5ebc3829bb0495d))
* **vscode:** Fix bad service template ([237d48b](https://github.com/c6o/node-monorepo/commit/237d48b9c6454c9feaeeb57ab11db9110ae805c2))
* Added missing references ([6409cb7](https://github.com/c6o/node-monorepo/commit/6409cb7877df2f70b7b416c90ef0dd35e418f8fe))
* AppEngine fails on ConfigMap with boolean or numeric values ([#181](https://github.com/c6o/node-monorepo/issues/181)) ([23fa9d4](https://github.com/c6o/node-monorepo/commit/23fa9d45d61c21d00c8f20af7b56b315f44c7905))
* Configs and Secrets cannot be an array, must be KeyValue ([#180](https://github.com/c6o/node-monorepo/issues/180)) ([d04367d](https://github.com/c6o/node-monorepo/commit/d04367d75777eed6738fad907227001eaa2bd9c2))
* Removed reference to incorrect AppObject/AppDocument ([f988ede](https://github.com/c6o/node-monorepo/commit/f988ede1d5f38c632900169c11ead51a1af1c500))
* **app-engine:** Secrets getting skipped ([acb0a0b](https://github.com/c6o/node-monorepo/commit/acb0a0b201acc3dc8debdd4166414ebeed8c711e))
* **istio:** Do not handle virtualServices in develop/localhost ([d60dd6d](https://github.com/c6o/node-monorepo/commit/d60dd6df62422d7b01fe57813052c20032985a45))
* **nodered:** Fixed ports ([5eb901d](https://github.com/c6o/node-monorepo/commit/5eb901d26808a9f4bf0a6e75db503881034f942d))


### 📦 Code Refactoring

* **appengine:** Using contracts and using inquire flow in cli and UI ([#156](https://github.com/c6o/node-monorepo/issues/156)) ([4d612b9](https://github.com/c6o/node-monorepo/commit/4d612b909ac4eaa0ecddf3355363e7429e517204))


### ♻️ Chores

* Bumped kubeclient to 0.0.8. Removed local reference ([cc755f2](https://github.com/c6o/node-monorepo/commit/cc755f266ecd8322d3a31c292237da96b4db4b04))
* **c6o-system:** Cleaned up host API ([0e00b11](https://github.com/c6o/node-monorepo/commit/0e00b114a0018f40ca57a97ab3646d5444dc0fae))
* **contracts:** Split labels between App and AppEngine contracts ([8e4671e](https://github.com/c6o/node-monorepo/commit/8e4671ee732eb302f603987c488890db219eaace))
* **manifest refactor:** new data model ([#192](https://github.com/c6o/node-monorepo/issues/192)) ([604e6a4](https://github.com/c6o/node-monorepo/commit/604e6a4ecbb964af88ecc59cd3bb8e344ae5a71a))
* Code formatting changes only! ([2df4e69](https://github.com/c6o/node-monorepo/commit/2df4e69ed0b6050e0f6f9ddbf8400273e7c8eff0))
* Migrated databases to use flow ([#157](https://github.com/c6o/node-monorepo/issues/157)) ([341a92f](https://github.com/c6o/node-monorepo/commit/341a92f534ea7e9c2b0ec27007b2a0dbeab6dbc2))
* Migrated mariadb to flow ([1956390](https://github.com/c6o/node-monorepo/commit/19563904d0439e269d49078c1ef08e1a5a6b0cd5))
* update Vaadin to 14.4.5 ([fa3cdde](https://github.com/c6o/node-monorepo/commit/fa3cddead8be2233dcf6960bb0191b535510e35f))
* Using mergeWith to manage labels ([#185](https://github.com/c6o/node-monorepo/issues/185)) ([d37071f](https://github.com/c6o/node-monorepo/commit/d37071f6457ce1b4f3c300d5c10d860c79e75ae0))
* **refactor manifests:** Initial refactor of all manifests ([#178](https://github.com/c6o/node-monorepo/issues/178)) ([67b39cb](https://github.com/c6o/node-monorepo/commit/67b39cb6e9277fe16d932ae16454e64ae39f6788))
* Bump "js-yaml" to v4.0.0 ([d00e402](https://github.com/c6o/node-monorepo/commit/d00e4025b6f02e39d74d4509ebda897cb34feac5))
* Bump js-yaml to v4.0.0 ([aac8811](https://github.com/c6o/node-monorepo/commit/aac88113030ae673282f573d3a101c917f52432e))
* **appengine-upgrade:** Continue with the Web UI for appengine upgrades ([e592561](https://github.com/c6o/node-monorepo/commit/e59256169ee0dba0f7b94d6f2046ba9f307105c1))





## [0.0.26](https://github.com/c6o/node-monorepo/compare/v0.0.25...v0.0.26) (2021-01-01)


### 🐛 Bug Fixes

* **appengine:** Duct taped skip handling ([6707b6b](https://github.com/c6o/node-monorepo/commit/6707b6bd0d4fe9d7a89a5656b1f80f132700915a))
* **appengine:** Re-removed merged code for handleNext ([a3073c1](https://github.com/c6o/node-monorepo/commit/a3073c1338a29f23f0b600919dff2453196bba4a))
* Skip advancing the index if skipping an install screen ([b7861ac](https://github.com/c6o/node-monorepo/commit/b7861aca80a3ceb5328bffefd06792247bcbddd8))


### ♻️ Chores

* Cleaned up tsconfig/package.json. Updated kubeclient to 0.0.7 ([#152](https://github.com/c6o/node-monorepo/issues/152)) ([5edc89a](https://github.com/c6o/node-monorepo/commit/5edc89a41bdd305c9f3650691454e8dfb32d128f))
* Very small code style update. "e" is typically used in our code to represent an event. ([70e4f85](https://github.com/c6o/node-monorepo/commit/70e4f8580fb657c7436d55b797f591b852b83e32))
* **bugbash:** Fixed more provisioners ([#146](https://github.com/c6o/node-monorepo/issues/146)) ([e5226f8](https://github.com/c6o/node-monorepo/commit/e5226f8786700b255c2d4b9cb95010449822394a))
* Removed deprecated provisioner.name ([9c5ac68](https://github.com/c6o/node-monorepo/commit/9c5ac68a39d9dd4a24d12effdae3b1064033b2d9))





## [0.0.25](https://github.com/c6o/node-monorepo/compare/v0.0.24...v0.0.25) (2020-12-18)


### ♻️ Chores

* Adding back some CSS for styling app engine ([109556b](https://github.com/c6o/node-monorepo/commit/109556bd6728db1cdfae41dc14b38fad347f4406))





## [0.0.24](https://github.com/c6o/node-monorepo/compare/v0.0.23...v0.0.24) (2020-12-15)


### 🐛 Bug Fixes

* **marina:** App name for GetInfo dialogs ([978cffa](https://github.com/c6o/node-monorepo/commit/978cffae97fe376f842f532305803687c41bde42))


### ♻️ Chores

* Add CMS env vars ([a56a7b9](https://github.com/c6o/node-monorepo/commit/a56a7b9dbffbc55c5254e2ebb2b3286916f57ef9))
* **bugs:** Miscel bugs found in provisioners ([#133](https://github.com/c6o/node-monorepo/issues/133)) ([434f8bd](https://github.com/c6o/node-monorepo/commit/434f8bd0e27e2a001bb7dd5a10a21f45fb5cebab))
* Refactor getter methods ([5372517](https://github.com/c6o/node-monorepo/commit/5372517e416a3209d32e5633cae017dd6610aff8))





## [0.0.23](https://github.com/c6o/node-monorepo/compare/v0.0.22...v0.0.23) (2020-12-10)

**Note:** Version bump only for package provisioners-root





## [0.0.22](https://github.com/c6o/node-monorepo/compare/v0.0.21...v0.0.22) (2020-12-09)


### ♻️ Chores

* Change hub.codezero.io to codezero.io ([#115](https://github.com/c6o/node-monorepo/issues/115)) ([218976c](https://github.com/c6o/node-monorepo/commit/218976c8dfb306a316ba304f7c1cd35d24655619))





## [0.0.21](https://github.com/c6o/node-monorepo/compare/v0.0.20...v0.0.21) (2020-12-08)


### 🐛 Bug Fixes

* **Jitsi tag:** Updated jitsi to support a docker image tag, including defaults ([#114](https://github.com/c6o/node-monorepo/issues/114)) ([1d28e6f](https://github.com/c6o/node-monorepo/commit/1d28e6fc48a7db3dcf7e7e1ea9d009372ec7895f))


### ♻️ Chores

* **assets:** Removed assetsBaseURL ([#112](https://github.com/c6o/node-monorepo/issues/112)) ([b0d92b4](https://github.com/c6o/node-monorepo/commit/b0d92b40c44ec0821626a03e966d9478cbf03b1b))





## [0.0.20](https://github.com/c6o/node-monorepo/compare/v0.0.19...v0.0.20) (2020-12-04)


### 🐛 Bug Fixes

* More work on the app engine UI ([98bf253](https://github.com/c6o/node-monorepo/commit/98bf25318b1235d1c22014991a59799484bb9aef))
* **c6o-system:** Now you can install codezero over itself ([aee8fda](https://github.com/c6o/node-monorepo/commit/aee8fda47c7601a0b680e738afd9f6d250f8e9ce))
* **publish:** Fixed publish-manifests so non-workspace apps are published ([e210607](https://github.com/c6o/node-monorepo/commit/e210607ce3bc475f76467eca562bf9ad33ae42ec))


### ♻️ Chores

* Moved service address getter to base ([4eedadf](https://github.com/c6o/node-monorepo/commit/4eedadf44e0c727595880eddc68af3c8dfb0bedc))
* Some UI cleanup to the app engine provisioner ([ad25f8f](https://github.com/c6o/node-monorepo/commit/ad25f8f472fe0ccb2f10db33537e2181486d6465))





## [0.0.19](https://github.com/c6o/node-monorepo/compare/v0.0.18...v0.0.19) (2020-11-20)

**Note:** Version bump only for package provisioners-root





## [0.0.18](https://github.com/c6o/node-monorepo/compare/v0.0.17...v0.0.18) (2020-11-19)


### 🐛 Bug Fixes

* **assets:** Fixed casing in assets URL ([7e15883](https://github.com/c6o/node-monorepo/commit/7e1588366b0d3f0b9f26c916361d96a598c38293))
* **scope vs status:** Manifest had incorrect label for property scope vs status. ([#98](https://github.com/c6o/node-monorepo/issues/98)) ([cdae10c](https://github.com/c6o/node-monorepo/commit/cdae10cce61ad8b1c2d9995a74096990e5de40a1))


### ♻️ Chores

* **appengine-bug:** fixed bug with appengine ([#97](https://github.com/c6o/node-monorepo/issues/97)) ([2f0cc7e](https://github.com/c6o/node-monorepo/commit/2f0cc7e751bad6c4e33188e15d682c3c9ae05322))





## [0.0.17](https://github.com/c6o/node-monorepo/compare/v0.0.16...v0.0.17) (2020-11-05)


### ♻️ Chores

* **metadata:** Add more metadata to provisioners. ([#93](https://github.com/c6o/node-monorepo/issues/93)) ([7fdd291](https://github.com/c6o/node-monorepo/commit/7fdd291671dcdcb04edc1d75a2480d13b76e2ff6))
* **metadata:** More metadata ([#95](https://github.com/c6o/node-monorepo/issues/95)) ([5814b6b](https://github.com/c6o/node-monorepo/commit/5814b6b32af95c63e64b2ed166ca8138b82dc229))
* **metadata:** Updated metadata to be able to use the WebUI to capture field values ([#92](https://github.com/c6o/node-monorepo/issues/92)) ([c32c959](https://github.com/c6o/node-monorepo/commit/c32c959e3e0c933f35d146298137c5158432f333))





## [0.0.16](https://github.com/c6o/node-monorepo/compare/v0.0.15...v0.0.16) (2020-10-30)


### ✨ Features

* **app engine web ui:** Added more capabilities and bug fixes to app engine ([#91](https://github.com/c6o/node-monorepo/issues/91)) ([e6c4d41](https://github.com/c6o/node-monorepo/commit/e6c4d41965741be6f1641c9b99b8199d3a94617f))





## [0.0.15](https://github.com/c6o/node-monorepo/compare/v0.0.14...v0.0.15) (2020-10-23)

**Note:** Version bump only for package provisioners-root





## [0.0.14](https://github.com/c6o/node-monorepo/compare/v0.0.13...v0.0.14) (2020-10-23)

**Note:** Version bump only for package provisioners-root





## [0.0.13](https://github.com/c6o/node-monorepo/compare/v0.0.12...v0.0.13) (2020-10-22)

**Note:** Version bump only for package provisioners-root





## [0.0.12](https://github.com/c6o/node-monorepo/compare/v0.0.11...v0.0.12) (2020-10-22)

**Note:** Version bump only for package provisioners-root





## [0.0.11](https://github.com/c6o/node-monorepo/compare/v0.0.10...v0.0.11) (2020-10-21)


### 🐛 Bug Fixes

* **store:** Incorrect icon ([01484d1](https://github.com/c6o/node-monorepo/commit/01484d135d1b5545d65980823e115103b26b01c7))


### ♻️ Chores

* **labels:** Enabled support for enahced standardized labels. ([#83](https://github.com/c6o/node-monorepo/issues/83)) ([d660fde](https://github.com/c6o/node-monorepo/commit/d660fdef3066a8820d615ef637200a60c9bb3dbf))
* **metadata:** Continued to flesh out more metadata for apps ([#86](https://github.com/c6o/node-monorepo/issues/86)) ([32aca28](https://github.com/c6o/node-monorepo/commit/32aca2857c5bd618632782b4f48849a35bfe9442))
* **metadata:** Updated metadata on provisioners. ([#87](https://github.com/c6o/node-monorepo/issues/87)) ([44fb60a](https://github.com/c6o/node-monorepo/commit/44fb60abf7647b8393a390554f14fd4a767bcf49))
* **suitecrm:** Added provisioning manifest ([99eab01](https://github.com/c6o/node-monorepo/commit/99eab0155f8f7485d047f24aa73d846ecc7d8326))





## [0.0.10](https://github.com/c6o/node-monorepo/compare/v0.0.9...v0.0.10) (2020-10-15)


### 🐛 Bug Fixes

* VSCode spec errors ([538087f](https://github.com/c6o/node-monorepo/commit/538087f02878f90dafcbf6786d32f75acfdf0011))


### ♻️ Chores

* **adminer:** Minor edits ([f5025c3](https://github.com/c6o/node-monorepo/commit/f5025c3196b02ada5d7b142f495b8378a26b2e3d))
* Added provisioning manifests to all apps ([f2cec4a](https://github.com/c6o/node-monorepo/commit/f2cec4a84c984885819cc93b6d781927885d7429))
* Added publish-manifests script ([8b6bd9f](https://github.com/c6o/node-monorepo/commit/8b6bd9f9e656514352fb33c5fc9e5a72ae65174f))
* Created provisioning manifest ([c56f1fe](https://github.com/c6o/node-monorepo/commit/c56f1feebb54281fd895a320563184917447057c))





## [0.0.9](https://github.com/c6o/node-monorepo/compare/v0.0.8...v0.0.9) (2020-09-30)


### ✨ Features

* Added feature flag keys ([#79](https://github.com/c6o/node-monorepo/issues/79)) ([f7352e9](https://github.com/c6o/node-monorepo/commit/f7352e9010758f3d01fee6c3d1e76c293a56daaa))
* Made cluster accountName optional ([9ef0cc4](https://github.com/c6o/node-monorepo/commit/9ef0cc40f337262176811886d4a9ac214939fde4))
* **drone:** Created a Drone provisioner ([#64](https://github.com/c6o/node-monorepo/issues/64)) ([8648574](https://github.com/c6o/node-monorepo/commit/864857427b2a94f7a6400787a86a752d9f4aeb09))


### 🐛 Bug Fixes

* **c6o-system:** Fixed bad RegEx for detecting system vs app requests ([9cb1b77](https://github.com/c6o/node-monorepo/commit/9cb1b774d315063b9f00f95c557a92c4b2d3450f))
* Show cluster namspace if name not available ([0ecf80e](https://github.com/c6o/node-monorepo/commit/0ecf80e87fe037abd6672712df79a9624aa2fc4c))
* **istio:** Fix for targetPort in Virtual Service ([#76](https://github.com/c6o/node-monorepo/issues/76)) ([67e99a3](https://github.com/c6o/node-monorepo/commit/67e99a3b8c691a12a609842a235a2ef118a2abbf))


### ♻️ Chores

* **review-provisioners:** Ensure all active provisioners are working ([#73](https://github.com/c6o/node-monorepo/issues/73)) ([dfdbaa7](https://github.com/c6o/node-monorepo/commit/dfdbaa769aafadc04be32079e413ab69ca5692f0))
* Removed c6o/ui dependency ([6733d70](https://github.com/c6o/node-monorepo/commit/6733d70eb184cf5faf596357935a4cbe0db8478c))
* **istio:** Updated provisioner to reflect istiod instead of pilot ([#71](https://github.com/c6o/node-monorepo/issues/71)) ([#72](https://github.com/c6o/node-monorepo/issues/72)) ([a17609e](https://github.com/c6o/node-monorepo/commit/a17609e5cf4c07aeed55bf9eef08e5a8092eaa4b))
* Bumped versions [skip ci] ([3d5e954](https://github.com/c6o/node-monorepo/commit/3d5e9548bf45f702619d83f93061cdec84cb5f7f))





## [0.0.8](https://github.com/c6o/node-monorepo/compare/v0.0.7...v0.0.8) (2020-09-11)

**Note:** Version bump only for package provisioners-root





## [0.0.7](https://github.com/c6o/node-monorepo/compare/v0.0.6...v0.0.7) (2020-09-03)


### ✨ Features

* **docker-registry:** Provisioner for docker-registry ([#58](https://github.com/c6o/node-monorepo/issues/58)) ([4ea6767](https://github.com/c6o/node-monorepo/commit/4ea6767565dabab7c58f525b60744e5712ce4f82))
* **Folding@Home:** Folding@Home Provisioner ([#50](https://github.com/c6o/node-monorepo/issues/50)) ([f4d04c4](https://github.com/c6o/node-monorepo/commit/f4d04c4a07f08acc69f1e9091957d3dd368c9bc9))
* **ghost:** Ghost provisioner implementation ([#36](https://github.com/c6o/node-monorepo/issues/36)) ([6ae493b](https://github.com/c6o/node-monorepo/commit/6ae493b96860d96e1a449cec2b7289d5fa9879ce))
* **jitsi:** Jitsi Provisioner ([#42](https://github.com/c6o/node-monorepo/issues/42)) ([dfca726](https://github.com/c6o/node-monorepo/commit/dfca72651911bc8c438b38d6e86a1876fb54651a))
* **jitsi:** Jitsi Provisioner ([#44](https://github.com/c6o/node-monorepo/issues/44)) ([d7e69be](https://github.com/c6o/node-monorepo/commit/d7e69bedbe413f22d059a4bc13799403f3fc5e97))
* **mosquitto:** Mosquitto provisioner ([#40](https://github.com/c6o/node-monorepo/issues/40)) ([0a011d4](https://github.com/c6o/node-monorepo/commit/0a011d46992a13016d02433691f0d44099d0c052))
* **suitecrm:** SuiteCRM provisioner ([#47](https://github.com/c6o/node-monorepo/issues/47)) ([e04735b](https://github.com/c6o/node-monorepo/commit/e04735b8dd318883f1f6fcd888f976b255f113f5))
* **wordpress:** WordPress provisioner ([#39](https://github.com/c6o/node-monorepo/issues/39)) ([d865fde](https://github.com/c6o/node-monorepo/commit/d865fdeac450360c7dd2ead704c10186e1ccf46a))


### 🐛 Bug Fixes

* **system:** preApp steps and new cluster creation status ([d9c2e32](https://github.com/c6o/node-monorepo/commit/d9c2e325277f08401c66f9b6373d06c97642767a))


### ♻️ Chores

* Bumped gitHead ([15d30cf](https://github.com/c6o/node-monorepo/commit/15d30cf8f5386a58e2873cf2dd97fdc55f8f7cd2))
* Bumped versions ([1da2565](https://github.com/c6o/node-monorepo/commit/1da25659e5cbe7989a20537e62f2cc730005a699))
* Bumped versions ([43a02cb](https://github.com/c6o/node-monorepo/commit/43a02cbde47a491bd5d318fe896d9922cdc71ba4))
* Updated yarn.lock ([114a7e6](https://github.com/c6o/node-monorepo/commit/114a7e6cb604a18a1785ba995bd592d1aab2961a))
* yarn.lock ([b04ac13](https://github.com/c6o/node-monorepo/commit/b04ac137110ec5fad4297b511b6257f8f5e70d8f))
* **hub:** Switch domain suffix for dev and staging to codezero.dev ([#35](https://github.com/c6o/node-monorepo/issues/35)) ([47042ab](https://github.com/c6o/node-monorepo/commit/47042abe504c2e4894ec7a71d41510dfe5516b69))





## [0.0.6](https://github.com/c6o/node-monorepo/compare/v0.0.5...v0.0.6) (2020-08-23)


### ♻️ Chores

* Added pack-all script ([200ba08](https://github.com/c6o/node-monorepo/commit/200ba0818791f99441d56d9c3262701962d9d54b))
* Bumped references ([798c6a3](https://github.com/c6o/node-monorepo/commit/798c6a3f7c826d04f2327a5cfae535f2dd3d04e8))
* Rerveted to workspaces ([#31](https://github.com/c6o/node-monorepo/issues/31)) ([aa2b267](https://github.com/c6o/node-monorepo/commit/aa2b267fff9af1da96f0790917e1cc7e838dd86d))
* **istio:** Upgrade Istio from 1.4.2 to 1.6.6 ([#30](https://github.com/c6o/node-monorepo/issues/30)) ([c8f5e14](https://github.com/c6o/node-monorepo/commit/c8f5e143bb68ad069d98d67c91ad96e5d4bae526))
* Removed extraneous debugger statement ([2981418](https://github.com/c6o/node-monorepo/commit/298141896a221c585856f2d11541ced346556eb8))
* Spelling issues ([f302134](https://github.com/c6o/node-monorepo/commit/f3021348e25e9cb1f76cce1694d2cdba236b491d))
* Updated build scripts ([#28](https://github.com/c6o/node-monorepo/issues/28)) ([a0b1c40](https://github.com/c6o/node-monorepo/commit/a0b1c403ea128c5f2d515febfcb71772a31990c5))
* Updated dependencies ([18ff8de](https://github.com/c6o/node-monorepo/commit/18ff8de36b5a0c9b1f343842724167fdc60bf62d))





## [0.0.5](https://github.com/c6o/node-monorepo/compare/v0.0.4...v0.0.5) (2020-08-13)


### ✨ Features

* **mattermost-provisioner:** Enable support for latest (cluster) and preview modes for the installer ([#20](https://github.com/c6o/node-monorepo/issues/20)) ([a3a374c](https://github.com/c6o/node-monorepo/commit/a3a374c387314567469dcc86377c0eef1b9ff694))


### ♻️ Chores

* **c6o-system:** Upgrade system icon ([#21](https://github.com/c6o/node-monorepo/issues/21)) ([386b237](https://github.com/c6o/node-monorepo/commit/386b2374a08dda1ea1fab1ab2b7ca1e2225bde71))
* **node-red:** Added app labels ([3dd67df](https://github.com/c6o/node-monorepo/commit/3dd67df32b41bc98c349ef5997453fb8635c45ef))
* **system:** Added app labels ([5f22610](https://github.com/c6o/node-monorepo/commit/5f226103c6a67253c82964d8b578328731dc0d1b))
* Updated gitHead ([570855f](https://github.com/c6o/node-monorepo/commit/570855fb1f45f0e051dedccc2acef7b83375ebac))





## [0.0.4](https://github.com/c6o/node-monorepo/compare/v0.0.3...v0.0.4) (2020-08-10)


### ✨ Features

* **system:** ngrok support ([031e20b](https://github.com/c6o/node-monorepo/commit/031e20bc25d3404155232a20a8dfc78b5256d042))


### ♻️ Chores

* **system:** Updated folder icon ([fae65c1](https://github.com/c6o/node-monorepo/commit/fae65c1770f61635335e88837b56e8ebe0b3c57e))
* Updated gitHead ([2045140](https://github.com/c6o/node-monorepo/commit/2045140b6ae8bc2e4504ff7756b7a8776c087609))





## [0.0.3](https://github.com/c6o/node-monorepo/compare/v0.0.2...v0.0.3) (2020-08-08)


### ✨ Features

* **system:** support arbitrary NPM registries ([#9](https://github.com/c6o/node-monorepo/issues/9)) ([461dd68](https://github.com/c6o/node-monorepo/commit/461dd68f338534b31c7241cf6b6c9234c8a42d4c))


### 🐛 Bug Fixes

* Parcel compile warnings ([b6dc3d3](https://github.com/c6o/node-monorepo/commit/b6dc3d3a1952dc6eb9344d201eff31c9812f3112))
* **grafana:** Added port name to grafana service ([6fed947](https://github.com/c6o/node-monorepo/commit/6fed947b8ef0888e78ca6347e3502501ca59406e))
* **NavStation:** Improvements to Nav Station UI ([#14](https://github.com/c6o/node-monorepo/issues/14)) ([fccaf70](https://github.com/c6o/node-monorepo/commit/fccaf7057be6de5235267fe0bbf6dc5be29e583f))
* **validation:** Istio app installation form validations ([#10](https://github.com/c6o/node-monorepo/issues/10)) ([be191f1](https://github.com/c6o/node-monorepo/commit/be191f1f5927d0016062be4b0655381260acf5b7))


### ♻️ Chores

* Bumped kubeclient to 0.0.5 ([ba51a57](https://github.com/c6o/node-monorepo/commit/ba51a574b2a123bbe012be0086ec2ecbedcf487c))
* fixed kubeclient reference ([254e28c](https://github.com/c6o/node-monorepo/commit/254e28c552958233c9f8f59d614885258e8cf654))
* Licensing ([#17](https://github.com/c6o/node-monorepo/issues/17)) ([8b9cc24](https://github.com/c6o/node-monorepo/commit/8b9cc24ff42ff875b4234a74dfcfcfedb2acef27))
* Licensing and repo links ([#16](https://github.com/c6o/node-monorepo/issues/16)) ([b8b03bb](https://github.com/c6o/node-monorepo/commit/b8b03bbe7f30904b83cc599e61d378beb009eb38))
* Marked packages public ([39a328e](https://github.com/c6o/node-monorepo/commit/39a328e0225b2b773e173960f54f98052a698368))
* renamed settings element to c6o-system-settings-main ([d95456b](https://github.com/c6o/node-monorepo/commit/d95456bc1d88cb5c7a4427c5b3a98566f37e3fc5))
* UI cleanup for logging-elk provisioner ([#13](https://github.com/c6o/node-monorepo/issues/13)) ([12e6b27](https://github.com/c6o/node-monorepo/commit/12e6b27070609762bcbe110a7ec3cb145d97e3f1))
* Updated lerna config ([6e031a3](https://github.com/c6o/node-monorepo/commit/6e031a34f5d8ab64ba9c5e87f49be148d3ca8221))
* **global:** Refactor k8s and docker tags and provisioners from traxitt to c6o ([#11](https://github.com/c6o/node-monorepo/issues/11)) ([28d612c](https://github.com/c6o/node-monorepo/commit/28d612caa09cb79c0ec2525593d367a03e63ca09))
* **istio:** Fix marina icon ([#18](https://github.com/c6o/node-monorepo/issues/18)) ([a77d678](https://github.com/c6o/node-monorepo/commit/a77d6786fe100513740c2648063e9c50092fa09a))
* **node-red:** Added storageClass ([95a1419](https://github.com/c6o/node-monorepo/commit/95a1419d74fddcae72aa808075524829bd005822))
* Move all our packages to the same version of lit-element ([#15](https://github.com/c6o/node-monorepo/issues/15)) ([013dbd6](https://github.com/c6o/node-monorepo/commit/013dbd6377a1f52f5a3a71885e7935e0c4984a21))
* **system:** reverted settings name ([1612393](https://github.com/c6o/node-monorepo/commit/16123931c637e750dc22e71bae7bd2665bb04b51))





## [0.0.2](https://github.com/traxitt/node-monorepo/compare/v0.0.1...v0.0.2) (2020-07-17)


### Bug Fixes

* **oauth:** Fixed codezero OAuth icon URL ([7355f6e](https://github.com/traxitt/node-monorepo/commit/7355f6e7d2212555ccd32148d4faed424fe55db0))
* **prometheus:** Prometheus app has some hardcoded namespaces to 'monitoring' ([#3](https://github.com/traxitt/node-monorepo/issues/3)) ([0bc31ae](https://github.com/traxitt/node-monorepo/commit/0bc31aed88f801d16fff30522d1abc410af11b51))
* **store:** Updated store App manifest to new launch tag ([948371d](https://github.com/traxitt/node-monorepo/commit/948371d4d76d2cdc5367d34f726a51901d187076))
* **system:** Added codezero.cloud to cluster domains ([d87f0a1](https://github.com/traxitt/node-monorepo/commit/d87f0a14c745a38c88b609d2bf7db2f74c679815))
* **system:** CLI had incorrect cluster domain ([783bf9e](https://github.com/traxitt/node-monorepo/commit/783bf9e6481025125d96da409eaa72ccc68e138b))
* **system:** CodeZero OAuth icon url ([a62af63](https://github.com/traxitt/node-monorepo/commit/a62af63800eb272d8cd61221071eaaedc8512ef9))


### Features

* **dock:** Added dock CRD and default value ([#4](https://github.com/traxitt/node-monorepo/issues/4)) ([546ec8e](https://github.com/traxitt/node-monorepo/commit/546ec8e0183d04d05d40d350bec07c12a97e9b1c))
* **update:** Ability to update System and all other Apps ([#1](https://github.com/traxitt/node-monorepo/issues/1)) ([1003432](https://github.com/traxitt/node-monorepo/commit/100343214beec1029436da470cb67249d7cbbf79))





## 0.0.1 (2020-07-04)

**Note:** Though this is not the start of our journey, this is were we start versioning.
