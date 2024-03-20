import { isObject } from '../utils'
import type { DeepRef } from '../types'
import { isRef } from 'vue'

/**
 * Implementation details of isDeepRef to avoid circular dependencies.
 * It keeps track of visited objects to avoid infinite recursion.
 *
 * @param r The value to check for a Ref.
 * @param visitedObjects a weak map to keep track of visited objects and avoid infinite recursion
 * @returns returns true if the value is a Ref, false otherwise
 */
const deeplyCheckForRef = <T>(
  r: DeepRef<T> | unknown,
  visitedObjects: WeakMap<object, boolean>
): r is DeepRef<T> => {
  if (isRef(r)) return true
  if (!isObject(r)) return false
  if (visitedObjects.has(r)) return false
  visitedObjects.set(r, true)
  return Object.values(r).some((val) => deeplyCheckForRef(val, visitedObjects))
}

/**
 * Checks if the given value is a DeepRef.
 *
 * For both arrays and objects, it will recursively check
 * if any of their values is a Ref.
 *
 * @param {DeepRef<T> | unknown} r - The value to check.
 * @returns {boolean} Returns true if the value is a DeepRef, false otherwise.
 */
export const isDeepRef = <T>(r: DeepRef<T> | unknown): r is DeepRef<T> => {
  const visitedObjects = new WeakMap()
  return deeplyCheckForRef(r, visitedObjects)
}
