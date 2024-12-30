<script setup>
import { useLockScreen } from 'viy-ui';
import { useI18n } from 'vue-i18n';

import { FlowButtons, useFlowButtons } from '@ymc-group/plugins-workflow';

const { t } = useI18n();
const { lockScreen } = useLockScreen();

defineOptions({
  name: 'flowbutton',
});

const form = ref();
const viy2FlowButtons_zyp3g = ref();

const formData = reactive({
});

const {
  workflowFormEditable,
  workflowBusinessId,
  workflowTaskId,
  workflowInstId,
  workflowPageCode,
  workflowBusinessData,
  workflowCurrNodeId,
  workflowFormEditableUpdate,
} = useFlowButtons();
</script>

<template>
  <VueForm ref="form" v-loading="lockScreen" :model="formData">
    <FlowButtons

      id="viy2FlowButtons_zyp3g"
      ref="viy2FlowButtons_zyp3g"

      v-model:task-id="workflowTaskId"
      v-model:inst-id="workflowInstId"
      v-model:curr-node-id="workflowCurrNodeId"
      :page-code="workflowPageCode"
      :business-id="workflowBusinessId"
      :business-data="workflowBusinessData"
      @form-editable-update="workflowFormEditableUpdate"
    />
  </VueForm>
</template>
