<template>
  <div>
    <input type="checkbox" v-model="checkboxVal" />
    <input
      type="radio"
      v-model="radioVal"
      id="radioFoo"
      value="radioFooResult"
    />
    <input
      type="radio"
      v-model="radioVal"
      id="radioBar"
      value="radioBarResult"
    />
    <input type="text" v-model="textVal" />
    <input id="lazy" type="text" v-model.lazy="lazy" />
    <textarea v-model="textareaVal"></textarea>
    <select v-model="selectVal">
      <option value="selectA"></option>
      <option value="selectB"></option>
      <option value="selectC"></option>
    </select>
    <select v-model="selectVal" class="with-optgroups">
      <optgroup label="Group1">
        <option value="selectA"></option>
        <option value="selectB"></option>
      </optgroup>
      <optgroup label="Group2">
        <option value="selectC"></option>
      </optgroup>
    </select>
    <label id="label-el"></label>

    <span class="checkboxResult" v-if="checkboxVal">checkbox checked</span>
    <span class="counter">{{ counter }}</span>
    {{ textVal }}
    {{ selectVal }}
    {{ radioVal }}
    {{ lazy }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ComponentWithInput',

  data() {
    return {
      checkboxVal: undefined,
      textVal: undefined,
      lazy: undefined,
      textareaVal: undefined,
      radioVal: undefined,
      selectVal: undefined,
      counter: 0
    }
  },

  watch: {
    checkboxVal() {
      this.counter++
    },
    radioVal() {
      this.counter++
    }
  }
})
</script>
