import { Probe } from '../../parsing';


//factory, the called should not care the type of probe
//this method will decide the handler for the probe type
export function getProbeTemplate(probe: Probe) {
  if(!probe.type || probe.type === '') probe.type = 'startup'

  if(probe.type === 'startup')
    return getStartupProbeTemplate(probe)

  return
}
function getStartupProbeTemplate(probe: Probe) {

  //5 minutes
  if(!probe.failureThreshold || probe.failureThreshold <= 0) probe.failureThreshold = 30
  if(!probe.periodSeconds || probe.periodSeconds <= 0) probe.periodSeconds = 10

  //root of the site
  if(!probe.path || probe.path === '') probe.path = '/'

  //do a HTTP GET
  if(!probe.httpType) probe.httpType = 'httpGet'

  const p = {
    startupProbe: {
      failureThreshold: probe.failureThreshold,
      periodSeconds: probe.periodSeconds
    }
  }

  p.startupProbe[probe.httpType] = {
    'path': probe.path,
    'port': probe.port
  }


// startupProbe:
// httpGet:
//   path: /healthz
//   port: liveness-port
// failureThreshold: 30
// periodSeconds: 10

  return p
}