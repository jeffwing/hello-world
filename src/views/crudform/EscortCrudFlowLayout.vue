<script setup>
import {
  useLockScreen,
  VueUtil
} from 'viy-ui';
import {
  useI18n
} from 'vue-i18n';
import CrudFormButtonsComponent from '/src/views/crudform/CrudFormButton.vue';
import {
  useApi
} from '@/composables/useApi';
import {
  crudMethod
} from '@/plugins/crudMethod';
import {
  FlowButtons,
  useFlowButtons
} from '@ymc-group/plugins-workflow';
const emit = defineEmits(['update:workflowInstId', 'update:workflowTaskId', 'update:workflowBusinessId', 'update:workflowCurrNodeId']);
const {
  t
} = useI18n();
const {
  lockScreen
} = useLockScreen();

//临时
//const CrudFormButtonsComponent = defineComponent({
//  render: function(){
//    return h("dev",{class:"temp-crud-form-button"},h("VueButton",{class:"btn-save"},"保存"));
//  }
//});

defineOptions({
  name: 'EscortCrudFlowLayout',
});

const self = getCurrentInstance();

const page_ = inject('page_', {
  readOnly: false,
}).exposed;

const props = defineProps({
  resultUrl: String,
  pageId: String,
  workflowPageCode: String,
  workflowTaskId: String,
  workflowBusinessId: String,
  workflowInstId: String,
  workflowBusinessData: Object,
  workflowCurrNodeId: String,
  saveDataTableName: {
    type: String,
    default: ""
  },
  formParam: {
    type: Object,
    default: () => ({})
  },
  btnSetting: {
    type: Object,
    default: () => ({})
  },
  reportParams: Object
});

const customFormEditable = ref(true);
const readonly = ref(true);
const alowEditableFromWorkflow = ref(false);
const formResultParam = ref({});
const formResultVisible = ref(false);
const saveTableData = ref('');
const crudResultComponent = ref('');
const formInputComponent = ref('');
const crudFlowButtonAreaRef = ref();
const flowButtonsRef = ref();
const form = ref({
  data: {},
  name: "",
  id: ''
});

//工作流
const viy2FlowButtons_zyp3g = ref();
const {
  workflowFormEditable,
  workflowBusinessId,
  workflowTaskId,
  workflowInstId,
  workflowPageCode,
  workflowBusinessData,
  workflowCurrNodeId,
  workflowFormEditableUpdate
} = useFlowButtons();

const businessId = ref('');
const currNodeId = ref('');
const activeType = ref("add");
const defaultFormName = ref("form");
const visible = ref(true);
const crudType = ref('');
const crudLoading = ref(false);
const crudDeleteLoading = ref(false);
const pageObj = ref([]);
//工作流按钮外层是否显示
const pinButtonsVisible = ref(true);
const pdfFlag = ref(false);

const CrudFormButton = CrudFormButtonsComponent;
const EscortFlowButtons = defineComponent({});

const instId = computed({
  get() {
    return props.workflowInstId;
  },
  set(val) {
    emit('update:workflowInstId', val);
  }
});

const taskId = computed({
  get() {
    return props.workflowTaskId;
  },
  set(val) {
    emit('update:workflowTaskId', val);
  }
});

const buttonFlodLimit = computed({
  get() {
    return VueUtil.isMobile.value ? 1 : undefined;
  },
  set(val) {
    emit('update:buttonFlodLimit', val);
  }
});

const params = computed({
  get() {
    const param = $route || {};
    const routeParam = !VueUtil.isEmpty(param.query) ? param.query : !VueUtil.isEmpty(param.params) ? param.params : page_.$attrs.params;
    if (routeParam && routeParam.businessId && routeParam.businessId.indexOf(':') > -1) {
      routeParam.businessId = routeParam.businessId.split(':').pop();
    }
    return routeParam;
  },
  set(val) {
    emit('update:params', val);
  }
});

onMounted(() => {
  console.log('EscortCrudFlowLayout is mounted');
  businessId.value = props.workflowBusinessId;
  if (businessId.value) {
    activeType.value = "flowButton";
  }
  initInfo();
  addCss();
});

watch(visible, (val) => {
  if (val) {
    nextTick(() => {
      crudMethod.setCrudType(self.exposed);
      initForm();
    });
  }
});

watch(businessId, (val) => {
  emit('update:workflowBusinessId', val);
});

watch(currNodeId, (val) => {
  emit('update:workflowCurrNodeId', val);
});

watch(readonly, (val) => {});

const addCss = () => {
  const str = ".escort-crud-flow-layout .head-crud-buttons-area .row-form-btn {" +
    "    margin: 0;" +
    "}" +
    ".escort-crud-flow-layout .head-crud-buttons-area .row-form-btn .vue-dropdown .vue-button {" +
    "    font-size: 14px;" +
    "    padding: 10px 15px;" +
    "}";
  const styleDom = document.createElement('style');
  styleDom.innerHTML = str;
  document.head.appendChild(styleDom);
};

const btnPreviewPdfVisible = () => {
  return (form.value.id ? true : false) && props.btnSetting.crudPreviewPdf && props.btnSetting.crudPreviewPdf.visible;
};

const btnExportPdfVisible = () => {
  const hasId = (form.value.id ? true : false);
  return hasId && props.btnSetting.crudExportPdf && props.btnSetting.crudExportPdf.visible;
};

const btnExportExcelVisible = () => {
  const hasId = (form.value.id ? true : false);
  return hasId && props.btnSetting.crudExportExcel && props.btnSetting.crudExportExcel.visible;
};

const btnPrintVisible = () => {
  const hasId = (form.value.id ? true : false);
  return hasId && props.btnSetting.crudPrint && props.btnSetting.crudPrint.visible;
};

const hasInstId = () => {
  const instId = (flowButtonsRef.value && flowButtonsRef.value.$refs.flowButtons || {}).procInstId_;
  return instId ? true : false;
};

const btnSaveVisble = () => {
  const hasInstIdValue = hasInstId();
  if (!hasInstIdValue) {
    return false;
  }

  const hasId = (form.value.id ? true : false);
  return !hasId && getFormEditable() && !formResultVisible.value;
};

const btnUpdateVisble = () => {
  const hasInstIdValue = hasInstId();
  if (!hasInstIdValue) {
    return false;
  }

  const hasId = (form.value.id ? true : false);
  return (hasId && !hasInstIdValue && getFormEditable()) || (hasId && hasInstIdValue && getFormEditable()) && !formResultVisible.value;
};

const btnDeleteVisble = () => {
  // 有了草稿功能，不用删除按钮了，由删除草稿按钮删除
  return false;
};

const setCrudSetting = () => {
  const parentDom = props.btnSetting.parentDom;
  const buttonArea = crudFlowButtonAreaRef.value;
  if (parentDom) {
    parentDom.appendChild(buttonArea.$el);
  }
  const crudCallback = props.btnSetting.callback;
  if (crudCallback) {
    crudCallback(buttonArea.$el, self.exposed);
  }
  pinButtonsVisible.value = !parentDom;
};

//form-input-message start
const inputCheckBack = (formIsVisible) => {
  visible.value = formIsVisible;
};

const inputCheckClickBack = (param) => {
  submitResultBack(param);
};

const setFormEditable = (flowBtns) => {
  const crudFlowAfterInit = page_.crudFlowAfterInit_ || function() {};
  if (flowBtns._isVue && !crudFlowAfterInited) {
    setTimeout(() => {
      crudFlowAfterInit({
        businessId: businessId.value,
        businessData: props.workflowBusinessData,
        taskId: props.workflowTaskId,
        instId: props.workflowInstId,
        currNodeId: currNodeId.value
      });
    }, 500);
    crudFlowAfterInited = true;
  }
  flowBtns.formEditable = flowBtns.formEditable !== false || !flowBtns.procInstId_;
};
//end

const getFormEditable = () => {
  const flowBtns = (flowButtonsRef.value && flowButtonsRef.value.$refs.flowButtons) || {
    formEditable: false,
    currNodeId: currNodeId.value
  };
  setFormEditable(flowBtns);
  const pageForm = getCustomPage(page_, 'self').children;
  if (pageForm.length === 1) {
    return !readonly.value && flowBtns.formEditable;
  } else {
    //页面上有多个表，由页面控制只读
    return !readonly.value;
  }
};

const flowBeforeMessageBox = (type) => {
  return new Promise((resolve, reject) => {
    const crudFlowBeforeMessageBox_ = VueUtil.isFunction(page_.crudFlowBeforeMessageBox_) ? page_.crudFlowBeforeMessageBox_ : () => Promise.resolve();
    const crudFlowBeforeFormValid = VueUtil.isFunction(page_.crudFlowBeforeFormValid_) ? page_.crudFlowBeforeFormValid_ : () => true;
    const result = crudFlowBeforeFormValid(type);

    let validAll = null;
    const flowButtons = flowButtonsRef.value;
    const buttonTypes = flowButtons.ButtonTypes;

    if (result instanceof Promise) {
      result.then(resolve, reject);
      return;
    } else if (type === buttonTypes.REJECT || type === buttonTypes.REJECTTOPREVIOUS || type === buttonTypes.REJECTTOSTART || type === buttonTypes.REVOKE) {
      //回退，退回到，取回，都不做验证
      validAll = (page, cb) => {
        cb(true);
      };
    } else if (result && (type === flowButtons.ButtonTypes.STARTFLOW || (flowButtons.buttonMap[type] && flowButtons.buttonMap[type].mrType === 'modify' && type !== flowButtons.ButtonTypes.SAVEDRAFT && type !== flowButtons.ButtonTypes.DELETEDRAFT && getFormEditable()))) {
      validAll = crudMethod['headDetail'].validAll.bind(crudMethod['headDetail']);
    } else {
      validAll = (page, cb) => {
        cb(true);
      };
    }

    // 打开对话框前执行页面校验：
    // 校验通过时，继续执行页面的 crudFlowBeforeMessageBox_ 方法，再判断是否打开对话框
    // 校验不通过时，不打开对话框
    validAll(self.exposed, (valid) => {
      if (valid) {
        const result = crudFlowBeforeMessageBox_(type);
        result instanceof Promise ? result.then(resolve, reject) : resolve();
      } else {
        reject();
      }
    });
  });
};

const flowBeforeMethod = (type) => {
  return new Promise((resolve, reject) => {
    const beforeMain = () => {
      const next = (data, resultType) => {
        if ("failure" === resultType) {
          reject();
          return;
        }
        businessId.value = (data.data[saveTableData.value] || data.data).id;
        activeType.value = "flowButton";
        VueUtil.merge(formResultParam.value, {
          activeType: activeType.value
        });
        nextTick(() => {
          resolve();
        });
      };
      const flowButtons = flowButtonsRef.value;
      //启动，保存草稿，中间节点可编辑（排除删除草稿，删除流程，删除流程历史）
      if (type === flowButtons.ButtonTypes.STARTFLOW || type === flowButtons.ButtonTypes.SAVEDRAFT || (type !== flowButtons.ButtonTypes.DELETEDRAFT && type !== flowButtons.ButtonTypes.DELETEPROCESS && type !== flowButtons.ButtonTypes.DELETEHISTORYPROCESS && getFormEditable())) {
        if (form.value.id) {
          updateClick(next, type);
        } else {
          saveClick(next, type);
        }
        //删除草稿，删除流程，删除流程历史
      } else if (type === flowButtons.ButtonTypes.DELETEDRAFT || type === flowButtons.ButtonTypes.DELETEPROCESS || type === flowButtons.ButtonTypes.DELETEHISTORYPROCESS) {
        doDeleteClick(resolve, reject);
      } else {
        next({
          data: {
            id: form.value.id
          }
        });
        resolve();
      }
    };
    if (typeof page_.crudFlowBeforeMethod_ === 'function') {
      page_.crudFlowBeforeMethod_(type).then(() => {
        beforeMain();
      }, () => {
        reject();
      }).catch((e) => {});
    } else {
      beforeMain();
    }
  });
};

const flowAfterMethod = (type, res) => {
  const afterMain = () => {
    const flowBtns = flowButtonsRef.value.$refs.flowButtons;
    readonly.value = !flowBtns.formEditable;
    if (businessId.value) {
      activeType.value = "editOrDelete";
    }
  };
  let result = Promise.resolve();
  if (typeof page_.crudFlowAfterMethod_ === 'function') {
    const aftermethodResult = page_.crudFlowAfterMethod_(type, res);
    if (aftermethodResult instanceof Promise) {
      aftermethodResult.then(afterMain);
      result = aftermethodResult;
    } else {
      afterMain();
    }
  }
  crudFlowAfterInited = false;
  return result;
};

const flowFailMethod = (type, res) => {
  if (type === flowButtonsRef.value.ButtonTypes.STARTFLOW) {
    businessId.value = "";
  }
  refs.formSubmitResult.stepFinish({
    success: res.data.state > -1
  });
};

const flowNextMethod = (type, res) => {
  const nextMain = () => {
    window.parent.parent.postMessage({
      act: "closeDialog"
    }, '*');

    if (window.parent === top) {
      let closeTagPromise = null;
      if (typeof page_.crudFlowBeforeCloseTag_ === 'function') {
        closeTagPromise = page_.crudFlowBeforeCloseTag_(type, res);
      }!(closeTagPromise instanceof Promise) && (closeTagPromise = Promise.resolve());
      closeTagPromise.then(() => {
        top.MenuStore.dispatch("closeTag", top.router.currentRoute.name);
      });
    }
    window.parent.postMessage({
      act: "close"
    }, '*');
  };

  let nextMethodPromise = null;
  if (typeof page_.crudFlowNextMethod_ === 'function') {
    nextMethodPromise = page_.crudFlowNextMethod_(type, res);
  }!(nextMethodPromise instanceof Promise) && (nextMethodPromise = Promise.resolve());
  nextMethodPromise.then(() => {
    nextMain();
  });
};

const flowProcessInstanceEnd = (state) => {
  return new Promise((resolve, reject) => {
    if (typeof page_.crudFlowProcessInstanceEnd_ === 'function') {
      page_.crudFlowProcessInstanceEnd_(state).then(() => {
        resolve(state);
      }, () => {
        reject();
      }).catch(() => {});
    } else {
      resolve(state);
    }
  });
};

const submitResultBack = (obj) => {
  if (obj.tableName) {
    saveTableData.value = obj.tableName;
  }
  if (obj.mode === 'new') {
    clearForm();
    activeType.value = "add-again";
    formResultParam.value = {};
  } else if (obj.mode === 'editOrDelete') {
    activeType.value = "editOrDelete";
    crudMethod.setCrudType(self);
  }
  formResultVisible.value = false;
};

const itemIsSubPage = (page, item) => {
  try {
    if (typeof item === 'string') {
      return page.$refs[item].$vnode.tag.indexOf('EscortSubpage') > -1;
    } else if (item.name) {
      return page.$refs[item.name].$vnode.tag.indexOf('EscortSubpage') > -1;
    }
  } catch (e) {}
  return false;
};

const getCustomPage = (page, pageName) => {
  if (!page) {
    return {
      children: []
    };
  }
  const pageObj = {
    page: pageName,
    children: []
  };
  if (typeof page.crudGetForm_ === 'function') {
    let pageForm = page.crudGetForm_();
    if (!(pageForm instanceof Array)) {
      pageForm = [pageForm];
    }

    for (let i = 0; i < pageForm.length; i++) {
      const item = pageForm[i];
      if (itemIsSubPage(page, item)) {
        const subPage = getCustomPage(page.getRef(item), item);
        if (subPage == null) {
          continue;
        }
        pageObj.children.push(subPage);
      } else {
        if (typeof item === 'string') {
          let formVueObj = {};
          try {
            formVueObj = page.getRef(item) || {};
          } catch (e) {}
          pageObj.children.push({
            name: item,
            model: formVueObj
          });
        } else {
          pageObj.children.push(item);
        }
      }
    }
  }
  if (pageObj.children.length === 0) {
    let formVueObj = {};
    try {
      formVueObj = page.getRef(defaultFormName.value);
    } catch (e) {}
    pageObj.children.push({
      name: defaultFormName.value,
      type: 'default',
      model: formVueObj
    });
  }
  pageObj.value = pageObj;
  return pageObj;
};

const query = (id) => {
  queryFormData(id);
};

const initInfo = (params) => {
  const tempParams = params || props.params || {};
  const readonlyFlag = tempParams.readonly || page_.readOnly;
  saveTableData.value = props.saveDataTableName;
  readonly.value = (readonlyFlag + '').toString() === 'true';
  businessId.value = form.value.id = tempParams.id || tempParams.businessId;
};

const initForm = (params) => {
  initInfo(params);
  const id = params && (params.id || params.businessId) || form.value.id;
  if (id) {
    queryFormData(id).then((res) => {
      // if (res.data.data.length !== 0) {
      //     //self.setFormData(res.data);
      //     setPageData(res.data, getCustomPage(page_, 'self').children);
      //     form.value.data = res.data.data[0];
      //     page_.queryData = form.value.data;
      // }
    });
  } else {
    if (page_.crudAfterInit_) {
      page_.crudAfterInit_({});
    }
  }
};

const clearForm = () => {
  form.value.id = '';
  //页面有多个form时，页面实现清空方法
  const pageForms = getCustomPage(page_, 'self').children;
  if (pageForms.length > 1) {
    if (page_.clearForm && typeof page_.clearForm === 'function') {
      page_.clearForm();
    }
  } else {
    const formRef = page_.getRef(pageForms[0].name) || {};
    formRef.resetFields();
  }
  formResultParam.value = {};
  formResultVisible.value = false;
  activeType.value = "add";
  businessId.value = "";
  nextTick(() => flowButtonsRef.value.getButtons());
  initInfo();
  emit('update:workflowTaskId', "");
};

const queryFormData = (id) => {
  const getParam = page_.crudGetQueryParam_;
  const saveDataTableName = saveTableData.value || "";
  const params = typeof getParam === 'function' ? getParam(id) : null;
  let crudBeforeQuery = page_.crudBeforeQuery_;
  let crudAfterQuery = page_.crudAfterQuery_;

  crudBeforeQuery = typeof crudBeforeQuery === 'function' ? crudBeforeQuery : (next) => next(true);
  crudAfterQuery = typeof crudAfterQuery === 'function' ? crudAfterQuery : (res, next) => next(null, true);

  return new Promise((resolve, reject) => {
    crudBeforeQuery((doNext) => {
      if (doNext === false) {
        resolve();
      }
      crudMethod[crudType.value].query(saveDataTableName, params, self, id).then((res) => {
        crudAfterQuery(res, (data, doNext) => {
          if (data) {
            res.data.data = data;
          }
          if (doNext) {
            crudMethod[crudType.value].afterQuery(res, self);
            resolve(res);
          } else {
            resolve();
          }
        });
      });
    });
  });
};

const setPageData = (data, customPageChildren) => {
  const formData = data.data[0];
  form.value.id = formData.id;
  customPageChildren.forEach((child) => {
    if (child.page) {
      setPageData(formData[child.page], child.children);
      return;
    }
    if (child.type === 'default' || customPageChildren.length === 1) {
      VueUtil.merge(child.model.model, formData);
      return;
    }
    VueUtil.merge(child.model.model, formData[child.name]);
  });
};

const getPageForm = (pageData) => {
  const children = pageData.children;
  const data = {};
  children.forEach((child) => {
    if (child.page) {
      data[child.page] = getPageForm(child);
      return;
    }
    if (child.type === 'default' || children.length === 1) {
      VueUtil.merge(data, child.model.model);
      return;
    }
    data[child.name] = child.model.model;
  });
  return data;
};

const getPageOrDefault = (page) => {
  const customPage = getCustomPage(page_, 'self');
  const data = getPageForm(customPage);
  return data;
};

const doDeleteClick = (flowResolve, flowReject) => {
  const isDeleteByFlow = typeof flowResolve === 'function';
  flowResolve = typeof flowResolve === 'function' ? flowResolve : () => {};
  flowReject = typeof flowReject === 'function' ? flowReject : () => {};

  crudDeleteLoading.value = true;
  const getParam = page_.crudGetDeleteParam_;
  const saveDataTableName = saveTableData.value || "";
  const params = typeof getParam === 'function' ? getParam() : null;

  let crudBeforeDelete = page_.crudBeforeDelete_;
  let crudAfterDelete = page_.crudAfterDelete_;

  crudBeforeDelete = typeof crudBeforeDelete === 'function' ? crudBeforeDelete : (next) => next(true);
  crudAfterDelete = typeof crudAfterDelete === 'function' ? crudAfterDelete : (res, next) => next(res, true);

  crudBeforeDelete((doNext) => {
    if (doNext === false) {
      crudDeleteLoading.value = false;
      flowReject();
      return;
    }
    crudMethod[crudType.value].doDelete(saveDataTableName, params, self.exposed).then((res) => {
      crudDeleteLoading.value = false;
      crudAfterDelete(res, (res, doNext) => {
        if (doNext === false) {
          flowReject();
          return;
        }
        if (res.body.success) {
          !isDeleteByFlow && $notify({
            message: messageutil.get('success.delete'),
            type: 'success',
            position: "top-center"
          });
          crudMethod[crudType.value].afterDelete(res, self.exposed);
          flowResolve();
        } else {
          !isDeleteByFlow && $notify({
            message: messageutil.get('failure.delete'),
            type: 'error',
            position: "top-center"
          });
          flowReject();
        }
      });
    });
  });
};

const deleteClick = () => {
  const params = params.value;
  const id = form.value.id || formResultParam.value.dataId || params.id;
  componentutils.sysConfirm({
    title: messageutil.get('confirm.delete.form.data')
  }, () => {
    doDeleteClick();
  });
};

const saveClick = (cb, flowButtonType) => {
  const executedByFlow = !!flowButtonType;

  crudLoading.value = true;
  const getParam = page_.crudGetSubmitParam_;
  const customParam = typeof getParam === 'function' ? getParam() : null;
  //const saveTableData = saveTableData.value;
  let crudBeforeSubmit = page_.crudBeforeSubmit_;
  let crudAfterSubmit = page_.crudAfterSubmit_;

  crudBeforeSubmit = typeof crudBeforeSubmit === 'function' ? crudBeforeSubmit : (next) => next(true);
  crudAfterSubmit = typeof crudAfterSubmit === 'function' ? crudAfterSubmit : (res, next) => next(true);

  crudBeforeSubmit((doNext) => {
    if (doNext === false) {
      crudLoading.value = false;
      return;
    }

    let validAll = crudMethod['headDetail'].validAll.bind(crudMethod['headDetail']);
    if (flowButtonType === flowButtonsRef.value.ButtonTypes.SAVEDRAFT) {
      validAll = (page, cb) => cb(true);
    }
    validAll(self.exposed, (valid) => {
      if (valid) {
        crudMethod[crudType.value].doSend(saveTableData, customParam, self.exposed).then((res) => {
          crudLoading.value = false;
          crudAfterSubmit(res, () => {
            if (res.body.success) {
              !executedByFlow && $notify({
                message: messageutil.get('success.save'),
                type: 'success',
                position: "top-center"
              });
              crudMethod[crudType.value].afterSave(res, self.exposed);
            } else {
              !executedByFlow && $notify({
                message: messageutil.get('failure.save'),
                type: 'error',
                position: "top-center"
              });
            }
            if (typeof cb === 'function') {
              cb(res.data);
            }
          });
        }, (res) => {
          if (typeof cb === 'function') {
            cb(res.data, "failure");
          }
        });
      } else {
        crudLoading.value = false;
      }
    });
  }, {
    flowType: flowButtonType
  });
};

const updateClick = (cb, flowButtonType) => {
  const executedByFlow = !!flowButtonType;

  crudLoading.value = true;
  const getParam = page_.crudGetSubmitParam_;
  const customParam = typeof getParam === 'function' ? getParam() : null;
  const saveTableData = saveTableData.value;
  let crudBeforeSubmit = page_.crudBeforeSubmit_;
  let crudAfterSubmit = page_.crudAfterSubmit_;

  crudBeforeSubmit = typeof crudBeforeSubmit === 'function' ? crudBeforeSubmit : (next) => next(true);
  crudAfterSubmit = typeof crudAfterSubmit === 'function' ? crudAfterSubmit : (res, next) => next(true);

  crudBeforeSubmit((doNext) => {
    if (doNext === false) {
      crudLoading.value = false;
      return;
    }

    let validAll = crudMethod['headDetail'].validAll.bind(crudMethod['headDetail']);
    const buttonTypes = flowButtonsRef.value.ButtonTypes;
    if (flowButtonType === buttonTypes.SAVEDRAFT || flowButtonType === buttonTypes.REJECT || flowButtonType === buttonTypes.REJECTTOPREVIOUS || flowButtonType === buttonTypes.REJECTTOSTART || flowButtonType === buttonTypes.REVOKE) {
      validAll = (page, cb) => cb(true);
    }
    validAll(self.exposed, (valid) => {
      if (valid) {
        crudMethod[crudType.value].doSend(saveTableData, customParam, self).then((res) => {
          crudLoading.value = false;
          crudAfterSubmit(res, () => {
            if (res.body.success) {
              !executedByFlow && $notify({
                message: messageutil.get('success.save'),
                type: 'success',
                position: "top-center"
              });
              crudMethod[crudType.value].afterSave(res, self.exposed);
            } else {
              !executedByFlow && $notify({
                message: messageutil.get('failure.save'),
                type: 'error',
                position: "top-center"
              });
            }
            if (typeof cb === 'function') {
              cb(res.data);
            }
          });
        }, (res) => {
          if (typeof cb === 'function') {
            cb(res.data, "failure");
          }
        });
      } else {
        crudLoading.value = false;
      }
    });
  }, {
    flowType: flowButtonType
  });
};

const validateForm = (i, cb, page) => {
  page = page || getCustomPage(page_, 'self');
  const pageForm = page.children;
  if (i >= pageForm.length) {
    cb(true);
    return;
  }
  const currentForm = pageForm[i++];
  if (currentForm.page) {
    validateForm(0, (valid) => {
      if (valid) {
        validateForm(i, cb, page);
      } else {
        cb(valid);
      }
    }, currentForm);
  } else {
    currentForm.model.validate ? currentForm.model.validate((valid) => {
      if (valid) {
        validateForm(i, cb, page);
      } else {
        cb(valid);
      }
    }) : cb(true);
  }
};

const setSendBody = (body) => {
  if (!body.tableName) {
    delete body.tableName;
    body.columns.dataKey = props.pageId;
  }
  if (props.formParam.isRealField) {
    const newColumns = {};
    Object.assign(newColumns, body.columns.dataValue);
    newColumns.id = body.columns.id;
    body.columns = newColumns;
  }
};

const afterSubmit = () => {
  const doSuccessResult = (res, cb) => {
    if (res.data.success) {
      const id = res.data.data.id;
      form.value.id = id;
    }
    if (typeof cb === 'function') {
      cb(res.data);
    } else if (typeof page_.crudAfterSubmit === 'function') {
      page_.crudAfterSubmit(res.data);
    } else if (res.data.success) {
      showResult(true, {
        id
      });
    } else {
      showResult(false);
    }
  };

  const doFailResult = (res) => {
    if (typeof cb === 'function') {
      cb(res);
    } else {
      showResult(false);
    }
  };

  return {
    doSuccessResult,
    doFailResult
  };
};

const doSend = (url, body, cb) => {
  setSendBody(body);
  if (window.formParam && typeof window.formParam.publicSend === "function") {
    window.formParam.publicSend(contextPath + url, body, self.exposed).then((res) => {
      crudLoading.value = false;
      afterSubmit().doSuccessResult(res, cb);
    }, afterSubmit().doFailResult);
  } else {
    const result = afterSubmit();
    axios.post(url, body).then((res) => {
      crudLoading.value = false;
      result.doSuccessResult(res, cb);
    }, result.doFailResult);
  }
};

//const workflowFormEditableUpdate = (val) => {
//  alowEditableFromWorkflow.value = !val;
//  if (page_.workflowFormEditableUpdate) {
//    page_.workflowFormEditableUpdate(val);
//  }
//};

const showResult = (isSuccess, customParams) => {
  const param = customParams || {};
  Object.assign(formResultParam.value, {
    success: isSuccess,
    title: param.title,
    dataId: param.id,
    pageId: props.pageId,
    activeType: activeType.value,
    readonly: param.readonly
  });
  formResultVisible.value = true;
  setTimeout(() => {
    const resultObj = refs.formSubmitResult;
    if (resultObj) {
      resultObj.showBtnResult = true;
    }
  }, 1000);
};

defineExpose({
  page_,
  saveDataTableName: saveTableData
});
</script>
<template>
  <div class="escort-crud-flow-layout" ref="escortCrudFlowLayout">
    <template v-if="visible">
      <div ref="vuePinButtons" style="height:56px;" v-show="pinButtonsVisible">
        <CrudFormButton id="crudFlowButtonArea" class="row-form-btn" ref="crudFlowButtonAreaRef" :btn-save-visible="true|| btnSaveVisble()" :btn-update-visible="true||btnUpdateVisble()" :btn-delete-visible="true||btnDeleteVisble()" :btn-preview-pdf-visible="true||btnPreviewPdfVisible()" :btn-export-pdf-visible="btnExportPdfVisible()" :btn-export-excel-visible="btnExportExcelVisible()" :btn-print-visible="btnPrintVisible()" :report-params="reportParams" :btn-setting="btnSetting" :btn-flod-limit="buttonFlodLimit" @saveClick="saveClick" @updateClick="saveClick" @deleteClick="deleteClick">
          <FlowButtons id="flowButtons" ref="flowButtonsRef" :page-code="workflowPageCode" :business-id="workflowBusinessId" v-model:task-id="workflowTaskId" v-model:inst-id="workflowInstId" :business-data="workflowBusinessData" v-model:curr-node-id="workflowCurrNodeId" @form-editable-update="workflowFormEditableUpdate">
          </FlowButtons>

          <!--  <FlowButtons id="flowButtons" ref="flowButtonsRef" :page-code="workflowPageCode" v-model:task-id="taskId"
                      v-model:business-id="businessId" v-model:inst-id="instId" :business-data="workflowBusinessData"
                      @form-editable-update="workflowFormEditableUpdate" :before-method="flowBeforeMethod" :process-instance-end="flowProcessInstanceEnd"
                      :before-message-box="flowBeforeMessageBox" :button-fold-limit="buttonFlodLimit"
                      :next-method="flowNextMethod" :after-method="flowAfterMethod" :fail-method="flowFailMethod" v-model:curr-node-id="currNodeId">
                	  </FlowButtons>-->
        </CrudFormButton>
      </div>
      <VueDialog v-model="formResultVisible" show-close ref="resultDialog">
        <component :is="crudResultComponent" ref="formSubmitResult" :param="formResultParam" :visible="formResultVisible" @back="submitResultBack">
        </component>
      </VueDialog>
      <slot v-bind="{disabled: !getFormEditable() && customFormEditable,formData: form.data}"></slot>
    </template>
  </div>
</template>