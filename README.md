# vue-test-utils-next

The next iteration of Vue Test Utils. Based of the work in [vue-testing-framework](https://github.com/lmiller1990/vue-testing-framework).

Docs are located in [this repo](https://github.com/vuejs/vue-test-utils-next-docs). That's because running Vuepress alongside a repo with Vue 3 causes conflicts - Vuepress expects to be running against Vue 2. This seems like the most simple solution during development.

## Development

It's a pretty small codebase at the moment. Get started by running `yarn install`. You can run the tests with `yarn test`. That's it!

Lots to do. Most of the ideas and roadmap is in Notion. See issues for some basic TODOs.

## Working with `.vue` files

There is [`vue-jest`](https://github.com/vuejs/vue-jest) for loading `.vue` files into Jest for Vue 2. I'm not sure how much work it would be to migrate it to use `@vue/sfc-compiler`. To get going quickly, I hacked together a simple Jest transformer using [`@vue/sfc-compiler`](https://github.com/lmiller1990/vue-jest-transformer). It's probably bad, but it's enough to let us use `.vue` files in Jest in this project. I am finding render functions more ideal, since you can inline them in the tests and get IDE completion, but both are fine.

## Contributing

This is still very much pre-beta - if you want to add a feature, have a hack or ping someone in Discord to chat, or check out the issues.
