import { isDeepRef } from '../src/utils/isDeepRef'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

describe('isDeepRef', () => {
  it('should return true for a Ref value', () => {
    const testRef = ref(1)

    expect(isDeepRef(testRef)).toBe(true)
  })
  it('should return false for a non-object, non-Ref value', () => {
    const nonObject = 1

    expect(isDeepRef(nonObject)).toBe(false)
  })
  it('should return true for an object with a Ref value', () => {
    const testObject = { ref: ref(1) }

    expect(isDeepRef(testObject)).toBe(true)
  })
  it('should return false for an object without a Ref value', () => {
    const testObject = { nonRef: 1 }

    expect(isDeepRef(testObject)).toBe(false)
  })
  it('should return true for an array with a Ref value', () => {
    const arrayWithRef = [ref(1)]

    expect(isDeepRef(arrayWithRef)).toBe(true)
  })
  it('should return false for an array without a Ref value', () => {
    const arrayWithoutRef = [1]

    expect(isDeepRef(arrayWithoutRef)).toBe(false)
  })
  it('should return true for a nested object with a Ref value', () => {
    const nestedObject = { nested: { ref: ref(1) } }

    expect(isDeepRef(nestedObject)).toBe(true)
  })
  it('should return false for a nested object without a Ref value', () => {
    const nestedObject = { nested: { nonRef: 1 } }

    expect(isDeepRef(nestedObject)).toBe(false)
  })
  it('should return true for a nested array with a Ref value', () => {
    const nestedArray = [[ref(1)]]

    expect(isDeepRef(nestedArray)).toBe(true)
  })
  it('should return false for a nested array without a Ref value', () => {
    const nestedArray = [[1]]

    expect(isDeepRef(nestedArray)).toBe(false)
  })
  it('should return false for an object that has already been visited and does not contain a Ref', () => {
    const item = { parent: null as any }
    const parentItem = { children: [item] }
    item.parent = parentItem

    expect(isDeepRef(item)).toBe(false)
  })
  it('should return true for an object that has already been visited and contains a Ref', () => {
    const item = { parent: ref<any>(null) }
    const parentItem = { children: [ref(item)] }
    item.parent.value = parentItem

    expect(isDeepRef(item)).toBe(true)
  })
})
