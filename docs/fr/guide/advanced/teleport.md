# Tester Teleport

Vue 3 offre un nouveau composant intégré : `<Teleport>`, qui permet aux composants de "téléporter" leur contenu très loin de leur propre `<template>`. La plupart des tests écrits avec Vue Test Utils sont limités au composant passé à `mount`, ce qui introduit une certaine complexité lorsqu'il s'agit de tester un composant qui est téléporté en dehors du composant où il est initialement rendu.

Voici quelques techniques pour tester les composants en utilisant `<Teleport>`.

::: tip
Si vous voulez tester le reste de votre composant en ignorant le "teleport", vous pouvez utiliser un composant de substitution (`stub`) pour les composants "teleport" en passant `teleport: true` dans l'[option globale de stubs](../../api/#global-stubs).
:::

## Un Exemple

Dans cet exemple, nous testons un composant `<Navbar>`. Il affiche un composant `<SignUp>` à l'intérieur d'un `<Teleport>`. La propriété `target` de `<Teleport>` est un élément situé en dehors du composant `<Navbar>`.

Voici le composant `Navbar.vue` :

```vue
<template>
  <Teleport to="#modal">
    <SignUp />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignUp from './Signup.vue';

export default defineComponent({
  components: {
    SignUp,
  },
});
</script>
```

Cela téléporte simplement un composant `<SignUp>` quelque part ailleurs. Restons simple pour cet exemple.

`SignUp.vue` est un formulaire qui valide si `username` est supérieur à 8 caractères. Si c'est le cas, lors de la soumission du formulaire, il émet un événement `signup` accompagné du `username`. Notre objectif sera de le tester.

```vue
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ['signup'],
  data() {
    return {
      username: '',
    };
  },
  computed: {
    error() {
      return this.username.length < 8;
    },
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit('signup', this.username);
      }
    },
  },
};
</script>
```

## Monter le Composant

Commençons avec un test simple :

```ts
import { mount } from '@vue/test-utils';
import Navbar from './Navbar.vue';
import Signup from './Signup.vue';

test('émet un évènement signup quand le formulaire est soumit', async () => {
  const wrapper = mount(Navbar);
  // ... Suite du test
});
```

Exécuter ce test vous donnera un avertissement (`warning`) : `[Vue warn]: Failed to locate Teleport target with selector "#modal"`. Créons-le :

```ts {5-15}
import { mount } from '@vue/test-utils';
import Navbar from './Navbar.vue';
import Signup from './Signup.vue';

beforeEach(() => {
  // nous crééons la cible de teleport
  const el = document.createElement('div');
  el.id = 'modal';
  document.body.appendChild(el);
})

afterEach(() => {
  // nous nettoyons un peu
  document.body.outerHTML = '';
});

test('teleport', async () => {
  const wrapper = mount(Navbar);
});
```

Nous utilisons Jest pour cet exemple, qui ne réinitialise pas le DOM à chaque test. C'est pourquoi il est bon de nettoyer après chaque test avec `afterEach`.

## Interagir avec le Composant Téléporté

La prochaine étape consiste à remplir le champ "nom d'utilisateur". Malheureusement, nous ne pouvons pas utiliser `wrapper.find('input')`. Pourquoi ? Un rapide `console.log(wrapper.html())` nous montre que :

```html
<!--teleport commence ici-->
<!--teleport termine ici-->
```

Nous voyons certains commentaires utilisés par Vue pour gérer `<Teleport>` - mais pas de `<input>` ici. C'est parce que le composant `<Signup>` (et son HTML) ne sont plus affichés à l'intérieur de `<Navbar>` - il a été téléporté à l'extérieur.

Bien que le HTML réel soit téléporté à l'extérieur, il semble que le DOM virtuel associé à `<Navbar>` maintienne une référence au composant d'origine. Cela signifie que vous pouvez utiliser `getComponent` et `findComponent`, qui fonctionnent sur le DOM virtuel, pas sur le DOM régulier.

```ts {12}
beforeEach(() => {
  // ...
});

afterEach(() => {
  // ...
});

test('teleport', async () => {
  const wrapper = mount(Navbar);

  wrapper.getComponent(Signup); // le composant est bien récupéré ici !
});
```

`getComponent` retourne un `VueWrapper`. Maintenant, vous pouvez utiliser des méthodes telles que `get`, `find` et `trigger`.

Finissons le test :

```ts {4-8}
test('teleport', async () => {
  const wrapper = mount(Navbar);

  const signup = wrapper.getComponent(Signup);
  await signup.get('input').setValue('nom_d_utilisateur_valide');
  await signup.get('form').trigger('submit.prevent');

  expect(signup.emitted().signup[0]).toEqual(['nom_d_utilisateur_valide']);
});
```

Cela fonctionne !

Le test complet :

```ts
import { mount } from '@vue/test-utils';
import Navbar from './Navbar.vue';
import Signup from './Signup.vue';

beforeEach(() => {
  // nous crééons la cible de teleport
  const el = document.createElement('div');
  el.id = 'modal';
  document.body.appendChild(el);
});

afterEach(() => {
  // nous nettoyons un peu
  document.body.outerHTML = '';
});

test('teleport', async () => {
  const wrapper = mount(Navbar);

  const signup = wrapper.getComponent(Signup);
  await signup.get('input').setValue('nom_d_utilisateur_valide');
  await signup.get('form').trigger('submit.prevent');

  expect(signup.emitted().signup[0]).toEqual(['nom_d_utilisateur_valide']);
});
```

## Conclusion

- Créez une cible de téléportation avec `document.createElement`.
- Trouvez les composants téléportés à l'aide de `getComponent` ou `findComponent` qui fonctionnent au niveau du DOM virtuel.
