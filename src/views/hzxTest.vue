<script setup>
import { VueFormItem, useLockScreen } from 'viy-ui';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { lockScreen } = useLockScreen();
provide('page_', {});

defineOptions({
  name: 'hzxTest',
});

const form = ref();
const saveDataTableName = ref('');
const viy2InputBox_Ic45 = ref();
const viy2InputBox_IduC = ref();

const formData = reactive({
  name: '', age: '',
});
</script>

<template>
  <escort-crud-layout ref="escortCrudLayout" result-url="/resources/static/views/formSubmitResult.html" page-id="2c96808393de64a40193f6af9977078d" :save-data-table-name="saveDataTableName">
    <template #default="scope">
      <VueForm ref="form" v-loading="lockScreen" :model="formData">
        <VueFormItem

          id="viy2FormItem_IaWc"

          ref="viy2FormItem_IaWc"
          label="name"
        >
          <VueFormItem

            prop="name"
          >
            <VueInput

              id="viy2InputBox_Ic45"
              ref="viy2InputBox_Ic45"

              v-model="formData.name"
            />
          </VueFormItem>
        </VueFormItem>
        <VueFormItem

          id="viy2FormItem_IcTd"

          ref="viy2FormItem_IcTd"
          label="age"
        >
          <VueFormItem

            prop="age"
          >
            <VueInput

              id="viy2InputBox_IduC"
              ref="viy2InputBox_IduC"

              v-model="formData.age"
            />
          </VueFormItem>
        </VueFormItem>
      </VueForm>
    </template>
  </escort-crud-layout>
</template>
