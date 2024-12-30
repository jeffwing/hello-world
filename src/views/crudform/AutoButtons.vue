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

const props = defineProps({
  parent: Object,
});

const {
  t
} = useI18n();

const getBtn = (item) => ({
  component: 'vue-button',
  attrs: {
    ...item.property,
    text: t(item.text),
  },
  on: item.on,
});

const toCustomButtons = (id, icon, disabled, index, text, visible, iclass, event) => ({
  property: {
    id,
    icon,
    disabled,
  },
  btnIndex: index,
  text,
  visible,
  class: iclass,
  on: event,
  order: index,
});

const items = computed(() => {
  const parent = props.parent;
  return [
    toCustomButtons("btnSave", "vue-icon-save", false, 0, "btn.save", parent.btnSaveVisible, "row-btn-submit", {
      click: parent.saveClick,
    }),
    toCustomButtons("btnUpdate", "vue-icon-edit2", false, 1, "btn.update", parent.btnUpdateVisible, "row-btn-submit", {
      click: parent.updateClick,
    }),
    toCustomButtons("btnDelete", "vue-icon-delete", false, 2, "btn.delete", parent.btnDeleteVisible, "row-btn-delete", {
      click: parent.deleteClick,
    }),
    ...parent.customReportButtons,
  ];
});

const getMenuItem = (vnode) => ({
  component: 'vue-dropdown-item',
  children: [vnode],
});

const btnFlodLimit = computed(() => Math.max(props.parent.btnFlodLimit - 1, 0));

const buttons = computed(() => {
  const result = [];
  for (let i = 0; i < items.value.length; i++) {
    if (!items.value[i] || !items.value[i].visible) {
      continue;
    }
    if (i < btnFlodLimit.value) {
      result.push(getBtn(items.value[i]));
    }
  }
  return result;
});

const dropdownItems = computed(() => {
  const result = [];
  let dropdownBtn = null;
  for (let i = 0; i < items.value.length; i++) {
    if (!items.value[i] || !items.value[i].visible) {
      continue;
    }
    if (i >= btnFlodLimit.value) {
      if (dropdownBtn) {
        result.push(getMenuItem(getBtn(Object.assign({}, items.value[i], {
          props: {
            type: 'text',
          },
        }))));
      } else {
        dropdownBtn = items.value[i];
      }
    }
  }
  return result;
});

const dropdownBtn = computed(() => {
  for (let i = 0; i < items.value.length; i++) {
    if (i >= btnFlodLimit.value && items.value[i]?.visible) {
      return items.value[i];
    }
  }
  return null;
});
</script>

<template>
  <vue-col align="center" class="crud-buttons vue-col" :md="24">
    <component :is="item.component" v-for="(item, index) in items" :key="index" v-bind="item.attrs" v-on="item.on" />
    <vue-dropdown v-if="dropdownBtn" :split-button="true" trigger="click" v-bind="dropdownBtn.attrs" v-on="dropdownBtn.on">
      <span>

        {{ $t(dropdownBtn.text) }}</span>
      <vue-dropdown-menu slot="dropdown">
        <vue-dropdown-item v-for="(item, idx) in dropdownItems" :key="idx">
          <component :is="item.component" v-bind="item.attrs" v-on="item.on" />
        </vue-dropdown-item>
      </vue-dropdown-menu>
    </vue-dropdown>
    <slot></slot>
  </vue-col>
</template>