<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">{{ $t('user.title') }}</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>{{ $t('user.addUser') }}
          </el-button>
        </div>
      </div>

      <div class="page-table">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="nickName" :label="$t('user.nickname')" width="150" />
          <el-table-column prop="email" :label="$t('user.email')" width="200" />
          <el-table-column prop="phone" :label="$t('user.phone')" width="150" />
          <el-table-column prop="status" :label="$t('user.status')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? $t('user.active') : $t('user.inactive') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label="$t('user.createTime')" width="180" />
          <el-table-column :label="$t('common.edit')" fixed="right" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
              <el-button link type="primary" @click="handleResetPassword(row)">{{ $t('user.resetPassword') }}</el-button>
              <el-button link type="danger" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="page-pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { GetUserList, DeleteUser, ResetPassword, type IUserInfo } from '@/axios/base'

const { t } = useI18n()

const loading = ref(false)
const tableData = ref<IUserInfo[]>([])

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await GetUserList({
      page: pagination.page,
      size: pagination.size
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('Load data failed:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  ElNotification({
    title: t('common.tip'),
    message: t('user.addDeveloping'),
    type: 'info',
    customClass: 'notification-info'
  })
}

const handleEdit = (row: IUserInfo) => {
  console.log('Edit:', row)
  ElNotification({
    title: t('common.tip'),
    message: t('user.editDeveloping'),
    type: 'info',
    customClass: 'notification-info'
  })
}

const handleResetPassword = async (row: IUserInfo) => {
  try {
    await ElMessageBox.confirm(
      t('user.resetPasswordConfirm', { name: row.nickName }),
      t('common.tip'),
      { type: 'warning' }
    )
    await ResetPassword(row.id, '123456')
    ElNotification({
      title: t('common.success'),
      message: t('user.resetPasswordSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // User cancelled
  }
}

const handleDelete = async (row: IUserInfo) => {
  try {
    await ElMessageBox.confirm(
      t('user.deleteConfirm', { name: row.nickName }),
      t('common.warning'),
      { type: 'warning' }
    )
    await DeleteUser(row.id)
    ElNotification({
      title: t('common.success'),
      message: t('user.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
    loadData()
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
