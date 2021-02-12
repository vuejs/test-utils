import { mount } from '../src'
import { defineComponent, ref } from 'vue'

describe('isVisible', () => {
  const Comp = {
    template: `<div><span v-show="show" /></div>`,
    props: {
      show: {
        type: Boolean
      }
    }
  }

  it('returns false when element hidden via v-show', () => {
    const wrapper = mount(Comp, {
      props: {
        show: false
      }
    })

    expect(wrapper.find('span').isVisible()).toBe(false)
  })

  it('returns true when element is visible via v-show', () => {
    const wrapper = mount(Comp, {
      props: {
        show: true
      }
    })

    expect(wrapper.find('span').isVisible()).toBe(true)
  })

  it('returns false when element parent is invisible via v-show', () => {
    const Comp = {
      template: `<div v-show="false"><span /></div>`
    }
    const wrapper = mount(Comp)

    expect(wrapper.find('span').isVisible()).toBe(false)
  })

  it('element becomes hidden reactively', async () => {
    const Comp = {
      template: `<button @click="show = false" /><span v-show="show" />`,
      data() {
        return {
          show: true
        }
      }
    }
    const wrapper = mount(Comp)

    expect(wrapper.find('span').isVisible()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('span').isVisible()).toBe(false)
  })

  it('handles transitions', async () => {
    const Comp = {
      template: `
        <button @click="show = false" />
        <transition name="fade">
          <span class="item" v-show="show">
            Content
          </span>
        </transition>
      `,
      data() {
        return {
          show: true
        }
      }
    }
    const wrapper = mount(Comp, {})

    expect(wrapper.find('span').isVisible()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('span').isVisible()).toBe(false)
  })

  it('handles transition-group', async () => {
    const Comp = defineComponent({
      template: `
        <div id="list-demo">
          <button @click="add" id="add">Add</button>
          <button @click="remove" id="remove">Remove</button>
          <transition-group name="list" tag="p">
            <span v-for="item in items" :key="item" class="list-item">
              Item: {{ item }}
            </span>
          </transition-group>
        </div>
      `,
      setup() {
        const items = ref([1])
        const add = () => items.value.push(2)
        const remove = () => items.value.splice(1)
        return { add, remove, items }
      }
    })
    const wrapper = mount(Comp)

    expect(wrapper.html()).toContain('Item: 1')
    await wrapper.find('#add').trigger('click')
    expect(wrapper.html()).toContain('Item: 1')
    expect(wrapper.html()).toContain('Item: 2')
    await wrapper.find('#remove').trigger('click')
    expect(wrapper.html()).toContain('Item: 1')
    expect(wrapper.html()).not.toContain('Item: 2')
  })
})
