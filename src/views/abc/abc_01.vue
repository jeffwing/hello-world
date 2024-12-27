<script setup>
import { VueFormItem, VueInput, useLockScreen } from 'viy-ui';
import { useI18n } from 'vue-i18n';
import { provide } from 'vue';

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
</script>

<template>
  <escort-crud-layout ref="escortCrudLayout" result-url="/resources/static/views/formSubmitResult.html" page-id="2c96808393de64a4019406fd713b1566" :save-data-table-name="saveDataTableName">
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
