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
  if (element instanceof HTMLInputElement && element.type === 'hidden') {
    return false
  }

  if (element instanceof HTMLElement && element.hidden) {
    return false
  }

  return true
}

function isHiddenByClosedDetails<T extends Element>(element: T) {
  let parent = element.parentElement

  while (parent) {
    if (parent.nodeName === 'DETAILS' && !(parent as HTMLDetailsElement).open) {
      if (
        !(element.nodeName === 'SUMMARY' && element.parentElement === parent)
      ) {
        return true
      }
    }

    parent = parent.parentElement
  }

  return false
}

export function isElementVisible<T extends Element>(element: T): boolean {
  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element) &&
    !isHiddenByClosedDetails(element) &&
    (!element.parentElement || isElementVisible(element.parentElement))
  )
}
