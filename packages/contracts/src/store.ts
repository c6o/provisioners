export type StoreFlowItem = StoreFlowStep | StoreFlowScreen
export type StoreFlowEntry = string | StoreFlowItem

export interface StoreFlowMediator {
    applicationSpec: any
    getServiceSpec(serviceName: string): any
    appendFlow(...entries: StoreFlowEntry[])
}

export interface StoreFlowStep {
    skipMediatorRender?: boolean
    mediator?: StoreFlowMediator
    begin?(): Promise<void>
    end?(): Promise<boolean>
}

export interface StoreFlowScreen extends StoreFlowStep {
    render
}