import { getCurrentInstance } from 'vue'

export const attachEmitListener = () => {
  return {
    beforeCreate() {
      let events: Record<string, unknown[]> = {}
      ;(this as any).__emitted = events
      const originalEmit = getCurrentInstance()!.emit
      getCurrentInstance()!.emit = (event: string, ...args: unknown[]) => {
        events[event]
          ? (events[event] = [...events[event], [...args]])
          : (events[event] = [[...args]])

        // Vue will warn you if you emit an event that is not declared in `emits` and
        // if the parent is not listening for that event.
        // since we intercept the event, we are never listening for it explicitly on the
        // Parent component. Swallow those events then restore the console.warn.
        // TODO: find out if this is doable using `app.config.warnHandler` (does not appear
        // work right now). https://github.com/vuejs/vue-test-utils-next/issues/197
        const consoleWarnSave = console.warn
        console.warn = (msg: string, ...rest: unknown[]) => {
          if (msg.includes('[Vue warn]: Component emitted event')) {
            return
          } else {
            consoleWarnSave(msg, ...rest)
          }
        }
        originalEmit(event, ...args)
        console.warn = consoleWarnSave
        return [event, ...args]
      }
    }
  }
}
