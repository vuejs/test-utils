# Tester les évènements émis

Les composants Vue interagissent les uns avec les autres à travers des `props` et en émettant des événements en appelant `$emit`. Dans ce guide, nous examinons comment vérifier que les événements sont correctement émis à l'aide de la fonction `emitted()`.

Cet article est également disponible dans cette [courte video](https://www.youtube.com/watch?v=U_j-nDur4oU&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=14).

## Le composant Compteur

Voici un composant simple `<Counter>`. Il possède un bouton qui, lorsqu'il est cliqué, incrémente une variable et émet sa valeur.

```js
const Counter = {
  template: '<button @click="handleClick">Incrémenter</button>',
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    handleClick() {
      this.count += 1;
      this.$emit('increment', this.count);
    },
  },
};
```

Pour tester complètement ce composant, nous devrions vérifier qu'un événement `increment` avec la dernière valeur de `count` est émis.

## Tester les évènements émis

Pour ce faire, nous allons nous appuyer sur la méthode `emitted()`. Elle **renvoie un objet avec tous les événements émis par le composant** et leurs arguments dans un tableau. Voyons comment elle fonctionne&nbsp;:

```js
test('émet un évènement lorsque le bouton est cliqué', () => {
  const wrapper = mount(Counter);

  wrapper.find('button').trigger('click');
  wrapper.find('button').trigger('click');

  expect(wrapper.emitted()).toHaveProperty('increment');
});
```

> Si vous n'avez pas vu `trigger()` auparavant, ne vous inquiétez pas. Il est utilisé pour simuler une interaction utilisateur. Vous pouvez en apprendre plus dans [Tester les formulaires](./forms).

La première chose à noter est que `emitted()` renvoie un objet, où chaque clé correspond à un événement émis. Dans notre cas&nbsp;: `increment`.

Ce test devrait passer. Nous nous sommes assurés d'avoir émis un événement avec le nom approprié.

## Tester les arguments de l'évènement

C'est pas mal … mais nous pouvons faire encore mieux&nbsp;! Assurons-nous d'émettre les bons arguments lorsque `this.$emit('increment', this.count)` est appelé.

La prochaine étape consiste à vérifier que l'événement contient la valeur de `count`. Nous pouvons le faire en passant un argument à `emitted()`.

```js {8}
test('émet un évènement avec le compteur quand le bouton est cliqué', () => {
  const wrapper = mount(Counter);

  wrapper.find('button').trigger('click');
  wrapper.find('button').trigger('click');

  // `emitted()` accepte un argument. La fonction retourne un tableau contenant toutes les occurences de `this.$emit('increment')`.
  const incrementEvent = wrapper.emitted('increment');

  // Nous avons cliqué deux fois, le tableau `increment` devrait donc contenir 2 valeurs.
  expect(incrementEvent).toHaveLength(2);

  // Affirme le résultat du premier click.
  // Remarquez que la valeur est un tableau.
  expect(incrementEvent[0]).toEqual([1]);

  // Ensuite, le résultat du second évènement.
  expect(incrementEvent[1]).toEqual([2]);
});
```

Récapitulons et détaillons le retour de la fonction `emmitted()`. Chaque clé contient les différentes valeurs émises lors du test.

```js
// console.log(wrapper.emitted('increment'));
[
  [1], // première fois qu'il est appelé, `count` est égal à 1
  [2], // deuxième fois qu'il est appelé, `count` est égal à 2
]
```

## Tester des évènements complexes

Imaginons maintenant que notre composant `<Counter>` a besoin d'émettre un objet avec des informations supplémentaires. Par exemple, nous devons informer tout composant parent écoutant l'événement `@increment` si la valeur de `count` est paire ou impaire.

```js {12-15}
const Counter = {
  template: `<button @click="handleClick">Incrémenter</button>`,
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    handleClick() {
      this.count += 1;

      this.$emit('increment', {
        count: this.count,
        isEven: this.count % 2 === 0,
      });
    },
  },
};
```

Comme nous l'avons fait auparavant, nous devons déclencher l'événement `click` sur l'élément `<button>`. Ensuite, nous utilisons `emitted('increment')` pour nous assurer que les bonnes valeurs sont émises.

```js
test('émet un évènement avec le compteur quand le boutton est cliqué', () => {
  const wrapper = mount(Counter);

  wrapper.find('button').trigger('click');
  wrapper.find('button').trigger('click');

  // Nous avons cliqué deux fois, donc le tableau `increment` devrait avoir 2 valeurs.
  expect(wrapper.emitted('increment')).toHaveLength(2);

  // Ensuite, nous pouvons nous assurer que chaque élément de `wrapper.emitted('increment')` contient un tableau avec l'objet attendu.
  expect(wrapper.emitted('increment')[0]).toEqual([
    {
      count: 1,
      isEven: false,
    },
  ]);

  expect(wrapper.emitted('increment')[1]).toEqual([
    {
      count: 2,
      isEven: true,
    },
  ]);
});
```

En testant des types complexes tels que des objets, cela ne diffère pas des tests de types primaires tels que des nombres ou des chaînes de caractères.

## API de Composition

Si vous utilisez l'API de Composition, vous devez appeler `context.emit()` à la place de `this.$emit()`. `emitted()` capture les événements de l'un ou l'autre, vous pouvez donc tester votre composant en utilisant les mêmes techniques décrites précédemment.

## Conclusion

- Utilisez `emitted()` pour accéder aux événements émis par un composant Vue.
- `emitted(nom_de_levenement)` retourne un tableau, où chaque élément représente un événement émis.
- Les arguments des évènements sont stockés dans `emitted(nom_de_levenement)[index]` dans un tableau dans le même ordre qu'ils ont été émis.
