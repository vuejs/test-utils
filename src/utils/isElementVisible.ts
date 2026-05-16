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

/**
 * checks if an element is visible by checking its attributes and its parents' attributes.
 * @param element 
 * @returns boolean
 */
function isElementVisibleByAttribute<T extends Element>(element: T) {
  if (element instanceof HTMLInputElement && (element.type === 'hidden' || element.hidden)) {
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
