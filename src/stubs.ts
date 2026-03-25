import type { Component } from 'vue'

// Stubbing occurs when in vnode transformer we're swapping
// component vnode type due to stubbing either component
// or directive on component

// In order to be able to find components we need to track pairs
// stub --> original component

// Having this as global might feel unsafe at first point
// One can assume that sharing stub map across mounts might
// lead to false matches, however our vnode mappers always
// produce new nodeTypes for each mount even if you're reusing
// same stub, so we're safe and do not need to pass these stubs
// for each mount operation
const stubs: WeakMap<Component, Component> = new WeakMap()

export function registerStub({
  source,
  stub
}: {
  source: Component
  stub: Component
}) {
  stubs.set(stub, source)
}

export function getOriginalComponentFromStub(
  stub: Component
): Component | undefined {
  return stubs.get(stub)
}
