import { VNode } from 'vue/dist/vue'

function matches(node: VNode, selector): boolean {
  if (typeof selector === 'string') {
    return node.el?.matches?.(selector)
  }
  if (typeof selector === 'object') {
    if (selector.name && typeof node.type === 'object') {
      // @ts-ignore
      return node.type.name === selector.name
    }
  }
  return false
}

function aggregateChildren(nodes, children) {
  if (children && Array.isArray(children)) {
    ;[...children].reverse().forEach((n: VNode) => {
      nodes.unshift(n)
    })
  }
}

function findAllVNodes(vnode: VNode, selector: any) {
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

export function find(root: VNode, selector: any) {
  const result = findAllVNodes(root, selector)
  return result.length ? result[0] : undefined
}
