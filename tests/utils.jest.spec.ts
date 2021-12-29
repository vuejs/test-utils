/**
 * deepCompare
 */
import { deepCompare } from '../src/utils'

describe('deepCompare', () => {
  it('should be equal', () => {
    expect(deepCompare(1, 1)).toBe(true)
    expect(deepCompare('1', '1')).toBe(true)
    expect(deepCompare(true, true)).toBe(true)
    expect(deepCompare(false, false)).toBe(true)
    expect(deepCompare({}, {})).toBe(true)
    expect(deepCompare([], [])).toBe(true)
    expect(deepCompare({ a: 1 }, { a: 1 })).toBe(true)
    expect(deepCompare({ a: '1' }, { a: '1' })).toBe(true)
    expect(deepCompare({ a: '1', b: 2 }, { a: '1', b: 2 })).toBe(true)
    expect(deepCompare({ a: '1', b: [] }, { a: '1', b: [] })).toBe(true)
    expect(deepCompare({ a: '1', b: [1, 2] }, { a: '1', b: [1, 2] })).toBe(true)
    expect(deepCompare([1], [1])).toBe(true)
    expect(deepCompare([1, 1], [1, 1])).toBe(true)
    expect(deepCompare([1, '1'], [1, '1'])).toBe(true)
    expect(deepCompare(['1', 1], ['1', 1])).toBe(true)
    expect(deepCompare([{}], [{}])).toBe(true)
    expect(deepCompare([{ a: 1 }], [{ a: 1 }])).toBe(true)
    expect(
      deepCompare(
        {
          method() {}
        },
        {
          method() {}
        }
      )
    ).toBe(true)
  })

  it('should not be equal', () => {
    expect(deepCompare(1, 2)).toBe(false)
    expect(deepCompare(1, null)).toBe(false)
    expect(deepCompare('1', '2')).toBe(false)
    expect(deepCompare({}, { a: 1 })).toBe(false)
    expect(deepCompare({ a: 1 }, {})).toBe(false)
    expect(deepCompare({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepCompare({ a: 2 }, { a: 1 })).toBe(false)
    expect(deepCompare({ a: 2 }, { b: 2 })).toBe(false)
    expect(deepCompare({ a: { b: 1 } }, { a: { c: 1 } })).toBe(false)
    expect(deepCompare([], [1])).toBe(false)
    expect(deepCompare([1], [])).toBe(false)
    expect(deepCompare([], ['1'])).toBe(false)
    expect(deepCompare(['1'], [])).toBe(false)
    expect(deepCompare(1, {})).toBe(false)
    expect(deepCompare({}, 1)).toBe(false)
    expect(deepCompare(1, { a: 1 })).toBe(false)
    expect(deepCompare({ a: 1 }, 1)).toBe(false)
    expect(deepCompare({}, [])).toBe(false)
    expect(deepCompare([], {})).toBe(false)
    expect(deepCompare({ a: 1 }, [1])).toBe(false)
    expect(deepCompare([1], { a: 1 })).toBe(false)
    expect(
      deepCompare(
        {
          method: function x() {}
        },
        {
          method: function y() {}
        }
      )
    ).toBe(false)
  })
})
