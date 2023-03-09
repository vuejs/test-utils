---
sidebar: auto
---

# API

## mount

Crée un `Wrapper` qui contient le composant Vue monté et rendu pour le test.

**Signature&nbsp;:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: HTMLElement | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
  shallow?: boolean
};

function mount(Component, options?: MountingOptions): VueWrapper
```

**Utilisation&nbsp;:**

`mount` est la méthode principale exposée par Vue Test Utils. Elle crée une application Vue 3 qui contient et rend le composant en cours de test. En retour, il crée un wrapper pour agir et vérifier le comportement du composant.

```js
import { mount } from '@vue/test-utils';

const Component = {
  template: '<div>Bonjour tout le monde</div>',
};

test('monte un composant', () => {
  const wrapper = mount(Component, {});

  expect(wrapper.html()).toContain('Bonjour tout le monde');
});
```

Remarquez que `mount` accepte un second paramètre pour définir l'état du composant.

**Exemple&nbsp;: monter un composant avec des `props` et un plugin Vue**

```js
const wrapper = mount(Component, {
  props: {
    msg: 'Bonjour tout le monde',
  },
  global: {
    plugins: [vuex],
  },
});
```

#### options.global

Parmi les états du composant, vous pouvez configurer l'application Vue 3 par la propriété de configuration [`MountingOptions.global` config property](#global). Cela peut être utile pour fournir des valeurs simulées dont vos composants pourraient avoir besoin.

::: tip
Si vous vous retrouvez à définir une configuration commune de l'application pour de nombreux tests, vous pouvez définir la configuration pour tous vos tests complet à l'aide de l'[objet `config`](#config) exporté.
:::

### attachTo

Spécifie le nœud où monter le composant.

**Signature&nbsp;:**

```ts
attachTo?: HTMLElement | string
```

**Utilisation&nbsp;:**

Peut être un sélecteur CSS valide ou un [`Element`](https://developer.mozilla.org/fr-FR/docs/Web/API/Element) connecté au document.

`Component.vue`:

```vue
<template>
  <p>Composant Vue</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

document.body.innerHTML = `
  <div>
    <h1>Pas une app Vue</h1>
    <div id="app"></div>
  </div>
`;

test('monte sur un composant spécifique', () => {
  const wrapper = mount(Component, {
    attachTo: document.getElementById('app'),
  });

  expect(document.body.innerHTML).toBe(`
  <div>
    <h1>Pas une app Vue</h1>
    <div id="app"><div data-v-app=""><p>Composant Vue</p></div></div>
  </div>
  `);
});
```

### attrs

Définie les attributs HTML d'un composant.

**Signature&nbsp;:**

```ts
attrs?: Record<string, unknown>
```

**Utilisation&nbsp;:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('attrs', () => {
  const wrapper = mount(Component, {
    attrs: {
      id: 'Bonjour',
      disabled: true,
    },
  });

  expect(wrapper.attributes()).toEqual({
    disabled: 'true',
    id: 'Bonjour',
  });
});
```

Remarquez que définir une propriété remplacera toujours l'attribut&nbsp;:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('l\'attribut est remplacé par la prop éponyme', () => {
  const wrapper = mount(Component, {
    props: {
      message: 'Bonjour tout le monde',
    },
    attrs: {
      message: 'cette valeur va être remplacée',
    },
  });

  expect(wrapper.props()).toEqual({ message: 'Bonjour tout le monde' });
  expect(wrapper.attributes()).toEqual({});
});
```

### data

Remplace la `data` par défaut d'un composant. Doit être une fonction.

**Signature&nbsp;:**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**Utilisation&nbsp;:**

`Component.vue`

```vue
<template>
  <div>Bonjour {{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'tout le monde',
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('data', () => {
  const wrapper = mount(Component, {
    data() {
      return {
        message: 'vous'
      };
    },
  });

  expect(wrapper.html()).toContain('Bonjour vous');
});
```

### props

Définie les `props` d'un composant lorsqu'il est monté.

**Signature&nbsp;:**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <span>Compteur: {{ count }}</span>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 5,
    },
  });

  expect(wrapper.html()).toContain('Compteur: 5');
});
```

### slots

Définie les valeurs des slots sur un composant.

**Signature&nbsp;:**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**Utilisation&nbsp;:**

Les `slots` peuvent être une `string` ou toute définition de composant valide importée d'un fichier `.vue` ou directement fournie.

`Component.vue`:

```vue
<template>
  <slot name="first" />
  <slot />
  <slot name="second" />
</template>
```

`Bar.vue`:

```vue
<template>
  <div>Bar</div>
</template>
```

`Component.spec.js`:

```js
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import Component from './Component.vue';
import Bar from './Bar.vue';

test('affiche le contenu du slot', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Défaut',
      first: h('h1', {}, 'Slot Nommé'),
      second: Bar,
    },
  });

  expect(wrapper.html()).toBe('<h1>Slot Nommé</h1>Défaut<div>Bar</div>');
});
```

### global

**Signature&nbsp;:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
};
```

Vous pouvez configurer toutes les options `global` à la fois pour chaque test, mais aussi pour l'ensemble des tests. [Voir comment configurer les valeurs par défaut à l'échelle du projet](#config-global).

#### global.components

Enregistre les composants de manière globale pour le composant monté.

**Signature&nbsp;:**

```ts
components?: Record<string, Component | object>
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <div>
    <global-component />
  </div>
</template>

<script>
import GlobalComponent from '@/components/GlobalComponent';

export default {
  components: {
    GlobalComponent,
  },
};
</script>
```

`GlobalComponent.vue`:

```vue
<template>
  <div class="global-component">Mon Composant Global</div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import GlobalComponent from '@/components/GlobalComponent';
import Component from './Component.vue';

test('global.components', () => {
  const wrapper = mount(Component, {
    global: {
      components: {
        GlobalComponent,
      },
    },
  });

  expect(wrapper.find('.global-component').exists()).toBe(true);
});
```

#### global.config

Configure [la configuration globale de l'application Vue](https://v3.vuejs.org/api/application-config.html#application-config).

**Signature&nbsp;:**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

Enregistre une [directive](https://v3.vuejs.org/api/directives.html#directives) de manière globale pour le composant monté.

**Signature&nbsp;:**

```ts
directives?: Record<string, Directive>
```

**Utilisation&nbsp;:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';

import Directive from '@/directives/Directive';

const Component = {
  template: '<div v-bar>Foo</div>',
};

test('global.directives', () => {
  const wrapper = mount(Component, {
    global: {
      directives: {
        Bar: Directive // Bar correspond à v-bar
      },
    },
  });
});
```

#### global.mixins

Enregistre un [mixin](https://v3.vuejs.org/guide/mixins.html) de manière globale pour le composant monté.

**Signature&nbsp;:**

```ts
mixins?: ComponentOptions[]
```

**Utilisation&nbsp;:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.mixins', () => {
  const wrapper = mount(Component, {
    global: {
      mixins: [mixin],
    },
  });
});
```

#### global.mocks

Simule une propriété d'instance globale. Peut être utilisé pour simuler `this.$store`, `this.$router`, etc.

**Signature&nbsp;:**

```ts
mocks?: Record<string, any>
```

**Utilisation&nbsp;:**

::: warning
Ceci est conçu pour simuler des variables injectées par des plugins tiers, pas les propriétés natives de Vue telles que `$root`, `$children`, etc.
:::

`Component.vue`:

```vue
<template>
  <button @click="onClick" />
</template>

<script>
export default {
  methods: {
    onClick() {
      this.$store.dispatch('click');
    },
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.mocks', async () => {
  const $store = {
    dispatch: jest.fn(),
  };

  const wrapper = mount(Component, {
    global: {
      mocks: {
        $store,
      },
    },
  });

  await wrapper.find('button').trigger('click');

  expect($store.dispatch).toHaveBeenCalledWith('click');
});
```

#### global.plugins

Installe des plugins sur le composant monté.

**Signature&nbsp;:**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**Utilisation&nbsp;:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

import myPlugin from '@/plugins/myPlugin';

test('global.plugins', () => {
  mount(Component, {
    global: {
      plugins: [myPlugin],
    },
  });
});
```

Pour utiliser des plugins avec des options, un tableau d'options peut être passé.

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.plugins avec options', () => {
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, 'argument 1', 'un autre argument']],
    },
  });
});
```

#### global.provide

Fournit des données utilisables dans la fonction `setup` via `inject`.

**Signature&nbsp;:**

```ts
provide?: Record<any, any>
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <div>Le thème est {{ theme }}</div>
</template>

<script>
import { inject } from 'vue';

export default {
  setup() {
    const theme = inject('Theme');
    return {
      theme,
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.provide', () => {
  const wrapper = mount(Component, {
    global: {
      provide: {
        Theme: 'sombre',
      },
    },
  });

  console.log(wrapper.html()); //=> <div>Le thème est sombre</div>
});
```

Si vous utilisez un `Symbol` ES6 pour votre clé, vous pouvez l'utiliser dynamiquement&nbsp;:

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

const ThemeSymbol = Symbol();

mount(Component, {
  global: {
    provide: {
      [ThemeSymbol]: 'value',
    },
  },
});
```

#### global.renderStubDefaultSlot

Affiche le contenu du `slot default`, même en utilisant `shallow` ou `shallowMount`.

**Signature&nbsp;:**

```ts
renderStubDefaultSlot?: boolean
```

**Utilisation&nbsp;:**

**false** par défaut.

`Component.vue`

```vue
<template>
  <slot />
  <another-component />
</template>

<script>
export default {
  components: {
    AnotherComponent,
  },
};
</script>
```

`AnotherComponent.vue`

```vue
<template>
  <p>Contenu de l'autre composant</p>
</template>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.renderStubDefaultSlot', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      default: '<div>Mon contenu</div>',
    },
    shallow: true,
    global: {
      renderStubDefaultSlot: true,
    },
  });

  expect(wrapper.html()).toBe(
    '<div>Mon contenu</div><another-component-stub></another-component-stub>'
  );
});
```

En raison de limitations techniques, **ce comportement ne peut pas être étendu aux slots autres que ceux par défaut**.

#### global.stubs

Définit un composant de remplacement (`stub`) global sur le composant monté.

**Signature&nbsp;:**

```ts
stubs?: Record<any, any>
```

**Utilisation&nbsp;:**

Substitue `Transition` et `TransitionGroup` par défaut.

`Component.vue`:

```vue
<template>
  <div><foo /></div>
</template>

<script>
import Foo from '@/Foo.vue';

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('global.stubs en utilisant la syntaxe en tableau', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ['Foo'],
    },
  });

  expect(wrapper.html()).toEqual('<div><foo-stub></div>');
});

test('global.stubs en utilisant la syntaxe en objet', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true },
    },
  });

  expect(wrapper.html()).toEqual('<div><foo-stub></div>');
});

test('global.stubs en utilisant un composant personnalisé', () => {
  const CustomStub = {
    name: 'CustomStub',
    template: '<p>Contenu personnalisé du composant de substitution</p>',
  }

  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: CustomStub },
    },
  });

  expect(wrapper.html()).toEqual('<div><p>Contenu personnalisé du composant de substitution</p></div>');
});
```

### shallow

Substitue tous les composants enfants du composant.

**Signature&nbsp;:**

```ts
shallow?: boolean
```

**Utilisation&nbsp;:**

**false** par défaut.

`Component.vue`

```vue
<template>
  <a-component />
  <another-component />
</template>

<script>
export default {
  components: {
    AComponent,
    AnotherComponent
  },
};
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('shallow', () => {
  const wrapper = mount(Component, { shallow: true });

  expect(wrapper.html()).toEqual(
    `<a-component-stub></a-component-stub><another-component></another-component>`,
  );
});
```

::: tip
Utiliser `shallowMount()` revient à monter un composant avec l'option `shallow: true`.
:::

## Méthodes de Wrapper

Lorsque vous utilisez `mount`, un `VueWrapper` est retourné avec un certain nombre de méthodes utiles pour les tests. Un `VueWrapper` est une enveloppe autour de votre instance de composant.

Notez que des méthodes telles que `find` retournent un `DOMWrapper`, qui est une enveloppe autour des nœuds DOM dans votre composant et ses enfants. Les deux implémentent une API similaire.

### attributes

Retourne les attributs d'un nœud du DOM.

**Signature&nbsp;:**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <div id="foo" :class="className" />
</template>

<script>
export default {
  data() {
    return {
      className: 'bar',
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('attributs', () => {
  const wrapper = mount(Component);

  expect(wrapper.attributes('id')).toBe('foo');
  expect(wrapper.attributes('class')).toBe('bar');
});
```

### classes

**Signature&nbsp;:**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**Utilisation&nbsp;:**

Retourne les classes d'un élément sous la forme d'un tableau.

`Component.vue`:

```vue
<template>
  <span class="my-span" />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.classes()).toContain('my-span');
  expect(wrapper.classes('my-span')).toBe(true);
  expect(wrapper.classes('not-existing')).toBe(false);
});
```

### emitted

Retourne tous les évènements émis par un Composant.

**Signature&nbsp;:**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**Utilisation&nbsp;:**

Les arguments sont stockés dans un tableau, de sorte que vous pouvez vérifier les arguments qui ont été émis avec chaque événement.

`Component.vue`:

```vue
<script>
export default {
  created() {
    this.$emit('politesse', 'bonjour');
    this.$emit('politesse', 'au revoir');
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('emitted', () => {
  const wrapper = mount(Component)

  // wrapper.emitted() sera égal à { politesse: [ ['bonjour'], ['au revoir'] ] }

  expect(wrapper.emitted()).toHaveProperty('politesse');
  expect(wrapper.emitted().greet).toHaveLength(2);
  expect(wrapper.emitted().greet[0]).toEqual(['bonjour']);
  expect(wrapper.emitted().greet[1]).toEqual(['au revoir']);
});
```

### exists

Vérifie si un élément existe ou non.

**Signature&nbsp;:**

```ts
exists(): boolean
```

**Utilisation&nbsp;:**

Nous pouvons utiliser la même syntaxe que `querySelector` implémente.

`Component.vue`:

```vue
<template>
  <span />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('existe', () => {
  const wrapper = mount(Component);

  expect(wrapper.find('span').exists()).toBe(true);
  expect(wrapper.find('p').exists()).toBe(false);
});
```

### find

Cherche un élément et retourne un `DOMWrapper` si un élément est trouvé.

**Signature&nbsp;:**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**Utilisation&nbsp;:**

Vous pouvez utiliser la même syntaxe qu'implémente `querySelector`. `find` est en quelque sorte un alias pour `querySelector`. En plus, vous pouvez rechercher des références d'éléments.

`Component.vue`:

```vue
<template>
  <span>Span</span>
  <span data-test="span">Span</span>
  <span ref="span">Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('cherche', () => {
  const wrapper = mount(Component);

  wrapper.find('span') //=> trouvé; retourne DOMWrapper
  wrapper.find('[data-test="span"]') //=> trouvé; retourne DOMWrapper
  wrapper.find({ ref: 'span' }); //=> trouvé; retourne DOMWrapper
  wrapper.find('p') //=> rien de trouvé; retourne ErrorWrapper
});
```

### findAll

Similaire à `find`, mais retourne un tableau de `DOMWrapper`.

**Signature&nbsp;:**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <span v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import BaseTable from './BaseTable.vue';

test('trouve plusieurs éléments', () => {
  const wrapper = mount(BaseTable);

  // .findAll() retourne un tableau de DOMWrappers
  const thirdRow = wrapper.findAll('span')[2];
});
```

### findComponent

Trouve une instance de composant Vue et renvoie un `VueWrapper` si trouvé. Renvoie un `ErrorWrapper` sinon.

**Signature&nbsp;:**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**Utilisation&nbsp;:**

`findComponent` supporte plusieurs syntaxes&nbsp;:

| Syntaxe          | Exemple                       | Détails                                                  |
|------------------|-------------------------------|----------------------------------------------------------|
| querySelector    | `findComponent('.component')` | Trouve comme à un sélecteur CSS standard.                |
| Nom du Composant | `findComponent({name: 'a'})`  | Trouve en PascalCase, snake-case et camelCase.           |
| Ref du Composant | `findComponent({ref: 'ref'})` | Trouve la reference directe d'un composant enfant monté. |
| SFC              | `findComponent(Component)`    | Trouve directement un composant importé.                 |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo',
};
</script>
```

`Component.vue`:

```vue
<template>
  <Foo data-test="foo" ref="foo" class="foo" />
</template>

<script>
import Foo from '@/Foo';

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

import Foo from '@/Foo.vue';

test('trouve le composant', () => {
  const wrapper = mount(Component);

  // Toutes les requêtes suivantes retourneront un `VueWrapper`

  wrapper.findComponent('.foo');
  wrapper.findComponent('[data-test="foo"]');

  wrapper.findComponent({ name: 'Foo' });

  wrapper.findComponent({ ref: 'foo' });

  wrapper.findComponent(Foo);
});
```

:::warning
Si `ref` dans le composant pointe vers un élément HTML, `findComponent` renverra un conteneur vide. C'est le comportement attendu.
:::

:::warning Utilisation avec des sélecteurs CSS
L'utilisation de `findComponent` avec un sélecteur CSS peut avoir un comportement innatendu.

Voici un exemple&nbsp;:

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>',
};
const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />',
};
const wrapper = mount(RootComponent);
const rootByCss = wrapper.findComponent('.root'); // => trouve Root
expect(rootByCss.vm.$options.name).toBe('Root');
const childByCss = wrapper.findComponent('.child');
expect(childByCss.vm.$options.name).toBe('Root'); // => toujours Root
```

La raison de ce comportement est que `RootComponent` et `ChildComponent` partagent le même nœud DOM et que seul le premier composant correspondant est inclus pour chaque nœud DOM unique.
:::

:::info Type WrapperLike en utilisant un sélecteur CSS
Lors de l'utilisation de `wrapper.findComponent('.foo')` par exemple, VTU renverra le type `WrapperLike`. Cela est dû au fait que les composants fonctionnels auraient besoin d'un `DOMWrapper` au lieu d'un `VueWrapper`. Vous pouvez forcer le retour d'un `VueWrapper` en fournissant le type de composant correct&nbsp;:

```typescript
wrapper.findComponent('.foo'); // retourne WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo'); // retourne VueWrapper
wrapper.findComponent<DefineComponent>('.foo'); // retourne VueWrapper
```
:::

### findAllComponents

**Signature&nbsp;:**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**Utilisation&nbsp;:**

Similaire à `findComponent` mais trouve toutes les instances de composant Vue qui correspondent à la requête. Renvoie un tableau de `VueWrapper`.

:::warning
La syntaxe `ref` n'est pas prise en charge dans findAllComponents. Toutes les autres syntaxes de requête sont valides.
:::

`Component.vue`:

```vue
<template>
  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('trouve tous les composants', () => {
  const wrapper = mount(Component);

  // Retourne un tableau de VueWrapper
  wrapper.findAllComponents('[data-test="number"]');
});
```

:::warning Utilisation avec des sélecteurs CSS
`findAllComponents` a le même comportement lorsqu'il est utilisé avec un sélecteur CSS tout comme [findComponent](#findcomponent).
:::

### get

Récupère un élément et retourne un `DOMWrapper` si trouvé. Renvoie une erreur dans le cas contraire.

**Signature&nbsp;:**

```ts
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**Utilisation&nbsp;:**

Similaire à `find`, mais `get` retourne une exception au lieu de renvoyer un `ErrorWrapper`.

En règle générale, utilisez toujours `get` sauf lorsque vous vérifiez que quelque chose n'existe pas. Dans ce cas, utilisez `find`.

`Component.vue`:

```vue
<template>
  <span>Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('get', () => {
  const wrapper = mount(Component);

  wrapper.get('span'); //=> trouvé; retourne DOMWrapper

  expect(() => wrapper.get('.not-there')).toThrowError();
});
```

### getComponent

Récupère une instance de composant Vue et renvoie un `VueWrapper` si trouvé. Sinon, il génère une erreur.

**Signature&nbsp;:**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**Utilisation&nbsp;:**

Similaire à `findComponent`, mais `getComponent` retourne une exception au lieu de renvoyer un `ErrorWrapper`.

**Syntaxes supportées&nbsp;:**

| Syntaxe          | Exemple                      | Détails                                                  |
|------------------|------------------------------|----------------------------------------------------------|
| querySelector    | `getComponent('.component')` | Trouve comme à un sélecteur CSS standard.                |
| Nom du Composant | `getComponent({name: 'a'})`  | Trouve en PascalCase, snake-case et camelCase.           |
| Ref du Composant | `getComponent({ref: 'ref'})` | Trouve la reference directe d'un composant enfant monté. |
| SFC              | `getComponent(Component)`    | Trouve directement un composant importé.                 |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo',
};
</script>
```

`Component.vue`:

```vue
<template>
  <Foo />
</template>

<script>
import Foo from '@/Foo';

export default {
  components: { Foo },
};
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

import Foo from '@/Foo.vue';

test('getComponent', () => {
  const wrapper = mount(Component);

  wrapper.getComponent({ name: 'foo' }); // retourne un VueWrapper
  wrapper.getComponent(Foo); // retourne un VueWrapper

  expect(() => wrapper.getComponent('.not-there')).toThrowError();
});
```

### html

Renvoie le HTML d'un élément.

Par défaut, la sortie est formatée avec [`js-beautify`](https://github.com/beautify-web/js-beautify) pour rendre les `snapshots` plus lisibles. Utilisez l'option `raw: true` pour recevoir la chaîne HTML non formatée.

**Signature&nbsp;:**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <div>
    <p>Bonjour tout le monde</p>
  </div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('html', () => {
  const wrapper = mount(Component);

  expect(wrapper.html()).toBe(
    '<div>\n' +
    '  <p>Bonjour tout le monde</p>\n' +
    '</div>'
  );

  expect(wrapper.html({ raw: true })).toBe('<div><p>Bonjour tout le monde</p></div>');
});
```

### isVisible

Vérifie si un élément est visible ou non.

**Signature&nbsp;:**

```ts
isVisible(): boolean
```

**Utilisation&nbsp;:**

```js
const Component = {
  template: `<div v-show="false"><span /></div>`,
};

test('isVisible', () => {
  const wrapper = mount(Component);

  expect(wrapper.find('span').isVisible()).toBe(false);
});
```

### props

Retourne les propriétés (`props`) passées à un Composant Vue.

**Signature&nbsp;:**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**Utilisation&nbsp;:**

`Component.vue`:

```js
export default {
  name: 'Component',
  props: {
    truthy: Boolean,
    object: Object,
    string: String,
  },
};
```

```vue
<template>
  <Component truthy :object="{}" string="string" />
</template>

<script>
import Component from '@/Component';

export default {
  components: { Component },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('props', () => {
  const wrapper = mount(Component, {
    global: { stubs: ['Foo'] },
  });

  const foo = wrapper.getComponent({ name: 'Foo' });

  expect(foo.props('truthy')).toBe(true);
  expect(foo.props('object')).toEqual({});
  expect(foo.props('notExisting')).toEqual(undefined);
  expect(foo.props()).toEqual({
    truthy: true,
    object: {},
    string: 'string',
  });
});
```

:::tip
En règle générale, testez les effets d'une `prop` transmise (une mise à jour du DOM, un événement émis, etc.). Cela rendra les tests plus puissants que de simplement vérifier qu'une prop a été transmise.
:::

### setData

Met à jour les données internes d'un composant.

**Signature&nbsp;:**

```ts
setData(data: Record<string, any>): Promise<void>
```

**Utilisation&nbsp;:**

`setData` ne permet pas de définir de nouvelles propriétés qui ne sont pas définies dans le composant.

De plus, notez que `setData` ne modifie pas les données de la fonction l'API de Composition&nbsp;: `setup()`.

`Component.vue`:

```vue
<template>
  <div>Compteur: {{ count }}</div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('setData', async () => {
  const wrapper = mount(Component);
  expect(wrapper.html()).toContain('Compteur: 0');

  await wrapper.setData({ count: 1 });

  expect(wrapper.html()).toContain('Compteur: 1');
});
```

::: warning
Vous devriez utiliser `await` lorsque vous appelez `setData` pour vous assurer que Vue met à jour le DOM avant de faire une vérification.
:::

### setProps

Met à jour les `props` d'un composant.

**Signature&nbsp;:**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
};
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('met à jour les props', async () => {
  const wrapper = mount(Component, {
    props: {
      message: 'Bonjour'
    },
  });

  expect(wrapper.html()).toContain('Bonjour');

  await wrapper.setProps({ message: 'Au revoir' });

  expect(wrapper.html()).toContain('Au revoir');
});
```

::: warning
Vous devriez utiliser `await` lorsque vous appelez `setProps` pour vous assurer que Vue met à jour le DOM avant de faire une vérification.
:::

### setValue

Définit une valeur sur un élément du DOM. Incluant&nbsp;:

- `<input>`
  - `type="checkbox"` et `type="radio"` sont détectés et auront `element.checked` de coché.
- `<select>`
  - `<option>` est détecté et aura `element.selected` de coché.

**Signature&nbsp;:**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <input type="text" v-model="text" />
  <p>Texte : {{ text }}</p>

  <input type="checkbox" v-model="checked" />
  <div v-if="checked">La case a été cochée !</div>

  <select v-model="multiselectValue" multiple>
    <option value="value1"></option>
    <option value="value2"></option>
    <option value="value3"></option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      checked: false,
      multiselectValue: [],
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('setValue sur une checkbox', async () => {
  const wrapper = mount(Component);

  await wrapper.find('input[type="checkbox"]').setValue(true);
  expect(wrapper.find('div')).toBe(true);

  await wrapper.find('input[type="checkbox"]').setValue(false);
  expect(wrapper.find('div')).toBe(false);
});

test('setValue sur un champ texte', async () => {
  const wrapper = mount(Component);

  await wrapper.find('input[type="text"]').setValue('Bonjour !');
  expect(wrapper.find('p').text()).toBe('Texte: Bonjour !');
});

test('setValue sur une liste déroulante à choix multiples', async () => {
  const wrapper = mount(Component);

  // Pour des select à choix unique
  await wrapper.find('select').setValue('value1');
  // FPour des select à choix multiples
  await wrapper.find('select').setValue(['value1', 'value3']);
});
```

::: warning
Vous devriez utiliser `await` lorsque vous appelez `setValue` pour vous assurer que Vue met à jour le DOM avant de faire une vérification.
:::

### text

Retourne le texte contenu dans un élément.

**Signature&nbsp;:**

```ts
text(): string
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <p>Bonjour tout le monde</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('text', () => {
  const wrapper = mount(Component);

  expect(wrapper.find('p').text()).toBe('Bonjour tout le monde');
});
```

### trigger

Déclenche un évènement du DOM, par exemple `click`, `submit` ou `keyup`.

**Signature&nbsp;:**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**Utilisation&nbsp;:**

`Component.vue`:

```vue
<template>
  <span>Compteur: {{ count }}</span>
  <button @click="count++">Cliquer ici</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('trigger', async () => {
  const wrapper = mount(Component);

  await wrapper.find('button').trigger('click');

  expect(wrapper.find('span').text()).toBe('Compteur: 1');
});
```

Notez que `trigger` accepte un second argument pour transmettre des options à l'événement déclenché&nbsp;:

```js
await wrapper.trigger('keydown', { keyCode: 65 });
```

::: warning
Vous devriez utiliser `await` lorsque vous appelez `trigger` pour vous assurer que Vue met à jour le DOM avant de faire une vérification.
:::

::: warning
Certains événements, comme le fait de cliquer sur une case à cocher pour modifier son `v-model`, ne fonctionneront que si le test utilise `attachTo: document.body`.

Sinon, l'événement `change` ne sera pas déclenché et la valeur de `v-model` ne changera pas en conséquence.
:::

### unmount

Démonte l'application du DOM.

**Signature&nbsp;:**

```ts
unmount(): void
```

**Utilisation&nbsp;:**

Il ne fonctionne que sur le `VueWrapper` racine renvoyé par `mount`. Utile pour un nettoyage manuel après les tests.

`Component.vue`:

```vue
<script>
export default {
  unmounted() {
    console.log('démonté !');
  },
};
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

test('unmount', () => {
  const wrapper = mount(Component);

  wrapper.unmount();
  // Le composant est supprimé du DOM.
  // console.log a été appelé avec 'démonté !'
});
```

## Propriétés de Wrapper

### vm

**Signature&nbsp;:**

```ts
vm: ComponentPublicInstance
```

**Utilisation&nbsp;:**

L'instance d'application `Vue`. Vous pouvez accéder à toutes les [méthodes d'instance](https://v3.vuejs.org/api/instance-methods.html) et [propriétés d'instance](https://v3.vuejs.org/api/instance-properties.html).

Notez que `vm` n'est disponible que sur un `VueWrapper`.

:::tip
En règle générale, testez les effets d'une `prop` transmise (une mise à jour du DOM, un événement émis, etc.). Cela rendra les tests plus puissants que simplement de faire une vérification sur le passage d'une prop.
:::

## shallowMount

Crée un `Wrapper` qui contient le composant Vue monté et rendu pour le tester avec tous les enfants remplacés par des composants de substitution (`stubs`).

**Signature&nbsp;:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: HTMLElement | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
}

function shallowMount(Component, options?: MountingOptions): VueWrapper
```

**Utilisation&nbsp;:**

`shallowMount` se comporte exactement comme `mount`, mais il remplace par défaut tous les composants enfants par des composants de substitution (`stubs`). Notez que, `shallowMount(Component)` est un alias de `mount(Component, { shallow: true })`.

## enableAutoUnmount

**Signature&nbsp;:**

```ts
enableAutoUnmount(hook: (callback: () => void) => void);
disableAutoUnmount(): void;
```

**Utilisation&nbsp;:**

`enableAutoUnmount` permet de détruire automatiquement les `Wrappers` Vue. La logique de destruction est transmise en tant que callback à la fonction `hook`.

Une utilisation courante consiste à utiliser `enableAutoUnmount` avec des fonctions fournies par votre framework de tests, telles que `afterEach`&nbsp;:

```ts
import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);
```

`disableAutoUnmount` peut être utile si vous voulez ce comportement uniquement dans un sous-ensemble spécifique de vos tests et si vous souhaitez désactiver explicitement ce comportement.

## flushPromises

**Signature&nbsp;:**

```ts
flushPromises(): Promise<unknown>
```

**Utilisation&nbsp;:**

`flushPromises` procède à la résolution de toutes les `Promise` en cours. Cela aide à s'assurer que les opérations asynchrones telles que les `Promise` ou les mises à jour du DOM se sont produites avant de les vérifier.

Consultez la section [Faire des requêtes HTTP](../guide/advanced/http-requests.md) pour voir un exemple de `flushPromises` en action.

## config

### config.global

**Signature&nbsp;:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
}
```

**Utilisation&nbsp;:**

Au lieu de configurer les options de `mount` pour chaque test, vous pouvez les configurer pour l'ensemble de votre suite de tests. Ceux-ci seront utilisés par défaut chaque fois que vous montez un composant. Si vous le souhaitez, vous pouvez ensuite remplacer vos valeurs par défaut pour chaque test.

**Exemple&nbsp;:**

Un exemple pourrait être de simuler globalement la variable `$t` de `vue-i18n` et d'un composant&nbsp;:

`Component.vue`:

```vue
<template>
  <p>{{ $t('message') }}</p>
  <mon-component />
</template>

<script>
import MonComposant from '@/components/MonComposant'

export default {
  components: {
    MonComposant,
  },
};
</script>
```

`Component.spec.js`:

```js {1,8-10,12-14}
import { config, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

const MonComposant = defineComponent({
  template: `<div>Mon composant</div>`,
});

config.global.stubs = {
  MonComposant,
};

config.global.mocks = {
  $t: (text) => text,
};

test('config.global substitue le composant', () => {
  const wrapper = mount(Component);

  expect(wrapper.html()).toBe('<p>message</p><div>Mon composant</div>');
});
```

::: tip
Rappelez-vous que ce comportement est global, et non sur une base montage par montage. Il peut être nécessaire de l'activer / le désactiver avant et après chaque test.
:::

## Composants

### RouterLinkStub

Un composant pour substituer le composant `router-link` de Vue Router lorsque vous ne voulez pas le faire ou inclure un routeur complet.

Vous pouvez utiliser ce composant pour trouver un composant `router-link` dans l'arbre de rendu.

**Utilisation&nbsp;:**

Définit un composant de remplacement dans les options de `mount`&nbsp;:
```js
import { mount, RouterLinkStub } from '@vue/test-utils';

const wrapper = mount(Component, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
    },
  },
});

expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path');
```

**Utilisation avec slot&nbsp;:**

Le composant `RouterLinkStub` prend en charge le contenu du `slot` et renvoie des valeurs très simples pour ses propriétés de `slot`. Si vous avez besoin de valeurs de propriétés de `slot` plus spécifiques pour vos tests, il est conseillé d'utiliser un [vrai routeur](../guide/advanced/vue-router.html#using-a-real-router) pour pouvoir utiliser un vrai composant `router-link`. Alternativement, vous pouvez définir votre propre composant `RouterLinkStub` en copiant l'implémentation de la dépendance `test-utils`.
