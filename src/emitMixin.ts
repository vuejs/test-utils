import { setDevtoolsHook, ComponentPublicInstance } from 'vue'

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

export const attachEmitListener = (vm: ComponentPublicInstance) => {
  let events: Record<string, unknown[]> = {}
  ;(vm as any).__emitted = events
  // use devtools capture this "emit"
  setDevtoolsHook(createDevTools(events))
}

function createDevTools(events) {
  const devTools: any = {
    emit(type, ...payload) {
      if (type !== DevtoolsHooks.COMPONENT_EMIT) return

      // The first argument is root component
      // The second argument is  vm
      // The third argument is event
      // The fourth argument is args of event
      recordEvent(events, payload[2], payload[3])
      wrapperWarn()
    }
  }

  return devTools
}

function recordEvent(events, event, args) {
  // Record the event message sent by the emit
  // Stored by a vm
  // emitted by a subsequent wrapper.emitted
  // An event object and a vm.__emitted is a reference
  events[event]
    ? (events[event] = [...events[event], [...args]])
    : (events[event] = [[...args]])
}
