<template>
  <div class="page-container sip-filter-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><VideoCameraFilled /></el-icon>
        </div>
        <span class="header-title">{{ $t('videoSafe.sipFilter.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('videoSafe.sipFilter.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('videoSafe.sipFilter.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="sip-table">
            <!-- 状态 -->
            <el-table-column :label="$t('videoSafe.sipFilter.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.ruleWork" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="groupName" :label="$t('videoSafe.sipFilter.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.groupName }}</el-tag>
              </template>
            </el-table-column>

            <!-- 信令黑名单 -->
            <el-table-column :label="$t('videoSafe.sipFilter.blackCmd')" min-width="150">
              <template #default="{ row }">
                <div class="cmd-tags" v-if="row.blackCmd.length > 0">
                  <el-tag v-for="cmd in row.blackCmd.slice(0, 2)" :key="cmd" type="danger" size="small" class="cmd-tag">
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.blackCmd.length > 2" size="small" type="info" class="more-tag">
                    +{{ row.blackCmd.length - 2 }}
                  </el-tag>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 云台控制 -->
            <el-table-column :label="$t('videoSafe.sipFilter.ptzControl')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.ptzcmd.length > 0 ? 'success' : 'info'" size="small">
                  {{ row.ptzcmd.length > 0 ? `${row.ptzcmd.length} ${$t('videoSafe.sipFilter.items')}` : '-' }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 编码模式 -->
            <el-table-column :label="$t('videoSafe.sipFilter.codecMode')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.white === 1 ? 'success' : 'danger'" size="small">
                  {{ row.white === 1 ? $t('videoSafe.sipFilter.whitelist') : $t('videoSafe.sipFilter.blacklist') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 编码格式 -->
            <el-table-column :label="$t('videoSafe.sipFilter.codec')" min-width="150">
              <template #default="{ row }">
                <div class="codec-tags" v-if="row.codec.length > 0">
                  <el-tag v-for="c in row.codec.slice(0, 2)" :key="c" size="small" class="codec-tag">
                    {{ c }}
                  </el-tag>
                  <el-tag v-if="row.codec.length > 2" size="small" type="info" class="more-tag">
                    +{{ row.codec.length - 2 }}
                  </el-tag>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('videoSafe.sipFilter.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('videoSafe.sipFilter.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('videoSafe.sipFilter.delete') }}
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
      :title="formMode === 'add' ? $t('videoSafe.sipFilter.addDialog') : $t('videoSafe.sipFilter.editDialog')"
      width="750px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-scrollbar max-height="60vh">
        <el-form :model="formData" label-width="150px" class="form-content">
          <!-- SIP安全开关 -->
          <el-form-item :label="$t('videoSafe.sipFilter.policySwitch')">
            <el-switch v-model="formData.ruleWork" />
            <span class="form-hint">{{ formData.ruleWork ? $t('common.enabled') : $t('common.disabled') }}</span>
          </el-form-item>

          <!-- 用户组 -->
          <el-form-item :label="$t('videoSafe.sipFilter.userGroup')" required>
            <el-select v-model="formData.groupName" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
              <el-option v-for="group in userGroupOptions" :key="group" :label="group" :value="group" />
            </el-select>
          </el-form-item>

          <!-- 信令黑名单 -->
          <el-form-item :label="$t('videoSafe.sipFilter.blackCmd')">
            <el-select
              v-model="formData.blackCmd"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
              :placeholder="$t('videoSafe.sipFilter.blackCmdPlaceholder')"
            >
              <el-option
                v-for="cmd in sipCommandOptions"
                :key="cmd.name"
                :label="`${cmd.name} - ${cmd.desc}`"
                :value="cmd.name"
              />
            </el-select>
          </el-form-item>

          <el-divider content-position="left">
            <el-icon class="divider-icon"><VideoCameraFilled /></el-icon>
            {{ $t('videoSafe.sipFilter.ptzConfig') }}
          </el-divider>

          <!-- 云台控制配置 -->
          <el-form-item :label="$t('videoSafe.sipFilter.ptzControl')">
            <div class="ptz-config-container">
              <div
                v-for="ptz in ptzCommandOptions"
                :key="ptz.id"
                class="ptz-item"
              >
                <!-- 复选框 + 描述 -->
                <div class="ptz-header">
                  <el-checkbox
                    :model-value="isPTZEnabled(ptz.id)"
                    @change="(val: boolean) => togglePTZ(ptz.id, val)"
                  >
                    {{ ptz.desc }}
                  </el-checkbox>
                </div>

                <!-- 展开的配置项 -->
                <el-collapse-transition>
                  <div v-if="isPTZEnabled(ptz.id)" class="ptz-config">
                    <!-- 是否允许 -->
                    <div class="config-row">
                      <label>{{ $t('videoSafe.sipFilter.ptzAllow') }}:</label>
                      <el-switch
                        :model-value="getPTZConfig(ptz.id)?.allow"
                        active-color="#67c23a"
                        inactive-color="#909399"
                        @change="(val: boolean) => updatePTZConfig(ptz.id, val)"
                      />
                    </div>
                  </div>
                </el-collapse-transition>
              </div>
            </div>
          </el-form-item>

          <el-divider content-position="left">
            <el-icon class="divider-icon"><Film /></el-icon>
            {{ $t('videoSafe.sipFilter.codecConfig') }}
          </el-divider>

          <!-- 视频编码黑白名单模式 -->
          <el-form-item :label="$t('videoSafe.sipFilter.codecMode')">
            <el-radio-group v-model="formData.white" class="radio-group">
              <el-radio :value="0">
                <el-tag type="danger" size="small">{{ $t('videoSafe.sipFilter.blacklist') }}</el-tag>
              </el-radio>
              <el-radio :value="1">
                <el-tag type="success" size="small">{{ $t('videoSafe.sipFilter.whitelist') }}</el-tag>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 编码格式 -->
          <el-form-item :label="$t('videoSafe.sipFilter.codec')">
            <el-select
              v-model="formData.codec"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
              :placeholder="$t('videoSafe.sipFilter.codecPlaceholder')"
            >
              <el-option v-for="c in codecOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>

        </el-form>
      </el-scrollbar>

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
import { VideoCameraFilled, Plus, InfoFilled, Edit, Delete, Film } from '@element-plus/icons-vue'

const { t } = useI18n()

// 类型定义
interface PTZCommand {
  cmd: string
  allow: boolean
}

interface SIPFilterRule {
  id: string
  groupName: string
  ruleWork: boolean
  blackCmd: string[]
  ptzcmd: PTZCommand[]
  white: number
  codec: string[]
}

interface SIPCommand {
  name: string
  desc: string
}

interface PTZCommandOption {
  id: string
  desc: string
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')

// 初始化数据选项
const userGroupOptions = ref<string[]>(['video_group_1', 'video_group_2', 'sip_admin', 'camera_operator'])
const sipCommandOptions = ref<SIPCommand[]>([
  { name: 'INVITE', desc: '邀请会话' },
  { name: 'BYE', desc: '结束会话' },
  { name: 'CANCEL', desc: '取消请求' },
  { name: 'REGISTER', desc: '注册' },
  { name: 'OPTIONS', desc: '查询能力' },
  { name: 'SUBSCRIBE', desc: '订阅' },
  { name: 'NOTIFY', desc: '通知' },
  { name: 'MESSAGE', desc: '消息' },
  { name: 'INFO', desc: '信息' },
  { name: 'PRACK', desc: '临时响应确认' }
])
const ptzCommandOptions = ref<PTZCommandOption[]>([
  { id: 'right', desc: '云台向右' },
  { id: 'left', desc: '云台向左' },
  { id: 'down', desc: '云台向下' },
  { id: 'up', desc: '云台向上' },
  { id: 'zoom_in', desc: '画面放大' },
  { id: 'zoom_out', desc: '画面缩小' }
])
const codecOptions = ref<string[]>(['H264', 'H265', 'SVAC', 'MPEG4'])

// 模拟数据
const mockData = ref<SIPFilterRule[]>([
  {
    id: '1',
    groupName: 'video_group_1',
    ruleWork: true,
    blackCmd: ['CANCEL', 'REGISTER'],
    ptzcmd: [
      { cmd: 'right', allow: true },
      { cmd: 'left', allow: true },
      { cmd: 'zoom_in', allow: true }
    ],
    white: 1,
    codec: ['H264', 'H265', 'SVAC']
  },
  {
    id: '2',
    groupName: 'sip_admin',
    ruleWork: true,
    blackCmd: ['MESSAGE', 'INFO'],
    ptzcmd: [
      { cmd: 'up', allow: true },
      { cmd: 'down', allow: true }
    ],
    white: 0,
    codec: ['H264', 'MPEG4']
  },
  {
    id: '3',
    groupName: 'camera_operator',
    ruleWork: false,
    blackCmd: [],
    ptzcmd: [],
    white: 0,
    codec: []
  }
])

const tableData = ref<SIPFilterRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<SIPFilterRule>({
  id: '',
  groupName: '',
  ruleWork: true,
  blackCmd: [],
  ptzcmd: [],
  white: 0,
  codec: []
})

// 云台控制方法
const isPTZEnabled = (cmdId: string) => {
  return formData.ptzcmd.some(p => p.cmd === cmdId)
}

const getPTZConfig = (cmdId: string) => {
  return formData.ptzcmd.find(p => p.cmd === cmdId)
}

const togglePTZ = (cmdId: string, enabled: boolean) => {
  if (enabled) {
    if (!formData.ptzcmd.some(p => p.cmd === cmdId)) {
      formData.ptzcmd.push({
        cmd: cmdId,
        allow: true
      })
    }
  } else {
    const index = formData.ptzcmd.findIndex(p => p.cmd === cmdId)
    if (index > -1) {
      formData.ptzcmd.splice(index, 1)
    }
  }
}

const updatePTZConfig = (cmdId: string, value: boolean) => {
  const config = formData.ptzcmd.find(p => p.cmd === cmdId)
  if (config) {
    config.allow = value
  }
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

const handleToggle = (row: SIPFilterRule) => {
  ElNotification({
    title: t('common.success'),
    message: row.ruleWork ? t('videoSafe.sipFilter.enableSuccess') : t('videoSafe.sipFilter.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    groupName: '',
    ruleWork: true,
    blackCmd: [],
    ptzcmd: [],
    white: 0,
    codec: []
  })
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: SIPFilterRule) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    blackCmd: [...row.blackCmd],
    ptzcmd: row.ptzcmd.map(p => ({ ...p })),
    codec: [...row.codec]
  })
  formVisible.value = true
}

const handleDelete = async (row: SIPFilterRule) => {
  try {
    await ElMessageBox.confirm(
      t('videoSafe.sipFilter.deleteConfirm', { name: row.groupName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('videoSafe.sipFilter.deleteSuccess'),
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
      message: formMode.value === 'add' ? t('videoSafe.sipFilter.addSuccess') : t('videoSafe.sipFilter.editSuccess'),
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
.sip-filter-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(144, 147, 153, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #909399;
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
  border: 1px solid rgba(144, 147, 153, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.sip-table {
  width: 100%;
}

.sip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.sip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.sip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 命令标签 */
.cmd-tags,
.codec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cmd-tag {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
  color: #F56C6C;
}

.codec-tag {
  background: rgba(144, 147, 153, 0.1);
  border-color: rgba(144, 147, 153, 0.3);
  color: #606266;
}

.more-tag {
  background: rgba(103, 194, 58, 0.1);
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
  border-top: 1px solid rgba(144, 147, 153, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(144, 147, 153, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(144, 147, 153, 0.1);
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

/* 单选按钮组 */
.radio-group :deep(.el-radio) {
  margin-right: 20px;
}

/* 云台配置 */
.ptz-config-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ptz-item {
  padding: 12px;
  background: rgba(144, 147, 153, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(144, 147, 153, 0.1);
  transition: all 0.3s ease;
}

.ptz-item:hover {
  background: rgba(144, 147, 153, 0.05);
}

.ptz-header :deep(.el-checkbox__label) {
  font-weight: 500;
  color: #303133;
}

.ptz-config {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(144, 147, 153, 0.2);
}

.ptz-config .config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.ptz-config .config-row:last-child {
  margin-bottom: 0;
}

.ptz-config .config-row label {
  min-width: 140px;
  font-size: 13px;
  color: #606266;
}

.ptz-config .param-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ptz-config .param-inputs .el-input-number {
  width: 120px;
}

.ptz-config .separator {
  color: #909399;
}

/* 正则表格 */
.regex-table-wrapper {
  width: 100%;
}

.regex-table {
  border: 1px solid rgba(144, 147, 153, 0.1);
  border-radius: 6px;
  margin-bottom: 12px;
}

.regex-table :deep(.el-table th.el-table__cell) {
  background: rgba(144, 147, 153, 0.03);
}

.add-regex-btn {
  width: 100%;
  border-style: dashed;
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

  .ptz-config .config-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .ptz-config .config-row label {
    min-width: auto;
  }
}
</style>
