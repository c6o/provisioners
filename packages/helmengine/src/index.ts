import { mix } from 'mixwith'
import { baseProvisionerType as AppEngineType, Provisioner as AppEngine } from '@provisioner/appengine'

import {
    createApplyMixin,
    removeApplyMixin,
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & AppEngineType

export interface Provisioner extends AppEngine { }

export class Provisioner extends mix(AppEngine).with(createApplyMixin, removeApplyMixin) {
}