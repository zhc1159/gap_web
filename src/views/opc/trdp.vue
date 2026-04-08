<template>
  <div class="page-container trdp-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.trdp.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.trdp.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.trdp.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="trdp-table">
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.trdp.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.trdp.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.trdp.enabled') : $t('opc.trdp.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 禁止关键字 -->
            <el-table-column :label="$t('opc.trdp.keywords')" min-width="250">
              <template #default="{ row }">
                <div class="keyword-tags">
                  <el-tag
                    v-for="keyword in row.keywords.slice(0, 3)"
                    :key="keyword"
                    type="info"
                    size="small"
                    class="keyword-tag"
                  >
                    {{ keyword }}
                  </el-tag>
                  <el-tag v-if="row.keywords.length > 3" type="info" size="small" class="keyword-tag">
                    +{{ row.keywords.length - 3 }}
                  </el-tag>
                  <span v-if="!row.keywords?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 禁止命令ID -->
            <el-table-column :label="$t('opc.trdp.comids')" min-width="200">
              <template #default="{ row }">
                <div class="cmd-tags">
                  <el-tag
                    v-for="cmdId in row.comids.slice(0, 3)"
                    :key="cmdId"
                    type="warning"
                    size="small"
                    class="cmd-tag"
                  >
                    {{ cmdId }}
                  </el-tag>
                  <el-tag v-if="row.comids.length > 3" type="warning" size="small" class="cmd-tag">
                    +{{ row.comids.length - 3 }}
                  </el-tag>
                  <span v-if="!row.comids?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.trdp.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.trdp.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.trdp.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.trdp.delete') }}
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
              :total="pagination.total"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.trdp.editDialog') : $t('opc.trdp.addDialog')"
      width="550px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('opc.trdp.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('opc.trdp.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.trdp.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.trdp.keywords')">
          <el-select
            v-model="formData.keywords"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.trdp.keywordsPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="kw in keywordOptions" :key="kw" :label="kw" :value="kw" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.trdp.comids')">
          <el-select
            v-model="formData.comids"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.trdp.comidsPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="cmd in cmdOptions" :key="cmd" :label="cmd.toString()" :value="cmd" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.trdp.viewDetail')"
      width="500px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.trdp.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.trdp.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.trdp.enabled') : $t('opc.trdp.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.trdp.keywords')" :span="2">
          <div class="view-tags">
            <el-tag v-for="keyword in viewData.keywords" :key="keyword" type="info" size="small" class="view-tag">
              {{ keyword }}
            </el-tag>
            <span v-if="!viewData.keywords?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.trdp.comids')" :span="2">
          <div class="view-tags">
            <el-tag v-for="cmdId in viewData.comids" :key="cmdId" type="warning" size="small" class="view-tag">
              {{ cmdId }}
            </el-tag>
            <span v-if="!viewData.comids?.length">-</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface TrdpRule {
  id: string
  group_name: string
  rule_work: boolean
  keywords: string[]
  comids: number[]
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// 模拟数据
const mockData = ref<TrdpRule[]>([
  {
    id: '1',
    group_name: 'train_control',
    rule_work: true,
    keywords: ['emergency', 'brake', 'override'],
    comids: [1001, 1002, 1003]
  },
  {
    id: '2',
    group_name: 'passenger_info',
    rule_work: true,
    keywords: ['sensitive', 'private'],
    comids: [2001, 2002]
  },
  {
    id: '3',
    group_name: 'diagnostic',
    rule_work: false,
    keywords: ['fault', 'error'],
    comids: []
  }
])

const tableData = ref<TrdpRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  group_name: '',
  rule_work: true,
  keywords: [] as string[],
  comids: [] as number[]
})

const viewData = ref<TrdpRule>({
  id: '',
  group_name: '',
  rule_work: false,
  keywords: [],
  comids: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.trdp.groupNameRequired'), trigger: 'blur' }
  ]
}

// 预设关键字选项
const keywordOptions = [
  'emergency', 'brake', 'override', 'fault', 'error',
  'warning', 'critical', 'shutdown', 'restart', 'config',
  'sensitive', 'private', 'protected', 'admin', 'root'
]

// 预设命令ID选项
const cmdOptions = [
  1001, 1002, 1003, 1004, 1005,
  2001, 2002, 2003, 2004, 2005,
  3001, 3002, 3003, 3004, 3005
]

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
  formData.group_name = ''
  formData.rule_work = true
  formData.keywords = []
  formData.comids = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: TrdpRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: TrdpRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.keywords = [...row.keywords]
  formData.comids = [...row.comids]
  dialogVisible.value = true
}

const handleDelete = async (row: TrdpRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.trdp.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.trdp.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        if (isEdit.value) {
          const index = mockData.value.findIndex(item => item.id === editingId.value)
          if (index !== -1) {
            mockData.value[index] = {
              id: editingId.value,
              group_name: formData.group_name,
              rule_work: formData.rule_work,
              keywords: [...formData.keywords],
              comids: [...formData.comids]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            keywords: [...formData.keywords],
            comids: [...formData.comids]
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.trdp.editSuccess') : t('opc.trdp.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.trdp-page {
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
.trdp-table {
  width: 100%;
}

.trdp-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.trdp-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.trdp-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 标签 */
.keyword-tags,
.cmd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.keyword-tag,
.cmd-tag {
  font-size: 12px;
}

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

/* 查看对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.view-tag {
  font-size: 12px;
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
