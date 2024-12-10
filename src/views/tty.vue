<script setup>
import { VueForm, useI18n } from 'viy-ui';
const { t } = useI18n();
defineOptions({
  name: 'tty',
});
const form = ref();
const formData = reactive({
});
</script>

<template>
  <VueForm ref="form" :model="formData" />
</template>
