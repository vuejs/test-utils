import { expectError, expectType } from 'tsd'
import {
  DefineComponent,
  defineComponent,
  FunctionalComponent,
  reactive
} from 'vue'
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

// can not receive extra props
expectError(
  mount(AppWithDefine, {
    props: { a: 'Hello', c: 2 }
  })
)

// wrong prop type should not compile
expectError(
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

// can't receive extra props
expectError(
  mount(AppWithProps, {
    props: { a: 'Hello', b: 2 }
  })
)

// wrong prop type should not compile
expectError(
  mount(AppWithProps, {
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

// cannot receive extra props
// if they pass use object inside
expectError(
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
)

const AppWithoutProps = {
  template: ''
}

// can't receive extra props
expectError(
  mount(AppWithoutProps, {
    props: { b: 'Hello' }
  })
)

// except if explicitly cast
mount(AppWithoutProps, {
  props: { b: 'Hello' } as never
})

// Functional tests

// wrong props
expectError((props: { a: 1 }) => {}, {
  props: {
    a: '222'
  }
})

expectType<number>(
  mount((props: { a: 1 }, ctx) => {}, {
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
