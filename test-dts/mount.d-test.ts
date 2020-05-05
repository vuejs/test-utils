import { expectError, expectType } from 'tsd'
import { defineComponent } from 'vue'
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

// accept props- vm is properly typed
expectType<string>(
  mount(AppWithDefine, {
    props: { a: 'Hello', b: 2 }
  }).vm.a
)

// no data provided
expectError(
  mount(AppWithDefine, {
    data() {
      return {
        myVal: 1
      }
    }
  })
)

// can receive extra props
// ideally, it should not
// but the props have type { a: string } & VNodeProps
// which allows any property
mount(AppWithDefine, {
  props: { a: 'Hello', c: 2 }
})

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
mount(AppWithArrayProps, {
  props: { a: 'Hello', b: 2 }
})

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
  (wrapper = mount(AppWithoutProps, {
    props: { b: 'Hello' }
  }))
)

// except if explicitly cast
mount(AppWithoutProps, {
  props: { b: 'Hello' } as never
})
