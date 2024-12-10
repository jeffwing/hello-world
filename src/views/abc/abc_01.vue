<script setup>
import {
  VueForm, VueFormItem, VueInput,
  useI18n,
} from 'viy-ui';
const { t } = useI18n();
defineOptions({
  name: 'abc_01',
});
const form = ref();
const viy2Textarea_KWLH6 = ref();
const formData = reactive({
  datafieldviy2Textarea_KWLH6: '',
});
</script>

<template>
  <VueForm ref="form" :model="formData">
    <VueFormItem
      label="lkj"
      prop="datafieldviy2Textarea_KWLH6"
    >
      <VueInput
        id="viy2Textarea_KWLH6"
        ref="viy2Textarea_KWLH6"
        v-model="formData.datafieldviy2Textarea_KWLH6"
      />
    </VueFormItem>
  </VueForm>
</template>
