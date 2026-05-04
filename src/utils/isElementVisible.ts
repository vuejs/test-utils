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

function isAttributeVisible<T extends Element>(
  element: T,
  childElement?: Element
) {
  if (element.hasAttribute('hidden')) return false

  // A closed <details> renders only its <summary>: the <details> itself is
  // visible, the <summary> is visible, but other descendants are not.
  if (
    element.nodeName === 'DETAILS' &&
    !element.hasAttribute('open') &&
    childElement &&
    childElement.nodeName !== 'SUMMARY'
  ) {
    return false
  }

  return true
}

export function isElementVisible<T extends Element>(
  element: T,
  childElement?: Element
): boolean {
  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  )
}
