// 模拟后端API，伪造客户、外出申请、退住申请数据
import { mockCustomers } from './bed.js'

// 模拟数据库数据
const mockOutRecords = [
  {
    id: 1, customerId: 1, customerName: '孙瑞英', gender: '女',
    outReason: '回家', outTime: '2023-11-3', expectBackTime: '2023-11-4',
    actualBackTime: '2023-11-4', accompany: '孙丽', relation: '子女',
    phone: '13456786754', status: '通过', serviceUserId: 1
  },
  {
    id: 2, customerId: 1, customerName: '孙瑞英', gender: '女',
    outReason: '买东西', outTime: '2023-11-10', expectBackTime: '2023-11-11',
    actualBackTime: null, accompany: '孙丽', relation: '子女',
    phone: '13456786754', status: '不通过', serviceUserId: 1
  },
  {
    id: 3, customerId: 1, customerName: '孙瑞英', gender: '女',
    outReason: '学习', outTime: '2023-11-15', expectBackTime: '2023-11-15',
    actualBackTime: null, accompany: '孙丽', relation: '子女',
    phone: '13456786754', status: '已提交', serviceUserId: 1
  }
]

const mockDischargeRecords = [
  {
    id: 1, customerId: 1, customerName: '孙瑞英', gender: '女',
    dischargeType: '正常退住', dischargeReason: '家里有安排',
    dischargeTime: '2023-11-15', checkTime: null, status: '已提交',
    bedDetail: '1201-1', serviceUserId: 1
  },
  {
    id: 2, customerId: 1, customerName: '孙瑞英', gender: '女',
    dischargeType: '保留床位', dischargeReason: '回家看看',
    dischargeTime: '2023-11-20', checkTime: '2023-12-30', status: '不通过',
    bedDetail: '1201-1', serviceUserId: 1
  },
  {
    id: 3, customerId: 1, customerName: '孙瑞英', gender: '女',
    dischargeType: '死亡退住', dischargeReason: '回家看看',
    dischargeTime: '2023-12-30', checkTime: '2023-12-30', status: '已撤销',
    bedDetail: '1201-1', serviceUserId: 1
  }
]

// 工具函数：延迟模拟网络请求
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ==================== 客户相关API ====================
// 1. 获取当前健康管家服务的客户列表
export const getMyCustomerList = async () => {
  await delay()
  // 模拟当前登录用户是健康管家，只返回自己服务的客户
  return { code: 200, data: mockCustomers.filter(c => c.id <= 3) }
}

// ==================== 外出申请API ====================
// 2. 获取外出申请列表（支持姓名模糊查询）
export const getOutRecordList = async (params) => {
  await delay()
  let list = [...mockOutRecords]
  if (params.name) {
    list = list.filter(item => item.customerName.includes(params.name))
  }
  const { page = 1, pageSize = 10 } = params
  const total = list.length
  const data = list.slice((page - 1) * pageSize, page * pageSize)
  return { code: 200, data: { list: data, total } }
}

// 3. 添加外出申请
export const addOutRecord = async (data) => {
  await delay()
  const newRecord = {
    id: mockOutRecords.length + 1,
    ...data,
    status: '已提交',
    serviceUserId: 1
  }
  mockOutRecords.push(newRecord)
  return { code: 200, msg: '申请提交成功' }
}

// 4. 登记回院时间
export const updateOutBackTime = async (id, actualBackTime) => {
  await delay()
  const record = mockOutRecords.find(r => r.id === id)
  if (record) {
    record.actualBackTime = actualBackTime
    return { code: 200, msg: '回院时间登记成功' }
  }
  return { code: 500, msg: '记录不存在' }
}

// 5. 撤销外出申请
export const cancelOutRecord = async (id) => {
  await delay()
  const record = mockOutRecords.find(r => r.id === id)
  if (record) {
    record.status = '已撤销'
    return { code: 200, msg: '申请已撤销' }
  }
  return { code: 500, msg: '记录不存在' }
}

// ==================== 退住申请API ====================
// 6. 获取退住申请列表（支持姓名模糊查询）
export const getDischargeRecordList = async (params) => {
  await delay()
  let list = [...mockDischargeRecords]
  if (params.name) {
    list = list.filter(item => item.customerName.includes(params.name))
  }
  const { page = 1, pageSize = 10 } = params
  const total = list.length
  const data = list.slice((page - 1) * pageSize, page * pageSize)
  return { code: 200, data: { list: data, total } }
}

// 7. 添加退住申请
export const addDischargeRecord = async (data) => {
  await delay()
  const newRecord = {
    id: mockDischargeRecords.length + 1,
    ...data,
    status: '已提交',
    serviceUserId: 1
  }
  mockDischargeRecords.push(newRecord)
  return { code: 200, msg: '退住申请提交成功' }
}

// 8. 撤销退住申请
export const cancelDischargeRecord = async (id) => {
  await delay()
  const record = mockDischargeRecords.find(r => r.id === id)
  if (record) {
    record.status = '已撤销'
    return { code: 200, msg: '申请已撤销' }
  }
  return { code: 500, msg: '记录不存在' }
}

export { mockOutRecords, mockDischargeRecords }