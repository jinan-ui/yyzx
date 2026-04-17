<template>
  <div class="full-layout">
    <!-- 左侧：菜单区域（样式和管理员完全一样） -->
    <el-aside width="220px" class="aside">
      <el-card class="logo-card" :body-style="{ padding: '8px', textAlign: 'center' }">
        <h2 class="title">东软颐养中心</h2>
        <div class="logo-circle">
          <img src="/tb.png" alt="logo" class="logo" />
        </div>
      </el-card>

      <!-- 🔥 这里只改菜单！样式完全不变！-->
      <el-menu
        default-active="1"
        class="menu"
        background-color="#fff"
        text-color="#333"
        active-text-color="#409eff"
        @select="menuSelect"
      >
        <el-menu-item index="customer-list">
          <template #title><span>服务客户信息列表</span></template>
        </el-menu-item>

        <el-menu-item index="care-item-list">
          <template #title><span>客户护理项目列表</span></template>
        </el-menu-item>

        <el-menu-item index="care-record-list">
          <template #title><span>护理记录列表</span></template>
        </el-menu-item>

        <el-menu-item index="out-apply">
          <template #title><span>外出申请</span></template>
        </el-menu-item>

        <el-menu-item index="leave-apply">
          <template #title><span>退住申请</span></template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧：顶部 + 内容（样式完全和管理员一样） -->
    <el-container class="right-container">
      <el-header class="header">
        <div class="top-bar">
          <img src="/hy.png" class="top-logo" alt="welcome logo" />
          <el-dropdown @command="userCommand">
            <span class="user-text">护工账号 <el-icon><ArrowDown /></el-icon></span>
            <template #dropdown>
              <el-dropdown-item command="info">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </template>
            <el-dropdown-item command="switch">切换身份</el-dropdown-item>
          </el-dropdown>
        </div>

        <div class="tabs-wrapper" v-if="tabList.length > 0">
          <el-tabs
            v-model="activeTab"
            type="card"
            closable
            class="tabs"
            @tab-remove="removeTab"
            @tab-change="changeTab"
          >
            <el-tab-pane
              v-for="item in tabList"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            />
          </el-tabs>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const tabList = ref([])
const activeTab = ref('')

// 🔥 护工菜单标题映射（只改这里！）
const titleMap = {
  'customer-list': '服务客户信息列表',
  'care-item-list': '客户护理项目列表',
  'add-care-record': '添加护理记录',
  'care-record-list': '护理记录列表',
  'out-apply': '外出申请',
  'leave-apply': '退住申请'
}

// 菜单点击（逻辑完全不变）
const menuSelect = (index) => {
  const title = titleMap[index]
  if (!title) return
  const exist = tabList.value.find(t => t.name === index)
  if (!exist) tabList.value.push({ name: index, title })
  activeTab.value = index
  router.push({ path: '/' + index })
}

// 切换标签（完全不变）
const changeTab = (name) => {
  activeTab.value = name
  router.push({ path: '/' + name })
}

// 删除标签（完全不变）
const removeTab = (name) => {
  tabList.value = tabList.value.filter(t => t.name !== name)
  if (activeTab.value === name) {
    if (tabList.value.length > 0) {
      const last = tabList.value[tabList.value.length - 1].name
      activeTab.value = last
      router.push({ path: '/' + last })
    } else {
      activeTab.value = ''
      router.push('/nurse')
    }
  }
}

// 用户操作（不变）
const userCommand = (cmd) => {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定退出登录吗？', '提示').then(() => {
      localStorage.removeItem('userInfo')
      router.push('/')
      ElMessage.success('退出成功')
    })
  } else if (cmd === 'info') {
    ElMessage.info('个人中心功能开发中')
  }else if (cmd === 'switch') {
  localStorage.clear()
  router.push('/')
  ElMessage.success('返回登录页成功')
}
}

// 监听路由（不变）
watch(
  () => route.path,
  (newPath) => {
    const name = newPath.replace('/', '')
    if (name && titleMap[name]) {
      const exist = tabList.value.find(t => t.name === name)
      if (!exist) tabList.value.push({ name, title: titleMap[name] })
      activeTab.value = name
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 🔥 样式 100% 和管理员一模一样！完全没改动！ */
.full-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}
.aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}
.logo-card {
  border: none;
  box-shadow: none;
}
.title {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #303133;
  font-weight: 600;
}
.logo-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto;
  overflow: hidden;
}
.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.menu {
  border: none;
}
.right-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.top-bar {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.top-logo {
  height: 50px;
  width: auto;
}
.user-text {
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #303133;
}
.tabs-wrapper {
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}
.tabs {
  margin: 0;
}
.main {
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
  padding: 20px;
}
@media (max-width: 768px) {
  .aside { width: 180px; }
  .top-bar { height: 60px; padding: 0 10px; }
  .top-logo { height: 40px; }
  .main { padding: 10px; }
}
</style>