# Vue Test Utils

Component testing utils for Vue 3.

## Languages

[🇫🇷 French version of this README.md](https://github.com/vuejs/test-utils/tree/main/docs/fr/README.md)

## Installation and Usage

- yarn: `yarn add @vue/test-utils --dev`
- npm: `npm install @vue/test-utils --save-dev`

Get started with the [documentation](https://test-utils.vuejs.org/).

## Experimental Vapor mounting

Compiled `<script setup vapor>` components can opt in to DOM mounting on Vue 3.6
(currently tested on RC.16) using Vue's ESM builds:

```ts
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

const wrapper = mount(Counter, {
  experimentalVapor: true,
  props: { label: 'Count' }
})
expect(wrapper.get('button').text()).toBe('Count:0')
await wrapper.get('button').trigger('click')
wrapper.unmount()
```

`experimentalVapor: true` mounts the component as the root of a native
`createVaporApp`. Pure Vapor trees need no plugin. If the tree also renders VDOM
components, pass `global: { plugins: [vaporInteropPlugin] }` just as you would
install the plugin in your app. Test Utils never installs interop automatically.

The returned `VaporWrapper` supports CSS-based DOM assertions/interactions and
manual or automatic unmounting. `vm` contains only unwrapped `defineExpose()` bindings (an empty object
without `defineExpose`), typed from `defineExpose()` for `<script setup vapor>`
components and as `Record<string, unknown>` otherwise. It is not a
`ComponentPublicInstance` and does not expose implicit setup state. Native wrapper
queries read the mount container.

Props can be supplied initially and updated with a typed `setProps`; `emitted` is not
implemented yet and throws explicitly. Component discovery, ref selectors, shallow/stubs,
mounting-option slots/data/mixins/mocks and SSR are also unsupported.
`global.directives` must use the Vapor function signature
`(el, getter, arg, modifiers)`; VDOM object directives are rejected. Defaults set
in `config.global` for VDOM tests (mocks, mixins, stubs and
`renderStubDefaultSlot`) are ignored for Vapor mounts without changing those
defaults for VDOM mounts; passing them explicitly to `mount()` throws.
Default transition stubs and VueWrapper plugin extensions do not apply to Vapor
mounts. Existing VDOM mounting remains compatible with Vue 3.5.

Vapor is only included in Vue's ESM builds. In jsdom or happy-dom, Vitest loads
the Node (CommonJS) builds of Vue and Test Utils, which have no Vapor support.
Point Vitest to the ESM builds instead:

```ts
// vitest.config.ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@vue\/test-utils$/,
        replacement: fileURLToPath(
          new URL(
            './node_modules/@vue/test-utils/dist/vue-test-utils.esm-bundler.mjs',
            import.meta.url
          )
        )
      },
      { find: /^vue$/, replacement: 'vue/dist/vue.runtime.esm-bundler.js' },
      {
        find: /^@vue\/(runtime-dom|runtime-core|reactivity|shared)$/,
        replacement: '@vue/$1/dist/$1.esm-bundler.js'
      }
    ]
  },
  test: {
    environment: 'jsdom',
    server: { deps: { inline: ['@vue/test-utils'] } }
  }
})
```

VDOM components rendering Vapor children can be mounted without
`experimentalVapor` by installing `vaporInteropPlugin` in `global.plugins`.
DOM assertions, `setProps` and `emitted` work on the VDOM wrapper, but
`findComponent`/`findAllComponents` throw when they match a Vapor component, and
VDOM components rendered inside a Vapor component cannot be found.

## Coming from Vue 2 + Test Utils v1?

[Check the migration guide](https://test-utils.vuejs.org/migration/). It's still a work in progress. If you find a problem or something that doesn't work that previously did in Vue Test Utils v1, please open an issue.

## Documentation

See the [docs](https://test-utils.vuejs.org/).

## Development

Get started by running `pnpm install`. You can run the jsdom tests (including Node-only SSR tests) with `pnpm test`.

To run tests in Chromium using Vitest Browser Mode, install Chromium with `pnpm exec playwright install chromium`, then run `pnpm test:browser`. Add `--run` to either test command for a single run instead of watch mode.

## Releasing

Releases are published to npm from GitHub Actions using npm trusted publishing.
Publishing with npm tokens is disabled, so a release requires:

- write access to the `vuejs/test-utils` repository
- the release commit to be on `main`
- `package.json` to contain the version being released
- approval from a maintainer with access to the `npm-publish` GitHub environment

To cut a release, push a version tag from `main`:

```sh
git checkout main
git pull
git tag v2.x.y
git push origin v2.x.y
```

Pushing a `v*` tag starts the release workflow.
The workflow builds the package, pauses for approval in the `npm-publish` environment,
then publishes `@vue/test-utils` to npm after approval.
The person who pushed the tag cannot self-approve the publish step.

## Contributing Docs

All the documentation files can be found in `docs`. It contains the English markdown files while translation(s) are stored in their corresponding `<lang>` sub-folder(s):

- [`fr`](https://github.com/vuejs/test-utils/tree/main/docs/fr): French translation.

Besides that, the `.vitepress` sub-folder contains the config and theme, including the i18n information.

- `pnpm docs:dev`: Start the docs dev server.
- `pnpm docs:build`: Build the docs.

To add or maintain the translations, we follow the [Vue Ecosystem Translation Guidelines](https://github.com/vuejs-translations/guidelines/blob/main/README_ECOSYSTEM.md).

- `pnpm docs:translation:status [<lang>]`: Show the translation status for your language. If you don't specify a language, it will show the status for all languages.
- `pnpm docs:translation:compare <lang>`: Compare the docs with the latest checkpoint for your language.
- `pnpm docs:translation:update <lang> [<commit>]`: Update the checkpoint for your language. The checkpoint will be set by the latest commit hash. However, you can also specify a commit hash manually.
