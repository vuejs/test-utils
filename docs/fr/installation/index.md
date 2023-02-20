# Installation

```bash
npm install --save-dev @vue/test-utils

# or
yarn add --dev @vue/test-utils
```

## Utilisation

Vue Test Utils est un outil indépendant de tout framework - vous pouvez l'utiliser avec le gestionnaire de tests de votre choix. La manière la plus simple pour l'essayer est d'utiliser [Jest](https://jestjs.io/), un gestionnaire de tests populaire.

Pour charger les fichiers `.vue` avec Jest, vous aurez besoin de `vue-jest`. `vue-jest` v5 est celui qui prend en charge Vue 3. Il est encore en version alpha, tout comme le reste de l'écosystème Vue.js 3, alors si vous rencontrez un bug, veuillez le signaler [ici](https://github.com/vuejs/vue-jest/) et préciser que vous utilisez `vue-jest` v5.

Vous pouvez l'installer avec `vue-jest@next`. Ensuite, vous devez le configurer avec l'option [transform](https://jestjs.io/docs/fr/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) de Jest.

Si vous ne voulez pas le configurer vous-même, vous pouvez obtenir un dépôt minimal avec tout paramétré [ici](https://github.com/lmiller1990/vtu-next-demo).

Continuez à lire pour en savoir plus sur Vue Test Utils.
