/*!
 * isElementVisible
 * Adapted from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */

type StylableElement = HTMLElement | SVGElement

function isStyleVisible<T extends StylableElement>(element: T) {
  const { display, visibility, opacity } = element.style
  return (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse' &&
    opacity !== '0'
  )
}

function isAttributeVisible<T extends StylableElement>(element: T) {
  return (
    !element.hasAttribute('hidden') &&
    (element.nodeName === 'DETAILS' ? element.hasAttribute('open') : true)
  )
}

export function isElementVisible<T extends StylableElement>(element: T) {
  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element) &&
    (!element.parentElement || isElementVisible(element.parentElement))
  )
}
