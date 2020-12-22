import { expectError, expectType } from 'tsd'
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

// FIXME: not sure if this one is possible
// expectError(config.plugins.VueWrapper.install(PluginWithoutOptions, {}))
expectError(config.plugins.VueWrapper.install(PluginWithOptions, { msg: true }))
expectError(config.plugins.VueWrapper.install(PluginWithOptions, {}))
expectError(config.plugins.VueWrapper.install(PluginWithOptionalOptions, {}))
expectError(config.plugins.VueWrapper.install(PluginWithOptionalOptions2, {}))
