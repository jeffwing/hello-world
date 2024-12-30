<script setup>
import {
  useLockScreen,
} from 'viy-ui';
import {
  useI18n
} from 'vue-i18n';
//import { EscortCrudLayout1 } from '/test/crud-form-cx.js';
import EscortCrudLayout from "/src/views/crudform/EscortCrudLayout.vue";

console.log(useI18n);
console.log(EscortCrudLayout);

const {
  t
} = useI18n();
const {
  lockScreen
} = useLockScreen();

defineOptions({
  name: 'cxTest',
});

const form = ref();
const viy2InputBox_iGaXe = ref();

const formData = reactive({
  datafieldviy2InputBox_iGaXe: ''
});

const page_ = getCurrentInstance();
provide('page_', page_);

const crudGetSubmitParam_ = () => {
  return {
    datafieldviy2InputBox_iGaXe: formData.datafieldviy2InputBox_iGaXe,
  };
};
const crudFlowAfterInit_ = () => {
  return {};
};
debugger;
defineExpose({
  self: page_,
  form: formData,
  crudGetSubmitParam_,
  crudFlowAfterInit_
});
</script>

<template>
  <VueForm ref="form" :model="formData" v-loading="lockScreen">
    <EscortCrudLayout>
      <VueFormItem prop="datafieldviy2InputBox_iGaXe">
        Test
        <VueInput id="viy2InputBox_iGaXe" ref="viy2InputBox_iGaXe" v-model="formData.datafieldviy2InputBox_iGaXe">
        </VueInput>
      </VueFormItem>
    </EscortCrudLayout>
  </VueForm>
</template>