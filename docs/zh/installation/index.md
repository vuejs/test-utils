# 安装

::: code-group

```shell [npm]
npm install --save-dev @vue/test-utils
```

```shell [yarn]
yarn add --dev @vue/test-utils
```

:::

## 用法

Vue Test Utils 是与测试框架无关的——你可以与任何你喜欢的测试运行器一起使用。最简单的尝试方式是使用 [Jest](https://jestjs.io/)，这是一个流行的测试运行器。

你需要 `vue-jest` 在 Jest 中加载 `.vue` 文件。`vue-jest` v5 是支持 Vue 3 的版本。它和 Vue.js 3 生态系统的其他部分一样仍处于 alpha 阶段。如果你发现任何错误，请在[这里](https://github.com/vuejs/vue-jest/)报告，并注明你正在使用 `vue-jest` v5。

你可以通过 `vue-jest@next` 安装它。然后，你需要使用 Jest 的 [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) 选项进行配置。

如果你不想自己配置，可以在[这里](https://github.com/lmiller1990/vtu-next-demo)获取一个设置好的最小化仓库。

继续阅读以了解更多关于 Vue Test Utils 的信息。
