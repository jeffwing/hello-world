<script setup>
import {
  useLockScreen,
} from 'viy-ui';
import {
  useI18n
} from 'vue-i18n';
import EscortCrudForm from "/src/views/crudform/EscortCrudForm.vue";

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
}
defineExpose({
  form: formData,
  crudGetSubmitParam_: crudGetSubmitParam_,
  $refs: page_.refs
});
</script>

<template>
  <VueForm ref="form" :model="formData" v-loading="lockScreen">
    <EscortCrudForm>
      <VueFormItem prop="datafieldviy2InputBox_iGaXe">
        Test
        <VueInput id="viy2InputBox_iGaXe" ref="viy2InputBox_iGaXe" v-model="formData.datafieldviy2InputBox_iGaXe">
        </VueInput>
      </VueFormItem>
    </EscortCrudForm>
  </VueForm>
</template>