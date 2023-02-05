# Comportement asynchrone

Vous avez sûrement remarqué que certaines parties de ce guide utilisent `await` lors de l'appel de certaines méthodes sur `wrapper`, telles que `trigger` et `setValue`. De quoi s'agit-il exactement ?

Vous savez peut-être que Vue met à jour de manière réactive : lorsque vous changez une valeur, le DOM est automatiquement mis à jour pour refléter la dernière valeur. [Vue effectue ces mises à jour de façon asynchrone](https://v3.vuejs.org/guide/change-detection.html#async-update-queue). En revanche, un exécuteur de test tel que Jest s'exécute de manière `synchrone`. Cela peut causer des résultats inattendus dans les tests.

Examinons certaines stratégies pour garantir que Vue met à jour le DOM comme prévu lorsque nous exécutons nos tests.

## Un Exemple Simple - Mettre à jour avec `trigger`

Réutilisons le composant `<Counter>` de [la section Tester les Évènements](../essentials/event-handling) avec une modification ; nous affichons maintenant le `count` dans le `template`.

```js
const Counter = {
  template: `
    <p>Compteur: {{ count }}</p>
    <button @click="handleClick">Incrémenter</button>
  `,
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    handleClick() {
      this.count += 1;
    },
  },
};
```

Écrivons un test pour vérifier que `count` s'incrémente :

```js
test('incrémente de 1', () => {
  const wrapper = mount(Counter);

  wrapper.find('button').trigger('click');

  expect(wrapper.html()).toContain('Compteur: 1');
});
```

Étonnement, cela échoue ! La raison est simple : bien que `count` soit augmenté, Vue ne mettra pas à jour le DOM jusqu'au prochain `tick` du cycle d'événement. Pour cette raison, la vérification (`expect()...`) sera appelée avant que Vue ne mette à jour le DOM.

:::tip
Si vous voulez en savoir plus sur ce comportement de base de JavaScript, jetez un œil à [La boucle d'événement: les microtâches et les macrotâches](https://fr.javascript.info/event-loop).
:::

Mis à part les détails d'implémentation, comment pouvons-nous régler cela ? Vue fournit en réalité un moyen de nous faire attendre jusqu'à ce que le DOM soit mis à jour : `nextTick`.

```js {1,7}
import { nextTick } from 'vue';

test('incrémente de 1', async () => {
  const wrapper = mount(Counter);

  wrapper.find('button').trigger('click');
  await nextTick();

  expect(wrapper.html()).toContain('Compteur: 1');
});
```

Maintenant, le test réussira, car nous veillons à ce que le prochain `tick` ait été exécuté et que le DOM ait été mis à jour avant la vérification.

Comme `await nextTick()` est courant, Vue Test Utils fournit un raccourci. Les méthodes qui impliquent la mise à jour du DOM, telles que `trigger` et `setValue`, retournent `nextTick`, de sorte que vous pouvez simplement les `await` directement :

```js {4}
test('incrémente de 1', async () => {
  const wrapper = mount(Counter);

  await wrapper.find('button').trigger('click');

  expect(wrapper.html()).toContain('Compteur: 1');
});
```

## Résoudre d'autres Comportements Asynchrones

`nextTick` est utile pour s'assurer que des changements dans les données réactives sont reflétés dans le DOM avant de poursuivre le test. Cependant, parfois, vous pouvez souhaiter vous assurer que d'autres comportements asynchrones non liés à Vue sont également terminés.

Un exemple courant est une fonction qui retourne une `Promise`. Peut-être avez-vous déjà simulé votre client HTTP `axios` en utilisant `jest.mock` :

```js
jest.spyOn(axios, 'get').mockResolvedValue({ data: 'de la donnée simulée !' });
```

In this case, Vue has no knowledge of the unresolved Promise, so calling `nextTick` will not work - your assertion may run before it is resolved. For scenarios like this, Vue Test Utils exposes [`flushPromises`](../../api/#flushPromises), which causes all outstanding promises to resolve immediately.
Dans ce cas, Vue n'a aucune idée si la `Promise` est résolue ou non, donc l'appel à `nextTick` ne fonctionnera pas - votre vérification peut s'exécuter avant qu'elle ne soit résolue. Pour des scénarios de ce genre, Vue Test Utils propose [`flushPromises`](../../api/#flushPromises), qui cause l'exécution immédiate de toutes les `Promise` en attente de résolution.

Regardons un exemple :

```js {1,12}
import { flushPromises } from '@vue/test-utils';
import axios from 'axios';

jest.spyOn(axios, 'get').mockResolvedValue({ data: 'de la donnée simulée !' });

test('utilises une méthode pour simuler la méthode d\'axios et flushPromises', async () => {
  // le composant appelle la méthode de `axios` lorsque le composant est créé.
  const wrapper = mount(AxiosComponent);

  await flushPromises() // la `Promise` de la méthode Axios est résolue immédiatement

  // après cette ligne, la requête axios est résolue avec la donnée simulée.
})
```

:::tip
Si vous souhaitez en savoir plus sur les tests de requêtes sur les composants, assurez-vous de consulter la section [Faire des requêtes HTTP](http-requests.md).
:::

## Tester un `setup` asynchrone

Si le composant que vous voulez tester utilise un `setup` asynchrone, vous devez monter le composant à l'intérieur d'un composant `Suspense` (comme vous le faites lorsque vous l'utilisez dans votre application).

Par exemple, prenons ce composant `Async`:

```js
const Async = defineComponent({
  async setup() {
    // await quelque chose
  },
});
```

… doit être testé comme suit :

```js
test('Composant async', () => {
  const TestComponent = defineComponent({
    components: { Async },
    template: '<Suspense><Async/></Suspense>'
  });

  const wrapper = mount(TestComponent);
  // ...
});
```

## Conclusion

- Vue met à jour le DOM de manière asynchrone ; les tests, au contraire, s'exécutent de manière synchrone.
- Utilisez `await nextTick() pour vous assurer que le DOM a été mis à jour avant la continuation des tests.
- Les fonctions qui peuvent mettre à jour le DOM (comme `trigger` et `setValue`) renvoient `nextTick`, il est donc nécessaire de les `await`.
- Utilisez `flushPromises` de Vue Test Utils pour résoudre les promesses non résolues provenant de dépendances non-Vue (telles que les requêtes API).
- Utilisez `Suspense` pour tester les composants avec un `setup` asynchrone.
