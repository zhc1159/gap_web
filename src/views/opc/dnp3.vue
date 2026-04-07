<template>
  <div class="page-container dnp3-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.dnp3.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.dnp3.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.dnp3.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="dnp3-table">
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.dnp3.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.dnp3.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.dnp3.enabled') : $t('opc.dnp3.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 功能码黑名单 -->
            <el-table-column :label="$t('opc.dnp3.funcCodeFilter')" min-width="200">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="code in row.func_code_filter.slice(0, 3)"
                    :key="code"
                    type="info"
                    size="small"
                    class="filter-tag"
                  >
                    {{ code }}
                  </el-tag>
                  <el-tag v-if="row.func_code_filter.length > 3" type="info" size="small" class="filter-tag">
                    +{{ row.func_code_filter.length - 3 }}
                  </el-tag>
                  <span v-if="!row.func_code_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 对象黑名单 -->
            <el-table-column :label="$t('opc.dnp3.objFilter')" min-width="200">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="obj in row.obj_filter.slice(0, 3)"
                    :key="obj"
                    type="warning"
                    size="small"
                    class="filter-tag"
                  >
                    {{ obj }}
                  </el-tag>
                  <el-tag v-if="row.obj_filter.length > 3" type="warning" size="small" class="filter-tag">
                    +{{ row.obj_filter.length - 3 }}
                  </el-tag>
                  <span v-if="!row.obj_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.dnp3.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.dnp3.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.dnp3.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.dnp3.delete') }}
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
      :title="isEdit ? $t('opc.dnp3.editDialog') : $t('opc.dnp3.addDialog')"
      width="650px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.dnp3.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('opc.dnp3.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.dnp3.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.dnp3.funcCodeFilter')">
          <el-select
            v-model="formData.func_code_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.dnp3.funcCodePlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="code in funcCodes" :key="code.value" :label="code.label" :value="code.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.dnp3.objFilter')">
          <el-select
            v-model="formData.obj_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.dnp3.objPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="obj in objectTypes" :key="obj.value" :label="obj.label" :value="obj.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.dnp3.iinFilter')">
          <el-select
            v-model="formData.iin_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.dnp3.iinPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="iin in iinFlags" :key="iin.value" :label="iin.label" :value="iin.value" />
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
      :title="$t('opc.dnp3.viewDetail')"
      width="550px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.dnp3.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.dnp3.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.dnp3.enabled') : $t('opc.dnp3.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.dnp3.funcCodeFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="code in viewData.func_code_filter" :key="code" type="info" size="small" class="view-tag">
              {{ code }}
            </el-tag>
            <span v-if="!viewData.func_code_filter?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.dnp3.objFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="obj in viewData.obj_filter" :key="obj" type="warning" size="small" class="view-tag">
              {{ obj }}
            </el-tag>
            <span v-if="!viewData.obj_filter?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.dnp3.iinFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="iin in viewData.iin_filter" :key="iin" size="small" class="view-tag">
              {{ iin }}
            </el-tag>
            <span v-if="!viewData.iin_filter?.length">-</span>
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
interface Dnp3Rule {
  id: string
  group_name: string
  rule_work: boolean
  func_code_filter: string[]
  obj_filter: string[]
  iin_filter: string[]
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
const mockData = ref<Dnp3Rule[]>([
  {
    id: '1',
    group_name: 'scada_control',
    rule_work: true,
    func_code_filter: ['0x04', '0x05', '0x06'],
    obj_filter: ['12', '20', '21'],
    iin_filter: ['0x02', '0x04']
  },
  {
    id: '2',
    group_name: 'rtu_monitor',
    rule_work: true,
    func_code_filter: ['0x07', '0x08'],
    obj_filter: ['30', '40'],
    iin_filter: []
  }
])

const tableData = ref<Dnp3Rule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  group_name: '',
  rule_work: true,
  func_code_filter: [] as string[],
  obj_filter: [] as string[],
  iin_filter: [] as string[]
})

const viewData = ref<Dnp3Rule>({
  id: '',
  group_name: '',
  rule_work: false,
  func_code_filter: [],
  obj_filter: [],
  iin_filter: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.dnp3.groupNameRequired'), trigger: 'blur' }
  ]
}

// 功能码选项
const funcCodes = [
  { value: '0x00', label: '0x00 - Confirm' },
  { value: '0x01', label: '0x01 - Read' },
  { value: '0x02', label: '0x02 - Write' },
  { value: '0x03', label: '0x03 - Select' },
  { value: '0x04', label: '0x04 - Operate' },
  { value: '0x05', label: '0x05 - Direct Operate' },
  { value: '0x06', label: '0x06 - Direct Operate NR' },
  { value: '0x07', label: '0x07 - Freeze' },
  { value: '0x08', label: '0x08 - Freeze Clear' },
  { value: '0x09', label: '0x09 - Freeze At Time' },
  { value: '0x0D', label: '0x0D - Cold Restart' },
  { value: '0x0E', label: '0x0E - Warm Restart' }
]

// 对象类型选项
const objectTypes = [
  { value: '1', label: '1 - Binary Input' },
  { value: '2', label: '2 - Binary Output' },
  { value: '10', label: '10 - Binary Event' },
  { value: '12', label: '12 - Binary Command Event' },
  { value: '20', label: '20 - Binary Counter' },
  { value: '21', label: '21 - Frozen Counter' },
  { value: '30', label: '30 - Analog Input' },
  { value: '32', label: '32 - Analog Event' },
  { value: '40', label: '40 - Analog Output' }
]

// IIN标志选项
const iinFlags = [
  { value: '0x01', label: '0x01 - Broadcast' },
  { value: '0x02', label: '0x02 - Class 1 Events' },
  { value: '0x04', label: '0x04 - Class 2 Events' },
  { value: '0x08', label: '0x08 - Class 3 Events' },
  { value: '0x10', label: '0x10 - Need Time' },
  { value: '0x20', label: '0x20 - Local Control' },
  { value: '0x40', label: '0x40 - Device Trouble' },
  { value: '0x80', label: '0x80 - Device Restart' }
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
  formData.func_code_filter = []
  formData.obj_filter = []
  formData.iin_filter = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: Dnp3Rule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: Dnp3Rule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.func_code_filter = [...row.func_code_filter]
  formData.obj_filter = [...row.obj_filter]
  formData.iin_filter = [...row.iin_filter]
  dialogVisible.value = true
}

const handleDelete = async (row: Dnp3Rule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.dnp3.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.dnp3.deleteSuccess'),
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
              func_code_filter: [...formData.func_code_filter],
              obj_filter: [...formData.obj_filter],
              iin_filter: [...formData.iin_filter]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            func_code_filter: [...formData.func_code_filter],
            obj_filter: [...formData.obj_filter],
            iin_filter: [...formData.iin_filter]
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.dnp3.editSuccess') : t('opc.dnp3.addSuccess'),
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
.dnp3-page {
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
.dnp3-table {
  width: 100%;
}

.dnp3-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.dnp3-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.dnp3-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 过滤标签 */
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-tag {
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
