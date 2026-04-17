<template>
    <div class="page-content">
        <div class="page-header">
            <h2>基础数据维护</h2>
            <p>系统核心基础配置管理中心</p>
        </div>

        <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="12" :lg="8" v-for="item in menuList" :key="item.key">
                <div class="card-item">
                    <div class="card-icon">{{ item.icon }}</div>
                    <div class="card-title">{{ item.title }}</div>
                    <div class="card-desc">{{ item.desc }}</div>

                    <div class="card-btn">
                        <el-button type="primary" plain size="small" @click="goToPage(item.path, item.title)">
                            进入管理
                        </el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const menuList = ref([
    {
        key: 'dept',
        title: '科室管理',
        desc: '医院科室配置',
        icon: '🏥',
        path: '/layout/bed-map'
    },
    {
        key: 'post',
        title: '岗位管理',
        desc: '员工岗位类型管理',
        icon: '💼',
        path: '/layout/bed'
    },
    {
        key: 'title',
        title: '职称管理',
        desc: '医护职称等级管理',
        icon: '🎓',
        path: '/usermanage'
    },
    {
        key: 'status',
        title: '人员状态',
        desc: '在职/离职/试用管理',
        icon: '📊',
        path: '/layout/base-data'
    },
    {
        key: 'role',
        title: '角色权限',
        desc: '系统角色权限配置',
        icon: '🔐',
        path: '/layout/base-data'
    },
    {
        key: 'department',
        title: '部门管理',
        desc: '组织架构部门配置',
        icon: '🏢',
        path: '/layout/base-data'
    }
])


const goToPage = (path, title) => {
    ElMessage.success(`正在进入【${title}】`)
    router.push(path)
}
</script>

<style scoped>
.page-content {
    padding: 30px;
    background: #f5f7fa;
    min-height: 100vh;
}

.base-page::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/tb.png");
    background-repeat: no-repeat;
    background-position: right 89%;
    background-size: 350px auto;
    opacity: 0.15; 
    z-index: 0;
    pointer-events: none;
}

.page-header {
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
}

.page-header h2 {
    font-size: 22px;
    font-weight: bold;
    color: #333;
    margin: 0 0 6px 0;
}

.page-header p {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

.card-item {
    background: #fff;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
}

.card-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: #dcdcdc;
}

.card-icon {
    font-size: 42px;
    margin-bottom: 14px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
}

.card-desc {
    font-size: 12px;
    color: #999;
    margin-bottom: 16px;
}

.card-btn {
    margin-top: 10px;
}
</style>