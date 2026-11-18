/**
 * A small, dependency-free HTML formatter used by `wrapper.html()`.
 *
 * It walks DOM nodes directly instead of parsing serialized HTML, and follows
 * the formatting rules `js-beautify` applied with the options this library
 * used to pass to it:
 *
 * - children of block elements are indented by 2 spaces per level
 * - a block element or a comment starts on a new line
 * - inline content (text and inline elements) flows on the current line
 * - a closing tag goes on its own line when a direct child started a new line
 * - the content of `pre`, `textarea`, `code`, `em`, `strong`, `span`,
 *   `script` and `style` is kept exactly as it is
 * - runs of whitespace in text collapse to a single space, or to one line
 *   break when the run contained one
 */

const INDENT = '  '

// Elements that `js-beautify` treats as inline (its default `inline` option).
// Custom elements are treated as block elements.
const INLINE_ELEMENTS = new Set([
  'a',
  'abbr',
  'acronym',
  'area',
  'audio',
  'b',
  'bdi',
  'bdo',
  'big',
  'br',
  'button',
  'canvas',
  'cite',
  'code',
  'data',
  'datalist',
  'del',
  'dfn',
  'em',
  'embed',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'map',
  'mark',
  'math',
  'meter',
  'noscript',
  'object',
  'output',
  'progress',
  'q',
  'ruby',
  's',
  'samp',
  'select',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'svg',
  'template',
  'text',
  'textarea',
  'time',
  'tt',
  'u',
  'var',
  'video',
  'wbr'
])

// Elements whose content is output exactly as it is.
const UNFORMATTED_ELEMENTS = new Set([
  'code',
  'em',
  'pre',
  'script',
  'span',
  'strong',
  'style',
  'textarea'
])

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const COMMENT_NODE = 8

const WHITESPACE = /[ \t\n\r\f]+/g

function tagName(el: Element): string {
  return el.localName.toLowerCase()
}

function isBlock(node: Node): boolean {
  if (node.nodeType === COMMENT_NODE) return true
  if (node.nodeType !== ELEMENT_NODE) return false
  return !INLINE_ELEMENTS.has(tagName(node as Element))
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/ /g, '&nbsp;')
}

function formatText(text: string, depth: number): string {
  return escapeText(text).replace(WHITESPACE, match =>
    match.includes('\n') ? '\n' + INDENT.repeat(depth) : ' '
  )
}

function openAndCloseTags(el: Element): [string, string] {
  const shallow = (el.cloneNode(false) as Element).outerHTML
  if (VOID_ELEMENTS.has(tagName(el))) return [shallow, '']
  const closeTagStart = shallow.lastIndexOf('</')
  return [shallow.slice(0, closeTagStart), shallow.slice(closeTagStart)]
}

function formatElement(el: Element, depth: number): string {
  const name = tagName(el)
  if (VOID_ELEMENTS.has(name) || UNFORMATTED_ELEMENTS.has(name)) {
    return el.outerHTML
  }

  const [openTag, closeTag] = openAndCloseTags(el)
  // the content of a <template> element lives in its content fragment
  const children = Array.from(
    el instanceof HTMLTemplateElement ? el.content.childNodes : el.childNodes
  )

  let content = ''
  let brokeLine = false
  children.forEach((child, index) => {
    if (isBlock(child)) {
      content += '\n' + INDENT.repeat(depth + 1) + formatNode(child, depth + 1)
      brokeLine = true
      return
    }
    if (child.nodeType === TEXT_NODE) {
      let text = formatText(child.textContent ?? '', depth + 1)
      // whitespace next to a line break is redundant
      const previous = children[index - 1]
      const next = children[index + 1]
      if (previous && isBlock(previous)) text = text.replace(/^\s+/, '')
      if (next && isBlock(next)) text = text.replace(/\s+$/, '')
      content += text
      return
    }
    content += formatNode(child, depth + 1)
  })

  // the closing tag goes on its own line, aligned with the opening tag
  if (brokeLine || /\n[ \t]*$/.test(content)) {
    content = content.replace(/\s+$/, '') + '\n' + INDENT.repeat(depth)
  }
  return openTag + content + closeTag
}

function formatNode(node: Node, depth: number): string {
  switch (node.nodeType) {
    case ELEMENT_NODE:
      return formatElement(node as Element, depth)
    case TEXT_NODE:
      return formatText(node.textContent ?? '', depth)
    case COMMENT_NODE:
      return `<!--${(node as Comment).data}-->`
    default:
      return new XMLSerializer().serializeToString(node)
  }
}

/**
 * Formats a DOM node (and its descendants) as an indented HTML string.
 */
export function formatHtml(node: Node): string {
  return formatNode(node, 0).trim()
}
