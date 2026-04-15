<template>
  <div class="page-container telnet-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_telnet.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_telnet.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_telnet.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <!-- 批量操作栏 -->
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-info">{{ $t('securityPolicy.s_telnet.selectedCount', { count: selectedRows.length }) }}</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            {{ $t('common.batchDelete') }}
          </el-button>
        </div>

        <el-table :data="tableData" v-loading="loading" class="telnet-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <!-- 用户组 -->
          <el-table-column prop="groupName" :label="$t('securityPolicy.s_telnet.groupName')" min-width="130">
            <template #default="{ row }">
              <span class="group-name">{{ row.groupName }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('securityPolicy.s_telnet.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- 规则名称 -->
          <el-table-column prop="telnetName" :label="$t('securityPolicy.s_telnet.telnetName')" min-width="150">
            <template #default="{ row }">
              <span class="rule-name">{{ row.telnetName }}</span>
            </template>
          </el-table-column>

          <!-- 禁止的命令 -->
          <el-table-column :label="$t('securityPolicy.s_telnet.keyword')" min-width="300">
            <template #default="{ row }">
              <div v-if="row.keyword?.length" class="keyword-tags">
                <el-tag v-for="kw in row.keyword.slice(0, 5)" :key="kw" type="danger" size="small" class="keyword-tag">
                  {{ kw }}
                </el-tag>
                <el-tag v-if="row.keyword.length > 5" type="danger" size="small" class="keyword-tag">
                  +{{ row.keyword.length - 5 }}
                </el-tag>
              </div>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('securityPolicy.s_telnet.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="warning" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('securityPolicy.s_telnet.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('securityPolicy.s_telnet.delete') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('securityPolicy.s_telnet.editDialog') : $t('securityPolicy.s_telnet.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="160px" class="form-content">
        <!-- 规则名称 -->
        <el-form-item :label="$t('securityPolicy.s_telnet.telnetNameLabel')" prop="telnetName">
          <el-input
            v-model="formData.telnetName"
            :placeholder="$t('securityPolicy.s_telnet.telnetNamePlaceholder')"
            :disabled="isEdit"
            maxlength="32"
            show-word-limit
          />
          <div class="form-tip">{{ $t('securityPolicy.s_telnet.telnetNameHint') }}</div>
        </el-form-item>

        <!-- 规则开关 -->
        <el-form-item :label="$t('securityPolicy.s_telnet.ruleSwitch')">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('securityPolicy.s_telnet.groupName')" prop="groupName">
          <el-select v-model="formData.groupName" :placeholder="$t('securityPolicy.s_telnet.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <!-- 禁止的命令 -->
        <el-form-item :label="$t('securityPolicy.s_telnet.keywordLabel')">
          <div class="keyword-input-wrapper">
            <div class="keyword-list">
              <el-tag
                v-for="kw in formData.keyword"
                :key="kw"
                type="danger"
                closable
                size="small"
                @close="removeKeyword(kw)"
              >
                {{ kw }}
              </el-tag>
              <span v-if="formData.keyword.length === 0" class="empty-hint">{{ $t('securityPolicy.s_telnet.noKeyword') }}</span>
            </div>
            <div class="input-row">
              <el-input v-model="newKeyword" :placeholder="$t('securityPolicy.s_telnet.keywordPlaceholder')" @keyup.enter="addKeyword" />
              <el-button type="primary" @click="addKeyword">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="form-tip">{{ $t('securityPolicy.s_telnet.keywordHint') }}</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Monitor, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface TelnetRule {
  id: string
  telnetName: string
  groupName: string
  rule_work: boolean
  keyword: string[]
}

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

// ==================== 状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const newKeyword = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<TelnetRule[]>([
  { id: '1', telnetName: 'telnet_rule_1', groupName: 'opc_group_1', rule_work: true, keyword: ['login', 'passwd', 'su'] },
  { id: '2', telnetName: 'telnet_rule_2', groupName: 'admin_group', rule_work: true, keyword: ['reboot', 'shutdown', 'halt', 'init'] },
  { id: '3', telnetName: 'telnet_rule_3', groupName: 'opc_group_2', rule_work: false, keyword: [] }
])

const tableData = ref<TelnetRule[]>([])

// 多选相关
const selectedRows = ref<TelnetRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  telnetName: '',
  groupName: '',
  rule_work: true,
  keyword: [] as string[]
})

const formRules: FormRules = {
  telnetName: [
    { required: true, message: t('securityPolicy.s_telnet.telnetNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{1,32}$/, message: t('securityPolicy.s_telnet.telnetNamePattern'), trigger: 'blur' }
  ],
  groupName: [
    { required: true, message: t('securityPolicy.s_telnet.groupNameRequired'), trigger: 'change' }
  ]
}

// ==================== 数据加载 ====================
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 300)
}

// ==================== 操作 ====================
const addKeyword = () => {
  const val = newKeyword.value.trim()
  if (!val) {
    ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_telnet.emptyContent'), type: 'warning' })
    return
  }
  if (!/^[a-zA-Z0-9_]{1,32}$/.test(val)) {
    ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_telnet.keywordPattern'), type: 'warning' })
    return
  }
  if (formData.keyword.includes(val)) {
    ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_telnet.duplicateContent'), type: 'warning' })
    return
  }
  formData.keyword.push(val)
  newKeyword.value = ''
}

const removeKeyword = (kw: string) => {
  formData.keyword = formData.keyword.filter(k => k !== kw)
}

const resetForm = () => {
  formData.telnetName = ''; formData.groupName = ''
  formData.rule_work = true; formData.keyword = []
  editingId.value = ''; newKeyword.value = ''
}

const handleAdd = () => { isEdit.value = false; resetForm(); dialogVisible.value = true }

const handleEdit = (row: TelnetRule) => {
  isEdit.value = true; editingId.value = row.id
  formData.telnetName = row.telnetName; formData.groupName = row.groupName
  formData.rule_work = row.rule_work; formData.keyword = [...row.keyword]
  newKeyword.value = ''; dialogVisible.value = true
}

const handleDelete = async (row: TelnetRule) => {
  try {
    await ElMessageBox.confirm(t('securityPolicy.s_telnet.deleteConfirm', { name: row.telnetName }), t('common.confirm'), { type: 'warning' })
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('securityPolicy.s_telnet.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleSelectionChange = (rows: TelnetRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_telnet.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(item => !ids.includes(item.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('securityPolicy.s_telnet.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: TelnetRule) => {
  ElNotification({ title: t('common.success'), message: t('securityPolicy.s_telnet.editSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const idx = mockData.value.findIndex(item => item.id === editingId.value)
        if (idx !== -1) {
          mockData.value[idx] = {
            id: editingId.value, telnetName: formData.telnetName,
            groupName: formData.groupName, rule_work: formData.rule_work,
            keyword: [...formData.keyword]
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(), telnetName: formData.telnetName,
          groupName: formData.groupName, rule_work: formData.rule_work,
          keyword: [...formData.keyword]
        })
      }
      submitLoading.value = false; dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('securityPolicy.s_telnet.editSuccess') : t('securityPolicy.s_telnet.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

fetchList()

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}
</script>

<style scoped>
.telnet-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px; margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}
.header-left { display: flex; align-items: center; color: white; }
.header-icon {
  width: 36px; height: 36px; background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  margin-right: 12px; font-size: 18px;
}
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; }
.btn-add:hover { background: rgba(255, 255, 255, 0.3); }

/* ========== 页面描述 ========== */
.page-describe {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px; margin-bottom: 16px; color: #606266; font-size: 14px;
}
.describe-icon { color: #409EFF; font-size: 16px; }

/* ========== 主卡片 ========== */
.main-card {
  background: white; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}
.card-content { padding: 24px 28px; }

/* ========== 表格 ========== */
.telnet-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600; color: #303133; padding: 14px 12px;
}
.telnet-table :deep(.el-table td.el-table__cell) { padding: 14px 12px; }
.telnet-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}
.group-name { font-weight: 600; color: #409EFF; }
.rule-name { font-family: 'Courier New', monospace; color: #303133; font-weight: 500; }
.keyword-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.keyword-tag { font-size: 12px; }
.empty-text { color: #c0c4cc; }
/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.15);
}
.batch-info {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
}

.action-btns { display: flex; gap: 6px; }
.pagination-wrapper {
  display: flex; justify-content: flex-end; margin-top: 20px;
  padding-top: 16px; border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0; padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}
.form-dialog :deep(.el-dialog__body) { padding: 24px; max-height: 60vh; overflow-y: auto; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid rgba(64, 158, 255, 0.1); padding: 16px 20px; }
.form-content { max-width: 100%; }
.form-tip { margin-top: 4px; font-size: 12px; color: #909399; }

/* ========== 关键字输入 ========== */
.keyword-input-wrapper { width: 100%; }
.keyword-list {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
  min-height: 32px; padding: 8px;
  background: rgba(64, 158, 255, 0.02); border-radius: 6px; border: 1px solid #dcdfe6;
}
.empty-hint { color: #c0c4cc; font-size: 13px; }
.input-row { display: flex; gap: 8px; }
.input-row :deep(.el-input) { flex: 1; }

/* ========== 底部按钮 ========== */
.dialog-footer { display: flex; justify-content: center; gap: 12px; }
</style>
