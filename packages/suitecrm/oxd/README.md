# OXD Docker Image

SuiteCRM's OIDC module depends on a running service called OXD.  This dockerfile runs a basic instance of OXD on version 3.1.4.

See links below for more details:

1. https://github.com/GluuFederation/suitecrm-oxd-module
1. https://gluu.org/docs/oxd/3.1.4/plugin/suitecrm/

## To Build

```bash
docker build -t c6oio/oxd-server-3.1.4
docker push c6oio/oxd-server-3.1.4
```
