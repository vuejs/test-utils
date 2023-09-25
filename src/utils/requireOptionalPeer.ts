import { createRequire } from 'module'

// @ts-ignore - cjs build will complain about import.meta not being allowed, but its not actually used as __filename will be defined for cjs
const file = typeof __filename !== 'undefined' ? __filename : import.meta.url
const require = createRequire(file)

export function requireOptional(packageName: string): unknown {
  try {
    return require(packageName)
  } catch {
    throw new Error(
      `The optional peer-dependency ${packageName} is needed for this test and was not found. Please ensure that it has been installed as a dev-dependency and retry.`
    )
  }
}

export function requireVueCompilerDom() {
  return requireOptional(
    '@vue/compiler-dom'
  ) as typeof import('@vue/compiler-dom')
}

export function requireVueServerRenderer() {
  return requireOptional(
    '@vue/server-renderer'
  ) as typeof import('@vue/server-renderer')
}
