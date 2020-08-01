import {
  ComponentPublicInstance,
  VNode,
  VNodeArrayChildren,
  VNodeNormalizedChildren
} from 'vue'
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

  const nodeType = node.type
  if (typeof selector === 'object' && typeof nodeType === 'object') {
    // we are looking for this exact component
    if (selector === nodeType) {
      return true
    }

    let componentName
    if ('name' in nodeType || 'displayName' in nodeType) {
      // match normal component definitions or functional components
      componentName = nodeType.name || nodeType.displayName
    }
    let selectorName = selector.name

    // the component and selector both have a name
    if (componentName && selectorName) {
      return matchName(selectorName, componentName)
    }

    // if a name is missing, then check the locally registered components in the parent
    if (node.component.parent) {
      const registry = (node.component.parent as any).type.components
      for (const key in registry) {
        // is it the selector
        if (!selectorName && registry[key] === selector) {
          selectorName = key
        }
        // is it the component
        if (!componentName && registry[key] === nodeType) {
          componentName = key
        }
      }
      // we may have one or both missing names
      return matchName(selectorName, componentName)
    }
  }

  return false
}

/**
 * Filters out the null, undefined and primitive values,
 * to only keep VNode and VNodeArrayChildren values
 * @param value
 */
function nodesAsObject<Node>(
  value:
    | string
    | number
    | boolean
    | VNodeArrayChildren
    | VNode
    | null
    | undefined
    | void
): value is VNodeArrayChildren | VNode {
  return !!value && typeof value === 'object'
}

/**
 * Collect all children
 * @param nodes
 * @param children
 */
function aggregateChildren(nodes: VNode[], children: VNodeNormalizedChildren) {
  if (children && Array.isArray(children)) {
    const reversedNodes = [...children].reverse().filter(nodesAsObject)
    reversedNodes.forEach((node: VNodeArrayChildren | VNode) => {
      if (Array.isArray(node)) {
        aggregateChildren(nodes, node)
      } else {
        nodes.unshift(node)
      }
    })
  }
}

function findAllVNodes(
  vnode: VNode,
  selector: FindAllComponentsSelector
): VNode[] {
  const matchingNodes: VNode[] = []
  const nodes: VNode[] = [vnode]
  while (nodes.length) {
    const node = nodes.shift()!
    aggregateChildren(nodes, node.children)
    if (node.component) {
      aggregateChildren(nodes, node.component.subTree.children)
    }
    if (matches(node, selector)) {
      matchingNodes.push(node)
    }
  }

  return matchingNodes
}

export function find(
  root: VNode,
  selector: FindAllComponentsSelector
): ComponentPublicInstance[] {
  return findAllVNodes(root, selector).map(
    (vnode: VNode) => vnode.component!.proxy!
  )
}
