import type { Router } from 'vue-router'

declare module 'vue' {
  interface ComponentCustomProperties {
    $router: Router
    $t: (key: string) => string
  }
}
