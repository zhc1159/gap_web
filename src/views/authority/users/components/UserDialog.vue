<template>
  <el-dialog
    v-model="visible"
    :title="dialogType === 'add' ? t('users.add') : t('users.edit')"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="localForm"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item :label="t('users.account')" prop="username">
        <el-input v-model="localForm.username" :placeholder="t('users.accountPlaceholder')" />
      </el-form-item>

      <el-form-item :label="t('users.password')" prop="pwd">
        <el-input
          v-model="localForm.pwd"
          type="password"
          :placeholder="t('users.passwordPlaceholder')"
          show-password
        />
      </el-form-item>

      <el-form-item :label="t('users.confirmPassword')" prop="pwdAgain">
        <el-input
          v-model="localForm.pwdAgain"
          type="password"
          :placeholder="t('users.confirmPasswordPlaceholder')"
          show-password
        />
      </el-form-item>

      <el-form-item :label="t('users.permission')">
        <el-radio-group v-model="localForm.authType">
          <el-radio value="super">{{ t('users.superAdmin') }}</el-radio>
          <el-radio value="deputy">{{ t('users.deputyAdmin') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? t('common.saving') : t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import type { AdminUserForm } from '@/types/users'

const props = defineProps<{
  visible: boolean
  type: 'add' | 'edit'
  form: AdminUserForm | null
  authList: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', form: AdminUserForm): void
}>()
const { t } = useI18n()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const { visible, type, form } = toRefs(props)

const localForm = ref<AdminUserForm>({
  username: '',
  pwd: '',
  pwdAgain: '',
  authType: 'deputy',
  authList: []
})
const dialogType = computed(() => type.value)

const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('users.validation.usernameRequired'), trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: t('users.validation.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('users.validation.passwordMin'), trigger: 'blur' }
  ],
  pwdAgain: [
    { required: true, message: t('users.validation.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== localForm.value.pwd) {
          callback(new Error(t('users.validation.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}))

// Watch visible to reset form when dialog opens
watch(visible, (val) => {
  if (val) {
    if (type.value === 'add') {
      localForm.value = {
        username: '',
        pwd: '',
        pwdAgain: '',
        authType: 'deputy',
        authList: []
      }
    } else if (form.value) {
      localForm.value = { ...form.value, pwd: '', pwdAgain: '' }
    }
  }
})

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      emit('submit', localForm.value)
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  background: $bg-card;
  border: 1px solid $border-color;

  .el-dialog__header {
    color: $text-primary;
  }

  .el-dialog__body {
    color: $text-secondary;
  }
}
</style>
