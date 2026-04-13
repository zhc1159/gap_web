<template>
  <div class="page-container rtsp-filter-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Film /></el-icon>
        </div>
        <span class="header-title">{{ $t('videoSafe.rtspFilter.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('videoSafe.rtspFilter.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('videoSafe.rtspFilter.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="rtsp-table">
            <!-- 状态 -->
            <el-table-column :label="$t('videoSafe.rtspFilter.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.ruleWork" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="groupName" :label="$t('videoSafe.rtspFilter.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.groupName }}</el-tag>
              </template>
            </el-table-column>

            <!-- 信令黑名单 -->
            <el-table-column :label="$t('videoSafe.rtspFilter.blackCmd')" min-width="200">
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

            <!-- 编码模式 -->
            <el-table-column :label="$t('videoSafe.rtspFilter.codecMode')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.white === 1 ? 'success' : 'danger'" size="small">
                  {{ row.white === 1 ? $t('videoSafe.rtspFilter.whitelist') : $t('videoSafe.rtspFilter.blacklist') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 编码格式 -->
            <el-table-column :label="$t('videoSafe.rtspFilter.codec')" min-width="180">
              <template #default="{ row }">
                <div class="codec-tags" v-if="row.codec.length > 0">
                  <el-tag v-for="c in row.codec.slice(0, 3)" :key="c" size="small" class="codec-tag">
                    {{ c }}
                  </el-tag>
                  <el-tag v-if="row.codec.length > 3" size="small" type="info" class="more-tag">
                    +{{ row.codec.length - 3 }}
                  </el-tag>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('videoSafe.rtspFilter.actions')" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('videoSafe.rtspFilter.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('videoSafe.rtspFilter.delete') }}
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
      :title="formMode === 'add' ? $t('videoSafe.rtspFilter.addDialog') : $t('videoSafe.rtspFilter.editDialog')"
      width="650px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="140px" class="form-content">
        <!-- RTSP安全开关 -->
        <el-form-item :label="$t('videoSafe.rtspFilter.policySwitch')">
          <el-switch v-model="formData.ruleWork" />
          <span class="form-hint">{{ formData.ruleWork ? $t('common.enabled') : $t('common.disabled') }}</span>
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('videoSafe.rtspFilter.userGroup')" required>
          <el-select v-model="formData.groupName" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
            <el-option v-for="group in userGroupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <!-- 信令黑名单 -->
        <el-form-item :label="$t('videoSafe.rtspFilter.blackCmd')">
          <el-select
            v-model="formData.blackCmd"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
            :placeholder="$t('videoSafe.rtspFilter.blackCmdPlaceholder')"
          >
            <el-option
              v-for="cmd in rtspCommandOptions"
              :key="cmd.name"
              :label="`${cmd.name} - ${cmd.desc}`"
              :value="cmd.name"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">
          <el-icon class="divider-icon"><Film /></el-icon>
          {{ $t('videoSafe.rtspFilter.codecConfig') }}
        </el-divider>

        <!-- 视频编码黑白名单模式 -->
        <el-form-item :label="$t('videoSafe.rtspFilter.codecMode')">
          <el-radio-group v-model="formData.white" class="radio-group">
            <el-radio :value="0">
              <el-tag type="danger" size="small">{{ $t('videoSafe.rtspFilter.blacklist') }}</el-tag>
            </el-radio>
            <el-radio :value="1">
              <el-tag type="success" size="small">{{ $t('videoSafe.rtspFilter.whitelist') }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 编码格式 -->
        <el-form-item :label="$t('videoSafe.rtspFilter.codec')">
          <el-select
            v-model="formData.codec"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
            :placeholder="$t('videoSafe.rtspFilter.codecPlaceholder')"
          >
            <el-option v-for="c in codecOptions" :key="c" :label="c" :value="c" />
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
import { Film, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

// 类型定义
interface RTSPFilterRule {
  id: string
  groupName: string
  ruleWork: boolean
  blackCmd: string[]
  white: number
  codec: string[]
}

interface RTSPCommand {
  name: string
  desc: string
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')

// 初始化数据选项
const userGroupOptions = ref<string[]>(['rtsp_group_1', 'rtsp_group_2', 'video_admin', 'stream_operator'])
const rtspCommandOptions = ref<RTSPCommand[]>([
  { name: 'DESCRIBE', desc: '获取媒体描述' },
  { name: 'ANNOUNCE', desc: '声明媒体信息' },
  { name: 'SETUP', desc: '建立传输通道' },
  { name: 'PLAY', desc: '开始播放' },
  { name: 'PAUSE', desc: '暂停播放' },
  { name: 'TEARDOWN', desc: '关闭会话' },
  { name: 'GET_PARAMETER', desc: '获取参数' },
  { name: 'SET_PARAMETER', desc: '设置参数' },
  { name: 'REDIRECT', desc: '重定向' },
  { name: 'RECORD', desc: '开始录制' }
])
const codecOptions = ref<string[]>(['H264', 'H265', 'MPEG2', 'MPEG4'])

// 模拟数据
const mockData = ref<RTSPFilterRule[]>([
  {
    id: '1',
    groupName: 'rtsp_group_1',
    ruleWork: true,
    blackCmd: ['ANNOUNCE', 'RECORD'],
    white: 1,
    codec: ['H264', 'H265']
  },
  {
    id: '2',
    groupName: 'video_admin',
    ruleWork: true,
    blackCmd: ['SET_PARAMETER', 'GET_PARAMETER'],
    white: 0,
    codec: ['H264', 'H265', 'MPEG2', 'MPEG4']
  },
  {
    id: '3',
    groupName: 'stream_operator',
    ruleWork: false,
    blackCmd: [],
    white: 0,
    codec: []
  }
])

const tableData = ref<RTSPFilterRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<RTSPFilterRule>({
  id: '',
  groupName: '',
  ruleWork: true,
  blackCmd: [],
  white: 0,
  codec: []
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

const handleToggle = (row: RTSPFilterRule) => {
  ElNotification({
    title: t('common.success'),
    message: row.ruleWork ? t('videoSafe.rtspFilter.enableSuccess') : t('videoSafe.rtspFilter.disableSuccess'),
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
    white: 0,
    codec: []
  })
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: RTSPFilterRule) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    blackCmd: [...row.blackCmd],
    codec: [...row.codec]
  })
  formVisible.value = true
}

const handleDelete = async (row: RTSPFilterRule) => {
  try {
    await ElMessageBox.confirm(
      t('videoSafe.rtspFilter.deleteConfirm', { name: row.groupName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('videoSafe.rtspFilter.deleteSuccess'),
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
      message: formMode.value === 'add' ? t('videoSafe.rtspFilter.addSuccess') : t('videoSafe.rtspFilter.editSuccess'),
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
.rtsp-filter-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(230, 162, 60, 0.02) 0%, rgba(144, 147, 153, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(144, 147, 153, 0.08) 100%);
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
.rtsp-table {
  width: 100%;
}

.rtsp-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.rtsp-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.rtsp-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
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
  background: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.3);
  color: #E6A23C;
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
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
  color: #E6A23C;
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
