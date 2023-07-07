# FAQ

[[toc]]

## Vue warn: Failed setting prop

```
[Vue warn]: Failed setting prop "prefix" on <component-stub>: value foo is invalid.
TypeError: Cannot set property prefix of #<Element> which has only a getter
```

Cet avertissement est affiché si vous utilisez `shallowMount` ou `stubs` avec une propriété dont le nom est celui de l'une des propriétés de [`Element`](https://developer.mozilla.org/fr-FR/docs/Web/API/Element).

Parmi les noms de propriétés courants partagés avec `Element` figurent&nbsp;:
* `attributes`
* `children`
* `prefix`

Voir https://developer.mozilla.org/en-US/docs/Web/API/Element

**Solutions possibles**

1. Utilisez `mount` au lieu de `shallowMount` pour rendre le composant sans utiliser de `stubs`
2. Ignorez l'avertissement en utilisant un mock pour `console.warn`
3. Renommez la propriété du composant pour éviter les conflits avec les propriétés de `Element`
