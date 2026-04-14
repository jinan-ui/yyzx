<template>
  <div class="layout">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <!-- logo 区域 -->
      <div class="logo-area">
        <h2 class="system-title">东软颐养中心</h2>
        <div class="logo-img">
          <img src="/tb.png" alt="logo" class="logo" style="height: 150%; width: 150%;"/>
        </div>
      </div>

      <!-- 多级菜单 -->
      <div class="menu-list">
        <!-- 床位管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('bed')">
            <span class="arrow">{{ menuStatus.bed ? '▼' : '▶' }}</span>
            <span>床位管理</span>
          </div>
          <div v-show="menuStatus.bed" class="sub-menu">
            <div class="sub-item" @click="openTab('床位管理','bed')">床位管理</div>
            <div class="sub-item" @click="openTab('床位示意图','bed-map')">床位示意图</div>
          </div>
        </div>

        <!-- 客户管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('customer')">
            <span class="arrow">{{ menuStatus.customer ? '▼' : '▶' }}</span>
            <span>客户管理</span>
          </div>
          <div v-show="menuStatus.customer" class="sub-menu">
            <div class="sub-item" @click="openTab('入住登记','checkin')">入住登记</div>
            <div class="sub-item" @click="openTab('外出登记','out')">外出登记</div>
            <div class="sub-item" @click="openTab('退住登记','checkout')">退住登记</div>
          </div>
        </div>

        <!-- 护理管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('nurse')">
            <span class="arrow">{{ menuStatus.nurse ? '▼' : '▶' }}</span>
            <span>护理管理</span>
          </div>
          <div v-show="menuStatus.nurse" class="sub-menu">
            <div class="sub-item" @click="openTab('护理级别','nurse-level')">护理级别</div>
            <div class="sub-item" @click="openTab('护理项目','nurse-item')">护理项目</div>
            <div class="sub-item" @click="openTab('客户护理设置','customer-nurse')">客户护理设置</div>
            <div class="sub-item" @click="openTab('护理记录','nurse-record')">护理记录</div>
          </div>
        </div>

        <!-- 健康管家 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('health')">
            <span class="arrow">{{ menuStatus.health ? '▼' : '▶' }}</span>
            <span>健康管家</span>
          </div>
          <div v-show="menuStatus.health" class="sub-menu">
            <div class="sub-item" @click="openTab('设置服务对象','service-target')">设置服务对象</div>
            <div class="sub-item" @click="openTab('服务关注','service-focus')">服务关注</div>
          </div>
        </div>

        <!-- 用户管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('user')">
            <span class="arrow">{{ menuStatus.user ? '▼' : '▶' }}</span>
            <span>用户管理</span>
          </div>
          <div v-show="menuStatus.user" class="sub-menu">
            <div class="sub-item" @click="openTab('基础数据维护','data-maintain')">基础数据维护</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="main">
      <!-- 顶部第一行：logo + admin -->
      <div class="header-top">
        <img 
          src="/hy.png" 
          alt="welcome logo" 
          class="welcome-logo"
        />
        <div class="user-dropdown">
          <div class="user-trigger" @click="showUserMenu = !showUserMenu">
            <span>admin</span>
            <span class="arrow">▼</span>
          </div>
          <div v-show="showUserMenu" class="user-menu">
            <div class="user-item">个人中心</div>
            <div class="user-item" @click="logout">退出登录</div>
          </div>
        </div>
      </div>

      <!-- 第二行：标签页（在logo下方，点击菜单才显示） -->
      <div class="header-tabs" v-if="tabsList.length > 0">
        <div 
          v-for="tab in tabsList" 
          :key="tab.name" 
          class="tab-item" 
          :class="{ active: activeTab === tab.name }"
          @click="switchTab(tab.name)"
        >
          <span>{{ tab.label }}</span>
          <span class="close" @click.stop="closeTab(tab.name)">×</span>
        </div>
      </div>

      <!-- 内容区域：标签页下方 -->
      <div class="content">
        <div v-if="activeTab === 'bed'">✅ 床位管理内容</div>
        <div v-else-if="activeTab === 'bed-map'">✅ 床位示意图内容</div>
        <div v-else-if="activeTab === 'checkin'">✅ 入住登记内容</div>
        <div v-else-if="activeTab === 'out'">✅ 外出登记内容</div>
        <div v-else-if="activeTab === 'checkout'">✅ 退住登记内容</div>
        <div v-else-if="activeTab === 'nurse-level'">✅ 护理级别内容</div>
        <div v-else-if="activeTab === 'nurse-item'">✅ 护理项目内容</div>
        <div v-else-if="activeTab === 'customer-nurse'">✅ 客户护理设置内容</div>
        <div v-else-if="activeTab === 'nurse-record'">✅ 护理记录内容</div>
        <div v-else-if="activeTab === 'service-target'">✅ 设置服务对象内容</div>
        <div v-else-if="activeTab === 'service-focus'">✅ 服务关注内容</div>
        <div v-else-if="activeTab === 'data-maintain'">✅ 基础数据维护内容</div>
        <div v-else>
          <div style="text-align:center;color:#999;margin-top:100px;">
            请点击左侧菜单打开功能页面
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 菜单展开状态
const menuStatus = ref({
  bed: true,
  customer: true,
  nurse: true,
  health: true,
  user: true
})

// 标签页 —— 一开始为空
const tabsList = ref([])
const activeTab = ref('')

// admin 下拉菜单
const showUserMenu = ref(false)

// 切换菜单展开/收起
const toggleMenu = (key) => {
  menuStatus.value[key] = !menuStatus.value[key]
}

// 打开标签页（点击左侧菜单触发）
const openTab = (label, name) => {
  // 如果已经存在，直接切换
  const has = tabsList.value.find(item => item.name === name)
  if (has) {
    activeTab.value = name
    return
  }
  // 添加新标签
  tabsList.value.push({ label, name })
  activeTab.value = name
}

// 切换标签
const switchTab = (name) => {
  activeTab.value = name
}

// 关闭标签
const closeTab = (name) => {
  tabsList.value = tabsList.value.filter(tab => tab.name !== name)
  if (activeTab.value === name && tabsList.value.length > 0) {
    activeTab.value = tabsList.value[tabsList.value.length - 1].name
  }
}

// 退出登录
const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 全局布局 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

/* 左侧侧边栏 */
.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
  overflow-y: auto;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
  padding: 0 10px;
}
.system-title {
  font-size: 24px;
  margin: 0 0 15px 0;
  color: #303133;
  font-weight: 600;
}
.logo-img {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 菜单样式 */
.menu-list {
  padding: 0 10px;
}
.menu-group {
  margin-bottom: 5px;
}
.menu-title {
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
  border-radius: 4px;
  transition: background 0.2s;
}
.menu-title:hover {
  background: #f5f7fa;
}
.arrow {
  font-size: 12px;
  color: #909399;
  transition: transform 0.2s;
}
.sub-menu {
  padding-left: 25px;
  animation: slideDown 0.2s ease;
}
.sub-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-radius: 4px;
  transition: background 0.2s;
  margin: 2px 0;
}
.sub-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

/* 右侧主区域 */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部第一行：logo + admin */
.header-top {
  height: 80px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 欢迎logo样式 */
.welcome-logo {
  height: 60px;
  width: auto;
  margin-right: 10px;
}

/* 第二行：标签页容器 */
.header-tabs {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 0 20px;
}

/* 标签页样式 */
.tab-item {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px 4px 0 0;
  background: #f5f7fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
  border-bottom: 1px solid #f5f7fa;
}
.tab-item.active {
  background: #fff;
  border-bottom: 1px solid #fff;
  font-weight: 500;
  color: #409eff;
  border-color: #dcdfe6;
}
.close {
  font-size: 16px;
  cursor: pointer;
  color: #909399;
  line-height: 1;
  margin-left: 4px;
}
.close:hover {
  color: #f56c6c;
}

/* admin 下拉菜单 */
.user-dropdown {
  position: relative;
}
.user-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  color: #303133;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}
.user-trigger:hover {
  background: #f5f7fa;
}
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  min-width: 120px;
  animation: fadeIn 0.2s ease;
}
.user-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: background 0.2s;
}
.user-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

/* 内容区域 */
.content {
  flex: 1;
  background: #f5f7fa;
  padding: 20px;
  overflow: auto;
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>