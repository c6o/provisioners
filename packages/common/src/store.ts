
export type StoreFlowItem = StoreFlowStep | StoreFlowScreen
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

    beginChild?(entry: StoreFlowEntry): Promise<void>
    endChild?(entry: StoreFlowEntry): Promise<boolean>
}

export interface StoreFlowScreen extends StoreFlowStep {
    render
}

export function isTag(entry: StoreFlowEntry): entry is string {
    return typeof entry == 'string'
}

export function canRender(entry: StoreFlowEntry): entry is StoreFlowScreen {
    return (<StoreFlowScreen>entry).render != undefined
}
