import { defineComponent, h, computed, ref, watchEffect } from 'vue'

import { mount } from '../src'

describe('setProps', () => {
  it('updates a primitive prop', async () => {
    const Foo = {
      props: ['foo'],
      template: '<div>{{ foo }}</div>'
    }
    const wrapper = mount(Foo, {
      props: {
        foo: 'bar'
      }
    })
    expect(wrapper.html()).toContain('bar')

    await wrapper.setProps({ foo: 'qux' })
    expect(wrapper.html()).toContain('qux')
  })

  it('updates a function prop', async () => {
    const Foo = {
      props: ['obj'],
      template: `
        <div>
          <div v-if="obj.foo()">foo</div>
        </div>
      `
    }
    const wrapper = mount(Foo, {
      props: {
        obj: {
          foo: () => true
        }
      }
    })
    expect(wrapper.html()).toContain('foo')

    await wrapper.setProps({ obj: { foo: () => false } })
    expect(wrapper.html()).not.toContain('foo')
  })

  it('sets component props, and updates DOM when props were not initially passed', async () => {
    const Foo = {
      props: ['foo'],
      template: `
        <div>{{ foo }}</div>`
    }
    const wrapper = mount(Foo)
    expect(wrapper.html()).not.toContain('foo')

    await wrapper.setProps({ foo: 'foo' })

    expect(wrapper.html()).toContain('foo')
  })

  it('triggers a watcher', async () => {
    const Foo = {
      props: ['foo'],
      data() {
        return {
          bar: 'original-bar'
        }
      },
      watch: {
        foo(val: string) {
          this.bar = val
        }
      },
      template: `
        <div>{{ bar }}</div>`
    }
    const wrapper = mount(Foo)
    expect(wrapper.html()).toContain('original-bar')

    await wrapper.setProps({ foo: 'updated-bar' })

    expect(wrapper.html()).toContain('updated-bar')
  })

  it('works with composition API', async () => {
    const Foo = defineComponent({
      props: {
        foo: { type: String }
      },
      setup(props) {
        const foobar = computed(() => `${props.foo}-bar`)
        return () =>
          h('div', `Foo is: ${props.foo}. Foobar is: ${foobar.value}`)
      }
    })
    const wrapper = mount(Foo, {
      props: {
        foo: 'foo'
      }
    })
    expect(wrapper.html()).toContain('Foo is: foo. Foobar is: foo-bar')

    await wrapper.setProps({ foo: 'qux' })

    expect(wrapper.html()).toContain('Foo is: qux. Foobar is: qux-bar')
  })

  it('non-existent props are rendered as attributes', async () => {
    const Foo = {
      props: ['foo'],
      template: '<div>{{ foo }}</div>'
    }
    const wrapper = mount(Foo, {
      props: {
        foo: 'foo'
      }
    })
    expect(wrapper.html()).toContain('foo')

    const nonExistentProp = { bar: 'qux' }
    await wrapper.setProps(nonExistentProp)

    expect(wrapper.attributes()).toEqual(nonExistentProp)
    expect(wrapper.html()).toBe('<div bar="qux">foo</div>')
  })

  it('allows using only on mounted component', async () => {
    const Foo = {
      name: 'Foo',
      props: ['foo'],
      template: '<div>{{ foo }}</div>'
    }
    const Baz = {
      props: ['baz'],
      template: '<div><Foo :foo="baz"/></div>',
      components: { Foo }
    }

    const wrapper = mount(Baz, {
      props: {
        baz: 'baz'
      }
    })
    const FooResult = wrapper.findComponent({ name: 'Foo' })
    expect(() => FooResult.setProps({ baz: 'bin' })).toThrowError(
      'You can only use setProps on your mounted component'
    )
  })

  it('should trigger props watchers', async () => {
    /**
     * This is a mini Alert component,
     * that can be show or hide via the the `show` prop,
     * and can be dismissed when clicking on the button.
     * When dismissed, it does not display.
     * We want to reset the dismiss value, if the parent component shows the Alert again.
     */
    const Alert = {
      name: 'Alert',
      props: {
        show: {
          type: Boolean,
          required: false
        }
      },
      template: `<div v-if="show && !isDismissed">
        <button type="button" @click="dismiss()">X</button>
        <div>Hello</div>
      </div>`,
      setup(props) {
        const isDismissed = ref(false)
        function dismiss() {
          isDismissed.value = true
        }
        watchEffect(() => {
          if (props.show) {
            isDismissed.value = false
          }
        })

        return { isDismissed, dismiss }
      }
    }

    const wrapper = mount(Alert, {
      props: {
        show: true
      }
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.html()).toContain('Hello')

    // it should hide the alert when clicking on it
    await wrapper.get('button').trigger('click')
    expect(wrapper.html()).not.toContain('Hello')
    expect(wrapper.vm.isDismissed).toBe(true)

    // it should display the alert again if the parent component wants to (triggers the props watcher)
    await wrapper.setProps({ shown: true })
    expect(wrapper.vm.isDismissed).toBe(false)
    expect(wrapper.html()).toContain('Hello')
  })
})
