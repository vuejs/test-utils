import { afterEach, beforeEach, expect, test } from 'vitest'
import { mount } from '../../src'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // create teleport target
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // clean up
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
