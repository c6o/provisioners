
# Generating the scripts

When upgrading to use a newer version of cert-manager, you will need to regenerate the cert-manager provisioning scripts.

## Run the generation script
`cd build`
`./gen.sh`

## Check in the results
Review the .yaml files (inside of the k8s folder) and then commit the latest provisioning files.