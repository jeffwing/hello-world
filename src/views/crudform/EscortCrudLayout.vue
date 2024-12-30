<script setup>
import {
  useLockScreen
} from 'viy-ui';
import {
  useI18n
} from 'vue-i18n';
import {
  useApi
} from '@/composables/useApi';
//import EscortCrudForm from '/src/views/crudform/EscortCrudForm.vue';
import EscortCrudFlowLayout from '/src/views/crudform/EscortCrudFlowLayout.vue';

//临时
const EscortCrudForm = defineComponent({
  render: function() {
    return h("dev", {
      class: "temp-escort-crud-form"
    }, "TempEscortCrudForm");
  }
})

const {
  t
} = useI18n();
const {
  lockScreen
} = useLockScreen();

const contextPath = "/escort";

const props = defineProps({
  pageId: {
    type: String,
    default: '',
  },
  resultUrl: {
    type: String,
    default: '',
  },
  workflowCurrNodeId: {
    type: String,
    default: '',
  },
});

const escortCrudLayoutComponent = ref();

const crudFormComponent = ref('crud-form-component');

//crud按钮的配置，如parentDom指按钮的父节点,export指导出按钮，print打印按钮等
const btnSetting = ref({});

const currNodeId = ref('');

//报表信息
const reportParams = ref({});

//保存的表名，优先填写设置中的值
const saveDataTable = ref('');

defineOptions({
  name: 'EscortCrudLayout',
  components: {
    'crud-form-component': defineComponent({
      render: function() {
        return h("dev", {
          class: "empty"
        }, "空");
      }
    })
  },
  watch: {
    currNodeId: function(val) {
      $emit('update:workflowCurrNodeId', val);
    }
  }
});
onMounted(() => {
  console.log('EscortCrudLayout is mounted');
  getFormSetting().runAsync();
});

const getFormSetting = () => {
  //const url = contextPath + "/designer/pageList/getFormSetting.json";
  const url = contextPath + "/designer111/pageList/getFormSetting.json";
  var body = {
    id: props.pageId
  };
  return useApi({
    url: url,
    method: 'post',
    data: body,
  }, {
    onSuccess: (response, params) => {
      debugger;
      const data = response.data;
      const formSet = typeof data === 'string' ? JSON.parse(data) : data;
      const userWorkflow = Boolean(formSet.useWorkflow);
      if (formSet.btnSetting) {
        btnSetting.value = formSet.btnSetting;
      }
      if (formSet.useReport) {
        reportParams.reportCode = formSet.reportCode;
      }
      saveDataTable.value = formSet.saveDataTableName || self.saveDataTableName;
      crudFormComponent.value = userWorkflow ? EscortCrudFlowLayout : EscortCrudForm;
    },
  });
}
const getRefFlowButons = () => {
  if (escortCrudLayoutComponent.$refs.escortCrudFlowLayout) {
    return escortCrudLayoutComponent.$refs.escortCrudFlowLayout.__vue__.$refs.flowButtons.$refs.flowButtons;
  } else {
    return null;
  }
}
const getLayout = () => {
  var self = this;
  var component = escortCrudLayoutComponent.value;
  var crudDom = component.$refs.escortCrudForm || component.$refs.escortCrudFlowLayout || {};
  return crudDom.__vue__;
}
</script>

<template>
  <div class="escort-crud-layout" ref="escortCrudLayout">
    <component :is="crudFormComponent" ref="escortCrudLayoutComponent" :btn-setting="btnSetting" :report-params="reportParams" :page-id="pageId" :result-url="resultUrl" :workflow-curr-node-id.sync="currNodeId" :save-data-table-name="saveDataTable" v-slot="scope">
      <slot v-bind="scope"></slot>
    </component>
  </div>
</template>