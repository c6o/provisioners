# Node-RED provisioner

This is a super simple provisioner.

To test out Node-RED once it's running in a DO cluster:

``` bash
kubectl -n node-red-ns port-forward services/node-red 1880:1880
```