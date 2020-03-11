# Istio Provisioner


Current Hub manifest for web install must be set as follows:

```json
{
    "_id" : "01E12NGHHHRFZ7HPBSXE3FZ78F",
    "name" : "istio",
    "namespace" : "istio",
    "spec" : {
        "services" : [ 
            {
                "istio" : {
                    "ingressEnabled" : true,
                    "citadelEnabled" : false,
                    "telemetryEnabled" : false,
                    "grafanaEnabled" : false,
                    "kialiEnabled" : false,
                    "prometheusEnabled" : false,
                    "grafanaAdminUsername" : "admin",
                    "grafanaAdminPassword" : "admin"
                }
            }
        ]
    },
    "admin" : [ 
        "01DV7D6VPG0XYBX7S5AF8RXE53"
    ],
    "read" : [],
    "write" : [],
    "createdOn" : ISODate("2020-02-14T20:16:17.970Z")
}
```

# Generating the scripts

When upgrading to use a newer version of Istio, you will need to regenerate the istio provisioning scripts in order to ensure they're configured and separated properly for the istio provisioner, including the namespace tokens.

## Setup your istio path if it isn't already
Be sure to point to the correct Istio folder and version.  `export PATH=$PATH:.../istio-1.x.x/bin`

## Run the generation script
`cd build`
`./gen.sh`

## Check in the results
Review the .yaml files (inside of the k8s folder) and then commit the latest istio provisioning files.