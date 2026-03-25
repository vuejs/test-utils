# Tester le Rendu côté Serveur (SSR)

Vue Test Utils fournit `renderToString` pour tester des applications Vue qui utilisent le rendu côté serveur (SSR).

Cet article vous guidera à travers le processus de test d'une application Vue qui utilise le SSR.

## `renderToString`

`renderToString` est une fonction qui affiche un composant Vue sous forme de chaîne de caractères.

C'est une fonction asynchrone qui renvoie une `Promise`, et accepte les mêmes paramètres que `mount` ou `shallowMount`.

Prenons en exemple un composant simple qui utilise le `hook` `onServerPrefetch`&nbsp;:

```ts
function fakeFetch(text: string) {
  return Promise.resolve(text)
}

const Component = defineComponent({
  template: '<div>{{ text }}</div>',
  setup() {
    const text = ref<string | null>(null)

    onServerPrefetch(async () => {
      text.value = await fakeFetch('onServerPrefetch')
    })

    return { text }
  }
})
```

Vous pouvez écrire un test pour ce composant en utilisant `renderToString`&nbsp;:

```ts
import { renderToString } from '@vue/test-utils'

it('affiche la valeur retournée par onServerPrefetch', async () => {
  const contents = await renderToString(Component)
  expect(contents).toBe('<div>onServerPrefetch</div>')
})
```
