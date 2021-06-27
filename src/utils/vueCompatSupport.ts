import { FindAllComponentsSelector } from '../types'

export function convertLegacyVueExtendSelector(
  selector: any
): FindAllComponentsSelector {
  if (
    typeof selector === 'function' &&
    selector.name === 'SubVue' &&
    selector.options
  ) {
    return selector.options
  }

  return selector
}
