#!/bin/sh

# deployment
curl -L "https://github.com/jetstack/cert-manager/releases/download/v0.13.1/cert-manager.yaml" -o ../k8s/cert-manager.yaml
