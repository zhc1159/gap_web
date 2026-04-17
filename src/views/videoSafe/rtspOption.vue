<template>
  <div class="page-container rtsp-option-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="header-title">{{ $t('videoSafe.rtspOption.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAddServerIP">
          <el-icon><Plus /></el-icon>
          {{ $t('videoSafe.rtspOption.addServerIP') }}
        </el-button>
        <el-button type="success" class="btn-save" :loading="saving" @click="handleSave">
          <el-icon><Check /></el-icon>
          {{ $t('videoSafe.rtspOption.save') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('videoSafe.rtspOption.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 树形表格 -->
          <el-table
            :data="treeData"
            v-loading="loading"
            row-key="id"
            border
            class="option-table"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            default-expand-all
          >
            <!-- 服务器IP / 用户名 -->
            <el-table-column :label="$t('videoSafe.rtspOption.serverInfo')" min-width="250">
              <template #default="{ row }">
                <div class="server-info-cell">
                  <el-icon v-if="row.type === 'server'" class="server-icon">
                    <Monitor />
                  </el-icon>
                  <el-icon v-else class="user-icon">
                    <UserFilled />
                  </el-icon>
                  <span class="ip-text">{{ row.serverIp }}</span>
                  <el-tag v-if="row.type === 'user'" type="info" size="small" class="user-badge">
                    {{ row.userName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 用户数量 -->
            <el-table-column :label="$t('videoSafe.rtspOption.userCount')" min-width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.type === 'server'" class="user-count">
                  {{ row.children?.length || 0 }}
                </span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 密码 -->
            <el-table-column :label="$t('videoSafe.rtspOption.password')" min-width="150">
              <template #default="{ row }">
                <span v-if="row.type === 'user'" class="password-text">••••••••</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('videoSafe.rtspOption.actions')" min-width="200" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'server'" class="action-btns">
                  <el-button type="primary" size="small" @click="handleAddUser(row.serverIp)">
                    <el-icon><UserFilled /></el-icon>
                    {{ $t('videoSafe.rtspOption.addUser') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleRemoveServer(row.serverIp)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('videoSafe.rtspOption.delete') }}
                  </el-button>
                </div>
                <div v-else class="action-btns">
                  <el-button type="danger" size="small" @click="handleRemoveUser(row.serverIp, row.userName)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('videoSafe.rtspOption.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <el-empty v-if="treeData.length === 0 && !loading" :description="$t('videoSafe.rtspOption.emptyData')" />
        </div>
      </div>
    </div>

    <!-- 添加服务器IP对话框 -->
    <el-dialog
      v-model="serverIPFormVisible"
      :title="$t('videoSafe.rtspOption.addServerIPDialog')"
      width="450px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="serverIPFormRef"
        :model="serverIPFormData"
        :rules="serverIPFormRules"
        label-width="100px"
        class="form-content"
      >
        <el-form-item :label="$t('videoSafe.rtspOption.serverIP')" prop="serverIp">
          <el-input
            v-model="serverIPFormData.serverIp"
            :placeholder="$t('videoSafe.rtspOption.serverIPPlaceholder')"
          >
            <template #prefix>
              <el-icon><Monitor /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleServerIPClose">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleServerIPSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加用户凭据对话框 -->
    <el-dialog
      v-model="userCredentialFormVisible"
      :title="$t('videoSafe.rtspOption.addUserDialog', { ip: currentServerIP })"
      width="450px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userCredentialFormRef"
        :model="userCredentialFormData"
        :rules="userCredentialFormRules"
        label-width="100px"
        class="form-content"
      >
        <el-form-item :label="$t('videoSafe.rtspOption.username')" prop="name">
          <el-input
            v-model="userCredentialFormData.name"
            :placeholder="$t('videoSafe.rtspOption.usernamePlaceholder')"
            maxlength="30"
            @input="handleNameInput"
          >
            <template #prefix>
              <el-icon><UserFilled /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('videoSafe.rtspOption.password')" prop="pwd">
          <el-input
            v-model="userCredentialFormData.pwd"
            type="password"
            show-password
            :placeholder="$t('videoSafe.rtspOption.passwordPlaceholder')"
            maxlength="30"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleUserCredentialClose">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleUserCredentialSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import { Setting, Plus, Check, InfoFilled, Monitor, UserFilled, Delete, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface UserCredential {
  name: string
  pwd: string
}

interface ServerConfig {
  serverIp: string
  user: UserCredential[]
}

interface TreeTableRow {
  id: string
  type: 'server' | 'user'
  serverIp: string
  userName?: string
  password?: string
  children?: TreeTableRow[]
}

// 状态
const loading = ref(false)
const saving = ref(false)

// 所有数据
const allData = ref<ServerConfig[]>([])

// 计算树形表格数据
const treeData = computed<TreeTableRow[]>(() => {
  return allData.value.map((server, sIndex) => {
    const serverRow: TreeTableRow = {
      id: `server-${sIndex}`,
      type: 'server',
      serverIp: server.serverIp,
      children: server.user.map((user, uIndex) => ({
        id: `server-${sIndex}-user-${uIndex}`,
        type: 'user' as const,
        serverIp: server.serverIp,
        userName: user.name,
        password: user.pwd
      }))
    }
    return serverRow
  })
})

// 对话框状态
const serverIPFormVisible = ref(false)
const userCredentialFormVisible = ref(false)
const currentServerIP = ref('')

// 服务器IP表单
const serverIPFormRef = ref<FormInstance>()
const serverIPFormData = reactive({ serverIp: '' })

// IPv4验证
const isValidIPv4 = (ip: string) => {
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(ip)
}

const serverIPFormRules: FormRules = {
  serverIp: [
    { required: true, message: t('videoSafe.rtspOption.serverIPRequired'), trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (!isValidIPv4(value)) {
          callback(new Error(t('videoSafe.rtspOption.serverIPInvalid')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 用户凭据表单
const userCredentialFormRef = ref<FormInstance>()
const userCredentialFormData = reactive({ serverIp: '', name: '', pwd: '' })

const userCredentialFormRules: FormRules = {
  name: [
    { required: true, message: t('videoSafe.rtspOption.usernameRequired'), trigger: 'blur' },
    { min: 1, max: 30, message: t('videoSafe.rtspOption.usernameLength'), trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: t('videoSafe.rtspOption.passwordRequired'), trigger: 'blur' },
    { min: 1, max: 30, message: t('videoSafe.rtspOption.passwordLength'), trigger: 'blur' }
  ]
}

// 模拟数据
const mockData = ref<ServerConfig[]>([
  {
    serverIp: '192.168.1.100',
    user: [
      { name: 'admin', pwd: 'admin123' },
      { name: 'operator', pwd: 'op456' }
    ]
  },
  {
    serverIp: '10.0.0.50',
    user: [
      { name: 'root', pwd: 'root789' }
    ]
  },
  {
    serverIp: '172.16.0.100',
    user: []
  }
])

// 数据操作方法
const addServerIP = (ip: string) => {
  if (allData.value.some(s => s.serverIp === ip)) {
    throw new Error(t('videoSafe.rtspOption.serverIPExists'))
  }
  allData.value.push({
    serverIp: ip,
    user: []
  })
}

const removeServerIP = (ip: string) => {
  const index = allData.value.findIndex(s => s.serverIp === ip)
  if (index > -1) {
    allData.value.splice(index, 1)
  }
}

const addUserCredential = (ip: string, name: string, pwd: string) => {
  const server = allData.value.find(s => s.serverIp === ip)
  if (!server) {
    throw new Error(t('videoSafe.rtspOption.serverNotFound'))
  }
  if (server.user.some(u => u.name === name)) {
    throw new Error(t('videoSafe.rtspOption.usernameExists'))
  }
  server.user.push({ name, pwd })
}

const removeUserCredential = (ip: string, name: string) => {
  const server = allData.value.find(s => s.serverIp === ip)
  if (server) {
    const index = server.user.findIndex(u => u.name === name)
    if (index > -1) {
      server.user.splice(index, 1)
    }
  }
}

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    allData.value = JSON.parse(JSON.stringify(mockData.value))
    loading.value = false
  }, 500)
}

// 添加服务器IP
const handleAddServerIP = () => {
  serverIPFormVisible.value = true
}

const handleServerIPSubmit = async () => {
  try {
    await serverIPFormRef.value?.validate()
    addServerIP(serverIPFormData.serverIp)
    serverIPFormVisible.value = false
    serverIPFormData.serverIp = ''
    ElNotification({
      title: t('common.success'),
      message: t('videoSafe.rtspOption.addServerIPSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (error: any) {
    if (error.message) {
      ElNotification({
        title: t('common.failed'),
        message: error.message,
        type: 'error',
        customClass: 'notification-error'
      })
    }
  }
}

const handleServerIPClose = () => {
  serverIPFormRef.value?.resetFields()
  serverIPFormVisible.value = false
}

// 删除服务器IP
const handleRemoveServer = (ip: string) => {
  removeServerIP(ip)
  ElNotification({
    title: t('common.success'),
    message: t('videoSafe.rtspOption.deleteServerIPSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 添加用户凭据
const handleAddUser = (ip: string) => {
  currentServerIP.value = ip
  userCredentialFormVisible.value = true
}

const handleUserCredentialSubmit = async () => {
  try {
    await userCredentialFormRef.value?.validate()
    addUserCredential(
      currentServerIP.value,
      userCredentialFormData.name,
      userCredentialFormData.pwd
    )
    userCredentialFormVisible.value = false
    userCredentialFormData.name = ''
    userCredentialFormData.pwd = ''
    ElNotification({
      title: t('common.success'),
      message: t('videoSafe.rtspOption.addUserSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (error: any) {
    if (error.message) {
      ElNotification({
        title: t('common.failed'),
        message: error.message,
        type: 'error',
        customClass: 'notification-error'
      })
    }
  }
}

const handleNameInput = (value: string) => {
  userCredentialFormData.name = value.replace(/[^0-9a-zA-Z_]/g, '')
}

const handleUserCredentialClose = () => {
  userCredentialFormRef.value?.resetFields()
  userCredentialFormVisible.value = false
}

// 删除用户凭据
const handleRemoveUser = (ip: string, name: string) => {
  removeUserCredential(ip, name as string)
  ElNotification({
    title: t('common.success'),
    message: t('videoSafe.rtspOption.deleteUserSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 保存所有数据
const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElNotification({
      title: t('common.success'),
      message: t('videoSafe.rtspOption.saveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  }, 1000)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.rtsp-option-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.02) 0%, rgba(144, 147, 153, 0.02) 100%);
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

.header-right {
  display: flex;
  gap: 12px;
}

.btn-add,
.btn-save {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover,
.btn-save:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(144, 147, 153, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #67C23A;
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
  border: 1px solid rgba(103, 194, 58, 0.08);
}

.card-content {
  padding: 20px;
  min-height: 300px;
}

/* 表格样式 */
.option-table {
  width: 100%;
}

.option-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.option-table :deep(.el-table td.el-table__cell) {
  padding: 12px;
}

.option-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
}

.option-table :deep(.el-table__row--level-1) {
  background: rgba(103, 194, 58, 0.02);
}

/* 服务器信息单元格 */
.server-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.server-icon {
  color: #67C23A;
  font-size: 18px;
}

.user-icon {
  color: var(--el-text-color-placeholder);
  font-size: 16px;
}

.ip-text {
  font-family: 'Courier New', monospace;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.user-badge {
  margin-left: 8px;
}

/* 用户数量 */
.user-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: linear-gradient(135deg, #67C23A 0%, #95d475 100%);
  color: white;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
}

/* 密码文本 */
.password-text {
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--el-text-color-placeholder);
  letter-spacing: 2px;
}

.empty-text {
  color: #c0c4cc;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(103, 194, 58, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(103, 194, 58, 0.1);
  padding: 16px 20px;
}

.form-content {
  padding: 10px 20px 0;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
