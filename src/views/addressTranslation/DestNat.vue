<template>
  <div class="page-container dest-nat-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Promotion /></el-icon>
        </div>
        <span class="header-title">{{ $t('addressTranslation.destNat.title') }}</span>
      </div>
      <div class="header-right">
        <el-button class="btn-refresh" @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('addressTranslation.destNat.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('addressTranslation.destNat.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="dest-nat-table">
            <!-- 状态 -->
            <el-table-column :label="$t('addressTranslation.destNat.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  active-value="1"
                  inactive-value="0"
                  @change="handleToggleStatus(row)"
                />
              </template>
            </el-table-column>

            <!-- 规则名称 -->
            <el-table-column prop="name" :label="$t('addressTranslation.destNat.ruleName')" min-width="120">
              <template #default="{ row }">
                <span class="rule-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- 协议 -->
            <el-table-column :label="$t('addressTranslation.destNat.protocol')" min-width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getProtocolTagType(row.proto)" size="small">
                  {{ row.proto || $t('addressTranslation.destNat.any') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 源地址 -->
            <el-table-column :label="$t('addressTranslation.destNat.sourceAddr')" min-width="110">
              <template #default="{ row }">
                <span>{{ row.ip_group_src || $t('addressTranslation.destNat.any') }}</span>
              </template>
            </el-table-column>

            <!-- 源端口 -->
            <el-table-column :label="$t('addressTranslation.destNat.sourcePort')" min-width="90">
              <template #default="{ row }">
                <span>{{ row.src_port || $t('addressTranslation.destNat.any') }}</span>
              </template>
            </el-table-column>

            <!-- 目的虚拟地址 -->
            <el-table-column :label="$t('addressTranslation.destNat.destVirtualAddr')" min-width="120">
              <template #default="{ row }">
                <span class="virtual-addr">{{ row.ip_group_dst || $t('addressTranslation.destNat.any') }}</span>
              </template>
            </el-table-column>

            <!-- 目的虚拟端口 -->
            <el-table-column :label="$t('addressTranslation.destNat.destVirtualPort')" min-width="110">
              <template #default="{ row }">
                <span>{{ row.dst_port || $t('addressTranslation.destNat.any') }}</span>
              </template>
            </el-table-column>

            <!-- 转换目的地址 -->
            <el-table-column :label="$t('addressTranslation.destNat.toDestAddr')" min-width="120">
              <template #default="{ row }">
                <span class="real-addr">{{ row.to_dest_addr }}</span>
              </template>
            </el-table-column>

            <!-- 转换目的端口 -->
            <el-table-column :label="$t('addressTranslation.destNat.toDestPort')" min-width="100">
              <template #default="{ row }">
                <span>{{ row.to_dest_port || $t('addressTranslation.destNat.any') }}</span>
              </template>
            </el-table-column>

            <!-- 方向 -->
            <el-table-column :label="$t('addressTranslation.destNat.direction')" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.where === 'in' ? 'success' : 'warning'" size="small">
                  {{ row.where === 'in' ? $t('addressTranslation.destNat.inToOut') : $t('addressTranslation.destNat.outToIn') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('addressTranslation.destNat.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('addressTranslation.destNat.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('addressTranslation.destNat.delete') }}
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
      :title="formMode === 'add' ? $t('addressTranslation.destNat.addDialog') : $t('addressTranslation.destNat.editDialog')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <!-- 基本信息 -->
        <el-divider content-position="left">
          <el-icon class="divider-icon"><Setting /></el-icon>
          {{ $t('addressTranslation.destNat.basicConfig') }}
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.ruleName')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('addressTranslation.destNat.ruleNamePlaceholder')"
                :disabled="formMode === 'edit'"
                maxlength="31"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.statusSwitch')">
              <el-switch v-model="formData.enabled" active-value="1" inactive-value="0" />
              <span class="form-hint">{{ formData.enabled === '1' ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.protocol')" prop="proto">
              <el-select v-model="formData.proto" :placeholder="$t('common.pleaseSelect')" style="width: 100%" @change="handleProtocolChange">
                <el-option :label="$t('addressTranslation.destNat.any')" value="" />
                <el-option label="TCP" value="tcp" />
                <el-option label="UDP" value="udp" />
                <el-option label="ICMP" value="icmp" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.direction')" prop="where">
              <el-select
                v-model="formData.where"
                :placeholder="$t('common.pleaseSelect')"
                style="width: 100%"
                :disabled="formMode === 'edit'"
                @change="handleDirectionChange"
              >
                <el-option :label="$t('addressTranslation.destNat.inToOut')" value="in" />
                <el-option :label="$t('addressTranslation.destNat.outToIn')" value="out" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 匹配条件 -->
        <el-divider content-position="left">
          <el-icon class="divider-icon"><Filter /></el-icon>
          {{ $t('addressTranslation.destNat.matchCondition') }}
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.inInterface')">
              <el-select v-model="formData.eth_in" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
                <el-option v-for="item in interfaceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.sourceAddr')">
              <el-input v-model="formData.ip_group_src" :placeholder="$t('addressTranslation.destNat.addrPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.sourcePort')" v-if="showPortFields">
              <el-input v-model="formData.src_port" :placeholder="$t('addressTranslation.destNat.portPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.destVirtualAddr')">
              <el-input v-model="formData.ip_group_dst" :placeholder="$t('addressTranslation.destNat.addrPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.destVirtualPort')" v-if="showPortFields">
              <el-input v-model="formData.dst_port" :placeholder="$t('addressTranslation.destNat.portPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 转换配置 -->
        <el-divider content-position="left">
          <el-icon class="divider-icon"><RefreshRight /></el-icon>
          {{ $t('addressTranslation.destNat.natConfig') }}
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.toDestAddr')" prop="to_dest_addr">
              <el-input v-model="formData.to_dest_addr" :placeholder="$t('addressTranslation.destNat.addrPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.toDestPort')" v-if="showPortFields">
              <el-input v-model="formData.to_dest_port" :placeholder="$t('addressTranslation.destNat.portPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('addressTranslation.destNat.priority')" prop="priority">
              <el-input-number v-model="formData.priority" :min="1" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { Promotion, Plus, Refresh, InfoFilled, Edit, Delete, Setting, Filter, RefreshRight } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface DestNatRule {
  id: string
  name: string
  enabled: '1' | '0'
  proto: '' | 'tcp' | 'udp' | 'icmp'
  eth_in: string
  ip_group_src: string
  src_port: string
  ip_group_dst: string
  dst_port: string
  to_dest_addr: string
  to_dest_port: string
  where: 'in' | 'out'
  priority: number
}

interface InterfaceOption {
  label: string
  value: string
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 接口选项
const interfaceOptions = ref<InterfaceOption[]>([
  { label: 'eth0', value: 'eth0' },
  { label: 'eth1', value: 'eth1' },
  { label: 'eth2', value: 'eth2' },
  { label: 'bond0', value: 'bond0' }
])

// 模拟数据
const mockData = ref<DestNatRule[]>([
  {
    id: '1',
    name: 'dnat_rule_1',
    enabled: '1',
    proto: 'tcp',
    eth_in: 'eth0',
    ip_group_src: '192.168.1.0/24',
    src_port: '',
    ip_group_dst: '10.0.0.100',
    dst_port: '80',
    to_dest_addr: '172.16.0.50',
    to_dest_port: '8080',
    where: 'in',
    priority: 10
  },
  {
    id: '2',
    name: 'dnat_rule_2',
    enabled: '1',
    proto: 'tcp',
    eth_in: 'eth1',
    ip_group_src: '',
    src_port: '',
    ip_group_dst: '10.0.0.200',
    dst_port: '443',
    to_dest_addr: '172.16.0.100',
    to_dest_port: '443',
    where: 'out',
    priority: 20
  },
  {
    id: '3',
    name: 'dnat_rule_3',
    enabled: '0',
    proto: 'udp',
    eth_in: 'eth0',
    ip_group_src: '10.10.0.0/16',
    src_port: '',
    ip_group_dst: '10.0.0.50',
    dst_port: '53',
    to_dest_addr: '192.168.100.1',
    to_dest_port: '53',
    where: 'in',
    priority: 30
  }
])

const tableData = ref<DestNatRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<DestNatRule>({
  id: '',
  name: '',
  enabled: '1',
  proto: '',
  eth_in: '',
  ip_group_src: '',
  src_port: '',
  ip_group_dst: '',
  dst_port: '',
  to_dest_addr: '',
  to_dest_port: '',
  where: 'in',
  priority: 1
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('addressTranslation.destNat.ruleNameRequired'), trigger: 'blur' },
    { max: 31, message: t('addressTranslation.destNat.ruleNameMaxLength'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('addressTranslation.destNat.ruleNamePattern'), trigger: 'blur' }
  ],
  to_dest_addr: [
    { required: true, message: t('addressTranslation.destNat.toDestAddrRequired'), trigger: 'blur' }
  ],
  where: [
    { required: true, message: t('addressTranslation.destNat.directionRequired'), trigger: 'change' }
  ]
}

// 计算属性：是否显示端口字段（TCP/UDP时显示）
const showPortFields = computed(() => {
  return ['tcp', 'udp'].includes(formData.proto)
})

// 列表方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const handleRefresh = () => {
  fetchList()
}

const handleToggleStatus = (row: DestNatRule) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled === '1' ? t('addressTranslation.destNat.enableSuccess') : t('addressTranslation.destNat.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    enabled: '1',
    proto: '',
    eth_in: '',
    ip_group_src: '',
    src_port: '',
    ip_group_dst: '',
    dst_port: '',
    to_dest_addr: '',
    to_dest_port: '',
    where: 'in',
    priority: 1
  })
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: DestNatRule) => {
  formMode.value = 'edit'
  Object.assign(formData, { ...row })
  formVisible.value = true
}

const handleDelete = async (row: DestNatRule) => {
  try {
    await ElMessageBox.confirm(
      t('addressTranslation.destNat.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('addressTranslation.destNat.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleProtocolChange = () => {
  // 协议切换时清空端口
  if (!showPortFields.value) {
    formData.src_port = ''
    formData.dst_port = ''
    formData.to_dest_port = ''
  }
}

const handleDirectionChange = () => {
  // 方向切换时清空入口设备
  formData.eth_in = ''
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    setTimeout(() => {
      saving.value = false
      formVisible.value = false
      ElNotification({
        title: t('common.success'),
        message: formMode.value === 'add' ? t('addressTranslation.destNat.addSuccess') : t('addressTranslation.destNat.editSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
      fetchList()
    }, 1000)
  } catch {
    // 验证失败
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const getProtocolTagType = (proto: string) => {
  const types: Record<string, string> = {
    'tcp': 'success',
    'udp': 'warning',
    'icmp': 'danger'
  }
  return types[proto] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.dest-nat-page {
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

.header-right {
  display: flex;
  gap: 12px;
}

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.25);
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
  color: #606266;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(103, 194, 58, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.dest-nat-table {
  width: 100%;
}

.dest-nat-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.dest-nat-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.dest-nat-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
}

/* 规则名称 */
.rule-name {
  font-weight: 500;
  color: #303133;
}

/* 虚拟地址 */
.virtual-addr {
  color: #409EFF;
  font-family: 'Courier New', monospace;
}

/* 真实地址 */
.real-addr {
  color: #67C23A;
  font-weight: 500;
  font-family: 'Courier New', monospace;
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
  padding-right: 12px;
}

.form-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

/* 分隔线 */
.el-divider {
  margin: 24px 0 16px;
}

.el-divider :deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #909399;
}

.divider-icon {
  font-size: 16px;
  color: #67C23A;
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

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
