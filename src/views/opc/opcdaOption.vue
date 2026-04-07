<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('opc.opcdaOption.describe') }}</div>
      <div class="page-util">
        <div class="page-title-1">{{ $t('opc.opcdaOption.title') }}</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAddServer">
            <el-icon><Plus /></el-icon>
            {{ $t('opc.opcdaOption.addServer') }}
          </el-button>
        </div>
      </div>
      <div class="page-table">
        <el-table :data="serverList" row-key="server_ip" v-loading="loading" stripe>
          <el-table-column prop="server_ip" :label="$t('opc.opcdaOption.serverIp')" min-width="180" />
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
          <el-table-column :label="$t('opc.opcdaOption.actions')" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" link @click="showAddUserDialog(row)">
                {{ $t('opc.opcdaOption.addUser') }}
              </el-button>
              <el-popconfirm :title="$t('opc.opcdaOption.removeServerConfirm')" @confirm="removeServer(row)">
                <template #reference>
                  <el-button type="danger" size="small" link>
                    {{ $t('opc.opcdaOption.removeServer') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-button" style="justify-content: center; margin-top: 20px;">
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ $t('opc.opcdaOption.saveConfig') }}
        </el-button>
      </div>
    </div>

    <!-- 添加服务器对话框 -->
    <el-dialog
      v-model="serverDialogVisible"
      :title="$t('opc.opcdaOption.addServerTitle')"
      width="500px"
      :close-on-click-modal="false"
      class="dialog-body-custom"
    >
      <el-form ref="serverFormRef" :model="serverForm" :rules="serverRules" label-width="100px" class="form-label">
        <el-form-item :label="$t('opc.opcdaOption.serverIp')" prop="server_ip">
          <el-input v-model="serverForm.server_ip" :placeholder="$t('opc.opcdaOption.serverIpPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serverDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddServerSubmit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="$t('opc.opcdaOption.addUserTitle')"
      width="500px"
      :close-on-click-modal="false"
      class="dialog-body-custom"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px" class="form-label">
        <el-form-item :label="$t('opc.opcdaOption.userName')" prop="name">
          <el-input v-model="userForm.name" :placeholder="$t('opc.opcdaOption.userNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('opc.opcdaOption.password')" prop="pwd">
          <el-input v-model="userForm.pwd" type="password" show-password :placeholder="$t('opc.opcdaOption.passwordPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddUserSubmit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface OpcdaUser {
  name: string
  pwd: string
}

interface OpcdaServer {
  server_ip: string
  user: OpcdaUser[]
}

// 响应式数据
const serverList = ref<OpcdaServer[]>([])
const loading = ref(false)
const saving = ref(false)
const submitLoading = ref(false)

// 对话框控制
const serverDialogVisible = ref(false)
const userDialogVisible = ref(false)
const currentServer = ref<OpcdaServer | null>(null)

// 表单引用
const serverFormRef = ref<FormInstance>()
const userFormRef = ref<FormInstance>()

// 服务器表单
const serverForm = reactive({
  server_ip: ''
})

// 用户表单
const userForm = reactive({
  name: '',
  pwd: ''
})

// 表单验证规则
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // Mock data for demonstration
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

// 添加服务器对话框
const handleAddServer = () => {
  serverForm.server_ip = ''
  serverDialogVisible.value = true
}

// 添加服务器提交
const handleAddServerSubmit = async () => {
  const valid = await serverFormRef.value?.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    // Check if server already exists
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

// 显示添加用户对话框
const showAddUserDialog = (server: OpcdaServer) => {
  currentServer.value = server
  userForm.name = ''
  userForm.pwd = ''
  userDialogVisible.value = true
}

// 添加用户提交
const handleAddUserSubmit = async () => {
  const valid = await userFormRef.value?.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    if (currentServer.value) {
      // Check if user already exists
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

// 移除用户
const removeUser = (server: OpcdaServer, index: number) => {
  server.user.splice(index, 1)
  ElNotification({
    title: t('common.success'),
    message: t('opc.opcdaOption.removeUserSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 移除服务器
const removeServer = (server: OpcdaServer) => {
  serverList.value = serverList.value.filter(s => s.server_ip !== server.server_ip)
  ElNotification({
    title: t('common.success'),
    message: t('opc.opcdaOption.removeServerSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 保存配置
const handleSave = async () => {
  saving.value = true
  try {
    // Mock save
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
.page-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: calc(100vh - 100px);
}

.page-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.page-describe {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-util {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title-1 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.page-title-1::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #409EFF 0%, #67C23A 100%);
  border-radius: 2px;
}

.page-button {
  display: flex;
  gap: 12px;
}

.page-button .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.page-button .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.page-table {
  margin-top: 16px;
}

.user-list {
  padding: 8px 0;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 12px;
  border-bottom: 1px dashed #ebeef5;
  transition: background-color 0.2s;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background-color: #f5f7fa;
}

.username {
  width: 150px;
  font-weight: 500;
  color: #303133;
}

.password {
  width: 100px;
  color: #909399;
  font-family: monospace;
}

.no-user {
  color: #909399;
  font-style: italic;
  padding: 8px 12px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%) !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  padding: 16px 20px;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
}
</style>
