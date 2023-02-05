# Rendu conditionnel

Vue Test Utils offre un bouquet de fonctionnalités pour monter et faire des vérifications sur l'état d'un composant, dans le but de vérifier qu'il se comporte correctement. Cet article explorera comment monter des composants ainsi que vérifier qu'ils rendent correctement leur contenu.

Cet article est également disponible sous la forme d'une [courte vidéo](https://www.youtube.com/watch?v=T3CHtGgEFTs&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=15).

## Trouver des éléments

L'une des fonctionnalités les plus basiques de Vue est la capacité d'insérer et de supprimer dynamiquement des éléments avec `v-if`. Voyons comment tester un composant qui utilise `v-if`.

```js
const Nav = {
  template: `
    <nav>
      <a id="profile" href="/profile">Mon Profil</a>
      <a v-if="admin" id="admin" href="/admin">Administration</a>
    </nav>
  `,
  data() {
    return {
      admin: false,
    };
  }
}
```

Dans le composant `<Nav>`, un lien vers le profil de l'utilisateur est affiché. De plus, si la valeur `admin` est à `true`, nous affichons un lien vers la section administrateur. Il y a trois scénarios dont le comportement doit être vérifié :

1. Le lien `/profile` doit être affiché.
2. Lorsque l'utilisateur est un administrateur, le lien `/admin` doit être affiché.
3. Lorsque l'utilisateur n'est pas un administrateur, le lien `/admin` ne doit pas être affiché.

## Utilisation de `get()`

`wrapper` a une méthode `get()` qui recherche un élément existant. Il utilise la syntaxe de [`querySelector`](https://developer.mozilla.org/fr-FR/docs/Web/API/Document/querySelector).

Nous pouvons vérifier le contenu du lien de profil en utilisant `get()` :

```js
test('affiche le lien du profil', () => {
  const wrapper = mount(Nav);

  // Ici, nous vérifions implicitement que l'élément #profile existe.
  const profileLink = wrapper.get('#profile');

  expect(profileLink.text()).toEqual('Mon Profil');
});
```

Si `get()` ne retourne pas un élément correspondant au sélecteur, il enverra une erreur et votre test échouera. `get()` retourne un `DOMWrapper` si un élément est trouvé. Un `DOMWrapper` est une fine enveloppe autour de l'élément DOM qui implémente l'[API Wrapper](/api/#wrapper-methods) - c'est pourquoi nous pouvons exécuter `profileLink.text()` et accéder au texte. Vous pouvez accéder à l'élément brut en utilisant la propriété `element`.

Il existe un autre type d'enveloppe - un `VueWrapper` - qui est retourné par [`getComponent`](/api/#getcomponent) qui fonctionne de la même manière.

## Utilisation de `find()` et `exists()`

`get()` fonctionne sur l'hypothèse que les éléments existent et envoie une erreur dans le cas contraire. Il n'est _pas_ recommandé de l'utiliser pour vérifier l'existence d'un élément.

Pour ce faire, nous utilisons plutôt `find()` et `exists()`. Le prochain test vérifie que si `admin` est `false` (ce qui est par défaut), le lien administrateur ne sera pas présent :

```js
test('does not render an admin link', () => {
  const wrapper = mount(Nav);

  // Utiliser `wrapper.get` renverrait une erreur et ferait échouer le test.
  expect(wrapper.find('#admin').exists()).toBe(false);
});
```

Remarquez que nous appelons `exists()` sur la valeur retournée par `.find()`. `find()`, comme `mount()`, retourne également un `wrapper`. `mount()` a quelques méthodes supplémentaires, car il enveloppe un composant Vue, et `find()` ne retourne qu'un nœud DOM standard, mais de nombreuses méthodes sont partagées entre les deux. D'autres méthodes incluent `classes()` qui retournera les classes qu'un nœud DOM a, ou encore `trigger()`, qui simulera une interaction utilisateur. Vous pouvez trouver une liste des méthodes prises en charge [ici](../../api/#wrapper-methods).

## Utilisation de `data`

Le dernier test consiste à vérifier que le lien admin est rendu lorsque `admin` est à `true`. Il est par défaut à `false`, mais nous pouvons le surcharger en utilisant le deuxième argument de `mount()`. Les options de cette fonction sont [`disponibles ici`](../../api/#mount-options).

Pour `data`, nous utilisons l'option éponyme :

```js
test('affiche le lien admin', () => {
  const wrapper = mount(Nav, {
    data() {
      return {
        admin: true,
      }
    }
  });

  // Encore une fois, en utilisant `get()` nous vérifions implicitement que l'élément existe
  expect(wrapper.get('#admin').text()).toEqual('Administration');
});
```

Si vous avez d'autres propriétés dans `data`, ne vous inquiétez pas - Vue Test Utils fusionnera les deux ensemble. Le champ `data` dans les options de `mount()` auront la priorité sur toutes les valeurs par défaut.

Pour découvrir quelles sont les autres options de `mount()`, consultez [`Passer des données aux Composants`](../essentials/passing-data.md) ou consultez les [`options de mount()`](../../api/#mount-options).

## Vérifier la visibilité des Éléments

Parfois, vous ne voulez que masquer/afficher un élément tout en le conservant dans le DOM. Vue propose `v-show` pour des scénarios de ce genre. (Vous retrouverez les différences entre `v-if` et `v-show` [ici](https://v3.vuejs.org/guide/conditional.html#v-if-vs-v-show).

Voici à quoi ressemble un composant avec `v-show` :

```js
const Nav = {
  template: `
    <nav>
      <a id="user" href="/profile">Mon Profil</a>
      <ul v-show="shouldShowDropdown" id="user-dropdown">
        <!-- dropdown content -->
      </ul>
    </nav>
  `,
  data() {
    return {
      shouldShowDropdown: false,
    };
  },
};
```

Dans ce scénario, l'élément n'est pas visible mais toujours rendu dans le DOM. `get()` ou `find()` retournera toujours un `Wrapper` - `find()` avec `.exists()` retourne toujours `true` - car **l'élément est toujours dans le DOM**.

## Utilisation de `isVisible()`

Lorsque vous utilisez `v-show`, vous pouvez vérifier la visibilité d'un élément en utilisant la méthode `isVisible()`. Cette méthode vérifie si :

- un élément ou l'un de ses ancêtres a un style `display: none`, `visibility: hidden` ou `opacity: 0`.
- un élément ou l'un de ses ancêtres se trouve à l'intérieur d'un élément `<details>` réduit.
- un élément ou l'un de ses ancêtres a l'attribut `hidden`.

Si l'un de ces critères est rempli, `isVisible()` retournera `false`.

Les tests pour les scénarios utilisant `v-show` ressembleront à ceci :

```js
test("n'affiche pas le menu déroulant de l'utilisateur", () => {
  const wrapper = mount(Nav);

  expect(wrapper.get('#user-dropdown').isVisible()).toBe(false);
});
```

## Conclusion

- Utilisez `find()` avec `exists() pour vérifier si un élément est dans le DOM.
- Utilisez `get()` si vous vous attendez à ce que l'élément soit dans le DOM.
- L'option de `mount()` `data` peut être utilisée pour définir des valeurs par défaut sur un composant.
- Utilisez `get()` avec `isVisible()` pour vérifier la visibilité d'un élément qui est dans le DOM.
