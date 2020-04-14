import { camelize, capitalize } from '@vue/shared'

export function matchName(target, sourceName) {
  const camelized = camelize(target)
  const capitalized = capitalize(camelized)

  return (
    sourceName &&
    (sourceName === target ||
      sourceName === camelized ||
      sourceName === capitalized ||
      capitalize(camelize(sourceName)) === capitalized)
  )
}
