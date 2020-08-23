import { ComponentPublicInstance, VNode, isVNode } from 'vue'
import { ShapeFlags } from '@vue/shared'
import { FindAllComponentsSelector } from '../types'
import { matchName } from './matchName'
import { isObject, isFunction } from '../utils'

type ComponentMatchType = 'functional' | 'stateful' | 'runtimeCompile'
interface ComponentMatchResult {
  match: boolean
  type?: ComponentMatchType
}
/**
 * Detect whether a selector matches a VNode
 * @param node
 * @param selector
 * @return {boolean | ((value: any) => { match: boolean, type?: ComponentMatchType })}
 */
function matches(
  node: VNode,
  selector: FindAllComponentsSelector
): ComponentMatchResult {
  // do not return none Vue components
  if (!node.component) {
    if (isObject(node.type) && 'render' in node.type) {
      return {
        match: true,
        type: 'functional'
      }
    }

    return {
      match: false
    }
  }

  if (node.shapeFlag === ShapeFlags.FUNCTIONAL_COMPONENT) {
    return {
      match: true,
      type: 'functional'
    }
  }

  if (typeof selector === 'string') {
    if ((node.el as HTMLElement)?.matches?.(selector)) {
      return {
        match: true,
        type: 'stateful'
      }
    }
  }

  const nodeType = node.type
  if (typeof selector === 'object' && typeof nodeType === 'object') {
    // we are looking for this exact component
    if (selector === nodeType) {
      return {
        match: true,
        type: 'stateful'
      }
    }

    let componentName
    if ('name' in nodeType || 'displayName' in nodeType) {
      // match normal component definitions or functional components
      componentName = nodeType.name || nodeType.displayName
    }
    let selectorName = selector.name

    // the component and selector both have a name
    if (
      componentName &&
      selectorName &&
      matchName(selectorName, componentName)
    ) {
      return {
        match: true,
        type: 'stateful'
      }
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
      if (matchName(selectorName, componentName)) {
        return {
          match: true,
          type: 'stateful'
        }
      }
    }
  }

  return {
    match: false
  }
}

const findAllVNodes = (
  vnodes: VNode[],
  selector: FindAllComponentsSelector,
  found: Record<string, VNode>
) => {
  return vnodes.reduce<Record<string, VNode>>((acc, vnode) => {
    if (matches(vnode, selector).match) {
      if (!vnode.component) {
        // functional or slot component do not have uid, so we just use a random identifier to track them.
        return { ...acc, [Math.random()]: vnode }
      }
      return { ...acc, [vnode.component.uid]: vnode }
    }

    if (vnode?.component?.subTree) {
      if (vnode.component.subTree.children) {
        if (Array.isArray(vnode.component.subTree.children)) {
          const nodes = vnode.component.subTree.children.filter(isVNode)
          return findAllVNodes(nodes, selector, acc)
        } else if (
          isObject(vnode.component.subTree.children) &&
          'default' in vnode.component.subTree.children &&
          isFunction(vnode.component.subTree.children['default'])
        ) {
          const defaultSlotContent = vnode.component.subTree.children[
            'default'
          ]()
          return findAllVNodes(defaultSlotContent, selector, acc)
        }
      }
    }

    if (vnode.children) {
      if (Array.isArray(vnode.children)) {
        const nodes = vnode.children.filter(isVNode)
        return findAllVNodes(nodes, selector, acc)
      }

      // suspense
      if (
        isObject(vnode.children) &&
        'default' in vnode.children &&
        'fallback' in vnode.children
      ) {
        const { isResolved, fallbackTree, subTree } = vnode.suspense
        if (isResolved) {
          // if the suspense is resolved, we match its children
          return findAllVNodes([subTree], selector, acc)
        } else {
          // otherwise we match its fallback tree
          return findAllVNodes([fallbackTree], selector, acc)
        }
      }
    }

    return acc
  }, found)
}

export function find(
  root: VNode,
  selector: FindAllComponentsSelector
): ComponentPublicInstance[] {
  const result = findAllVNodes([root], selector, {})
  return Object.values(result).map((x: VNode) => {
    if (!x.component) {
      // only stateful components with instances (vm) have component.proxy
      // we need to consider the case of functional components, slots, etc.
      // Dunno what we can really do, though. We could hack in some basic stuff like
      // a .html method etc.
      // honestly I think we should abandon findComponent or *strongly* discourage it.
      // We could throw some useful warning here?
      // There are too many unsolvable edge cases!
      return
    }
    return x.component!.proxy
  })
}
