import { Probe } from "../../parsing";


//factory, the called should not care the type of probe
//this method will decide the handler for the probe type
export function getProbeTemplate(probe: Probe) {
  if(!probe.type || probe.type === '') probe.type = 'startup'

  if(probe.type === 'startup')
    return this.getStartupProbeTemplate(probe)

  return
}
function getStartupProbeTemplate(probe: Probe) {

  //5 minutes
  if(probe.failureThreshold <= 0) probe.failureThreshold = 30
  if(probe.periodSeconds <= 0) probe.periodSeconds = 10

  //root of the site
  if(!probe.path) probe.path = '/'

  //do a HTTP GET
  if(!probe.httpType) probe.path = 'httpGet'

  const p = {
    "startupProbe": {
      "failureThreshold": probe.failureThreshold,
      "periodSeconds": probe.periodSeconds
    }
  }

  p[probe.httpType] = {
    "path": probe.path,
    "port": probe.port
  }

  return p
}