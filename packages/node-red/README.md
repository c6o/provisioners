# Node-RED Provisioner

## Build

At the root of the c6o node-monorepo:

```bash
yarn build --scope=@provisioner/node-red
```

## Run from CLI

To run the provisioner, create a `traxitt.yaml` file, for example:

```yaml
name: node-red
version: 0.0.1
description: Node-RED provisioner
services:
  - node-red:
      storage: 2Gi      # default 1Gi
      projects: false   # default false
```

Drop it into a directory like `~/provisioners/node-red/traxitt.yaml`, then execute

```bash
czctl provision ~/provisioners/node-red
```

To test out Node-RED once it's running in a cluster:

``` bash
kubectl -n node-red-ns port-forward services/node-red 1880:1880
```

Then point your browser to `http://localhost:1880`

## Parameters

| Parameter | Meaning |
| --------- | ------- |
| storage | PVC storage for flows, and related storage needed by nodes.
| projects | when true, enables the Node-RED projects feature.  This use for flow development, not running flows |

## Server paths

The provisioner module `serve` method handles HTTP requets for an express server.  The serve function supports the following paths:

| Path | Contents |
| --------- | ------- |
| index.js | implementation of `<nodered-capacity>` for use in the configuration wizard |
