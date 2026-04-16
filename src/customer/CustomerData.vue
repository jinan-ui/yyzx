<template>
  <div class="customer-management">
    <!-- 查询条件：响应式栅格布局 -->
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryData" class="query-form">
        <el-row :gutter="20" align="middle">
          <!-- 客户姓名 -->
          <el-col :xs="24" :sm="8">
            <el-form-item label="客户姓名">
              <el-input
                v-model="queryData.customerName"
                placeholder="请输入姓名"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 老人类型 -->
          <el-col :xs="24" :sm="8">
            <el-form-item label="老人类型">
              <el-select
                v-model="queryData.elderType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="自理老人" value="SELF" />
                <el-option label="护理老人" value="NURSE" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮组 -->
          <el-col :xs="24" :sm="8">
            <el-form-item>
              <el-button type="primary" @click="getList">查询</el-button>
              <el-button @click="resetQuery" style="margin-left: 10px">重置</el-button>
              <el-button type="success" @click="openAdd" style="margin-left: 10px">新增入住</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 列表：响应式表格 -->
    <el-card shadow="hover" class="table-card">
      <div class="table-container">
        <el-table
          :data="tableData"
          border
          stripe
          align="center"
          size="default"
          fit
          style="width: 100%"
        >
          <el-table-column prop="customerName" label="姓名" min-width="100" />
          <el-table-column prop="age" label="年龄" min-width="80" />
          <el-table-column prop="gender" label="性别" min-width="80" />
          <el-table-column prop="idCard" label="身份证号" min-width="180" />
          <el-table-column prop="bloodType" label="血型" min-width="80" />
          <el-table-column prop="familyName" label="家属姓名" min-width="100" />
          <el-table-column prop="familyPhone" label="联系电话" min-width="130" />
          <el-table-column prop="buildingNo" label="楼栋" min-width="80" />
          <el-table-column prop="roomNo" label="房间号" min-width="100" />
          <el-table-column prop="bedNo" label="床位号" min-width="100" />
          <el-table-column prop="checkInTime" label="入住时间" align="center" width="160" />
          <el-table-column prop="contractEndTime" label="合同到期" align="center" width="160" />
          <el-table-column label="操作" align="center" width="180" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="doDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20]"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 引入新增编辑组件 -->
    <CustomerAdd ref="addRef" @refresh="getList" @save="handleSave" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerAdd from './CustomerAdd.vue'

const queryData = reactive({
  customerName: '',
  elderType: ''
})

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(4)
const total = ref(0)
const addRef = ref(null)

const mockList = ref([
  { id: 1, customerName: '毛兰英', age: 70, gender: '女', idCard: '2102121950xxxxxxx', bloodType: 'A', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2001', bedNo: '01', checkInTime: '2023-11-17 10:00:00', contractEndTime: '2025-11-16 10:00:00', elderType: 'SELF' },
  { id: 2, customerName: '张三', age: 80, gender: '男', idCard: '2102121950xxxxxxx', bloodType: 'B', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2015', bedNo: '01', checkInTime: '2023-11-30 10:00:00', contractEndTime: '2028-11-16 10:00:00', elderType: 'NURSE' },
  { id: 3, customerName: '张三', age: 80, gender: '男', idCard: '2102121950xxxxxxx', bloodType: 'B', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2015', bedNo: '01', checkInTime: '2023-11-30 10:00:00', contractEndTime: '2028-11-16 10:00:00', elderType: 'NURSE' },
  { id: 4, customerName: '张三', age: 80, gender: '男', idCard: '2102121950xxxxxxx', bloodType: 'B', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2015', bedNo: '01', checkInTime: '2023-11-30 10:00:00', contractEndTime: '2028-11-16 10:00:00', elderType: 'NURSE' },
  { id: 5, customerName: '张三', age: 80, gender: '男', idCard: '2102121950xxxxxxx', bloodType: 'B', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2015', bedNo: '01', checkInTime: '2023-11-30 10:00:00', contractEndTime: '2028-11-16 10:00:00', elderType: 'NURSE' },
  { id: 6, customerName: '张三', age: 80, gender: '男', idCard: '2102121950xxxxxxx', bloodType: 'B', familyName: '张四', familyPhone: '13800001111', buildingNo: '606', roomNo: '2015', bedNo: '01', checkInTime: '2023-11-30 10:00:00', contractEndTime: '2028-11-16 10:00:00', elderType: 'NURSE' }
])

// 接收子组件传过来的 新增/编辑 数据
const handleSave = (data) => {
  if (data.id) {
    // 编辑
    const index = mockList.value.findIndex(i => i.id === data.id)
    if (index !== -1) mockList.value[index] = { ...mockList.value[index], ...data }
  } else {
    // 新增
    data.id = Date.now()
    mockList.value.push(data)
  }
  getList()
}

const getList = () => {
  let data = [...mockList.value]
  if (queryData.customerName) data = data.filter(i => i.customerName.includes(queryData.customerName))
  if (queryData.elderType) data = data.filter(i => i.elderType === queryData.elderType)

  const totalPage = Math.ceil(data.length / pageSize.value)
  if (pageNum.value > totalPage && totalPage > 0) pageNum.value = totalPage

  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = data.slice(start, end)
  total.value = data.length
}

const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getList()
}

const resetQuery = () => {
  queryData.customerName = ''
  queryData.elderType = ''
  pageNum.value = 1
  getList()
}

const openAdd = () => addRef.value.open()
const openEdit = (row) => addRef.value.open(row)

const doDelete = (id) => {
  ElMessageBox.confirm('确定删除？', '提示').then(() => {
    mockList.value = mockList.value.filter(i => i.id !== id)
    getList()
    ElMessage.success('删除成功')
  })
}

onMounted(() => getList())
</script>

<style scoped>
.customer-management {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}
.search-card {
  margin-bottom: 16px;
}
.table-card {
  width: 100%;
}
.table-container {
  width: 100%;
  overflow-x: auto;
}
.pagination-box {
  margin-top: 16px;
  text-align: right;
}
</style>