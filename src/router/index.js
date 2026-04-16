import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../views/Login.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'UserLogin',
    component: UserLogin,
  },
  {
    path:'/layout',
    name:'Layout',
    component:()=>import('../views/Layout.vue'),
    children:[
      {
        path: '/bedmap',
        name: 'BedMap',
        component: () => import('@/bed/BedMap.vue'),
        meta: { title: '床位示意图' }
      },
      {
        path: '/bedmanage',
        name: 'BedManage',
        component: () => import('@/bed/BedManage.vue'),
        meta: { title: '床位管理' }
      },
      {
        path:'/customerdata',
        name:'CustomerData',
        component:()=>import('@/customer/CustomerData.vue'),
        meta: { title: '客户信息' }
      },
      {
        path: '/customerdel',
        name: 'CustomerDel',
        component: () => import('@/customer/CustomerDel.vue'),
        meta: { title: '退住登记' }
      },
      {
        path: '/customergoout',
        name: 'CustomerGoout',
        component: () => import('@/customer/CustomerGoout.vue'),
        meta: { title: '外出登记' }
      },{
        path:'/nursingltem',
        name:'NursingLtem',
        component:()=>import('@/nursing/NursingItem.vue'),
        meta: { title: '护理项目' }
      },
       {
        path:'/nursingltem',
        name:'NursingItem',
        component:()=>import('@/nursing/NursingItem.vue'),
        meta: { title: '护理项目' }
      },
      {
        path:'/nursingrecord',
        name:'NursingRecords',
        component:()=>import('@/nursing/NursingRecords.vue'),
        meta: { title: '护理记录' }
      },
      {
        path:'/nursinglevel',
        name:'NursingLevel',
        component:()=>import('@/nursing/NursingLevel.vue'),
        meta: { title: '护理级别' }
      },
      {
        path:'/patientcareset',
        name:'PatientCareSet',
        component:()=>import('@/nursing/PatientCareSet.vue'),
        meta: { title: '客户护理设置' }
      },
      {
        path:'/caregiverdel',
        name:'CareGiverDel',
        component:()=>import('@/caregiver/CaregiverDel.vue'),
        meta: { title: '退住申请' }
      },
      {
        path:'/caregivergoout',
        name:'CareGiverGoout',
        component:()=>import('@/caregiver/CaregiverGoout.vue'),
        meta:{ title: '外出申请' }
      }
     
      
      
    ]
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // 白名单：不需要登录就能访问的页面
  const whiteList = ['/']
  // 如果是白名单页面，直接放行
  if (whiteList.includes(to.path)) {
    next()
  } else {
    // 其他页面：检查登录状态
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      // 已登录，放行
      next()
    } else {
      // 未登录，跳回登录页
      ElMessage.warning('请先登录')
      next('/')
    }
  }
})
export default router