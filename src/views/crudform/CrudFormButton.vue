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
import AutoButtons from '/src/views/crudform/AutoButtons.vue';
const {
  t
} = useI18n();
const {
  lockScreen
} = useLockScreen();
const autoButtonVisibleCx = ref(true);
const props = defineProps({
  page_: {
    type: Object,
    default: () => ({
      readOnly: false,
    }),
  },
  btnSetting: Object,
  reportParams: Object,
  crudLoading: Boolean,
  crudDeleteLoading: Boolean,
  crudReportLoading: Boolean,
  btnFlodLimit: {
    type: Number,
    default: 0
  },
  btnSaveVisible: {
    type: Boolean,
    default: true
  },
  btnUpdateVisible: {
    type: Boolean,
    default: true
  },
  btnDeleteVisible: {
    type: Boolean,
    default: false
  },
  btnPreviewPdfVisible: {
    type: Boolean,
    default: false
  },
  btnExportPdfVisible: {
    type: Boolean,
    default: false
  },
  btnExportExcelVisible: {
    type: Boolean,
    default: false
  },
  btnPrintVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'previewPdfClick',
  'exportPdfClick',
  'exportExcelClick',
  'printClick',
  'saveClick',
  'updateClick',
  'deleteClick'
]);

//const page_ = inject('page_');

const defaultReportButtons = {
  crudPreviewPdf: {
    property: {
      id: "btnPreviewPdf",
      icon: "vue-icon-desktop",
      disabled: false,
    },
    btnIndex: 1,
    text: "btn.crudPreviewPdf",
    visible: props.btnPreviewPdfVisible,
    class: "row-btn-preview-pdf",
    event: {
      click: () => previewPdfClick()
    }
  },
  crudExportPdf: {
    property: {
      id: "btnExportPdf",
      icon: "vue-icon-download2",
      disabled: false,
    },
    btnIndex: 2,
    text: "btn.crudExportPdf",
    visible: props.btnExportPdfVisible,
    class: "row-btn-export-pdf",
    event: {
      click: () => exportPdfClick()
    }
  },
  crudExportExcel: {
    property: {
      id: "btnExportExcel",
      icon: "vue-icon-download2",
      disabled: false
    },
    btnIndex: 3,
    text: "btn.crudExportExcel",
    visible: props.btnExportExcelVisible,
    class: "row-btn-export-excel",
    event: {
      click: () => exportExcelClick()
    }
  },
  crudPrint: {
    property: {
      id: "btnPrint",
      icon: "vue-icon-print",
      disabled: false
    },
    btnIndex: 4,
    text: "btn.crudPrint",
    visible: props.btnPrintVisible,
    class: "row-btn-print",
    event: {
      click: () => printClick()
    }
  }
};

const customReportButtons = computed(() => {
  const list = [];
  for (const key in props.btnSetting) {
    const itemSetting = props.btnSetting[key];
    const defaultItem = defaultReportButtons[key];
    if (itemSetting === true || itemSetting === false) {
      if (defaultItem) {
        defaultItem.visible = itemSetting;
        list.push(defaultItem);
      }
    } else {
      const tempItem = {
        property: {
          id: itemSetting.key,
          icon: itemSetting.icon,
        },
        visible: itemSetting.visible,
        order: itemSetting.order,
        text: itemSetting.text,
        event: {
          click: () => {
            const funStr = itemSetting.funStr || "function(){ console.log(this); }";
            const pageFun = eval(`props.page_.`);
            if (typeof pageFun === 'function') {
              pageFun();
            } else {
              console.error(`props.page_. is undefined.`);
            }
          }
        }
      };
      list.push(VueUtil.merge({}, defaultItem, tempItem));
    }
  }
  list.sort((a, b) => a.order - b.order);
  return list;
});

onMounted(() => {
  autoButtonVisibleCx.value = true;
});

const saveClick = () => emit('saveClick');
const updateClick = () => emit('updateClick');
const deleteClick = () => emit('deleteClick');

const previewPdfClick = () => {
  if (emit.hasListener('previewPdfClick')) {
    emit('previewPdfClick');
  } else {
    const reportParams = {
      extensions: 'pdf'
    };
    if (props.page_.form.id) {
      reportParams.parameters = {
        dataid: props.page_.form.id
      };
    }
    report.previewReport(props.page_, {
      reportCode: props.reportParams.reportCode
    }, reportParams);
  }
};

const exportPdfClick = () => {
  if (emit.hasListener('exportPdfClick')) {
    emit('exportPdfClick');
  } else {
    const reportParams = {
      extensions: 'pdf'
    };
    if (props.page_.form.id) {
      reportParams.parameters = {
        dataid: props.page_.form.id
      };
    }
    report.exportReport(props.page_, {
      reportCode: props.reportParams.reportCode
    }, reportParams);
  }
};

const exportExcelClick = () => {
  if (emit.hasListener('exportExcelClick')) {
    emit('exportExcelClick');
  } else {
    const reportParams = {
      extensions: 'xlsx'
    };
    if (props.page_.form.id) {
      reportParams.parameters = {
        dataid: props.page_.form.id
      };
    }
    report.exportReport(props.page_, {
      reportCode: props.reportParams.reportCode
    }, reportParams);
  }
};

const printClick = () => {
  if (emit.hasListener('printClick')) {
    emit('printClick');
  } else {
    const reportParams = {
      extensions: 'pdf'
    };
    if (props.page_.form.id) {
      reportParams.parameters = {
        dataid: props.page_.form.id
      };
    }
    report.printReport(props.page_, {
      reportCode: props.reportParams.reportCode
    }, reportParams);
  }
};
</script>

<template>
  <vue-row id="button-area" ref="button-area" class="row-form-btn">
    <auto-buttons :parent="this" v-if="btnFlodLimit > 0">
      <template v-slot:buttons>
        <slot></slot>
      </template>
    </auto-buttons>
    <vue-col v-else align="center" :md="24" class="crud-buttons">
      <vue-button id="btnSave" class="row-btn-submit" icon="vue-icon-save" type="primary" v-if="btnSaveVisible" ref="btnSubmit" @click="saveClick" :loading="crudLoading">

        {{ $t('btn.save') }}
      </vue-button>
      <vue-button id="btnUpdate" class="row-btn-submit" icon="vue-icon-edit2" type="primary" v-if="btnUpdateVisible" ref="btnUpdate" @click="updateClick" :loading="crudLoading">

        {{ $t('btn.update') }}
      </vue-button>
      <vue-button id="btnDelete" class="row-btn-delete" icon="vue-icon-delete" type="danger" v-if="btnDeleteVisible" ref="btnDelete" @click="deleteClick" :loading="crudDeleteLoading">

        {{ $t('btn.delete') }}
      </vue-button>
      <!--
      <vue-button
        v-for="button in customReportButtons"
        v-if="button.visible"
        :key="button.id"
        :loading="crudReportLoading"
        :class="button.class"
        v-bind="button.property"
        v-on="button.event"
      >
        {{ $t(button.text) }}
      </vue-button>
-->
      <slot></slot>
    </vue-col>
  </vue-row>
</template>