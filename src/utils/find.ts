import {
  ComponentInternalInstance,
  VNode,
  VNodeArrayChildren,
  VNodeNormalizedChildren,
  VNodeTypes
} from 'vue'
import { FindAllComponentsSelector } from '../types'
import {
  getOriginalStubFromSpecializedStub,
  getOriginalVNodeTypeFromStub
} from '../stubs'
import { isComponent } from '../utils'
import { matchName } from './matchName'
import { unwrapLegacyVueExtendComponent } from './vueCompatSupport'
import { getComponentName, getComponentRegisteredName } from './componentName'

/**
 * Detect whether a selector matches a VNode
 * @param node
 * @param selector
 * @return {boolean | ((value: any) => boolean)}
 */
export function matches(
  node: VNode,
  rawSelector: FindAllComponentsSelector
): boolean {
  const selector = unwrapLegacyVueExtendComponent(rawSelector)

  // do not return none Vue components
  if (!node.component) return false

  const nodeType = node.type
  if (!isComponent(nodeType)) return false

  if (typeof selector === 'string') {
    return node.el?.matches?.(selector)
  }

  // When we're using stubs we want user to be able to
  // find stubbed components both by original component
  // or stub definition. That's why we are trying to
  // extract original component and also stub, which was
  // used to create specialized stub for render

  const nodeTypeCandidates: VNodeTypes[] = [
    nodeType,
    getOriginalVNodeTypeFromStub(nodeType),
    getOriginalStubFromSpecializedStub(nodeType)
  ].filter(Boolean) as VNodeTypes[]

  if (nodeTypeCandidates.includes(selector)) {
    return true
  }

  let componentName: string | undefined
  componentName = getComponentName(node.component, nodeType)

  let selectorName = selector.name

  // the component and selector both have a name
  if (componentName && selectorName) {
    return matchName(selectorName, componentName)
  }

  componentName =
    getComponentRegisteredName(node.component, nodeType) || undefined

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
  }

  if (selectorName && componentName) {
    return matchName(selectorName, componentName)
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
      aggregateChildren(nodes, [node.component.subTree])
    }
    if (node.suspense) {
      // match children if component is Suspense
      const { activeBranch } = node.suspense
      aggregateChildren(nodes, [activeBranch])
    }
    if (matches(node, selector) && !matchingNodes.includes(node)) {
      matchingNodes.push(node)
    }
  }

  return matchingNodes
}

export function find(
  root: VNode,
  selector: FindAllComponentsSelector
): ComponentInternalInstance[] {
  let matchingVNodes = findAllVNodes(root, selector)

  if (typeof selector === 'string') {
    // When searching by CSS selector we want only one (topmost) vnode for each el`
    matchingVNodes = matchingVNodes.filter(
      (vnode: VNode) => vnode.component!.parent?.vnode.el !== vnode.el
    )
  }

  return matchingVNodes.map((vnode: VNode) => vnode.component!)
}
