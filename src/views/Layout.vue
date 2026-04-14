<template>
  <div class="layout">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <!-- logo 区域 -->
      <div class="logo-area">
        <h2 class="system-title">东软颐养中心</h2>
        <div class="logo-img">
          <img src="../assets/tb.png" alt="logo"></img>
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
            <div class="sub-item" @click="$router.push('/bed')">床位管理</div>
            <div class="sub-item" @click="$router.push('/bed-map')">床位示意图</div>
          </div>
        </div>

        <!-- 客户管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('customer')">
            <span class="arrow">{{ menuStatus.customer ? '▼' : '▶' }}</span>
            <span>客户管理</span>
          </div>
          <div v-show="menuStatus.customer" class="sub-menu">
            <div class="sub-item" @click="$router.push('/checkin')">入住登记</div>
            <div class="sub-item" @click="$router.push('/out')">外出登记</div>
            <div class="sub-item" @click="$router.push('/checkout')">退住登记</div>
          </div>
        </div>

        <!-- 护理管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('nurse')">
            <span class="arrow">{{ menuStatus.nurse ? '▼' : '▶' }}</span>
            <span>护理管理</span>
          </div>
          <div v-show="menuStatus.nurse" class="sub-menu">
            <div class="sub-item" @click="$router.push('/nurse-level')">护理级别</div>
            <div class="sub-item" @click="$router.push('/nurse-item')">护理项目</div>
            <div class="sub-item" @click="$router.push('/customer-nurse')">客户护理设置</div>
            <div class="sub-item" @click="$router.push('/nurse-record')">护理记录</div>
          </div>
        </div>

        <!-- 健康管家 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('health')">
            <span class="arrow">{{ menuStatus.health ? '▼' : '▶' }}</span>
            <span>健康管家</span>
          </div>
          <div v-show="menuStatus.health" class="sub-menu">
            <div class="sub-item" @click="$router.push('/service-target')">设置服务对象</div>
            <div class="sub-item" @click="$router.push('/service-focus')">服务关注</div>
          </div>
        </div>

        <!-- 用户管理 -->
        <div class="menu-group">
          <div class="menu-title" @click="toggleMenu('user')">
            <span class="arrow">{{ menuStatus.user ? '▼' : '▶' }}</span>
            <span>用户管理</span>
          </div>
          <div v-show="menuStatus.user" class="sub-menu">
            <div class="sub-item" @click="$router.push('/data-maintain')">基础数据维护</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="main">
      <!-- 顶部栏 -->
      <div class="header">
        <div class="tabs">
          <div v-for="tab in tabsList" :key="tab.name" class="tab-item" :class="{ active: activeTab === tab.name }">
            <span>{{ tab.label }}</span>
            <span class="close" @click="closeTab(tab.name)">×</span>
          </div>
        </div>
        <!-- admin 下拉菜单 -->
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

      <!-- 内容区域（子页面显示在这里） -->
      <div class="content">
        <router-view />
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

// 标签页列表
const tabsList = ref([
  { label: '床位示意图', name: 'bed-map' },
  { label: '床位管理', name: 'bed' },
  { label: '入住登记', name: 'checkin' },
  { label: '护理记录', name: 'nurse-record' },
  { label: '外出登记', name: 'out' }
])
const activeTab = ref('bed')

// admin 下拉菜单
const showUserMenu = ref(false)

// 切换菜单展开/收起
const toggleMenu = (key) => {
  menuStatus.value[key] = !menuStatus.value[key]
}

// 关闭标签页
const closeTab = (name) => {
  tabsList.value = tabsList.value.filter(tab => tab.name !== name)
  if (activeTab.value === name) {
    activeTab.value = tabsList.value[tabsList.value.length - 1].name
    router.push(`/${activeTab.value}`)
  }
}

// 退出登录
const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 全局布局 */
.layout {
  display: flex;
  height: 100vh;
  background: #fff;
  border: 1px solid #ccc;
}

/* 左侧侧边栏 */
.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #ccc;
  padding: 20px 0;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
}
.system-title {
  font-size: 24px;
  margin: 0 0 15px 0;
}
.logo-img {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

/* 菜单样式 */
.menu-list {
  padding: 0 10px;
}
.menu-group {
  margin-bottom: 10px;
}
.menu-title {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}
.menu-title:hover {
  background: #f5f7fa;
}
.arrow {
  font-size: 12px;
  color: #666;
}
.sub-menu {
  padding-left: 30px;
}
.sub-item {
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
}
.sub-item:hover {
  background: #f5f7fa;
}

/* 右侧主区域 */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 10px;
}
.tab-item {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px 4px 0 0;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.tab-item.active {
  background: #fff;
  border-bottom: 1px solid #fff;
  font-weight: bold;
  color: #409eff;
}
.close {
  font-size: 16px;
  cursor: pointer;
  color: #999;
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
}
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 999;
}
.user-item {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
}
.user-item:hover {
  background: #f5f7fa;
}

/* 内容区域 */
.content {
  flex: 1;
  background: #fff;
  padding: 20px;
  overflow: auto;
}
</style>