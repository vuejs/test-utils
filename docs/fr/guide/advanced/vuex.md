# Tester Vuex

Vuex n'est qu'un détail d'implémentation ; aucun traitement spécial n'est nécessaire pour tester les composants en utilisant Vuex. Cependant, il existe certaines techniques qui peuvent rendre vos tests plus faciles à lire et à écrire. Nous les décrivons dans cette section.

Ce guide part du principe que vous êtes familier avec Vuex. La version 4 de Vuex est celle qui fonctionne avec Vue.js 3. Lisez la documentation [ici](https://next.vuex.vuejs.org/).

## Un Exemple Simple

Voici un `store` Vuex simple et un composant qui dépend de ce `store` Vuex&nbsp;:

```js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      count: 0,
    };
  },
  mutations: {
    increment(state: any) {
      state.count += 1;
    },
  },
});
```

Le `store` stocke simplement un compteur, l'incrémentant lorsque la mutation `increment` est appelée. C'est le composant que nous allons tester&nbsp;:

```js
const App = {
  template: `
    <div>
      <button @click="increment" />
      Compteur: {{ count }}
    </div>
  `,
  computed: {
    count() {
      return this.$store.state.count;
    },
  },
  methods: {
    increment() {
      this.$store.commit('increment');
    },
  },
};
```

## Tester un Vrai Store Vuex

Pour tester complètement que ce composant et le `store` Vuex fonctionnent, nous allons cliquer sur le `<button>` et vérifier que le compteur est augmenté. Dans vos applications Vue, généralement dans `main.js`, vous installez Vuex de cette façon&nbsp;:

```js
const app = createApp(App);
app.use(store);
```

C'est parce que Vuex est un plugin. Les plugins sont appliqués en appelant `app.use` et en passant le plugin.

Vue Test Utils vous permet également d'installer des plugins, en utilisant l'option de `mount`&nbsp;: `global.plugins`.

```typescript
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      count: 0,
    };
  },
  mutations: {
    increment(state: any) {
      state.count += 1;
    },
  },
});

test('vuex', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [store],
    },
  });

  await wrapper.find('button').trigger('click');

  expect(wrapper.html()).toContain('Compteur: 1');
});
```

Après avoir installé le plugin, nous utilisons `trigger` pour cliquer sur le bouton et vérifier que `count` est incrémenté. Ce type de test, qui couvre l'interaction entre différents systèmes (dans ce cas, le composant et le `store`), est connu sous le nom de test d'intégration.

## Tester avec un Store Simulé (Mocked)

En revanche, un test unitaire peut isoler et tester le composant et le `store` séparément. Cela peut être utile si vous avez une application très volumineuse avec un `store` complexe. Pour ce cas d'utilisation, vous pouvez simuler les parties du `store` qui vous intéressent à l'aide de `global.mocks`&nbsp;:

```js
test('vuex utilise un store simulé', async () => {
  const $store = {
    state: {
      count: 25,
    },
    commit: jest.fn(),
  }

  const wrapper = mount(App, {
    global: {
      mocks: {
        $store,
      },
    },
  });

  expect(wrapper.html()).toContain('Compteur: 25');
  await wrapper.find('button').trigger('click');
  expect($store.commit).toHaveBeenCalled();
});
```

Au lieu d'utiliser un vrai `store` Vuex et de l'installer via `global.plugins`, nous avons créé notre propre `store` factice, en implémentant uniquement les parties de Vuex utilisées dans le composant (dans ce cas, les fonctions `state` et `commit`).

Bien que cela puisse sembler pratique de tester le `store` en isolation, notez qu'il ne vous donnera aucun avertissement si vous cassez votre `store` Vuex. Considérez soigneusement si vous voulez simuler le `store` Vuex ou en utiliser un vrai et comprenez les compromis de chaque solution.

## Tester Vuex de Manière Isolée

Vous souhaiterez peut-être tester vos mutations ou actions Vuex de manière totalement isolée, en particulier si elles sont complexes. Vous n'avez pas besoin de Vue Test Utils pour cela, car un magasin Vuex est simplement du JavaScript standard. Voici comment vous pourriez tester la mutation `increment` sans Vue Test Utils&nbsp;:

```js
test('incrémente la mutation', () => {
  const store = createStore({
    state: {
      count: 0,
    },
    mutations: {
      increment(state) {
        state.count += 1;
      },
    },
  });

  store.commit('increment');

  expect(store.state.count).toBe(1);
});
```

## Prédéfinir le State de Vuex

Il peut parfois être utile d'avoir le `store` Vuex dans un état (`state`) spécifique pour un test. Une technique utile que vous pouvez utiliser, en plus de `global.mocks`, est de créer une fonction qui enveloppe `createStore` et prend un argument pour définir l'état initial. Dans cet exemple, nous étendons `increment` pour prendre un argument supplémentaire, qui sera ajouté à `state.count`. Si cela n'est pas fourni, nous incrémentons simplement `state.count` de 1.

```js
const createVuexStore = (initialState) =>
  createStore({
    state: {
      count: 0,
      ...initialState,
    },
    mutations: {
      increment(state, value = 1) {
        state.count += value;
      },
    },
  });

test('incrémente la mutation sans passer de valeur', () => {
  const store = createVuexStore({ count: 20 });
  store.commit('increment');
  expect(store.state.count).toBe(21);
});

test('incrémente la mutation en passant une valeur', () => {
  const store = createVuexStore({ count: -10 });
  store.commit('increment', 15);
  expect(store.state.count).toBe(5);
});
```

En créant une fonction `createVuexStore` qui prend un état (`state`) initial, nous pouvons facilement définir l'état initial. Cela nous permet de tester tous les cas limites, tout en simplifiant nos tests.

Le [Guide de Test de Vue](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html) contient plus d'exemples pour tester Vuex. Note&nbsp;: les exemples concernent Vue.js 2 et Vue Test Utils v1. Les idées et les concepts sont les mêmes, et le Guide de test de Vue sera mis à jour pour Vue.js 3 et Vue Test Utils 2 dans un avenir proche.

## Tester en utilisant l'API de Composition

Vuex est accessible via une fonction `useStore` lors de l'utilisation de l'API de Composition. [En savoir plus ici](https://next.vuex.vuejs.org/guide/composition-api.html).

`useStore` peut être utilisé avec une clé d'injection facultative et unique comme discuté dans [la documentation Vuex](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function).

Cela ressemble à ceci&nbsp;:

```js
import { createStore } from 'vuex';
import { createApp } from 'vue';

// création d'un symbole unique global pour la clef d'injection
const key = Symbol();

const App = {
  setup () {
    // on utilise la clef pour le store
    const store = useStore(key);
  },
};

const store = createStore({ /* ... */ });
const app = createApp({ /* ... */ });

// il faudra spécifier la clef en second argument en appelant app.use(store)
app.use(store, key);
```

Pour éviter de répéter le passage du paramètre de clé chaque fois que `useStore` est utilisé, la documentation Vuex recommande d'extraire cette logique dans une fonction d'aide (`helper`) et de réutiliser cette fonction au lieu de la fonction `useStore` par défaut. [En savoir plus ici](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function). La démarche fournissant un `store` à l'aide de Vue Test Utils dépend de la façon dont la fonction `useStore` est utilisée dans le composant.

### Tester des Composants utilisant `useStore` sans Clef d'Injection

Sans clé d'injection, les données du `store` peuvent être simplement injectées dans le composant via l'option de `mount()`&nbsp;: `provide`. Le nom du `store` injecté doit être le même que celui dans le composant, par exemple `store`.

#### Un Exemple sans fournir de Clef à `useStore`

```js
import { createStore } from 'vuex';

const store = createStore({
  // ...
});

const wrapper = mount(App, {
  global: {
    provide: {
      store: store,
    },
  },
});
```

### Tester des Composants utilisant `useStore` avec une Clef d'Injection

Lors de l'utilisation du `store` avec une clé d'injection, la méthode précédente ne fonctionnera pas. L'instance du `store` ne sera pas retournée par `useStore`. Pour accéder au bon `store`, l'identificateur doit être fourni.

Il doit s'agir de la clé exacte qui est passée à `useStore` dans la fonction `setup` du composant ou à `useStore` dans la fonction d'aide (`helper`). Comme les symboles JavaScript sont uniques et ne peuvent pas être recréés, il est préférable d'exporter la clé du vrai `store`.

Vous pouvez soit utiliser `global.provide` avec la bonne clé pour injecter le `store`, soit `global.plugins` pour installer le `store` et spécifier la clé&nbsp;:

#### Fournir `useStore` avec Clef en utilisant `global.provide`

```js
// store.js
export const key = Symbol();
```

```js
// app.spec.js
import { createStore } from 'vuex';
import { key } from './store';

const store = createStore({ /* ... */ });

const wrapper = mount(App, {
  global: {
    provide: {
      [key]: store,
    },
  },
});
```

#### Fournir `useStore` avec Clef en utilisant `global.plugins`

```js
// store.js
export const key = Symbol();
```

```js
// app.spec.js
import { createStore } from 'vuex';
import { key } from './store';

const store = createStore({ /* ... */ });

const wrapper = mount(App, {
  global: {
    // pour passer des options aux plugins, utilisez la syntaxe ci-dessous.
    plugins: [[store, key]],
  },
});
```

## Conclusion

- Utilisez `global.plugins` pour installer Vuex comme un plugin.
- Utilisez `global.mocks` pour simuler un objet global, tel que Vuex, pour des cas d'utilisation avancés.
- Évaluez la nécessité de tester les mutations et les actions complexes de Vuex de manière isolée.
- Utilisez `createStore` dans une fonction qui prend un argument pour configurer des scénarios de test spécifiques.
