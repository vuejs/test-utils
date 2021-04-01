import { expectError } from './index'
import { ComponentPublicInstance } from 'vue'
import { config, VueWrapper } from '../src'

interface OptionsI {
  msg: string
}

function PluginWithOptions(
  wrapper: VueWrapper<ComponentPublicInstance>,
  options: OptionsI
) {
  return {}
}

function PluginWithoutOptions(wrapper: VueWrapper<ComponentPublicInstance>) {
  return {}
}

function PluginWithOptionalOptions(
  wrapper: VueWrapper<ComponentPublicInstance>,
  options: OptionsI = { msg: 'hi' }
) {
  return {}
}

function PluginWithOptionalOptions2(
  wrapper: VueWrapper<ComponentPublicInstance>,
  options?: OptionsI
) {
  return {}
}

config.plugins.VueWrapper.install(PluginWithOptions, { msg: 'Hello' })
config.plugins.VueWrapper.install(PluginWithoutOptions)
config.plugins.VueWrapper.install(PluginWithOptionalOptions)
config.plugins.VueWrapper.install(PluginWithOptionalOptions2)
config.plugins.VueWrapper.install(PluginWithOptionalOptions, { msg: 'hello' })
config.plugins.VueWrapper.install(PluginWithOptionalOptions2, { msg: 'hello' })

// uncertain if it is possible to forbid this usage
// expectError(config.plugins.VueWrapper.install(PluginWithoutOptions, {}))
// @ts-expect-error option has the wrong type
expectError(config.plugins.VueWrapper.install(PluginWithOptions, { msg: true }))
// @ts-expect-error option is mandatory
expectError(config.plugins.VueWrapper.install(PluginWithOptions, {}))
// @ts-expect-error option is mandatory
expectError(config.plugins.VueWrapper.install(PluginWithOptionalOptions, {}))
// @ts-expect-error option is mandatory
expectError(config.plugins.VueWrapper.install(PluginWithOptionalOptions2, {}))
