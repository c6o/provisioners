# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.30](https://github.com/nsainaney/traxitt/compare/v0.0.29...v0.0.30) (2021-06-16)

**Note:** Version bump only for package @provisioner/contracts





## [0.0.29](https://github.com/nsainaney/traxitt/compare/v0.0.28...v0.0.29) (2021-06-09)


### ✨ Features

* Added toKeyValues to Secretes and ConfigMap ([#254](https://github.com/nsainaney/traxitt/issues/254)) ([e91e835](https://github.com/nsainaney/traxitt/commit/e91e8353da98e1cf7d96211f8031d2df91d5c4fb))


### ♻️ Chores

* Added cli helpers ([#253](https://github.com/nsainaney/traxitt/issues/253)) ([7dfee98](https://github.com/nsainaney/traxitt/commit/7dfee984866c85666988c5283f75f174a6e93206))
* Bumped kubeclient ([e9410b3](https://github.com/nsainaney/traxitt/commit/e9410b3dd57cc4bc0df5ef211cc4de534e3814aa))
* Re-factored build system ([#252](https://github.com/nsainaney/traxitt/issues/252)) ([7a7dcbe](https://github.com/nsainaney/traxitt/commit/7a7dcbe5a76ed785d0e8331614d569b696585177))
* Refactored ProvisionerManager. Migrated provisioners ([#246](https://github.com/nsainaney/traxitt/issues/246)) ([dfa682f](https://github.com/nsainaney/traxitt/commit/dfa682f90b096dd3009b782f57a740fe13896bda))
* Using kubeclient-resources ([#243](https://github.com/nsainaney/traxitt/issues/243)) ([7a2ffea](https://github.com/nsainaney/traxitt/commit/7a2ffea1ddb106a2f693e3b940e0a29c61a3c6e5))
* **kits:** moved kits files into provisioners/contracts ([#237](https://github.com/nsainaney/traxitt/issues/237)) ([8816669](https://github.com/nsainaney/traxitt/commit/8816669c0a1e779f03ff50ed0a6fbed12c437862))
* **kits-contracts:** added volumes to the app object, updated attach request contract. ([#240](https://github.com/nsainaney/traxitt/issues/240)) ([855e7c9](https://github.com/nsainaney/traxitt/commit/855e7c9f2b27afe7f59992cfd5b11a4e7c4674d0))





## [0.0.28](https://github.com/nsainaney/traxitt/compare/v0.0.27...v0.0.28) (2021-03-31)


### ✨ Features

* **answers file:** Ability to specific an answers file during install of an app ([#223](https://github.com/nsainaney/traxitt/issues/223)) ([3d332fe](https://github.com/nsainaney/traxitt/commit/3d332fe887c87e38ba550351c8a0e706e7f8271e))


### 🐛 Bug Fixes

* Corrected app instanceId if name/namespace is undefined ([4f2e0a9](https://github.com/nsainaney/traxitt/commit/4f2e0a9d4e38d655ceb70ed97d61b7fa9609f658))


### ♻️ Chores

* **kits:** reorganize kits-contracts into provisioners. ([#231](https://github.com/nsainaney/traxitt/issues/231)) ([6b89e3f](https://github.com/nsainaney/traxitt/commit/6b89e3fa08e90e4303357053e404f90ac6006e9e))





## [0.0.27](https://github.com/nsainaney/traxitt/compare/v0.0.26...v0.0.27) (2021-02-03)


### ✨ Features

* **c6o-system:** Initial release of Harbour Master ([#154](https://github.com/nsainaney/traxitt/issues/154)) ([a500e7f](https://github.com/nsainaney/traxitt/commit/a500e7f5a0b9232ab7d6c58308b2280d7cdde1b2)), closes [#155](https://github.com/nsainaney/traxitt/issues/155) [#1239](https://github.com/nsainaney/traxitt/issues/1239)


### 🐛 Bug Fixes

* Added missing references ([6409cb7](https://github.com/nsainaney/traxitt/commit/6409cb7877df2f70b7b416c90ef0dd35e418f8fe))


### 📦 Code Refactoring

* **appengine:** Using contracts and using inquire flow in cli and UI ([#156](https://github.com/nsainaney/traxitt/issues/156)) ([4d612b9](https://github.com/nsainaney/traxitt/commit/4d612b909ac4eaa0ecddf3355363e7429e517204))


### ♻️ Chores

* Bumped kubeclient to 0.0.8. Removed local reference ([cc755f2](https://github.com/nsainaney/traxitt/commit/cc755f266ecd8322d3a31c292237da96b4db4b04))
* Using mergeWith to manage labels ([#185](https://github.com/nsainaney/traxitt/issues/185)) ([d37071f](https://github.com/nsainaney/traxitt/commit/d37071f6457ce1b4f3c300d5c10d860c79e75ae0))
* **contracts:** Split labels between App and AppEngine contracts ([8e4671e](https://github.com/nsainaney/traxitt/commit/8e4671ee732eb302f603987c488890db219eaace))
