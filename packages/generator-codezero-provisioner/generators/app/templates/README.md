# <%= applicationName %> Provisioner for CodeZero

This project is a provisioner to install and manage <%= applicationName %> in CodeZero.

## Running This Locally

To run this provisioner, you will need a Kubernetes cluster up and running, with CodeZero installed.  Head over to https://hub.codezero.io/ to get started.

Then, from this project folder, you can use the CodeZero CLI to test the provisioner.

```
export KUBECONFIG=/path/to/your/cluster-config.yaml
<%= npmCmd %> install
<%= npmCmd %> run build
<%= npmCmd %> run provision
```