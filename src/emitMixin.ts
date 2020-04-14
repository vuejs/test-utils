import { getCurrentInstance, App } from 'vue'

export const attachEventListener = (vm: App) => {
  const emitMixin = {
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

  vm.mixin(emitMixin)
}
