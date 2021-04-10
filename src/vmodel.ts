import { Ref, ref, UnwrapRef } from 'vue'

export interface VModel<T> {
  value: Ref<UnwrapRef<T>>
  onChange?(v: T): void
}

const vmodels = new Set<any>()

export function isVModel(v: any) {
  return vmodels.has(v)
}

export function vmodel<T>(v: T, onChange?: (d: T) => {}): VModel<T> {
  const m = {
    value: ref(v),
    onChange
  }

  vmodels.add(m)

  return m
}
