# Instance de Composant

[`mount`](/fr/api/#mount) renvoie un `VueWrapper` avec de nombreuses méthodes pratiques pour tester les composants Vue. Parfois, vous souhaiterez accéder à l'instance Vue sous-jacente. Vous pouvez y accéder via la propriété `vm`.

## Un Exemple Simple

Voici un composant simple qui combine des `props` et `data` pour afficher une salutation :

```ts
test('affiche une salutation', () => {
  const Comp = {
    template: `<div>{{ msg1 }} {{ msg2 }}</div>`,
    props: ['msg1'],
    data() {
      return {
        msg2: 'tout le monde'
      };
    },
  };

  const wrapper = mount(Comp, {
    props: {
      msg1: 'Bonjour',
    },
  });

  expect(wrapper.html()).toContain('Bonjour tout le monde');
});
```

Regardons ce qui est disponible dans `vm` avec `console.log(wrapper.vm)` :

```js
console.log(wrapper.vm);
// {
//   msg1: [Getter/Setter],
//   msg2: [Getter/Setter],
//   hasOwnProperty: [Function],
// }
```

Nous retrouvons à la fois `msg1` et `msg2` ! D'autres éléments comme les `methods` et les `computed` apparaîtront également, si elles sont définies. Lors de l'écriture d'un test, il est généralement recommandé de vérifier sur le DOM (en utilisant quelque chose comme `wrapper.html()`). Cependant, dans de rares circonstances, vous pourriez avoir besoin d'accéder à l'instance Vue sous-jacente.

## Utilisation avec `getComponent` et `findComponent`

`getComponent` et `findComponent` retourne un `VueWrapper` - semblable à celui que nous retourne `mount()`. This means you can also access all the same properties, including `vm`, on the result of `getComponent` or `findComponent`.

Prenons un exemple simple :

```js
test('vérifie que les bonnes props sont passées', () => {
  const Foo = {
    props: ['msg'],
    template: `<div>{{ msg }}</div>`,
  }

  const Comp = {
    components: { Foo },
    template: `<div><foo msg="Bonjour tout le monde" /></div>`,
  };

  const wrapper = mount(Comp);

  expect(wrapper.getComponent(Foo).vm.msg).toBe('Bonjour tout le monde');
  expect(wrapper.getComponent(Foo).props()).toEqual({ msg: 'Bonjour tout le monde' });
});
```

Une manière plus approfondie de tester cela consisterait à vérifier par rapport au contenu affiché. En faisant cela, vous affirmez que la bonne `prop` est passée et affichée.

::: tip
Note : si vous utilisez un composant `<script setup>`, `vm` ne sera pas disponible. C'est parce que les composants `<script setup>` sont [fermés par défaut](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md#exposing-components-public-interface). Pour ces composants, et en général, évitez `vm` et faites vos vérifications par rapport à ce qui est affiché.
:::

:::warning Le type `WrapperLike` en utilisant un sélecteur CSS 
Lors de l'utilisation de `wrapper.findComponent('.foo')` par exemple, VTU renverra le type `WrapperLike`. C'est parce que les composants fonctionnels auraient besoin d'un `DOMWrapper` sinon d'un `VueWrapper`. Vous pouvez forcer le retour d'un `VueWrapper` en fournissant le type de composant correct :

```typescript
wrapper.findComponent('.foo'); // retourne un `WrapperLike`.
wrapper.findComponent<typeof FooComponent>('.foo'); // retourne un `VueWrapper`.
wrapper.findComponent<DefineComponent>('.foo'); // retourne un `VueWrapper`
```
:::

## Conclusion

- Utilisez `vm` pour accéder à l'instance Vue sous-jacente.
- `getComponent` et `findComponent` retourne un `VueWrapper`. Ces instances Vue sont aussi disponibles via `vm`.
