import { setDevtoolsHook, devtools, ComponentPublicInstance } from 'vue'

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

let componentEvents: Record<string, unknown[]>
let events: Record<string, typeof componentEvents>

export function emitted<T = unknown>(
  vm: ComponentPublicInstance,
  eventName?: string
): T[] | Record<string, T[]> {
  const cid = vm.$.uid

  const vmEvents = (events as Record<string, Record<string, T[]>>)[cid] || {}
  if (eventName) {
    const emitted = vmEvents
      ? (vmEvents as Record<string, T[]>)[eventName]
      : undefined
    return emitted
  }

  return vmEvents as Record<string, T[]>
}

export const attachEmitListener = () => {
  events = {}
  // use devtools to capture this "emit"
  setDevtoolsHook(createDevTools(events))
}

function createDevTools(events): any {
  const devTools: Partial<typeof devtools> = {
    emit(eventType, ...payload) {
      if (eventType !== DevtoolsHooks.COMPONENT_EMIT) return

      const [rootVM, componentVM, event, eventArgs] = payload
      recordEvent(events, componentVM, event, eventArgs)
    }
  }

  return devTools
}

function recordEvent(events, vm, event, args): void {
  // Functional component wrapper creates a parent component
  let wrapperVm = vm
  while (typeof wrapperVm.type === 'function') wrapperVm = wrapperVm.parent

  const cid = wrapperVm.uid
  if (!(cid in events)) {
    events[cid] = {}
  }
  if (!(event in events[cid])) {
    events[cid][event] = []
  }

  // Record the event message sent by the emit
  events[cid][event].push(args)
}
