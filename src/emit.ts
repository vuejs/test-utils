import type {
  ComponentInternalInstance,
  ComponentPublicInstance,
  devtools
} from 'vue'
import { setDevtoolsHook } from 'vue'
import { getGlobalThis } from './utils'

type Events<T = unknown> = Record<number, Record<string, T[]>>

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

const events: Events = {}
const recordedUidsByRoot = new Map<number, Set<number>>()

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

function captureDevtoolsVueComponentEmitEvent(
  eventType: string,
  payload: any[]
) {
  if (eventType === DevtoolsHooks.COMPONENT_EMIT) {
    const [_, componentVM, event, eventArgs] = payload
    recordEvent(componentVM, event, eventArgs)
  }
}

// devtools hook only catches Vue component custom events,
// and forwards to the global devtools hook if there is one
function createDevTools(): any {
  return {
    emit(eventType, ...payload) {
      captureDevtoolsVueComponentEmitEvent(eventType, payload)
      getGlobalThis().__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.(
        eventType,
        ...payload
      )
    },
    cleanupBuffer(component) {
      const hook = getGlobalThis().__VUE_DEVTOOLS_GLOBAL_HOOK__
      // Vue only emits `component:removed` to hooks implementing cleanupBuffer
      return hook?.cleanupBuffer ? hook.cleanupBuffer(component) : true
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
  const rootCid = wrapperVm.root.uid

  if (!recordedUidsByRoot.has(rootCid)) {
    recordedUidsByRoot.set(rootCid, new Set())
  }
  recordedUidsByRoot.get(rootCid)!.add(cid)

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
  const rootCid = vm.$.root.uid
  const uids = recordedUidsByRoot.get(rootCid)
  if (!uids) return

  for (const uid of uids) {
    delete events[uid]
  }
  recordedUidsByRoot.delete(rootCid)
}
