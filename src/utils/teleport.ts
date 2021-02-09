import type { ComponentPublicInstance, VNode } from 'vue'
import { isVNode } from 'vue'

/**
 * The given vm is teleported.
 */
export function isTeleported(vm: ComponentPublicInstance): boolean {
  return vm?.$?.subTree?.props?.to && vm?.$?.subTree?.type?.['__isTeleport']
}

/**
 * Get the element from the dom.
 */
export function getTeleportTarget(vm: ComponentPublicInstance): Element {
  return document.querySelector(vm.$.subTree.props.to)
}

/**
 * Rebuild the dom from the vue instance.
 */
export function buildDOM(vm: ComponentPublicInstance | VNode): Element {
  let element = getElement(vm)

  if (!element.tagName) {
    // it cannot have children eg comment/text node
    return element
  }

  let children = isVNode(vm) ? vm.children : vm.$.subTree?.children

  if (children) {
    let kids = Array.isArray(children) ? children : [children]
    kids.forEach((vue) => {
      if (typeof vue === 'string') {
        return
      }
      element.appendChild(buildDOM(vue))
    })
  }

  return element
}

/**
 * Get the element of the given vue.
 */
export function getElement(vm: ComponentPublicInstance | VNode): Element {
  return isVNode(vm) ? vm.el : isTeleported(vm) ? getTeleportTarget(vm) : vm.$el
}
