/*!
 * isElementVisible
 * Adapted from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */

function isStyleVisible<T extends Element>(element: T) {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    return false
  }

  const { display, visibility, opacity } = getComputedStyle(element)

  return (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse' &&
    opacity !== '0'
  )
}

function isAttributeVisible<T extends Element>(element: T) {
  if (
    element.nodeName === 'SUMMARY' &&
    element.closest('details')
  ) {
    return true
  }
  return (
    !element.hasAttribute('hidden') &&
    (element.nodeName === 'DETAILS' ? element.hasAttribute('open') : true)
  )
}

export function isElementVisible<T extends Element>(element: T): boolean {
  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element) &&
    (element.nodeName === 'SUMMARY' || !element.parentElement || isElementVisible(element.parentElement))
  )
}
