<template>
  <div class="page-container email-security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Message /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_email.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_email.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_email.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('securityPolicy.s_email.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="email-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 状态 -->
            <el-table-column :label="$t('securityPolicy.s_email.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('securityPolicy.s_email.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- 附件大小 -->
            <el-table-column :label="$t('securityPolicy.s_email.attachmentMaxSize')" min-width="120" align="center">
              <template #default="{ row }">
                <span class="size-value">{{ row.attachmentMaxSize }} MB</span>
              </template>
            </el-table-column>

            <!-- 杀毒扫描 -->
            <el-table-column :label="$t('securityPolicy.s_email.virusScan')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.virusScan ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.virusScan ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 禁止发件人 -->
            <el-table-column :label="$t('securityPolicy.s_email.blockedSenders')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag type="warning" size="small">{{ row.blockedSenders.length }} {{ $t('securityPolicy.s_email.count') }}</el-tag>
              </template>
            </el-table-column>

            <!-- 禁止主题 -->
            <el-table-column :label="$t('securityPolicy.s_email.blockedSubjects')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag type="danger" size="small">{{ row.blockedSubjects.length }} {{ $t('securityPolicy.s_email.count') }}</el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('securityPolicy.s_email.actions')" min-width="220" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" class="btn-view" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('securityPolicy.s_email.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('securityPolicy.s_email.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('securityPolicy.s_email.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤引导对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('securityPolicy.s_email.addDialog') : $t('securityPolicy.s_email.editDialog')"
      width="800px"
      class="wizard-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <div class="wizard-steps">
        <el-steps :active="3" align-center>
          <el-step :title="$t('securityPolicy.s_email.stepBasic')" :icon="Setting" :status="stepVisible[0] ? 'process' : 'wait'" @click.native="scrollToStep(0)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_email.stepAttachment')" :icon="Document" :status="stepVisible[1] ? 'process' : 'wait'" @click.native="scrollToStep(1)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_email.stepSender')" :icon="User" :status="stepVisible[2] ? 'process' : 'wait'" @click.native="scrollToStep(2)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_email.stepContent')" :icon="Filter" :status="stepVisible[3] ? 'process' : 'wait'" @click.native="scrollToStep(3)" class="clickable-step" />
        </el-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="wizard-content" ref="wizardContentRef">
        <!-- 步骤1: 基础配置 -->
        <div id="step-0" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Setting /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_email.stepBasicTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_email.stepBasicDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_email.policySwitch')">
              <el-switch v-model="formData.enabled" />
              <span class="form-hint">{{ formData.enabled ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_email.userGroup')" required>
              <el-select v-model="formData.userGroup" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
                <el-option label="mail_group_1" value="mail_group_1" />
                <el-option label="mail_group_2" value="mail_group_2" />
                <el-option label="admin_group" value="admin_group" />
                <el-option label="user_group" value="user_group" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 附件配置 -->
        <div id="step-1" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Document /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_email.stepAttachmentTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_email.stepAttachmentDesc') }}</div>

          <el-form :model="formData" label-width="150px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_email.attachmentMaxSize')">
              <el-input-number v-model="formData.attachmentMaxSize" :min="1" :max="2048" style="width: 150px" />
              <span class="unit-text">MB</span>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_email.blockedAttachmentTypes')">
              <el-select v-model="formData.blockedAttachmentTypes" multiple style="width: 100%">
                <el-option label=".exe (可执行文件)" value=".exe" />
                <el-option label=".bat (批处理文件)" value=".bat" />
                <el-option label=".cmd (命令脚本)" value=".cmd" />
                <el-option label=".scr (屏幕保护)" value=".scr" />
                <el-option label=".pif (程序信息文件)" value=".pif" />
                <el-option label=".com (命令文件)" value=".com" />
                <el-option label=".vbs (VB脚本)" value=".vbs" />
                <el-option label=".js (JavaScript)" value=".js" />
                <el-option label=".jar (Java归档)" value=".jar" />
                <el-option label=".zip (压缩文件)" value=".zip" />
                <el-option label=".rar (RAR压缩)" value=".rar" />
                <el-option label=".7z (7-Zip压缩)" value=".7z" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_email.virusScan')">
              <el-switch v-model="formData.virusScan" />
              <span class="form-hint" v-if="formData.virusScan">{{ $t('securityPolicy.s_email.virusScanHint') }}</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤3: 发件人过滤 -->
        <div id="step-2" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><User /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_email.stepSenderTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_email.stepSenderDesc') }}</div>

          <el-form :model="formData" label-width="150px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_email.senderFilterMode')">
              <el-radio-group v-model="formData.senderFilterMode" class="radio-group">
                <el-radio value="ALLOW">
                  <el-tag type="success" size="small">{{ $t('securityPolicy.s_email.allowMode') }}</el-tag>
                </el-radio>
                <el-radio value="DENY">
                  <el-tag type="danger" size="small">{{ $t('securityPolicy.s_email.denyMode') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_email.senderList')">
              <div class="tag-input-wrapper">
                <div class="tag-list">
                  <el-tag
                    v-for="sender in formData.blockedSenders"
                    :key="sender"
                    type="warning"
                    closable
                    size="small"
                    @close="removeSender(sender)"
                  >
                    {{ sender }}
                  </el-tag>
                  <span v-if="formData.blockedSenders.length === 0" class="empty-hint">{{ $t('securityPolicy.s_email.noSenders') }}</span>
                </div>
                <el-input
                  v-model="newSender"
                  :placeholder="$t('securityPolicy.s_email.senderPlaceholder')"
                  @keyup.enter="addSender"
                >
                  <template #append>
                    <el-button @click="addSender">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤4: 内容过滤 -->
        <div id="step-3" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Filter /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_email.stepContentTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_email.stepContentDesc') }}</div>

          <div class="content-grid">
            <!-- 主题过滤 -->
            <div class="content-card subject-card">
              <div class="content-header">
                <el-icon><ChatLineSquare /></el-icon>
                <span>{{ $t('securityPolicy.s_email.subjectFilter') }}</span>
              </div>
              <el-form :model="formData" label-width="100px" class="content-form">
                <el-form-item :label="$t('securityPolicy.s_email.blockedSubjectsLabel')">
                  <div class="tag-input-wrapper">
                    <div class="tag-list">
                      <el-tag
                        v-for="subject in formData.blockedSubjects"
                        :key="subject"
                        type="danger"
                        closable
                        size="small"
                        @close="removeSubject(subject)"
                      >
                        {{ subject }}
                      </el-tag>
                      <span v-if="formData.blockedSubjects.length === 0" class="empty-hint">{{ $t('securityPolicy.s_email.noSubjects') }}</span>
                    </div>
                    <el-input
                      v-model="newSubject"
                      :placeholder="$t('securityPolicy.s_email.subjectPlaceholder')"
                      @keyup.enter="addSubject"
                    >
                      <template #append>
                        <el-button @click="addSubject" size="small">
                          <el-icon><Plus /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-form>
            </div>

            <!-- 内容关键词 -->
            <div class="content-card content-card-body">
              <div class="content-header">
                <el-icon><DocumentCopy /></el-icon>
                <span>{{ $t('securityPolicy.s_email.contentFilter') }}</span>
              </div>
              <el-form :model="formData" label-width="100px" class="content-form">
                <el-form-item :label="$t('securityPolicy.s_email.blockedContentLabel')">
                  <div class="tag-input-wrapper">
                    <div class="tag-list">
                      <el-tag
                        v-for="content in formData.blockedContent"
                        :key="content"
                        type="warning"
                        closable
                        size="small"
                        @close="removeContent(content)"
                      >
                        {{ content }}
                      </el-tag>
                      <span v-if="formData.blockedContent.length === 0" class="empty-hint">{{ $t('securityPolicy.s_email.noContent') }}</span>
                    </div>
                    <el-input
                      v-model="newContent"
                      :placeholder="$t('securityPolicy.s_email.contentPlaceholder')"
                      @keyup.enter="addContent"
                    >
                      <template #append>
                        <el-button @click="addContent" size="small">
                          <el-icon><Plus /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="wizard-footer">
          <el-button @click="formVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看弹窗 -->
    <el-dialog v-model="viewVisible" :title="$t('securityPolicy.s_email.viewDetail')" width="600px">
      <div v-if="viewData" class="view-content">
        <!-- 基础信息 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_email.stepBasic') }}</div>
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_email.policySwitch') }}</span>
              <el-tag :type="viewData.enabled ? 'success' : 'danger'" size="small">{{ viewData.enabled ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_email.userGroup') }}</span>
              <span class="view-value">{{ viewData.userGroup }}</span>
            </div>
          </div>
        </div>
        <!-- 附件配置 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_email.stepAttachment') }}</div>
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_email.attachmentMaxSize') }}</span>
              <span class="view-value">{{ viewData.attachmentMaxSize }} KB</span>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_email.virusScan') }}</span>
              <el-tag :type="viewData.virusScan ? 'success' : 'info'" size="small">{{ viewData.virusScan ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
          </div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_email.blockedAttachmentTypes') }}</span>
            <span class="view-value">{{ viewData.blockedAttachmentTypes.length ? viewData.blockedAttachmentTypes.join(', ') : '-' }}</span>
          </div>
        </div>
        <!-- 发件人过滤 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_email.stepSender') }}</div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_email.senderFilterMode') }}</span>
            <el-tag :type="viewData.senderFilterMode === 'ALLOW' ? 'success' : 'danger'" size="small">{{ viewData.senderFilterMode === 'ALLOW' ? $t('securityPolicy.s_email.allowMode') : $t('securityPolicy.s_email.denyMode') }}</el-tag>
          </div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_email.senderList') }}</span>
            <span class="view-value">{{ viewData.blockedSenders.length ? viewData.blockedSenders.join(', ') : '-' }}</span>
          </div>
        </div>
        <!-- 内容过滤 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_email.stepContent') }}</div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_email.blockedSubjectsLabel') }}</span>
            <span class="view-value">{{ viewData.blockedSubjects.length ? viewData.blockedSubjects.join(', ') : '-' }}</span>
          </div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_email.blockedContentLabel') }}</span>
            <span class="view-value">{{ viewData.blockedContent.length ? viewData.blockedContent.join(', ') : '-' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Message, Plus, InfoFilled, Edit, Delete, Setting, Document, User, View,
  Filter, ArrowLeft, ArrowRight, Check, ChatLineSquare, DocumentCopy
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface MailSecurityConfig {
  id: string
  userGroup: string
  enabled: boolean
  attachmentMaxSize: number
  blockedAttachmentTypes: string[]
  virusScan: boolean
  blockedSubjects: string[]
  senderFilterMode: 'ALLOW' | 'DENY'
  blockedSenders: string[]
  blockedContent: string[]
}

// 状态
const loading = ref(false)
const viewVisible = ref(false)
const viewData = ref<MailSecurityConfig | null>(null)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentStep = ref(0)
const stepVisible = reactive([true, false, false, false])
let scrollObserver: IntersectionObserver | null = null
const wizardContentRef = ref<HTMLElement>()

const setupScrollObserver = () => {
  if (scrollObserver) scrollObserver.disconnect()
  const container = wizardContentRef.value
  if (!container) return

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const index = parseInt(entry.target.id.replace('step-', ''))
        stepVisible[index] = entry.isIntersecting
      })
    },
    { root: container, threshold: 0.1 }
  )

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('step-' + i)
    if (el) scrollObserver!.observe(el)
  }
}

const scrollToStep = (step: number) => {
  const el = document.getElementById('step-' + step)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const selectedRows = ref<MailSecurityConfig[]>([])

const newSubject = ref('')
const newSender = ref('')
const newContent = ref('')

// 模拟数据
const mockData = ref<MailSecurityConfig[]>([
  {
    id: '1',
    userGroup: 'mail_group_1',
    enabled: true,
    attachmentMaxSize: 50,
    blockedAttachmentTypes: ['.exe', '.bat', '.cmd', '.scr'],
    virusScan: true,
    blockedSubjects: ['广告', '促销', '免费'],
    senderFilterMode: 'DENY',
    blockedSenders: ['spam@example.com', 'ads@spam.com'],
    blockedContent: ['敏感词1', '敏感词2']
  },
  {
    id: '2',
    userGroup: 'admin_group',
    enabled: true,
    attachmentMaxSize: 100,
    blockedAttachmentTypes: ['.exe', '.vbs'],
    virusScan: true,
    blockedSubjects: [],
    senderFilterMode: 'ALLOW',
    blockedSenders: ['trusted@company.com'],
    blockedContent: []
  },
  {
    id: '3',
    userGroup: 'user_group',
    enabled: false,
    attachmentMaxSize: 20,
    blockedAttachmentTypes: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js'],
    virusScan: false,
    blockedSubjects: ['测试'],
    senderFilterMode: 'DENY',
    blockedSenders: [],
    blockedContent: []
  }
])

const tableData = ref<MailSecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<MailSecurityConfig>({
  id: '',
  userGroup: '',
  enabled: true,
  attachmentMaxSize: 50,
  blockedAttachmentTypes: [],
  virusScan: false,
  blockedSubjects: [],
  senderFilterMode: 'DENY',
  blockedSenders: [],
  blockedContent: []
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

const handleToggle = (row: MailSecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('securityPolicy.s_email.enableSuccess') : t('securityPolicy.s_email.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    userGroup: '',
    enabled: true,
    attachmentMaxSize: 50,
    blockedAttachmentTypes: [],
    virusScan: false,
    blockedSubjects: [],
    senderFilterMode: 'DENY',
    blockedSenders: [],
    blockedContent: []
  })
  newSubject.value = ''
  newSender.value = ''
  newContent.value = ''
  currentStep.value = 0
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
  nextTick(() => setupScrollObserver())
}

const handleView = (row: MailSecurityConfig) => {
  viewData.value = { ...row }
  viewVisible.value = true
}

const handleEdit = (row: MailSecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    blockedAttachmentTypes: [...row.blockedAttachmentTypes],
    blockedSubjects: [...row.blockedSubjects],
    blockedSenders: [...row.blockedSenders],
    blockedContent: [...row.blockedContent]
  })
  newSubject.value = ''
  newSender.value = ''
  newContent.value = ''
  currentStep.value = 0
  formVisible.value = true
  nextTick(() => setupScrollObserver())
}

const handleDelete = async (row: MailSecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_email.deleteConfirm', { name: row.userGroup }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_email.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSelectionChange = (rows: MailSecurityConfig[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_email.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_email.deleteSuccess'),
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
      message: formMode.value === 'add' ? t('securityPolicy.s_email.addSuccess') : t('securityPolicy.s_email.editSuccess'),
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

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

// 主题关键词操作
const addSubject = () => {
  const subject = newSubject.value.trim()
  if (subject && !formData.blockedSubjects.includes(subject)) {
    formData.blockedSubjects.push(subject)
    newSubject.value = ''
  }
}

const removeSubject = (subject: string) => {
  const index = formData.blockedSubjects.indexOf(subject)
  if (index > -1) formData.blockedSubjects.splice(index, 1)
}

// 发件人操作
const addSender = () => {
  const sender = newSender.value.trim()
  if (sender && !formData.blockedSenders.includes(sender)) {
    formData.blockedSenders.push(sender)
    newSender.value = ''
  }
}

const removeSender = (sender: string) => {
  const index = formData.blockedSenders.indexOf(sender)
  if (index > -1) formData.blockedSenders.splice(index, 1)
}

// 内容关键词操作
const addContent = () => {
  const content = newContent.value.trim()
  if (content && !formData.blockedContent.includes(content)) {
    formData.blockedContent.push(content)
    newContent.value = ''
  }
}

const removeContent = (content: string) => {
  const index = formData.blockedContent.indexOf(content)
  if (index > -1) formData.blockedContent.splice(index, 1)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.btn-view {
  background: #606266;
  border-color: var(--el-text-color-secondary);
  color: #fff;
}

.btn-view:hover {
  background: #73767a;
  border-color: #73767a;
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-section {
  padding-bottom: 16px;
  border-bottom: 1px dashed rgba(144, 147, 153, 0.15);
}

.view-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.view-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.view-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.view-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-label {
  min-width: 100px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.view-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.email-security-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(230, 162, 60, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
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
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 162, 60, 0.08);
}

.card-content {
  padding: 20px;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.15);
}

.batch-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 表格样式 */
.email-table {
  width: 100%;
}

.email-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.email-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.email-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

.size-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #E6A23C;
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

/* 步骤引导对话框 */
.wizard-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(230, 162, 60, 0.1);
}

.wizard-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.wizard-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(230, 162, 60, 0.1);
  padding: 16px 20px;
}

/* 步骤条 */
.wizard-steps {
  padding: 24px 40px 16px;
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
  border-bottom: 1px solid rgba(230, 162, 60, 0.08);
}

.wizard-steps :deep(.el-step__title) {
  font-size: 13px;
}

.wizard-steps :deep(.el-step__icon) {
  width: 32px;
  height: 32px;
}

.wizard-steps :deep(.clickable-step) {
  cursor: pointer;
}

.wizard-steps :deep(.clickable-step:hover .el-step__title) {
  color: #409EFF;
}

/* 步骤内容 */
.wizard-content {
  padding: 24px;
  max-height: 55vh;
  overflow-y: auto;
}

.step-panel {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px dashed rgba(230, 162, 60, 0.12);
}

.step-panel:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
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
  background: linear-gradient(135deg, #E6A23C 0%, #409EFF 100%);
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
  color: var(--el-text-color-primary);
}

.step-desc {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  margin-bottom: 24px;
  padding-left: 42px;
}

.step-form {
  padding: 16px 20px;
  background: rgba(230, 162, 60, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(230, 162, 60, 0.06);
}

.form-hint {
  margin-left: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-placeholder);
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
  background: var(--card-bg);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.content-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(230, 162, 60, 0.1);
}

.subject-card {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(245, 108, 108, 0.02) 100%);
}

.content-card-body {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(230, 162, 60, 0.02) 100%);
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(230, 162, 60, 0.1);
}

.subject-card .content-header .el-icon {
  color: #F56C6C;
}

.content-card-body .content-header .el-icon {
  color: #E6A23C;
}

.content-form :deep(.el-form-item) {
  margin-bottom: 0;
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

  .content-grid {
    grid-template-columns: 1fr;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
