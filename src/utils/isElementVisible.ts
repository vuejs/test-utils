/*!
 * isElementVisible
 * Adapted from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */

function isStyleVisible<T extends Element>(element: T) {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    return false
  }

  const computed = getComputedStyle(element)
  // Per spec, elements that are not connected to a document have no computed
  // style (jsdom >= 31 returns empty values), which is the case when mounting
  // without `attachTo`. Fall back to the inline style for those properties.
  const display = computed.display || element.style.display
  const visibility = computed.visibility || element.style.visibility
  const opacity = computed.opacity || element.style.opacity

  return (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse' &&
    opacity !== '0'
  )
}

/**
 * checks if an element is visible by checking its hidden attribute and parent visibility.
 * @param element
 * @returns boolean
 */
function isElementVisibleByAttribute<T extends Element>(element: T) {
  if (element instanceof HTMLElement && element.hidden) {
    return false
  }

  return true
}

/**
 * checks if an element is hidden by a closed details element.
 * @param element
 * @returns boolean
 */
function isHiddenByClosedDetails<T extends Element>(element: T) {
  const summary = element.closest('summary')
  let parent = element.parentElement

  while (parent) {
    if (parent.nodeName === 'DETAILS' && !(parent as HTMLDetailsElement).open) {
      // If no <summary> ancestor exists, or the <summary> is not a direct child of this <details>,
      // then the content is hidden
      if (!summary || summary.parentElement !== parent) {
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
    isElementVisibleByAttribute(element) &&
    !isHiddenByClosedDetails(element) &&
    (!element.parentElement || isElementVisible(element.parentElement))
  )
}
