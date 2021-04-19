import { getCurrentInstance, reactive } from 'vue'

export const createDataMixin = (data: Record<string, unknown>) => {
  return {
    created() {
      for (const [k, v] of Object.entries(data)) {
        getCurrentInstance()!.data = reactive({ ...getCurrentInstance()!.data, [k]: v })
      }
    }
  }
}
