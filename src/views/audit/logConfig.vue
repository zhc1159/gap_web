<template>
  <div class="page-container log-config-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="header-title">{{ $t('audit.logConfig.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('audit.logConfig.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <el-row :gutter="16" class="config-row">
        <!-- 日志外发配置 -->
        <el-col :span="6">
          <div class="config-card">
            <div class="card-header">
              <div class="card-icon">
                <el-icon><Promotion /></el-icon>
              </div>
              <span class="card-title">{{ $t('audit.logConfig.logForwarding') }}</span>
            </div>
            <div class="card-body">
              <el-form :model="syslogForm" label-width="80px" class="config-form">
                <el-form-item :label="$t('audit.logConfig.switch')">
                  <el-switch
                    v-model="syslogForm.switch"
                    active-text="ON"
                    inactive-text="OFF"
                  />
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.protocol')">
                  <el-radio-group v-model="syslogForm.protocol">
                    <el-radio value="TCP">TCP</el-radio>
                    <el-radio value="UDP">UDP</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.forwardAddr')">
                  <el-input
                    v-model="syslogForm.address"
                    :placeholder="$t('audit.logConfig.ipv4Placeholder')"
                  />
                  <span class="hint-text">{{ $t('audit.logConfig.ipv4Hint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.forwardPort')">
                  <el-input-number v-model="syslogForm.port" :min="1" :max="65535" class="w-full" />
                  <span class="hint-text">{{ $t('audit.logConfig.portHint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.subsystem')">
                  <el-select v-model="syslogForm.facility" class="w-full" :placeholder="$t('common.pleaseSelect')">
                    <el-option
                      v-for="item in facilityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
        <!-- 日志告警配置 -->
        <el-col :span="6">
          <div class="config-card">
            <div class="card-header">
              <div class="card-icon alarm-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <span class="card-title">{{ $t('audit.logConfig.logAlarm') }}</span>
            </div>
            <div class="card-body">
              <el-form :model="alarmForm" label-width="80px" class="config-form">
                <el-form-item :label="$t('audit.logConfig.switch')">
                  <el-switch
                    v-model="alarmForm.switch"
                    active-text="ON"
                    inactive-text="OFF"
                  />
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.alarmThreshold')">
                  <el-input-number v-model="alarmForm.warning" :min="1" :max="4096" class="w-full" />
                  <span class="hint-text hint-warning">{{ $t('audit.logConfig.thresholdHint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.mailAddr')">
                  <el-input v-model="alarmForm.address" :placeholder="$t('audit.logConfig.ipv4or6Placeholder')" />
                  <span class="hint-text">{{ $t('audit.logConfig.mailAddrHint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.destPort')">
                  <el-input-number v-model="alarmForm.port" :min="1" :max="65535" class="w-full" />
                  <span class="hint-text">{{ $t('audit.logConfig.smtpPortHint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.email')">
                  <el-input v-model="alarmForm.mail" :placeholder="$t('audit.logConfig.emailPlaceholder')" />
                  <span class="hint-text">{{ $t('audit.logConfig.emailHint') }}</span>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
        <!-- 时间策略配置 -->
        <el-col :span="6">
          <div class="config-card">
            <div class="card-header">
              <div class="card-icon time-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <span class="card-title">{{ $t('audit.logConfig.timePolicy') }}</span>
            </div>
            <div class="card-body">
              <el-form :model="crondForm" label-width="80px" class="config-form">
                <el-form-item :label="$t('audit.logConfig.switch')">
                  <el-switch
                    v-model="crondForm.switch"
                    active-text="ON"
                    inactive-text="OFF"
                  />
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.validDays')">
                  <el-input-number v-model="crondForm.maxDays" :min="1" :max="3650" class="w-full" />
                  <span class="hint-text hint-warning">{{ $t('audit.logConfig.daysHint') }}</span>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
        <!-- 日志阈值配置 -->
        <el-col :span="6">
          <div class="config-card">
            <div class="card-header">
              <div class="card-icon threshold-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <span class="card-title">{{ $t('audit.logConfig.logThreshold') }}</span>
            </div>
            <div class="card-body">
              <el-form :model="thresholdForm" label-width="80px" class="config-form">
                <el-form-item :label="$t('audit.logConfig.storageLimit')">
                  <el-input-number v-model="thresholdForm.max" :min="1" :max="100000" class="w-full" />
                  <span class="hint-text">{{ $t('audit.logConfig.storageHint') }}</span>
                </el-form-item>
                <el-form-item :label="$t('audit.logConfig.keepPercent')">
                  <el-input-number v-model="thresholdForm.percent" :min="20" :max="80" class="w-full" />
                  <span class="hint-text">{{ $t('audit.logConfig.percentHint') }}</span>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 保存按钮 -->
      <div class="save-section">
        <el-button type="primary" size="large" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          {{ $t('common.save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import { Setting, InfoFilled, Promotion, Timer, Bell, DataLine, Check } from '@element-plus/icons-vue'

const { t } = useI18n()

// 日志外发表单
const syslogForm = reactive({
  switch: false,
  protocol: 'TCP',
  address: '',
  port: 514,
  facility: 0
})

// 时间策略表单
const crondForm = reactive({
  switch: false,
  maxDays: 180
})

// 日志告警表单
const alarmForm = reactive({
  switch: false,
  warning: 1024,
  address: '',
  port: 25,
  mail: ''
})

// 日志阈值表单
const thresholdForm = reactive({
  max: 10000,
  percent: 50
})

const saving = ref(false)

// 子系统选项
const facilityOptions = [
  { label: 'local0', value: 0 },
  { label: 'local1', value: 1 },
  { label: 'local2', value: 2 },
  { label: 'local3', value: 3 },
  { label: 'local4', value: 4 },
  { label: 'local5', value: 5 },
  { label: 'local6', value: 6 },
  { label: 'local7', value: 7 },
  { label: 'user', value: 8 }
]

// 获取配置（暂不调用后台接口）
const fetchConfig = async () => {
  // Mock data for demonstration
  await new Promise(resolve => setTimeout(resolve, 300))
  // Default values already set in reactive objects
}

// 保存配置（暂不调用后台接口）
const handleSave = async () => {
  saving.value = true
  try {
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 500))
    ElNotification({
      title: t('common.success'),
      message: t('audit.logConfig.saveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (err) {
    // Error handling
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.log-config-page {
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
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

.config-row {
  margin: 0 -8px;
}

/* 配置卡片 */
.config-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  height: 100%;
  transition: all 0.3s ease;
}

.config-card:hover {
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.12);
  border-color: rgba(64, 158, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  border-radius: 12px 12px 0 0;
}

.card-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.card-icon.time-icon {
  background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%);
}

.card-icon.alarm-icon {
  background: linear-gradient(135deg, #E6A23C 0%, #b88230 100%);
}

.card-icon.threshold-icon {
  background: linear-gradient(135deg, #909399 0%, #73767a 100%);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  padding: 20px;
}

/* 表单样式 */
.config-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.config-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.config-form :deep(.el-form-item__label) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 500;
}

/* 输入框通用样式 */
.config-form :deep(.el-input__wrapper) {
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  box-shadow: none;
  transition: all 0.2s ease;
  padding: 1px 11px;
}

.config-form :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
  background: var(--card-bg);
}

.config-form :deep(.el-input__wrapper.is-focus) {
  background: var(--card-bg);
  border-color: #a0cfff;
  box-shadow: 0 2px 8px rgba(160, 199, 255, 0.15);
}

.config-form :deep(.el-input__inner) {
  color: #303133;
  font-size: 13px;
}

.config-form :deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
}

/* 数字输入框样式 */
.config-form :deep(.el-input-number) {
  width: 100%;
}

.config-form :deep(.el-input-number .el-input__wrapper) {
  padding-left: 12px;
  padding-right: 12px;
}

/* 下拉选择框样式 */
.config-form :deep(.el-select) {
  width: 100%;
}

.config-form :deep(.el-select .el-input__wrapper) {
  cursor: pointer;
}

.config-form :deep(.el-select .el-input__suffix) {
  color: var(--el-text-color-placeholder);
}

/* Switch 开关样式 */
.config-form :deep(.el-switch) {
  height: 22px;
}

.config-form :deep(.el-switch__core) {
  min-width: 44px;
  height: 22px;
  border-radius: 11px;
  background: var(--el-border-color);
  transition: all 0.3s ease;
}

.config-form :deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%);
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.3);
}

.config-form :deep(.el-switch__action) {
  width: 18px;
  height: 18px;
  background: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Radio 单选框样式 */
.config-form :deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

.config-form :deep(.el-radio) {
  margin-right: 0;
  height: 28px;
  display: flex;
  align-items: center;
}

.config-form :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border-color: #409EFF;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.config-form :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
  transition: all 0.3s ease;
}

.config-form :deep(.el-radio__inner:hover) {
  border-color: #409EFF;
}

.config-form :deep(.el-radio__label) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding-left: 6px;
}

/* 提示文本 */
.hint-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

.hint-warning {
  color: #f56c6c;
}

.w-full {
  width: 100%;
}

/* 保存按钮 */
.save-section {
  margin-top: 24px;
  text-align: center;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.save-section .el-button {
  min-width: 200px;
  font-size: 15px;
  height: 44px;
  background: var(--page-header-gradient);
  border: none;
  transition: all 0.3s ease;
}

.save-section .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

/* 响应式 */
@media (max-width: 1400px) {
  .config-row :deep(.el-col) {
    margin-bottom: 16px;
  }
}
</style>
