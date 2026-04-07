<template>
  <div class="page-container dameng-security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <span class="header-title">{{ $t('databaseSafe.s_db_dameng.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('databaseSafe.s_db_dameng.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('databaseSafe.s_db_dameng.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="dameng-table">
            <!-- 状态 -->
            <el-table-column :label="$t('databaseSafe.s_db_dameng.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('databaseSafe.s_db_dameng.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- 过滤模式 -->
            <el-table-column :label="$t('databaseSafe.s_db_dameng.filterMode')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.filterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">
                  {{ row.filterMode === 'WHITELIST' ? $t('databaseSafe.s_db_dameng.whitelist') : $t('databaseSafe.s_db_dameng.blacklist') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- SQL命令 -->
            <el-table-column :label="$t('databaseSafe.s_db_dameng.sqlCommands')" min-width="280">
              <template #default="{ row }">
                <div class="sql-tags">
                  <el-tag
                    v-for="cmd in row.sqlCommands.slice(0, 3)"
                    :key="cmd"
                    size="small"
                    class="sql-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.sqlCommands.length > 3" size="small" type="info" class="more-tag">
                    +{{ row.sqlCommands.length - 3 }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('databaseSafe.s_db_dameng.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('databaseSafe.s_db_dameng.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('databaseSafe.s_db_dameng.delete') }}
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('databaseSafe.s_db_dameng.addDialog') : $t('databaseSafe.s_db_dameng.editDialog')"
      width="550px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="140px" class="form-content">
        <!-- 规则开关 -->
        <el-form-item :label="$t('databaseSafe.s_db_dameng.policySwitch')">
          <el-switch v-model="formData.enabled" />
          <span class="form-hint">{{ formData.enabled ? $t('common.enabled') : $t('common.disabled') }}</span>
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('databaseSafe.s_db_dameng.userGroup')" required>
          <el-select v-model="formData.userGroup" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
            <el-option label="dameng_group_1" value="dameng_group_1" />
            <el-option label="dameng_group_2" value="dameng_group_2" />
            <el-option label="admin_group" value="admin_group" />
            <el-option label="db_operator" value="db_operator" />
          </el-select>
        </el-form-item>

        <!-- 过滤模式 -->
        <el-form-item :label="$t('databaseSafe.s_db_dameng.filterMode')">
          <el-radio-group v-model="formData.filterPolicy" class="radio-group">
            <el-radio value="WHITELIST">
              <el-tag type="success" size="small">{{ $t('databaseSafe.s_db_dameng.whitelist') }}</el-tag>
            </el-radio>
            <el-radio value="BLACKLIST">
              <el-tag type="danger" size="small">{{ $t('databaseSafe.s_db_dameng.blacklist') }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- SQL命令过滤 -->
        <el-form-item :label="$t('databaseSafe.s_db_dameng.sqlCommandsFilter')">
          <el-select v-model="formData.sqlCommands" multiple style="width: 100%" :placeholder="$t('common.pleaseSelect')">
            <el-option label="SELECT" value="SELECT" />
            <el-option label="INSERT" value="INSERT" />
            <el-option label="UPDATE" value="UPDATE" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="CREATE" value="CREATE" />
            <el-option label="DROP" value="DROP" />
            <el-option label="ALTER" value="ALTER" />
            <el-option label="GRANT" value="GRANT" />
            <el-option label="REVOKE" value="REVOKE" />
            <el-option label="TRUNCATE" value="TRUNCATE" />
            <el-option label="MERGE" value="MERGE" />
            <el-option label="CALL" value="CALL" />
          </el-select>
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
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Coin, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface DamengSecurityConfig {
  id: string
  userGroup: string
  enabled: boolean
  filterPolicy: 'WHITELIST' | 'BLACKLIST'
  sqlCommands: string[]
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')

// 模拟数据
const mockData = ref<DamengSecurityConfig[]>([
  {
    id: '1',
    userGroup: 'dameng_group_1',
    enabled: true,
    filterPolicy: 'BLACKLIST',
    sqlCommands: ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'GRANT']
  },
  {
    id: '2',
    userGroup: 'admin_group',
    enabled: true,
    filterPolicy: 'WHITELIST',
    sqlCommands: ['SELECT', 'INSERT', 'UPDATE']
  },
  {
    id: '3',
    userGroup: 'db_operator',
    enabled: false,
    filterPolicy: 'BLACKLIST',
    sqlCommands: ['DROP', 'CREATE', 'ALTER', 'GRANT']
  }
])

const tableData = ref<DamengSecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<DamengSecurityConfig>({
  id: '',
  userGroup: '',
  enabled: true,
  filterPolicy: 'BLACKLIST',
  sqlCommands: []
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

const handleToggle = (row: DamengSecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('databaseSafe.s_db_dameng.enableSuccess') : t('databaseSafe.s_db_dameng.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    userGroup: '',
    enabled: true,
    filterPolicy: 'BLACKLIST',
    sqlCommands: []
  })
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: DamengSecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    sqlCommands: [...row.sqlCommands]
  })
  formVisible.value = true
}

const handleDelete = async (row: DamengSecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('databaseSafe.s_db_dameng.deleteConfirm', { name: row.userGroup }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('databaseSafe.s_db_dameng.deleteSuccess'),
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
      message: formMode.value === 'add' ? t('databaseSafe.s_db_dameng.addSuccess') : t('databaseSafe.s_db_dameng.editSuccess'),
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

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.dameng-security-page {
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
  background: linear-gradient(135deg, #E6A23C 0%, #409EFF 100%);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
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
.dameng-table {
  width: 100%;
}

.dameng-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.dameng-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.dameng-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

/* SQL标签 */
.sql-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sql-tag {
  background: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.3);
  color: #E6A23C;
}

.more-tag {
  background: rgba(144, 147, 153, 0.1);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
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

.form-content {
  max-height: 60vh;
  overflow-y: auto;
}

.form-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

/* 单选按钮组 */
.radio-group :deep(.el-radio) {
  margin-right: 20px;
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
