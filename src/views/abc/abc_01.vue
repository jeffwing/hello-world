<script setup>
import { VueFormItem, VueInput, useLockScreen } from 'viy-ui';
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';

const { t } = useI18n();
const { lockScreen } = useLockScreen();
provide('page_', {});

defineOptions({
  name: 'abc_01',
});

const form = ref();
const saveDataTableName = ref('');
const viy2Textarea_KWLH61 = ref();

const formData = reactive({
  datafieldviy2Textarea_KWLH61: '',
});

const pageDataSet_gyySzApi = useApi({
  url: '/abc.json',
  method: 'post',
  data: {
    param1: 'value1',
    param2: 'value2',
  },

}, {
  onSuccess: (data, params) => {
  // do something
  },

  manual: true,
});
const pageDataSet_gyySz = pageDataSet_gyySzApi.data;
</script>

<template>
  <escort-crud-layout ref="escortCrudLayout" result-url="/resources/static/views/formSubmitResult.html" page-id="8a3f93159029f6b001902a1b23310002" :save-data-table-name="saveDataTableName">
    <template #default="scope">
      <VueForm ref="form" v-loading="lockScreen" :model="formData">
        <VueFormItem

          label="lkj"

          prop="datafieldviy2Textarea_KWLH61"
        >
          <VueInput

            id="viy2Textarea_KWLH61"
            ref="viy2Textarea_KWLH61"

            v-model="formData.datafieldviy2Textarea_KWLH61"
          />
        </VueFormItem>
        <VueText id="viy2Text_DDEQ" ref="viy2Text_DDEQ" :style="{ width: '100%', display: 'inline-block' }">
          Text
        </VueText>
      </VueForm>
    </template>
  </escort-crud-layout>
</template>
