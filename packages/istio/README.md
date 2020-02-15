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