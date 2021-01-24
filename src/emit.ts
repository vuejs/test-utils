import { setDevtoolsHook, devtools } from 'vue'

const enum DevtoolsHooks {
  COMPONENT_EMIT = 'component:emit'
}

let events: Record<string, unknown[]>

export function emitted<T = unknown>(
  eventName?: string
): T[] | Record<string, T[]> {
  if (eventName) {
    const emitted = (events as Record<string, T[]>)[eventName]
    return emitted
  }

  return events as Record<string, T[]>
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

      // The first argument is root component
      // The second argument is  vm
      // The third argument is event
      // The fourth argument is args of event
      recordEvent(events, payload[2], payload[3])
    }
  }

  return devTools
}

function recordEvent(events, event, args) {
  // Record the event message sent by the emit
  events[event]
    ? (events[event] = [...events[event], [...args]])
    : (events[event] = [[...args]])
}
