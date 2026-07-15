import { expectError, expectType } from './index'
import type { DefineComponent, SlotsType, VNode } from 'vue'
import { FunctionalComponent, defineComponent } from 'vue'
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
  mount(AppWithDefine, {
    // @ts-expect-error wrong prop type should not compile
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
} as const

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
} as const

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

expectError(
  mount((props: { a: 1 }) => {}, {
    props: {
      // @ts-expect-error wrong props
      a: '222'
    }
  })
)

expectType<number>(
  mount((props: { a: number }, ctx: any) => {}, {
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
mount(defineComponent(FunctionalComponentEmit))

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
      // @ts-expect-error
      props: {
        baz: 'hello'
      }
    }
  )
)

// slots
const SetupComponentWithSlots = defineComponent<
  {
    hello: string
  },
  {
    hallo: () => void
  },
  string,
  SlotsType<{
    foo: () => VNode[]
    bar: () => VNode[]
    baz: () => VNode[]
  }>
>((): any => {})

// optional slots
mount(SetupComponentWithSlots, {})

mount(SetupComponentWithSlots, {
  slots: {}
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo'
  }
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo',
    bar: 'bar'
  }
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo',
    bar: 'bar',
    baz: 'baz'
  }
})

// extra slots
mount(SetupComponentWithSlots, {
  slots: {
    // @ts-expect-error - This slot doesn't exist in the component and it should be reported.
    extraSlot: 'nonExistentSlot'
  }
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo',
    // @ts-expect-error - This slot doesn't exist in the component and it should be reported.
    extraSlot: 'nonExistentSlot'
  }
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo',
    bar: 'bar',
    // @ts-expect-error - This slot doesn't exist in the component and it should be reported.
    extraSlot: 'nonExistentSlot'
  }
})

mount(SetupComponentWithSlots, {
  slots: {
    foo: 'foo',
    bar: 'bar',
    baz: 'baz',
    // @ts-expect-error - This slot doesn't exist in the component and it should be reported.
    extraSlot: 'nonExistentSlot'
  }
})
