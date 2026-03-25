# Instance de Composant

[`mount`](/fr/api/#mount) renvoie un `VueWrapper` avec de nombreuses méthodes pratiques pour tester les composants Vue. Parfois, vous souhaiterez accéder à l'instance Vue sous-jacente. Vous pouvez y accéder via la propriété `vm`.

## Un exemple simple

Voici un composant simple qui combine des `props` et `data` pour afficher une salutation&nbsp;:

```ts
test('affiche une salutation', () => {
  const Comp = {
    template: `<div>{{ msg1 }} {{ msg2 }}</div>`,
    props: ['msg1'],
    data() {
      return {
        msg2: 'tout le monde'
      }
    }
  }

  const wrapper = mount(Comp, {
    props: {
      msg1: 'Bonjour'
    }
  })

  expect(wrapper.html()).toContain('Bonjour tout le monde')
})
```

Regardons ce qui est disponible dans `vm` avec `console.log(wrapper.vm)`&nbsp;:

```js
console.log(wrapper.vm)
// {
//   msg1: [Getter/Setter],
//   msg2: [Getter/Setter],
//   hasOwnProperty: [Function],
// }
```

Nous retrouvons à la fois `msg1` et `msg2`&nbsp;! D'autres éléments comme les `methods` et les `computed` apparaîtront également, si elles sont définies. Lors de l'écriture d'un test, il est généralement recommandé de vérifier les résultats dans le DOM (en utilisant quelque chose comme `wrapper.html()`). Cependant, dans de rares circonstances, vous pourriez avoir besoin d'accéder à l'instance Vue sous-jacente.

## Utilisation avec `getComponent` et `findComponent`

`getComponent` et `findComponent` retourne un `VueWrapper` - semblable à celui que nous retourne `mount()`. Cela veut dire que vous pouvez accéder aux mêmes propriétés, incluant `vm`, par le résultat de `getComponent` ou `findComponent`.

Prenons un exemple simple&nbsp;:

```js
test('vérifie que les bonnes props sont passées', () => {
  const Foo = {
    props: ['msg'],
    template: `<div>{{ msg }}</div>`
  }

  const Comp = {
    components: { Foo },
    template: `<div><foo msg="Bonjour tout le monde" /></div>`
  }

  const wrapper = mount(Comp)

  expect(wrapper.getComponent(Foo).vm.msg).toBe('Bonjour tout le monde')
  expect(wrapper.getComponent(Foo).props()).toEqual({
    msg: 'Bonjour tout le monde'
  })
})
```

Une manière plus approfondie de tester cela consisterait à vérifier le contenu affiché. En faisant cela, vous vérifiez que la bonne `prop` est passée et affichée.

:::warning Le type `WrapperLike` en utilisant un sélecteur CSS
Lors de l'utilisation de `wrapper.findComponent('.foo')` par exemple, VTU renverra le type `WrapperLike`. C'est parce que les composants fonctionnels auraient besoin d'un `DOMWrapper` au lieu d'un `VueWrapper`. Vous pouvez forcer le retour d'un `VueWrapper` en fournissant le type de composant correct&nbsp;:

```typescript
wrapper.findComponent('.foo') // retourne un `WrapperLike`.
wrapper.findComponent<typeof FooComponent>('.foo') // retourne un `VueWrapper`.
wrapper.findComponent<DefineComponent>('.foo') // retourne un `VueWrapper`
```

:::

## Conclusion

- Utilisez `vm` pour accéder à l'instance Vue sous-jacente.
- `getComponent` et `findComponent` retourne un `VueWrapper`. Ces instances Vue sont aussi disponibles via `vm`.
