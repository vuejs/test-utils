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

Vue Test Utils 是与测试框架无关的——你可以与任何你喜欢的测试运行器一起使用。

### Vitest（推荐）

[Vitest](https://vitest.dev/) 是 Vue 项目推荐的测试运行器。它基于 Vite 构建，原生支持 `.vue` 文件，并提供快速、现代的测试体验，具有原生 ESM 支持。

```shell
npm install --save-dev vitest
```

在基于 Vite 的项目中使用 Vitest 时，无需额外的转换配置。更多详情请参阅 [Vitest 入门指南](https://vitest.dev/guide/)。

### Jest

你也可以将 [Jest](https://jestjs.io/) 与 Vue Test Utils 一起使用。要在 Jest 中加载 `.vue` 文件，你需要 `vue-jest`。你可以通过 `vue-jest@next` 安装它，并使用 Jest 的 [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) 选项进行配置。

继续阅读以了解更多关于 Vue Test Utils 的信息。
