import {
  h,
  createApp,
  defineComponent,
  reactive,
  shallowReactive,
  isRef,
  AppConfig,
  ComponentOptions,
  ConcreteComponent,
  DefineComponent
} from 'vue'

import { MountingOptions, Slot } from './types'
import {
  isFunctionalComponent,
  isObjectComponent,
  mergeGlobalProperties
} from './utils'
import { processSlot } from './utils/compileSlots'
import { attachEmitListener } from './emit'
import { stubComponents, addToDoNotStubComponents, registerStub } from './stubs'
import {
  isLegacyFunctionalComponent,
  unwrapLegacyVueExtendComponent
} from './utils/vueCompatSupport'

const MOUNT_OPTIONS: Array<keyof MountingOptions<any>> = [
  'attachTo',
  'attrs',
  'data',
  'props',
  'slots',
  'global',
  'shallow'
]

function getInstanceOptions(
  options: MountingOptions<any> & Record<string, any>
): Record<string, any> {
  if (options.methods) {
    console.warn(
      "Passing a `methods` option to mount was deprecated on Vue Test Utils v1, and it won't have any effect on v2. For additional info: https://vue-test-utils.vuejs.org/upgrading-to-v1/#setmethods-and-mountingoptions-methods"
    )
    delete options.methods
  }

  const resultOptions = { ...options }
  for (const key of Object.keys(options)) {
    if (MOUNT_OPTIONS.includes(key as keyof MountingOptions<any>)) {
      delete resultOptions[key]
    }
  }
  return resultOptions
}

// implementation
export function createInstance(
  inputComponent: DefineComponent<{}, {}, any>,
  options?: MountingOptions<any> & Record<string, any>
) {
  // normalize the incoming component
  const originalComponent = unwrapLegacyVueExtendComponent(inputComponent)
  let component: ConcreteComponent
  const instanceOptions = getInstanceOptions(options ?? {})

  if (
    isFunctionalComponent(originalComponent) ||
    isLegacyFunctionalComponent(originalComponent)
  ) {
    component = defineComponent({
      compatConfig: {
        MODE: 3,
        INSTANCE_LISTENERS: false,
        INSTANCE_ATTRS_CLASS_STYLE: false,
        COMPONENT_FUNCTIONAL: isLegacyFunctionalComponent(originalComponent)
          ? 'suppress-warning'
          : false
      },
      props: originalComponent.props || {},
      setup:
        (props, { attrs, slots }) =>
        () =>
          h(originalComponent, { ...props, ...attrs }, slots),
      ...instanceOptions
    })
    addToDoNotStubComponents(originalComponent)
  } else if (isObjectComponent(originalComponent)) {
    component = { ...originalComponent, ...instanceOptions }
  } else {
    component = originalComponent
  }

  addToDoNotStubComponents(component)
  registerStub({ source: originalComponent, stub: component })
  const el = document.createElement('div')

  if (options?.attachTo) {
    let to: Element | null
    if (typeof options.attachTo === 'string') {
      to = document.querySelector(options.attachTo)
      if (!to) {
        throw new Error(
          `Unable to find the element matching the selector ${options.attachTo} given as the \`attachTo\` option`
        )
      }
    } else {
      to = options.attachTo
    }

    to.appendChild(el)
  }

  function slotToFunction(slot: Slot) {
    switch (typeof slot) {
      case 'function':
        return slot
      case 'object':
        return () => h(slot)
      case 'string':
        return processSlot(slot)
      default:
        throw Error(`Invalid slot received.`)
    }
  }

  // handle any slots passed via mounting options
  const slots =
    options?.slots &&
    Object.entries(options.slots).reduce(
      (
        acc: { [key: string]: Function },
        [name, slot]: [string, Slot]
      ): { [key: string]: Function } => {
        if (Array.isArray(slot)) {
          const normalized = slot.map(slotToFunction)
          acc[name] = (args: unknown) => normalized.map((f) => f(args))
          return acc
        }

        acc[name] = slotToFunction(slot)
        return acc
      },
      {}
    )

  // override component data with mounting options data
  if (options?.data) {
    const providedData = options.data()
    if (isObjectComponent(originalComponent)) {
      // component is guaranteed to be the same type as originalComponent
      const objectComponent = component as ComponentOptions
      const originalDataFn = originalComponent.data || (() => ({}))
      objectComponent.data = (vm) => ({
        ...originalDataFn.call(vm, vm),
        ...providedData
      })
    } else {
      throw new Error(
        'data() option is not supported on functional and class components'
      )
    }
  }

  const MOUNT_COMPONENT_REF = 'VTU_COMPONENT'
  // we define props as reactive so that way when we update them with `setProps`
  // Vue's reactivity system will cause a rerender.
  const refs = shallowReactive<Record<string, unknown>>({})
  const props = reactive<Record<string, unknown>>({})

  Object.entries({
    ...options?.attrs,
    ...options?.propsData,
    ...options?.props,
    ref: MOUNT_COMPONENT_REF
  }).forEach(([k, v]) => {
    if (isRef(v)) {
      refs[k] = v
    } else {
      props[k] = v
    }
  })

  const global = mergeGlobalProperties(options?.global)
  if (isObjectComponent(component)) {
    component.components = { ...component.components, ...global.components }
  }

  // create the wrapper component
  const Parent = defineComponent({
    name: 'VTU_ROOT',
    render() {
      return h(component as ComponentOptions, { ...props, ...refs }, slots)
    }
  })

  // create the app
  const app = createApp(Parent)
  // the Parent type must not be stubbed
  // but we can't add it directly, as createApp creates a copy
  // and store it in app._component (since v3.2.32)
  // So we store this one instead
  addToDoNotStubComponents(app._component)

  // add tracking for emitted events
  // this must be done after `createApp`: https://github.com/vuejs/test-utils/issues/436
  attachEmitListener()

  // global mocks mixin
  if (global?.mocks) {
    const mixin = {
      beforeCreate() {
        for (const [k, v] of Object.entries(
          global.mocks as { [key: string]: any }
        )) {
          ;(this as any)[k] = v
        }
      }
    }

    app.mixin(mixin)
  }

  // AppConfig
  if (global.config) {
    for (const [k, v] of Object.entries(global.config) as [
      keyof Omit<AppConfig, 'isNativeTag'>,
      any
    ][]) {
      app.config[k] = v
    }
  }

  // use and plugins from mounting options
  if (global.plugins) {
    for (const plugin of global.plugins) {
      if (Array.isArray(plugin)) {
        app.use(plugin[0], ...plugin.slice(1))
        continue
      }
      app.use(plugin)
    }
  }

  // use any mixins from mounting options
  if (global.mixins) {
    for (const mixin of global.mixins) app.mixin(mixin)
  }

  if (global.components) {
    for (const key of Object.keys(global.components)) {
      // avoid registering components that are stubbed twice
      if (!(key in global.stubs)) {
        app.component(key, global.components[key])
      }
    }
  }

  if (global.directives) {
    for (const key of Object.keys(global.directives))
      app.directive(key, global.directives[key])
  }

  // provide any values passed via provides mounting option
  if (global.provide) {
    for (const key of Reflect.ownKeys(global.provide)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      app.provide(key, global.provide[key])
    }
  }

  // stubs
  // even if we are using `mount`, we will still
  // stub out Transition and Transition Group by default.
  stubComponents(global.stubs, options?.shallow, global?.renderStubDefaultSlot)

  // users expect stubs to work with globally registered
  // components so we register stubs as global components to avoid
  // warning about not being able to resolve component
  //
  // component implementation provided here will never be called
  // but we need name to make sure that stubComponents will
  // properly stub this later by matching stub name
  //
  // ref: https://github.com/vuejs/test-utils/issues/249
  // ref: https://github.com/vuejs/test-utils/issues/425
  if (global?.stubs) {
    for (const name of Object.keys(global.stubs)) {
      if (!app.component(name)) {
        app.component(name, { name })
      }
    }
  }

  return {
    app,
    el,
    props,
    MOUNT_COMPONENT_REF
  }
}
