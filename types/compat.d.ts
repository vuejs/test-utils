declare module '@vue/compat' {
  export * from 'vue'
  export function extend<T>(options: T): T

  export function configureCompat(
    option: Record<string, boolean | string | number>
  ): void
}
