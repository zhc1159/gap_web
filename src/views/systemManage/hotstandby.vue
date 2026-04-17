<template>
  <div class="page-container hotstandby-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.hotstandby.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.hotstandby.describe') }}</span>
    </div>

    <!-- 主内容 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="zones-row">
          <!-- 内网热备 -->
          <div class="zone-panel">
            <div class="zone-title-bar">
              <div class="zone-dot inner"></div>
              <span class="zone-label">{{ $t('systemManage.hotstandby.innerTab') }}</span>
              <span class="zone-status" :class="innerConfig.switchEnabled ? (innerConfig.localModel === 'master' ? 'master' : 'backup') : 'off'">
                {{ $t('systemManage.hotstandby.localStatus') }}: {{ innerConfig.switchEnabled ? (innerConfig.localModel === 'master' ? $t('systemManage.hotstandby.statusMaster') : $t('systemManage.hotstandby.statusBackup')) : $t('common.off') }}
              </span>
            </div>

            <!-- 开关 -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-icon-wrap" :class="{ active: innerConfig.switchEnabled }">
                  <el-icon :size="16"><Connection /></el-icon>
                </div>
                <h3 class="section-title">{{ $t('systemManage.hotstandby.switchLabel') }}</h3>
                <el-switch v-model="innerConfig.switchEnabled" />
              </div>
            </div>

            <template v-if="innerConfig.switchEnabled">
              <!-- 热备模式配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.modeConfig') }}</h3>
                </div>
                <div class="config-form">
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Setting /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.mode') }}</span>
                    </div>
                    <el-select v-model="innerConfig.hotstandbyModel" style="width: 100%">
                      <el-option value="ha0" :label="$t('systemManage.hotstandby.modeHA0')" />
                    </el-select>
                  </div>
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><User /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.localRole') }}</span>
                    </div>
                    <el-select v-model="innerConfig.localModel" style="width: 100%">
                      <el-option value="master" :label="$t('systemManage.hotstandby.roleMaster')" />
                      <el-option value="backup" :label="$t('systemManage.hotstandby.roleBackup')" />
                    </el-select>
                  </div>
                </div>
              </div>

              <!-- 心跳接口配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.heartbeatConfig') }}</h3>
                </div>
                <div class="config-form">
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Link /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.peerAddr') }}</span>
                    </div>
                    <el-input v-model="innerConfig.peerBeatIp" style="width: 100%" />
                  </div>
                  <div v-if="innerConfig.localModel === 'master'" class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Key /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.masterRouteId') }}</span>
                    </div>
                    <el-input v-model="innerConfig.masterRouteId" :placeholder="$t('systemManage.hotstandby.routeIdRange')" style="width: 100%" />
                  </div>
                  <div v-if="innerConfig.localModel === 'backup'" class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Key /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.backupRouteId') }}</span>
                    </div>
                    <el-input v-model="innerConfig.backupRouteId" :placeholder="$t('systemManage.hotstandby.routeIdRange')" style="width: 100%" />
                  </div>
                </div>
              </div>

              <!-- 业务接口配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.businessConfig') }}</h3>
                  <el-button type="primary" size="small" @click="openBusinessDialog('inner')">
                    <el-icon><Plus /></el-icon>
                    {{ $t('systemManage.hotstandby.addBusiness') }}
                  </el-button>
                </div>
                <el-table :data="innerBusinessList" class="config-table" stripe>
                  <el-table-column prop="virtualInterface" :label="$t('systemManage.hotstandby.businessInterface')" min-width="120">
                    <template #default="{ row }">
                      <span class="interface-badge">{{ row.virtualInterface }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="virtualIpMask" :label="$t('systemManage.hotstandby.virtualIp')" min-width="140">
                    <template #default="{ row }">
                      <span class="ip-text">{{ row.virtualIpMask }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('common.operation')" width="60" align="center">
                    <template #default="{ $index }">
                      <el-button type="danger" size="small" circle @click="handleDeleteBusiness('inner', $index)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>

            <!-- 保存按钮 -->
            <div class="action-row">
              <el-button type="primary" class="apply-btn" @click="handleSave('inner')">
                <el-icon><Check /></el-icon>
                {{ $t('systemManage.hotstandby.actions.save') }}
              </el-button>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="zone-divider"></div>

          <!-- 外网热备 -->
          <div class="zone-panel">
            <div class="zone-title-bar">
              <div class="zone-dot outer"></div>
              <span class="zone-label">{{ $t('systemManage.hotstandby.outerTab') }}</span>
              <span class="zone-status" :class="outerConfig.switchEnabled ? (outerConfig.localModel === 'master' ? 'master' : 'backup') : 'off'">
                {{ $t('systemManage.hotstandby.localStatus') }}: {{ outerConfig.switchEnabled ? (outerConfig.localModel === 'master' ? $t('systemManage.hotstandby.statusMaster') : $t('systemManage.hotstandby.statusBackup')) : $t('common.off') }}
              </span>
            </div>

            <!-- 开关 -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-icon-wrap" :class="{ active: outerConfig.switchEnabled }">
                  <el-icon :size="16"><Connection /></el-icon>
                </div>
                <h3 class="section-title">{{ $t('systemManage.hotstandby.switchLabel') }}</h3>
                <el-switch v-model="outerConfig.switchEnabled" />
              </div>
            </div>

            <template v-if="outerConfig.switchEnabled">
              <!-- 热备模式配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.modeConfig') }}</h3>
                </div>
                <div class="config-form">
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Setting /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.mode') }}</span>
                    </div>
                    <el-select v-model="outerConfig.hotstandbyModel" style="width: 100%">
                      <el-option value="ha0" :label="$t('systemManage.hotstandby.modeHA0')" />
                    </el-select>
                  </div>
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><User /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.localRole') }}</span>
                    </div>
                    <el-select v-model="outerConfig.localModel" style="width: 100%">
                      <el-option value="master" :label="$t('systemManage.hotstandby.roleMaster')" />
                      <el-option value="backup" :label="$t('systemManage.hotstandby.roleBackup')" />
                    </el-select>
                  </div>
                </div>
              </div>

              <!-- 心跳接口配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.heartbeatConfig') }}</h3>
                </div>
                <div class="config-form">
                  <div class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Link /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.peerAddr') }}</span>
                    </div>
                    <el-input v-model="outerConfig.peerBeatIp" style="width: 100%" />
                  </div>
                  <div v-if="outerConfig.localModel === 'master'" class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Key /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.masterRouteId') }}</span>
                    </div>
                    <el-input v-model="outerConfig.masterRouteId" :placeholder="$t('systemManage.hotstandby.routeIdRange')" style="width: 100%" />
                  </div>
                  <div v-if="outerConfig.localModel === 'backup'" class="form-row">
                    <div class="form-label">
                      <el-icon class="label-icon"><Key /></el-icon>
                      <span>{{ $t('systemManage.hotstandby.backupRouteId') }}</span>
                    </div>
                    <el-input v-model="outerConfig.backupRouteId" :placeholder="$t('systemManage.hotstandby.routeIdRange')" style="width: 100%" />
                  </div>
                </div>
              </div>

              <!-- 业务接口配置 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-dot"></div>
                  <h3 class="section-title">{{ $t('systemManage.hotstandby.businessConfig') }}</h3>
                  <el-button type="primary" size="small" @click="openBusinessDialog('outer')">
                    <el-icon><Plus /></el-icon>
                    {{ $t('systemManage.hotstandby.addBusiness') }}
                  </el-button>
                </div>
                <el-table :data="outerBusinessList" class="config-table" stripe>
                  <el-table-column prop="virtualInterface" :label="$t('systemManage.hotstandby.businessInterface')" min-width="120">
                    <template #default="{ row }">
                      <span class="interface-badge">{{ row.virtualInterface }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="virtualIpMask" :label="$t('systemManage.hotstandby.virtualIp')" min-width="140">
                    <template #default="{ row }">
                      <span class="ip-text">{{ row.virtualIpMask }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('common.operation')" width="60" align="center">
                    <template #default="{ $index }">
                      <el-button type="danger" size="small" circle @click="handleDeleteBusiness('outer', $index)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>

            <!-- 保存按钮 -->
            <div class="action-row">
              <el-button type="primary" class="apply-btn" @click="handleSave('outer')">
                <el-icon><Check /></el-icon>
                {{ $t('systemManage.hotstandby.actions.save') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加业务接口弹窗 -->
    <el-dialog v-model="showBusinessDialog" :title="$t('systemManage.hotstandby.modalTitle')" width="520px">
      <el-form :model="businessForm" label-width="120px">
        <el-form-item :label="$t('systemManage.hotstandby.interfaceType')">
          <el-select v-model="businessForm.interfaceType" :placeholder="$t('systemManage.hotstandby.selectInterface')" style="width: 100%">
            <el-option label="eth0" value="eth0" />
            <el-option label="eth1" value="eth1" />
            <el-option label="eth2" value="eth2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.hotstandby.virtualInterface')">
          <el-input v-model="businessForm.virtualInterface" :placeholder="$t('systemManage.hotstandby.virtualInterfacePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.hotstandby.virtualIpMask')">
          <el-input v-model="businessForm.virtualIpMask" :placeholder="$t('systemManage.hotstandby.virtualIpMaskPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBusinessDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddBusiness">{{ $t('systemManage.hotstandby.actions.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Connection,
  InfoFilled,
  Check,
  Setting,
  User,
  Link,
  Key,
  Plus,
  Delete
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 内网配置
const innerConfig = reactive({
  switchEnabled: true,
  hotstandbyModel: 'ha0',
  localModel: 'master',
  peerBeatIp: '192.168.1.2',
  masterRouteId: '51',
  backupRouteId: '52'
})

// 外网配置
const outerConfig = reactive({
  switchEnabled: false,
  hotstandbyModel: 'ha0',
  localModel: 'backup',
  peerBeatIp: '',
  masterRouteId: '',
  backupRouteId: ''
})

// 业务接口
interface BusinessItem {
  virtualInterface: string
  virtualIpMask: string
}

const innerBusinessList = reactive<BusinessItem[]>([
  { virtualInterface: 'eth1:1', virtualIpMask: '192.168.1.100/24' }
])

const outerBusinessList = reactive<BusinessItem[]>([])

// 弹窗
const showBusinessDialog = ref(false)
const currentZone = ref<'inner' | 'outer'>('inner')
const businessForm = reactive({
  interfaceType: '',
  virtualInterface: '',
  virtualIpMask: ''
})

function openBusinessDialog(zone: 'inner' | 'outer') {
  currentZone.value = zone
  businessForm.interfaceType = ''
  businessForm.virtualInterface = ''
  businessForm.virtualIpMask = ''
  showBusinessDialog.value = true
}

function handleAddBusiness() {
  const list = currentZone.value === 'inner' ? innerBusinessList : outerBusinessList
  list.push({
    virtualInterface: businessForm.virtualInterface,
    virtualIpMask: businessForm.virtualIpMask
  })
  showBusinessDialog.value = false
  ElNotification({
    title: t('common.success'),
    message: t('systemManage.hotstandby.messages.addSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

function handleDeleteBusiness(zone: 'inner' | 'outer', index: number) {
  const list = zone === 'inner' ? innerBusinessList : outerBusinessList
  list.splice(index, 1)
}

// 保存
function handleSave(_zone: string) {
  ElNotification({
    title: t('common.success'),
    message: t('systemManage.hotstandby.messages.saveSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.hotstandby-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
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

/* ========== 页面描述 ========== */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* ========== 主卡片 ========== */
.main-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px 28px;
}

/* ========== 双栏平铺 ========== */
.zones-row {
  display: flex;
  gap: 0;
}

.zone-panel {
  flex: 1;
  min-width: 0;
  padding: 0 4px;
}

.zone-divider {
  width: 2px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.06) 0%, rgba(64, 158, 255, 0.18) 50%, rgba(103, 194, 58, 0.18) 50%, rgba(103, 194, 58, 0.06) 100%);
  border-radius: 1px;
  margin: 0 20px;
  flex-shrink: 0;
}

.zone-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.08);
}

.zone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.zone-dot.inner {
  background: linear-gradient(135deg, #409EFF, #79bbff);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.zone-dot.outer {
  background: linear-gradient(135deg, #67C23A, #95d475);
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}

.zone-label {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.zone-status {
  margin-left: auto;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.zone-status.master {
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

.zone-status.backup {
  background: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
  color: #67C23A;
}

.zone-status.off {
  background: rgba(144, 147, 153, 0.08);
  border: 1px solid rgba(144, 147, 153, 0.15);
  color: var(--el-text-color-placeholder);
}

/* ========== 区块 ========== */
.section-block {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.section-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(144, 147, 153, 0.08);
  color: var(--el-text-color-placeholder);
  transition: all 0.3s;
}

.section-icon-wrap.active {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.section-title {
  flex: 1;
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

/* ========== 配置表单 ========== */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.label-icon {
  font-size: 16px;
  color: #409EFF;
}

/* ========== 表格样式 ========== */
.config-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 12px 8px;
}

.config-table :deep(.el-table td.el-table__cell) {
  padding: 10px 8px;
}

.interface-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.15);
  color: #409EFF;
  font-family: 'Consolas', monospace;
}

.ip-text {
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #303133;
}

/* ========== 操作栏 ========== */
.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.apply-btn {
  min-width: 140px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--page-header-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s;
}

.apply-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}
</style>
