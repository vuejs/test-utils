import type { Router, RouteLocation } from 'vue-router'

declare module 'vue' {
  interface ComponentCustomProperties {
    $route: RouteLocation
    $router: Router
    $t: (key: string) => string
  }
}
