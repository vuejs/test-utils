# Slots

Vue Test Utils offre des fonctionnalités utiles pour tester les composants qui utilisent des `slots`.

## Un exemple simple

Vous pourriez avoir un composant `<layout>` générique qui utilise un `slot` par défaut pour afficher du contenu. Par exemple&nbsp;:

```js
const Layout = {
  template: `
    <div>
      <h1>Bienvenue !</h1>
      <main>
        <slot />
      </main>
      <footer>
        Merci de votre visite.
      </footer>
    </div>
  `,
};
```

Vous pourriez vouloir écrire un test pour vous assurer que le contenu du `slot` par défaut est bien affiché. VTU fournit l'option de `mount()`: `slots`.

```js
test('affiche le slot par défaut', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: 'Contenu principal',
    },
  });

  expect(wrapper.html()).toContain('Contenu principal');
});
```

Le test passe&nbsp;! Dans cet exemple, nous transmettons du texte au `slot` par défaut. Si vous voulez être encore plus spécifique et vérifier que le contenu du `slot` par défaut est rendu à l'intérieur de `<main>`, vous pourriez changer la vérification&nbsp;:

```js
test('affiche le slot par défaut', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: 'Contenu principal',
    },
  });

  expect(wrapper.find('main').text()).toContain('Contenu principal');
});
```

## Slots Nommés

Vous pourriez avoir un composant `<layout>` plus complexe avec certains `slots` nommés. Par exemple&nbsp;:

```js
const Layout = {
  template: `
    <div>
      <header>
        <slot name="header" />
      </header>

      <main>
        <slot name="main" />
      </main>
      <footer>
        <slot name="footer" />
      </footer>
    </div>
  `,
};
```

VTU prend également en charge cela. Vous pouvez écrire un test comme ce qui suit. Notez que dans cet exemple, nous transmettons du HTML au lieu de simple texte aux `slots`.

```js
test('affiche tous les slots', () => {
  const wrapper = mount(Layout, {
    slots: {
      header: '<div>Haut de page</div>',
      main: '<div>Contenu de la page</div>',
      footer: '<div>Pied de page</div>',
    },
  });

  expect(wrapper.html()).toContain('<div>Haut de page</div>');
  expect(wrapper.html()).toContain('<div>Contenu de la page</div>');
  expect(wrapper.html()).toContain('<div>Pied de page</div>');
});
```

## Slots Multiples

Vous pouvez aussi passer un tableau de `slots`&nbsp;:

```js
test('affiche la page', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: [
        '<div id="one">Un</div>',
        '<div id="two">Deux</div>',
      ],
    },
  });

  expect(wrapper.find('#one').exists()).toBe(true);
  expect(wrapper.find('#two').exists()).toBe(true);
});
```

## Utilisation avancée

Vous pouvez également passer une fonction de rendu, un objet avec un `template` ou même un composant importé à partir d'un fichier `vue` à la fonction `mount`, dans les options de `slots`&nbsp;:

```js
import { h } from 'vue';
import Header from './Header.vue';

test('affiche la page entière', () => {
  const wrapper = mount(Layout, {
    slots: {
      header: Header,
      main: h('div', 'Contenu principal'),
      sidebar: { template: '<div>Barre latérale</div>' },
      footer: '<div>Pied de page</div>',
    },
  });

  expect(wrapper.html()).toContain('<div>Haut de page</div>');
  expect(wrapper.html()).toContain('<div>Contenu principal</div>');
  expect(wrapper.html()).toContain('<div>Pied de page</div>');
});
```

[Référez-vous à ces tests](https://github.com/vuejs/test-utils/blob/9d3c2a6526f3d8751d29b2f9112ad2a3332bbf52/tests/mountingOptions/slots.spec.ts#L124-L167) pour plus de cas d'utilisation.

## Slots à portée limitée (Scoped Slots)

[Les slots à portée limitée](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) et les liaisons de données (`bindings`) sont aussi supportés par VTU. 

```js
const ComponentWithSlots = {
  template: `
    <div class="scoped">
      <slot name="scoped" v-bind="{ msg }" />
    </div>
  `,
  data() {
    return {
      msg: 'monde',
    };
  },
};

test('slot à portée limitée', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `<template #scoped="scope">
        Bonjour tout le {{ scope.msg }}
        </template>
      `
    },
  });

  expect(wrapper.html()).toContain('Bonjour tout le monde');
});
```

Lorsqu'on utilise des `string templates` pour le contenu du `slot`, **si ce n'est pas explicitement défini à l'aide d'un tag `<template #scoped="scopeVar">`**, la portée du `slot` devient disponible sous forme d'un objet `params` lorsque le `slot` est monté.

```js
test('slot à portée limitée', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `Bonjour tout le {{ params.msg }}` // aucun template n'a été fourni, le portée du slot est exposée en tant que "params".
    }
  });

  expect(wrapper.html()).toContain('Bonjour tout le monde');
});
```

## Conclusion

- Utilisez l'option de `mount()`&nbsp;: `slots` pour tester que les composants utilisant `<slot>` affiche correctement le contenu.
- Le contenu peut être une `string`, une fonction de rendu ou un composant Vue importé.
- Utilisez `default` pour le `slot` par défaut et le nom exact pour les `slots` nommés.
- Les `slots` à portée limitée et le raccourci `#` sont également pris en charge.
