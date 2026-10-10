import { defineComponent } from 'vue'

/**
 * Renders its default slot content in place, without teleporting it to
 * a target element.
 *
 * Use it to opt in to a Teleport replacement that behaves closer to the
 * real component: `global: { stubs: { Teleport: TeleportStub } }`.
 * Unlike the default teleport stub, child components rendered inside
 * `TeleportStub` are not unmounted and remounted when the parent
 * re-renders.
 */
export const TeleportStub = defineComponent({
  name: 'TeleportStub',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.({}) ?? null
  }
})
