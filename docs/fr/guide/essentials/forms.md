# Tester les formulaires

Les formulaires dans Vue peuvent être aussi simples que des formulaires HTML classiques ou à l'inverse des arborescences complexes d'éléments de formulaire de composants Vue personnalisés.

Nous passerons progressivement en revue les moyens d'interagir avec les éléments d'un formulaire, de définir leurs valeurs et de déclencher des événements.

Les méthodes que nous utiliserons le plus seront `setValue()` et `trigger()`.

## Interagir avec les éléments d'un formulaire

Jetons un œil à un formulaire très basique&nbsp;:

```vue
<template>
  <div>
    <input type="email" v-model="email" />

    <button @click="submit">Soumettre</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
    };
  },
  methods: {
    submit() {
      this.$emit('submit', this.email);
    },
  },
};
</script>
```

### Définir les valeurs des éléments

La manière la plus courante de lier un `input` à une donnée dans Vue est d'utiliser `v-model`. Comme vous le savez probablement déjà, Vue gère les événements émis par chaque élément de formulaire et les propriétés qu'il accepte, ce qui facilite la façon de les gérer.

Pour modifier la valeur d'un `input` dans VTU, vous pouvez utiliser la méthode `setValue()`. Elle accepte un paramètre, le plus souvent une `string` ou un `boolean`, et renvoie une `Promise` qui se `resolve` après que Vue ait mis à jour le DOM.

```js
test('définit une valeur', async () => {
  const wrapper = mount(Component);
  const input = wrapper.find('input');

  await input.setValue('mon@mail.com');

  expect(input.element.value).toBe('mon@mail.com');
});
```

Comme vous pouvez le constater, `setValue` définit la propriété `value` de l'`input` avec ce que nous lui passons.

Nous utilisons `await` pour nous assurer que Vue ait terminé la mise à jour et que la nouvelle valeur se reflète bien dans le DOM avant de faire des vérifications.

### Déclencher des évènements

Déclencher des événements est la deuxième action la plus importante lorsque l'on travaille avec des formulaires. Examinons notre `button`, du précédent exemple.

```html
<button @click="submit">Soumettre</button>
```

Pour déclencher un évènement `click`, nous pouvons utiliser la méthode `trigger`.

```js
test('déclencher un click', async () => {
  const wrapper = mount(Component);

  // déclencher l'évènement
  await wrapper.find('button').trigger('click');

  // vérifier qu'une action a été faite, comme l'émission de l'évènement `submit`.
  expect(wrapper.emitted()).toHaveProperty('submit');
});
```
> Si vous ne connaissez pas encore `emitted()`, ne vous inquiétez pas. Il est utilisé pour vérifier les événements émis par un composant. Vous pouvez en savoir plus dans [Tester les évènements](./event-handling).

Nous déclenchons l'événement `click` afin que le composant exécute la méthode `submit`. Comme nous l'avons fait avec `setValue`, nous utilisons `await` pour nous assurer que l'action est reflétée par Vue.

Nous pouvons alors vérifier que certaines actions ont eu lieu. Dans ce cas, que nous avons émis le bon événement.

Combinons maintenant ces deux éléments pour tester si notre formulaire simple émet les entrées de l'utilisateur.

```js
test('émet la valeur de l\'input vers le composant parent', async () => {
  const wrapper = mount(Component);

  // définir la valeur
  await wrapper.find('input').setValue('mon@mail.com');

  // déclencher l'évènement
  await wrapper.find('button').trigger('click');

  // vérifier que l'évènement `submit` a bien été déclenché
  expect(wrapper.emitted('submit')[0][0]).toBe('mon@mail.com');
});
```

## Exemples avancés

Maintenant que nous connaissons les bases, plongeons dans des exemples plus complexes.

### Travailler avec des éléments de formulaire divers

Nous avons vu que `setValue` fonctionne avec les `input` simples, mais est en vérité beaucoup plus polyvalent&nbsp;: il peut définir la valeur sur divers types d'`input`.

Examinons un formulaire plus complexe, qui comporte plusieurs types d'`input`.

```vue
<template>
  <form @submit.prevent="submit">
    <input type="email" v-model="form.email" />

    <textarea v-model="form.description" />

    <select v-model="form.city">
      <option value="new-york">New York</option>
      <option value="moscou">Moscou</option>
    </select>

    <input type="checkbox" v-model="form.subscribe" />

    <input type="radio" value="hebdomadaire" v-model="form.interval" />
    <input type="radio" value="mensuelle" v-model="form.interval" />

    <button type="submit">Soumettre</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        description: '',
        city: '',
        subscribe: false,
        interval: '',
      },
    };
  },
  methods: {
    async submit() {
      this.$emit('submit', this.form);
    },
  },
};
</script>
```

Notre composant Vue est un peu plus long, a quelques types d'`input` supplémentaires et maintenant, la gestion de la soumission du formulaire est déplacé vers un élément `<form/>`.

De la même manière que nous avons défini la valeur de l'`input` précédemment, nous pouvons la définir sur toutes les autres entrées du formulaire.

```js
import { mount } from '@vue/test-utils';
import FormComponent from './FormComponent.vue';

test('soumet le formulaire', async () => {
  const wrapper = mount(FormComponent);

  await wrapper.find('input[type=email]').setValue('mon@mail.com');
  await wrapper.find('textarea').setValue('Lorem ipsum dolor sit amet');
  await wrapper.find('select').setValue('moscou');
  await wrapper.find('input[type=checkbox]').setValue();
  await wrapper.find('input[type=radio][value=mensuelle]').setValue();
});
```

Comme vous pouvez le constater, la méthode `setValue` est très polyvalente. Elle peut fonctionner avec tous les types d'`input` d'un formulaire.

Nous utilisons `await` partout pour nous assurer que chaque modification a été appliquée avant de déclencher la suivante. Il est recommandé de le faire pour s'assurer que vos vérifications s'effectueront une fois que le DOM ait bien été mis à jour.

::: tip
Si vous ne passez pas de paramètre à `setValue` pour les `input` `OPTION`, `CHECKBOX` ou `RADIO`, ils seront définis comme `checked`.
:::

Nous avons défini les valeurs dans notre formulaire, il est maintenant temps de soumettre le formulaire et de faire quelques vérifications.

### Déclencher des évènements complexes

Les événements ne sont pas toujours des simples `click`. Vue vous permet d'écouter tous les types d'événements DOM, d'ajouter des modificateurs spéciaux tels que `.prevent` et plus encore. Regardons comment nous pouvons les tester.

Dans notre formulaire ci-dessus, nous avons déplacé l'événement du `button` vers l'élément `form`. C'est une bonne pratique à suivre, car cela vous permet de soumettre un formulaire en appuyant sur la touche `entrée`, ce qui est une approche plus native.

Pour déclencher l'évènement `submit`, nous utilisons à nouveau la méthode `trigger`.

```js {14,16-22}
test('soumet le formulaire', async () => {
  const wrapper = mount(FormComponent);

  const email = 'mon@mail.com';
  const description = 'Lorem ipsum dolor sit amet';
  const city = 'moscou';

  await wrapper.find('input[type=email]').setValue(email);
  await wrapper.find('textarea').setValue(description);
  await wrapper.find('select').setValue(city);
  await wrapper.find('input[type=checkbox]').setValue();
  await wrapper.find('input[type=radio][value=mensuelle]').setValue();

  await wrapper.find('form').trigger('submit.prevent');

  expect(wrapper.emitted('submit')[0][0]).toStrictEqual({
    email,
    description,
    city,
    subscribe: true,
    interval: 'mensuelle',
  });
});
```

Pour tester le modificateur d'événement, nous avons directement copié-collé notre chaîne d'événement `submit.prevent` dans `trigger`. `trigger` peut lire l'événement transmis et tous ses modificateurs et appliquer seulement ce qui est nécessaire.

::: tip
Les modificateurs d'événements natifs tels que `.prevent` et `.stop` sont spécifiques à Vue et nous n'avons pas besoin de les tester, Vue le fait déjà.
:::

Ensuite, nous faisons une simple vérification&nbsp;: est-ce que le formulaire a émis l'événement et les données sont-elles correctes.

#### Soumission de formulaire native

Le déclenchement d'un événement `submit` sur un élément `<form>` imite le comportement du navigateur lors de la soumission d'un formulaire. Si nous voulions déclencher la soumission de formulaire de manière plus naturelle, nous pourrions déclencher un événement `click` sur le bouton de soumission à la place. Comme les éléments de formulaire non connectés à un `document` ne peuvent pas être soumis, selon la spécification HTML, nous devons utiliser [`attachTo`](../../api/#attachto) pour connecter l'élément du `wrapper`.

#### Plusieurs modificateurs sur un même évènement

Supposons que vous ayez un formulaire très détaillé et très complexe, avec une gestion d'interaction utilisateur spéciale. Comment pouvons-nous le tester&nbsp;?

```html
<input @keydown.meta.c.exact.prevent="captureCopy" v-model="input" />
```

Supposons que nous ayons une entrée qui gère lorsque l'utilisateur fait `cmd` + `c`, et que nous voulons l'intercepter et l'empêcher de copier. Tester cela est aussi simple que de copier et coller l'événement du composant vers la méthode `trigger()`.

```js
test('gère des évènements complexes', async () => {
  const wrapper = mount(Component);

  await wrapper.find(input).trigger('keydown.meta.c.exact.prevent');

  // faites les vérifications ici
});
```
Vue Test Utils lit l'événement et applique les propriétés appropriées à l'objet événement. Dans ce cas, cela correspondra à quelque chose comme ceci&nbsp;:

```js
// {
  // ... autres propriétés
  // "key": "c",
  // "metaKey": true
// }
```

#### Ajouter de la donnée supplémentaire à un évènement

Supposons que votre code ait besoin de quelque chose à l'intérieur de l'objet `event`. Vous pouvez tester ce cas en passant des données supplémentaires en tant que deuxième paramètre.

```vue
<template>
  <form>
    <input type="text" v-model="value" @blur="handleBlur" />
    <button>Soumettre</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      value: '',
    };
  },
  methods: {
    handleBlur(event) {
      if (event.relatedTarget.tagName === 'BUTTON') {
        this.$emit('focus-lost');
      }
    },
  },
};
</script>
```

```js
import Form from './Form.vue';

test('émet un évènement seulement si l\'on perd le focus du bouton', () => {
  const wrapper = mount(Form);

  const componentToGetFocus = wrapper.find('button');

  wrapper.find('input').trigger('blur', {
    relatedTarget: componentToGetFocus.element,
  });

  expect(wrapper.emitted('focus-lost')).toBeTruthy();
});
```

Ici, nous supposons que notre code vérifie à l'intérieur de l'objet `event` si `relatedTarget` est un bouton ou non. Nous pouvons simplement passer une référence de l'élément, en imitant ce qui se produirait si l'utilisateur clique sur un `button` après avoir tapé quelque chose dans l'`input`.

## Interagir avec des `input` de Vue

Les `input` ne sont pas toujours des éléments simples. Nous utilisons souvent des composants Vue qui se comportent comme des `input`. Ils peuvent ajouter du code HTML, du style et beaucoup de fonctionnalités dans un format facile à utiliser.

Le test de formulaires utilisant de tels `input` peut être intimidant au début, mais avec quelques règles simples, cela devient rapidement un jeu d'enfant.

Ci-dessous se trouve un composant qui comprend un `label` et un `input`&nbsp;:

```vue
<template>
  <label>
    {{ label }}
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script>
export default {
  name: 'CustomInput',

  props: ['modelValue', 'label'],
};
</script>
```

Ce composant Vue émet également ce que vous tapez. Vous pouvez l'utiliser comme ceci&nbsp;:

```html
<custom-input v-model="input" label="Texte" class="text-input" />
```

Comme ci-dessus, la plupart de `input` Vue ont un véritable `button` ou `input` en eux. Vous pouvez tout aussi facilement trouver cet élément et agir dessus.

```js
test('remplit le formulaire', async () => {
  const wrapper = mount(CustomInput);

  await wrapper.find('.text-input input').setValue('text');

  // vous pouvez ici vérifier plusieurs choses comme la soumission du formulaire
});
```

### Tester des composants `input` complexes

Imaginons que votre composant `input` n'est pas aussi simple, car vous utilisez une bibliothèque d'interface utilisateur, comme Vuetify. Si vous dépendez de la recherche dans le code HTML pour trouver l'élément approprié, vos tests peuvent être compromis si la bibliothèque externe décide de changer ses éléments internes.

Le cas échéant, vous pouvez définir la valeur directement en utilisant l'instance du composant et la méthode `setValue`.

Supposons que nous ayons un formulaire qui utilise la `<textarea>` Vuetify&nbsp;:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <v-textarea v-model="description" ref="description" />
    <button type="submit">Envoyer</button>
  </form>
</template>

<script>
export default {
  name: 'CustomTextarea',
  data() {
    return {
      description: '',
    };
  },
  methods: {
    handleSubmit() {
      this.$emit('submitted', this.description);
    },
  },
};
</script>
```

Nous pouvons utiliser `findComponent` pour trouver l'instance du composant et définir sa valeur.

```js
test('émet la valeur de textarea lors de la soumission', async () => {
  const wrapper = mount(CustomTextarea);
  const description = 'Un texte très long...';

  await wrapper.findComponent({ ref: 'description' }).setValue(description);

  wrapper.find('form').trigger('submit');

  expect(wrapper.emitted('submitted')[0][0]).toEqual(description);
});
```

## Conclusion

- Utilisez `setValue` pour définir la valeur sur les `input` du DOM et les composants Vue.
- Utilisez `trigger` pour déclencher des événements du DOM, avec ou sans modificateurs.
- Ajoutez des données d'événement supplémentaires à `trigger` en utilisant le deuxième paramètre.
- Assurez-vous que le DOM a été modifié et que les bons événements ont été émis. Essayez de ne pas faire de vérifications sur l'instance du composant.
