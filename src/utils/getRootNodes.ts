import { ShapeFlags } from '@vue/shared'
import { isNotNullOrUndefined } from '../utils'
import { VNode, VNodeArrayChildren } from 'vue'

export function getRootNodes(vnode: VNode): Node[] {
  if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
    return [vnode.el as Node]
  } else if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
    const { subTree } = vnode.component!
    return getRootNodes(subTree)
  } else if (vnode.shapeFlag & ShapeFlags.SUSPENSE) {
    return getRootNodes(vnode.suspense!.activeBranch!)
  } else if (
    vnode.shapeFlag &
    (ShapeFlags.TEXT_CHILDREN | ShapeFlags.TELEPORT)
  ) {
    // static node optimization, subTree.children will be static string and will not help us
    const result = [vnode.el as Node]
    if (vnode.anchor) {
      let currentNode: Node | null = result[0].nextSibling
      while (currentNode && currentNode.previousSibling !== vnode.anchor) {
        result.push(currentNode)
        currentNode = currentNode.nextSibling
      }
    }
    return result
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    const children = (
      vnode.children as unknown as VNodeArrayChildren
    ).flat() as VNode[]

    return children
      .flatMap((vnode) => getRootNodes(vnode))
      .filter(isNotNullOrUndefined)
  }
  // Missing cases which do not need special handling:
  // ShapeFlags.SLOTS_CHILDREN comes with ShapeFlags.ELEMENT

  // Will hit this default when ShapeFlags is 0
  // This is the case for example for unresolved async component without loader
  return []
}
