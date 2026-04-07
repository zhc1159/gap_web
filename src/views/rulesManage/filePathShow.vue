<template>
  <div class="page-container file-path-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <span class="header-title">{{ $t('rulesManage.filePathShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('rulesManage.filePathShow.addPath') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('rulesManage.filePathShow.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="path-table">
            <!-- 启停状态 -->
            <el-table-column :label="$t('rulesManage.filePathShow.toggle')" min-width="80" align="center">
              <template #default="{ row }">
                <el-button
                  :type="row.enabled ? 'warning' : 'success'"
                  circle
                  size="small"
                  @click="handleToggle(row)"
                >
                  <el-icon>
                    <VideoPlay v-if="!row.enabled" />
                    <VideoPause v-else />
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>

            <!-- 规则名称 -->
            <el-table-column prop="name" :label="$t('rulesManage.filePathShow.ruleName')" min-width="120">
              <template #default="{ row }">
                <span class="rule-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column prop="status" :label="$t('rulesManage.filePathShow.status')" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'RUNNING' ? 'success' : 'info'" size="small">
                  {{ row.status === 'RUNNING' ? $t('rulesManage.filePathShow.running') : $t('rulesManage.filePathShow.stopped') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 协议 -->
            <el-table-column prop="protocol" :label="$t('rulesManage.filePathShow.protocol')" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.protocol }}</el-tag>
              </template>
            </el-table-column>

            <!-- 方向 -->
            <el-table-column prop="direction" :label="$t('rulesManage.filePathShow.direction')" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getDirectionTagType(row.direction)" size="small">
                  {{ getDirectionText(row.direction) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 内网端 -->
            <el-table-column :label="$t('rulesManage.filePathShow.internalEnd')" min-width="150">
              <template #default="{ row }">
                <span class="endpoint-info">{{ row.internalUrl }}:{{ row.internalPort }}</span>
              </template>
            </el-table-column>

            <!-- 外网端 -->
            <el-table-column :label="$t('rulesManage.filePathShow.externalEnd')" min-width="150">
              <template #default="{ row }">
                <span class="endpoint-info external">{{ row.externalUrl }}:{{ row.externalPort }}</span>
              </template>
            </el-table-column>

            <!-- 病毒扫描 -->
            <el-table-column :label="$t('rulesManage.filePathShow.virusScan')" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.virusScan ? 'success' : 'info'" size="small">
                  {{ row.virusScan ? $t('common.enabled') : $t('common.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('rulesManage.filePathShow.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('rulesManage.filePathShow.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('rulesManage.filePathShow.delete') }}
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

    <!-- 添加/编辑对话框（步骤向导） -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('rulesManage.filePathShow.editDialog') : $t('rulesManage.filePathShow.addDialog')"
      width="800px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" align-center class="steps-nav">
        <el-step :title="$t('rulesManage.filePathShow.step1')" />
        <el-step :title="$t('rulesManage.filePathShow.step2')" />
        <el-step :title="$t('rulesManage.filePathShow.step3')" />
        <el-step :title="$t('rulesManage.filePathShow.step4')" />
      </el-steps>

      <div class="step-content">
        <!-- Step 1: 内网端配置 -->
        <div v-show="currentStep === 0" class="step-panel">
          <el-form :model="formData" :rules="formRules" ref="internalFormRef" label-width="120px" class="form-content">
            <el-form-item :label="$t('rulesManage.filePathShow.protocol')" prop="protocol">
              <el-select v-model="formData.protocol" :placeholder="$t('common.pleaseSelect')" style="width: 100%" @change="handleProtocolChange">
                <el-option label="FTP" value="FTP" />
                <el-option label="FTPS" value="FTPS" />
                <el-option label="SFTP" value="SFTP" />
                <el-option label="SAMBA" value="SAMBA" />
                <el-option label="NFS" value="NFS" />
                <el-option label="SCP" value="SCP" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.serverAddr')" prop="internalUrl">
              <el-input v-model="formData.internalUrl" :placeholder="$t('rulesManage.filePathShow.serverAddrPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.port')" prop="internalPort">
              <el-input-number v-model="formData.internalPort" :min="1" :max="65535" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.username')" prop="internalUsername">
              <el-input v-model="formData.internalUsername" :placeholder="$t('rulesManage.filePathShow.usernamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.password')" prop="internalPassword">
              <el-input v-model="formData.internalPassword" type="password" show-password :placeholder="$t('rulesManage.filePathShow.passwordPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.path')" prop="internalPath">
              <el-input v-model="formData.internalPath" :placeholder="$t('rulesManage.filePathShow.pathPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.encoding')">
              <el-select v-model="formData.internalEncoding" style="width: 100%">
                <el-option label="UTF-8" value="UTF8" />
                <el-option label="GBK" value="GBK" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testConnection('internal')" :loading="testLoading">
                <el-icon><Connection /></el-icon>
                {{ $t('rulesManage.filePathShow.testConnection') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2: 外网端配置 -->
        <div v-show="currentStep === 1" class="step-panel">
          <el-form :model="formData" :rules="formRules" ref="externalFormRef" label-width="120px" class="form-content">
            <el-form-item :label="$t('rulesManage.filePathShow.serverAddr')" prop="externalUrl">
              <el-input v-model="formData.externalUrl" :placeholder="$t('rulesManage.filePathShow.serverAddrPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.port')" prop="externalPort">
              <el-input-number v-model="formData.externalPort" :min="1" :max="65535" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.username')" prop="externalUsername">
              <el-input v-model="formData.externalUsername" :placeholder="$t('rulesManage.filePathShow.usernamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.password')" prop="externalPassword">
              <el-input v-model="formData.externalPassword" type="password" show-password :placeholder="$t('rulesManage.filePathShow.passwordPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.path')" prop="externalPath">
              <el-input v-model="formData.externalPath" :placeholder="$t('rulesManage.filePathShow.pathPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.encoding')">
              <el-select v-model="formData.externalEncoding" style="width: 100%">
                <el-option label="UTF-8" value="UTF8" />
                <el-option label="GBK" value="GBK" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testConnection('external')" :loading="testLoading">
                <el-icon><Connection /></el-icon>
                {{ $t('rulesManage.filePathShow.testConnection') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 3: 策略配置 -->
        <div v-show="currentStep === 2" class="step-panel">
          <el-form :model="formData" :rules="formRules" ref="strategyFormRef" label-width="140px" class="form-content">
            <el-form-item :label="$t('rulesManage.filePathShow.ruleName')" prop="name">
              <el-input v-model="formData.name" :placeholder="$t('rulesManage.filePathShow.ruleNamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.direction')" prop="direction">
              <el-radio-group v-model="formData.direction">
                <el-radio value="INBOUND">{{ $t('rulesManage.filePathShow.inbound') }}</el-radio>
                <el-radio value="OUTBOUND">{{ $t('rulesManage.filePathShow.outbound') }}</el-radio>
                <el-radio value="SYNC">{{ $t('rulesManage.filePathShow.sync') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.scanInterval')">
              <el-input-number v-model="formData.scanInterval" :min="1" style="width: 150px" />
              <el-select v-model="formData.scanIntervalUnit" style="width: 100px; margin-left: 8px">
                <el-option :label="$t('rulesManage.filePathShow.seconds')" value="SECONDS" />
                <el-option :label="$t('rulesManage.filePathShow.minutes')" value="MINUTES" />
                <el-option :label="$t('rulesManage.filePathShow.hours')" value="HOURS" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.fileLanding')">
              <el-switch v-model="formData.fileLanding" />
              <span class="form-hint">{{ formData.fileLanding ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.sameFileMode')">
              <el-radio-group v-model="formData.sameFileMode">
                <el-radio value="OVERWRITE">{{ $t('rulesManage.filePathShow.overwrite') }}</el-radio>
                <el-radio value="SKIP">{{ $t('rulesManage.filePathShow.skip') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.deleteAfterSync')">
              <el-switch v-model="formData.deleteAfterSync" />
              <span class="form-hint">{{ formData.deleteAfterSync ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.virusScan')">
              <el-switch v-model="formData.virusScan" />
              <span class="form-hint">{{ formData.virusScan ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.deleteEmptyDir')">
              <el-switch v-model="formData.deleteEmptyDir" />
              <span class="form-hint">{{ formData.deleteEmptyDir ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 4: 规则配置 -->
        <div v-show="currentStep === 3" class="step-panel">
          <el-form :model="formData" label-width="140px" class="form-content">
            <el-form-item :label="$t('rulesManage.filePathShow.filterMode')">
              <el-radio-group v-model="formData.filterMode">
                <el-radio value="DISABLED">{{ $t('rulesManage.filePathShow.filterDisabled') }}</el-radio>
                <el-radio value="BLACKLIST">{{ $t('rulesManage.filePathShow.blacklist') }}</el-radio>
                <el-radio value="WHITELIST">{{ $t('rulesManage.filePathShow.whitelist') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formData.filterMode !== 'DISABLED'" :label="$t('rulesManage.filePathShow.fileTypes')">
              <el-select v-model="formData.fileTypes" multiple filterable allow-create default-first-option style="width: 100%" :placeholder="$t('rulesManage.filePathShow.fileTypesPlaceholder')">
                <el-option label=".txt" value=".txt" />
                <el-option label=".pdf" value=".pdf" />
                <el-option label=".doc" value=".doc" />
                <el-option label=".docx" value=".docx" />
                <el-option label=".xls" value=".xls" />
                <el-option label=".xlsx" value=".xlsx" />
                <el-option label=".zip" value=".zip" />
                <el-option label=".rar" value=".rar" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.keywordFilter')">
              <el-switch v-model="formData.keywordFilterEnabled" />
              <span class="form-hint">{{ formData.keywordFilterEnabled ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item v-if="formData.keywordFilterEnabled" :label="$t('rulesManage.filePathShow.keywords')">
              <el-select
                v-model="formData.keywords"
                multiple
                filterable
                allow-create
                default-first-option
                style="width: 100%"
                :placeholder="$t('rulesManage.filePathShow.keywordsPlaceholder')"
              />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.tempPrefix')">
              <el-input v-model="formData.tempPrefix" :placeholder="$t('rulesManage.filePathShow.tempPrefixPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('rulesManage.filePathShow.tempSuffix')">
              <el-input v-model="formData.tempSuffix" :placeholder="$t('rulesManage.filePathShow.tempSuffixPlaceholder')" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="currentStep > 0" @click="prevStep">{{ $t('rulesManage.filePathShow.prevStep') }}</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">{{ $t('rulesManage.filePathShow.nextStep') }}</el-button>
          <el-button v-if="currentStep === 3" type="success" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { FolderOpened, Plus, InfoFilled, Edit, Delete, VideoPlay, VideoPause, Connection } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
type Protocol = 'FTP' | 'FTPS' | 'SFTP' | 'SAMBA' | 'NFS' | 'SCP'
type Direction = 'INBOUND' | 'OUTBOUND' | 'SYNC'
type FilterMode = 'DISABLED' | 'BLACKLIST' | 'WHITELIST'

interface TransferPath {
  id: string
  name: string
  enabled: boolean
  status: 'RUNNING' | 'STOPPED'
  protocol: Protocol
  direction: Direction
  internalUrl: string
  internalPort: number
  internalUsername: string
  internalPassword: string
  internalPath: string
  internalEncoding: 'UTF8' | 'GBK'
  externalUrl: string
  externalPort: number
  externalUsername: string
  externalPassword: string
  externalPath: string
  externalEncoding: 'UTF8' | 'GBK'
  scanInterval: number
  scanIntervalUnit: 'SECONDS' | 'MINUTES' | 'HOURS'
  fileLanding: boolean
  sameFileMode: 'OVERWRITE' | 'SKIP'
  deleteAfterSync: boolean
  virusScan: boolean
  deleteEmptyDir: boolean
  filterMode: FilterMode
  fileTypes: string[]
  keywordFilterEnabled: boolean
  keywords: string[]
  tempPrefix: string
  tempSuffix: string
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const testLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentStep = ref(0)
const internalFormRef = ref<FormInstance>()
const externalFormRef = ref<FormInstance>()
const strategyFormRef = ref<FormInstance>()

// 模拟数据
const mockData = ref<TransferPath[]>([
  {
    id: '1',
    name: 'ftp_sync_inbound',
    enabled: true,
    status: 'RUNNING',
    protocol: 'FTP',
    direction: 'INBOUND',
    internalUrl: '192.168.1.100',
    internalPort: 21,
    internalUsername: 'admin',
    internalPassword: '******',
    internalPath: '/data/files',
    internalEncoding: 'UTF8',
    externalUrl: '10.0.0.50',
    externalPort: 21,
    externalUsername: 'sync_user',
    externalPassword: '******',
    externalPath: '/sync/incoming',
    externalEncoding: 'UTF8',
    scanInterval: 60,
    scanIntervalUnit: 'SECONDS',
    fileLanding: true,
    sameFileMode: 'OVERWRITE',
    deleteAfterSync: false,
    virusScan: true,
    deleteEmptyDir: false,
    filterMode: 'WHITELIST',
    fileTypes: ['.txt', '.pdf', '.doc'],
    keywordFilterEnabled: false,
    keywords: [],
    tempPrefix: '',
    tempSuffix: '.tmp'
  },
  {
    id: '2',
    name: 'sftp_sync_outbound',
    enabled: true,
    status: 'RUNNING',
    protocol: 'SFTP',
    direction: 'OUTBOUND',
    internalUrl: '172.16.0.10',
    internalPort: 22,
    internalUsername: 'sftp_admin',
    internalPassword: '******',
    internalPath: '/export/data',
    internalEncoding: 'UTF8',
    externalUrl: '192.168.100.200',
    externalPort: 22,
    externalUsername: 'external_sync',
    externalPassword: '******',
    externalPath: '/backup/files',
    externalEncoding: 'UTF8',
    scanInterval: 5,
    scanIntervalUnit: 'MINUTES',
    fileLanding: true,
    sameFileMode: 'SKIP',
    deleteAfterSync: true,
    virusScan: true,
    deleteEmptyDir: true,
    filterMode: 'BLACKLIST',
    fileTypes: ['.exe', '.bat', '.sh'],
    keywordFilterEnabled: true,
    keywords: ['virus', 'malware'],
    tempPrefix: 'tmp_',
    tempSuffix: ''
  },
  {
    id: '3',
    name: 'samba_sync_bidirectional',
    enabled: false,
    status: 'STOPPED',
    protocol: 'SAMBA',
    direction: 'SYNC',
    internalUrl: '10.10.10.5',
    internalPort: 445,
    internalUsername: 'smb_user',
    internalPassword: '******',
    internalPath: '\\\\share\\public',
    internalEncoding: 'GBK',
    externalUrl: '172.20.0.100',
    externalPort: 445,
    externalUsername: 'ext_smb',
    externalPassword: '******',
    externalPath: '\\\\extshare\\sync',
    externalEncoding: 'UTF8',
    scanInterval: 1,
    scanIntervalUnit: 'HOURS',
    fileLanding: false,
    sameFileMode: 'OVERWRITE',
    deleteAfterSync: false,
    virusScan: false,
    deleteEmptyDir: false,
    filterMode: 'DISABLED',
    fileTypes: [],
    keywordFilterEnabled: false,
    keywords: [],
    tempPrefix: '',
    tempSuffix: ''
  }
])

const tableData = ref<TransferPath[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<TransferPath>({
  id: '',
  name: '',
  enabled: true,
  status: 'STOPPED',
  protocol: 'FTP',
  direction: 'INBOUND',
  internalUrl: '',
  internalPort: 21,
  internalUsername: '',
  internalPassword: '',
  internalPath: '',
  internalEncoding: 'UTF8',
  externalUrl: '',
  externalPort: 21,
  externalUsername: '',
  externalPassword: '',
  externalPath: '',
  externalEncoding: 'UTF8',
  scanInterval: 60,
  scanIntervalUnit: 'SECONDS',
  fileLanding: true,
  sameFileMode: 'OVERWRITE',
  deleteAfterSync: false,
  virusScan: false,
  deleteEmptyDir: false,
  filterMode: 'DISABLED',
  fileTypes: [],
  keywordFilterEnabled: false,
  keywords: [],
  tempPrefix: '',
  tempSuffix: '.tmp'
})

const formRules: FormRules = {
  protocol: [{ required: true, message: t('rulesManage.filePathShow.protocolRequired'), trigger: 'change' }],
  internalUrl: [{ required: true, message: t('rulesManage.filePathShow.serverAddrRequired'), trigger: 'blur' }],
  externalUrl: [{ required: true, message: t('rulesManage.filePathShow.serverAddrRequired'), trigger: 'blur' }],
  name: [{ required: true, message: t('rulesManage.filePathShow.ruleNameRequired'), trigger: 'blur' }],
  direction: [{ required: true, message: t('rulesManage.filePathShow.directionRequired'), trigger: 'change' }]
}

// 列表方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    enabled: true,
    status: 'STOPPED',
    protocol: 'FTP',
    direction: 'INBOUND',
    internalUrl: '',
    internalPort: 21,
    internalUsername: '',
    internalPassword: '',
    internalPath: '',
    internalEncoding: 'UTF8',
    externalUrl: '',
    externalPort: 21,
    externalUsername: '',
    externalPassword: '',
    externalPath: '',
    externalEncoding: 'UTF8',
    scanInterval: 60,
    scanIntervalUnit: 'SECONDS',
    fileLanding: true,
    sameFileMode: 'OVERWRITE',
    deleteAfterSync: false,
    virusScan: false,
    deleteEmptyDir: false,
    filterMode: 'DISABLED',
    fileTypes: [],
    keywordFilterEnabled: false,
    keywords: [],
    tempPrefix: '',
    tempSuffix: '.tmp'
  })
}

const handleAdd = () => {
  isEdit.value = false
  currentStep.value = 0
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: TransferPath) => {
  isEdit.value = true
  currentStep.value = 0
  Object.assign(formData, { ...row, fileTypes: [...row.fileTypes], keywords: [...row.keywords] })
  dialogVisible.value = true
}

const handleToggle = (row: TransferPath) => {
  row.enabled = !row.enabled
  row.status = row.enabled ? 'RUNNING' : 'STOPPED'
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('rulesManage.filePathShow.enableSuccess') : t('rulesManage.filePathShow.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const handleDelete = async (row: TransferPath) => {
  try {
    await ElMessageBox.confirm(
      t('rulesManage.filePathShow.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('rulesManage.filePathShow.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleProtocolChange = (protocol: Protocol) => {
  const defaultPorts: Record<Protocol, number> = {
    FTP: 21,
    FTPS: 990,
    SFTP: 22,
    SAMBA: 445,
    NFS: 2049,
    SCP: 22
  }
  formData.internalPort = defaultPorts[protocol]
  formData.externalPort = defaultPorts[protocol]
}

const testConnection = (_type: 'internal' | 'external') => {
  testLoading.value = true
  setTimeout(() => {
    testLoading.value = false
    ElNotification({
      title: t('common.success'),
      message: t('rulesManage.filePathShow.connectionSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  }, 1500)
}

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const handleSubmit = () => {
  submitLoading.value = true
  setTimeout(() => {
    submitLoading.value = false
    dialogVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: isEdit.value ? t('rulesManage.filePathShow.editSuccess') : t('rulesManage.filePathShow.addSuccess'),
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

const getDirectionTagType = (direction: string) => {
  const types: Record<string, string> = {
    INBOUND: 'success',
    OUTBOUND: 'warning',
    SYNC: 'primary'
  }
  return types[direction]
}

const getDirectionText = (direction: string) => {
  const texts: Record<string, string> = {
    INBOUND: t('rulesManage.filePathShow.inbound'),
    OUTBOUND: t('rulesManage.filePathShow.outbound'),
    SYNC: t('rulesManage.filePathShow.sync')
  }
  return texts[direction]
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.file-path-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(230, 162, 60, 0.02) 0%, rgba(144, 147, 153, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #E6A23C 0%, #909399 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(230, 162, 60, 0.2);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(144, 147, 153, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #E6A23C;
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
  border: 1px solid rgba(230, 162, 60, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.path-table {
  width: 100%;
}

.path-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.path-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.path-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
}

/* 规则名称 */
.rule-name {
  font-weight: 500;
  color: #303133;
}

/* 端点信息 */
.endpoint-info {
  font-family: 'Courier New', monospace;
  color: #E6A23C;
  background: rgba(230, 162, 60, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.endpoint-info.external {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
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
  border-top: 1px solid rgba(230, 162, 60, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(230, 162, 60, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(230, 162, 60, 0.1);
  padding: 16px 20px;
}

/* 步骤条 */
.steps-nav {
  margin-bottom: 24px;
}

.steps-nav :deep(.el-step__title) {
  font-size: 13px;
}

/* 步骤内容 */
.step-content {
  min-height: 350px;
}

.step-panel {
  padding: 10px 0;
}

.form-content {
  max-width: 500px;
  margin: 0 auto;
}

.form-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
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
}
</style>
