export type StoreFlowItem = StoreFlowStep | StoreFlowScreen | StoreFlowService
export type StoreFlowEntry = string | StoreFlowItem

export interface StoreFlowMediator {
    applicationSpec: any
    getServiceSpec(serviceName: string): any

    appendFlow(...entries: StoreFlowEntry[])
}

export interface StoreFlowStep {
    mediator?: StoreFlowMediator

    begin?(): Promise<void>
    end?(): Promise<boolean>
}

export interface StoreFlowService extends StoreFlowStep {
    service: string
    config?: any
}

export interface StoreFlowScreen extends StoreFlowStep {
    render
}