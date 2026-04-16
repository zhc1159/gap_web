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
    <div class="main-card">
      <div class="card-content">
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-info">{{ $t('opc.fins.selectedCount', { count: selectedRows.length }) }}</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            {{ $t('common.batchDelete') }}
          </el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" class="fins-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <!-- 用户组 -->
          <el-table-column prop="groupName" :label="$t('opc.fins.groupName')" min-width="130">
            <template #default="{ row }">
              <span class="group-name">{{ row.groupName }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('opc.fins.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- GCT限制 -->
          <el-table-column prop="gct_limit" :label="$t('opc.fins.gctLimit')" width="100" align="center" />

          <!-- 读过滤 -->
          <el-table-column :label="$t('opc.fins.readFilter')" min-width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="getFilterTypeTagType(row.r_filter_type)" size="small">
                {{ getFilterTypeLabel(row.r_filter_type) }}
              </el-tag>
              <span v-if="row.table_r_tabs?.length" class="count-badge">{{ row.table_r_tabs.length }}</span>
            </template>
          </el-table-column>

          <!-- 写过滤 -->
          <el-table-column :label="$t('opc.fins.writeFilter')" min-width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="getFilterTypeTagType(row.w_filter_type)" size="small">
                {{ getFilterTypeLabel(row.w_filter_type) }}
              </el-tag>
              <span v-if="row.table_w_tabs?.length" class="count-badge">{{ row.table_w_tabs.length }}</span>
            </template>
          </el-table-column>

          <!-- 命令过滤 -->
          <el-table-column :label="$t('opc.fins.cmdFilter')" min-width="140">
            <template #default="{ row }">
              <div class="cmd-tags">
                <el-tag v-for="cat in getActiveCmdCategories(row.commandFilter)" :key="cat" type="primary" size="small" class="cmd-tag">{{ cat }}</el-tag>
                <span v-if="getActiveCmdCategories(row.commandFilter).length === 0" class="empty-text">-</span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('opc.fins.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button size="small" class="btn-view" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('opc.fins.view') }}
                </el-button>
                <el-button type="primary" size="small" @click="handleEdit(row)">
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

    <!-- 添加/编辑对话框（6步Stepper） -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.fins.editDialog') : $t('opc.fins.addDialog')"
      width="720px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <div class="wizard-steps">
        <el-steps :active="5" align-center>
          <el-step :title="$t('opc.fins.step.basic')" :icon="Setting"
            :status="stepVisible[0] ? 'process' : 'wait'"
            @click.native="scrollToStep(0)" class="clickable-step" />
          <el-step :title="$t('opc.fins.step.readFilter')" :icon="Setting"
            :status="stepVisible[1] ? 'process' : 'wait'"
            @click.native="scrollToStep(1)" class="clickable-step" />
          <el-step :title="$t('opc.fins.step.writeFilter')" :icon="Setting"
            :status="stepVisible[2] ? 'process' : 'wait'"
            @click.native="scrollToStep(2)" class="clickable-step" />
          <el-step :title="$t('opc.fins.step.sourceFilter')" :icon="Setting"
            :status="stepVisible[3] ? 'process' : 'wait'"
            @click.native="scrollToStep(3)" class="clickable-step" />
          <el-step :title="$t('opc.fins.step.destFilter')" :icon="Setting"
            :status="stepVisible[4] ? 'process' : 'wait'"
            @click.native="scrollToStep(4)" class="clickable-step" />
          <el-step :title="$t('opc.fins.step.commandFilter')" :icon="Setting"
            :status="stepVisible[5] ? 'process' : 'wait'"
            @click.native="scrollToStep(5)" class="clickable-step" />
        </el-steps>
      </div>

      <div class="wizard-content" ref="wizardContentRef">
        <el-form :model="formData" :rules="formRules" ref="formRef" label-width="140px" class="form-content">

          <!-- Step 1: 基本设置 -->
          <div id="step-0" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.basic') }}</span>
            </div>
            <el-form-item :label="$t('opc.fins.ruleSwitch')">
              <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
            </el-form-item>
            <el-form-item :label="$t('opc.fins.groupName')" prop="groupName">
              <el-select v-model="formData.groupName" :placeholder="$t('opc.fins.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
                <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('opc.fins.gctLimit')" prop="gct_limit">
              <el-input-number v-model="formData.gct_limit" :min="0" controls-position="right" style="width: 100%" />
              <div class="form-tip">{{ $t('opc.fins.gctLimitTip') }}</div>
            </el-form-item>
            <el-form-item :label="$t('opc.fins.norespDisable')">
              <el-select v-model="formData.noresp_disable" style="width: 100%">
                <el-option :label="$t('opc.fins.noresp.disable')" :value="0" />
                <el-option :label="$t('opc.fins.noresp.enable')" :value="1" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Step 2: 读过滤 -->
          <div id="step-1" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.readFilter') }}</span>
            </div>
            <el-form-item :label="$t('opc.fins.filterType')">
              <el-select v-model="formData.r_filter_type" style="width: 100%">
                <el-option :label="$t('opc.fins.filterTypeOptions.noLimit')" :value="0" />
                <el-option :label="$t('opc.fins.filterTypeOptions.blacklist')" :value="1" />
                <el-option :label="$t('opc.fins.filterTypeOptions.whitelist')" :value="2" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="small" @click="openAreaModal('r')">
              <el-icon><Plus /></el-icon> {{ $t('opc.fins.addEntry') }}
            </el-button>
            <div v-if="formData.table_r_tabs.length > 0" class="dynamic-table-section">
              <el-table :data="formData.table_r_tabs" size="small" border>
                <el-table-column prop="area" :label="$t('opc.fins.filter.area')" width="100" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.area.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="begin" :label="$t('opc.fins.filter.begin')" width="130" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.begin.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="end" :label="$t('opc.fins.filter.end')" width="130" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.end.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column :label="$t('opc.fins.actions')" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" link @click="formData.table_r_tabs.splice($index, 1)">{{ $t('opc.fins.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- Step 3: 写过滤 -->
          <div id="step-2" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.writeFilter') }}</span>
            </div>
            <el-form-item :label="$t('opc.fins.filterType')">
              <el-select v-model="formData.w_filter_type" style="width: 100%">
                <el-option :label="$t('opc.fins.filterTypeOptions.noLimit')" :value="0" />
                <el-option :label="$t('opc.fins.filterTypeOptions.blacklist')" :value="1" />
                <el-option :label="$t('opc.fins.filterTypeOptions.whitelist')" :value="2" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="small" @click="openAreaModal('w')">
              <el-icon><Plus /></el-icon> {{ $t('opc.fins.addEntry') }}
            </el-button>
            <div v-if="formData.table_w_tabs.length > 0" class="dynamic-table-section">
              <el-table :data="formData.table_w_tabs" size="small" border>
                <el-table-column prop="area" :label="$t('opc.fins.filter.area')" width="100" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.area.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="begin" :label="$t('opc.fins.filter.begin')" width="130" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.begin.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="end" :label="$t('opc.fins.filter.end')" width="130" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.end.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column :label="$t('opc.fins.actions')" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" link @click="formData.table_w_tabs.splice($index, 1)">{{ $t('opc.fins.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- Step 4: 源过滤 -->
          <div id="step-3" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.sourceFilter') }}</span>
            </div>
            <el-form-item :label="$t('opc.fins.filterType')">
              <el-select v-model="formData.s_filter_type" style="width: 100%">
                <el-option :label="$t('opc.fins.filterTypeOptions.noLimit')" :value="0" />
                <el-option :label="$t('opc.fins.filterTypeOptions.blacklist')" :value="1" />
                <el-option :label="$t('opc.fins.filterTypeOptions.whitelist')" :value="2" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="small" @click="openAddrModal('s')">
              <el-icon><Plus /></el-icon> {{ $t('opc.fins.addEntry') }}
            </el-button>
            <div v-if="formData.table_s_tabs.length > 0" class="dynamic-table-section">
              <el-table :data="formData.table_s_tabs" size="small" border>
                <el-table-column prop="begin" :label="$t('opc.fins.filter.begin')" width="150" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.begin.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="end" :label="$t('opc.fins.filter.end')" width="150" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.end.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column :label="$t('opc.fins.actions')" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" link @click="formData.table_s_tabs.splice($index, 1)">{{ $t('opc.fins.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- Step 5: 目的过滤 -->
          <div id="step-4" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.destFilter') }}</span>
            </div>
            <el-form-item :label="$t('opc.fins.filterType')">
              <el-select v-model="formData.d_filter_type" style="width: 100%">
                <el-option :label="$t('opc.fins.filterTypeOptions.noLimit')" :value="0" />
                <el-option :label="$t('opc.fins.filterTypeOptions.blacklist')" :value="1" />
                <el-option :label="$t('opc.fins.filterTypeOptions.whitelist')" :value="2" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="small" @click="openAddrModal('d')">
              <el-icon><Plus /></el-icon> {{ $t('opc.fins.addEntry') }}
            </el-button>
            <div v-if="formData.table_d_tabs.length > 0" class="dynamic-table-section">
              <el-table :data="formData.table_d_tabs" size="small" border>
                <el-table-column prop="begin" :label="$t('opc.fins.filter.begin')" width="150" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.begin.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column prop="end" :label="$t('opc.fins.filter.end')" width="150" align="center">
                  <template #default="{ row }"><span class="hex-value">0x{{ row.end.toUpperCase() }}</span></template>
                </el-table-column>
                <el-table-column :label="$t('opc.fins.actions')" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" link @click="formData.table_d_tabs.splice($index, 1)">{{ $t('opc.fins.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- Step 6: 命令过滤 -->
          <div id="step-5" class="step-panel">
            <div class="step-section-header">
              <div class="section-dot" />
              <span>{{ $t('opc.fins.step.commandFilter') }}</span>
            </div>
            <el-collapse v-model="activeCategories" class="command-collapse">
              <el-collapse-item v-for="cat in commandCategories" :key="cat.key" :title="cat.label" :name="cat.key">
                <el-checkbox-group v-model="formData.commandFilter[cat.key]" class="command-checkbox-group">
                  <el-checkbox v-for="cmd in cat.commands" :key="cmd.value" :value="cmd.value" :label="cmd.value">
                    {{ cmd.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
            </el-collapse>
          </div>

        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加区域条目弹窗(Step 2/3) -->
    <el-dialog v-model="areaModalVisible" :title="$t('opc.fins.addFilterEntry')" width="440px" class="form-dialog" append-to-body>
      <el-form :model="areaForm" :rules="areaRules" ref="areaFormRef" label-width="100px">
        <el-form-item :label="$t('opc.fins.filter.area')" prop="area">
          <el-input v-model="areaForm.area" placeholder="00 - FF" maxlength="2">
            <template #prefix>0x</template>
          </el-input>
          <div class="form-tip">{{ $t('opc.fins.filter.areaTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('opc.fins.filter.begin')" prop="begin">
          <el-input v-model="areaForm.begin" placeholder="000000 - FFFFFF" maxlength="6">
            <template #prefix>0x</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('opc.fins.filter.end')" prop="end">
          <el-input v-model="areaForm.end" placeholder="000000 - FFFFFF" maxlength="6">
            <template #prefix>0x</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="areaModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmAreaEntry">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 添加地址条目弹窗(Step 4/5) -->
    <el-dialog v-model="addrModalVisible" :title="$t('opc.fins.addAddrEntry')" width="440px" class="form-dialog" append-to-body>
      <el-form :model="addrForm" :rules="addrRules" ref="addrFormRef" label-width="100px">
        <el-form-item :label="$t('opc.fins.filter.begin')" prop="begin">
          <el-input v-model="addrForm.begin" placeholder="000000 - FFFFFF" maxlength="6">
            <template #prefix>0x</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('opc.fins.filter.end')" prop="end">
          <el-input v-model="addrForm.end" placeholder="000000 - FFFFFF" maxlength="6">
            <template #prefix>0x</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addrModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmAddrEntry">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" :title="$t('opc.fins.viewDetail')" width="700px" class="view-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.fins.groupName')">{{ viewData.groupName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.fins.enabled') : $t('opc.fins.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.gctLimit')">{{ viewData.gct_limit }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.norespDisable')">
          {{ viewData.noresp_disable === 0 ? $t('opc.fins.noresp.disable') : $t('opc.fins.noresp.enable') }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.readFilter')">
          <el-tag :type="getFilterTypeTagType(viewData.r_filter_type)" size="small">{{ getFilterTypeLabel(viewData.r_filter_type) }}</el-tag>
          <span v-if="viewData.table_r_tabs?.length" class="count-badge">{{ viewData.table_r_tabs.length }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.writeFilter')">
          <el-tag :type="getFilterTypeTagType(viewData.w_filter_type)" size="small">{{ getFilterTypeLabel(viewData.w_filter_type) }}</el-tag>
          <span v-if="viewData.table_w_tabs?.length" class="count-badge">{{ viewData.table_w_tabs.length }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.sourceFilter')">
          <el-tag :type="getFilterTypeTagType(viewData.s_filter_type)" size="small">{{ getFilterTypeLabel(viewData.s_filter_type) }}</el-tag>
          <span v-if="viewData.table_s_tabs?.length" class="count-badge">{{ viewData.table_s_tabs.length }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.destFilter')">
          <el-tag :type="getFilterTypeTagType(viewData.d_filter_type)" size="small">{{ getFilterTypeLabel(viewData.d_filter_type) }}</el-tag>
          <span v-if="viewData.table_d_tabs?.length" class="count-badge">{{ viewData.table_d_tabs.length }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.fins.cmdFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="cat in getActiveCmdCategories(viewData.commandFilter)" :key="cat" type="primary" size="small" class="view-tag">{{ cat }}</el-tag>
            <span v-if="getActiveCmdCategories(viewData.commandFilter).length === 0">-</span>
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
import { ref, reactive, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, View, Edit, Delete, Setting } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface AreaTab { area: string; begin: string; end: string }
interface AddrTab { begin: string; end: string }
interface CommandFilter {
  MEMORY_AREA: number[]; PARAMETER_AREA: number[]; PROGRAM_AREA: number[]
  CONTROL: number[]; CONTROLLER_DATA: number[]; STATUS: number[]
  CLOCK: number[]; TEST: number[]; MESSAGE: number[]
  ACCESS_RIGHT: number[]; ERROR: number[]; FILE: number[]
  FORCED: number[]; NAME: number[]
}
interface FinsRule {
  id: string; groupName: string; rule_work: boolean
  gct_limit: number; noresp_disable: number
  r_filter_type: number; table_r_tabs: AreaTab[]
  w_filter_type: number; table_w_tabs: AreaTab[]
  s_filter_type: number; table_s_tabs: AddrTab[]
  d_filter_type: number; table_d_tabs: AddrTab[]
  commandFilter: CommandFilter
}

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

const commandCategories = [
  { key: 'MEMORY_AREA' as const, label: t('opc.fins.cmdCategory.MEMORY_AREA'), commands: [
    { value: 0, label: 'Memory Area Read' }, { value: 1, label: 'Memory Area Write' },
    { value: 2, label: 'Memory Area Fill' }, { value: 3, label: 'Memory Area Transfer' }
  ]},
  { key: 'PARAMETER_AREA' as const, label: t('opc.fins.cmdCategory.PARAMETER_AREA'), commands: [
    { value: 0, label: 'Parameter Area Read' }, { value: 1, label: 'Parameter Area Write' }
  ]},
  { key: 'PROGRAM_AREA' as const, label: t('opc.fins.cmdCategory.PROGRAM_AREA'), commands: [
    { value: 0, label: 'Program Area Read' }, { value: 1, label: 'Program Area Write' },
    { value: 2, label: 'Program Area Clear' }
  ]},
  { key: 'CONTROL' as const, label: t('opc.fins.cmdCategory.CONTROL'), commands: [
    { value: 0, label: 'Run' }, { value: 1, label: 'Stop' }, { value: 2, label: 'Reset' }
  ]},
  { key: 'CONTROLLER_DATA' as const, label: t('opc.fins.cmdCategory.CONTROLLER_DATA'), commands: [
    { value: 0, label: 'Controller Data Read' }
  ]},
  { key: 'STATUS' as const, label: t('opc.fins.cmdCategory.STATUS'), commands: [
    { value: 0, label: 'Status Read' }, { value: 1, label: 'Status Read All' }
  ]},
  { key: 'CLOCK' as const, label: t('opc.fins.cmdCategory.CLOCK'), commands: [
    { value: 0, label: 'Clock Read' }, { value: 1, label: 'Clock Write' }
  ]},
  { key: 'TEST' as const, label: t('opc.fins.cmdCategory.TEST'), commands: [
    { value: 0, label: 'Echo Back' }
  ]},
  { key: 'MESSAGE' as const, label: t('opc.fins.cmdCategory.MESSAGE'), commands: [
    { value: 0, label: 'Message Read' }, { value: 1, label: 'Message Write' },
    { value: 2, label: 'Message Clear' }
  ]},
  { key: 'ACCESS_RIGHT' as const, label: t('opc.fins.cmdCategory.ACCESS_RIGHT'), commands: [
    { value: 0, label: 'Access Right Read' }, { value: 1, label: 'Access Right Write' },
    { value: 2, label: 'Access Right Cancel' }
  ]},
  { key: 'ERROR' as const, label: t('opc.fins.cmdCategory.ERROR'), commands: [
    { value: 0, label: 'Error Read' }, { value: 1, label: 'Error Read All' },
    { value: 2, label: 'Error Clear' }, { value: 3, label: 'Error Clear All' }
  ]},
  { key: 'FILE' as const, label: t('opc.fins.cmdCategory.FILE'), commands: [
    { value: 0, label: 'File Read' }, { value: 1, label: 'File Write' },
    { value: 2, label: 'File Transfer' }, { value: 3, label: 'File Delete' }
  ]},
  { key: 'FORCED' as const, label: t('opc.fins.cmdCategory.FORCED'), commands: [
    { value: 0, label: 'Forced Set' }, { value: 1, label: 'Forced Cancel' },
    { value: 2, label: 'Forced Cancel All' }, { value: 3, label: 'Forced Status' }
  ]},
  { key: 'NAME' as const, label: t('opc.fins.cmdCategory.NAME'), commands: [
    { value: 0, label: 'Name Read' }, { value: 1, label: 'Name Write' }
  ]}
]

// ==================== 辅助 ====================
const getFilterTypeLabel = (type: number) => {
  const map: Record<number, string> = { 0: t('opc.fins.filterTypeOptions.noLimit'), 1: t('opc.fins.filterTypeOptions.blacklist'), 2: t('opc.fins.filterTypeOptions.whitelist') }
  return map[type] || '-'
}
const getFilterTypeTagType = (type: number) => ({ 0: 'info', 1: 'danger', 2: 'success' }[type] || 'info')

const emptyCmdFilter = (): CommandFilter => ({
  MEMORY_AREA: [], PARAMETER_AREA: [], PROGRAM_AREA: [], CONTROL: [],
  CONTROLLER_DATA: [], STATUS: [], CLOCK: [], TEST: [], MESSAGE: [],
  ACCESS_RIGHT: [], ERROR: [], FILE: [], FORCED: [], NAME: []
})

const getActiveCmdCategories = (cf: CommandFilter | undefined) => {
  if (!cf) return []
  return Object.keys(cf).filter(k => (cf as any)[k]?.length > 0)
}

// ==================== 状态 ====================
const selectedRows = ref<FinsRule[]>([])
const handleSelectionChange = (rows: FinsRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.fins.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.fins.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const activeCategories = ref<string[]>([])

// ==================== IntersectionObserver ====================
const stepVisible = reactive([true, false, false, false, false, false])
let scrollObserver: IntersectionObserver | null = null
const wizardContentRef = ref<HTMLElement>()

const setupScrollObserver = () => {
  if (scrollObserver) scrollObserver.disconnect()
  const container = wizardContentRef.value
  if (!container) return
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const index = parseInt(entry.target.id.replace('step-', ''))
        stepVisible[index] = entry.isIntersecting
      })
    },
    { root: container, threshold: 0.1 }
  )
  for (let i = 0; i < 6; i++) {
    const el = document.getElementById('step-' + i)
    if (el) scrollObserver!.observe(el)
  }
}

const scrollToStep = (step: number) => {
  const el = document.getElementById('step-' + step)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 子弹窗
const areaModalVisible = ref(false)
const addrModalVisible = ref(false)
const areaFormRef = ref<FormInstance>()
const addrFormRef = ref<FormInstance>()
const areaTarget = ref<'r' | 'w'>('r')
const addrTarget = ref<'s' | 'd'>('s')
const areaForm = reactive({ area: '', begin: '', end: '' })
const addrForm = reactive({ begin: '', end: '' })

// ==================== 模拟数据 ====================
const mockData = ref<FinsRule[]>([
  {
    id: '1', groupName: 'plc_control', rule_work: true, gct_limit: 2, noresp_disable: 0,
    r_filter_type: 1, table_r_tabs: [{ area: '82', begin: '000000', end: '00ffff' }],
    w_filter_type: 0, table_w_tabs: [],
    s_filter_type: 2, table_s_tabs: [{ begin: '000001', end: '0000ff' }],
    d_filter_type: 0, table_d_tabs: [],
    commandFilter: { ...emptyCmdFilter(), MEMORY_AREA: [0, 1], CONTROL: [0, 2] }
  },
  {
    id: '2', groupName: 'hmi_readonly', rule_work: true, gct_limit: 3, noresp_disable: 1,
    r_filter_type: 0, table_r_tabs: [],
    w_filter_type: 2, table_w_tabs: [{ area: 'd0', begin: '000000', end: '000100' }],
    s_filter_type: 0, table_s_tabs: [],
    d_filter_type: 1, table_d_tabs: [{ begin: '000100', end: '000200' }],
    commandFilter: { ...emptyCmdFilter(), STATUS: [0, 1], CONTROLLER_DATA: [0] }
  },
  {
    id: '3', groupName: 'scada_system', rule_work: false, gct_limit: 2, noresp_disable: 0,
    r_filter_type: 0, table_r_tabs: [],
    w_filter_type: 0, table_w_tabs: [],
    s_filter_type: 0, table_s_tabs: [],
    d_filter_type: 0, table_d_tabs: [],
    commandFilter: emptyCmdFilter()
  }
])

const tableData = ref<FinsRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  groupName: '', rule_work: true, gct_limit: 2, noresp_disable: 0,
  r_filter_type: 0, table_r_tabs: [] as AreaTab[],
  w_filter_type: 0, table_w_tabs: [] as AreaTab[],
  s_filter_type: 0, table_s_tabs: [] as AddrTab[],
  d_filter_type: 0, table_d_tabs: [] as AddrTab[],
  commandFilter: emptyCmdFilter()
})

const viewData = ref<FinsRule>({
  id: '', groupName: '', rule_work: false, gct_limit: 2, noresp_disable: 0,
  r_filter_type: 0, table_r_tabs: [], w_filter_type: 0, table_w_tabs: [],
  s_filter_type: 0, table_s_tabs: [], d_filter_type: 0, table_d_tabs: [],
  commandFilter: emptyCmdFilter()
})

const formRules: FormRules = {
  groupName: [{ required: true, message: t('opc.fins.groupNameRequired'), trigger: 'change' }],
  gct_limit: [{ required: true, message: t('opc.fins.gctLimitRequired'), trigger: 'blur' }]
}

const isValidArea = (v: string) => /^[0-9a-fA-F]{2}$/.test(v)
const isValidAddr = (v: string) => /^[0-9a-fA-F]{6}$/.test(v)

const areaRules: FormRules = {
  area: [
    { required: true, message: t('opc.fins.validation.areaRequired') },
    { validator: (_r: any, v: string, cb: Function) => { isValidArea(v) ? cb() : cb(new Error(t('opc.fins.validation.areaFormat'))) } }
  ],
  begin: [
    { required: true, message: t('opc.fins.validation.beginRequired') },
    { validator: (_r: any, v: string, cb: Function) => { isValidAddr(v) ? cb() : cb(new Error(t('opc.fins.validation.addrFormat'))) } }
  ],
  end: [
    { required: true, message: t('opc.fins.validation.endRequired') },
    { validator: (_r: any, v: string, cb: Function) => { isValidAddr(v) ? cb() : cb(new Error(t('opc.fins.validation.addrFormat'))) } }
  ]
}

const addrRules: FormRules = {
  begin: [
    { required: true, message: t('opc.fins.validation.beginRequired') },
    { validator: (_r: any, v: string, cb: Function) => { isValidAddr(v) ? cb() : cb(new Error(t('opc.fins.validation.addrFormat'))) } }
  ],
  end: [
    { required: true, message: t('opc.fins.validation.endRequired') },
    { validator: (_r: any, v: string, cb: Function) => { isValidAddr(v) ? cb() : cb(new Error(t('opc.fins.validation.addrFormat'))) } }
  ]
}

// ==================== 数据加载 ====================
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 300)
}

// ==================== 操作 ====================

const resetForm = () => {
  formData.groupName = ''; formData.rule_work = true; formData.gct_limit = 2; formData.noresp_disable = 0
  formData.r_filter_type = 0; formData.table_r_tabs = []
  formData.w_filter_type = 0; formData.table_w_tabs = []
  formData.s_filter_type = 0; formData.table_s_tabs = []
  formData.d_filter_type = 0; formData.table_d_tabs = []
  formData.commandFilter = emptyCmdFilter()
  editingId.value = ''
}

const handleAdd = () => { isEdit.value = false; resetForm(); dialogVisible.value = true; nextTick(() => setupScrollObserver()) }

const handleView = (row: FinsRule) => {
  viewData.value = { ...row, commandFilter: { ...row.commandFilter } }
  viewDialogVisible.value = true
}

const handleEdit = (row: FinsRule) => {
  isEdit.value = true; editingId.value = row.id
  formData.groupName = row.groupName; formData.rule_work = row.rule_work
  formData.gct_limit = row.gct_limit; formData.noresp_disable = row.noresp_disable
  formData.r_filter_type = row.r_filter_type; formData.table_r_tabs = row.table_r_tabs.map(t => ({ ...t }))
  formData.w_filter_type = row.w_filter_type; formData.table_w_tabs = row.table_w_tabs.map(t => ({ ...t }))
  formData.s_filter_type = row.s_filter_type; formData.table_s_tabs = row.table_s_tabs.map(t => ({ ...t }))
  formData.d_filter_type = row.d_filter_type; formData.table_d_tabs = row.table_d_tabs.map(t => ({ ...t }))
  formData.commandFilter = { ...row.commandFilter }
  dialogVisible.value = true; nextTick(() => setupScrollObserver())
}

const handleDelete = async (row: FinsRule) => {
  try {
    await ElMessageBox.confirm(t('opc.fins.deleteConfirm', { name: row.groupName }), t('common.confirm'), { type: 'warning' })
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.fins.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: FinsRule) => {
  ElNotification({ title: t('common.success'), message: t('opc.fins.editSuccess'), type: 'success', customClass: 'notification-success' })
}

// 子弹窗：区域条目
const openAreaModal = (target: 'r' | 'w') => {
  areaTarget.value = target; areaForm.area = ''; areaForm.begin = ''; areaForm.end = ''
  areaModalVisible.value = true
}
const confirmAreaEntry = () => {
  areaFormRef.value?.validate((valid) => {
    if (!valid) return
    const entry = { area: areaForm.area.toLowerCase(), begin: areaForm.begin.toLowerCase(), end: areaForm.end.toLowerCase() }
    if (areaTarget.value === 'r') formData.table_r_tabs.push(entry)
    else formData.table_w_tabs.push(entry)
    areaModalVisible.value = false
  })
}

// 子弹窗：地址条目
const openAddrModal = (target: 's' | 'd') => {
  addrTarget.value = target; addrForm.begin = ''; addrForm.end = ''
  addrModalVisible.value = true
}
const confirmAddrEntry = () => {
  addrFormRef.value?.validate((valid) => {
    if (!valid) return
    const entry = { begin: addrForm.begin.toLowerCase(), end: addrForm.end.toLowerCase() }
    if (addrTarget.value === 's') formData.table_s_tabs.push(entry)
    else formData.table_d_tabs.push(entry)
    addrModalVisible.value = false
  })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) { return }
    submitLoading.value = true
    setTimeout(() => {
      const data = {
        id: isEdit.value ? editingId.value : Date.now().toString(),
        groupName: formData.groupName, rule_work: formData.rule_work,
        gct_limit: formData.gct_limit, noresp_disable: formData.noresp_disable,
        r_filter_type: formData.r_filter_type, table_r_tabs: formData.table_r_tabs.map(t => ({ ...t })),
        w_filter_type: formData.w_filter_type, table_w_tabs: formData.table_w_tabs.map(t => ({ ...t })),
        s_filter_type: formData.s_filter_type, table_s_tabs: formData.table_s_tabs.map(t => ({ ...t })),
        d_filter_type: formData.d_filter_type, table_d_tabs: formData.table_d_tabs.map(t => ({ ...t })),
        commandFilter: { ...formData.commandFilter }
      }
      if (isEdit.value) {
        const idx = mockData.value.findIndex(item => item.id === editingId.value)
        if (idx !== -1) mockData.value[idx] = data
      } else {
        mockData.value.push(data)
      }
      submitLoading.value = false; dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('opc.fins.editSuccess') : t('opc.fins.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

fetchList()
</script>

<style scoped>
.btn-view {
  background: #606266;
  border-color: #606266;
  color: #fff;
}
.btn-view:hover {
  background: #73767a;
  border-color: #73767a;
}

.fins-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px; margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}
.header-left { display: flex; align-items: center; color: white; }
.header-icon {
  width: 36px; height: 36px; background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  margin-right: 12px; font-size: 18px;
}
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; }
.btn-add:hover { background: rgba(255, 255, 255, 0.3); }

/* ========== 页面描述 ========== */
.page-describe {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px; margin-bottom: 16px; color: #606266; font-size: 14px;
}
.describe-icon { color: #409EFF; font-size: 16px; }

/* ========== 主卡片 ========== */
.main-card {
  background: white; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}
.card-content { padding: 24px 28px; }

/* ========== 批量操作栏 ========== */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.15);
}
.batch-info {
  font-size: 13px;
  color: #606266;
}

/* ========== 表格 ========== */
.fins-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600; color: #303133; padding: 14px 12px;
}
.fins-table :deep(.el-table td.el-table__cell) { padding: 14px 12px; }
.fins-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}
.group-name { font-weight: 600; color: #409EFF; }
.count-badge {
  margin-left: 6px; background: rgba(64, 158, 255, 0.1); color: #409EFF;
  padding: 1px 6px; border-radius: 10px; font-size: 12px;
}
.cmd-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.cmd-tag { font-size: 12px; }
.empty-text { color: #c0c4cc; }
.action-btns { display: flex; gap: 6px; }
.pagination-wrapper {
  display: flex; justify-content: flex-end; margin-top: 20px;
  padding-top: 16px; border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== Stepper ========== */
.wizard-steps { padding: 0 20px 12px; }
.wizard-steps :deep(.clickable-step) { cursor: pointer; }
.wizard-steps :deep(.clickable-step:hover .el-step__title) { color: #409EFF; }

.wizard-content { padding: 24px; max-height: 55vh; overflow-y: auto; }

.step-panel {
  margin-bottom: 24px; padding-bottom: 24px;
  border-bottom: 1px dashed rgba(64, 158, 255, 0.12);
}
.step-panel:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

.step-section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 2px solid; border-image: linear-gradient(90deg, #409EFF, #67C23A) 1;
  font-size: 15px; font-weight: 600; color: #303133;
}
.section-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}
.form-tip { margin-top: 4px; font-size: 12px; color: #909399; }
.hex-value {
  font-family: 'Courier New', monospace; font-size: 13px;
  color: #409EFF; letter-spacing: 1px;
}
.dynamic-table-section { margin-top: 16px; }

/* ========== 命令过滤折叠面板 ========== */
.command-collapse :deep(.el-collapse-item__header) {
  font-weight: 600; font-size: 14px; color: #303133;
}
.command-checkbox-group {
  display: flex; flex-wrap: wrap; gap: 12px;
}
.command-checkbox-group .el-checkbox { min-width: 180px; }

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0; padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}
.form-dialog :deep(.el-dialog__body) { padding: 20px 24px; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid rgba(64, 158, 255, 0.1); padding: 16px 20px; }
.dialog-footer { display: flex; justify-content: center; gap: 12px; }
.form-content { max-width: 100%; }

/* ========== 查看对话框 ========== */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}
.view-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.view-tag { font-size: 12px; }
</style>
