# Установка

```bash
npm install --save-dev @vue/test-utils

# либо
yarn add --dev @vue/test-utils
```

Vue Test Utils является гибким фреймворком - вы можете использовать его с какой-угодно программой тестирования. Самой простой вариант это использовать [Jest](https://jestjs.io/), популярная программа тестирования.

Чтобы подключить `.vue` файлы в Jest, тебе нужен `vue-jest`. `vue-jest` v5 поддерживает Vue 3. Он все еще в альфа версии, как и остальная экосистема Vue.js 3, поэтому если вы найдете недочеты, пожалуйста сообщите об этом [здесь](https://github.com/vuejs/vue-jest/) и укажите, что вы используете `vue-jest` v5.

Вы можете установить в виде `vue-jest@next`. После вам нужно настроить его при помощи Jest [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) опции.

Если ты не хочешь настраивать самостоятельно, ты можешь взять за основу этот заранее настроенный проект [здесь](https://github.com/lmiller1990/vtu-next-demo).

Продолжайте чтение, чтобы узнать больше о Vue Test Utils.
