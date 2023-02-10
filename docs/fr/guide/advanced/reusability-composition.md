# Réutilisabilité et Composition

## Tester des composables

Lorsque vous travaillez avec l'API de composition et que vous créez des composables, vous voulez souvent n'en tester que le composable seul. Commençons par un exemple simple :

```typescript
export function useCounter() {
  const counter = ref(0);

  function increase() {
    counter.value += 1;
  }

  return { counter, increase };
};
```

Dans ce cas, vous n'avez pas vraiment besoin de `@vue/test-utils`. Regardez par vous-même :

```typescript
test('incrémente le compteur', () => {
  const { counter, increase } = useCounter();

  expect(counter.value).toBe(0);

  increase();

  expect(counter.value).toBe(1);
});
```

Pour tester des composables plus complexes utilisant des hooks de cycle de vie comme `onMounted` ou la gestion de `provide` / `inject`, vous pouvez créer un composant d'aide aux tests pour vous y aider. Le composable suivant récupère les données de l'utilisateur dans le hook `onMounted`.

```typescript
export function useUser(userId) {
  const user = ref();
  
  function fetchUser(id) {
    axios.get(`users/${id}`).then(response => (user.value = response.data));
  }

  onMounted(() => fetchUser(userId));

  return { user };
};
```

Pour tester ce composable, vous pouvez créer un simple composant `TestComponent` dans les tests. Le `TestComponent` devrait utiliser le composable exactement de la même manière que les composants réels l'utiliseraient.

```typescript
// Simulation (mock) de la requête API
jest.spyOn(axios, 'get').mockResolvedValue({ data: { id: 1, name: 'Utilisateur' } });

test('récupère l\'utilisateur au moment du montage', async () => {
  const TestComponent = defineComponent({
    props: {
      // Définition des `props`, pour tester le composable avec des entrées différentes.
      userId: {
        type: Number,
        required: true,
      },
    },
    setup (props) {
      return {
        // Nous appelons le composable et l'exposons dans le retour de l'instance du composant. Nous pourrons donc ensuite y accéder dans `wrapper.vm`.
        ...useUser(props.userId),
      };
    },
  });

  const wrapper = mount(TestComponent, {
    props: {
      userId: 1,
    },
  });

  expect(wrapper.vm.user).toBeUndefined();

  await flushPromises();

  expect(wrapper.vm.user).toEqual({ id: 1, name: 'Utilisateur' });
});
```

## `provide` / `inject`

Vue offre un moyen de passer des `props` à tous les composants enfants avec `provide` et `inject`. La meilleure façon de tester ce comportement est de tester l'ensemble de l'arbre (parent + enfants). Mais parfois, cela n'est pas possible, car l'arbre est trop complexe ou vous voulez simplement tester un seul composable.

### Tester `provide`

Disons que vous vouliez tester le composant suivant :
```vue
<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
provide('ma-clef', 'données');
</script>
```

Dans ce cas, vous pouvez soit rendre un composant enfant et tester une utilisation correcte de `provide`, soit créer un simple composant d'aide aux tests et le passer dans le `slot` par défaut.

```typescript
test('fourni de la donnée correcte', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
      const value = inject('ma-clef');
      return { value };
    },
  });

  const wrapper = mount(ParentComponent, {
    slots: {
      default: () => h(TestComponent),
    },
  });

  expect(wrapper.find('#provide-test').text()).toBe('données');
});
```

Si votre composant ne contient pas de `slot`, vous pouvez utiliser un composant de remplacement (`stub`) et remplacer un composant enfant par votre composant de test :

```vue
<template>
  <div>
    <SomeChild />
  </div>
</template>

<script setup>
import SomeChild from './SomeChild.vue';

provide('my-key', 'some-data');
</script>
```

Le test sera :

```typescript
test('fournir de la donnée correcte', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
      const value = inject('ma-clef');
      return { value };
    },
  });

  const wrapper = mount(ParentComponent, {
    global: {
      stubs: {
        SomeChild: TestComponent,
      },
    },
  });

  expect(wrapper.find('#provide-test').text()).toBe('données');
});
```

### Tester `inject`

Lorsque votre composant utilise `inject` et que vous devez passer des données avec `provide`, vous pouvez utiliser l'option `global.provide`.

```vue
<template>
  <div>
    {{ value }}
  </div>
</template>

<script setup>
const value = inject('ma-clef');
</script>
```

Le test unitaire devrait ressembler à ça : 

```typescript
test('affiche de la donnée correcte', () => {
  const wrapper = mount(MonComposant, {
    global: {
      provide: {
        'ma-clef': 'données',
      },
    },
  });

  expect(wrapper.text()).toBe('some-data');
});
```

## Conclusion

- Vous pouvez tester des composables simples sans l'aide de composant et `@vue/test-utils`.
- Créez un composant d'aide aux tests (`TestComponent`) pour tester des composables plus complexes.
- Créez un composant d'aide aux tests pour vérifier que votre composant fournit les bonnes données avec `provide`.
- Utilisez `global.provide` pour passer des données à votre composant qui utilise `inject`.
