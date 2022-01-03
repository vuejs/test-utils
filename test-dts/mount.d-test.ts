import { expectError, expectType } from './index'
import {
  ComponentOptions,
  DefineComponent,
  defineComponent,
  FunctionalComponent,
  getCurrentInstance,
  h,
  ref,
  SetupContext,
  Prop,
  VNodeChild
} from 'vue'
import { Options, Vue } from 'vue-class-component'
import { mount } from '../src'

const AppWithDefine = defineComponent({
  props: {
    a: {
      type: String,
      required: true
    },
    b: Number
  },
  template: ''
})

// accept props - vm is properly typed
expectType<string>(
  mount(AppWithDefine, {
    props: { a: 'Hello', b: 2 }
  }).vm.a
)

// accept propsData - vm is properly typed
expectType<string>(
  mount(AppWithDefine, {
    propsData: { a: 'Hello', b: 2 }
  }).vm.a
)

// // no data provided
// expectError(
//   mount(AppWithDefine, {
//     data() {
//       return {
//         myVal: 1
//       }
//     }
//   })
// )

// allow extra props, like using `h()`
mount(AppWithDefine, {
  props: { a: 'Hello', c: 2 }
})

expectError(
  // @ts-expect-error wrong prop type should not compile
  mount(AppWithDefine, {
    props: { a: 2 }
  })
)

const AppWithProps = {
  props: {
    a: {
      type: String,
      required: true
    }
  },
  template: ''
}

// accept props - vm is properly typed
expectType<string>(
  mount(AppWithProps, {
    props: { a: 'Hello' }
  }).vm.a
)

mount(AppWithProps, {
  props: { a: 'Hello', b: 2 }
})

expectError(
  mount(AppWithProps, {
    // @ts-expect-error wrong prop type should not compile
    props: { a: 2 }
  })
)

const AppWithArrayProps = {
  props: ['a'],
  template: ''
}

// accept props - vm is properly typed
expectType<string>(
  mount(AppWithArrayProps, {
    props: { a: 'Hello' }
  }).vm.a
)

// can receive extra props
// as they are declared as `string[]`
expectType<number>(
  mount(AppWithArrayProps, {
    props: { a: 'Hello', b: 2 }
  }).vm.b
)

// allow extra props, like using `h()`
mount(
  {
    props: ['a']
  },
  {
    props: {
      b: 2
    }
  }
)

const AppWithoutProps = {
  template: ''
}

// allow extra props, like using `h()`
mount(AppWithoutProps, {
  props: { b: 'Hello' }
})

// Functional tests

// @ts-expect-error wrong props
expectError((props: { a: 1 }) => {}, {
  props: {
    a: '222'
  }
})

expectType<number>(
  mount((props: { a: number }, ctx) => {}, {
    props: {
      a: 22
    }
  }).vm.a
)

// global config should accept a partial config
mount(AppWithProps, {
  props: { a: 'Hello' },
  global: {
    config: {
      isCustomElement: (tag: string) => true
    }
  }
})

declare const ShimComponent: DefineComponent

mount(ShimComponent, {
  props: {
    msg: 1
  }
})

// TODO it should work
mount(ShimComponent, {
  data() {
    return {
      a: 1
    }
  }
})

// functional components
declare const FunctionalComponent: FunctionalComponent<{
  bar: string
  level: number
}>
declare const FunctionalComponentEmit: FunctionalComponent<
  {
    bar: string
    level: number
  },
  { hello: (foo: string, bar: string) => void }
>

mount(FunctionalComponent)
mount(defineComponent(FunctionalComponent))

mount(FunctionalComponentEmit)

// @ts-ignore vue 3.0.2 doesn't work. FIX: https://github.com/vuejs/vue-next/pull/2494
mount(defineComponent(FunctionalComponentEmit))

// class component

@Options({
  props: {
    msg: String
  }
})
class ClassComponent extends Vue {
  dataText: string = ''
  get computedMsg(): string {
    return `Message: ${(this.$props as any).msg}`
  }

  changeMessage(text: string): void {
    this.dataText = 'Updated'
  }
}

// @ts-expect-error changeMessage expects an argument
expectError(mount(ClassComponent, {}).vm.changeMessage())
mount(ClassComponent, {}).vm.changeMessage('')

// region standard class component implement
class StandardClassComponent<Props extends {} = {}> {
  static defaultProps?: Record<string, Prop<any>> | string[]
  private static __vccValue?: ComponentOptions
  static get __vccOpts(): ComponentOptions {
    if (this.__vccValue) return this.__vccValue
    const CompConstructor = this
    return (this.__vccValue = {
      name: CompConstructor.name,
      props: CompConstructor.defaultProps,
      setup(props, ctx) {
        const instance = new CompConstructor()
        return instance.render.bind(instance)
      }
    })
  }
  constructor() {
    const instance = getCurrentInstance()!
    this.props = instance.props as Props
    // @ts-expect-error no explicit setupContext on instance
    this.context = instance.setupContext as SetupContext
  }

  props: Props
  get $props() {
    return this.props
  }
  context: SetupContext
  render(): VNodeChild {}
}
class NoPropClassComponent extends StandardClassComponent {
  count = ref(0)
  changeCount(count: number) {
    this.count.value = count
  }
  render() {
    return h('div', `hello world ${this.count.value}`)
  }
}

// @ts-expect-error changeCount expects an argument
expectError(mount(NoPropClassComponent, {}).vm.changeCount())
mount(NoPropClassComponent, {}).vm.changeCount(2)

interface WithProp_Props {
  size: 'small' | 'large'
  age?: number
}

class WithPropClassComponent extends StandardClassComponent<WithProp_Props> {
  static defaultProps: (keyof WithProp_Props)[] = ['size', 'age']
  count = ref(0)
  changeCount(count: number) {
    this.count.value = count
  }
  render() {
    return h('div', `hello world ${this.count.value}${this.props.size}`)
  }
}

expectError(
  // @ts-expect-error should has props error
  mount<WithPropClassComponent, WithProp_Props>(WithPropClassComponent, {
    props: {}
  })
)
mount<WithPropClassComponent, WithProp_Props>(WithPropClassComponent, {
  props: { size: 'small' }
})

// endregion

// default props
const Foo = defineComponent({
  props: {
    bar: Boolean,
    baz: String
  },
  template: ''
})

mount(Foo, {
  props: {
    baz: 'hello'
  }
})

mount(Foo, {
  props: {
    bar: true
  }
})

expectError(
  mount(
    // @ts-expect-error
    defineComponent({
      props: {
        baz: String,
        bar: {
          type: Boolean,
          required: true
        }
      }
    }),
    {
      props: {
        baz: 'hello'
      }
    }
  )
)
