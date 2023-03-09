# Vue Test Utils

Utilitaire de Test de Composants pour Vue 3.

## Installation et Utilisation

- yarn: `yarn add @vue/test-utils --dev`
- npm: `npm install @vue/test-utils --save-dev`

Lancez-vous avec la [documentation](https://test-utils.vuejs.org/fr).

## Vous venez de Vue 2 + Test Utils v1?

[Jetez un œil au guide de migration](https://test-utils.vuejs.org/migration/fr). C'est encore en cours de développement. Si vous rencontrez un problème ou quelque chose qui ne fonctionne plus alors qu'il fonctionnait auparavant dans Vue Test Utils v1, veuillez ouvrir une question sur GitHub.

## Documentation

Voir la [documentation](https://test-utils.vuejs.org/fr).

## Développement

Commencez en exécutant la commande `pnpm install`. Vous pouvez exécuter les tests avec la commande `pnpm test`. C'est tout&nbsp;!

## Comparaison avec Vue Test Utils v1 (qui cible Vue 2)

Voici un tableau pour ceux qui viennent de VTU 1, comparant les deux API. Certaines choses sont encore en cours de développement.

- ✅ - implémenté
- ❌ - pas encore implémenté
- ⚰️ - ne sera pas implémenté (si vous trouvez un scénario qui prouve son utilité, veuillez ouvrir une question sur GitHub)

### Mounting Options

| option           | status | notes                                                                                 |
|------------------|--------|---------------------------------------------------------------------------------------|
| data             | ✅      |
| slots            | ✅      |
| mocks            | ✅      | situé dans `global`                                                                   |
| propsData        | ✅      | s'appelle maintenant `props`                                                          |
| provide          | ✅      | situé dans `global`                                                                   |
| mixins           | ✅      | (nouveau !) situé dans `global`                                                       |
| plugins          | ✅      | (nouveau !) situé dans `global`                                                       |
| component        | ✅      | (nouveau !) situé dans `global`                                                       |
| directives       | ✅      | (nouveau !) situé dans `global`                                                       |
| stubs            | ✅      |
| attachToDocument | ✅      | renommé en `attachTo`. Voir [here](https://github.com/vuejs/vue-test-utils/pull/1492) |
| attrs            | ✅      | 
| scopedSlots      | ⚰️     | `scopedSlots` sont fusionnés dans `slots` dans Vue 3                                  |
| context          | ⚰️     | différent depuis Vue 2, n'a plus d'utilité.                                           |
| localVue         | ⚰️     | n'est plus obligatoire - Vue 3 il n'y a plus d'instance globale à muter.              |
| listeners        | ⚰️     | n'existe plus dans Vue 3                                                              |
| parentComponent  | ⚰️     |

### Wrapper API (mount)

| method         | status | notes                                                                                                                               |
|----------------|--------|-------------------------------------------------------------------------------------------------------------------------------------|
| attributes     | ✅      |
| classes        | ✅      |
| exists         | ✅      |
| find           | ✅      | seulement la syntaxe `querySelector` est supportée. `find(Comp)` discuté [ici](https://github.com/vuejs/vue-test-utils/issues/1498) |
| emitted        | ✅      |
| findAll        | ✅      | voir ci-dessus. `.vm` est différent de celui de Vue 2. Nous étudions les options.                                                   |
| get            | ✅      |
| html           | ✅      |
| setValue       | ✅      | fonctionne avec les `select`, `checkbox`, `radio button`, `input`, `textarea`. Retourne `nextTick`.                                 |
| text           | ✅      |
| trigger        | ✅      | retourne `nextTick`. Vous pouvez écrire `await wrapper.find('button').trigger('click')`                                             |
| setProps       | ✅      |
| props          | ✅      |
| setData        | ✅      |
| destroy        | ✅      | renommé en `unmount` pour correspondre au cycle de vie Vue 3.                                                                       |
| props          | ✅      |
| isVisible      | ✅      |
| contains       | ⚰️     | utilisez `find`                                                                                                                     |
| emittedByOrder | ⚰️     | utilisez `emitted`                                                                                                                  |
| setSelected    | ⚰️     | fait maintenant parti de `setValue`                                                                                                 |
| setChecked     | ⚰️     | fait maintenant parti de `setValue`                                                                                                 |
| is             | ⚰️     |
| isEmpty        | ⚰️     | utilisez une fonction comme [celle-ci](https://github.com/testing-library/jest-dom#tobeempty)                                       |
| isVueInstance  | ⚰️     |
| name           | ⚰️     |
| setMethods     | ⚰️     |
