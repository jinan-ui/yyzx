<template>
  <div class="goout-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="客户姓名：">
          <el-input v-model="queryForm.name" clearable style="width:200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOutList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" size="large" style="float:right" @click="openAddDialog">
        添加外出申请
      </el-button>
    </div>

    <!-- 双栏布局：客户信息 + 外出申请 -->
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

      <!-- 右侧：外出申请 -->
      <el-col :span="12">
        <div class="card">
          <div class="card-header">外出申请</div>
          <el-table :data="outList" border style="width:100%" v-loading="loadingOut">
            <el-table-column label="序号" width="60" align="center">
              <template #default="scope">
                <span>{{ (outPage - 1) * pageSize + scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户姓名" width="100" align="center" />
            <el-table-column prop="outReason" label="外出事由" width="100" align="center" />
            <el-table-column prop="outTime" label="外出时间" width="100" align="center" />
            <el-table-column prop="expectBackTime" label="预计回院时间" width="110" align="center" />
            <el-table-column prop="actualBackTime" label="实际回院时间" width="110" align="center" />
            <el-table-column prop="accompany" label="陪同人" width="80" align="center" />
            <el-table-column prop="relation" label="与老人关系" width="100" align="center" />
            <el-table-column prop="phone" label="陪同人电话" width="120" align="center" />
            <el-table-column prop="status" label="审批状态" width="90" align="center" />
            <el-table-column label="操作" align="center" width="160">
              <template #default="scope">
                <el-button
                  v-if="!scope.row.actualBackTime && scope.row.status !== '已撤销'"
                  type="success"
                  link
                  @click="openBackDialog(scope.row)"
                >
                  登记回院时间
                </el-button>
                <el-button
                  v-if="scope.row.status === '已提交'"
                  type="danger"
                  link
                  @click="cancelOut(scope.row)"
                >
                  撤销申请
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            v-model:page="outPage"
            v-model:page-size="pageSize"
            :total="outTotal"
            @size-change="loadOutList"
            @current-change="loadOutList"
            style="margin-top:15px;justify-content:flex-end"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 添加外出申请弹窗 -->
    <el-dialog v-model="addVisible" title="添加外出申请" width="600px">
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
        <el-form-item label="外出事由">
          <el-input v-model="addForm.outReason" style="width:100%" />
        </el-form-item>
        <el-form-item label="外出时间">
          <el-date-picker
            v-model="addForm.outTime"
            type="date"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="预计回院时间">
          <el-date-picker
            v-model="addForm.expectBackTime"
            type="date"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="陪同人">
          <el-input v-model="addForm.accompany" style="width:100%" />
        </el-form-item>
        <el-form-item label="与老人关系">
          <el-input v-model="addForm.relation" style="width:100%" />
        </el-form-item>
        <el-form-item label="陪同人电话">
          <el-input v-model="addForm.phone" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 登记回院时间弹窗 -->
    <el-dialog v-model="backVisible" title="登记回院时间" width="500px">
      <el-form :model="backForm" label-width="100px">
        <el-form-item label="实际回院时间">
          <el-date-picker
            v-model="backForm.actualBackTime"
            type="date"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="backVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBack">确认登记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMyCustomerList,
  getOutRecordList,
  addOutRecord,
  updateOutBackTime,
  cancelOutRecord
} from '../api/customer.js'

// 客户信息
const loadingCustomer = ref(false)
const customerList = ref([])
const customerPage = ref(1)
const customerTotal = ref(0)
const pageSize = ref(10)

// 外出申请
const loadingOut = ref(false)
const outList = ref([])
const outPage = ref(1)
const outTotal = ref(0)
const queryForm = reactive({ name: '' })

// 弹窗
const addVisible = ref(false)
const addForm = reactive({
  customerId: null,
  outReason: '',
  outTime: '',
  expectBackTime: '',
  accompany: '',
  relation: '',
  phone: ''
})

const backVisible = ref(false)
const backForm = reactive({ id: null, actualBackTime: '' })

// 加载客户列表
const loadCustomerList = async () => {
  loadingCustomer.value = true
  const res = await getMyCustomerList()
  // 补全床号、护理级别（模拟）
  customerList.value = res.data.map(c => ({
    ...c,
    bedNo: `${c.id}0${c.id}-1`,
    nurseLevel: c.id % 3 === 1 ? '二级' : '三级'
  }))
  customerTotal.value = customerList.value.length
  loadingCustomer.value = false
}

// 加载外出申请列表
const loadOutList = async () => {
  loadingOut.value = true
  const res = await getOutRecordList({
    name: queryForm.name,
    page: outPage.value,
    pageSize: pageSize.value
  })
  outList.value = res.data.list
  outTotal.value = res.data.total
  loadingOut.value = false
}

// 重置查询
const resetQuery = () => {
  queryForm.name = ''
  outPage.value = 1
  loadOutList()
}

// 打开添加弹窗
const openAddDialog = () => {
  Object.assign(addForm, {
    customerId: null,
    outReason: '',
    outTime: '',
    expectBackTime: '',
    accompany: '',
    relation: '',
    phone: ''
  })
  addVisible.value = true
}

// 提交外出申请
const submitAdd = async () => {
  if (!addForm.customerId || !addForm.outReason || !addForm.outTime) {
    ElMessage.warning('请填写必填项')
    return
  }
  const customer = customerList.value.find(c => c.id === addForm.customerId)
  await addOutRecord({
    ...addForm,
    customerName: customer.name,
    gender: customer.gender
  })
  ElMessage.success('申请提交成功')
  addVisible.value = false
  loadOutList()
}

// 打开回院时间弹窗
const openBackDialog = (row) => {
  backForm.id = row.id
  backForm.actualBackTime = new Date().toISOString().split('T')[0]
  backVisible.value = true
}

// 提交回院时间
const submitBack = async () => {
  if (!backForm.actualBackTime) {
    ElMessage.warning('请选择回院时间')
    return
  }
  await updateOutBackTime(backForm.id, backForm.actualBackTime)
  ElMessage.success('回院时间登记成功')
  backVisible.value = false
  loadOutList()
}

// 撤销申请
const cancelOut = async (row) => {
  await cancelOutRecord(row.id)
  ElMessage.success('申请已撤销')
  loadOutList()
}

onMounted(() => {
  loadCustomerList()
  loadOutList()
})
</script>

<style scoped>
.goout-container {
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
  background: #409eff;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  margin: -16px -16px 16px -16px;
  border-radius: 8px 8px 0 0;
}
</style>