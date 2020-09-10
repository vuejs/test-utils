import { expectError, expectType } from 'tsd'
import { defineComponent } from 'vue'
import { mount } from '../src'
// @ts-ignore
import Hello from '../tests/components/Hello.vue'

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

// SFC with data option
mount(Hello, {
  data() {
    return {
      foo: 'bar'
    }
  }
})
