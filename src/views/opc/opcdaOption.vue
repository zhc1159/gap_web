<template>
  <div class="page-container opcda-option-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.opcdaOption.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAddServer">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.opcdaOption.addServer') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.opcdaOption.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="serverList" row-key="server_ip" v-loading="loading" class="opcda-table">
            <!-- 服务器IP -->
            <el-table-column prop="server_ip" :label="$t('opc.opcdaOption.serverIp')" min-width="180">
              <template #default="{ row }">
                <span class="server-ip">{{ row.server_ip }}</span>
              </template>
            </el-table-column>

            <!-- 用户列表 -->
            <el-table-column :label="$t('opc.opcdaOption.userList')" min-width="400">
              <template #default="{ row }">
                <div class="user-list" v-if="row.user && row.user.length">
                  <div v-for="(user, index) in row.user" :key="index" class="user-row">
                    <span class="username">{{ user.name }}</span>
                    <span class="password">******</span>
                    <el-button type="danger" link size="small" @click="removeUser(row, index)">
                      {{ $t('opc.opcdaOption.removeUser') }}
                    </el-button>
                  </div>
                </div>
                <div v-else class="no-user">{{ $t('opc.opcdaOption.noUser') }}</div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.opcdaOption.actions')" min-width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="showAddUserDialog(row)">
                    <el-icon><User /></el-icon>
                    {{ $t('opc.opcdaOption.addUser') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleRemoveServer(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.opcdaOption.removeServer') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 保存按钮 -->
          <div class="save-wrapper">
            <el-button type="primary" size="large" :loading="saving" @click="handleSave">
              <el-icon><Check /></el-icon>
              {{ $t('opc.opcdaOption.saveConfig') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加服务器对话框 -->
    <el-dialog
      v-model="serverDialogVisible"
      :title="$t('opc.opcdaOption.addServerTitle')"
      width="500px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="serverFormRef" :model="serverForm" :rules="serverRules" label-width="100px" class="form-content">
        <el-form-item :label="$t('opc.opcdaOption.serverIp')" prop="server_ip">
          <el-input
            v-model="serverForm.server_ip"
            :placeholder="$t('opc.opcdaOption.serverIpPlaceholder')"
            maxlength="15"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="serverDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleAddServerSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="$t('opc.opcdaOption.addUserTitle')"
      width="500px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px" class="form-content">
        <el-form-item :label="$t('opc.opcdaOption.userName')" prop="name">
          <el-input
            v-model="userForm.name"
            :placeholder="$t('opc.opcdaOption.userNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="$t('opc.opcdaOption.password')" prop="pwd">
          <el-input
            v-model="userForm.pwd"
            type="password"
            show-password
            :placeholder="$t('opc.opcdaOption.passwordPlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleAddUserSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Setting, Plus, InfoFilled, User, Delete, Check } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface OpcdaUser {
  name: string
  pwd: string
}

interface OpcdaServer {
  server_ip: string
  user: OpcdaUser[]
}

// 状态
const serverList = ref<OpcdaServer[]>([])
const loading = ref(false)
const saving = ref(false)
const submitLoading = ref(false)

const serverDialogVisible = ref(false)
const userDialogVisible = ref(false)
const currentServer = ref<OpcdaServer | null>(null)

const serverFormRef = ref<FormInstance>()
const userFormRef = ref<FormInstance>()
const serverForm = reactive({
  server_ip: ''
})
const userForm = reactive({
  name: '',
  pwd: ''
})
const serverRules: FormRules = {
  server_ip: [
    { required: true, message: t('opc.opcdaOption.serverIpRequired'), trigger: 'blur' },
    {
      pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      message: t('opc.opcdaOption.serverIpInvalid'),
      trigger: 'blur'
    }
  ]
}
const userRules: FormRules = {
  name: [
    { required: true, message: t('opc.opcdaOption.userNameRequired'), trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: t('opc.opcdaOption.passwordRequired'), trigger: 'blur' }
  ]
}
const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    serverList.value = [
      {
        server_ip: '192.168.1.100',
        user: [
          { name: 'admin', pwd: 'admin123' },
          { name: 'operator', pwd: 'op456' }
        ]
      },
      {
        server_ip: '192.168.1.101',
        user: [
          { name: 'root', pwd: 'root123' }
        ]
      },
      {
        server_ip: '10.0.0.50',
        user: []
      }
    ]
  } finally {
    loading.value = false
  }
}
const handleAddServer = () => {
  serverForm.server_ip = ''
  serverDialogVisible.value = true
}
const handleAddServerSubmit = async () => {
  const valid = await serverFormRef.value?.validate()
  if (!valid) return
  submitLoading.value = true
  try {
    if (serverList.value.some(s => s.server_ip === serverForm.server_ip)) {
      ElNotification({
        title: t('common.warning'),
        message: t('opc.opcdaOption.serverIpExists'),
        type: 'warning'
      })
      return
    }
    serverList.value.push({
      server_ip: serverForm.server_ip,
      user: []
    })
    ElNotification({
      title: t('common.success'),
      message: t('opc.opcdaOption.addServerSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
    serverDialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}
const showAddUserDialog = (server: OpcdaServer) => {
  currentServer.value = server
  userForm.name = ''
  userForm.pwd = ''
  userDialogVisible.value = true
}
const handleAddUserSubmit = async () => {
  const valid = await userFormRef.value?.validate()
  if (!valid) return
  submitLoading.value = true
  try {
    if (currentServer.value) {
      if (currentServer.value.user.some(u => u.name === userForm.name)) {
        ElNotification({
          title: t('common.warning'),
          message: t('opc.opcdaOption.userExists'),
          type: 'warning'
        })
        return
      }
      currentServer.value.user.push({
        name: userForm.name,
        pwd: userForm.pwd
      })
      ElNotification({
        title: t('common.success'),
        message: t('opc.opcdaOption.addUserSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
      userDialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}
const removeUser = (server: OpcdaServer, index: number) => {
  server.user.splice(index, 1)
  ElNotification({
    title: t('common.success'),
    message: t('opc.opcdaOption.removeUserSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}
const handleRemoveServer = async (server: OpcdaServer) => {
  try {
    await ElMessageBox.confirm(
      t('opc.opcdaOption.removeServerConfirm'),
      t('common.confirm'),
      { type: 'warning' }
    )
    serverList.value = serverList.value.filter(s => s.server_ip !== server.server_ip)
    ElNotification({
      title: t('common.success'),
      message: t('opc.opcdaOption.removeServerSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}
const handleSave = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElNotification({
      title: t('common.success'),
      message: t('opc.opcdaOption.saveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } finally {
    saving.value = false
  }
}
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.opcda-option-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--page-header-gradient);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px var(--page-header-shadow);
}

.header-left {
  display: flex;
  align-items: center;
  color: var(--page-header-text);
}

.header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.opcda-table {
  width: 100%;
}

.opcda-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.opcda-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.opcda-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 服务器IP */
.server-ip {
  font-weight: 600;
  color: #409EFF;
}

/* 用户列表 */
.user-list {
  padding: 8px 0;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 12px;
  border-bottom: 1px dashed rgba(64, 158, 255, 0.15);
  transition: background-color 0.2s;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.username {
  width: 150px;
  font-weight: 500;
  color: #303133;
}

.password {
  width: 100px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
}

.no-user {
  color: #c0c4cc;
  font-style: italic;
  padding: 8px 12px;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 6px;
}

/* 保存按钮 */
.save-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.save-wrapper .el-button--primary {
  background: var(--page-header-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  padding: 12px 40px;
}

.save-wrapper .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 100%;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .action-btns {
    flex-direction: column;
  }

  .user-row {
    flex-wrap: wrap;
  }
}
</style>
