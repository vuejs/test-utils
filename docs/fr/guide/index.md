# Commencer

Bienvenue sur Vue Test Utils, la librairie de tests officielle pour Vue.js !

Ceci est la documentation pour Vue Test Utils v2, qui cible Vue 3.

En résumé :

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) cible [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) cible [Vue 3](https://github.com/vuejs/vue-next/).

## Qu'est-ce que Vue Test Utils ?

Vue Test Utils (VTU) est un ensemble de fonctions visant à simplifier les tests des composants Vue.js. Il propose des méthodes pour monter et interagir avec les composants Vue de manière isolée.

Regardons un exemple :

```js
import { mount } from '@vue/test-utils'

// The component to test
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('affiche le message', () => {
  const wrapper = mount(MessageComponent, {
    props: {
      msg: 'Hello world'
    }
  })

  // Vérifier le texte rendu du composant
  expect(wrapper.text()).toContain('Hello world')
})
```

## Et après ?

Pour comprendre le potentiel de Vue Test Utils, [suivez le cours rapide](../guide/essentials/a-crash-course.md), où nous construisons une application Todo simple en écrivant les tests en amont.

La documentation est divisée en deux sections principales :

- **Les Bases**, pour couvrir les cas d'utilisation courants que vous rencontrerez lors des tests des composants Vue.
- **Vue Test Utils en détail**, pour explorer d'autres fonctionnalités avancées de la bibliothèque.

Vous pouvez également explorer [l'API complète](../api/).

Sinon, si vous préférez apprendre via des vidéos, il existe [un certain nombre de conférences disponibles ici](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA).
