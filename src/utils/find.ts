import { VNode, ComponentPublicInstance } from 'vue'
import { FindAllComponentsSelector } from '../types'
import { matchName } from './matchName'

/**
 * Detect whether a selector matches a VNode
 * @param node
 * @param selector
 * @return {boolean | ((value: any) => boolean)}
 */
function matches(node: VNode, selector: FindAllComponentsSelector): boolean {
  // do not return none Vue components
  if (!node.component) return false

  if (typeof selector === 'string') {
    return node.el?.matches?.(selector)
  }

  if (typeof selector === 'object' && typeof node.type === 'object') {
    if (selector.name && ('name' in node.type || 'displayName' in node.type)) {
      // match normal component definitions or functional components
      return matchName(selector.name, node.type.name || node.type.displayName)
    }
  }

  return false
}

/**
 * Collect all children
 * @param nodes
 * @param children
 */
function aggregateChildren(nodes, children) {
  if (children && Array.isArray(children)) {
    ;[...children].reverse().forEach((n: VNode) => {
      nodes.unshift(n)
    })
  }
}

function findAllVNodes(vnode: VNode, selector: any): VNode[] {
  const matchingNodes = []
  const nodes = [vnode]
  while (nodes.length) {
    const node = nodes.shift()
    aggregateChildren(nodes, node.children)
    aggregateChildren(nodes, node.component?.subTree.children)
    if (matches(node, selector)) {
      matchingNodes.push(node)
    }
  }

  return matchingNodes
}

export function find(root: VNode, selector: any): ComponentPublicInstance[] {
  return findAllVNodes(root, selector).map(
    (vnode: VNode) => vnode.component.proxy
  )
}
