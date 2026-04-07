<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('audit.logConfig.describe') }}</div>
      <el-row :gutter="20">
        <!-- 日志外发配置 -->
        <el-col :span="6">
          <div class="config-section">
            <h3 class="section-title">
              <el-icon><Promotion /></el-icon>
              {{ $t('audit.logConfig.logForwarding') }}
            </h3>
            <el-form :model="syslogForm" label-width="100px" class="config-form">
              <el-form-item :label="$t('audit.logConfig.switch')">
                <el-switch
                  v-model="syslogForm.switch"
                  active-text="ON"
                  inactive-text="OFF"
                  :active-value="true"
                  :inactive-value="false"
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
        </el-col>
        <!-- 时间策略配置 -->
        <el-col :span="6">
          <div class="config-section">
            <h3 class="section-title">
              <el-icon><Timer /></el-icon>
              {{ $t('audit.logConfig.timePolicy') }}
            </h3>
            <el-form :model="crondForm" label-width="100px" class="config-form">
              <el-form-item :label="$t('audit.logConfig.switch')">
                <el-switch
                  v-model="crondForm.switch"
                  active-text="ON"
                  inactive-text="OFF"
                />
              </el-form-item>
              <el-form-item :label="$t('audit.logConfig.validDays')">
                <el-input-number v-model="crondForm.maxDays" :min="1" :max="3650" class="w-full" />
                <span class="hint-text text-red">{{ $t('audit.logConfig.daysHint') }}</span>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
        <!-- 日志告警配置 -->
        <el-col :span="6">
          <div class="config-section">
            <h3 class="section-title">
              <el-icon><Bell /></el-icon>
              {{ $t('audit.logConfig.logAlarm') }}
            </h3>
            <el-form :model="alarmForm" label-width="100px" class="config-form">
              <el-form-item :label="$t('audit.logConfig.switch')">
                <el-switch
                  v-model="alarmForm.switch"
                  active-text="ON"
                  inactive-text="OFF"
                />
              </el-form-item>
              <el-form-item :label="$t('audit.logConfig.alarmThreshold')">
                <el-input-number v-model="alarmForm.warning" :min="1" :max="4096" class="w-full" />
                <span class="hint-text text-red">{{ $t('audit.logConfig.thresholdHint') }}</span>
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
        </el-col>
        <!-- 日志阈值配置 -->
        <el-col :span="6">
          <div class="config-section">
            <h3 class="section-title">
              <el-icon><DataLine /></el-icon>
              {{ $t('audit.logConfig.logThreshold') }}
            </h3>
            <el-form :model="thresholdForm" label-width="100px" class="config-form">
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
import { Promotion, Timer, Bell, DataLine, Check } from '@element-plus/icons-vue'

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

// 获取配置
const fetchConfig = async () => {
  // Mock data for demonstration
  await new Promise(resolve => setTimeout(resolve, 300))
  // Default values already set in reactive objects
}

// 保存配置
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

.config-section {
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 8px;
  height: 100%;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.config-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.section-title {
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  font-size: 20px;
  color: #409EFF;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.config-form :deep(.el-form-item__label) {
  color: #606266;
  font-size: 13px;
}

.hint-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.text-red {
  color: #f56c6c;
}

.w-full {
  width: 100%;
}

.save-section {
  margin-top: 30px;
  text-align: center;
  padding-bottom: 20px;
}

.save-section .el-button {
  min-width: 200px;
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border: none;
  font-size: 16px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.save-section .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%);
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border-color: #409EFF;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
