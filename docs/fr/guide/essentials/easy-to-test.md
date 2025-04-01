# Écrire des composants faciles à tester

Vue Test Utils vous aide à écrire des tests pour des composants Vue. Néanmoins, VTU ne peut pas tout faire.

La liste suivante vous donne des suggestions pour écrire du code plus facile à tester et des tests significatifs et faciles à maintenir.

Elle fournit des conseils globaux qui peuvent être utiles dans des scénarios courants.

## Ne pas tester des détails d'implémentation

Pensez en termes d'entrées et de sorties du point de vue d'un utilisateur. Grossièrement, voici tout ce que vous devriez prendre en compte lors de l'écriture d'un test pour un composant Vue&nbsp;:

| **Entrées**     | Exemples                                                          |
|-----------------|-------------------------------------------------------------------|
| Interactions    | Cliquer, taper du texte... toute interaction "humaine".           |
| Propriétés      | Les arguments qu'un composant reçoit.                             |
| Flux de données | Données entrantes provenant d'appels API, souscriptions diverses… |

| **Sorties**        | Exemples                                            |
|--------------------|-----------------------------------------------------|
| Éléments du DOM    | Tout node affiché dans le document et _observable_. |
| Évènements         | Évènements émis (en utilisant `$emit`).             |
| Effets collatéraux | Comme un `console.log` ou des appels API.           |

**Tout le reste sont des détails d'implémentation**.

Notez que cette liste n'inclut pas des éléments tels que les méthodes internes, les états intermédiaires ou même les données.

La règle de base est qu'**un test ne devrait pas échouer lors d'une refonte de code (refactoring)**, c'est-à-dire lorsque nous changeons son implémentation interne sans changer son comportement. Si cela se produit, le test peut dépendre alors de détails d'implémentation.

Par exemple, supposons qu'il existe un composant de compteur de base qui comporte un bouton pour incrémenter un compteur&nbsp;:

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<template>
  <p class="paragraph">Nombre de clicks: {{ count }}</p>
  <button @click="increment">Incrémenter</button>
</template>
```

Nous pourrions écrire le test suivant&nbsp;:

```js
import { mount } from '@vue/test-utils';
import Counter from './Counter.vue';

test('le texte du compteur change', async () => {
  const wrapper = mount(Counter);
  const paragraph = wrapper.find('.paragraph');

  expect(paragraph.text()).toBe('Nombre de clicks: 0');

  await wrapper.setData({ count: 2 });

  expect(paragraph.text()).toBe('Nombre de clicks: 2');
});
```

Remarquez que nous mettons à jour ici ses données internes, et nous nous appuyons également sur des détails (du point de vue de l'utilisateur) tels que les classes CSS.

:::tip
Notez que la modification des données ou du nom de la classe CSS ferait échouer le test. Le composant fonctionnerait toujours comme prévu, cependant. C'est ce qu'on appelle un **faux positif**.
:::

Au lieu de cela, le test suivant essaie plutôt de se conformer aux entrées et sorties énumérées ci-dessus&nbsp;:

```js
import { mount } from '@vue/test-utils';

test('le texte du compteur change', async () => {
  const wrapper = mount(Counter);

  expect(wrapper.text()).toContain('Nombre de clicks: 0');

  const button = wrapper.find('button');
  await button.trigger('click');
  await button.trigger('click');

  expect(wrapper.text()).toContain('Nombre de clicks: 2');
});
```

Des librairies telles que [Vue Testing Library](https://github.com/testing-library/vue-testing-library/) sont construites sur ces principes. Si vous êtes intéressé par cette approche, vous devriez y jeter un œil.

## Faire de petits composants simples

Une règle générale de base est que moins un composant en fait, plus il sera facile à tester.

Rendre les composants plus petits les rendra plus composables et plus faciles à comprendre. Voici une liste de suggestions pour rendre les composants plus simples.

### Extraire les appels API

Normalement, vous effectuerez plusieurs requêtes HTTP dans votre application. Du point de vue du test, les requêtes HTTP fournissent des entrées au composant et un composant peut également envoyer des requêtes HTTP.

:::tip
Consultez le guide [Faire des requêtes HTTP](../advanced/http-requests.md) si vous n'êtes pas familier avec les tests d'appels API.
:::

### Extraire les méthodes complexes

Parfois, un composant peut comporter une méthode complexe, effectuer des calculs lourds ou utiliser plusieurs dépendances.

Ce que nous vous suggérons ici est d'extraire cette méthode et de l'importer au composant. De cette façon, vous pouvez tester la méthode de manière isolée à l'aide de Jest ou de tout autre exécuteur de tests.

Cela a en outre l'avantage de rendre le composant plus facile à comprendre, car la logique complexe est encapsulée dans un autre fichier.

De plus, si la méthode complexe est difficile à mettre en place ou lente, vous voudrez peut-être la simuler (*mocker*) pour simplifier et accélérer les tests. Les exemples sur [faire des requêtes HTTP](../advanced/http-requests.md) sont un bon exemple - axios étant une bibliothèque assez complexe&nbsp;!

## Écrire les tests avant d'écrire le composant

Vous ne pouvez pas écrire du code impossible à tester si vous écrivez les tests d'abord&nbsp;!

Notre [Cours Rapide](../essentials/a-crash-course.md) propose un exemple de comment l'écriture des tests avant le code conduit à des composants parfaitement testables. Cela vous aide également à détecter et tester les cas limites.
