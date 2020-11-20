rm ./appengine/lib -rf
rm ./appengine/tsconfig.tsbuildinfo -f
yarn build --scope @provisioner/appengine
