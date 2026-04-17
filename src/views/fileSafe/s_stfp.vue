<template>
  <div class="page-container stfp-security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <span class="header-title">{{ $t('fileSafe.s_stfp.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('fileSafe.s_stfp.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('fileSafe.s_stfp.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('fileSafe.s_stfp.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="stfp-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 状态 -->
            <el-table-column :label="$t('fileSafe.s_stfp.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('fileSafe.s_stfp.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- 病毒查杀 -->
            <el-table-column :label="$t('fileSafe.s_stfp.virusScan')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.virusScan ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.virusScan ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 文件类型过滤 -->
            <el-table-column :label="$t('fileSafe.s_stfp.fileTypeFilter')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.fileTypeFilterEnabled" :type="row.fileTypeFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">
                  {{ row.fileTypeFilterMode === 'WHITELIST' ? $t('fileSafe.s_stfp.whitelist') : $t('fileSafe.s_stfp.blacklist') }}
                </el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 文件类型 -->
            <el-table-column :label="$t('fileSafe.s_stfp.fileTypes')" min-width="180">
              <template #default="{ row }">
                <div class="type-tags" v-if="row.fileTypes.length > 0">
                  <el-tag v-for="type in row.fileTypes.slice(0, 3)" :key="type" size="small" class="type-tag">
                    {{ type }}
                  </el-tag>
                  <el-tag v-if="row.fileTypes.length > 3" size="small" type="info" class="more-tag">
                    +{{ row.fileTypes.length - 3 }}
                  </el-tag>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 关键字过滤 -->
            <el-table-column :label="$t('fileSafe.s_stfp.keywordFilter')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.keywordFilterEnabled ? 'success' : 'info'" size="small">
                  {{ row.keywordFilterEnabled ? $t('common.enabled') : $t('common.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('fileSafe.s_stfp.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('fileSafe.s_stfp.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('fileSafe.s_stfp.delete') }}
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('fileSafe.s_stfp.addDialog') : $t('fileSafe.s_stfp.editDialog')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="160px" class="form-content">
        <!-- 用户组 -->
        <el-form-item :label="$t('fileSafe.s_stfp.userGroup')" required>
          <el-select v-model="formData.userGroup" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
            <el-option label="stfp_group_1" value="stfp_group_1" />
            <el-option label="stfp_group_2" value="stfp_group_2" />
            <el-option label="transfer_admin" value="transfer_admin" />
            <el-option label="file_operator" value="file_operator" />
          </el-select>
        </el-form-item>

        <!-- 策略开关 -->
        <el-form-item :label="$t('fileSafe.s_stfp.policySwitch')">
          <el-switch v-model="formData.enabled" />
          <span class="form-hint">{{ formData.enabled ? $t('common.enabled') : $t('common.disabled') }}</span>
        </el-form-item>

        <!-- 病毒查杀 -->
        <el-form-item :label="$t('fileSafe.s_stfp.virusScan')">
          <el-radio-group v-model="formData.virusScan" class="radio-group">
            <el-radio :value="true">{{ $t('common.on') }}</el-radio>
            <el-radio :value="false">{{ $t('common.off') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">{{ $t('fileSafe.s_stfp.fileTypeConfig') }}</el-divider>

        <!-- 文件类型过滤开关 -->
        <el-form-item :label="$t('fileSafe.s_stfp.fileTypeFilterSwitch')">
          <el-radio-group v-model="formData.fileTypeFilterEnabled" class="radio-group">
            <el-radio :value="true">{{ $t('common.on') }}</el-radio>
            <el-radio :value="false">{{ $t('common.off') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 黑白名单 -->
        <el-form-item v-if="formData.fileTypeFilterEnabled" :label="$t('fileSafe.s_stfp.filterMode')">
          <el-radio-group v-model="formData.fileTypeFilterMode" class="radio-group">
            <el-radio value="WHITELIST">
              <el-tag type="success" size="small">{{ $t('fileSafe.s_stfp.whitelist') }}</el-tag>
            </el-radio>
            <el-radio value="BLACKLIST">
              <el-tag type="danger" size="small">{{ $t('fileSafe.s_stfp.blacklist') }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 过滤类型 -->
        <el-form-item v-if="formData.fileTypeFilterEnabled" :label="$t('fileSafe.s_stfp.fileTypesSelect')">
          <el-select v-model="formData.fileTypes" multiple style="width: 100%" :placeholder="$t('common.pleaseSelect')">
            <el-option label=".exe (可执行文件)" value=".exe" />
            <el-option label=".bat (批处理文件)" value=".bat" />
            <el-option label=".cmd (命令脚本)" value=".cmd" />
            <el-option label=".dll (动态链接库)" value=".dll" />
            <el-option label=".scr (屏幕保护)" value=".scr" />
            <el-option label=".pif (程序信息文件)" value=".pif" />
            <el-option label=".com (命令文件)" value=".com" />
            <el-option label=".vbs (VB脚本)" value=".vbs" />
            <el-option label=".js (JavaScript)" value=".js" />
            <el-option label=".jar (Java归档)" value=".jar" />
          </el-select>
        </el-form-item>

        <!-- 自定义类型 -->
        <el-form-item v-if="formData.fileTypeFilterEnabled" :label="$t('fileSafe.s_stfp.customTypes')">
          <el-input
            v-model="customTypesStr"
            :placeholder="$t('fileSafe.s_stfp.customTypesPlaceholder')"
          />
        </el-form-item>

        <el-divider content-position="left">{{ $t('fileSafe.s_stfp.keywordConfig') }}</el-divider>

        <!-- 关键字过滤开关 -->
        <el-form-item :label="$t('fileSafe.s_stfp.keywordFilterSwitch')">
          <el-radio-group v-model="formData.keywordFilterEnabled" class="radio-group">
            <el-radio :value="true">{{ $t('common.on') }}</el-radio>
            <el-radio :value="false">{{ $t('common.off') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 关键字列表 -->
        <el-form-item v-if="formData.keywordFilterEnabled" :label="$t('fileSafe.s_stfp.keywords')">
          <div class="keyword-input-wrapper">
            <div class="keyword-list">
              <el-tag
                v-for="keyword in formData.keywords"
                :key="keyword"
                type="warning"
                closable
                size="small"
                @close="removeKeyword(keyword)"
              >
                {{ keyword }}
              </el-tag>
              <span v-if="formData.keywords.length === 0" class="empty-hint">{{ $t('fileSafe.s_stfp.noKeywords') }}</span>
            </div>
            <div class="input-row">
              <el-input
                v-model="newKeyword"
                :placeholder="$t('fileSafe.s_stfp.keywordPlaceholder')"
                @keyup.enter="addKeyword"
              />
              <el-button type="primary" @click="addKeyword">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { FolderOpened, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface StfpSecurityConfig {
  id: string
  userGroup: string
  enabled: boolean
  virusScan: boolean
  fileTypeFilterEnabled: boolean
  fileTypeFilterMode: 'WHITELIST' | 'BLACKLIST'
  fileTypes: string[]
  customTypes: string[]
  keywordFilterEnabled: boolean
  keywords: string[]
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const newKeyword = ref('')

// 模拟数据
const mockData = ref<StfpSecurityConfig[]>([
  {
    id: '1',
    userGroup: 'stfp_group_1',
    enabled: true,
    virusScan: true,
    fileTypeFilterEnabled: true,
    fileTypeFilterMode: 'BLACKLIST',
    fileTypes: ['.exe', '.bat', '.cmd', '.dll', '.scr'],
    customTypes: ['.sh', '.ps1'],
    keywordFilterEnabled: true,
    keywords: ['密码', '机密', '敏感']
  },
  {
    id: '2',
    userGroup: 'transfer_admin',
    enabled: true,
    virusScan: true,
    fileTypeFilterEnabled: true,
    fileTypeFilterMode: 'WHITELIST',
    fileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    customTypes: [],
    keywordFilterEnabled: false,
    keywords: []
  },
  {
    id: '3',
    userGroup: 'file_operator',
    enabled: false,
    virusScan: false,
    fileTypeFilterEnabled: false,
    fileTypeFilterMode: 'BLACKLIST',
    fileTypes: [],
    customTypes: [],
    keywordFilterEnabled: true,
    keywords: ['test', 'demo']
  }
])

const tableData = ref<StfpSecurityConfig[]>([])

const selectedRows = ref<StfpSecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<StfpSecurityConfig>({
  id: '',
  userGroup: '',
  enabled: true,
  virusScan: false,
  fileTypeFilterEnabled: false,
  fileTypeFilterMode: 'BLACKLIST',
  fileTypes: [],
  customTypes: [],
  keywordFilterEnabled: false,
  keywords: []
})

// 自定义类型字符串转换
const customTypesStr = computed({
  get: () => formData.customTypes.join(', '),
  set: (val: string) => {
    formData.customTypes = val.split(',').map(s => s.trim()).filter(s => s)
  }
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

const handleToggle = (row: StfpSecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('fileSafe.s_stfp.enableSuccess') : t('fileSafe.s_stfp.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    userGroup: '',
    enabled: true,
    virusScan: false,
    fileTypeFilterEnabled: false,
    fileTypeFilterMode: 'BLACKLIST',
    fileTypes: [],
    customTypes: [],
    keywordFilterEnabled: false,
    keywords: []
  })
  newKeyword.value = ''
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: StfpSecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    fileTypes: [...row.fileTypes],
    customTypes: [...row.customTypes],
    keywords: [...row.keywords]
  })
  newKeyword.value = ''
  formVisible.value = true
}

const handleDelete = async (row: StfpSecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.s_stfp.deleteConfirm', { name: row.userGroup }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.s_stfp.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSelectionChange = (rows: StfpSecurityConfig[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.s_stfp.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('fileSafe.s_stfp.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleSubmit = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    formVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: formMode.value === 'add' ? t('fileSafe.s_stfp.addSuccess') : t('fileSafe.s_stfp.editSuccess'),
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

// 关键字操作
const addKeyword = () => {
  const keyword = newKeyword.value.trim()
  if (keyword && !formData.keywords.includes(keyword)) {
    formData.keywords.push(keyword)
    newKeyword.value = ''
  }
}

const removeKeyword = (keyword: string) => {
  const index = formData.keywords.indexOf(keyword)
  if (index > -1) formData.keywords.splice(index, 1)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.stfp-security-page {
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
}

/* 表格样式 */
.stfp-table {
  width: 100%;
}

.stfp-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.stfp-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.stfp-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
}

/* 类型标签 */
.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.type-tag {
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.3);
  color: #67C23A;
}

.more-tag {
  background: rgba(144, 147, 153, 0.1);
}

.empty-text {
  color: #c0c4cc;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
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

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(103, 194, 58, 0.08);
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
  max-height: 60vh;
  overflow-y: auto;
}

.form-hint {
  margin-left: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* 单选按钮组 */
.radio-group :deep(.el-radio) {
  margin-right: 20px;
}

/* 分隔线 */
.el-divider {
  margin: 20px 0;
}

.el-divider :deep(.el-divider__text) {
  font-weight: 600;
  color: #67C23A;
}

/* 关键字输入 */
.keyword-input-wrapper {
  width: 100%;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 32px;
  padding: 8px;
  background: rgba(230, 162, 60, 0.02);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row .el-input {
  flex: 1;
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

  .action-btns {
    flex-direction: column;
  }
}
</style>
