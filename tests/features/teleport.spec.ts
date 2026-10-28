import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Teleport, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { TeleportStub, mount } from '../../src'
import WithTeleportPropsComp from '../components/WithTeleportPropsComp.vue'
import WithTeleportEmitsComp from '../components/WithTeleportEmitsComp.vue'
import WithProps from '../components/WithProps.vue'
import EmitsEvent from '../components/EmitsEvent.vue'

describe('teleport', () => {
  beforeEach(() => {
    document.body.outerHTML = ''
  })

  it('teleports a string', () => {
    const destination = document.createElement('div')
    destination.id = 'far-away'
    document.body.appendChild(destination)

    const Comp = defineComponent({
      setup() {
        return () =>
          h(() => h(Teleport, { to: '#far-away' }, h('div', 'teleported')))
      }
    })

    mount(Comp)

    expect(document.body.outerHTML).toBe(
      `<body><div id="far-away"><div>teleported</div></div></body>`
    )
  })

  const Greeter = defineComponent({
    emits: {
      greet: (msg: string) => {
        return true
      }
    },
    props: {
      msg: {
        type: String,
        required: true
      }
    },
    setup({ msg }, { emit }) {
      return () =>
        h(
          'button',
          { onClick: () => emit('greet', `${msg.toUpperCase()}!!!`) },
          `${msg}!!!`
        )
    }
  })

  it('teleports a component with props', async () => {
    const destination = document.createElement('div')
    destination.id = 'far-away'
    document.body.appendChild(destination)

    const onGreet = vi.fn()

    const Comp = defineComponent({
      setup() {
        return () =>
          h(() =>
            h(
              Teleport,
              { to: '#far-away' },
              h(Greeter, { onGreet, msg: 'Hello' })
            )
          )
      }
    })

    mount(Comp)
    document.querySelector<HTMLButtonElement>('button')!.click()

    expect(onGreet).toHaveBeenCalledWith('HELLO!!!')
    expect(document.body.outerHTML).toBe(
      `<body><div id="far-away"><button>Hello!!!</button></div></body>`
    )
  })

  it('teleports a component with props', async () => {
    const destination = document.createElement('div')
    destination.id = 'far-away'
    document.body.appendChild(destination)

    const onGreet = vi.fn()

    const Comp = defineComponent({
      setup() {
        return () =>
          h(() =>
            h(
              Teleport,
              { to: '#far-away' },
              h(Greeter, { onGreet, msg: 'Hello' })
            )
          )
      }
    })

    const wrapper = mount(Comp)

    // although <Greeter /> is teleported outside the component,
    // it's still in the vdom of the wrapper,
    // so you can just query it like you normally would - pretty neat.
    await wrapper.getComponent(Greeter).trigger('click')

    expect(onGreet).toHaveBeenCalledWith('HELLO!!!')
    expect(wrapper.getComponent(Greeter).props()).toEqual({
      msg: 'Hello'
    })

    expect(document.body.outerHTML).toBe(
      `<body><div id="far-away"><button>Hello!!!</button></div></body>`
    )
  })

  it('works with SFC and gets props', async () => {
    const destination = document.createElement('div')
    destination.id = 'somewhere'
    document.body.appendChild(destination)

    const wrapper = mount(WithTeleportPropsComp)

    const withProps = wrapper.getComponent(WithProps)

    expect(withProps.props()).toEqual({
      msg: 'hi there'
    })
  })

  it('works with SFC and captures emitted events', async () => {
    const destination = document.createElement('div')
    destination.id = 'somewhere'
    document.body.appendChild(destination)

    const wrapper = mount(WithTeleportEmitsComp)

    const withProps = wrapper.getComponent(EmitsEvent)
    withProps.trigger('click')

    expect(withProps.emitted().greet[0]).toEqual(['Hey!'])
  })

  it('should reactively update content with teleport', async () => {
    const wrapper = mount(
      defineComponent({
        template:
          '<div>' +
          '<button @click="add">Add</button>' +
          '<Teleport to="body"><div id="count">{{ count }}</div></Teleport>' +
          '</div>',
        setup() {
          const count = ref(1)
          const add = () => (count.value += 1)
          return { count, add }
        }
      }),
      {
        global: {
          stubs: {
            teleport: true
          }
        }
      }
    )

    expect(wrapper.html()).toBe(
      '<div><button>Add</button>\n' +
        '  <teleport-stub to="body">\n' +
        '    <div id="count">1</div>\n' +
        '  </teleport-stub>\n' +
        '</div>'
    )

    expect(wrapper.find('#count').text()).toBe('1')

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('#count').text()).toBe('2')
  })

  // https://github.com/vuejs/test-utils/issues/2628
  it('keeps children mounted across re-renders when using TeleportStub', async () => {
    const lifecycleEvents: string[] = []
    const Child = defineComponent({
      setup() {
        onMounted(() => lifecycleEvents.push('mounted'))
        onUnmounted(() => lifecycleEvents.push('unmounted'))
        return () => h('div', 'child content')
      }
    })
    const Comp = defineComponent({
      components: { Child },
      props: { count: { type: Number, required: true } },
      template: `
        <div>
          <span id="count">{{ count }}</span>
          <teleport to="body"><Child /></teleport>
        </div>`
    })

    const wrapper = mount(Comp, {
      props: { count: 1 },
      global: {
        stubs: {
          Teleport: TeleportStub
        }
      }
    })

    expect(lifecycleEvents).toEqual(['mounted'])
    expect(wrapper.text()).toContain('child content')

    await wrapper.setProps({ count: 2 })

    expect(wrapper.find('#count').text()).toBe('2')
    expect(wrapper.text()).toContain('child content')
    // the child stays mounted: no unmount/remount cycle on re-render
    expect(lifecycleEvents).toEqual(['mounted'])
  })
})
