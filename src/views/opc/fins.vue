<template>
  <div class="page-container fins-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.fins.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.fins.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.fins.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="fins-table">
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.fins.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.fins.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.fins.enabled') : $t('opc.fins.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 命令黑名单 -->
            <el-table-column :label="$t('opc.fins.cmdFilter')" min-width="220">
              <template #default="{ row }">
                <div class="cmd-tags">
                  <el-tag
                    v-for="cmd in row.cmd_filter.slice(0, 3)"
                    :key="cmd"
                    type="danger"
                    size="small"
                    class="cmd-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.cmd_filter.length > 3" type="danger" size="small" class="cmd-tag">
                    +{{ row.cmd_filter.length - 3 }}
                  </el-tag>
                  <span v-if="!row.cmd_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 内存区域过滤 -->
            <el-table-column :label="$t('opc.fins.memoryFilter')" min-width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="showMemoryConfig(row)">
                  {{ $t('opc.fins.config') }} ({{ row.memory_filter?.length || 0 }})
                </el-button>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.fins.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.fins.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.fins.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.fins.delete') }}
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
      :title="isEdit ? $t('opc.fins.editDialog') : $t('opc.fins.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.fins.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('opc.fins.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.fins.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.fins.cmdFilter')">
          <el-select
            v-model="formData.cmd_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.fins.cmdFilterPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="cmd in cmdOptions" :key="cmd" :label="cmd" :value="cmd" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.fins.memoryFilter')">
          <div class="memory-config-wrapper">
            <div v-for="(config, index) in formData.memory_filter" :key="index" class="memory-config-item">
              <el-select v-model="config.area" :placeholder="$t('opc.fins.areaPlaceholder')" style="width: 100px">
                <el-option v-for="area in areaOptions" :key="area" :label="area" :value="area" />
              </el-select>
              <el-input-number v-model="config.address" :min="0" :max="65535" :placeholder="$t('opc.fins.address')" style="width: 120px" />
              <el-input-number v-model="config.length" :min="1" :max="65535" :placeholder="$t('opc.fins.length')" style="width: 120px" />
              <el-button type="danger" size="small" @click="removeMemoryConfig(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addMemoryConfig">
              <el-icon><Plus /></el-icon>
              {{ $t('opc.fins.addMemory') }}
            </el-button>
          </div>
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
      :title="$t('opc.fins.viewDetail')"
      width="550px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.fins.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.fins.enabled') : $t('opc.fins.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.cmdFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="cmd in viewData.cmd_filter" :key="cmd" type="danger" size="small" class="view-tag">
              {{ cmd }}
            </el-tag>
            <span v-if="!viewData.cmd_filter?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.memoryFilter')" :span="2">
          <div class="memory-list" v-if="viewData.memory_filter?.length">
            <div v-for="(config, index) in viewData.memory_filter" :key="index" class="memory-item">
              {{ $t('opc.fins.area') }}: {{ config.area }} | {{ $t('opc.fins.address') }}: {{ config.address }} | {{ $t('opc.fins.length') }}: {{ config.length }}
            </div>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 内存配置查看对话框 -->
    <el-dialog
      v-model="memoryDialogVisible"
      :title="$t('opc.fins.memoryConfigTitle')"
      width="500px"
      class="view-dialog"
    >
      <el-table :data="memoryViewData" border size="small">
        <el-table-column prop="area" :label="$t('opc.fins.area')" width="100" />
        <el-table-column prop="address" :label="$t('opc.fins.address')" width="120" />
        <el-table-column prop="length" :label="$t('opc.fins.length')" width="100" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="memoryDialogVisible = false">{{ $t('common.confirm') }}</el-button>
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
interface MemoryConfig {
  area: string
  address: number
  length: number
}

interface FinsRule {
  id: string
  group_name: string
  rule_work: boolean
  cmd_filter: string[]
  memory_filter: MemoryConfig[]
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const memoryDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const memoryViewData = ref<MemoryConfig[]>([])

// 命令选项
const cmdOptions = [
  'MEMORY_AREA_READ', 'MEMORY_AREA_WRITE', 'MEMORY_READ', 'MEMORY_WRITE',
  'PARAMETER_AREA_READ', 'PARAMETER_AREA_WRITE', 'PROGRAM_AREA_READ', 'PROGRAM_AREA_WRITE',
  'DM_REG_READ', 'DM_REG_WRITE', 'IO_REG_READ', 'IO_REG_WRITE',
  'CONTROL', 'STATUS_READ', 'RUN', 'STOP', 'CLEAR'
]

// 内存区域选项
const areaOptions = ['CIO', 'WR', 'HR', 'AR', 'DM', 'EM']

// 模拟数据
const mockData = ref<FinsRule[]>([
  {
    id: '1',
    group_name: 'plc_control',
    rule_work: true,
    cmd_filter: ['PROGRAM_AREA_WRITE', 'CLEAR', 'STOP'],
    memory_filter: [
      { area: 'DM', address: 0, length: 100 },
      { area: 'CIO', address: 0, length: 50 }
    ]
  },
  {
    id: '2',
    group_name: 'hmi_readonly',
    rule_work: true,
    cmd_filter: ['MEMORY_WRITE', 'DM_REG_WRITE'],
    memory_filter: [
      { area: 'DM', address: 100, length: 200 }
    ]
  },
  {
    id: '3',
    group_name: 'engineering_station',
    rule_work: false,
    cmd_filter: [],
    memory_filter: []
  }
])

const tableData = ref<FinsRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const defaultMemoryConfig = (): MemoryConfig[] => []

const formData = reactive({
  group_name: '',
  rule_work: true,
  cmd_filter: [] as string[],
  memory_filter: defaultMemoryConfig()
})

const viewData = ref<FinsRule>({
  id: '',
  group_name: '',
  rule_work: false,
  cmd_filter: [],
  memory_filter: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.fins.groupNameRequired'), trigger: 'blur' }
  ]
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
  formData.group_name = ''
  formData.rule_work = true
  formData.cmd_filter = []
  formData.memory_filter = defaultMemoryConfig()
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: FinsRule) => {
  viewData.value = { ...row, cmd_filter: [...row.cmd_filter], memory_filter: [...row.memory_filter] }
  viewDialogVisible.value = true
}

const showMemoryConfig = (row: FinsRule) => {
  memoryViewData.value = [...row.memory_filter]
  memoryDialogVisible.value = true
}

const handleEdit = (row: FinsRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.cmd_filter = [...row.cmd_filter]
  formData.memory_filter = row.memory_filter.map(m => ({ ...m }))
  dialogVisible.value = true
}

const handleDelete = async (row: FinsRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.fins.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.fins.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const addMemoryConfig = () => {
  formData.memory_filter.push({ area: 'DM', address: 0, length: 1 })
}

const removeMemoryConfig = (index: number) => {
  formData.memory_filter.splice(index, 1)
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
              cmd_filter: [...formData.cmd_filter],
              memory_filter: formData.memory_filter.map(m => ({ ...m }))
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            cmd_filter: [...formData.cmd_filter],
            memory_filter: formData.memory_filter.map(m => ({ ...m }))
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.fins.editSuccess') : t('opc.fins.addSuccess'),
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
.fins-page {
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
.fins-table {
  width: 100%;
}

.fins-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.fins-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.fins-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 标签 */
.cmd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

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

/* 内存配置 */
.memory-config-wrapper {
  width: 100%;
}

.memory-config-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
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

.memory-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.memory-item {
  padding: 4px 8px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 4px;
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

  .memory-config-item {
    flex-wrap: wrap;
  }
}
</style>
