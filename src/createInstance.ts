import {
  h,
  createApp,
  defineComponent,
  reactive,
  shallowReactive,
  ref,
  AppConfig,
  ComponentOptions,
  ConcreteComponent,
  DefineComponent,
  transformVNodeArgs
} from 'vue'

import { MountingOptions, Slot } from './types'
import {
  getComponentsFromStubs,
  getDirectivesFromStubs,
  isFunctionalComponent,
  isObject,
  isObjectComponent,
  isScriptSetup,
  mergeGlobalProperties
} from './utils'
import { processSlot } from './utils/compileSlots'
import { attachEmitListener } from './emit'
import { registerStub } from './stubs'
import {
  isLegacyFunctionalComponent,
  unwrapLegacyVueExtendComponent
} from './utils/vueCompatSupport'
import { createVNodeTransformer } from './vnodeTransformers/util'
import {
  createStubComponentsTransformer,
  CreateStubComponentsTransformerConfig
} from './vnodeTransformers/stubComponentsTransformer'
import { createStubDirectivesTransformer } from './vnodeTransformers/stubDirectivesTransformer'
import { isDeepRef } from './utils/isDeepRef'

const MOUNT_OPTIONS: ReadonlyArray<keyof MountingOptions<any>> = [
  'attachTo',
  'attrs',
  'data',
  'props',
  'slots',
  'global',
  'shallow'
] as const

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
  inputComponent: DefineComponent<{}, {}, any, any, any, any>,
  options?: MountingOptions<any> & Record<string, any>
) {
  // normalize the incoming component
  const originalComponent = unwrapLegacyVueExtendComponent(inputComponent)
  let component: ConcreteComponent
  const instanceOptions = getInstanceOptions(options ?? {})

  const rootComponents: CreateStubComponentsTransformerConfig['rootComponents'] =
    {}

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
    rootComponents.functional = originalComponent
  } else if (isObjectComponent(originalComponent)) {
    component = { ...originalComponent, ...instanceOptions }
  } else {
    component = originalComponent
  }

  rootComponents.component = component
  // We've just replaced our component with its copy
  // Let's register it as a stub so user can find it
  registerStub({ source: originalComponent, stub: component })

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
    if (isDeepRef(v)) {
      refs[k] = v
    } else {
      props[k] = v
    }
  })

  const global = mergeGlobalProperties(options?.global)
  if (isObjectComponent(component)) {
    component.components = { ...component.components, ...global.components }
  }

  const componentRef = ref(null)
  // create the wrapper component
  const Parent = defineComponent({
    name: 'VTU_ROOT',
    setup() {
      return {
        [MOUNT_COMPONENT_REF]: componentRef
      }
    },
    render() {
      return h(component as ComponentOptions, { ...props, ...refs }, slots)
    }
  })

  // create the app
  const app = createApp(Parent)

  // add tracking for emitted events
  // this must be done after `createApp`: https://github.com/vuejs/test-utils/issues/436
  attachEmitListener()

  // global mocks mixin
  if (global?.mocks) {
    const mixin: ComponentOptions = {
      beforeCreate() {
        // we need to differentiate components that are or not not `script setup`
        // otherwise we run into a proxy set error
        // due to https://github.com/vuejs/core/commit/f73925d76a76ee259749b8b48cb68895f539a00f#diff-ea4d1ddabb7e22e17e80ada458eef70679af4005df2a1a6b73418fec897603ceR404
        // introduced in Vue v3.2.45
        // Also ensures not to include option API components in this block
        // since they can also have setup state but need to be patched using
        // the regular method.
        if (isScriptSetup(this)) {
          // add the mocks to setupState
          for (const [k, v] of Object.entries(
            global.mocks as { [key: string]: any }
          )) {
            // we do this in a try/catch, as some properties might be read-only
            try {
              this.$.setupState[k] = v
              // eslint-disable-next-line no-empty
            } catch (e) {}
          }
          // also intercept the proxy calls to make the mocks available on the instance
          // (useful when a template access a global function like $t and the developer wants to mock it)
          // eslint-disable-next-line no-extra-semi
          ;(this.$ as any).proxy = new Proxy((this.$ as any).proxy, {
            get(target, key) {
              if (key in global.mocks) {
                return global.mocks[key as string]
              }
              return target[key]
            }
          })
        } else {
          for (const [k, v] of Object.entries(
            global.mocks as { [key: string]: any }
          )) {
            // eslint-disable-next-line no-extra-semi
            ;(this as any)[k] = v
          }
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
      app.config[k] = isObject(app.config[k])
        ? Object.assign(app.config[k]!, v)
        : v
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
  transformVNodeArgs(
    createVNodeTransformer({
      rootComponents,
      transformers: [
        createStubComponentsTransformer({
          rootComponents,
          stubs: getComponentsFromStubs(global.stubs),
          shallow: options?.shallow,
          renderStubDefaultSlot: global.renderStubDefaultSlot
        }),
        createStubDirectivesTransformer({
          directives: getDirectivesFromStubs(global.stubs)
        })
      ]
    })
  )

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
    for (const name of Object.keys(getComponentsFromStubs(global.stubs))) {
      if (!app.component(name)) {
        app.component(name, { name })
      }
    }
  }

  return {
    app,
    props,
    componentRef
  }
}
