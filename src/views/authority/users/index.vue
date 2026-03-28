<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="title">
        <el-icon><User /></el-icon>
        {{ t('users.title') }}
      </h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        {{ t('users.add') }}
      </el-button>
    </div>

    <div class="user-table">
      <el-table :data="store.list" v-loading="store.loading">
        <el-table-column prop="username" :label="t('users.account')" />
        <el-table-column prop="group" :label="t('users.group')" />
        <el-table-column :label="t('users.pwdValidDays')">
          <template #default="{ row }">
            <span :class="['pwd-valid', { domain: row.isDomainUser }]">
              {{ row.isDomainUser ? t('users.domainAccount') : `${row.pwdValidDays}${t('users.days')}` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('users.status')">
          <template #default="{ row }">
            <span :class="['status-badge', row.isActive ? 'active' : 'inactive']">
              {{ row.isActive ? t('users.activated') : t('users.deactivated') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('users.permission')">
          <template #default="{ row }">
            <span :class="['status-badge', row.authType === 'super' ? 'bg-blue' : 'bg-green']">
              {{ row.authType === 'super' ? t('users.superAdmin') : t('users.deputyAdmin') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('users.action')" width="280">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                v-if="!row.isActive"
                size="small"
                type="primary"
                @click="store.toggleUserActive(row)"
              >
                {{ t('users.activate') }}
              </el-button>
              <el-button
                v-else
                size="small"
                @click="store.toggleUserActive(row)"
              >
                {{ t('users.deactivate') }}
              </el-button>
              <el-button
                v-if="row.username !== currentUser"
                size="small"
                type="danger"
                @click="store.deleteUser(row.id)"
              >
                {{ t('users.delete') }}
              </el-button>
              <el-button size="small" type="info" @click="handleEdit(row)">
                {{ t('users.edit') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="store.pagination.page"
          :page-size="store.pagination.pageSize"
          :total="store.pagination.total"
          layout="prev, pager, next"
          @current-change="store.fetchList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Plus } from '@element-plus/icons-vue'
import { useUsersStore } from '@/stores/users'
import { useUserStore } from '@/stores/user'
import type { AdminUser } from '@/types/users'

const { t } = useI18n()
const store = useUsersStore()
const userStore = useUserStore()

const currentUser = computed(() => userStore.username)

onMounted(() => {
  store.fetchList()
})

function handleAdd() {
  store.openAddDialog()
}

function handleEdit(user: AdminUser) {
  store.openEditDialog(user)
}
</script>

<style lang="scss" scoped>
.users-page {
  padding: 24px;
  background: linear-gradient(180deg, #0a1628 0%, #132238 100%);
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-size: 22px;
    margin: 0;

    .el-icon {
      color: #00d4ff;
    }
  }
}

.user-table {
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 12px;
  padding: 20px;

  :deep(.el-table) {
    background: transparent;

    th {
      background: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    td {
      background: transparent;
      color: #fff;
    }
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;

    &.active {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }

    &.inactive {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
    }

    &.bg-blue {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
    }

    &.bg-green {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }
  }

  .pwd-valid {
    color: rgba(255, 255, 255, 0.6);

    &.domain {
      color: #00d4ff;
    }
  }

  .action-btns {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
