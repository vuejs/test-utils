# Composants de Substitution (Stubs) et Montage Partiel

Vue Test Utils offre certaines fonctionnalités avancées pour substituer (`stubbing`) les composants et les directives. La substitution consiste à remplacer l'implémentation existante d'un composant ou d'une directive personnalisé par une version fictive qui ne fait rien du tout, ce qui peut simplifier un test complexe. Voyons un exemple.

## Substituer un seul composant enfant

Un exemple courant est lorsque vous souhaitez tester un comportement dans un composant qui apparaît très haut dans la hiérarchie des composants.

Dans cet exemple, nous avons une `<App>` qui affiche un message, ainsi qu'un composant `FetchDataFromApi` qui effectue un appel à une API et affiche son résultat.

```js
const FetchDataFromApi = {
  name: 'FetchDataFromApi',
  template: `
    <div>{{ result }}</div>
  `,
  async mounted() {
    const res = await axios.get('/api/info')
    this.result = res.data
  },
  data() {
    return {
      result: ''
    }
  }
}

const App = {
  components: {
    FetchDataFromApi
  },
  template: `
    <h1>Bienvenue dans Vue.js 3</h1>
    <fetch-data-from-api />
  `
}
```

Nous ne voulons pas effectuer l'appel API dans ce test en particulier, nous désirons simplement vérifier que le message est affiché. Dans ce cas, nous pourrions utiliser les `stubs`, qui apparaissent dans l'option de `mount`&nbsp;: `global`.

```js
test('substitue le composant avec un template personnalisé', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: {
          template: '<span />'
        }
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Bienvenue dans Vue.js 3</h1><span></span>

  expect(wrapper.html()).toContain('Bienvenue dans Vue.js 3')
})
```

Remarquez comment le template affiche `<span></span>` à la place de `<fetch-data-from-api />`&nbsp;? Nous l'avons substitué par un `stub` - dans ce cas, nous avons fourni notre propre implémentation en passant un `template`.

Vous pouvez également avoir un `stub` par défaut, plutôt que fournir le vôtre&nbsp;:

```js
test('subtitue le composant', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: true
      }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Bienvenue dans Vue.js 3</h1>
    <fetch-data-from-api-stub></fetch-data-from-api-stub>
  */

  expect(wrapper.html()).toContain('Bienvenue dans Vue.js 3')
})
```

Cela remplacera tous les composants `<FetchDataFromApi />` dans l'ensemble de l'arbre de rendu, peu importe le niveau où ils apparaissent. C'est pourquoi il se trouve dans les options de `mount`&nbsp;: `global`.

::: tip
Pour substituer, vous pouvez utiliser la clé dans `components` ou le nom de votre composant. Si les deux sont donnés dans `global.stubs`, la clé sera utilisée en priorité.
:::

## Substituer tous les composants enfants

Parfois, vous pourriez vouloir substituer _tous_ les composants enfants. Par exemple, vous pourriez avoir un composant comme ceci&nbsp;:

```js
const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Bienvenue dans Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

Imaginez que chacun des `<Complex>` fasse quelque chose de compliqué, et que vous soyez seulement intéressé par le test de rendu du bon message de `<h1>`. Vous pourriez faire quelque chose comme suit&nbsp;:

```js
const wrapper = mount(ComplexComponent, {
  global: {
    stubs: {
      ComplexA: true,
      ComplexB: true,
      ComplexC: true
    }
  }
})
```

Mais c'est beaucoup de code répétitif. VTU a une option `mount`&nbsp;: `shallow` qui substituera automatiquement tous les composants enfants&nbsp;:

```js {3}
test('substitue tous les composants enfants', () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true
  })

  console.log(wrapper.html())
  /*
    <h1>Bienvenue dans Vue.js 3</h1>
    <complex-a-stub></complex-a-stub>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

::: tip
Si vous avez utilisé VTU V1, cela vous rappelle sûrement `shallowMount`. Cette méthode est également toujours disponible, c'est la même chose que d'écrire `shallow: true`.
:::

## Substituer tous les composants enfants avec des exceptions

Parfois, vous voulez remplacer _tous_ les composants personnalisés, sauf un en particulier. Voyons un exemple&nbsp;:

```js
const ComplexA = {
  template: "<h2>Salutation d'un composant réel !</h2>"
}

const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Bienvenue dans Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

En utilisant l'option de `mount`&nbsp;: `shallow`, nous substituons automatiquement tous les composants enfants. Si nous voulons explicitement empêcher la substitution d'un composant spécifique, nous pouvons fournir son nom dans `stubs` avec une valeur définie sur `false`.

```js {3}
test("l'option shallow permet de subsituter tous les composants enfants sauf ceux dans stubs", () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true,
    global: {
      stubs: { ComplexA: false }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Bienvenue dans Vue.js 3</h1>
    <h2>Salutation d'un composant réel !</h2>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

## Substituer un Composant Asynchrone

Si vous voulez substituer un composant asynchrone, il existe deux comportements à prendre en compte. Par exemple, vous pourriez avoir des composants de ce genre&nbsp;:

```js
// AsyncComponent.js
export default defineComponent({
  name: 'AsyncComponent',
  template: '<span>AsyncComponent</span>'
})

// App.js
const App = defineComponent({
  components: {
    MonComposant: defineAsyncComponent(() => import('./AsyncComponent'))
  },
  template: '<MonComposant/>'
})
```

Le premier comportement consiste à utiliser la clé définie dans votre composant qui charge le composant asynchrone. Dans cet exemple, nous avons utilisé la clé "MonComposant".

Il n'est pas nécessaire d'utiliser `async/await` dans le cas de test, car le composant a été remplacé avant résolution.

```js
test('substitue le composant asynchrone sans résolution', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        MonComposant: true
      }
    }
  })

  expect(wrapper.html()).toBe('<mon-composant-stub></mon-composant-stub>')
})
```

Le second comportement consiste à utiliser le nom du composant asynchrone. Dans cet exemple, nous avons utilisé le nom "AsyncComponent".

Maintenant, il est nécessaire d'utiliser `async/await`, car le composant asynchrone doit être résolu et peut alors être remplacé par le nom défini dans le composant asynchrone.

**Assurez-vous de définir un nom dans votre composant asynchrone&nbsp;!**

```js
test('substitue le composant asynchrone avec résolution', async () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        AsyncComponent: true
      }
    }
  })

  await flushPromises()

  expect(wrapper.html()).toBe('<async-component-stub></async-component-stub>')
})
```

## Substituer une directive

Parfois, les directives effectuent des opérations assez complexes, comme réaliser beaucoup de manipulations de DOM ce qui peut entraîner des erreurs dans vos tests (en raison du JsDOM ne ressemblant pas totalement au DOM). Un exemple courant sont les directives de tooltip de différentes bibliothèques, qui dépendent généralement fortement de la mesure de la position/taille des nœuds DOM.

Dans cet exemple, nous avons un autre `<App>` qui affiche un message dans une infobulle.

```js
// directive tooltip déclarée quelque part nommée `Tooltip`

const App = {
  directives: {
    Tooltip
  },
  template: '<h1 v-tooltip title="Welcome tooltip">Bienvenue dans Vue.js 3</h1>'
}
```

Nous ne voulons pas que le code de la directive `Tooltip` soit exécuté dans ce test, nous souhaitons simplement vérifier que le message est affiché. Dans ce cas, nous pourrions utiliser les `stubs`, qui apparaissent dans l'option de `mount`&nbsp;: `global` en passant `vTooltip`.

```js
test('substitue le composant avec un template personnalisé', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: true
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Bienvenue dans Vue.js 3</h1>

  expect(wrapper.html()).toContain('Bienvenue dans Vue.js 3')
})
```

::: tip
L'utilisation du schéma de nom `vCustomDirective` pour différencier les composants et les directives est inspirée de la [même approche](https://vuejs.org/api/sfc-script-setup.html#using-custom-directives) utilisée dans `<script setup>`.
:::

Parfois, nous avons besoin d'une partie de la fonctionnalité de la directive (généralement parce que certaines parties de code en dépendent). Supposons que notre directive ajoute la classe CSS `avec-tooltip` lorsqu'elle est exécutée et que ce comportement est important pour notre code. Dans ce cas, nous pouvons remplacer `true` par notre implémentation de directive fictive.

```js
test('substitue le composant avec un template personnalisé', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: {
          beforeMount(el: Element) {
            console.log('directive appelée');
            el.classList.add('avec-tooltip');
          },
        },
      },
    },
  });

  // 'directive appelée' affiché dans la console

  console.log(wrapper.html());
  // <h1 class="avec-tooltip">Bienvenue dans Vue.js 3</h1>

  expect(wrapper.classes('avec-tooltip')).toBe(true);
});
```

Nous venons juste d'échanger notre implémentation de directive avec la nôtre&nbsp;!

::: warning
Le remplacement des directives ne fonctionnera pas sur les composants fonctionnels ou `<script setup>` en raison de l'absence de nom de directive à l'intérieur de la fonction [withDirectives](https://vuejs.org/api/render-function.html#withdirectives). Considérez le mocking du module de directive via votre gestionnaire de test si vous avez besoin de remplacer une directive utilisée dans un composant fonctionnel. Consultez https://github.com/vuejs/core/issues/6887 pour un exemple permettant de débloquer cette fonctionnalité.
:::

## Slots Par Défaut et `shallow`

Comme `shallow` remplace tout le contenu d'un composant, aucun `<slot>` ne sera affiché lors de l'utilisation de `shallow`. Bien que ce ne soit pas un problème dans la plupart des cas, il existe des scénarios où cela n'est pas idéal.

```js
const CustomButton = {
  template: `
    <button>
      <slot />
    </button>
  `
}
```

Et vous pourriez l'utiliser comme ceci&nbsp;:

```js
const App = {
  props: ['authenticated'],
  components: { CustomButton },
  template: `
    <custom-button>
      <div v-if="authenticated">Se déconnecter</div>
      <div v-else>Se connecter</div>
    </custom-button>
  `
}
```

Si vous utilisez `shallow`, le slot ne sera pas affiché, car la fonction d'affichage dans `<custom-button />` est remplacée. Cela signifie que vous ne pourrez pas vérifier que le texte correct soit affiché&nbsp;!

Pour ce cas d'utilisation, vous pouvez utiliser `config.renderStubDefaultSlot`, qui affichera le contenu du slot par défaut, même lors de l'utilisation de `shallow`&nbsp;:

```js {1,4,8}
import { config, mount } from '@vue/test-utils'

beforeAll(() => {
  config.global.renderStubDefaultSlot = true
})

afterAll(() => {
  config.global.renderStubDefaultSlot = false
})

test('monte avec des substituts', () => {
  const wrapper = mount(AnotherApp, {
    props: {
      authenticated: true
    },
    shallow: true
  })

  expect(wrapper.html()).toContain('Se déconnecter')
})
```

Comme ce comportement est global, et non basé test par test, vous devez vous souvenir de l'activer et le désactiver avant et après chaque test.

::: tip
Vous pouvez également activer ceci globalement en important `config` dans votre fichier de configuration de test, et en définissant `renderStubDefaultSlot` sur `true`. Malheureusement, en raison de limitations techniques, ce comportement n'est pas étendu à des slots autres que le slot par défaut.
:::

## `mount`, `shallow` et `stubs`: lequel et quand&nbsp;?

En règle générale, **plus vos tests ressemblent à la manière dont votre application est utilisée**, plus vous pouvez avoir confiance en eux.

Les tests qui utilisent `mount` afficheront toute la hiérarchie de composants, ce qui est plus proche de ce que l'utilisateur verra dans un vrai navigateur.

D'un autre côté, les tests qui utilisent `shallow` se concentrent sur un composant spécifique. `shallow` peut être utile pour tester des composants avancés en isolation totale. Si vous avez simplement un ou deux composants qui ne sont pas pertinents pour vos tests, considérez d'utiliser `mount` en combinaison avec des composants de substitution (`stubs`) au lieu de shallow. Plus vous utilisez les `stubs`, moins les tests ressemblent à la production.

Gardez ceci à l'esprit&nbsp;: que vous effectuiez un montage complet ou un rendu partiel, les bons tests se concentrent sur les entrées (`props` et interaction de l'utilisateur, comme avec `trigger`) et les sorties (les éléments DOM qui sont rendus et les événements), et pas sur les détails d'implémentation.

Alors, quelle que soit la méthode de montage que vous choisissez, nous vous suggérons de garder ces lignes directrices à l'esprit.

## Conclusion

- Utilisez `global.stubs` pour substituer un composant ou une directive par un faux afin de simplifier vos tests.
- Utilisez `shallow: true` (ou `shallowMount`) pour remplacer tous les composants enfants par des faux.
- Utilisez `global.renderStubDefaultSlot` pour afficher le contenu du `<slot>` par défaut pour un composant substitué.
