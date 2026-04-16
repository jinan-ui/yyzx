<template>
  <div class="full-layout">
    <!-- 左侧：菜单区域（Element Plus 原生样式，极简CSS） -->
    <el-aside width="220px" class="aside">
      <!-- 用 Element Plus 卡片组件实现头部，原生样式 -->
      <el-card class="logo-card" :body-style="{ padding: '8px', textAlign: 'center' }">
        <h2 class="title">东软颐养中心</h2>
        <div class="logo-circle">
          <img src="/tb.png" alt="logo" class="logo" />
        </div>
      </el-card>

      <el-menu
        default-active="1"
        class="menu"
        background-color="#fff"
        text-color="#333"
        active-text-color="#409eff"
        @select="menuSelect"
      >
        <el-sub-menu index="1">
          <template #title><span>床位管理</span></template>
          <el-menu-item index="bedmanage">床位管理</el-menu-item>
          <el-menu-item index="bedmap">床位示意图</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2">
          <template #title><span>客户管理</span></template>
          <el-menu-item index="customerdata">入住登记</el-menu-item>
          <el-menu-item index="customergoout">外出登记</el-menu-item>
          <el-menu-item index="customerdel">退住登记</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title><span>护理管理</span></template>
          <el-menu-item index="nursinglevel">护理级别</el-menu-item>
          <el-menu-item index="nursingltem">护理项目</el-menu-item>
          <el-menu-item index="patientcareset">客户护理设置</el-menu-item>
          <el-menu-item index="nursingrecord">护理记录</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title><span>健康管家</span></template>
          <el-menu-item index="service-target">设置服务对象</el-menu-item>
          <el-menu-item index="service-focus">服务关注</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title><span>用户管理</span></template>
          <el-menu-item index="data-maintain">基础数据维护</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧：顶部 + 内容 -->
    <el-container class="right-container">
      <el-header class="header">
        <div class="top-bar">
          <img src="/hy.png" class="top-logo" alt="welcome logo" />
          <el-dropdown @command="userCommand">
            <span class="user-text">admin <el-icon><ArrowDown /></el-icon></span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
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

const titleMap = {
  bedmanage: '床位管理',
  bedmap: '床位示意图',
  customerdata: '入住登记',
  customergoout: '外出登记',
  customerdel: '退住登记',
  nursinglevel: '护理级别',
  nursingltem: '护理项目',
  patientcareset: '客户护理设置',
  nursingrecord: '护理记录',
  'service-target': '设置服务对象',
  'service-focus': '服务关注',
  'data-maintain': '基础数据维护'
}

const menuSelect = (index) => {
  const title = titleMap[index]
  if (!title) return
  const exist = tabList.value.find(t => t.name === index)
  if (!exist) tabList.value.push({ name: index, title })
  activeTab.value = index
  router.push({ path: '/' + index })
}

const changeTab = (name) => {
  activeTab.value = name
  router.push({ path: '/' + name })
}

const removeTab = (name) => {
  tabList.value = tabList.value.filter(t => t.name !== name)
  if (activeTab.value === name) {
    if (tabList.value.length > 0) {
      const last = tabList.value[tabList.value.length - 1].name
      activeTab.value = last
      router.push({ path: '/' + last })
    } else {
      activeTab.value = ''
      router.push('/layout')
    }
  }
}

const userCommand = (cmd) => {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定退出登录吗？', '提示').then(() => {
      localStorage.removeItem('userInfo')
      router.push('/')
      ElMessage.success('退出成功')
    })
  } else if (cmd === 'info') {
    ElMessage.info('个人中心功能开发中')
  }
}

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
/* 全局布局（极简CSS） */
.full-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}

/* 左侧侧边栏（Element Plus 原生样式，仅补必要样式） */
.aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

/* 🔥 Element Plus 卡片实现头部，极致紧凑 */
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

/* 右侧布局（极简CSS，复用Element Plus样式） */
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

/* 响应式（极简） */
@media (max-width: 768px) {
  .aside { width: 180px; }
  .top-bar { height: 60px; padding: 0 10px; }
  .top-logo { height: 40px; }
  .main { padding: 10px; }
}
</style>