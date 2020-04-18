import { getCurrentInstance } from 'vue'

export const attachEmitListener = () => {
  return {
    beforeCreate() {
      let events: Record<string, unknown[]> = {}
      this.__emitted = events

      getCurrentInstance().emit = (event: string, ...args: unknown[]) => {
        events[event]
          ? (events[event] = [...events[event], [...args]])
          : (events[event] = [[...args]])

        return [event, ...args]
      }
    }
  }
}
