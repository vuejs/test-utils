// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import * as exports from '../src/index'
describe('index.js exports', () => {
  it('in a browser environment renderToString should not be exported', () => {
    // data type of null is object
    expect(typeof exports.renderToString).toEqual('object');
  });
})