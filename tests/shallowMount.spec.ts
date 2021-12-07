import { defineAsyncComponent, defineComponent } from 'vue'
import { mount, shallowMount, VueWrapper } from '../src'
import ComponentWithChildren from './components/ComponentWithChildren.vue'
import ScriptSetupWithChildren from './components/ScriptSetupWithChildren.vue'

describe('shallowMount', () => {
  it('renders props for stubbed component in a snapshot', () => {
    expect.addSnapshotSerializer({
      test(wrapper: VueWrapper<any>) {
        return '__app' in wrapper
      },
      serialize(wrapper: VueWrapper<any>) {
        return wrapper.html()
      }
    })

    const MyLabel = defineComponent({
      props: ['val'],
      template: '<label :for="val">{{ val }}</label>'
    })

    const AsyncComponent = defineAsyncComponent(async () => ({
      name: 'AsyncComponentName',
      template: '<span>AsyncComponent</span>'
    }))

    const Component = defineComponent({
      components: { MyLabel, AsyncComponent },
      template: '<div><MyLabel val="username" /><AsyncComponent /></div>',
      data() {
        return {
          foo: 'bar'
        }
      }
    })

    const wrapper = shallowMount(Component)

    expect(wrapper.html()).toBe(
      '<div>\n' +
        '  <my-label-stub val="username"></my-label-stub>\n' +
        '  <async-component-stub></async-component-stub>\n' +
        '</div>'
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('stubs all components automatically using { shallow: true }', () => {
    const wrapper = mount(ComponentWithChildren, { shallow: true })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">\n' +
        '  <hello-stub></hello-stub>\n' +
        '  <component-with-input-stub></component-with-input-stub>\n' +
        '  <component-without-name-stub></component-without-name-stub>\n' +
        '  <script-setup-stub></script-setup-stub>\n' +
        '  <with-props-stub></with-props-stub>\n' +
        '</div>'
    )
  })

  it('stubs all components automatically using shallowMount', () => {
    const wrapper = shallowMount(ComponentWithChildren)
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">\n' +
        '  <hello-stub></hello-stub>\n' +
        '  <component-with-input-stub></component-with-input-stub>\n' +
        '  <component-without-name-stub></component-without-name-stub>\n' +
        '  <script-setup-stub></script-setup-stub>\n' +
        '  <with-props-stub></with-props-stub>\n' +
        '</div>'
    )
  })

  it('correctly renders slot content', () => {
    const ComponentWithSlot = defineComponent({
      template: '<div><slot></slot></div>'
    })

    const wrapper = shallowMount(ComponentWithSlot, {
      slots: {
        default: '<span class="slot-content">test</span>'
      }
    })
    expect(wrapper.find('.slot-content').exists()).toBe(true)
  })

  it('correctly stubs components inside slot', () => {
    const ComponentWithSlot = defineComponent({
      template: '<div><slot></slot></div>'
    })

    const Foo = defineComponent({
      name: 'Foo',
      template: '<div class="unstubbed-foo">OK</div>'
    })

    const wrapper = shallowMount(ComponentWithSlot, {
      global: {
        components: { Foo }
      },
      slots: {
        default: '<Foo />'
      }
    })

    expect(wrapper.find('.unstubbed-foo').exists()).toBe(false)
  })

  it('stubs all components, but allows providing custom stub', () => {
    const wrapper = mount(ComponentWithChildren, {
      shallow: true,
      global: {
        stubs: {
          Hello: { template: '<div>Override</div>' }
        }
      }
    })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">\n' +
        '  <div>Override</div>\n' +
        '  <component-with-input-stub></component-with-input-stub>\n' +
        '  <component-without-name-stub></component-without-name-stub>\n' +
        '  <script-setup-stub></script-setup-stub>\n' +
        '  <with-props-stub></with-props-stub>\n' +
        '</div>'
    )
  })

  it('stubs all components, but allows disabling stub by passing false', () => {
    const wrapper = mount(ComponentWithChildren, {
      shallow: true,
      global: {
        stubs: {
          Hello: false
        }
      }
    })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">\n' +
        '  <div id="root">\n' +
        '    <div id="msg">Hello world</div>\n' +
        '  </div>\n' +
        '  <component-with-input-stub></component-with-input-stub>\n' +
        '  <component-without-name-stub></component-without-name-stub>\n' +
        '  <script-setup-stub></script-setup-stub>\n' +
        '  <with-props-stub></with-props-stub>\n' +
        '</div>'
    )
  })

  it('stubs all components in a script setup component', () => {
    const wrapper = mount(ScriptSetupWithChildren, {
      shallow: true,
      global: {
        stubs: {
          Hello: { template: '<div>Override</div>' }
        }
      }
    })
    expect(wrapper.html()).toEqual(
      '<div>Override</div>\n' +
        '<component-with-input-stub></component-with-input-stub>\n' +
        '<component-without-name-stub></component-without-name-stub>\n' +
        '<component-async-stub></component-async-stub>\n' +
        '<script-setup-stub></script-setup-stub>\n' +
        '<with-props-stub></with-props-stub>'
    )
  })

  it('should render stubs correctly', () => {
    const ComponentToMount = defineComponent({
      template: `<div>
        <test-component class='component 1' />
        <test-component class='component 2' />
      </div>`
    })

    const TestComponent = defineComponent({
      template: `<div>
        this is just a test component
      </div>`
    })

    const wrapper = shallowMount(ComponentToMount, {
      global: {
        components: {
          TestComponent
        }
      }
    })

    expect(wrapper.html()).toBe(
      '<div>\n' +
        '  <test-component-stub class="component 1"></test-component-stub>\n' +
        '  <test-component-stub class="component 2"></test-component-stub>\n' +
        '</div>'
    )
  })
})
