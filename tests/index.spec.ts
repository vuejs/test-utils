// @vitest-environment node
import { describe, expect, it } from 'vitest'

import * as exports from '../src/index'
describe('index.js exports', () => {
  it('in a node environment renderToString should be exported', () => {
    expect(typeof exports.renderToString).toEqual('function');
  });
})