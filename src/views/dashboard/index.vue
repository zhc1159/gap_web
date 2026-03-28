<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">
          {{ t('dashboard.welcome') }}，{{ username }}！
        </h1>
        <p class="welcome-subtitle">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="welcome-illustration">
        <el-icon class="illustration-icon"><Odometer /></el-icon>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="28">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ t(`dashboard.stats.${stat.key}`) }}</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><TrendCharts /></el-icon>
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
            <span class="stat-period">{{ t('dashboard.vsLastMonth') }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="24" class="quick-actions">
      <el-col :xs="24" :lg="16">
        <el-card class="action-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Grid /></el-icon>
                {{ t('dashboard.quickActions') }}
              </span>
            </div>
          </template>
          <div class="action-grid">
            <div
              v-for="action in quickActions"
              :key="action.key"
              class="action-item"
              @click="handleAction(action)"
            >
              <div class="action-icon" :style="{ background: action.color }">
                <el-icon :size="24">
                  <component :is="action.icon" />
                </el-icon>
              </div>
              <span class="action-label">{{ t(`dashboard.actions.${action.key}`) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="system-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Monitor /></el-icon>
                {{ t('dashboard.systemInfo') }}
              </span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.version') }}</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.status') }}</span>
              <el-tag type="success" size="small">{{ t('dashboard.running') }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.uptime') }}</span>
              <span class="info-value">30 days</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.cpu') }}</span>
              <el-progress :percentage="45" :stroke-width="8" />
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.memory') }}</span>
              <el-progress :percentage="62" :stroke-width="8" status="warning" />
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('dashboard.disk') }}</span>
              <el-progress :percentage="35" :stroke-width="8" status="success" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Odometer,
  User,
  Document,
  Link,
  Key,
  TrendCharts,
  Grid,
  Monitor,
  Setting,
  Tools,
  Connection,
  DataLine,
  UserFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// 计算属性
const username = computed(() => userStore.username)

// 统计数据
const stats = ref([
  { key: 'users', value: '128', icon: User, color: 'linear-gradient(135deg, #00d4ff 0%, #6366f1 100%)', trend: 12 },
  { key: 'logs', value: '1,234', icon: Document, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', trend: 8 },
  { key: 'connections', value: '56', icon: Link, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', trend: -3 },
  { key: 'security', value: '99.9%', icon: Key, color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', trend: 5 }
])

// 快捷操作
const quickActions = [
  { key: 'users', icon: UserFilled, color: 'rgba(0, 212, 255, 0.1)', route: '/authority/users' },
  { key: 'logs', icon: Document, color: 'rgba(16, 185, 129, 0.1)', route: '/audit/operation' },
  { key: 'interface', icon: Connection, color: 'rgba(245, 158, 11, 0.1)', route: '/system/interface' },
  { key: 'settings', icon: Setting, color: 'rgba(139, 92, 246, 0.1)', route: '/system/config' },
  { key: 'status', icon: Monitor, color: 'rgba(6, 182, 212, 0.1)', route: '/status/system' },
  { key: 'tools', icon: Tools, color: 'rgba(236, 72, 153, 0.1)', route: '/maintenance/diagnose' }
]

/**
 * 处理快捷操作
 */
function handleAction(action: { route: string }) {
  router.push(action.route)
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: $spacing-lg;
}

// 欢迎横幅
.welcome-banner {
  background: $gradient-primary;
  border-radius: $radius-xl;
  padding: 40px;
  margin-bottom: $spacing-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 60%;
    height: 200%;
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(15deg);
    pointer-events: none;
  }

  .welcome-content {
    position: relative;
    z-index: 1;

    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .welcome-illustration {
    .illustration-icon {
      font-size: 120px;
      color: rgba(255, 255, 255, 0.2);
      animation: float 6s ease-in-out infinite;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

// 统计卡片
.stat-cards {
  margin-bottom: $spacing-lg;

  .stat-card {
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    margin-bottom: $spacing-md;

    .stat-content {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      margin-bottom: $spacing-md;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: $radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: $text-primary;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 600;

        &.up {
          color: $success-color;
        }

        &.down {
          color: $danger-color;
        }
      }

      .stat-period {
        font-size: 12px;
        color: $text-muted;
      }
    }
  }
}

// 快捷操作
.quick-actions {
  .action-card,
  .system-info-card {
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    margin-bottom: $spacing-md;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;

        .el-icon {
          color: $primary-color;
        }
      }
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-md;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-lg;
        border-radius: $radius-lg;
        cursor: pointer;
        transition: all $transition-fast;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: $radius-lg;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $primary-color;
        }

        .action-label {
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }
  }

  .system-info-card {
    .info-list {
      .info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-sm 0;
        border-bottom: 1px solid $border-color;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 14px;
          color: $text-secondary;
        }

        .info-value {
          font-size: 14px;
          color: $text-primary;
          font-weight: 500;
        }

        .el-progress {
          width: 120px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;

    .welcome-illustration {
      display: none;
    }
  }

  .quick-actions .action-card .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
