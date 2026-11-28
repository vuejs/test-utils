import { expectType } from './index'
import { type ComponentMountingOptions, type VaporWrapper, mount } from '../src'
import type { DefineComponent, DirectiveBinding, VNode } from 'vue'

// No Vue 3.6-only types: published declarations must also work on Vue 3.5.
declare const Component: DefineComponent<{ label: string }>
const vdomOptions: ComponentMountingOptions<typeof Component> = {
  props: { label: 'test' }
}
expectType<string>(mount(Component, vdomOptions).props('label'))

// @ts-expect-error Vapor does not support slots passed to mount().
mount(Component, { experimentalVapor: true, slots: { default: 'slot' } })

const wrapper = mount(Component, {
  experimentalVapor: true,
  props: { label: 'test' }
})
expectType<VaporWrapper>(wrapper)
expectType<Record<string, unknown>>(wrapper.vm)
expectType<unknown>(wrapper.vm.count)
// @ts-expect-error Exposed bindings are unknown, not a full public instance.
expectType<unknown>(wrapper.vm.$el.tagName)
wrapper.setProps({ label: 'new' })
// @ts-expect-error Props are typed.
wrapper.setProps({ label: 1 })

// Shape of a compiled <script setup vapor> component with defineExpose().
declare const ScriptSetup: (
  props: { label: string },
  ctx: any,
  expose: (exposed: { count: number }) => void
) => any
const exposed = mount(ScriptSetup, {
  experimentalVapor: true,
  props: { label: 'test' }
})
expectType<number>(exposed.vm.count)
// @ts-expect-error Only exposed bindings are typed.
expectType<unknown>(exposed.vm.$el)

// Structural signature: also checks compatibility without Vue 3.6-only imports.
const vaporDirective = (
  el: HTMLElement,
  getter?: () => string,
  arg?: () => string,
  modifiers?: Partial<Record<string, boolean>>
) => {
  el.textContent = `${arg?.()}:${getter?.()}:${modifiers?.strong}`
  return () => {}
}
mount(Component, {
  experimentalVapor: true,
  props: { label: 'test' },
  global: {
    directives: {
      named: vaporDirective,
      inline(el, getter, arg, modifiers) {
        expectType<(() => any) | undefined>(getter)
        expectType<(() => any) | undefined>(arg)
        expectType<Partial<Record<string, boolean>> | undefined>(modifiers)
        el.textContent = getter?.()
      }
    }
  }
})

// VDOM directives keep their existing binding and VNode arguments.
mount(Component, {
  props: { label: 'test' },
  global: {
    directives: {
      inline(_el, binding, vnode, previous) {
        expectType<DirectiveBinding>(binding)
        expectType<VNode>(vnode)
        expectType<VNode | null>(previous)
      },
      object: {
        mounted: (_el, binding) => expectType<DirectiveBinding>(binding)
      }
    }
  }
})

// @ts-expect-error Vapor directives require explicit opt-in.
mount(Component, { global: { directives: { vapor: vaporDirective } } })
