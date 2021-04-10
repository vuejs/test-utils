import {
  setDevtoolsHook,
  devtools,
  ComponentPublicInstance,
  ComponentInternalInstance
} from 'vue'
import { VModel } from './vmodel'

type Events<T = unknown> = Record<number, Record<string, T[]>>

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

let events: Events

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

export const attachEmitListener = (vmodels: Map<string, VModel<any>>) => {
  events = {}
  // use devtools to capture this "emit"
  setDevtoolsHook(createDevTools(events, vmodels))
}

// devtools hook only catches Vue component custom events
function createDevTools(
  events: Events,
  vmodels: Map<string, VModel<any>>
): any {
  return {
    emit(eventType, ...payload) {
      if (eventType !== DevtoolsHooks.COMPONENT_EMIT) return

      const [rootVM, componentVM, event, eventArgs] = payload
      recordEvent(componentVM, event, eventArgs, vmodels)
    }
  } as Partial<typeof devtools>
}

export const recordEvent = (
  vm: ComponentInternalInstance,
  event: string,
  args: unknown[],
  vmodels?: Map<string, VModel<any>>
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

  // update vmodel
  if (event.startsWith('update:')) {
    const prop = event.slice(7)
    const vmodel = vmodels?.get(prop)
    if (vmodel) {
      if (args.length !== 1) {
        throw new Error(
          'Two-way bound properties have to emit a single value. ' +
            args.length +
            ' values given.'
        )
      }
      const v = args[0]
      vmodel.value.value = v
      vmodel.onChange?.(v)
    } else {
      // should we warn here?
    }
  }

  // Record the event message sent by the emit
  events[cid][event].push(args)
}
