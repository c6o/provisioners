# Logging Provisioner

This logging app installs Elasticsearch, Logstash, and Kibana (ELK stack) and with Fluentd in your cluster.

## Parameters

| Parameter | Meaning |
| --------- | ------- |
| storage | Persistent volume storage space (defaults to 1Gi)

## Notes

1. Elasticsearch listens at "elasticsearch.[namespace].svc.cluster.local:9200" (RESTful)
1. Kibana listens at "http://kibana.[namespace].svc.cluster.local:5601"

## Background

1. [How To Set Up an Elasticsearch, Fluentd and Kibana (EFK) Logging Stack on Kubernetes](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-elasticsearch-fluentd-and-kibana-efk-logging-stack-on-kubernetes)
1. [Configuring the elasticsearch output plugin](https://docs.fluentd.org/output/elasticsearch#hosts-(optional))
