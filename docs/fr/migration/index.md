# Migrer depuis Vue Test Utils v1

Voici une révision des modifications de VTU v1 à VTU v2 et quelques extraits de code pour montrer les modifications nécessaires à la migration. Si vous rencontrez un bug ou une différence de comportement non documentée ici, veuillez [ouvrir un ticket](https://github.com/vuejs/test-utils/issues/new).

## Changements

### `propsData` est maintenant `props`

Dans VTU v1, vous passiez les `props` à l'aide de l'option `mount()` : `propsData`. Cela pouvait porter à confusion, car vous déclariez les props dans l'option `props` dans vos composants Vue. Maintenant, vous pouvez passer les `props` à l'aide de l'option de `mount()` : `props`. `propsData` restera néanmoins pris en charge par souci de compatibilité.

**Avant**:

```js
const App = {
  props: ['foo'],
};

const wrapper = mount(App, {
  propsData: {
    foo: 'bar',
  }
});
```

**Après**:

```js
const App = {
  props: ['foo'],
}

const wrapper = mount(App, {
  props: {
    foo: 'bar',
  }
});
```

### Plus de `createLocalVue`

En Vue 2, il était courant pour les plugins de modifier l'instance globale de Vue et d'attacher diverses méthodes au prototype. Depuis Vue 3, ce n'est plus le cas - vous créez une nouvelle application Vue à l'aide de `createApp` plutôt que `new Vue`, et installez les plugins avec `createApp(App).use(/* ... */)`.

Pour éviter de polluer l'instance globale de Vue dans Vue Test Utils v1, nous avons fourni une fonction `createLocalVue` et une option pour `mount()` : `localVue`. Cela vous permettrait d'avoir une instance Vue isolée pour chaque test, évitant que les tests interfèrent entre eux. Ce n'est plus un problème en Vue 3, car les plugins, les mixins, etc. ne modifient pas l'instance globale de Vue.

La plupart du temps, dans le cas où vous auriez du utilisé `createLocalVue` et l'option de `mount()` `localVue` pour installer un plugin, un mixin ou une directive, vous pouvez dorénavant utiliser l'option `global`. Voici un exemple de composant et de test qui utilisait `localVue`, et comment cela se présente maintenant (en utilisant `global.plugins`, Vuex étant un plugin) :

**Avant**:

```js
import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils';

const App = {
  computed: {
    count() {
      return this.$state.count;
    },
  },
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({
  state: { count: 1 },
});

const wrapper = mount(App, {
  store,
  localVue,
})
```

**Après**:

```js
import { createStore } from 'vuex';
import { mount } from '@vue/test-utils';

const App = {
  computed: {
    count() {
      return this.$state.count;
    },
  },
};

const store = createStore({
  state() {
    return { count: 1 };
  },
});

const wrapper = mount(App, {
  global: {
    plugins: [store],
  },
});
```

### `mocks` and `stubs` sont maintenant dans `global`

Les `mocks` et les `stubs` sont appliqués à tous les composants, pas seulement à celui que vous passez à `mount()`. Pour aller dans ce sens, les `mocks` et les `stubs` sont dans la nouvelle option de `mount()` `global` :

**Avant**:

```js
const $route = {
  params: {
    id: '1',
  },
};

const wrapper = mount(App, {
  stubs: {
    Foo: true,
  },
  mocks: {
    $route,
  },
});
```

**Après**:

```js
const $route = {
  params: {
    id: '1',
  },
};

const wrapper = mount(App, {
  global: {
    stubs: {
      Foo: true,
    },
    mocks: {
      $route,
    },
  },
});
```

### `shallowMount` et `renderStubDefaultSlot`

`shallowMount` est destiné à substituer tous les composants personnalisés. Comme dans Vue Test Utils v1, les composants substitués affichent toujours leur `<slot/>` par défaut. Bien que ce ne soit pas intentionnel, certains utilisateurs appréciaient cette fonctionnalité. Néanmoins, ce comportement est corrigé en v2 - **le contenu du slot pour un composant substitué n'est pas affiché**.

Prenons le code suivant :

```js
import { shallowMount } from '@vue/test-utils';

const Foo = {
  template: `<div><slot /></div>`,
};

const App = {
  components: { Foo },
  template: `
    <div>
      <Foo>
        Foo Slot
      </Foo>
    </div>
  `,
};
```

**Avant**:

```js
describe('App', () => {
  it('affiche le HTML', () => {
    const wrapper = shallowMount(App);
    console.log(wrapper.html());
    // renders:
    // <div>
    //   <foo-stub>
    //     Foo Slot
    //   </foo-stub>
    // </div>
  });
});
```

**Après**:

```js
describe('App', () => {
  it('affiche le HTML', () => {
    const wrapper = shallowMount(App);
    console.log(wrapper.html());
    // renders:
    // <div>
    //   <foo-stub>
    //   </foo-stub>
    // </div>
  });
});
```

Vous pouvez restaurer l'ancien comportement de la manière suivante :

```js
import { config } from '@vue/test-utils';

config.global.renderStubDefaultSlot = true;
```

### `destroy` est maintenant `unmount` pour correspondre Vue 3

Vue 3 a renommé `vm.$destroy` en `vm.$unmount`. Vue Test Utils a suivi le mouvement : `wrapper.destroy()` est maintenant `wrapper.unmount()`.

### `scopedSlots` est maintenant fusionné avec `slots`

Vue 3 a unifié la syntaxe `slot` et `scoped-slot` en une seule syntaxe, `v-slot`. Vous pouvez en apprendre plus à ce sujet dans [la documentation](https://v3.vuejs.org/guide/migration/slots-unification.html#overview). Puisque `slot` et `scoped-slot` sont maintenant fusionnés, l'option de `mount()` `scopedSlots` est maintenant obsolète - utilisez simplement l'option de `mount()` `slots` pour tout dorénavant.

### La portée des `slots` est maintenant exposé dans `params`

Lors de l'utilisation de `template` pour le contenu d'un `slot`, si ce n'est pas explicitement défini à l'aide d'un tag `<template #slot-name="scopeVar">`, la portée d'un `slot` devient disponible dans l'objet `params` lorsque le `slot` est monté.

```diff
shallowMount(Component, {
-  scopedSlots: {
+  slots: {
-    default: '<p>{{props.index}},{{props.text}}</p>'
+    default: '<p>{{params.index}},{{params.text}}</p>'
  },
});
````

### `findAll().at()` est supprimé

`findAll()` retourne maintenant un tableau de `DOMWrappers`.

**Avant:**

```js
wrapper.findAll('[data-test="token"]').at(0);
```

**Après:**

```js
wrapper.findAll('[data-test="token"]')[0];
```

## Notes sur les mises à niveau des exécuteurs de tests.

> Vue Test Utils est un outil indépendant de tout framework - vous pouvez l'utiliser avec le gestionnaire de tests de votre choix.

Cette phrase est un fondement de `@vue/test-utils`. Mais nous reconnaissons que la migration de code et de suites de tests vers `vue@3` peut être, dans certains scénarios, un effort considérable.

Cette section essaie de regrouper les pièges courants repérés par notre communauté lors de leurs migrations et de la mise à niveau de leur solution de tests vers des versions plus modernes. Ces dysfonctionnements sont indépendants de `@vue/test-utils`, mais nous espérons qu'ils peuvent vous aider à terminer cette grosse étape de migration.

### `@vue/vue3-jest` + `jest@^28`

Si vous avez décidé de mettre à niveau vos gestionnaires de tests vers une version plus moderne, gardez cela à l'esprit.

#### `ReferenceError: Vue is not defined` [vue-jest#479](https://github.com/vuejs/vue-jest/issues/479)

Lorsque la dépendance `jest-environment-jsdom` est utilisée, elle utilise par défaut les librairies de l'[entrée `browser`](https://jestjs.io/fr/docs/configuration#testenvironmentoptions-object) du `package.json`. Vous pouvez la surcharger pour utiliser des importations `node` à la place et corriger cette erreur :

```js
// jest.config.js
module.exports = {
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
```
<br/>

#### Les `snapshots` incluent maintenant les commentaires

Si vous utilisez les tests `snapshot` et que les commentaires restent dans vos `snapshots`, notez que les `commentaires` sont désormais toujours [préservés](https://vuejs.org/api/application.html#app-config-compileroptions-comments) et ne sont supprimés qu'en production. Vous pouvez remplacer ce comportement en ajustant `app.config.compilerOptions` pour les supprimer des instantanés également :
  - Avec `vue-jest` [config](https://github.com/vuejs/vue-jest#compiler-options-in-vue-3).
    ```js
    // jest.config.js
    module.exports = {
      globals: {
        'vue-jest': {
          compilerOptions: {
            comments: false,
          },
        },
      },
    };
    ```
 - Avec `@vue/test-utils` [`mountingOptions.global.config`](https://test-utils.vuejs.org/fr/api/#global) soit de façon globale ou pour chaque test individuellement.
