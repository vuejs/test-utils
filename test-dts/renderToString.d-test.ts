import { expectError, expectType } from './index'
import { defineComponent } from 'vue'
import { Options, Vue } from 'vue-class-component'
import { renderToString } from '../src'

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
let html = renderToString(AppWithDefine, {
  props: { a: 'Hello', b: 2 }
})
// html is properly typed
expectType<Promise<string>>(html)

// allow extra props, like using `h()`
renderToString(AppWithDefine, {
  props: { a: 'Hello', c: 2 }
})

expectError(
  renderToString(AppWithDefine, {
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
}

// accept props
expectType<Promise<string>>(
  renderToString(AppWithProps, {
    props: { a: 'Hello' }
  })
)

// allow extra props, like using `h()`
renderToString(AppWithProps, {
  props: { a: 'Hello', b: 2 }
})

expectError(
  renderToString(AppWithProps, {
    // @ts-expect-error wrong prop type should not compile
    props: { a: 2 }
  })
)

const AppWithArrayProps = {
  props: ['a'],
  template: ''
}

// accept props
html = renderToString(AppWithArrayProps, {
  props: { a: 'Hello' }
})
expectType<Promise<string>>(html)

// can receive extra props
// as they are declared as `string[]`
renderToString(AppWithArrayProps, {
  props: { a: 'Hello', b: 2 }
})

const AppWithoutProps = {
  template: ''
}

// allow extra props, like using `h()`
html = renderToString(AppWithoutProps, {
  props: { b: 'Hello' }
})

// class component
@Options({
  props: {
    msg: String
  }
})
class ClassComponent extends Vue {
  dataText = ''
  get computedMsg(): string {
    return `Message: ${(this.$props as any).msg}`
  }

  changeMessage(text: string): void {
    this.dataText = 'Updated'
  }
}
expectType<Promise<string>>(renderToString(ClassComponent))

// No `attachTo` mounting option
expectError(
  renderToString(AppWithProps, {
    // @ts-expect-error should not have attachTo mounting option
    attachTo: 'body'
  })
)
