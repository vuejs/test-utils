import { describe, expect, it } from 'vitest'
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
    // TODO: attachTo can be removed when https://github.com/jsdom/jsdom/issues/3502 is fixed
    // with jsdom v21.1, getComputedStyle is cached and not updated for elements not in the DOM
    // so the test fails (because the element is checked a first time)
    const wrapper = mount(Comp, { attachTo: document.body })

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
    // TODO: attachTo can be removed when https://github.com/jsdom/jsdom/issues/3502 is fixed
    // with jsdom v21.1, getComputedStyle is cached and not updated for elements not in the DOM
    // so the test fails (because the element is checked a first time)
    const wrapper = mount(Comp, { attachTo: document.body })

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

  describe('details element', () => {
    const Comp = defineComponent({
      props: {
        open: { type: Boolean, default: false }
      },
      template: `
        <details :open="open">
          <summary>Toggle</summary>
          <p class="content">Content</p>
        </details>
      `
    })

    it('details, summary and content are visible when open', () => {
      const wrapper = mount(Comp, { props: { open: true } })

      expect(wrapper.get('details').isVisible()).toBe(true)
      expect(wrapper.get('summary').isVisible()).toBe(true)
      expect(wrapper.get('p.content').isVisible()).toBe(true)
    })

    it('details and summary stay visible when closed, content is hidden', () => {
      const wrapper = mount(Comp, { props: { open: false } })

      expect(wrapper.get('details').isVisible()).toBe(true)
      expect(wrapper.get('summary').isVisible()).toBe(true)
      expect(wrapper.get('p.content').isVisible()).toBe(false)
    })

    it('non-summary descendants of a closed details are hidden even when nested', () => {
      const Nested = defineComponent({
        template: `
          <details>
            <summary>Toggle</summary>
            <div><span class="deep">Deep</span></div>
          </details>
        `
      })
      const wrapper = mount(Nested)

      expect(wrapper.get('span.deep').isVisible()).toBe(false)
    })
  })

  it('should take css into account', async () => {
    const style = document.createElement('style')
    style.type = 'text/css'
    document.head.appendChild(style)
    style.sheet!.insertRule('.opacity-0 { opacity: 0; }')

    const wrapper = mount({
      template: '<div id="my-div" class="opacity-0" />'
    })

    expect(wrapper.get('#my-div').isVisible()).toBe(false)

    document.head.removeChild(style)
  })

  describe('isVisible with find Component', () => {
    describe('root component has v-show', () => {
      const Hidden = defineComponent({
        template: '<div>hidden</div>'
      })

      const Show = defineComponent({
        template: '<div>show</div>'
      })

      const Root = defineComponent({
        template: '<div><Hidden v-show="false" /><Show /></div>',
        components: {
          Hidden,
          Show
        }
      })

      it('mount: returns false when root has v-show=false', () => {
        const wrapper = mount(Root)
        const hidden = wrapper.findComponent(Hidden)
        const show = wrapper.findComponent(Show)
        expect(hidden.isVisible()).toBe(false)
        expect(show.isVisible()).toBe(true)
      })

      it('shallowMount: returns false when root has v-show=false', () => {
        const wrapper = mount(Root, {
          shallow: true
        })
        const hidden = wrapper.findComponent(Hidden)
        const show = wrapper.findComponent(Show)
        expect(hidden.isVisible()).toBe(false)
        expect(show.isVisible()).toBe(true)
      })
    })

    describe('child component has v-show', () => {
      const Hidden = defineComponent({
        template: '<div v-show="false">hidden</div>'
      })

      const Show = defineComponent({
        template: '<div>show</div>'
      })

      const Root = defineComponent({
        template: '<div><Hidden /><Show /></div>',
        components: {
          Hidden,
          Show
        }
      })

      it('mount: returns false when child has v-show=false', () => {
        const wrapper = mount(Root)
        const hidden = wrapper.findComponent(Hidden)
        const show = wrapper.findComponent(Show)
        expect(hidden.isVisible()).toBe(false)
        expect(show.isVisible()).toBe(true)
      })

      it('shallowMount: returns true when child has v-show=false, because of shallow mount', () => {
        const wrapper = mount(Root, {
          shallow: true
        })
        const hidden = wrapper.findComponent(Hidden)
        const show = wrapper.findComponent(Show)
        expect(hidden.isVisible()).toBe(true)
        expect(show.isVisible()).toBe(true)
      })
    })

    describe('child has two nodes', () => {
      const Foo = defineComponent({
        template: `<div ><span /></div>`
      })

      const Root = defineComponent({
        template: '<Foo v-show="false" />',
        components: {
          Foo
        }
      })

      it('mount: returns false', () => {
        const wrapper = mount(Root)
        expect(wrapper.isVisible()).toBe(false)
      })

      it('shallowMount: return false', () => {
        const wrapper = mount(Root, {
          shallow: true
        })
        expect(wrapper.isVisible()).toBe(false)
      })
    })
  })
})
