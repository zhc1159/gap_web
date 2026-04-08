<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('opc.s_onebit.describe') }}</div>
      <div class="page-util">
        <div class="page-title-1">{{ $t('opc.s_onebit.title') }}</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ $t('opc.s_onebit.addRule') }}
          </el-button>
        </div>
      </div>
      <div class="page-table">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="name" :label="$t('opc.s_onebit.ruleName')" min-width="150" />
          <el-table-column prop="userGroup" :label="$t('opc.s_onebit.userGroup')" min-width="120" />
          <el-table-column :label="$t('opc.s_onebit.responseMode')" width="120">
            <template #default="{ row }">
              <el-tag type="primary" size="small">
                {{ getResponseModeText(row.responseMode) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responseTimeout" :label="$t('opc.s_onebit.responseTimeout')" width="120" />
          <el-table-column prop="maxPacketCount" :label="$t('opc.s_onebit.maxPacketCount')" width="120" />
          <el-table-column :label="$t('opc.s_onebit.enabled')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                {{ row.enabled ? $t('common.enabled') : $t('common.disabled') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s_onebit.blockFlag')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.blockFlag ? 'danger' : 'info'" size="small">
                {{ row.blockFlag ? $t('common.on') : $t('common.off') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s_onebit.actions')" width="220" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" link @click="handleView(row)">
                {{ $t('opc.s_onebit.view') }}
              </el-button>
              <el-button type="primary" size="small" link @click="handleEdit(row)">
                {{ $t('opc.s_onebit.edit') }}
              </el-button>
              <el-popconfirm :title="$t('opc.s_onebit.deleteConfirm')" @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button type="danger" size="small" link>
                    {{ $t('opc.s_onebit.delete') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.s_onebit.editTitle') : $t('opc.s_onebit.addTitle')"
      width="700px"
      :close-on-click-modal="false"
      class="dialog-body-custom"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="160px" class="form-label">
        <el-form-item :label="$t('opc.s_onebit.ruleName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('opc.s_onebit.ruleNamePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.userGroup')" prop="userGroup">
          <el-select v-model="formData.userGroup" class="w-full" :placeholder="$t('opc.s_onebit.userGroupPlaceholder')">
            <el-option v-for="group in userGroupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.responseMode')" prop="responseMode">
          <el-select v-model="formData.responseMode" class="w-full">
            <el-option :label="$t('opc.s_onebit.responseModeNone')" value="NONE" />
            <el-option :label="$t('opc.s_onebit.responseModeSingle0')" value="SINGLE_0" />
            <el-option :label="$t('opc.s_onebit.responseModeSingle1')" value="SINGLE_1" />
            <el-option :label="$t('opc.s_onebit.responseModeDouble')" value="DOUBLE" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.responseTimeoutLabel')" prop="responseTimeout">
          <el-input-number v-model="formData.responseTimeout" :min="1" :max="3600" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.maxPacketCountLabel')" prop="maxPacketCount">
          <el-input-number v-model="formData.maxPacketCount" :min="1" :max="10000" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.enabled')" prop="enabled">
          <el-radio-group v-model="formData.enabled">
            <el-radio :value="true">{{ $t('opc.s_onebit.enabledActive') }}</el-radio>
            <el-radio :value="false">{{ $t('opc.s_onebit.enabledDisabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.blockFlag')" prop="blockFlag">
          <el-radio-group v-model="formData.blockFlag">
            <el-radio :value="true">{{ $t('common.on') }}</el-radio>
            <el-radio :value="false">{{ $t('common.off') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.s_onebit.viewTitle')"
      width="700px"
      class="dialog-body-custom"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.s_onebit.ruleName')">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.userGroup')">{{ viewData.userGroup }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.responseMode')">
          <el-tag type="primary" size="small">{{ getResponseModeText(viewData.responseMode) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.responseTimeout')">{{ viewData.responseTimeout }}s</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.maxPacketCount')">{{ viewData.maxPacketCount }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.enabled')">
          <el-tag :type="viewData.enabled ? 'success' : 'info'" size="small">
            {{ viewData.enabled ? $t('common.enabled') : $t('common.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.blockFlag')">
          <el-tag :type="viewData.blockFlag ? 'danger' : 'info'" size="small">
            {{ viewData.blockFlag ? $t('common.on') : $t('common.off') }}
          </el-tag>
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
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type ResponseMode = 'NONE' | 'SINGLE_0' | 'SINGLE_1' | 'DOUBLE'

interface OnebitRule {
  id: string
  name: string
  userGroup: string
  responseMode: ResponseMode
  responseTimeout: number
  maxPacketCount: number
  enabled: boolean
  blockFlag: boolean
}

interface OnebitFormData {
  id?: string
  name: string
  userGroup: string
  responseMode: ResponseMode
  responseTimeout: number
  maxPacketCount: number
  enabled: boolean
  blockFlag: boolean
}

// 响应式数据
const tableData = ref<OnebitRule[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 用户组选项
const userGroupOptions = ref(['default', 'admin', 'operator', 'guest'])

// 表单数据
const formData = reactive<OnebitFormData>({
  id: undefined,
  name: '',
  userGroup: '',
  responseMode: 'NONE',
  responseTimeout: 30,
  maxPacketCount: 10,
  enabled: true,
  blockFlag: false
})

// 查看数据
const viewData = reactive<OnebitRule>({
  id: '',
  name: '',
  userGroup: '',
  responseMode: 'NONE',
  responseTimeout: 30,
  maxPacketCount: 10,
  enabled: true,
  blockFlag: false
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: t('opc.s_onebit.ruleNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('opc.s_onebit.ruleNamePattern'), trigger: 'blur' }
  ],
  userGroup: [{ required: true, message: t('opc.s_onebit.userGroupRequired'), trigger: 'change' }],
  responseMode: [{ required: true, message: t('opc.s_onebit.responseModeRequired'), trigger: 'change' }],
  responseTimeout: [{ required: true, message: t('opc.s_onebit.responseTimeoutRequired'), trigger: 'blur' }],
  maxPacketCount: [{ required: true, message: t('opc.s_onebit.maxPacketCountRequired'), trigger: 'blur' }]
}

// 获取应答模式文本
const getResponseModeText = (mode: ResponseMode) => {
  const texts: Record<ResponseMode, string> = {
    NONE: t('opc.s_onebit.responseModeNone'),
    SINGLE_0: t('opc.s_onebit.responseModeSingle0'),
    SINGLE_1: t('opc.s_onebit.responseModeSingle1'),
    DOUBLE: t('opc.s_onebit.responseModeDouble')
  }
  return texts[mode] || mode
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: '1',
        name: 'rule_1bit_001',
        userGroup: 'default',
        responseMode: 'DOUBLE',
        responseTimeout: 30,
        maxPacketCount: 100,
        enabled: true,
        blockFlag: false
      },
      {
        id: '2',
        name: 'rule_1bit_002',
        userGroup: 'admin',
        responseMode: 'SINGLE_0',
        responseTimeout: 60,
        maxPacketCount: 50,
        enabled: true,
        blockFlag: true
      },
      {
        id: '3',
        name: 'rule_1bit_003',
        userGroup: 'operator',
        responseMode: 'NONE',
        responseTimeout: 15,
        maxPacketCount: 200,
        enabled: false,
        blockFlag: false
      }
    ]
    total.value = 3
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    name: '',
    userGroup: '',
    responseMode: 'NONE',
    responseTimeout: 30,
    maxPacketCount: 10,
    enabled: true,
    blockFlag: false
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: OnebitRule) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 查看
const handleView = (row: OnebitRule) => {
  Object.assign(viewData, { ...row })
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (id: string) => {
  try {
    // Mock delete
    await new Promise(resolve => setTimeout(resolve, 300))
    tableData.value = tableData.value.filter(item => item.id !== id)
    total.value = tableData.value.length
    ElNotification({
      title: t('common.success'),
      message: t('opc.s_onebit.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (err) {
    // Error handling
  }
}

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    // Mock submit
    await new Promise(resolve => setTimeout(resolve, 500))
    if (isEdit.value && formData.id) {
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        tableData.value[index] = { ...formData } as OnebitRule
      }
    } else {
      const newItem: OnebitRule = {
        ...formData,
        id: Date.now().toString()
      } as OnebitRule
      tableData.value.push(newItem)
      total.value = tableData.value.length
    }
    ElNotification({
      title: t('common.success'),
      message: isEdit.value ? t('opc.s_onebit.editSuccess') : t('opc.s_onebit.addSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
    dialogVisible.value = false
  } catch (err) {
    // Error handling
  } finally {
    submitLoading.value = false
  }
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchList()
}

onMounted(() => {
  fetchList()
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

.page-button .el-button {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.page-button .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.page-table {
  margin-top: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
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

:deep(.el-tag) {
  border-radius: 6px;
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

:deep(.el-descriptions) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
}
</style>
