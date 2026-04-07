<template>
  <div class="page-container ftp-security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_ftp.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_ftp.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_ftp.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="ftp-table">
            <!-- 状态 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('securityPolicy.s_ftp.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- 用户过滤 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.userFilter')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.userFilterMode === 'ALLOW' ? 'success' : 'danger'" size="small">
                  {{ row.userFilterMode === 'ALLOW' ? $t('securityPolicy.s_ftp.allowMode') : $t('securityPolicy.s_ftp.denyMode') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 上传权限 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.uploadPermission')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.uploadEnabled ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.uploadEnabled ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 下载权限 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.downloadPermission')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.downloadEnabled ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.downloadEnabled ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 杀毒扫描 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.virusScan')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.uploadVirusScan || row.downloadVirusScan" type="warning" size="small">
                  {{ $t('common.enabled') }}
                </el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('securityPolicy.s_ftp.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('securityPolicy.s_ftp.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('securityPolicy.s_ftp.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤引导对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('securityPolicy.s_ftp.addDialog') : $t('securityPolicy.s_ftp.editDialog')"
      width="800px"
      class="wizard-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <div class="wizard-steps">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step :title="$t('securityPolicy.s_ftp.stepBasic')" :icon="Setting" />
          <el-step :title="$t('securityPolicy.s_ftp.stepSignal')" :icon="Connection" />
          <el-step :title="$t('securityPolicy.s_ftp.stepFilter')" :icon="Filter" />
          <el-step :title="$t('securityPolicy.s_ftp.stepTransfer')" :icon="Upload" />
        </el-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="wizard-content">
        <!-- 步骤1: 基础配置 -->
        <div v-show="currentStep === 0" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Setting /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_ftp.stepBasicTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_ftp.stepBasicDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_ftp.policySwitch')">
              <el-switch v-model="formData.enabled" />
              <span class="form-hint">{{ formData.enabled ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_ftp.userGroup')" required>
              <el-select v-model="formData.userGroup" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
                <el-option label="ftp_group_1" value="ftp_group_1" />
                <el-option label="ftp_group_2" value="ftp_group_2" />
                <el-option label="admin_group" value="admin_group" />
                <el-option label="user_group" value="user_group" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><User /></el-icon>
              {{ $t('securityPolicy.s_ftp.ftpUser') }}
            </el-divider>

            <el-form-item :label="$t('securityPolicy.s_ftp.userFilterMode')">
              <el-radio-group v-model="formData.userFilterMode" class="radio-group">
                <el-radio value="ALLOW">
                  <el-tag type="success" size="small">{{ $t('securityPolicy.s_ftp.allowMode') }}</el-tag>
                </el-radio>
                <el-radio value="DENY">
                  <el-tag type="danger" size="small">{{ $t('securityPolicy.s_ftp.denyMode') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_ftp.userList')">
              <div class="tag-input-wrapper">
                <div class="tag-list">
                  <el-tag
                    v-for="user in formData.userList"
                    :key="user"
                    closable
                    size="small"
                    @close="removeUser(user)"
                  >
                    {{ user }}
                  </el-tag>
                  <span v-if="formData.userList.length === 0" class="empty-hint">{{ $t('securityPolicy.s_ftp.noUsers') }}</span>
                </div>
                <el-input
                  v-model="newUser"
                  :placeholder="$t('securityPolicy.s_ftp.userPlaceholder')"
                  @keyup.enter="addUser"
                >
                  <template #append>
                    <el-button @click="addUser">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 信令过滤 -->
        <div v-show="currentStep === 1" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Connection /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_ftp.stepSignalTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_ftp.stepSignalDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_ftp.blockedSignals')">
              <el-select v-model="formData.blockedSignals" multiple style="width: 100%" :placeholder="$t('common.pleaseSelect')">
                <el-option label="DELE - 删除文件" value="DELE" />
                <el-option label="MKD - 创建目录" value="MKD" />
                <el-option label="RMD - 删除目录" value="RMD" />
                <el-option label="RNFR - 重命名源" value="RNFR" />
                <el-option label="RNTO - 重命名目标" value="RNTO" />
                <el-option label="STOR - 存储文件" value="STOR" />
                <el-option label="RETR - 获取文件" value="RETR" />
                <el-option label="LIST - 列出文件" value="LIST" />
                <el-option label="NLST - 简要列表" value="NLST" />
              </el-select>
            </el-form-item>

            <div class="signal-grid">
              <div
                v-for="signal in signalOptions"
                :key="signal.value"
                class="signal-card"
                :class="{ active: formData.blockedSignals.includes(signal.value) }"
                @click="toggleSignal(signal.value)"
              >
                <el-icon class="signal-icon"><WarningFilled v-if="formData.blockedSignals.includes(signal.value)" /><CircleCheck v-else /></el-icon>
                <div class="signal-info">
                  <span class="signal-code">{{ signal.value }}</span>
                  <span class="signal-desc">{{ signal.label }}</span>
                </div>
              </div>
            </div>
          </el-form>
        </div>

        <!-- 步骤3: 文件过滤 -->
        <div v-show="currentStep === 2" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Filter /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_ftp.stepFilterTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_ftp.stepFilterDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_ftp.filenameKeywords')">
              <div class="tag-input-wrapper">
                <div class="tag-list">
                  <el-tag
                    v-for="keyword in formData.filenameKeywords"
                    :key="keyword"
                    type="warning"
                    closable
                    size="small"
                    @close="removeFilenameKeyword(keyword)"
                  >
                    {{ keyword }}
                  </el-tag>
                  <span v-if="formData.filenameKeywords.length === 0" class="empty-hint">{{ $t('securityPolicy.s_ftp.noKeywords') }}</span>
                </div>
                <el-input
                  v-model="newFilenameKeyword"
                  :placeholder="$t('securityPolicy.s_ftp.keywordPlaceholder')"
                  @keyup.enter="addFilenameKeyword"
                >
                  <template #append>
                    <el-button @click="addFilenameKeyword">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_ftp.contentKeywords')">
              <div class="tag-input-wrapper">
                <div class="tag-list">
                  <el-tag
                    v-for="keyword in formData.contentKeywords"
                    :key="keyword"
                    type="danger"
                    closable
                    size="small"
                    @close="removeContentKeyword(keyword)"
                  >
                    {{ keyword }}
                  </el-tag>
                  <span v-if="formData.contentKeywords.length === 0" class="empty-hint">{{ $t('securityPolicy.s_ftp.noKeywords') }}</span>
                </div>
                <el-input
                  v-model="newContentKeyword"
                  :placeholder="$t('securityPolicy.s_ftp.contentPlaceholder')"
                  @keyup.enter="addContentKeyword"
                >
                  <template #append>
                    <el-button @click="addContentKeyword">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤4: 传输控制 -->
        <div v-show="currentStep === 3" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Upload /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_ftp.stepTransferTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_ftp.stepTransferDesc') }}</div>

          <div class="transfer-grid">
            <!-- 上传配置 -->
            <div class="transfer-card upload-card">
              <div class="transfer-header">
                <el-icon><Upload /></el-icon>
                <span>{{ $t('securityPolicy.s_ftp.uploadConfig') }}</span>
              </div>
              <el-form :model="formData" label-width="120px" class="transfer-form">
                <el-form-item :label="$t('securityPolicy.s_ftp.uploadPermission')">
                  <el-switch v-model="formData.uploadEnabled" />
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.maxSize')">
                  <el-input-number v-model="formData.uploadMaxSize" :min="1" :max="2048" style="width: 100px" />
                  <span class="unit-text">MB</span>
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.blockedTypes')">
                  <el-select v-model="formData.uploadBlockedTypes" multiple style="width: 100%" size="small">
                    <el-option label=".exe" value=".exe" />
                    <el-option label=".bat" value=".bat" />
                    <el-option label=".cmd" value=".cmd" />
                    <el-option label=".sh" value=".sh" />
                    <el-option label=".vbs" value=".vbs" />
                    <el-option label=".js" value=".js" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.virusScan')">
                  <el-switch v-model="formData.uploadVirusScan" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 下载配置 -->
            <div class="transfer-card download-card">
              <div class="transfer-header">
                <el-icon><Download /></el-icon>
                <span>{{ $t('securityPolicy.s_ftp.downloadConfig') }}</span>
              </div>
              <el-form :model="formData" label-width="120px" class="transfer-form">
                <el-form-item :label="$t('securityPolicy.s_ftp.downloadPermission')">
                  <el-switch v-model="formData.downloadEnabled" />
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.maxSize')">
                  <el-input-number v-model="formData.downloadMaxSize" :min="1" :max="2048" style="width: 100px" />
                  <span class="unit-text">MB</span>
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.blockedTypes')">
                  <el-select v-model="formData.downloadBlockedTypes" multiple style="width: 100%" size="small">
                    <el-option label=".exe" value=".exe" />
                    <el-option label=".bat" value=".bat" />
                    <el-option label=".cmd" value=".cmd" />
                    <el-option label=".sh" value=".sh" />
                    <el-option label=".vbs" value=".vbs" />
                    <el-option label=".js" value=".js" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('securityPolicy.s_ftp.virusScan')">
                  <el-switch v-model="formData.downloadVirusScan" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="wizard-footer">
          <el-button v-if="currentStep > 0" @click="prevStep">
            <el-icon><ArrowLeft /></el-icon>
            {{ $t('securityPolicy.s_ftp.prevStep') }}
          </el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
            {{ $t('securityPolicy.s_ftp.nextStep') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-if="currentStep === 3" type="success" :loading="saving" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            {{ $t('securityPolicy.s_ftp.complete') }}
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
import {
  FolderOpened, Plus, InfoFilled, Edit, Delete, Setting,
  User, Connection, Filter, Upload, Download, ArrowLeft, ArrowRight, Check,
  WarningFilled, CircleCheck
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface FtpSecurityConfig {
  id: string
  userGroup: string
  enabled: boolean
  userFilterMode: 'ALLOW' | 'DENY'
  userList: string[]
  blockedSignals: string[]
  filenameKeywords: string[]
  contentKeywords: string[]
  uploadEnabled: boolean
  uploadBlockedTypes: string[]
  uploadMaxSize: number
  uploadVirusScan: boolean
  downloadEnabled: boolean
  downloadBlockedTypes: string[]
  downloadMaxSize: number
  downloadVirusScan: boolean
}

// 信令选项
const signalOptions = [
  { value: 'DELE', label: '删除文件' },
  { value: 'MKD', label: '创建目录' },
  { value: 'RMD', label: '删除目录' },
  { value: 'RNFR', label: '重命名源' },
  { value: 'RNTO', label: '重命名目标' },
  { value: 'STOR', label: '存储文件' },
  { value: 'RETR', label: '获取文件' },
  { value: 'LIST', label: '列出文件' }
]

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentStep = ref(0)

const newUser = ref('')
const newFilenameKeyword = ref('')
const newContentKeyword = ref('')

// 模拟数据
const mockData = ref<FtpSecurityConfig[]>([
  {
    id: '1',
    userGroup: 'ftp_group_1',
    enabled: true,
    userFilterMode: 'ALLOW',
    userList: ['admin', 'user1', 'user2'],
    blockedSignals: ['DELE', 'RMD'],
    filenameKeywords: ['password', 'secret'],
    contentKeywords: ['confidential'],
    uploadEnabled: true,
    uploadBlockedTypes: ['.exe', '.bat', '.sh'],
    uploadMaxSize: 100,
    uploadVirusScan: true,
    downloadEnabled: true,
    downloadBlockedTypes: ['.exe'],
    downloadMaxSize: 200,
    downloadVirusScan: true
  },
  {
    id: '2',
    userGroup: 'admin_group',
    enabled: true,
    userFilterMode: 'DENY',
    userList: ['guest', 'anonymous'],
    blockedSignals: [],
    filenameKeywords: [],
    contentKeywords: [],
    uploadEnabled: true,
    uploadBlockedTypes: ['.vbs', '.js'],
    uploadMaxSize: 500,
    uploadVirusScan: false,
    downloadEnabled: true,
    downloadBlockedTypes: [],
    downloadMaxSize: 500,
    downloadVirusScan: false
  },
  {
    id: '3',
    userGroup: 'user_group',
    enabled: false,
    userFilterMode: 'ALLOW',
    userList: ['test_user'],
    blockedSignals: ['DELE', 'MKD', 'RMD', 'RNFR', 'RNTO'],
    filenameKeywords: ['temp', 'tmp'],
    contentKeywords: [],
    uploadEnabled: false,
    uploadBlockedTypes: ['.exe', '.bat', '.cmd', '.sh', '.vbs'],
    uploadMaxSize: 50,
    uploadVirusScan: true,
    downloadEnabled: true,
    downloadBlockedTypes: ['.exe', '.bat'],
    downloadMaxSize: 100,
    downloadVirusScan: true
  }
])

const tableData = ref<FtpSecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<FtpSecurityConfig>({
  id: '',
  userGroup: '',
  enabled: true,
  userFilterMode: 'ALLOW',
  userList: [],
  blockedSignals: [],
  filenameKeywords: [],
  contentKeywords: [],
  uploadEnabled: true,
  uploadBlockedTypes: [],
  uploadMaxSize: 100,
  uploadVirusScan: false,
  downloadEnabled: true,
  downloadBlockedTypes: [],
  downloadMaxSize: 100,
  downloadVirusScan: false
})

// 方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const handleToggle = (row: FtpSecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('securityPolicy.s_ftp.enableSuccess') : t('securityPolicy.s_ftp.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    userGroup: '',
    enabled: true,
    userFilterMode: 'ALLOW',
    userList: [],
    blockedSignals: [],
    filenameKeywords: [],
    contentKeywords: [],
    uploadEnabled: true,
    uploadBlockedTypes: [],
    uploadMaxSize: 100,
    uploadVirusScan: false,
    downloadEnabled: true,
    downloadBlockedTypes: [],
    downloadMaxSize: 100,
    downloadVirusScan: false
  })
  newUser.value = ''
  newFilenameKeyword.value = ''
  newContentKeyword.value = ''
  currentStep.value = 0
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: FtpSecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    userList: [...row.userList],
    blockedSignals: [...row.blockedSignals],
    filenameKeywords: [...row.filenameKeywords],
    contentKeywords: [...row.contentKeywords],
    uploadBlockedTypes: [...row.uploadBlockedTypes],
    downloadBlockedTypes: [...row.downloadBlockedTypes]
  })
  newUser.value = ''
  newFilenameKeyword.value = ''
  newContentKeyword.value = ''
  currentStep.value = 0
  formVisible.value = true
}

const handleDelete = async (row: FtpSecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_ftp.deleteConfirm', { name: row.userGroup }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_ftp.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

// 步骤导航
const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++
}

const handleSubmit = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    formVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: formMode.value === 'add' ? t('securityPolicy.s_ftp.addSuccess') : t('securityPolicy.s_ftp.editSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
    fetchList()
  }, 1000)
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

// 信令切换
const toggleSignal = (signal: string) => {
  const index = formData.blockedSignals.indexOf(signal)
  if (index > -1) {
    formData.blockedSignals.splice(index, 1)
  } else {
    formData.blockedSignals.push(signal)
  }
}

// 用户列表操作
const addUser = () => {
  const user = newUser.value.trim()
  if (user && !formData.userList.includes(user)) {
    formData.userList.push(user)
    newUser.value = ''
  }
}

const removeUser = (user: string) => {
  const index = formData.userList.indexOf(user)
  if (index > -1) formData.userList.splice(index, 1)
}

// 文件名关键词操作
const addFilenameKeyword = () => {
  const keyword = newFilenameKeyword.value.trim()
  if (keyword && !formData.filenameKeywords.includes(keyword)) {
    formData.filenameKeywords.push(keyword)
    newFilenameKeyword.value = ''
  }
}

const removeFilenameKeyword = (keyword: string) => {
  const index = formData.filenameKeywords.indexOf(keyword)
  if (index > -1) formData.filenameKeywords.splice(index, 1)
}

// 内容关键词操作
const addContentKeyword = () => {
  const keyword = newContentKeyword.value.trim()
  if (keyword && !formData.contentKeywords.includes(keyword)) {
    formData.contentKeywords.push(keyword)
    newContentKeyword.value = ''
  }
}

const removeContentKeyword = (keyword: string) => {
  const index = formData.contentKeywords.indexOf(keyword)
  if (index > -1) formData.contentKeywords.splice(index, 1)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.ftp-security-page {
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  color: white;
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
  color: #606266;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.ftp-table {
  width: 100%;
}

.ftp-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.ftp-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.ftp-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 空文本 */
.empty-text {
  color: #c0c4cc;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 步骤引导对话框 */
.wizard-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.wizard-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.wizard-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

/* 步骤条 */
.wizard-steps {
  padding: 24px 40px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.wizard-steps :deep(.el-step__title) {
  font-size: 13px;
}

.wizard-steps :deep(.el-step__icon) {
  width: 32px;
  height: 32px;
}

/* 步骤内容 */
.wizard-content {
  padding: 24px;
  min-height: 400px;
  max-height: 50vh;
  overflow-y: auto;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.step-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.step-desc {
  color: #909399;
  font-size: 13px;
  margin-bottom: 24px;
  padding-left: 42px;
}

.step-form {
  padding: 16px 20px;
  background: rgba(64, 158, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.06);
}

.form-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

/* 单选按钮组 */
.radio-group :deep(.el-radio) {
  margin-right: 20px;
}

/* 标签输入 */
.tag-input-wrapper {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 32px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

/* 信令网格 */
.signal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.signal-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signal-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.signal-card.active {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1) 0%, rgba(230, 162, 60, 0.1) 100%);
  border-color: #F56C6C;
}

.signal-icon {
  font-size: 18px;
  color: #67C23A;
}

.signal-card.active .signal-icon {
  color: #F56C6C;
}

.signal-info {
  display: flex;
  flex-direction: column;
}

.signal-code {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
}

.signal-desc {
  font-size: 11px;
  color: #909399;
}

/* 传输配置网格 */
.transfer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.transfer-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.upload-card {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(103, 194, 58, 0.02) 100%);
}

.download-card {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(230, 162, 60, 0.02) 100%);
}

.transfer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.upload-card .transfer-header .el-icon {
  color: #67C23A;
}

.download-card .transfer-header .el-icon {
  color: #E6A23C;
}

.transfer-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.transfer-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.unit-text {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}

/* 底部按钮 */
.wizard-footer {
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

  .signal-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .transfer-grid {
    grid-template-columns: 1fr;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
