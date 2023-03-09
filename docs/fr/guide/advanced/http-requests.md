# Faire des requêtes HTTP

Les frameworks de tests modernes proposent déjà de nombreuses fonctionnalités pour les tests de requêtes HTTP. Par conséquent, Vue Test Utils ne dispose pas d'outil unique pour le faire.

Cependant, il s'agit d'une fonctionnalité importante à tester et il y a quelques pièges à connaître.

Dans cette section, nous explorons certains exemples pour effectuer, simuler et vérifier les requêtes HTTP.

## Une liste d'articles d'un blog

Commençons avec un scénario de base. Le composant `PostList` suivant rend une liste d'articles de blog extraits d'une API externe. Pour obtenir ces articles, le composant comporte un élément `button` qui déclenche la requête&nbsp;:

```vue
<template>
  <button @click="getPosts">Récupérer les articles</button>
  <ul>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      posts: null,
    };
  },
  methods: {
    async getPosts() {
      this.posts = await axios.get('/api/posts');
    },
  },
};
</script>
```

Il y a plusieurs choses à faire pour tester correctement ce composant.

Notre premier objectif est de tester ce composant **sans réellement appeler l'API**. Cela créerait un test fragile et potentiellement lent.

Dans un second temps, nous devons vérifier que le composant a effectué le bon appel avec les paramètres appropriés. Nous n'obtiendrons pas de résultats de cette API, mais nous devons toujours nous assurer d'avoir demandé les bonnes ressources.

Enfin, nous devons nous assurer que le DOM a été mis à jour correctement et affiche les données. Nous le faisons en utilisant la fonction `flushPromises()` de `@vue/test-utils`.

```js
import { mount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import PostList from './PostList.vue';

const mockPostList = [
  { id: 1, title: 'Titre 1' },
  { id: 2, title: 'Titre 2' },
];

// Les lignes suivantes informe Jest de simuler tout appel avec `axios.get` et de retourner `mockPockList` à la place.
jest.spyOn(axios, 'get').mockResolvedValue(mockPostList);

test('récupère les articles en appuyant sur le bouton', async () => {
  const wrapper = mount(PostList);

  await wrapper.get('button').trigger('click');

  // Vérifions que nous avons appelé `axios.get` le bon nombre de fois et avec les bons paramètres.
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(axios.get).toHaveBeenCalledWith('/api/posts');

  // Attendons que le DOM soit à jour.
  await flushPromises();

  // Enfin, vérifions que tout est bien affiché.
  const posts = wrapper.findAll('[data-test="post"]');

  expect(posts).toHaveLength(2);
  expect(posts[0].text()).toContain('Titre 1');
  expect(posts[1].text()).toContain('Titre 2');
});
```

Faites attention de bien ajouter le préfixe `mock` à la variable `mockPostList`. Sinon, vous obtiendrez l'erreur&nbsp;: "The module factory of `jest.mock()` is not allowed to reference any out-of-scope variables.". C'est spécifique à `jest` et vous pouvez en savoir plus sur ce comportement [dans leur documentation](https://jestjs.io/fr/docs/es6-class-mocks#calling-jestmock-with-the-module-factory-parameter).

Remarquez également comment nous avons `await` `flushPromises` et ensuite interagi avec le composant. Nous le faisons pour nous assurer que le DOM a été mis à jour avant que les vérifications ne s'exécutent.

:::tip Alternatives à `jest.mock()`
Il existe plusieurs façons de définir des `mocks` dans Jest. Celui utilisé dans l'exemple ci-dessus est le plus simple. Pour des alternatives plus puissantes, vous pouvez consulter [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter) ou [msw](https://github.com/mswjs/msw), entre autres.
:::

### Vérifier un message de chargement

Bien, ce composant `PostList` est assez fonctionnel, mais il lui manque des fonctionnalités utiles. Améliorons-le pour qu'il affiche un message pendant le chargement de nos articles&nbsp;!

De plus, désactivons également l'élément `<button>` pendant le chargement. Nous ne voulons pas que les utilisateurs continuent à envoyer des requêtes durant le téléchargement&nbsp;!

```vue {2,4,19,24,28}
<template>
  <button :disabled="loading" @click="getPosts">Récupérer les articles</button>

  <p v-if="loading" role="alert">Chargement des articles…</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      posts: null,
      loading: null,
    };
  },
  methods: {
    async getPosts() {
      this.loading = true;

      this.posts = await axios.get('/api/posts');

      this.loading = null;
    },
  },
};
</script>
```

Écrivons un test pour vérifier que tous les éléments liés au chargement sont affichés à temps et correctement.

```js
test('affiche le message de chargement pendant le téléchargement', async () => {
  const wrapper = mount(PostList);

  // Remarquez que nous exécutons les vérifications suivantes avant de cliquer sur le bouton.
  // Ici, le composant doit être dans un état de "non chargement".
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled');

  // Déclenchons le chargement avec un click.
  await wrapper.get('button').trigger('click');

  // Nous vérifions l'état de chargement des éléments avant de `flushPromises`.
  expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  expect(wrapper.get('button').attributes()).toHaveProperty('disabled');

  // Comme précédemment, nous attendons que le DOM se mette à jour.
  await flushPromises();

  // Après cela, nous revenons à l'état de "Non chargement".
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled');
});
```

## Requêtes HTTP de Vuex

Un scénario typique pour des applications plus complexes consiste à déclencher une action Vuex qui effectue la requête HTTP.

Cela n'est pas différent de l'exemple décrit ci-dessus. Nous pouvons vouloir charger le `store` tel quel et simuler (`mocker`) des services tels que `axios`. De cette façon, nous simulons les limites de notre système, ce qui nous permet d'avoir un plus haut degré de confiance dans nos tests.

Vous pouvez consulter la documentation [Tester Vuex](./vuex.md) pour plus d'informations sur les tests Vuex avec Vue Test Utils.

## Conclusion

- Vue Test Utils ne nécessite pas d'outils spéciaux pour tester les requêtes HTTP. La seule chose à prendre en compte est que nous testons un comportement asynchrone dans un environnement synchrone.
- Les tests ne doivent pas dépendre de services externes. Utilisez des outils de simulation tels que `jest.mock` pour éviter cela.
- `flushPromises()` est un outil utile pour s'assurer que le DOM se met à jour après une opération asynchrone.
- Le déclenchement direct des requêtes HTTP en interagissant avec le composant rend votre test plus robuste.
