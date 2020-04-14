import { getCurrentInstance } from 'vue'

export const createEmitMixin = () => {
  const events: Record<string, unknown[]> = {}

  const emitMixin = {
    beforeCreate() {
      getCurrentInstance().emit = (event: string, ...args: unknown[]) => {
        events[event]
          ? (events[event] = [...events[event], [...args]])
          : (events[event] = [[...args]])

        return [event, ...args]
      }
    }
  }

  return {
    events,
    emitMixin
  }
}
