import { defineComponent, FunctionalComponent, h, Teleport } from 'vue'
import { mount } from '../../src'

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

    const wrapper = mount(Comp)

    expect(document.body.outerHTML).toBe(`<body><div id="far-away"><div>teleported</div></div></body>`)
  })

  it('teleports a component with props', async () => {
    const destination = document.createElement('div')
    destination.id = 'far-away'
    document.body.appendChild(destination)

    const Greeter: FunctionalComponent<{ msg: string }, { greet: (msg: string) => void }> = ({ msg }, { emit }) => {
      return h('button', { onClick: () => emit('greet', `${msg.toUpperCase()}!!!`) }, `${msg}!!!`)
    }

    const onGreet = jest.fn()

    const Comp = defineComponent({
      setup() {
        return () =>
          h(() => h(Teleport, { to: '#far-away' }, h(Greeter, { onGreet, msg: 'Hello' })))
      }
    })

    const wrapper = mount(Comp)
    document.querySelector<HTMLButtonElement>('button')!.click()

    expect(onGreet).toHaveBeenCalledWith('HELLO!!!')

    expect(document.body.outerHTML).toBe(`<body><div id="far-away"><button>Hello!!!</button></div></body>`)
  })
})
