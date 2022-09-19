import {
  setDevtoolsHook,
  devtools,
  ComponentPublicInstance,
  ComponentInternalInstance
} from 'vue'

type Events<T = unknown> = Record<number, Record<string, T[]>>

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

let events: Events = {}

export function emitted<T = unknown>(
  vm: ComponentPublicInstance,
  eventName?: string
): undefined | T[] | Record<string, T[]> {
  const cid = vm.$.uid

  const vmEvents: Record<string, T[]> = (events as Events<T>)[cid] || {}
  if (eventName) {
    return vmEvents ? vmEvents[eventName] : undefined
  }

  return vmEvents
}

export const attachEmitListener = () => {
  // use devtools to capture this "emit"
  setDevtoolsHook(createDevTools(), {})
}

// devtools hook only catches Vue component custom events
function createDevTools(): any {
  return {
    emit(eventType, ...payload) {
      if (eventType !== DevtoolsHooks.COMPONENT_EMIT) return

      const [_, componentVM, event, eventArgs] = payload
      recordEvent(componentVM, event, eventArgs)
    }
  } as Partial<typeof devtools>
}

export const recordEvent = (
  vm: ComponentInternalInstance,
  event: string,
  args: unknown[]
): void => {
  // Functional component wrapper creates a parent component
  let wrapperVm = vm
  while (typeof wrapperVm?.type === 'function') wrapperVm = wrapperVm.parent!

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

export const removeEventHistory = (vm: ComponentPublicInstance): void => {
  const cid = vm.$.uid
  delete events[cid]
}
