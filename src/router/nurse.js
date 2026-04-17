import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import LayoutNurse from '@/views/LayoutNurse.vue'
import UserManage from '../User/UserManage.vue'
import BaseDataManage from '../User/BaseDataManage.vue'
import CareRecord from '@/User/CareRecord.vue'
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path:'/layout',
    name:'Layout',
    component:()=>import('../views/Layout.vue'),
    children:[
      {
        path: '/bed-map',
        name: 'BedMap',
        component: () => import('@/bed/BedMap.vue'),
        meta: { title: '床位示意图' }
      },
      {
        path: '/bed',
        name: 'BedManage',
        component: () => import('@/bed/BedManage.vue'),
        meta: { title: '床位管理' }
      }
       , {
        path: 'user-manage',
        name: 'UserManage',
        component: UserManage,
        meta: { title: '用户管理' }
      },
      {
        path: 'user-manage/base-data',
        name: 'BaseDataManage',
        component: BaseDataManage,
        meta: { title: '基础数据维护' }
      }, {
        path: 'care-record',
        name: 'CareRecord',
        component: CareRecord,
        meta: {
          title: '护理记录',
          icon: 'document'
        }
      },
    ]
  },
  {
    path: '/',
    redirect: '/layout/bed'
    //把页面点击进去直接显示床位那里的页面
  },
  {
    path: '/nurse',
    component: LayoutNurse,
    children: [
      { path: 'customer-list', component: { template: '<div>客户信息列表</div>' } },
      { path: 'care-item-list', component: { template: '<div>护理项目列表</div>' } },
      { path: 'add-care-record', component: { template: '<div>添加护理记录</div>' } },
      { path: 'care-record-list', component: () => import('@/User/CareRecord.vue') },
      { path: 'out-apply', component: { template: '<div>外出申请</div>' } },
      { path: 'leave-apply', component: { template: '<div>退住申请</div>' } },
    ]
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
