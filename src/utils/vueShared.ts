const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}

const camelizeRE = /-(\w)/g
export const camelize = cacheStringFunction((str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

export const capitalize = cacheStringFunction((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cacheStringFunction((str: string): string => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 2,
  STATEFUL_COMPONENT = 4,
  TEXT_CHILDREN = 8,
  ARRAY_CHILDREN = 16,
  SLOTS_CHILDREN = 32,
  TELEPORT = 64,
  SUSPENSE = 128,
  COMPONENT_SHOULD_KEEP_ALIVE = 256,
  COMPONENT_KEPT_ALIVE = 512,
  COMPONENT = 6
}
