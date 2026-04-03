# Installation

::: code-group

```shell [npm]
npm install --save-dev @vue/test-utils
```

```shell [yarn]
yarn add --dev @vue/test-utils
```

:::

## Utilisation

Vue Test Utils est un outil indépendant de tout framework - vous pouvez l'utiliser avec le gestionnaire de tests de votre choix.

### Vitest (Recommandé)

[Vitest](https://vitest.dev/) est le gestionnaire de tests recommandé pour les projets Vue. Il est construit sur Vite, prend en charge les fichiers `.vue` nativement et offre une expérience de test rapide et moderne avec le support natif des modules ESM.

```shell
npm install --save-dev vitest
```

Aucune configuration de transformation supplémentaire n'est nécessaire lorsque vous utilisez Vitest avec un projet basé sur Vite. Consultez le [guide de démarrage de Vitest](https://vitest.dev/guide/) pour plus de détails.

### Jest

Vous pouvez également utiliser [Jest](https://jestjs.io/) avec Vue Test Utils. Pour charger les fichiers `.vue` avec Jest, vous aurez besoin de `vue-jest`. Vous pouvez l'installer avec `vue-jest@next` et le configurer avec l'option [transform](https://jestjs.io/docs/fr/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) de Jest.

Continuez à lire pour en savoir plus sur Vue Test Utils.
