# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.29](https://github.com/c6o/provisioners/compare/v0.0.28...v0.0.29) (2021-06-09)


### ♻️ Chores

* Added cli helpers ([#253](https://github.com/c6o/provisioners/issues/253)) ([7dfee98](https://github.com/c6o/provisioners/commit/7dfee984866c85666988c5283f75f174a6e93206))
* Bumped czbundle ([35ddfb7](https://github.com/c6o/provisioners/commit/35ddfb7f4134abd45c176e7db6578a3c07846dc2))
* Bumped kubeclient ([e9410b3](https://github.com/c6o/provisioners/commit/e9410b3dd57cc4bc0df5ef211cc4de534e3814aa))
* Re-factored build system ([#252](https://github.com/c6o/provisioners/issues/252)) ([7a7dcbe](https://github.com/c6o/provisioners/commit/7a7dcbe5a76ed785d0e8331614d569b696585177))
* Refactored ProvisionerManager. Migrated provisioners ([#246](https://github.com/c6o/provisioners/issues/246)) ([dfa682f](https://github.com/c6o/provisioners/commit/dfa682f90b096dd3009b782f57a740fe13896bda))
* removed reference to tslib ([#250](https://github.com/c6o/provisioners/issues/250)) ([b3bdbd6](https://github.com/c6o/provisioners/commit/b3bdbd6a1fae75be3eb4d6db8db461b3b0cd4ba3))
* Using kubeclient-resources ([#243](https://github.com/c6o/provisioners/issues/243)) ([7a2ffea](https://github.com/c6o/provisioners/commit/7a2ffea1ddb106a2f693e3b940e0a29c61a3c6e5))





## [0.0.28](https://github.com/c6o/provisioners/compare/v0.0.27...v0.0.28) (2021-03-31)


### ✨ Features

* **answers file:** Ability to specific an answers file during install of an app ([#223](https://github.com/c6o/provisioners/issues/223)) ([3d332fe](https://github.com/c6o/provisioners/commit/3d332fe887c87e38ba550351c8a0e706e7f8271e))


### ♻️ Chores

* Give AppEngine form inputs the 'compact' theme for better screen layout ([#198](https://github.com/c6o/provisioners/issues/198)) ([4c7d2c6](https://github.com/c6o/provisioners/commit/4c7d2c6e3278ec875ce298f77a0bfe044913ec20))





## [0.0.27](https://github.com/c6o/provisioners/compare/v0.0.26...v0.0.27) (2021-02-03)


### ✨ Features

* **mongo:** Support for secretRefs and configMapRefs. Migrated mongo based provisioners ([#158](https://github.com/c6o/provisioners/issues/158)) ([00304f2](https://github.com/c6o/provisioners/commit/00304f28e5044dc59567b93f9909939ea74e5b31))


### 🐛 Bug Fixes

* **AppEngine:** add fsGroup to security context to fix [#182](https://github.com/c6o/provisioners/issues/182) ([#183](https://github.com/c6o/provisioners/issues/183)) ([f456230](https://github.com/c6o/provisioners/commit/f4562308cc8c9682440861f7466e7848cb875626))
* AppEngine fails on ConfigMap with boolean or numeric values ([#181](https://github.com/c6o/provisioners/issues/181)) ([23fa9d4](https://github.com/c6o/provisioners/commit/23fa9d45d61c21d00c8f20af7b56b315f44c7905))
* **app-engine:** Secrets getting skipped ([acb0a0b](https://github.com/c6o/provisioners/commit/acb0a0b201acc3dc8debdd4166414ebeed8c711e))


### 📦 Code Refactoring

* **appengine:** Using contracts and using inquire flow in cli and UI ([#156](https://github.com/c6o/provisioners/issues/156)) ([4d612b9](https://github.com/c6o/provisioners/commit/4d612b909ac4eaa0ecddf3355363e7429e517204))


### ♻️ Chores

* Bumped kubeclient to 0.0.8. Removed local reference ([cc755f2](https://github.com/c6o/provisioners/commit/cc755f266ecd8322d3a31c292237da96b4db4b04))
* Using mergeWith to manage labels ([#185](https://github.com/c6o/provisioners/issues/185)) ([d37071f](https://github.com/c6o/provisioners/commit/d37071f6457ce1b4f3c300d5c10d860c79e75ae0))
* **appengine-upgrade:** Continue with the Web UI for appengine upgrades ([e592561](https://github.com/c6o/provisioners/commit/e59256169ee0dba0f7b94d6f2046ba9f307105c1))
* **contracts:** Split labels between App and AppEngine contracts ([8e4671e](https://github.com/c6o/provisioners/commit/8e4671ee732eb302f603987c488890db219eaace))
* **refactor manifests:** Initial refactor of all manifests ([#178](https://github.com/c6o/provisioners/issues/178)) ([67b39cb](https://github.com/c6o/provisioners/commit/67b39cb6e9277fe16d932ae16454e64ae39f6788))
* Migrated databases to use flow ([#157](https://github.com/c6o/provisioners/issues/157)) ([341a92f](https://github.com/c6o/provisioners/commit/341a92f534ea7e9c2b0ec27007b2a0dbeab6dbc2))





## [0.0.26](https://github.com/c6o/provisioners/compare/v0.0.25...v0.0.26) (2021-01-01)


### 🐛 Bug Fixes

* **appengine:** Duct taped skip handling ([6707b6b](https://github.com/c6o/provisioners/commit/6707b6bd0d4fe9d7a89a5656b1f80f132700915a))
* **appengine:** Re-removed merged code for handleNext ([a3073c1](https://github.com/c6o/provisioners/commit/a3073c1338a29f23f0b600919dff2453196bba4a))
* Skip advancing the index if skipping an install screen ([b7861ac](https://github.com/c6o/provisioners/commit/b7861aca80a3ceb5328bffefd06792247bcbddd8))


### ♻️ Chores

* Cleaned up tsconfig/package.json. Updated kubeclient to 0.0.7 ([#152](https://github.com/c6o/provisioners/issues/152)) ([5edc89a](https://github.com/c6o/provisioners/commit/5edc89a41bdd305c9f3650691454e8dfb32d128f))
* Very small code style update. "e" is typically used in our code to represent an event. ([70e4f85](https://github.com/c6o/provisioners/commit/70e4f8580fb657c7436d55b797f591b852b83e32))
* **bugbash:** Fixed more provisioners ([#146](https://github.com/c6o/provisioners/issues/146)) ([e5226f8](https://github.com/c6o/provisioners/commit/e5226f8786700b255c2d4b9cb95010449822394a))





## [0.0.25](https://github.com/c6o/provisioners/compare/v0.0.24...v0.0.25) (2020-12-18)


### ♻️ Chores

* Adding back some CSS for styling app engine ([109556b](https://github.com/c6o/provisioners/commit/109556bd6728db1cdfae41dc14b38fad347f4406))





## [0.0.24](https://github.com/c6o/provisioners/compare/v0.0.23...v0.0.24) (2020-12-15)


### 🐛 Bug Fixes

* **marina:** App name for GetInfo dialogs ([978cffa](https://github.com/c6o/provisioners/commit/978cffae97fe376f842f532305803687c41bde42))





## [0.0.23](https://github.com/c6o/provisioners/compare/v0.0.22...v0.0.23) (2020-12-10)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.22](https://github.com/c6o/provisioners/compare/v0.0.21...v0.0.22) (2020-12-09)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.21](https://github.com/c6o/provisioners/compare/v0.0.20...v0.0.21) (2020-12-08)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.20](https://github.com/c6o/provisioners/compare/v0.0.19...v0.0.20) (2020-12-04)


### 🐛 Bug Fixes

* More work on the app engine UI ([98bf253](https://github.com/c6o/provisioners/commit/98bf25318b1235d1c22014991a59799484bb9aef))


### ♻️ Chores

* Some UI cleanup to the app engine provisioner ([ad25f8f](https://github.com/c6o/provisioners/commit/ad25f8f472fe0ccb2f10db33537e2181486d6465))





## [0.0.19](https://github.com/c6o/provisioners/compare/v0.0.18...v0.0.19) (2020-11-20)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.18](https://github.com/c6o/provisioners/compare/v0.0.17...v0.0.18) (2020-11-19)


### 🐛 Bug Fixes

* **scope vs status:** Manifest had incorrect label for property scope vs status. ([#98](https://github.com/c6o/provisioners/issues/98)) ([cdae10c](https://github.com/c6o/provisioners/commit/cdae10cce61ad8b1c2d9995a74096990e5de40a1))


### ♻️ Chores

* **appengine-bug:** fixed bug with appengine ([#97](https://github.com/c6o/provisioners/issues/97)) ([2f0cc7e](https://github.com/c6o/provisioners/commit/2f0cc7e751bad6c4e33188e15d682c3c9ae05322))





## [0.0.17](https://github.com/c6o/provisioners/compare/v0.0.16...v0.0.17) (2020-11-05)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.16](https://github.com/c6o/provisioners/compare/v0.0.15...v0.0.16) (2020-10-30)


### ✨ Features

* **app engine web ui:** Added more capabilities and bug fixes to app engine ([#91](https://github.com/c6o/provisioners/issues/91)) ([e6c4d41](https://github.com/c6o/provisioners/commit/e6c4d41965741be6f1641c9b99b8199d3a94617f))





## [0.0.15](https://github.com/c6o/provisioners/compare/v0.0.14...v0.0.15) (2020-10-23)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.14](https://github.com/c6o/provisioners/compare/v0.0.13...v0.0.14) (2020-10-23)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.13](https://github.com/c6o/provisioners/compare/v0.0.12...v0.0.13) (2020-10-22)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.12](https://github.com/c6o/provisioners/compare/v0.0.11...v0.0.12) (2020-10-22)

**Note:** Version bump only for package @provisioner/appengine





## [0.0.11](https://github.com/c6o/provisioners/compare/v0.0.10...v0.0.11) (2020-10-21)


### ♻️ Chores

* **labels:** Enabled support for enahced standardized labels. ([#83](https://github.com/c6o/provisioners/issues/83)) ([d660fde](https://github.com/c6o/provisioners/commit/d660fdef3066a8820d615ef637200a60c9bb3dbf))
* **metadata:** Continued to flesh out more metadata for apps ([#86](https://github.com/c6o/provisioners/issues/86)) ([32aca28](https://github.com/c6o/provisioners/commit/32aca2857c5bd618632782b4f48849a35bfe9442))
* **metadata:** Updated metadata on provisioners. ([#87](https://github.com/c6o/provisioners/issues/87)) ([44fb60a](https://github.com/c6o/provisioners/commit/44fb60abf7647b8393a390554f14fd4a767bcf49))





## [0.0.10](https://github.com/c6o/provisioners/compare/v0.0.9...v0.0.10) (2020-10-15)

**Note:** Version bump only for package @provisioner/appengine
