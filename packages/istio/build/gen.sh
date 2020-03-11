#!/bin/sh

# CRDs
istioctl manifest generate --set profile=minimal --set trafficManagement.enabled=false --set defaultNamespace=istio-default-namespace > tmp-out.yaml
sed '/# CertManager component is disabled/,$d' tmp-out.yaml > ../k8s/crds.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/crds.yaml
sed -i '' 's/istio-ingress-namespace/{{istioIngressNamespace}}/g' ../k8s/crds.yaml

# autoInjection
cp istioplane.yaml tmp.yaml
echo "  autoInjection:\n    enabled: true\n    components:\n      namespace: istio-autoinject-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/autoinject.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/autoinject.yaml
sed -i '' 's/istio-autoinject-namespace/{{istioInjectNamespace}}/g' ../k8s/autoinject.yaml

# configManagement
cp istioplane.yaml tmp.yaml
echo "  configManagement:\n    enabled: true\n    components:\n      namespace: istio-galley-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/galley.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/galley.yaml
sed -i '' 's/istio-galley-namespace/{{istioGalleyNamespace}}/g' ../k8s/galley.yaml

# coreDNS
cp istioplane.yaml tmp.yaml
echo "  coreDNS:\n    enabled: true\n    components:\n      namespace: istio-coredns-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/coredns.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/coredns.yaml
sed -i '' 's/istio-coredns-namespace/{{istioCoreDnsNamespace}}/g' ../k8s/coredns.yaml

# gateway
cp istioplane-ingress.yaml tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/gateway.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/gateway.yaml
sed -i '' 's/istio-gateway-namespace/{{istioGatewayNamespace}}/g' ../k8s/gateway.yaml

# policy
cp istioplane.yaml tmp.yaml
echo "  policy:\n    enabled: true\n    components:\n      namespace: istio-policy-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/policy.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/policy.yaml
sed -i '' 's/istio-policy-namespace/{{istioPolicyNamespace}}/g' ../k8s/policy.yaml

# security
cp istioplane.yaml tmp.yaml
echo "  security:\n    enabled: true\n    components:\n      namespace: istio-citadel-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/citadel.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/citadel.yaml
sed -i '' 's/istio-citadel-namespace/{{istioCitadelNamespace}}/g' ../k8s/citadel.yaml

# trafficManagement
cp istioplane.yaml tmp.yaml
echo "  trafficManagement:\n    enabled: true\n    components:\n      namespace: istio-traffic-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/traffic.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/traffic.yaml
sed -i '' 's/istio-traffic-namespace/{{istioTrafficNamespace}}/g' ../k8s/traffic.yaml

# telemetry
cp istioplane.yaml tmp.yaml
echo "  telemetry:\n    enabled: true\n    components:\n      namespace: istio-telemetry-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/telemetry.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/telemetry.yaml
sed -i '' 's/istio-telemetry-namespace/{{istioTelemetryNamespace}}/g' ../k8s/telemetry.yaml

# grafana
cp istioplane.yaml tmp.yaml
echo "    grafana:\n      enabled: true\n      components:\n        namespace: istio-grafana-namespace" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/grafana.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/grafana.yaml
sed -i '' 's/istio-grafana-namespace/{{istioGrafanaNamespace}}/g' ../k8s/grafana.yaml

# prometheus
cp istioplane.yaml tmp.yaml
echo "    prometheus:\n      enabled: true" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/prometheus.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/prometheus.yaml
sed -i '' 's/istio-prometheus-namespace/{{istioPrometheusNamespace}}/g' ../k8s/prometheus.yaml

# kiali
cp istioplane.yaml tmp.yaml
echo "    kiali:\n      enabled: true" >> tmp.yaml
istioctl manifest generate -f tmp.yaml > tmp-out.yaml
sed '/# CertManager component is disabled/,$!d' tmp-out.yaml > ../k8s/kiali.yaml
sed -i '' 's/istio-default-namespace/{{istioNamespace}}/g' ../k8s/kiali.yaml
sed -i '' 's/istio-kiali-namespace/{{istioKialiNamespace}}/g' ../k8s/kiali.yaml

# cleanup
rm tmp-out.yaml
rm tmp.yaml
