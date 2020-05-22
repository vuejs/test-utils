import { expectError, expectType } from 'tsd'
import { defineComponent } from 'vue'
import { shallowMount } from '../src'

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

// accept props
let wrapper = shallowMount(AppWithDefine, {
  props: { a: 'Hello', b: 2 }
})
// vm is properly typed
expectType<string>(wrapper.vm.a)

// can receive extra props
// ideally, it should not
// but the props have type { a: string } & VNodeProps
// which allows any property
shallowMount(AppWithDefine, {
  props: { a: 'Hello', c: 2 }
})

// wrong prop type should not compile
expectError(
  shallowMount(AppWithDefine, {
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

// accept props
wrapper = shallowMount(AppWithProps, {
  props: { a: 'Hello' }
})
// vm is properly typed
expectType<string>(wrapper.vm.a)

// can't receive extra props
expectError(
  shallowMount(AppWithProps, {
    props: { a: 'Hello', b: 2 }
  })
)

// wrong prop type should not compile
expectError(
  shallowMount(AppWithProps, {
    props: { a: 2 }
  })
)

const AppWithArrayProps = {
  props: ['a'],
  template: ''
}

// accept props
wrapper = shallowMount(AppWithArrayProps, {
  props: { a: 'Hello' }
})
// vm is properly typed
expectType<string>(wrapper.vm.a)

// can receive extra props
// as they are declared as `string[]`
shallowMount(AppWithArrayProps, {
  props: { a: 'Hello', b: 2 }
})

const AppWithoutProps = {
  template: ''
}

// can't receive extra props
expectError(
  (wrapper = shallowMount(AppWithoutProps, {
    props: { b: 'Hello' }
  }))
)

// except if explicitly cast
shallowMount(AppWithoutProps, {
  props: { b: 'Hello' } as never
})
