---
sidebar: auto
---

# API

## mount

Crée un `Wrapper` qui contient le composant Vue monté et rendu pour le test.

**Signature :**

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

**Usage :**

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

Remarquez que `mount` accepte un second paramètre pour définir l'état (`state`) du composant.

**Exemple : monter un composant avec des `props` et un plugin Vue**

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

Parmi les états (`states`) du composant, vous pouvez configurer l'application Vue 3 par la propriété de configuration [`MountingOptions.global` config property](#global). Cela peut être utile pour fournir des valeurs simulées que vos composants pourraient avoir besoin.

::: tip
Si vous vous retrouvez à définir une configuration commune de l'application pour de nombreux de vos tests, vous pouvez définir la configuration pour votre ensemble de tests complet à l'aide de l'[objet `config`](#config) exporté.
:::

### attachTo

Spécifie le nœud pour monter le composant dessus.

**Signature :**

```ts
attachTo?: HTMLElement | string
```

**Usage :**

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

**Signature :**

```ts
attrs?: Record<string, unknown>
```

**Usage :**

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

Notice that setting a defined prop will always trump an attribute:

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

  expect(wrapper.props()).toEqual({ message: 'Hello World' });
  expect(wrapper.attributes()).toEqual({});
});
```

### data

Remplace la `data` par défaut d'un composant. Doit être une fonction.

**Signature :**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**Usage :**

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

**Signature :**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**Usage :**

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

**Signature :**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**Usage :**

Les `slots` peuvent être une `string` ou toute définition de composant valide importée d'un fichier `.vue` ou directement fourni.

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

**Signature :**

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

Vous pouvez configurer toutes les options `global` à la fois pour chaque test mais aussi pour l'ensemble des tests. [Voir comment configurer les valeurs par défaut à l'échelle du projet](#config-global).

#### global.components

Enregistre les composants de manière globale pour le composant monté.

**Signature :**

```ts
components?: Record<string, Component | object>
```

**Usage :**

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

**Signature :**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

Enregistre une [directive](https://v3.vuejs.org/api/directives.html#directives)  de manière globale pour le composant monté.

**Signature :**

```ts
directives?: Record<string, Directive>
```

**Usage :**

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

**Signature :**

```ts
mixins?: ComponentOptions[]
```

**Usage :**

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

**Signature :**

```ts
mocks?: Record<string, any>
```

**Usage :**

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

**Signature :**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**Usage :**

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

Fournit de la data à destination de la fonction `setup` via `inject`.

**Signature :**

```ts
provide?: Record<any, any>
```

**Usage :**

`Component.vue`:

```vue
<template>
  <div>Le theme est {{ theme }}</div>
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

  console.log(wrapper.html()); //=> <div>Le theme est sombre</div>
});
```

Si vous utilisez un `Symbol` ES6 pour votre clé, vous pouvez l'utiliser dynamiquement :

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

Affiche le contenu du`slot default`, même en utilisant `shallow` ou `shallowMount`.

**Signature :**

```ts
renderStubDefaultSlot?: boolean
```

**Usage :**

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

**Signature :**

```ts
stubs?: Record<any, any>
```

**Usage :**

It stubs `Transition` and `TransitionGroup` by default.

`Component.vue`:

```vue
<template>
  <div><foo /></div>
</template>

<script>
import Foo from '@/Foo.vue'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.stubs using array syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ['Foo']
    }
  });

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
});

test('global.stubs using object syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true }
    }
  });

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
});

test('global.stubs using a custom component', () => {
  const CustomStub = {
    name: 'CustomStub',
    template: '<p>custom stub content</p>'
  }

  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: CustomStub }
    }
  });

  expect(wrapper.html()).toEqual('<div><p>custom stub content</p></div>')
});
```

### shallow

Stubs out all child components from the component.

**Signature :**

```ts
shallow?: boolean
```

**Usage :**

Defaults to **false**.

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
  }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('shallow', () => {
  const wrapper = mount(Component, { shallow: true });

  expect(wrapper.html()).toEqual(
    `<a-component-stub></a-component-stub><another-component></another-component>`
  )
}
```

::: tip
`shallowMount()` is an alias to mounting a component with `shallow: true`.
:::

## Wrapper methods

When you use `mount`, a `VueWrapper` is returned with a number of useful methods for testing. A `VueWrapper` is a thin wrapper around your component instance.

Notice that methods like `find` return a `DOMWrapper`, which is a thin wrapper around the DOM nodes in your component and its children. Both implement a similar API.

### attributes

Returns attributes on a DOM node.

**Signature :**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**Usage :**

`Component.vue`:

```vue
<template>
  <div id="foo" :class="className" />
</template>

<script>
export default {
  data() {
    return {
      className: 'bar'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attributes', () => {
  const wrapper = mount(Component)

  expect(wrapper.attributes('id')).toBe('foo')
  expect(wrapper.attributes('class')).toBe('bar')
});
```

### classes

**Signature :**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**Usage :**

Returns an array of classes on an element.

`Component.vue`:

```vue
<template>
  <span class="my-span" />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.classes()).toContain('my-span')
  expect(wrapper.classes('my-span')).toBe(true)
  expect(wrapper.classes('not-existing')).toBe(false)
});
```

### emitted

Returns all the emitted events from the Component.

**Signature :**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**Usage :**

The arguments are stored in an array, so you can verify which arguments were emitted along with each event.

`Component.vue`:

```vue
<script>
export default {
  created() {
    this.$emit('greet', 'hello')
    this.$emit('greet', 'goodbye')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('emitted', () => {
  const wrapper = mount(Component)

  // wrapper.emitted() equals to { greet: [ ['hello'], ['goodbye'] ] }

  expect(wrapper.emitted()).toHaveProperty('greet')
  expect(wrapper.emitted().greet).toHaveLength(2)
  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
  expect(wrapper.emitted().greet[1]).toEqual(['goodbye'])
});
```

### exists

Verify whether an element exists or not.

**Signature :**

```ts
exists(): boolean
```

**Usage :**

You can use the same syntax `querySelector` implements.

`Component.vue`:

```vue
<template>
  <span />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
  expect(wrapper.find('p').exists()).toBe(false)
});
```

### find

Finds an element and returns a `DOMWrapper` if one is found.

**Signature :**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**Usage :**

You can use the same syntax `querySelector` implements. `find` is basically an alias for `querySelector`. In addition you can search for element refs.

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
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('find', () => {
  const wrapper = mount(Component)

  wrapper.find('span') //=> found; returns DOMWrapper
  wrapper.find('[data-test="span"]') //=> found; returns DOMWrapper
  wrapper.find({ ref: 'span' }); //=> found; returns DOMWrapper
  wrapper.find('p') //=> nothing found; returns ErrorWrapper
});
```

### findAll

Similar to `find`, but instead returns an array of `DOMWrapper`.

**Signature :**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**Usage :**

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
import { mount } from '@vue/test-utils'
import BaseTable from './BaseTable.vue'

test('findAll', () => {
  const wrapper = mount(BaseTable)

  // .findAll() returns an array of DOMWrappers
  const thirdRow = wrapper.findAll('span')[2]
});
```

### findComponent

Finds a Vue Component instance and returns a `VueWrapper` if found. Returns `ErrorWrapper` otherwise.

**Signature :**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**Usage :**

`findComponent` supports several syntaxes:

| syntax         | example                       | details                                                      |
| -------------- | ----------------------------- | ------------------------------------------------------------ |
| querySelector  | `findComponent('.component')` | Matches standard query selector.                             |
| Component name | `findComponent({name: 'a'})`  | matches PascalCase, snake-case, camelCase                    |
| Component ref  | `findComponent({ref: 'ref'})` | Can be used only on direct ref children of mounted component |
| SFC            | `findComponent(Component)`    | Pass an imported component directly                          |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo data-test="foo" ref="foo" class="foo" />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('findComponent', () => {
  const wrapper = mount(Component)

  // All the following queries would return a VueWrapper

  wrapper.findComponent('.foo')
  wrapper.findComponent('[data-test="foo"]')

  wrapper.findComponent({ name: 'Foo' });

  wrapper.findComponent({ ref: 'foo' });

  wrapper.findComponent(Foo)
});
```

:::warning
If `ref` in component points to HTML element, `findComponent` will return empty wrapper. This is intended behaviour
:::

:::warning Usage with CSS selectors
Using `findComponent` with CSS selector might have confusing behavior

Consider this example:

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>'
}
const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />'
}
const wrapper = mount(RootComponent)
const rootByCss = wrapper.findComponent('.root') // => finds Root
expect(rootByCss.vm.$options.name).toBe('Root')
const childByCss = wrapper.findComponent('.child')
expect(childByCss.vm.$options.name).toBe('Root') // => still Root
```

The reason for such behavior is that `RootComponent` and `ChildComponent` are sharing same DOM node and only first matching component is included for each unique DOM node
:::

:::info WrapperLike type when using CSS selector
When using `wrapper.findComponent('.foo')` for example then VTU will return the `WrapperLike` type. This is because functional components
would need a `DOMWrapper` otherwise a `VueWrapper`. You can force to return a `VueWrapper` by providing the correct component type:

```typescript
wrapper.findComponent('.foo') // returns WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // returns VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // returns VueWrapper
```
:::

### findAllComponents

**Signature :**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**Usage :**

Similar to `findComponent` but finds all Vue Component instances that match the query. Returns an array of `VueWrapper`.

:::warning
`ref` syntax is not supported in `findAllComponents`. All other query syntaxes are valid.
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
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('findAllComponents', () => {
  const wrapper = mount(Component)

  // Returns an array of VueWrapper
  wrapper.findAllComponents('[data-test="number"]')
});
```

:::warning Usage with CSS selectors
`findAllComponents` has same behavior when used with CSS selector as [findComponent](#findcomponent)
:::

### get

Gets an element and returns a `DOMWrapper` if found. Otherwise it throws an error.

**Signature :**

```ts
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**Usage :**

It is similar to `find`, but `get` throws instead of returning a ErrorWrapper.

As a rule of thumb, always use get except when you are asserting something doesn't exist. In that case use [`find`](#find).

`Component.vue`:

```vue
<template>
  <span>Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('get', () => {
  const wrapper = mount(Component)

  wrapper.get('span') //=> found; returns DOMWrapper

  expect(() => wrapper.get('.not-there')).toThrowError()
});
```

### getComponent

Gets a Vue Component instance and returns a `VueWrapper` if found. Otherwise it throws an error.

**Signature :**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**Usage :**

It is similar to `findComponent`, but `getComponent` throws instead of returning a ErrorWrapper.

**Supported syntax:**

| syntax         | example                      | details                                                      |
| -------------- | ---------------------------- | ------------------------------------------------------------ |
| querySelector  | `getComponent('.component')` | Matches standard query selector.                             |
| Component name | `getComponent({name: 'a'})`  | matches PascalCase, snake-case, camelCase                    |
| Component ref  | `getComponent({ref: 'ref'})` | Can be used only on direct ref children of mounted component |
| SFC            | `getComponent(Component)`    | Pass an imported component directly                          |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('getComponent', () => {
  const wrapper = mount(Component)

  wrapper.getComponent({ name: 'foo' }); // returns a VueWrapper
  wrapper.getComponent(Foo) // returns a VueWrapper

  expect(() => wrapper.getComponent('.not-there')).toThrowError()
});
```

### html

Returns the HTML of an element.

By default the output is formatted with [`js-beautify`](https://github.com/beautify-web/js-beautify)
to make snapshots more readable. Use `raw: true` option to receive the unformatted html string.

**Signature :**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**Usage :**

`Component.vue`:

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('html', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe(
    '<div>\n' +
    '  <p>Hello world</p>\n' +
    '</div>'
  )

  expect(wrapper.html({ raw: true })).toBe('<div><p>Hello world</p></div>')
});
```

### isVisible

Verify whether an element is visible or not.

**Signature :**

```ts
isVisible(): boolean
```

**Usage :**

```js
const Component = {
  template: `<div v-show="false"><span /></div>`
}

test('isVisible', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').isVisible()).toBe(false)
});
```

### props

Returns props passed to a Vue Component.

**Signature :**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**Usage :**

`Component.vue`:

```js
export default {
  name: 'Component',
  props: {
    truthy: Boolean,
    object: Object,
    string: String
  }
}
```

```vue
<template>
  <Component truthy :object="{}" string="string" />
</template>

<script>
import Component from '@/Component'

export default {
  components: { Component }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('props', () => {
  const wrapper = mount(Component, {
    global: { stubs: ['Foo'] }
  });

  const foo = wrapper.getComponent({ name: 'Foo' });

  expect(foo.props('truthy')).toBe(true)
  expect(foo.props('object')).toEqual({});
  expect(foo.props('notExisting')).toEqual(undefined)
  expect(foo.props()).toEqual({
    truthy: true,
    object: {},
    string: 'string'
  });
});
```

:::tip
As a rule of thumb, test against the effects of a passed prop (a DOM update, an emitted event, and so on). This will make tests more powerful than simply asserting that a prop is passed.
:::

### setData

Updates component internal data.

**Signature :**

```ts
setData(data: Record<string, any>): Promise<void>
```

**Usage :**

`setData` does not allow setting new properties that are not defined in the component.

Also, notice that `setData` does not modify composition API `setup()` data.

`Component.vue`:

```vue
<template>
  <div>Count: {{ count }}</div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setData', async () => {
  const wrapper = mount(Component)
  expect(wrapper.html()).toContain('Count: 0')

  await wrapper.setData({ count: 1 });

  expect(wrapper.html()).toContain('Count: 1')
});
```

::: warning
You should use `await` when you call `setData` to ensure that Vue updates the DOM before you make an assertion.
:::

### setProps

Updates component props.

**Signature :**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**Usage :**

`Component.vue`:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('updates prop', async () => {
  const wrapper = mount(Component, {
    props: {
      message: 'hello'
    }
  });

  expect(wrapper.html()).toContain('hello')

  await wrapper.setProps({ message: 'goodbye' });

  expect(wrapper.html()).toContain('goodbye')
});
```

::: warning
You should use `await` when you call `setProps` to ensure that Vue updates the DOM before you make an assertion.
:::

### setValue

Sets a value on DOM element. Including:

- `<input>`
  - `type="checkbox"` and `type="radio"` are detected and will have `element.checked` set.
- `<select>`
  - `<option>` is detected and will have `element.selected` set.

**Signature :**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**Usage :**

`Component.vue`:

```vue
<template>
  <input type="text" v-model="text" />
  <p>Text: {{ text }}</p>

  <input type="checkbox" v-model="checked" />
  <div v-if="checked">The input has been checked!</div>

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
      multiselectValue: []
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setValue on checkbox', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="checkbox"]').setValue(true)
  expect(wrapper.find('div')).toBe(true)

  await wrapper.find('input[type="checkbox"]').setValue(false)
  expect(wrapper.find('div')).toBe(false)
});

test('setValue on input text', () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="text"]').setValue('hello!')
  expect(wrapper.find('p').text()).toBe('Text: hello!')
});

test('setValue on multi select', () => {
  const wrapper = mount(Component)

  // For select without multiple
  await wrapper.find('select').setValue('value1')
  // For select with multiple
  await wrapper.find('select').setValue(['value1', 'value3'])
});
```

::: warning
You should use `await` when you call `setValue` to ensure that Vue updates the DOM before you make an assertion.
:::

### text

Returns the text content of an element.

**Signature :**

```ts
text(): string
```

**Usage :**

`Component.vue`:

```vue
<template>
  <p>Hello world</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
});
```

### trigger

Triggers a DOM event, for example `click`, `submit` or `keyup`.

**Signature :**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**Usage :**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
  <button @click="count++">Click me</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('trigger', async () => {
  const wrapper = mount(Component)

  await wrapper.find('button').trigger('click')

  expect(wrapper.find('span').text()).toBe('Count: 1')
});
```

Note that `trigger` accepts a second argument to pass options to the triggered Event:

```js
await wrapper.trigger('keydown', { keyCode: 65 });
```

::: warning
You should use `await` when you call `trigger` to ensure that Vue updates the DOM before you make an assertion.
:::

### unmount

Unmount the application from the DOM.

**Signature :**

```ts
unmount(): void
```

**Usage :**

It only works on the root `VueWrapper` returned from `mount`. Useful for manual clean-up after tests.

`Component.vue`:

```vue
<script>
export default {
  unmounted() {
    console.log('unmounted!')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('unmount', () => {
  const wrapper = mount(Component)

  wrapper.unmount()
  // Component is removed from DOM.
  // console.log has been called with 'unmounted!'
});
```

## Wrapper properties

### vm

**Signature :**

```ts
vm: ComponentPublicInstance
```

**Usage :**

The `Vue` app instance. You can access all of the [instance methods](https://v3.vuejs.org/api/instance-methods.html) and [instance properties](https://v3.vuejs.org/api/instance-properties.html).

Notice that `vm` is only available on a `VueWrapper`.

:::tip
As a rule of thumb, test against the effects of a passed prop (a DOM update, an emitted event, and so on). This will make tests more powerful than simply asserting that a prop is passed.
:::

## shallowMount

Creates a Wrapper that contains the mounted and rendered Vue component to test with all children stubbed out.

**Signature :**

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

**Usage :**

`shallowMount` behaves exactly like `mount`, but it stubs all child components by default. Essentially, `shallowMount(Component)` is an alias of `mount(Component, { shallow: true })`.

## enableAutoUnmount

**Signature :**

```ts
enableAutoUnmount(hook: Function));
disableAutoUnmount(): void;
```

**Usage :**

`enableAutoUnmount` allows to automatically destroy Vue wrappers. Destroy logic is passed as callback to `hook` Function.
Common usage is to use `enableAutoUnmount` with teardown helper functions provided by your test framework, such as `afterEach`:

```ts
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)
```

`disableAutoUnmount` might be useful if you want this behavior only in specific subset of your test suite and you want to explicitly disable this behavior

## flushPromises

**Signature :**

```ts
flushPromises(): Promise<unknown>
```

**Usage :**

`flushPromises` flushes all resolved promise handlers. This helps make sure async operations such as promises or DOM updates have happened before asserting against them.

Check out [Making HTTP requests](../guide/advanced/http-requests.md) to see an example of `flushPromises` in action.

## config

### config.global

**Signature :**

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

**Usage :**

Instead of configuring mounting options on a per test basis, you can configure them for your entire test suite. These will be used by default every time you `mount` a component. If desired, you can then override your defaults on a per test basis.

**Exemple :**

An example might be globally mocking the `$t` variable from vue-i18n and a component:

`Component.vue`:

```vue
<template>
  <p>{{ $t('message') }}</p>
  <my-component />
</template>

<script>
import MonComposant from '@/components/MonComposant'

export default {
  components: {
    MonComposant
  }
}
</script>
```

`Component.spec.js`:

```js {1,8-10,12-14}
import { config, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const MonComposant = defineComponent({
  template: `<div>My component</div>`
});

config.global.stubs = {
  MonComposant
}

config.global.mocks = {
  $t: (text) => text
}

test('config.global mocks and stubs', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe('<p>message</p><div>My component</div>')
});
```

::: tip
Remember that this behavior is global, not on a mount by mount basis. You might need to enable/disable it before and after each test.
:::

## composants

### RouterLinkStub

A component to stub the Vue Router `router-link` component when you don't want to mock or include a full router.

You can use this component to find a `router-link` component in the render tree.

**Usage :**

Set as a stub in the mounting options:
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

**Usage with slot:**

The `RouterLinkStub` component supports slot content and will return very basic values for its slot props. If you need more specific slot prop values for your tests, consider using a [real router](../guide/advanced/vue-router.html#using-a-real-router) so you can use a real `router-link` component. Alternatively, you can define your own `RouterLinkStub` component by copying the implementation from the test-utils package.
