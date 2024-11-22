# 安装

```bash
npm install --save-dev @vue/test-utils

# or
yarn add --dev @vue/test-utils
```

## 用法

Vue Test Utils 是与框架无关的 - 您可以与任何您喜欢的测试运行器一起使用。最简单的尝试方式是使用 [Jest](https://jestjs.io/)，这是一个流行的测试运行器。

要在 Jest 中加载 `.vue` 文件，您需要 `vue-jest`。`vue-jest` v5 是支持 Vue 3 的版本。它仍处于 alpha 阶段，就像 Vue.js 3 生态系统的其他部分一样，所以如果您发现错误，请在 [这里](https://github.com/vuejs/vue-jest/) 报告，并说明您正在使用 `vue-jest` v5。

您可以通过 `vue-jest@next` 安装它。然后，您需要使用 Jest 的 [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) 选项进行配置。

如果您不想自己配置，可以在 [这里](https://github.com/lmiller1990/vtu-next-demo) 获取一个设置好的最小化仓库。

继续阅读以了解更多关于 Vue Test Utils 的信息。
