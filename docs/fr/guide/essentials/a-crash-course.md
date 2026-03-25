# Cours rapide

Rentrons dans le vif du sujet&nbsp;! Apprenons à utiliser Vue Test Utils (VTU) en construisant une simple application de tâches à réaliser (une _Todo list_), et en écrivant des tests au fur et à mesure. Ce guide couvrira comment&nbsp;:

- Monter des composants.
- Trouver des éléments.
- Remplir des formulaires.
- Déclencher des événements.

## Pour commencer

Commençons par un simple composant TodoApp avec une seule tâche&nbsp;:

```vue
<template>
  <div></div>
</template>

<script setup>
import { ref } from 'vue'

const todos = ref([
  {
    id: 1,
    text: 'Apprendre Vue.js 3',
    completed: false
  }
])
</script>
```

## Le premier test - une tâche est affichée

Le premier test que nous allons écrire va vérifier qu'une tâche est affichée. Regardons d'abord le test, puis nous détaillerons chaque partie&nbsp;:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('affiche une tâche', () => {
  const wrapper = mount(TodoApp)

  const todo = wrapper.get('[data-test="todo"]')

  expect(todo.text()).toBe('Apprendre Vue.js 3')
})
```

Nous commençons par importer `mount` - c'est la principale manière de monter un composant dans VTU. Vous pouvez déclarer un test en utilisant la fonction `test` accompagné d'une courte description pour le test. Les fonctions `test` et `expect` sont disponibles de façon globale dans la plupart des gestionnaires de tests (cet exemple utilise [Jest](https://jestjs.io/fr/)). Si `test` et `expect` sont des concepts obscurs pour vous, la documentation de Jest a un [exemple plus simple](https://jestjs.io/docs/en/getting-started) de leur utilisation et de leur fonctionnement.

Ensuite, nous appelons `mount` et passons le composant en premier argument - c'est quelque chose dont la plupart des tests que vous écrirez auront besoin au préalable. Par convention, nous attribuons le résultat à une variable appelée `wrapper`, car `mount` fournit une "enveloppe" simple autour de l'application avec des méthodes utiles pour les tests.

Enfin, nous utilisons une autre fonction globale courante pour de nombreux gestionnaires de tests - Jest inclus - `expect`. L'idée est que nous faisons une vérification ou une _attente_, que la sortie réelle corresponde à ce que nous pensons qu'elle devrait être. Pour cela, nous cherchons un élément avec le sélecteur `data-test="todo"` - dans le DOM, cela ressemblera à `<div data-test="todo">...</div>`. Nous appelons ensuite la méthode `text` pour obtenir le contenu, que nous attendons être `'Apprendre Vue.js 3'`.

> L'utilisation de sélecteurs `data-test` n'est pas requise, mais peut rendre vos tests plus solides. Les classes et les id ont tendance à changer ou à se déplacer au fur et à mesure que l'application évolue - en utilisant `data-test`, les autres développeurs comprendront que ce sélecteur est réservé pour les tests, et ne doit donc pas être modifié.

## Pour faire passer le test

Si nous exécutons ce test maintenant, il échouera avec le message d'erreur suivant&nbsp;: `Impossible de trouver [data-test="todo"]`. C'est parce que nous n'affichons aucune tâche, donc l'appel `get()` échoue à renvoyer une enveloppe (rappelez-vous, VTU place tous les composants et les éléments DOM dans une "enveloppe" avec des méthodes utiles aux tests). Mettez à jour la balise `<template>` dans `TodoApp.vue` pour afficher le tableau des tâches&nbsp;:

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>
```

Avec ce changement, le test est passé. Félicitations&nbsp;! Vous avez écrit votre premier test de composant en utilisant Vue Test Utils.

## Ajouter une nouvelle tâche

La prochaine fonctionnalité que nous allons ajouter est la possibilité pour l'utilisateur de créer une nouvelle tâche. Pour ce faire, nous avons besoin d'un formulaire avec une entrée pour que l'utilisateur puisse taper du texte. Lorsque l'utilisateur soumet le formulaire, nous nous attendons à ce que la nouvelle tâche soit affichée. Regardons le test&nbsp;:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('créé une tâche', () => {
  const wrapper = mount(TodoApp)
  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)

  wrapper.get('[data-test="new-todo"]').setValue('New todo')
  wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

Comme d'habitude, nous commençons par utiliser `mount` pour monter l'élément. Nous vérifions également qu'une seule tâche est affichée - cela permet de clarifier que nous ajoutons une tâche supplémentaire, comme l'indique la dernière ligne du test.

Pour mettre à jour `<input>`, nous utilisons `setValue` - cela nous permet de définir la valeur de l'élement `<input>`.

Après avoir mis à jour `<input>`, nous utilisons la méthode `trigger` pour simuler la soumission du formulaire par l'utilisateur. Enfin, nous vérifions que le nombre d'éléments de la liste de tâches a augmenté de 1 à 2.

Si nous exécutons ce test, il échouera. Modifions `TodoApp.vue` pour avoir les éléments `<form>` et `<input>` et faisons passer le test&nbsp;:

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([
  {
    id: 1,
    text: 'Apprendre Vue.js 3',
    completed: false
  }
])

const createTodo = () => {
  todos.value.push({
    id: 2,
    text: newTodo.value,
    completed: false
  })
}
</script>
```

Nous utilisons `v-model` pour lier l'élément `input` et `@submit` pour écouter la soumission du formulaire. Lorsque le formulaire est soumis, `createTodo` est appelé et insère une nouvelle tâche dans le tableau des tâches à faire.

Bien que cela semble bon, l'exécution du test affiche une erreur&nbsp;:

```
expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 1
    Received array:  [{"element": <div data-test="todo">Apprendre Vue.js 3</div>}]
```

Le nombre de tâches à faire n'a pas augmenté. Le problème est que Jest exécute les tests de manière synchrone, mettant fin au test dès que la dernière fonction est appelée. Cependant, Vue met à jour le DOM de façon asynchrone. Nous devons marquer le test `async` et appeler `await` sur toutes les méthodes qui pourraient entraîner un changement du DOM. `trigger` et `setValue` sont des méthodes qui modifient le DOM - nous pouvons donc simplement ajouter `await` et le test devrait fonctionner comme prévu.

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('créé une tâche', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('Nouvelle tâche')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

Le test passe enfin&nbsp;!

## Marquer une tâche comme terminée

Maintenant que nous pouvons créer des tâches, donnons à l'utilisateur la possibilité de marquer une tâche comme terminée/incomplète avec une case à cocher. Comme précédemment, commençons par le test qui échoue&nbsp;:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('marque une tâche comme terminée', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="todo-checkbox"]').setValue(true)

  expect(wrapper.get('[data-test="todo"]').classes()).toContain('completed')
})
```

Ce test est similaire aux deux précédents ; nous trouvons un élément et interagissons avec de la même manière (nous utilisons à nouveau `setValue`, car nous interagissons avec un élément `<input>`).

Enfin, nous faisons une vérification. Nous allons appliquer une classe `completed` aux tâches terminées - nous pourrons alors l'utiliser pour ajouter un peu de style et indiquer visuellement le statut d'une tâche.

Nous pouvons faire passer ce test en mettant à jour le `<template>` pour inclure le `<input type="checkbox">` et une liaison de classe sur la tâche.

```vue
<template>
  <div>
    <div
      v-for="todo in todos"
      :key="todo.id"
      data-test="todo"
      :class="[todo.completed ? 'completed' : '']"
    >
      {{ todo.text }}
      <input
        type="checkbox"
        v-model="todo.completed"
        data-test="todo-checkbox"
      />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>
```

Félicitations&nbsp;! Vous avez écrit votre première suite de tests de composants Vue.

## Organiser, Agir et Vérifier

Vous avez sûrement remarqué les nouvelles lignes dans les tests. Pour les comprendre, regardons de nouveau le deuxième test en détail&nbsp;:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('créé une tâche', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('Nouvelle todo')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

Le test est divisé en trois étapes distinctes, séparées par des sauts de ligne. Les trois étapes représentent les trois phases d'un test&nbsp;: **organiser**, **agir** et **vérifier**.

Dans la phase _organiser_, nous préparons le scénario pour le test. Un exemple plus complexe peut nécessiter la création d'un store Vuex ou le remplissage d'une base de données.

Dans la phase _agir_, nous jouons le scénario, simulant comment un utilisateur interagirait avec le composant ou l'application.

Dans la phase _vérifier_, nous faisons des vérifications sur l'état actuel du composant que nous attendons.

Presque tous les tests suivront ces trois phases. Vous n'êtes pas obligé de les séparer avec des sauts de ligne comme ce guide le fait, mais il est bon de garder ces trois phases à l'esprit lorsque vous écrivez vos tests.

## Conclusion

- Utilisez `mount()` pour monter un composant.
- Utilisez `get()` et `findAll()` pour récupérer des éléments du DOM.
- `trigger()` et `setValue()` sont des fonctions utilitaires pour simuler les entrées utilisateur.
- La mise à jour du DOM est une opération asynchrone, assurez-vous donc d'utiliser `async` et `await`.
- Les tests consistent généralement en 3 phases ; organiser, agir et vérifier.
