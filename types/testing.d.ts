import type { Router } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $t: (key: string) => string
  }
}
