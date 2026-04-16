<template>
  <div class="discharge-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="客户姓名：">
          <el-input v-model="queryForm.name" clearable style="width:200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDischargeList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" size="large" style="float:right" @click="openAddDialog">
        添加退住申请
      </el-button>
    </div>

    <!-- 双栏布局：客户信息 + 退住申请 -->
    <el-row :gutter="20" style="margin-top:20px">
      <!-- 左侧：客户信息 -->
      <el-col :span="12">
        <div class="card">
          <div class="card-header">客户信息</div>
          <el-table :data="customerList" border style="width:100%" v-loading="loadingCustomer">
            <el-table-column label="序号" width="80" align="center">
              <template #default="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="120" align="center" />
            <el-table-column prop="age" label="年龄" width="80" align="center" />
            <el-table-column prop="gender" label="性别" width="80" align="center" />
            <el-table-column prop="bedNo" label="床号" width="120" align="center" />
            <el-table-column prop="nurseLevel" label="护理级别" width="120" align="center" />
          </el-table>
          <!-- 分页 -->
          <el-pagination
            v-model:page="customerPage"
            v-model:page-size="pageSize"
            :total="customerTotal"
            @size-change="loadCustomerList"
            @current-change="loadCustomerList"
            style="margin-top:15px;justify-content:flex-end"
          />
        </div>
      </el-col>

      <!-- 右侧：退住申请 -->
      <el-col :span="12">
        <div class="card">
          <div class="card-header">退住申请</div>
          <el-table :data="dischargeList" border style="width:100%" v-loading="loadingDischarge">
            <el-table-column label="序号" width="60" align="center">
              <template #default="scope">
                <span>{{ (dischargePage - 1) * pageSize + scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户姓名" width="100" align="center" />
            <el-table-column prop="startDate" label="入住时间" width="100" align="center" />
            <el-table-column prop="dischargeTime" label="退住时间" width="100" align="center" />
            <el-table-column prop="dischargeType" label="退住类型" width="100" align="center" />
            <el-table-column prop="dischargeReason" label="退住原因" width="120" align="center" />
            <el-table-column prop="checkTime" label="审批时间" width="100" align="center" />
            <el-table-column prop="status" label="审批状态" width="90" align="center" />
            <el-table-column prop="bedDetail" label="床位" width="100" align="center" />
            <el-table-column label="操作" align="center" width="120">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === '已提交'"
                  type="danger"
                  link
                  @click="cancelDischarge(scope.row)"
                >
                  撤销申请
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            v-model:page="dischargePage"
            v-model:page-size="pageSize"
            :total="dischargeTotal"
            @size-change="loadDischargeList"
            @current-change="loadDischargeList"
            style="margin-top:15px;justify-content:flex-end"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 添加退住申请弹窗 -->
    <el-dialog v-model="addVisible" title="添加退住申请" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="客户姓名">
          <el-select v-model="addForm.customerId" placeholder="请选择客户" style="width:100%">
            <el-option
              v-for="c in customerList"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退住类型">
          <el-select v-model="addForm.dischargeType" style="width:100%">
            <el-option label="正常退住" value="正常退住" />
            <el-option label="保留床位" value="保留床位" />
            <el-option label="死亡退住" value="死亡退住" />
          </el-select>
        </el-form-item>
        <el-form-item label="退住原因">
          <el-input v-model="addForm.dischargeReason" style="width:100%" />
        </el-form-item>
        <el-form-item label="退住时间">
          <el-date-picker
            v-model="addForm.dischargeTime"
            type="date"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="床位">
          <el-input v-model="addForm.bedDetail" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMyCustomerList,
  getDischargeRecordList,
  addDischargeRecord,
  cancelDischargeRecord
} from '../api/customer.js'

// 客户信息
const loadingCustomer = ref(false)
const customerList = ref([])
const customerPage = ref(1)
const customerTotal = ref(0)
const pageSize = ref(10)

// 退住申请
const loadingDischarge = ref(false)
const dischargeList = ref([])
const dischargePage = ref(1)
const dischargeTotal = ref(0)
const queryForm = reactive({ name: '' })

// 弹窗
const addVisible = ref(false)
const addForm = reactive({
  customerId: null,
  dischargeType: '正常退住',
  dischargeReason: '',
  dischargeTime: '',
  bedDetail: ''
})

// 加载客户列表
const loadCustomerList = async () => {
  loadingCustomer.value = true
  const res = await getMyCustomerList()
  // 补全床号、护理级别（模拟）
  customerList.value = res.data.map(c => ({
    ...c,
    bedNo: `${c.id}20${c.id}-1`,
    nurseLevel: c.id % 3 === 1 ? '二级' : '三级'
  }))
  customerTotal.value = customerList.value.length
  loadingCustomer.value = false
}

// 加载退住申请列表
const loadDischargeList = async () => {
  loadingDischarge.value = true
  const res = await getDischargeRecordList({
    name: queryForm.name,
    page: dischargePage.value,
    pageSize: pageSize.value
  })
  dischargeList.value = res.data.list
  dischargeTotal.value = res.data.total
  loadingDischarge.value = false
}

// 重置查询
const resetQuery = () => {
  queryForm.name = ''
  dischargePage.value = 1
  loadDischargeList()
}

// 打开添加弹窗
const openAddDialog = () => {
  Object.assign(addForm, {
    customerId: null,
    dischargeType: '正常退住',
    dischargeReason: '',
    dischargeTime: '',
    bedDetail: ''
  })
  addVisible.value = true
}

// 提交退住申请
const submitAdd = async () => {
  if (!addForm.customerId || !addForm.dischargeReason || !addForm.dischargeTime) {
    ElMessage.warning('请填写必填项')
    return
  }
  const customer = customerList.value.find(c => c.id === addForm.customerId)
  await addDischargeRecord({
    ...addForm,
    customerName: customer.name,
    gender: customer.gender,
    startDate: '2023-11-10' // 模拟入住时间
  })
  ElMessage.success('退住申请提交成功')
  addVisible.value = false
  loadDischargeList()
}

// 撤销申请
const cancelDischarge = async (row) => {
  await cancelDischargeRecord(row.id)
  ElMessage.success('申请已撤销')
  loadDischargeList()
}

onMounted(() => {
  loadCustomerList()
  loadDischargeList()
})
</script>

<style scoped>
.discharge-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.search-bar {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.card-header {
  background: #0099ff;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  margin: -16px -16px 16px -16px;
  border-radius: 8px 8px 0 0;
}
</style>