import { Probe } from '../../parsing'

export function getProbeTemplate(probe: Probe) {

  if (probe.hasOwnProperty('type')) probe.type = 'startup'

  //root of the site
  if (!probe.hasOwnProperty('path') || probe.path === '') probe.path = '/'

  //do a HTTP GET
  if (!probe.hasOwnProperty('httpType')) probe.httpType = 'httpGet'

  let p = {}
  p[`${probe.type}Probe`] = {}
  const probeConfig = p[`${probe.type}Probe`]

  //only set the values if they are defined and not equal to the defaults
  if (probe.hasOwnProperty('failureThreshold') && probe.failureThreshold != probeConfig.failureThreshold)
    probeConfig.failureThreshold = probe.failureThreshold

  if (probe.hasOwnProperty('initialDelaySeconds') && probe.initialDelaySeconds != probeConfig.initialDelaySeconds)
    probeConfig.initialDelaySeconds = probe.initialDelaySeconds

  if (probe.hasOwnProperty('periodSeconds') && probe.periodSeconds != probeConfig.periodSeconds)
    probeConfig.periodSeconds = probe.periodSeconds

  if (probe.hasOwnProperty('timeoutSeconds') && probe.timeoutSeconds != probeConfig.timeoutSeconds)
    probeConfig.timeoutSeconds = probe.timeoutSeconds

  if (probe.hasOwnProperty('successThreshold') && probe.successThreshold != probeConfig.successThreshold)
    probeConfig.successThreshold = probe.successThreshold

  probeConfig[probe.httpType] = {}

  if(probe.hasOwnProperty('path')) probeConfig[probe.httpType].path = probe.path
  if(probe.hasOwnProperty('port')) probeConfig[probe.httpType].port = probe.port
  if(probe.hasOwnProperty('httpHeaders')) probeConfig[probe.httpType].httpHeaders = probe.httpHeaders
  if(probe.hasOwnProperty('host')) probeConfig[probe.httpType].host = probe.host
  if(probe.hasOwnProperty('scheme')) probeConfig[probe.httpType].scheme = probe.scheme

  return p
}
