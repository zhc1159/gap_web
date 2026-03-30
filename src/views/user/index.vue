<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">用户管理</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </div>

      <div class="page-table">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="nickName" label="昵称" width="150" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="phone" label="电话" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" @click="handleResetPassword(row)">重置密码</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
import { GetUserList, DeleteUser, ResetPassword, type IUserInfo } from '@/axios/base'

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
  // TODO: Open add dialog
  ElNotification({
    title: '提示',
    message: '新增用户功能开发中',
    type: 'info',
    customClass: 'notification-info'
  })
}

const handleEdit = (row: IUserInfo) => {
  // TODO: Open edit dialog
  console.log('Edit:', row)
  ElNotification({
    title: '提示',
    message: '编辑用户功能开发中',
    type: 'info',
    customClass: 'notification-info'
  })
}

const handleResetPassword = async (row: IUserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${row.nickName}" 的密码吗?`,
      '提示',
      { type: 'warning' }
    )
    await ResetPassword(row.id, '123456')
    ElNotification({
      title: '成功',
      message: '密码已重置为: 123456',
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
      `确定要删除用户 "${row.nickName}" 吗?`,
      '警告',
      { type: 'warning' }
    )
    await DeleteUser(row.id)
    ElNotification({
      title: '成功',
      message: '删除成功',
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
