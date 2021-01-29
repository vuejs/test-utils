import { expectError, expectType } from 'tsd'
import { defineComponent } from 'vue'
import { Options, Vue } from 'vue-class-component'
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

// allow extra props, like using `h()`
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
// vm is properly typed
expectType<string>(
  shallowMount(AppWithProps, {
    props: { a: 'Hello' }
  }).vm.a
)

// allow extra props, like using `h()`
shallowMount(AppWithProps, {
  props: { a: 'Hello', b: 2 }
})

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

// allow extra props, like using `h()`
wrapper = shallowMount(AppWithoutProps, {
  props: { b: 'Hello' }
})

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

expectError(shallowMount(ClassComponent, {}).vm.changeMessage())
shallowMount(ClassComponent, {}).vm.changeMessage('')
