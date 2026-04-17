<template>
  <div class="page-container http-proxy-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_httpProxy.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_httpProxy.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_httpProxy.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('securityPolicy.s_httpProxy.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="proxy-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- URL规则开关 -->
            <el-table-column :label="$t('securityPolicy.s_httpProxy.urlRuleEnabled')" min-width="120" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.urlRuleEnabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 过滤策略 -->
            <el-table-column :label="$t('securityPolicy.s_httpProxy.filterPolicy')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.filterPolicy === 'WHITELIST' ? 'success' : 'danger'" size="small">
                  {{ row.filterPolicy === 'WHITELIST' ? $t('securityPolicy.s_httpProxy.whitelist') : $t('securityPolicy.s_httpProxy.blacklist') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- URL过滤 -->
            <el-table-column :label="$t('securityPolicy.s_httpProxy.urlList')" min-width="220">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="showUrlDetail(row)">
                  {{ truncateUrl(row.urlList) }}
                </el-button>
              </template>
            </el-table-column>

            <!-- 关键字 -->
            <el-table-column :label="$t('securityPolicy.s_httpProxy.keywords')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag type="warning" size="small">{{ row.keywordList.length }} {{ $t('securityPolicy.s_httpProxy.count') }}</el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('securityPolicy.s_httpProxy.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('securityPolicy.s_httpProxy.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('securityPolicy.s_httpProxy.delete') }}
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
      :title="formMode === 'add' ? $t('securityPolicy.s_httpProxy.addDialog') : $t('securityPolicy.s_httpProxy.editDialog')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="140px" class="form-content">
        <!-- URL规则开关 -->
        <el-form-item :label="$t('securityPolicy.s_httpProxy.urlRuleEnabled')">
          <el-radio-group v-model="formData.urlRuleEnabled" class="radio-group">
            <el-radio :value="true">{{ $t('common.on') }}</el-radio>
            <el-radio :value="false">{{ $t('common.off') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 过滤策略 -->
        <el-form-item :label="$t('securityPolicy.s_httpProxy.filterPolicy')">
          <el-radio-group v-model="formData.filterPolicy" class="radio-group">
            <el-radio value="WHITELIST">
              <el-tag type="success" size="small">{{ $t('securityPolicy.s_httpProxy.whitelist') }}</el-tag>
            </el-radio>
            <el-radio value="BLACKLIST">
              <el-tag type="danger" size="small">{{ $t('securityPolicy.s_httpProxy.blacklist') }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- URL过滤列表 -->
        <el-form-item :label="$t('securityPolicy.s_httpProxy.urlList')">
          <div class="tag-input-wrapper">
            <div class="tag-list">
              <el-tag
                v-for="url in formData.urlList"
                :key="url"
                type="primary"
                closable
                size="small"
                @close="removeUrl(url)"
              >
                {{ url }}
              </el-tag>
              <span v-if="formData.urlList.length === 0" class="empty-hint">{{ $t('securityPolicy.s_httpProxy.noUrls') }}</span>
            </div>
            <div class="input-row">
              <el-input
                v-model="newUrl"
                :placeholder="$t('securityPolicy.s_httpProxy.urlPlaceholder')"
                @keyup.enter="addUrl"
              />
              <el-button type="primary" @click="addUrl">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 关键字列表 -->
        <el-form-item :label="$t('securityPolicy.s_httpProxy.keywordList')">
          <div class="tag-input-wrapper">
            <div class="tag-list keyword-list">
              <el-tag
                v-for="keyword in formData.keywordList"
                :key="keyword"
                type="warning"
                closable
                size="small"
                @close="removeKeyword(keyword)"
              >
                {{ keyword }}
              </el-tag>
              <span v-if="formData.keywordList.length === 0" class="empty-hint">{{ $t('securityPolicy.s_httpProxy.noKeywords') }}</span>
            </div>
            <div class="input-row">
              <el-input
                v-model="newKeyword"
                :placeholder="$t('securityPolicy.s_httpProxy.keywordPlaceholder')"
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

    <!-- URL详情弹窗 -->
    <el-dialog
      v-model="urlDetailVisible"
      :title="$t('securityPolicy.s_httpProxy.urlDetailTitle')"
      width="500px"
      class="url-detail-dialog"
    >
      <div class="url-detail-list">
        <div v-for="url in currentUrlList" :key="url" class="url-item">
          <el-icon class="url-icon"><Link /></el-icon>
          <span>{{ url }}</span>
        </div>
        <div v-if="currentUrlList.length === 0" class="empty-list">
          {{ $t('securityPolicy.s_httpProxy.noUrls') }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Monitor, Plus, InfoFilled, Edit, Delete, Link } from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface HttpProxySecurityConfig {
  id: string
  urlRuleEnabled: boolean
  filterPolicy: 'WHITELIST' | 'BLACKLIST'
  urlList: string[]
  keywordList: string[]
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const urlDetailVisible = ref(false)
const currentUrlList = ref<string[]>([])
const selectedRows = ref<HttpProxySecurityConfig[]>([])

const newUrl = ref('')
const newKeyword = ref('')

// 模拟数据
const mockData = ref<HttpProxySecurityConfig[]>([
  {
    id: '1',
    urlRuleEnabled: true,
    filterPolicy: 'BLACKLIST',
    urlList: ['www.example.com', 'ads.example.net', 'tracker.example.org', 'malware.example.com'],
    keywordList: ['广告', '赌博', '彩票']
  },
  {
    id: '2',
    urlRuleEnabled: true,
    filterPolicy: 'WHITELIST',
    urlList: ['www.google.com', 'www.baidu.com', 'www.github.com'],
    keywordList: []
  },
  {
    id: '3',
    urlRuleEnabled: false,
    filterPolicy: 'BLACKLIST',
    urlList: [],
    keywordList: ['敏感词1', '敏感词2']
  }
])

const tableData = ref<HttpProxySecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<HttpProxySecurityConfig>({
  id: '',
  urlRuleEnabled: true,
  filterPolicy: 'BLACKLIST',
  urlList: [],
  keywordList: []
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

const truncateUrl = (urls: string[]) => {
  const str = urls.join(', ')
  if (str.length > 50) {
    return str.slice(0, 50) + '...'
  }
  return str || t('securityPolicy.s_httpProxy.empty')
}

const showUrlDetail = (row: HttpProxySecurityConfig) => {
  currentUrlList.value = row.urlList
  urlDetailVisible.value = true
}

const handleToggle = (row: HttpProxySecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.urlRuleEnabled ? t('securityPolicy.s_httpProxy.enableSuccess') : t('securityPolicy.s_httpProxy.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    urlRuleEnabled: true,
    filterPolicy: 'BLACKLIST',
    urlList: [],
    keywordList: []
  })
  newUrl.value = ''
  newKeyword.value = ''
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: HttpProxySecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    urlList: [...row.urlList],
    keywordList: [...row.keywordList]
  })
  newUrl.value = ''
  newKeyword.value = ''
  formVisible.value = true
}

const handleDelete = async (row: HttpProxySecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_httpProxy.deleteConfirm'),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_httpProxy.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSelectionChange = (rows: HttpProxySecurityConfig[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_httpProxy.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_httpProxy.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSubmit = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    formVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: formMode.value === 'add' ? t('securityPolicy.s_httpProxy.addSuccess') : t('securityPolicy.s_httpProxy.editSuccess'),
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

// URL操作
const addUrl = () => {
  const url = newUrl.value.trim()
  if (url && !formData.urlList.includes(url)) {
    formData.urlList.push(url)
    newUrl.value = ''
  }
}

const removeUrl = (url: string) => {
  const index = formData.urlList.indexOf(url)
  if (index > -1) formData.urlList.splice(index, 1)
}

// 关键字操作
const addKeyword = () => {
  const keyword = newKeyword.value.trim()
  if (keyword && !formData.keywordList.includes(keyword)) {
    formData.keywordList.push(keyword)
    newKeyword.value = ''
  }
}

const removeKeyword = (keyword: string) => {
  const index = formData.keywordList.indexOf(keyword)
  if (index > -1) formData.keywordList.splice(index, 1)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.http-proxy-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
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
.proxy-table {
  width: 100%;
}

.proxy-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.proxy-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.proxy-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
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
  border-top: 1px solid rgba(103, 194, 58, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
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
  background: rgba(103, 194, 58, 0.02);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.keyword-list {
  background: rgba(230, 162, 60, 0.02);
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

/* URL详情弹窗 */
.url-detail-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}

.url-detail-list {
  max-height: 400px;
  overflow-y: auto;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.url-item:last-child {
  margin-bottom: 0;
}

.url-icon {
  color: #67C23A;
  font-size: 16px;
}

.empty-list {
  text-align: center;
  color: var(--el-text-color-placeholder);
  padding: 20px;
  font-size: 14px;
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
