<template>
  <div class="page-container http-security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Link /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_http.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_http.addPolicy') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_http.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('securityPolicy.s_http.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="http-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 状态 -->
            <el-table-column :label="$t('securityPolicy.s_http.status')" min-width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggle(row)" />
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('securityPolicy.s_http.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- URL过滤 -->
            <el-table-column :label="$t('securityPolicy.s_http.urlFilter')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.urlFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">
                  {{ row.urlFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 下载缓存 -->
            <el-table-column :label="$t('securityPolicy.s_http.downloadCache')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.downloadCache ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.downloadCache ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 上传缓存 -->
            <el-table-column :label="$t('securityPolicy.s_http.uploadCache')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.uploadCache ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.uploadCache ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 杀毒扫描 -->
            <el-table-column :label="$t('securityPolicy.s_http.virusScan')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.downloadVirusScan || row.uploadVirusScan" type="warning" size="small">
                  {{ $t('common.enabled') }}
                </el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('securityPolicy.s_http.actions')" min-width="220" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" class="btn-view" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('securityPolicy.s_http.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('securityPolicy.s_http.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('securityPolicy.s_http.delete') }}
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

    <!-- 步骤引导对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('securityPolicy.s_http.addDialog') : $t('securityPolicy.s_http.editDialog')"
      width="800px"
      class="wizard-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <div class="wizard-steps">
        <el-steps :active="3" align-center>
          <el-step :title="$t('securityPolicy.s_http.stepBasic')" :icon="Setting" :status="stepVisible[0] ? 'process' : 'wait'" @click.native="scrollToStep(0)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_http.stepHeader')" :icon="Document" :status="stepVisible[1] ? 'process' : 'wait'" @click.native="scrollToStep(1)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_http.stepUrl')" :icon="Link" :status="stepVisible[2] ? 'process' : 'wait'" @click.native="scrollToStep(2)" class="clickable-step" />
          <el-step :title="$t('securityPolicy.s_http.stepFile')" :icon="Folder" :status="stepVisible[3] ? 'process' : 'wait'" @click.native="scrollToStep(3)" class="clickable-step" />
        </el-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="wizard-content" ref="wizardContentRef">
        <!-- 步骤1: 基础配置 -->
        <div id="step-0" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Setting /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_http.stepBasicTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_http.stepBasicDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_http.policySwitch')">
              <el-switch v-model="formData.enabled" />
              <span class="form-hint">{{ formData.enabled ? $t('common.enabled') : $t('common.disabled') }}</span>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_http.userGroup')" required>
              <el-select v-model="formData.userGroup" style="width: 100%" :placeholder="$t('common.pleaseSelect')">
                <el-option label="http_group_1" value="http_group_1" />
                <el-option label="http_group_2" value="http_group_2" />
                <el-option label="admin_group" value="admin_group" />
                <el-option label="user_group" value="user_group" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><Filter /></el-icon>
              {{ $t('securityPolicy.s_http.contentFilter') }}
            </el-divider>

            <el-form-item :label="$t('securityPolicy.s_http.contentFilterMode')">
              <el-radio-group v-model="formData.contentFilterMode" class="radio-group">
                <el-radio value="WHITELIST">
                  <el-tag type="success" size="small">{{ $t('securityPolicy.s_http.whitelist') }}</el-tag>
                </el-radio>
                <el-radio value="BLACKLIST">
                  <el-tag type="danger" size="small">{{ $t('securityPolicy.s_http.blacklist') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_http.contentKeywords')">
              <div class="tag-input-wrapper">
                <div class="tag-list">
                  <el-tag
                    v-for="keyword in formData.contentKeywords"
                    :key="keyword"
                    type="danger"
                    closable
                    size="small"
                    @close="removeContentKeyword(keyword)"
                  >
                    {{ keyword }}
                  </el-tag>
                  <span v-if="formData.contentKeywords.length === 0" class="empty-hint">{{ $t('securityPolicy.s_http.noKeywords') }}</span>
                </div>
                <el-input
                  v-model="newContentKeyword"
                  :placeholder="$t('securityPolicy.s_http.keywordPlaceholder')"
                  @keyup.enter="addContentKeyword"
                >
                  <template #append>
                    <el-button @click="addContentKeyword">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 协议头配置 -->
        <div id="step-1" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Document /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_http.stepHeaderTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_http.stepHeaderDesc') }}</div>

          <el-form :model="formData" label-width="160px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_http.headerFilterMode')">
              <el-radio-group v-model="formData.headerFilterMode" class="radio-group">
                <el-radio value="WHITELIST">
                  <el-tag type="success" size="small">{{ $t('securityPolicy.s_http.whitelist') }}</el-tag>
                </el-radio>
                <el-radio value="BLACKLIST">
                  <el-tag type="danger" size="small">{{ $t('securityPolicy.s_http.blacklist') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('securityPolicy.s_http.headerMethods')">
              <div class="method-grid">
                <div
                  v-for="method in httpMethods"
                  :key="method"
                  class="method-card"
                  :class="{ active: formData.headerMethods.includes(method) }"
                  @click="toggleMethod(method)"
                >
                  <span class="method-name">{{ method }}</span>
                  <el-icon class="method-check">
                    <Check v-if="formData.headerMethods.includes(method)" />
                    <Close v-else />
                  </el-icon>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤3: URL过滤 -->
        <div id="step-2" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Link /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_http.stepUrlTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_http.stepUrlDesc') }}</div>

          <el-form :model="formData" label-width="140px" class="step-form">
            <el-form-item :label="$t('securityPolicy.s_http.urlFilterMode')">
              <el-radio-group v-model="formData.urlFilterMode" class="radio-group">
                <el-radio value="WHITELIST">
                  <el-tag type="success" size="small">{{ $t('securityPolicy.s_http.whitelist') }}</el-tag>
                </el-radio>
                <el-radio value="BLACKLIST">
                  <el-tag type="danger" size="small">{{ $t('securityPolicy.s_http.blacklist') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('securityPolicy.s_http.urlLengthCheckSwitch')">
              <el-switch v-model="formData.urlLengthCheck" />
            </el-form-item>

            <el-form-item v-if="formData.urlLengthCheck" :label="$t('securityPolicy.s_http.urlMaxLength')">
              <el-input-number v-model="formData.urlMaxLength" :min="0" :max="1024" style="width: 150px" />
              <span class="unit-text">{{ $t('securityPolicy.s_http.characters') }}</span>
            </el-form-item>

            <el-form-item :label="$t('securityPolicy.s_http.urlList')">
              <div class="tag-input-wrapper">
                <div class="tag-list url-list">
                  <el-tag
                    v-for="url in formData.urlList"
                    :key="url"
                    type="primary"
                    closable
                    size="small"
                    @close="removeUrl(url)"
                  >
                    {{ url }}
                  </el-tag>
                  <span v-if="formData.urlList.length === 0" class="empty-hint">{{ $t('securityPolicy.s_http.noUrls') }}</span>
                </div>
                <el-input
                  v-model="newUrl"
                  :placeholder="$t('securityPolicy.s_http.urlPlaceholder')"
                  @keyup.enter="addUrl"
                >
                  <template #append>
                    <el-button @click="addUrl">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤4: 文件传输 -->
        <div id="step-3" class="step-panel">
          <div class="step-header">
            <el-icon class="step-icon"><Folder /></el-icon>
            <span class="step-title">{{ $t('securityPolicy.s_http.stepFileTitle') }}</span>
          </div>
          <div class="step-desc">{{ $t('securityPolicy.s_http.stepFileDesc') }}</div>

          <div class="transfer-grid">
            <!-- 文件下载 -->
            <div class="transfer-card download-card">
              <div class="transfer-header">
                <el-icon><Download /></el-icon>
                <span>{{ $t('securityPolicy.s_http.downloadConfig') }}</span>
              </div>
              <el-form :model="formData" label-width="120px" class="transfer-form">
                <el-form-item :label="$t('securityPolicy.s_http.downloadCacheSwitch')">
                  <el-switch v-model="formData.downloadCache" />
                </el-form-item>
                <template v-if="formData.downloadCache">
                  <el-form-item :label="$t('securityPolicy.s_http.downloadFilterMode')">
                    <el-radio-group v-model="formData.downloadFilterMode" size="small">
                      <el-radio value="WHITELIST">{{ $t('securityPolicy.s_http.whitelist') }}</el-radio>
                      <el-radio value="BLACKLIST">{{ $t('securityPolicy.s_http.blacklist') }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item :label="$t('securityPolicy.s_http.downloadFileTypes')">
                    <el-select v-model="formData.downloadFileTypes" multiple style="width: 100%" size="small">
                      <el-option label=".txt" value=".txt" />
                      <el-option label=".pdf" value=".pdf" />
                      <el-option label=".doc" value=".doc" />
                      <el-option label=".docx" value=".docx" />
                      <el-option label=".xls" value=".xls" />
                      <el-option label=".xlsx" value=".xlsx" />
                      <el-option label=".zip" value=".zip" />
                      <el-option label=".rar" value=".rar" />
                    </el-select>
                  </el-form-item>
                </template>
                <el-form-item :label="$t('securityPolicy.s_http.downloadVirusScan')">
                  <el-switch v-model="formData.downloadVirusScan" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 文件上传 -->
            <div class="transfer-card upload-card">
              <div class="transfer-header">
                <el-icon><Upload /></el-icon>
                <span>{{ $t('securityPolicy.s_http.uploadConfig') }}</span>
              </div>
              <el-form :model="formData" label-width="120px" class="transfer-form">
                <el-form-item :label="$t('securityPolicy.s_http.uploadCacheSwitch')">
                  <el-switch v-model="formData.uploadCache" />
                </el-form-item>
                <template v-if="formData.uploadCache">
                  <el-form-item :label="$t('securityPolicy.s_http.uploadFilterMode')">
                    <el-radio-group v-model="formData.uploadFilterMode" size="small">
                      <el-radio value="WHITELIST">{{ $t('securityPolicy.s_http.whitelist') }}</el-radio>
                      <el-radio value="BLACKLIST">{{ $t('securityPolicy.s_http.blacklist') }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item :label="$t('securityPolicy.s_http.uploadFileTypes')">
                    <el-select v-model="formData.uploadFileTypes" multiple style="width: 100%" size="small">
                      <el-option label=".txt" value=".txt" />
                      <el-option label=".pdf" value=".pdf" />
                      <el-option label=".doc" value=".doc" />
                      <el-option label=".docx" value=".docx" />
                      <el-option label=".xls" value=".xls" />
                      <el-option label=".xlsx" value=".xlsx" />
                      <el-option label=".jpg" value=".jpg" />
                      <el-option label=".png" value=".png" />
                    </el-select>
                  </el-form-item>
                </template>
                <el-form-item :label="$t('securityPolicy.s_http.uploadVirusScan')">
                  <el-switch v-model="formData.uploadVirusScan" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="wizard-footer">
          <el-button @click="formVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看弹窗 -->
    <el-dialog v-model="viewVisible" :title="$t('securityPolicy.s_http.viewDetail')" width="600px">
      <div v-if="viewData" class="view-content">
        <!-- 基础信息 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_http.stepBasic') }}</div>
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.policySwitch') }}</span>
              <el-tag :type="viewData.enabled ? 'success' : 'danger'" size="small">{{ viewData.enabled ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.userGroup') }}</span>
              <span class="view-value">{{ viewData.userGroup }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.contentFilterMode') }}</span>
              <el-tag :type="viewData.contentFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">{{ viewData.contentFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.contentKeywords') }}</span>
              <span class="view-value">{{ viewData.contentKeywords.length ? viewData.contentKeywords.join(', ') : '-' }}</span>
            </div>
          </div>
        </div>
        <!-- 协议头过滤 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_http.stepHeader') }}</div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_http.headerFilterMode') }}</span>
            <el-tag :type="viewData.headerFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">{{ viewData.headerFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}</el-tag>
          </div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_http.headerMethods') }}</span>
            <span class="view-value">{{ viewData.headerMethods.length ? viewData.headerMethods.join(', ') : '-' }}</span>
          </div>
        </div>
        <!-- URL过滤 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_http.stepUrl') }}</div>
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.urlFilterMode') }}</span>
              <el-tag :type="viewData.urlFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">{{ viewData.urlFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.urlLengthCheckSwitch') }}</span>
              <el-tag :type="viewData.urlLengthCheck ? 'success' : 'info'" size="small">{{ viewData.urlLengthCheck ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item" v-if="viewData.urlLengthCheck">
              <span class="view-label">{{ $t('securityPolicy.s_http.urlMaxLength') }}</span>
              <span class="view-value">{{ viewData.urlMaxLength }} {{ $t('securityPolicy.s_http.characters') }}</span>
            </div>
          </div>
          <div class="view-item">
            <span class="view-label">{{ $t('securityPolicy.s_http.urlList') }}</span>
            <span class="view-value">{{ viewData.urlList.length ? viewData.urlList.join(', ') : '-' }}</span>
          </div>
        </div>
        <!-- 文件传输 -->
        <div class="view-section">
          <div class="view-section-title">{{ $t('securityPolicy.s_http.stepFile') }}</div>
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.downloadCacheSwitch') }}</span>
              <el-tag :type="viewData.downloadCache ? 'success' : 'info'" size="small">{{ viewData.downloadCache ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.downloadFilterMode') }}</span>
              <el-tag :type="viewData.downloadFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">{{ viewData.downloadFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.downloadFileTypes') }}</span>
              <span class="view-value">{{ viewData.downloadFileTypes.length ? viewData.downloadFileTypes.join(', ') : '-' }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.downloadVirusScan') }}</span>
              <el-tag :type="viewData.downloadVirusScan ? 'warning' : 'info'" size="small">{{ viewData.downloadVirusScan ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.uploadCacheSwitch') }}</span>
              <el-tag :type="viewData.uploadCache ? 'success' : 'info'" size="small">{{ viewData.uploadCache ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.uploadFilterMode') }}</span>
              <el-tag :type="viewData.uploadFilterMode === 'WHITELIST' ? 'success' : 'danger'" size="small">{{ viewData.uploadFilterMode === 'WHITELIST' ? $t('securityPolicy.s_http.whitelist') : $t('securityPolicy.s_http.blacklist') }}</el-tag>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.uploadFileTypes') }}</span>
              <span class="view-value">{{ viewData.uploadFileTypes.length ? viewData.uploadFileTypes.join(', ') : '-' }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">{{ $t('securityPolicy.s_http.uploadVirusScan') }}</span>
              <el-tag :type="viewData.uploadVirusScan ? 'warning' : 'info'" size="small">{{ viewData.uploadVirusScan ? $t('common.on') : $t('common.off') }}</el-tag>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Link, Plus, InfoFilled, Edit, Delete, Setting, Document, Folder, View,
  Download, Upload, ArrowLeft, ArrowRight, Check, Close, Filter
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface HttpSecurityConfig {
  id: string
  userGroup: string
  enabled: boolean
  headerFilterMode: 'WHITELIST' | 'BLACKLIST'
  headerMethods: string[]
  urlFilterMode: 'WHITELIST' | 'BLACKLIST'
  urlLengthCheck: boolean
  urlMaxLength: number
  urlList: string[]
  contentFilterMode: 'WHITELIST' | 'BLACKLIST'
  contentKeywords: string[]
  downloadCache: boolean
  downloadFilterMode: 'WHITELIST' | 'BLACKLIST'
  downloadFileTypes: string[]
  downloadVirusScan: boolean
  uploadCache: boolean
  uploadFilterMode: 'WHITELIST' | 'BLACKLIST'
  uploadFileTypes: string[]
  uploadVirusScan: boolean
}

// HTTP方法选项
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']

// 状态
const loading = ref(false)
const viewVisible = ref(false)
const viewData = ref<HttpSecurityConfig | null>(null)
const saving = ref(false)
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentStep = ref(0)
const stepVisible = reactive([true, false, false, false])
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

  for (let i = 0; i < 4; i++) {
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

const newContentKeyword = ref('')
const newUrl = ref('')

// 模拟数据
const mockData = ref<HttpSecurityConfig[]>([
  {
    id: '1',
    userGroup: 'http_group_1',
    enabled: true,
    headerFilterMode: 'BLACKLIST',
    headerMethods: ['DELETE', 'PUT'],
    urlFilterMode: 'BLACKLIST',
    urlLengthCheck: true,
    urlMaxLength: 2048,
    urlList: ['/admin/*', '/config/*'],
    contentFilterMode: 'BLACKLIST',
    contentKeywords: ['password', 'secret', 'token'],
    downloadCache: true,
    downloadFilterMode: 'BLACKLIST',
    downloadFileTypes: ['.exe', '.bat'],
    downloadVirusScan: true,
    uploadCache: true,
    uploadFilterMode: 'WHITELIST',
    uploadFileTypes: ['.txt', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    uploadVirusScan: true
  },
  {
    id: '2',
    userGroup: 'admin_group',
    enabled: true,
    headerFilterMode: 'WHITELIST',
    headerMethods: ['GET', 'POST'],
    urlFilterMode: 'WHITELIST',
    urlLengthCheck: false,
    urlMaxLength: 4096,
    urlList: ['/api/*'],
    contentFilterMode: 'BLACKLIST',
    contentKeywords: [],
    downloadCache: true,
    downloadFilterMode: 'WHITELIST',
    downloadFileTypes: ['.txt', '.pdf'],
    downloadVirusScan: false,
    uploadCache: true,
    uploadFilterMode: 'WHITELIST',
    uploadFileTypes: ['.txt', '.pdf'],
    uploadVirusScan: false
  },
  {
    id: '3',
    userGroup: 'user_group',
    enabled: false,
    headerFilterMode: 'BLACKLIST',
    headerMethods: [],
    urlFilterMode: 'BLACKLIST',
    urlLengthCheck: true,
    urlMaxLength: 1024,
    urlList: [],
    contentFilterMode: 'BLACKLIST',
    contentKeywords: [],
    downloadCache: false,
    downloadFilterMode: 'BLACKLIST',
    downloadFileTypes: [],
    downloadVirusScan: false,
    uploadCache: false,
    uploadFilterMode: 'BLACKLIST',
    uploadFileTypes: [],
    uploadVirusScan: false
  }
])

const tableData = ref<HttpSecurityConfig[]>([])

// 多选相关
const selectedRows = ref<HttpSecurityConfig[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<HttpSecurityConfig>({
  id: '',
  userGroup: '',
  enabled: true,
  headerFilterMode: 'BLACKLIST',
  headerMethods: [],
  urlFilterMode: 'BLACKLIST',
  urlLengthCheck: false,
  urlMaxLength: 2048,
  urlList: [],
  contentFilterMode: 'BLACKLIST',
  contentKeywords: [],
  downloadCache: false,
  downloadFilterMode: 'BLACKLIST',
  downloadFileTypes: [],
  downloadVirusScan: false,
  uploadCache: false,
  uploadFilterMode: 'BLACKLIST',
  uploadFileTypes: [],
  uploadVirusScan: false
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

const handleToggle = (row: HttpSecurityConfig) => {
  ElNotification({
    title: t('common.success'),
    message: row.enabled ? t('securityPolicy.s_http.enableSuccess') : t('securityPolicy.s_http.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    userGroup: '',
    enabled: true,
    headerFilterMode: 'BLACKLIST',
    headerMethods: [],
    urlFilterMode: 'BLACKLIST',
    urlLengthCheck: false,
    urlMaxLength: 2048,
    urlList: [],
    contentFilterMode: 'BLACKLIST',
    contentKeywords: [],
    downloadCache: false,
    downloadFilterMode: 'BLACKLIST',
    downloadFileTypes: [],
    downloadVirusScan: false,
    uploadCache: false,
    uploadFilterMode: 'BLACKLIST',
    uploadFileTypes: [],
    uploadVirusScan: false
  })
  newContentKeyword.value = ''
  newUrl.value = ''
  currentStep.value = 0
}

const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
  nextTick(() => setupScrollObserver())
}

const handleView = (row: HttpSecurityConfig) => {
  viewData.value = { ...row }
  viewVisible.value = true
}

const handleEdit = (row: HttpSecurityConfig) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...row,
    headerMethods: [...row.headerMethods],
    urlList: [...row.urlList],
    contentKeywords: [...row.contentKeywords],
    downloadFileTypes: [...row.downloadFileTypes],
    uploadFileTypes: [...row.uploadFileTypes]
  })
  newContentKeyword.value = ''
  newUrl.value = ''
  currentStep.value = 0
  formVisible.value = true
  nextTick(() => setupScrollObserver())
}

const handleDelete = async (row: HttpSecurityConfig) => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_http.deleteConfirm', { name: row.userGroup }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_http.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSelectionChange = (rows: HttpSecurityConfig[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('securityPolicy.s_http.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('securityPolicy.s_http.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

// 步骤导航
const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++
}

const handleSubmit = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    formVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: formMode.value === 'add' ? t('securityPolicy.s_http.addSuccess') : t('securityPolicy.s_http.editSuccess'),
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

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

// HTTP方法切换
const toggleMethod = (method: string) => {
  const index = formData.headerMethods.indexOf(method)
  if (index > -1) {
    formData.headerMethods.splice(index, 1)
  } else {
    formData.headerMethods.push(method)
  }
}

// 内容关键词操作
const addContentKeyword = () => {
  const keyword = newContentKeyword.value.trim()
  if (keyword && !formData.contentKeywords.includes(keyword)) {
    formData.contentKeywords.push(keyword)
    newContentKeyword.value = ''
  }
}

const removeContentKeyword = (keyword: string) => {
  const index = formData.contentKeywords.indexOf(keyword)
  if (index > -1) formData.contentKeywords.splice(index, 1)
}

// URL操作
const addUrl = () => {
  const url = newUrl.value.trim()
  if (url && !formData.urlList.includes(url)) {
    formData.urlList.push(url)
    newUrl.value = ''
  }
}

const removeUrl = (url: string) => {
  const index = formData.urlList.indexOf(url)
  if (index > -1) formData.urlList.splice(index, 1)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.btn-view {
  background: #606266;
  border-color: var(--el-text-color-secondary);
  color: #fff;
}

.btn-view:hover {
  background: #73767a;
  border-color: #73767a;
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-section {
  padding-bottom: 16px;
  border-bottom: 1px dashed rgba(144, 147, 153, 0.15);
}

.view-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.view-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.view-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.view-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-label {
  min-width: 100px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.view-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.http-security-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(245, 108, 108, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #F56C6C;
  font-size: 16px;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.http-table {
  width: 100%;
}

.http-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.http-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.http-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

/* 空文本 */
.empty-text {
  color: #c0c4cc;
}

/* 批量操作栏 */
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
  color: var(--el-text-color-secondary);
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
  border-top: 1px solid rgba(245, 108, 108, 0.08);
}

/* 步骤引导对话框 */
.wizard-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(245, 108, 108, 0.1);
}

.wizard-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.wizard-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(245, 108, 108, 0.1);
  padding: 16px 20px;
}

/* 步骤条 */
.wizard-steps {
  padding: 24px 40px 16px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
  border-bottom: 1px solid rgba(245, 108, 108, 0.08);
}

.wizard-steps :deep(.el-step__title) {
  font-size: 13px;
}

.wizard-steps :deep(.el-step__icon) {
  width: 32px;
  height: 32px;
}

.wizard-steps :deep(.clickable-step) {
  cursor: pointer;
}

.wizard-steps :deep(.clickable-step:hover .el-step__title) {
  color: #409EFF;
}

/* 步骤内容 */
.wizard-content {
  padding: 24px;
  max-height: 55vh;
  overflow-y: auto;
}

.step-panel {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px dashed rgba(245, 108, 108, 0.12);
}

.step-panel:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.step-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #F56C6C 0%, #409EFF 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.step-desc {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  margin-bottom: 24px;
  padding-left: 42px;
}

.step-form {
  padding: 16px 20px;
  background: rgba(245, 108, 108, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(245, 108, 108, 0.06);
}

.form-hint {
  margin-left: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* 单选按钮组 */
.radio-group :deep(.el-radio) {
  margin-right: 20px;
}

/* 标签输入 */
.tag-input-wrapper {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 32px;
  padding: 8px;
  background: var(--card-bg);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.url-list {
  max-height: 120px;
  overflow-y: auto;
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

/* HTTP方法网格 */
.method-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.method-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.method-card.active {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
  border-color: #409EFF;
}

.method-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
}

.method-check {
  font-size: 16px;
  color: #c0c4cc;
}

.method-card.active .method-check {
  color: #67C23A;
}

/* 传输配置网格 */
.transfer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.transfer-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(245, 108, 108, 0.1);
}

.download-card {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(103, 194, 58, 0.02) 100%);
}

.upload-card {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(230, 162, 60, 0.02) 100%);
}

.transfer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(245, 108, 108, 0.1);
}

.download-card .transfer-header .el-icon {
  color: #67C23A;
}

.upload-card .transfer-header .el-icon {
  color: #E6A23C;
}

.transfer-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.transfer-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* 底部按钮 */
.wizard-footer {
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

  .method-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .transfer-grid {
    grid-template-columns: 1fr;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
