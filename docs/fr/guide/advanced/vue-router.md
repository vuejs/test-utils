# Tester Vue Router

Cet article présentera deux façons de tester une application en utilisant Vue Router&nbsp;:

1. En utilisant le vrai Vue Router, qui est plus proche de la production, mais peut également entraîner de la complexité lors du test d'applications plus importantes.
2. En utilisant un routeur simulé, permettant un contrôle plus complet de l'environnement de test.

Veuillez noter que Vue Test Utils ne fournit pas de fonctions spéciales pour aider à tester les composants qui dépendent de Vue Router.

## Utilisation d'un router simulé

Vous pouvez utiliser un routeur simulé pour éviter de vous préoccuper des détails d'implémentation de Vue Router dans vos tests unitaires.

Au lieu d'utiliser une instance réelle de Vue Router, nous pouvons créer une version simulée (`mockée`) qui ne met en œuvre que les fonctionnalités qui nous intéressent. Nous pouvons le faire en utilisant une combinaison de `jest.mock` (si vous utilisez Jest) et de `global.components`.

Lorsque nous simulons une dépendance, c'est généralement parce que **nous ne sommes pas intéressés par le test de son comportement**. Nous ne voulons pas tester si le clic sur `<router-link>` redirige vers la bonne page - nous savons déjà que c'est le cas&nbsp;! Nous pourrions plutôt être intéressés par la vérification que la balise `<a>` possède un attribut `to` correct.

Prenons un exemple plus réaliste&nbsp;! Ce composant affiche un bouton qui redirigera un utilisateur authentifié vers la page d'édition de publication (en fonction des paramètres de la route actuelle). Un utilisateur non authentifié devrait être redirigé vers une route `/404`.

```js
const Component = {
  template: `<button @click="redirect">Cliquer pour éditer</button>`,
  props: ['isAuthenticated'],
  methods: {
    redirect() {
      if (this.isAuthenticated) {
        this.$router.push(`/posts/${this.$route.params.id}/edit`)
      } else {
        this.$router.push('/404')
      }
    }
  }
}
```

Nous pourrions utiliser un routeur réel, puis naviguer jusqu'à la route correcte pour ce composant, et, après avoir cliqué sur le bouton, vérifier que la bonne page est affichée... cependant, cela nécessite beaucoup de configuration pour un test relativement simple. En fin de compte, le test que nous voulons écrire est "si authentifié, rediriger vers X, sinon rediriger vers Y". Voyons comment nous pourrions accomplir cela en simulant le routage en utilisant la propriété `global.mocks`&nbsp;:

```js
import { mount } from '@vue/test-utils'

test("autorise un utilisateur authentifié d'éditer une publication", async () => {
  const mockRoute = {
    params: {
      id: 1
    }
  }
  const mockRouter = {
    push: jest.fn()
  }

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect(mockRouter.push).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalledWith('/posts/1/edit')
})

test('redirige un utilisateur non authentifié sur 404', async () => {
  const mockRoute = {
    params: {
      id: 1
    }
  }
  const mockRouter = {
    push: jest.fn()
  }

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect(mockRouter.push).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalledWith('/404')
})
```

Nous avons utilisé `global.mocks` pour fournir les dépendances nécessaires (`this.$route` et `this.$router`) pour définir un état idéal pour chaque test.

Nous avons ensuite pu utiliser `jest.fn()` pour surveiller combien de fois et avec quels arguments `this.$router.push` a été appelé. Le plus important, c'est que nous n'avons pas à gérer la complexité de Vue Router dans notre test&nbsp;! Nous nous sommes seulement occupés du test de la logique de l'application.

:::tip
Il se peut que vous souhaitiez tester l'ensemble du système de manière bout-en-bout. Vous pourriez considérer un framework comme [Cypress](https://www.cypress.io/) pour des tests système complets en utilisant un véritable navigateur.
:::

## Utilisation d'un vrai router

Maintenant que nous avons vu comment utiliser un routeur simulé, examinons l'utilisation du véritable Vue Router.

Créons une application de blog basique qui utilise Vue Router. Les articles sont répertoriés sur la route `/posts`&nbsp;:

```js
const App = {
  template: `
    <router-link to="/posts">Aller aux publications</router-link>
    <router-view />
  `
}

const Posts = {
  template: `
    <h1>Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.name }}
      </li>
    </ul>
  `,
  data() {
    return {
      posts: [{ id: 1, name: 'Tester Vue Router' }]
    }
  }
}
```

La racine de l'application affiche un `<router-link>` menant à `/posts`, où nous listons les articles.

Le véritable routeur ressemble à ceci. Remarquez que nous exportons les routes séparément du routeur, de sorte que nous puissions instancier un nouveau routeur pour chaque test individuel plus tard.

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: {
      template: 'Bienvenue sur le blog'
    }
  },
  {
    path: '/posts',
    component: Posts
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export { routes }

export default router
```

La meilleure façon d'illustrer comment tester une application à l'aide de Vue Router est de laisser les avertissements (`warnings`) nous guider. Le test minimal suivant suffit pour nous lancer&nbsp;:

```js
import { mount } from '@vue/test-utils'

test('routing', () => {
  const wrapper = mount(App)
  expect(wrapper.html()).toContain('Bienvenue sur le blog')
})
```

Le test échoue. Il affiche également deux `warnings`&nbsp;:

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
```

Les composants `<router-link>` et `<router-view>` ne sont pas trouvés. Nous devons installer Vue Router&nbsp;! Comme Vue Router est un plugin, nous l'installons en utilisant l'option de `mount`&nbsp;: `global.plugins`&nbsp;:

```js {12,13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router' // Cet import devrait pointer vers votre fichier de configuration des routes.

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

test('routing', () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Bienvenue sur le blog')
})
```

Les deux `warnings` sont maintenant résolus - mais nous en avons maintenant un nouveau&nbsp;:

```bash
console.warn node_modules/vue-router/dist/vue-router.cjs.js:225
  [Vue Router warn]: Unexpected error when starting the router: TypeError: Cannot read property '_history' of null
```

Le `warning` n'est pas très explicite. En fait, cela est lié au fait que **Vue Router 4 gère le routage de manière asynchrone**.

Vue Router fournit une fonction `isReady` qui nous informe lorsque le routeur est prêt. Nous pouvons alors l'`await` pour nous assurer que la navigation initiale a eu lieu.

```js {13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

test('routing', async () => {
  router.push('/')

  // Après cette ligne, le router est prêt
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Bienvenue sur le blog')
})
```

Le test passe enfin&nbsp;! Cela a été assez laborieux, mais désormais nous nous assurons que l'application navigue correctement vers la route initiale.

Maintenant, allons sur `/posts` et assurons-nous que le routage fonctionne comme prévu&nbsp;:

```js {21,22}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Bienvenue sur le blog')

  await wrapper.find('a').trigger('click')
  expect(wrapper.html()).toContain('Tester Vue Router')
})
```

Encore une fois, une erreur assez difficile à comprendre&nbsp;:

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Unhandled error during execution of native event handler
    at <RouterLink to="/posts" >

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

Une fois de plus, en raison de la nature asynchrone de Vue Router 4, nous devons `await` la navigation pour être terminée avant de faire des vérifications.

Cependant, il n'y a pas de `hook` `hasNavigated` sur lequel nous pouvons `await`. Une alternative est d'utiliser la fonction `flushPromises` exportée de Vue Test Utils&nbsp;:

```js {1,22}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Bienvenue sur le blog')

  await wrapper.find('a').trigger('click')
  await flushPromises()
  expect(wrapper.html()).toContain('Tester Vue Router')
})
```

Cela passe. Super&nbsp;! Cependant, c'est très laborieux - et cela concerne une petite application triviale. C'est pour cette raison que l'utilisation d'un routeur simulé est une approche courante lors des tests de composants Vue avec Vue Test Utils. Si vous préférez continuer à utiliser un routeur réel, gardez à l'esprit que chaque test doit utiliser son propre instance du routeur de cette manière&nbsp;:

```js {1,22}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

let router
beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })
})

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Bienvenue sur le blog')

  await wrapper.find('a').trigger('click')
  await flushPromises()
  expect(wrapper.html()).toContain('Tester Vue Router')
})
```

## Utilisation d'un router simulé avec l'API de Composition

Vue Router 4 permet de travailler avec le routeur et les routes à l'intérieur de la fonction `setup` avec l'API de Composition.

Considérons le même composant démo réécrit en utilisant l'API de Composition.

```js
import { useRouter, useRoute } from 'vue-router'

const Component = {
  template: `<button @click="redirect">Cliquer pour éditer</button>`,
  props: ['isAuthenticated'],
  setup(props) {
    const router = useRouter()
    const route = useRoute()

    const redirect = () => {
      if (props.isAuthenticated) {
        router.push(`/posts/${route.params.id}/edit`)
      } else {
        router.push('/404')
      }
    }

    return {
      redirect
    }
  }
}
```

Cette fois, pour tester le composant, nous utiliserons la capacité de Jest à simuler une ressource importée, `vue-router`, et simulerons directement le routeur et la route.

```js
import { useRouter, useRoute } from 'vue-router'

jest.mock('vue-router', () => ({
  useRoute: jest.fn(),
  useRouter: jest.fn(() => ({
    push: () => {}
  }))
}))

test('autorise un utilisateur authentifié à éditer une publication', async () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      stubs: ['router-link', 'router-view'] // Composants de substitution (`Stubs`) pour router-link et router-view au cas où ils sont affichés dans notre composant
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})

test('redirige un utilisateur non authentifié vers la page 404', async () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false
    },
    global: {
      stubs: ['router-link', 'router-view'] // Composants de remplacement (`Stubs`) pour router-link et router-view au cas où ils sont affichés dans notre composant
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/404')
})
```

## Utilisation d'un router réel avec l'API de Composition

En utilisant un routeur réel avec l'API de Composition, cela fonctionne de la même manière qu'en utilisant un routeur réel avec l'API d'options. Gardez à l'esprit que, tout comme avec l'API d'options, il est considéré comme une bonne pratique d'instancier un nouvel objet de routeur pour chaque test, au lieu d'importer directement le routeur depuis votre application.

```js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

let router

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })

  router.push('/')
  await router.isReady()
})

test('autorise un utilisateur authentifié à éditer une publication', async () => {
  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      plugins: [router]
    }
  })

  const push = jest.spyOn(router, 'push')
  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})
```

La bibliothèque [vue-router-mock](https://github.com/posva/vue-router-mock) créée par Posva est également disponible en tant qu'alternative pour ceux qui préfèrent une approche non manuelle.

## Conclusion

- Vous pouvez utiliser une instance d'un vrai routeur dans vos tests.
- Cependant, il y a quelques avertissements à prendre en compte&nbsp;: Vue Router 4 est asynchrone et nous devons en tenir compte lors de l'écriture de tests.
- Pour les applications plus complexes, considérez la simulation de la dépendance du routeur et concentrez-vous sur le test de la logique sous-jacente.
- Utilisez la fonctionnalité de simulation (`mocking`) de votre gestionnaire de tests si possible.
- Utilisez `global.mocks` pour simuler les dépendances globales, telles que `this.$route` et `this.$router`.
