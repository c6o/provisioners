# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.30](https://github.com/c6o/provisioners/compare/v0.0.29...v0.0.30) (2021-06-16)


### 🐛 Bug Fixes

* Remove UI-Theme CSS variables from provisioners ([#256](https://github.com/c6o/provisioners/issues/256)) ([08d7064](https://github.com/c6o/provisioners/commit/08d7064020e521c0f9c9b31e20e6ad17d7ab5e71))


### ♻️ Chores

* Bumped [@c6o](https://github.com/c6o)/bundle ([1e73420](https://github.com/c6o/provisioners/commit/1e7342005d9c8ca3046d8d1a9c8518f6df2483a8))





## [0.0.29](https://github.com/c6o/provisioners/compare/v0.0.28...v0.0.29) (2021-06-09)


### ♻️ Chores

* Bumped czbundle ([35ddfb7](https://github.com/c6o/provisioners/commit/35ddfb7f4134abd45c176e7db6578a3c07846dc2))
* Bumped kubeclient ([e9410b3](https://github.com/c6o/provisioners/commit/e9410b3dd57cc4bc0df5ef211cc4de534e3814aa))
* Re-factored build system ([#252](https://github.com/c6o/provisioners/issues/252)) ([7a7dcbe](https://github.com/c6o/provisioners/commit/7a7dcbe5a76ed785d0e8331614d569b696585177))
* Refactored ProvisionerManager. Migrated provisioners ([#246](https://github.com/c6o/provisioners/issues/246)) ([dfa682f](https://github.com/c6o/provisioners/commit/dfa682f90b096dd3009b782f57a740fe13896bda))
* Using kubeclient-resources ([#243](https://github.com/c6o/provisioners/issues/243)) ([7a2ffea](https://github.com/c6o/provisioners/commit/7a2ffea1ddb106a2f693e3b940e0a29c61a3c6e5))
* **kits:** moved kits files into provisioners/contracts ([#237](https://github.com/c6o/provisioners/issues/237)) ([8816669](https://github.com/c6o/provisioners/commit/8816669c0a1e779f03ff50ed0a6fbed12c437862))





## [0.0.28](https://github.com/c6o/provisioners/compare/v0.0.27...v0.0.28) (2021-03-31)


### ✨ Features

* **answers file:** Ability to specific an answers file during install of an app ([#223](https://github.com/c6o/provisioners/issues/223)) ([3d332fe](https://github.com/c6o/provisioners/commit/3d332fe887c87e38ba550351c8a0e706e7f8271e))
* **lifeboat:** Add lifeboat to the dock by default ([#203](https://github.com/c6o/provisioners/issues/203)) ([d56c031](https://github.com/c6o/provisioners/commit/d56c031f87e420cf134739ce1e19b9284ed300fa))
* **lifeboat:** Hook into c60-system [#179](https://github.com/c6o/provisioners/issues/179) ([e11e0e8](https://github.com/c6o/provisioners/commit/e11e0e81ed0d00426e7762c6b58dd6ba08a49e0e))





## [0.0.27](https://github.com/c6o/provisioners/compare/v0.0.26...v0.0.27) (2021-02-03)


### ✨ Features

* **c6o-system:** Ensure default namespace is managed by c6o ([#151](https://github.com/c6o/provisioners/issues/151)) ([88fe2de](https://github.com/c6o/provisioners/commit/88fe2deb0be898aa073a83eaa1b6ba0a29dc215d))
* **c6o-system:** Initial release of Harbour Master ([#154](https://github.com/c6o/provisioners/issues/154)) ([a500e7f](https://github.com/c6o/provisioners/commit/a500e7f5a0b9232ab7d6c58308b2280d7cdde1b2)), closes [#155](https://github.com/c6o/provisioners/issues/155) [#1239](https://github.com/c6o/provisioners/issues/1239)


### 🐛 Bug Fixes

* **istio:** Removed http routing from virtual service ([#184](https://github.com/c6o/provisioners/issues/184)) ([ab0c33e](https://github.com/c6o/provisioners/commit/ab0c33e74618d0c8a871fadec5ebc3829bb0495d))
* Removed reference to incorrect AppObject/AppDocument ([f988ede](https://github.com/c6o/provisioners/commit/f988ede1d5f38c632900169c11ead51a1af1c500))


### 📦 Code Refactoring

* **appengine:** Using contracts and using inquire flow in cli and UI ([#156](https://github.com/c6o/provisioners/issues/156)) ([4d612b9](https://github.com/c6o/provisioners/commit/4d612b909ac4eaa0ecddf3355363e7429e517204))


### ♻️ Chores

* **c6o-system:** Cleaned up host API ([0e00b11](https://github.com/c6o/provisioners/commit/0e00b114a0018f40ca57a97ab3646d5444dc0fae))
* Code formatting changes only! ([2df4e69](https://github.com/c6o/provisioners/commit/2df4e69ed0b6050e0f6f9ddbf8400273e7c8eff0))
* update Vaadin to 14.4.5 ([fa3cdde](https://github.com/c6o/provisioners/commit/fa3cddead8be2233dcf6960bb0191b535510e35f))





## [0.0.26](https://github.com/c6o/provisioners/compare/v0.0.25...v0.0.26) (2021-01-01)


### ♻️ Chores

* Cleaned up tsconfig/package.json. Updated kubeclient to 0.0.7 ([#152](https://github.com/c6o/provisioners/issues/152)) ([5edc89a](https://github.com/c6o/provisioners/commit/5edc89a41bdd305c9f3650691454e8dfb32d128f))





## [0.0.25](https://github.com/c6o/provisioners/compare/v0.0.24...v0.0.25) (2020-12-18)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.24](https://github.com/c6o/provisioners/compare/v0.0.23...v0.0.24) (2020-12-15)


### ♻️ Chores

* Add CMS env vars ([a56a7b9](https://github.com/c6o/provisioners/commit/a56a7b9dbffbc55c5254e2ebb2b3286916f57ef9))





## [0.0.23](https://github.com/c6o/provisioners/compare/v0.0.22...v0.0.23) (2020-12-10)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.22](https://github.com/c6o/provisioners/compare/v0.0.21...v0.0.22) (2020-12-09)


### ♻️ Chores

* Change hub.codezero.io to codezero.io ([#115](https://github.com/c6o/provisioners/issues/115)) ([218976c](https://github.com/c6o/provisioners/commit/218976c8dfb306a316ba304f7c1cd35d24655619))





## [0.0.21](https://github.com/c6o/provisioners/compare/v0.0.20...v0.0.21) (2020-12-08)


### ♻️ Chores

* **assets:** Removed assetsBaseURL ([#112](https://github.com/c6o/provisioners/issues/112)) ([b0d92b4](https://github.com/c6o/provisioners/commit/b0d92b40c44ec0821626a03e966d9478cbf03b1b))





## [0.0.20](https://github.com/c6o/provisioners/compare/v0.0.19...v0.0.20) (2020-12-04)


### 🐛 Bug Fixes

* **c6o-system:** Now you can install codezero over itself ([aee8fda](https://github.com/c6o/provisioners/commit/aee8fda47c7601a0b680e738afd9f6d250f8e9ce))





## [0.0.19](https://github.com/c6o/provisioners/compare/v0.0.18...v0.0.19) (2020-11-20)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.18](https://github.com/c6o/provisioners/compare/v0.0.17...v0.0.18) (2020-11-19)


### 🐛 Bug Fixes

* **assets:** Fixed casing in assets URL ([7e15883](https://github.com/c6o/provisioners/commit/7e1588366b0d3f0b9f26c916361d96a598c38293))





## [0.0.17](https://github.com/c6o/provisioners/compare/v0.0.16...v0.0.17) (2020-11-05)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.16](https://github.com/c6o/provisioners/compare/v0.0.15...v0.0.16) (2020-10-30)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.15](https://github.com/c6o/provisioners/compare/v0.0.14...v0.0.15) (2020-10-23)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.14](https://github.com/c6o/provisioners/compare/v0.0.13...v0.0.14) (2020-10-23)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.13](https://github.com/c6o/provisioners/compare/v0.0.12...v0.0.13) (2020-10-22)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.12](https://github.com/c6o/provisioners/compare/v0.0.11...v0.0.12) (2020-10-22)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.11](https://github.com/c6o/provisioners/compare/v0.0.10...v0.0.11) (2020-10-21)


### 🐛 Bug Fixes

* **store:** Incorrect icon ([01484d1](https://github.com/c6o/provisioners/commit/01484d135d1b5545d65980823e115103b26b01c7))





## [0.0.10](https://github.com/c6o/provisioners/compare/v0.0.9...v0.0.10) (2020-10-15)


### ♻️ Chores

* Added provisioning manifests to all apps ([f2cec4a](https://github.com/c6o/provisioners/commit/f2cec4a84c984885819cc93b6d781927885d7429))
* Created provisioning manifest ([c56f1fe](https://github.com/c6o/provisioners/commit/c56f1feebb54281fd895a320563184917447057c))





## [0.0.9](https://github.com/c6o/provisioners/compare/v0.0.8...v0.0.9) (2020-09-30)


### ✨ Features

* Added feature flag keys ([#79](https://github.com/c6o/provisioners/issues/79)) ([f7352e9](https://github.com/c6o/provisioners/commit/f7352e9010758f3d01fee6c3d1e76c293a56daaa))
* Made cluster accountName optional ([9ef0cc4](https://github.com/c6o/provisioners/commit/9ef0cc40f337262176811886d4a9ac214939fde4))


### 🐛 Bug Fixes

* **c6o-system:** Fixed bad RegEx for detecting system vs app requests ([9cb1b77](https://github.com/c6o/provisioners/commit/9cb1b774d315063b9f00f95c557a92c4b2d3450f))
* Show cluster namspace if name not available ([0ecf80e](https://github.com/c6o/provisioners/commit/0ecf80e87fe037abd6672712df79a9624aa2fc4c))





## [0.0.8](https://github.com/c6o/provisioners/compare/v0.0.7...v0.0.8) (2020-09-11)

**Note:** Version bump only for package @provisioner/c6o-system





## [0.0.7](https://github.com/c6o/provisioners/compare/v0.0.6...v0.0.7) (2020-09-03)


### 🐛 Bug Fixes

* **system:** preApp steps and new cluster creation status ([d9c2e32](https://github.com/c6o/provisioners/commit/d9c2e325277f08401c66f9b6373d06c97642767a))


### ♻️ Chores

* **hub:** Switch domain suffix for dev and staging to codezero.dev ([#35](https://github.com/c6o/provisioners/issues/35)) ([47042ab](https://github.com/c6o/provisioners/commit/47042abe504c2e4894ec7a71d41510dfe5516b69))
* Bumped gitHead ([15d30cf](https://github.com/c6o/provisioners/commit/15d30cf8f5386a58e2873cf2dd97fdc55f8f7cd2))





## [0.0.6](https://github.com/c6o/provisioners/compare/v0.0.5...v0.0.6) (2020-08-23)


### ♻️ Chores

* Bumped references ([798c6a3](https://github.com/c6o/provisioners/commit/798c6a3f7c826d04f2327a5cfae535f2dd3d04e8))





## [0.0.5](https://github.com/c6o/provisioners/compare/v0.0.4...v0.0.5) (2020-08-13)


### ♻️ Chores

* **c6o-system:** Upgrade system icon ([#21](https://github.com/c6o/provisioners/issues/21)) ([386b237](https://github.com/c6o/provisioners/commit/386b2374a08dda1ea1fab1ab2b7ca1e2225bde71))
* **system:** Added app labels ([5f22610](https://github.com/c6o/provisioners/commit/5f226103c6a67253c82964d8b578328731dc0d1b))
* Updated gitHead ([570855f](https://github.com/c6o/provisioners/commit/570855fb1f45f0e051dedccc2acef7b83375ebac))





## [0.0.4](https://github.com/c6o/provisioners/compare/v0.0.3...v0.0.4) (2020-08-10)


### ✨ Features

* **system:** ngrok support ([031e20b](https://github.com/c6o/provisioners/commit/031e20bc25d3404155232a20a8dfc78b5256d042))


### ♻️ Chores

* **system:** Updated folder icon ([fae65c1](https://github.com/c6o/provisioners/commit/fae65c1770f61635335e88837b56e8ebe0b3c57e))
* Updated gitHead ([2045140](https://github.com/c6o/provisioners/commit/2045140b6ae8bc2e4504ff7756b7a8776c087609))





## [0.0.3](https://github.com/c6o/provisioners/compare/v0.0.2...v0.0.3) (2020-08-08)


### 🐛 Bug Fixes

* Parcel compile warnings ([b6dc3d3](https://github.com/c6o/provisioners/commit/b6dc3d3a1952dc6eb9344d201eff31c9812f3112))
* **NavStation:** Improvements to Nav Station UI ([#14](https://github.com/c6o/provisioners/issues/14)) ([fccaf70](https://github.com/c6o/provisioners/commit/fccaf7057be6de5235267fe0bbf6dc5be29e583f))


### ♻️ Chores

* Bumped kubeclient to 0.0.5 ([ba51a57](https://github.com/c6o/provisioners/commit/ba51a574b2a123bbe012be0086ec2ecbedcf487c))
* Licensing ([#17](https://github.com/c6o/provisioners/issues/17)) ([8b9cc24](https://github.com/c6o/provisioners/commit/8b9cc24ff42ff875b4234a74dfcfcfedb2acef27))
* Licensing and repo links ([#16](https://github.com/c6o/provisioners/issues/16)) ([b8b03bb](https://github.com/c6o/provisioners/commit/b8b03bbe7f30904b83cc599e61d378beb009eb38))
* Marked packages public ([39a328e](https://github.com/c6o/provisioners/commit/39a328e0225b2b773e173960f54f98052a698368))
* **istio:** Fix marina icon ([#18](https://github.com/c6o/provisioners/issues/18)) ([a77d678](https://github.com/c6o/provisioners/commit/a77d6786fe100513740c2648063e9c50092fa09a))
* Move all our packages to the same version of lit-element ([#15](https://github.com/c6o/provisioners/issues/15)) ([013dbd6](https://github.com/c6o/provisioners/commit/013dbd6377a1f52f5a3a71885e7935e0c4984a21))
* renamed settings element to c6o-system-settings-main ([d95456b](https://github.com/c6o/provisioners/commit/d95456bc1d88cb5c7a4427c5b3a98566f37e3fc5))





## [0.0.2](https://github.com/traxitt/traxitt/compare/v0.0.1...v0.0.2) (2020-07-17)


### Bug Fixes

* **oauth:** Fixed codezero OAuth icon URL ([7355f6e](https://github.com/traxitt/traxitt/commit/7355f6e7d2212555ccd32148d4faed424fe55db0))
* **store:** Updated store App manifest to new launch tag ([948371d](https://github.com/traxitt/traxitt/commit/948371d4d76d2cdc5367d34f726a51901d187076))
* **system:** Added codezero.cloud to cluster domains ([d87f0a1](https://github.com/traxitt/traxitt/commit/d87f0a14c745a38c88b609d2bf7db2f74c679815))
* **system:** CLI had incorrect cluster domain ([783bf9e](https://github.com/traxitt/traxitt/commit/783bf9e6481025125d96da409eaa72ccc68e138b))
* **system:** CodeZero OAuth icon url ([a62af63](https://github.com/traxitt/traxitt/commit/a62af63800eb272d8cd61221071eaaedc8512ef9))


### Features

* **dock:** Added dock CRD and default value ([#4](https://github.com/traxitt/traxitt/issues/4)) ([546ec8e](https://github.com/traxitt/traxitt/commit/546ec8e0183d04d05d40d350bec07c12a97e9b1c))
* **update:** Ability to update System and all other Apps ([#1](https://github.com/traxitt/traxitt/issues/1)) ([1003432](https://github.com/traxitt/traxitt/commit/100343214beec1029436da470cb67249d7cbbf79))





## 0.0.1 (2020-07-04)

**Note:** Though this is not the start of our journey, this is were we start versioning.
