export function stringifyNode(node: Node): string {
  return node instanceof Element
    ? node.outerHTML
    : new XMLSerializer().serializeToString(node)
}
