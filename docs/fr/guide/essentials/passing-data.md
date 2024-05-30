# Passer des données aux Composants

Vue Test Utils fournit plusieurs moyens de passer des données et des propriétés à un composant pour vous permettre de tester complètement son comportement dans différents scénarios.

Dans cette section, nous explorons les options de `mount`&nbsp;: `data` et `props`, ainsi que `VueWrapper.setProps()` pour mettre à jour de manière dynamique les propriétés reçues par un composant.

## Le Composant Password

Nous allons détailler les fonctionnalités ci-dessus en construisant un composant `<Password>`. Ce composant vérifie si un mot de passe répond à certains critères, tels que la longueur et la complexité. Nous commencerons avec ce qui suit et ajouterons des fonctionnalités, ainsi que des tests pour nous assurer que tout se comportent correctement&nbsp;:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
    </div>
  `,
  data() {
    return {
      password: ''
    }
  }
}
```

Le premier critère que nous allons mettre en place est une longueur minimale.

## Utilisation de `props` pour définir une longueur minimum

Nous voulons réutiliser ce composant dans tous nos projets, chacun ayant des exigences différentes. Pour cette raison, nous allons faire de `minLength` une **prop** que nous passons à `<Password>`:

Nous allons afficher une erreur si `password` est inférieur à `minLength`. Nous pouvons le faire en créant une `computed` nommée `error` et en la rendant de manière conditionnelle à l'aide de `v-if`&nbsp;:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
      <div v-if="error">{{ error }}</div>
    </div>
  `,
  props: {
    minLength: {
      type: Number
    }
  },
  data() {
    return {
      password: ''
    }
  },
  computed: {
    error() {
      if (this.password.length < this.minLength) {
        return `Le mot de passe doit contenir au moins ${this.minLength} caractères.`
      }
    }
  }
}
```

Pour tester cela, nous devons définir `minLength`, ainsi qu'un `password` inférieur à ce nombre minimal. Nous pouvons le faire en utilisant les options de `mount()`&nbsp;: `data` et `props`. Enfin, nous allons vérifier que le message d'erreur correct est affiché&nbsp;:

```js
test('affiche une erreur si le mot de passe est trop court', () => {
  const wrapper = mount(Password, {
    props: {
      minLength: 10
    },
    data() {
      return {
        password: 'court'
      }
    }
  })

  expect(wrapper.html()).toContain(
    'Le mot de passe doit contenir au moins 10 caractères.'
  )
})
```

Pour vous entraîner, vous pouvez écrire un test pour une règle de `maxLength`&nbsp;! Une autre manière de l'écrire serait d'utiliser `setValue` pour mettre à jour l'`input` avec un mot de passe trop court. Vous pouvez en savoir plus dans [Tester les formulaires](./forms).

## Utilisation de `setProps`

Parfois, vous pouvez avoir besoin d'écrire un test pour un effet collatéral lorsqu'une `prop` change. Ce simple composant qui suit, nommé `<Show>`, affiche une salutation si la propriété `show` est à `true`.

```vue
<template>
  <div v-if="show">{{ greeting }}</div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      greeting: 'Salut'
    }
  }
}
</script>
```

Pour tester cela de bout en bout, nous voulons peut-être vérifier que `greeting` est affiché par défaut. Nous sommes aussi en mesure de mettre à jour la propriété `show` à l'aide de `setProps()`, ce qui entraîne la disparition de `greeting`&nbsp;:

```js
import { mount } from '@vue/test-utils'
import Show from './Show.vue'

test('affiche une salutation quand show est à true', async () => {
  const wrapper = mount(Show)
  expect(wrapper.html()).toContain('Salut')

  await wrapper.setProps({ show: false })

  expect(wrapper.html()).not.toContain('Salut')
})
```

Nous utilisons également `await` lors de l'appel à `setProps()`, pour nous assurer que le DOM a été mis à jour avant l'exécution des vérifications.

## Conclusion

- Utilisez les options de `mount()`&nbsp;: `props` et `data` pour définir en amont l'état d'un composant.
- Utilisez `setProps()` pour mettre à jour une propriété pendant un test.
- Utilisez `await` avant `setProps()` pour garantir que Vue mettra à jour le DOM avant la poursuite du test.
- Interagir directement avec votre composant peut vous donner une meilleure couverture. Pensez à utiliser `setValue` ou `trigger` en combinaison avec `data pour vous assurer que tout fonctionne correctement.
