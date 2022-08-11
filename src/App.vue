<template>
  <div class="app">
    <Editor v-model="state" :formData="formData" />
    <!-- <Editor :modelVlaue = "state" @update:modelValue = "xxx" /> -->

  </div>
</template>

<script setup>
import { provide, reactive, ref } from "vue";
import data from "./data.json"
import Editor from './packages/editor';
import { registerConfig as config} from "./utils/editor-config"
const state = ref(data)

provide("componentConfig",config)


const formData = ref({
  username:"zx",
  password:123,
  start:2,
  end:26
})


</script>


<style scoped lang = "scss">
.app{
  position: fixed;
  top:20px;
  left:20px;
  right:20px;
  bottom: 20px;
}
</style>
