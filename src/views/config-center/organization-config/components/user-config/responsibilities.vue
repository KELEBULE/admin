<template>
  <NDrawer v-model:show="visible" placement="right" :width="400" class="m-8px rounded-10px">
    <NDrawerContent closable>
      <template #header>{{ $t('page.manage.user.responsibilities') }}</template>
      <NFlex vertical>
        <NForm
          ref="formRef"
          label-placement="left"
          label-width="auto"
          label-align="left"
          require-mark-placement="right-hanging"
          size="small"
          :model="formData"
        >
          <NFormItem :label="$t('page.manage.user.userRole')">
            <NSelect
              v-model:value="formData.roleIds"
              multiple
              filterable
              :options="roleOptions"
              :max-tag-count="3"
              :placeholder="$t('page.manage.user.form.userRole')"
              clearable
            />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.userPosition')">
            <NSelect
              v-model:value="formData.positionIds"
              multiple
              filterable
              :options="positionOptions"
              :max-tag-count="3"
              :placeholder="$t('page.manage.user.form.userPosition')"
              clearable
            />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.userOrgUnits')">
            <NTreeSelect
              v-model:value="formData.orgUnitsIds"
              :options="orgUnitsTree"
              multiple
              checkable
              filterable
              key-field="id"
              label-field="name"
              default-expand-all
              :max-tag-count="7"
              :on-update-value="handleOrgUnitsPrincipalIdsUpdate"
              :placeholder="$t('page.manage.user.form.userOrgUnits')"
              clearable
            />
          </NFormItem>
          <NFormItem :label="$t('page.manage.user.manageOrganization')">
            <NSelect
              v-model:value="formData.orgUnitsPrincipalIds"
              multiple
              filterable
              :max-tag-count="7"
              :options="orgUnitsPrincipalOptions"
              :placeholder="$t('page.manage.user.form.userOrgUnits')"
              clearable
            />
          </NFormItem>
        </NForm>
      </NFlex>
      <template #footer>
        <NSpace reverse>
          <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInst } from 'naive-ui';
import { fetchGetAllPositions } from '@/service/api/manage/position';
import { fetchGetAllRoles } from '@/service/api/manage/role';
import { fetchGetOrgUnitsTree } from '@/service/api/manage/org-units';
import { fetchGetUserResponsibilities, fetchSaveUserResponsibilities } from '@/service/api/manage/user';
import { $t } from '@/locales';
import { extractOptionsFromTree } from './userShared';

interface Props {
  userId: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref<FormInst | null>(null);

type Model = Api.SystemManage.UserResponsibilities;

const formData = ref<Model>({
  userId: props.userId,
  roleIds: [],
  positionIds: [],
  orgUnitsIds: [],
  orgUnitsPrincipalIds: []
});

type OrgUnitsTree = Api.SystemManage.OrgUnitsTree;

const roleOptions = ref<CommonType.Option[]>([]);
const positionOptions = ref<CommonType.Option[]>([]);
const orgUnitsTree = ref<OrgUnitsTree[]>([]);

const orgUnitsPrincipalOptions = computed(() => extractOptionsFromTree(orgUnitsTree.value, formData.value.orgUnitsIds));

async function handleInitOptions() {
  const roleRes = await fetchGetAllRoles();
  if (!roleRes.error && roleRes.data) {
    roleOptions.value = roleRes.data;
  }

  const positionRes = await fetchGetAllPositions();
  if (!positionRes.error && positionRes.data) {
    positionOptions.value = positionRes.data;
  }

  const orgUnitsRes = await fetchGetOrgUnitsTree();
  if (!orgUnitsRes.error && orgUnitsRes.data) {
    orgUnitsTree.value = orgUnitsRes.data;
  }
}

async function handleInitModel() {
  formData.value = {
    userId: props.userId,
    roleIds: [],
    positionIds: [],
    orgUnitsIds: [],
    orgUnitsPrincipalIds: []
  };

  await handleInitOptions();

  await handleUseResponsibilities();
}

async function handleUseResponsibilities() {
  const { error, data } = await fetchGetUserResponsibilities(props.userId);
  if (!error && data) {
    Object.assign(formData.value, data);
  }
}

function handleOrgUnitsPrincipalIdsUpdate(value: string[]) {
  formData.value.orgUnitsPrincipalIds = formData.value.orgUnitsPrincipalIds.filter(id => value.includes(id));
}

async function handleSubmit() {
  const { error, data } = await fetchSaveUserResponsibilities(formData.value);
  if (!error && data) {
    window.$message?.success($t('common.updateSuccess'));
    visible.value = false;
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
  }
});
</script>

<style scoped></style>
