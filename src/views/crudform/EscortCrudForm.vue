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
import {
  useRoute
} from 'vue-router';
import crudFormButton from '/src/views/crudform/CrudFormButton.vue';
import {
  crudMethod
} from '@/plugins/crudMethod';

const {
  t
} = useI18n();
const {
  lockScreen
} = useLockScreen();

const self = getCurrentInstance();

const page_ = inject('page_', {
  readOnly: false,
}).exposed;
self.page_ = page_;

const props = defineProps({
  pageId: String,
  saveDataTableName: {
    type: String,
    default: ''
  },
  formParam: {
    type: Object,
    default: () => ({})
  },
  resultUrl: String,
  btnSetting: {
    type: Object,
    default: () => ({})
  },
  reportParams: {
    type: Object,
    default: () => ({})
  }
});
// 解构赋值
const {
  pageId,
  saveDataTableName,
  formParam,
  resultUrl,
  btnSetting,
  reportParams
} = props;
const route = useRoute();

const readonly = ref(true);
const crudLoading = ref(false);
const crudDeleteLoading = ref(false);
const formResultParam = ref({});
const formResultVisible = ref(false);
const saveTableData = ref('');
//const crudResultComponent = ref('');
//const formInputComponent = ref('');
const form = ref({
  id: ''
});
const activeType = ref('add');
const visible = ref(true);
const crudType = ref('');
// 计算属性
const buttonFlodLimit = computed(() => VueUtil.isMobile.value ? 1 : undefined);
const params = computed(() => VueUtil.merge({}, route.query, route.params, page_.$attrs.params));
const btnSaveVisble = computed(() => !form.value.id && !formResultVisible.value && !readonly.value);
const btnUpdateVisble = computed(() => !!form.value.id && !formResultVisible.value && !readonly.value);
const btnDeleteVisble = computed(() => !!form.value.id && !formResultVisible.value && !readonly.value);
const btnPreviewPdfVisible = computed(() => !!form.value.id && btnSetting?.crudPreviewPdf?.visible);
const btnExportPdfVisible = computed(() => !!form.value.id && btnSetting?.crudExportPdf?.visible);
const btnExportExcelVisible = computed(() => !!form.value.id && btnSetting?.crudExportExcel?.visible);
const btnPrintVisible = computed(() => !!form.value.id && btnSetting?.crudPrint?.visible);

// 监听器
watch(visible, (val) => {
  if (val) {
    nextTick(() => initForm());
  }
});

// 生命周期钩子
onMounted(() => {

  //  crudResultComponent.value = "form-submit-result";
  // VueLoader获取页面
  // self.$options.components['form-submit-result'] = VueLoader(contextPath + this.resultUrl);
  //  formInputComponent.value = "form-input-message";
  // self.$options.components['form-input-message'] = VueLoader(contextPath + "/public/page/form/formInputMessage.html")
  // 需要从crudMethod获取
  crudMethod.setCrudType(self);
  initInfo({});
  setCrudSetting();
});

// 方法
const inputCheckBack = (formIsVisible) => {
  visible.value = formIsVisible;
};

const inputCheckClickBack = (param) => {
  submitResultBack(param);
};

const setCrudSetting = () => {
  const parentDom = btnSetting?.parentDom;
  if (parentDom) {
    const buttonArea = ref('button-area').value;
    parentDom.appendChild(buttonArea.$el);
  }

  const crudCallback = btnSetting?.callback;
  if (crudCallback) {
    crudCallback(ref('button-area').value.$el, self);
  }
};

const initForm = (params) => {
  initInfo(params);
  const id = params?.id || params?.businessId || form.value.id;
  if (id) {
    query(id);
  }
};

const initInfo = (params) => {
  const param = params || params.value || {};
  if (param.id) {
    nextTick(() => query(param.id));
  } else if (page_.crudAfterInit_) {
    page_.crudAfterInit_({});
  }

  readonly.value = ["", "null", "true"].includes(String(param.readonly || page_.readOnly));
};

const getFormEditable = () => !readonly.value;

const deleteClick = () => {
  componentutils.sysConfirm({
    title: messageutil.get('confirm.delete.form.data')
  }, () => {
    crudDeleteLoading.value = true;
    const getParam = page_.crudGetDeleteParam_;
    const saveDataTableName = props.saveDataTableName || '';
    const params = typeof getParam === 'function' ? getParam() : null;

    const crudBeforeDelete = page_.crudBeforeDelete_ || ((next) => next(true));
    const crudAfterDelete = page_.crudAfterDelete_ || ((res, next) => next(res, true));

    crudBeforeDelete((doNext) => {
      if (!doNext) {
        crudDeleteLoading.value = false;
        return;
      }

      crudMethod[crudType.value].doDelete(saveDataTableName, params, self).then((res) => {
        crudDeleteLoading.value = false;
        crudAfterDelete(res, (res, doNext) => {
          if (!doNext) return;

          if (res.body.success) {
            notifySuccess('success.delete');
            crudMethod[crudType.value].afterDelete(res, self);
          } else {
            notifyError('failure.delete');
          }
        });
      });
    });
  });
};

const saveClick = (cb) => {
  crudLoading.value = true;
  const getParam = page_.crudGetSubmitParam_;
  const saveDataTableName = props.saveDataTableName || '';
  const params = typeof getParam === 'function' ? getParam() : null;

  const crudBeforeSubmit = page_.crudBeforeSubmit_ || ((next) => next(true));
  const crudAfterSubmit = page_.crudAfterSubmit_ || ((res, next) => next(res, true));

  crudBeforeSubmit((doNext) => {
    if (!doNext) {
      crudLoading.value = false;
      return;
    }

    crudMethod['headDetail'].validAll(self, (valid) => {
      if (valid) {
        crudMethod[crudType.value].doSend(saveDataTableName, params, self).then((res) => {
          crudLoading.value = false;
          crudAfterSubmit(res, (res, doNext) => {
            if (!doNext) return;

            if (res.body.success) {
              notifySuccess('success.save');
            } else {
              notifyError('failure.save');
            }

            crudMethod['headDetail'].afterSave(res, self);
            if (typeof cb === 'function') cb(res);
          }).catch((res) => {
            if (typeof cb === 'function') cb(res.data, 'failure');
          });
        });
      } else {
        crudLoading.value = false;
      }
    });
  });
};

const query = (id) => {
  const getParam = page_.crudGetQueryParam_;
  const saveDataTableName = props.saveDataTableName || '';
  const params = typeof getParam === 'function' ? getParam(id) : null;

  const crudBeforeQuery = page_.crudBeforeQuery_ || ((next) => next(true));
  const crudAfterQuery = page_.crudAfterQuery_ || ((res, next) => next(null, true));

  crudBeforeQuery((doNext) => {
    if (!doNext) return;

    crudMethod[crudType.value].query(saveDataTableName, params, self, id).then((res) => {
      crudAfterQuery(res, (data, doNext) => {
        if (data) res.data.data = data;
        crudMethod[crudType.value].afterQuery(res, self);
      });
    });
  });
};

const getCustomParam = () => {
  const customParam = page_.crudSubmitParam;
  return typeof customParam === 'function' ? customParam() : customParam || null;
};

const submitResultBack = (obj) => {
  if (obj.tableName) saveTableData.value = obj.tableName;
  if (obj.mode === 'new') {
    clearForm();
    activeType.value = 'add-again';
    formResultParam.value = {};
  } else if (obj.mode === 'editOrDelete') {
    activeType.value = 'editOrDelete';
  }
  visible.value = true;
  formResultVisible.value = false;
};

const notifySuccess = (messageKey) => {
  $notify({
    message: messageutil.get(messageKey),
    type: 'success',
    position: 'top-center'
  });
};

const notifyError = (messageKey) => {
  $notify({
    message: messageutil.get(messageKey),
    type: 'error',
    position: 'top-center'
  });
};

const clearForm = () => {
  // 实现清除表单逻辑
};
console.log(formResultVisible.value);
console.log(visible.value);
</script>

<template>
  <div class="escort-crud-form" ref="escortCrudForm" style="margin-bottom:15px;">
    <template v-if="visible">
      <template v-show="!formResultVisible">
        <slot :disabled="!getFormEditable()"></slot>
      </template>
      <crud-form-button ref="button-area" :btn-save-visible="btnSaveVisble" :btn-update-visible="btnUpdateVisble" :btn-delete-visible="btnDeleteVisble" :btn-preview-pdf-visible="btnPreviewPdfVisible" :btn-export-pdf-visible="btnExportPdfVisible" :btn-export-excel-visible="btnExportExcelVisible" :btn-print-visible="btnPrintVisible" :report-params="reportParams" :btn-setting="btnSetting" :btn-flod-limit="buttonFlodLimit" @saveClick="saveClick" @updateClick="saveClick" @deleteClick="deleteClick" />
    </template>
  </div>
</template>