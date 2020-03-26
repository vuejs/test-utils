declare module '*.vue' {
  // TODO: Figure out the typing for this
  import Vue from 'vue'
  export default any
}

declare module 'vue' {
  import Vue from 'vue/dist/vue'
  export = Vue
}
