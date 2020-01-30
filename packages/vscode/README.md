# VS Code Provisioner

## Build
At the root of the traxitt node-monorepo:

```bash
yarn build --scope=@provisioner/vscode
```

## Run from CLI

To run the provisioner, create a `traxitt.yaml` file, for example:

```yaml
name: vscode
namespace: vscode
version: 0.0.1
description: This is the installer spec for the vscode remote development environment
services:
    - vscode:
        launch: true                # default false/undefined
        storage: 4Gi                # default 4Gi
        publicKey: "public rsa key" # default undefined
```

Drop it into a directory like `~/provisioners/vscode`, then execute

```bash
traxitt provision ~/provisioners/vscode
```

To test out VSCode once it's installed in a cluster:

``` bash
code --folder-uri vscode-remote://ssh-remote%2Broot@${externalIP}/data
```

Where the IP address is the IP address of the provisioned LoadBalancer external IP.  To get this (for example):

```
kubectl get svc -n vscode

NAME              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
dev-pod-ssh-svc   LoadBalancer   10.245.81.114   138.197.236.7   22:30579/TCP     2m56s
dev-pod-svc       NodePort       10.245.66.7     <none>          3030:30361/TCP   2m55s
```

## Parameters

| Parameter | Meaning |
| --------- | ------- |
| launch | true to launch VSCode from traxitt CLI |
| storage | PVC storage for development |
| publicKey | contents of ssh public key used for authentication.  If not defined, provisioner copies `id_rsa.pub` from `~/.ssh` |

## Server paths

The provisioner module `serve` method handles HTTP requets for an express server.  The serve function supports the following paths:

| Path | Contents |
| --------- | ------- |
| index.js | implementation of `<vscode-capacity>` for use in the configuration wizard |
