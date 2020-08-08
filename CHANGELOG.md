# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
