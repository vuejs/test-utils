import { Component, ComponentOptions, Directive, Plugin, AppConfig } from 'vue'

interface RefSelector {
  ref: string
}

interface NameSelector {
  name: string
}

interface RefSelector {
  ref: string
}

interface NameSelector {
  name: string
}

export type FindComponentSelector = RefSelector | NameSelector | string
export type FindAllComponentsSelector = NameSelector | string

export type GlobalMountOptions = {
  plugins?: Plugin[]
  config?: AppConfig
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Record<any, any>
}
