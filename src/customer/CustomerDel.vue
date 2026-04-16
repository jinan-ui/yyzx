<template>
  <div class="customer-del">
    <!-- 查询区域：响应式横排 -->
    <el-card shadow="hover" class="search-card">
      <el-form :model="query" class="query-form">
        <el-row :gutter="20" align="middle">
          <el-col :xs="24" :sm="8">
            <el-form-item label="客户姓名">
              <el-input
                v-model="query.customerName"
                placeholder="请输入姓名"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="8">
            <el-form-item label="审核状态">
              <el-select
                v-model="query.status"
                placeholder="全部"
                style="width: 100%"
              >
                <el-option label="全部" value="" />
                <el-option label="待审核" value="PENDING" />
                <el-option label="通过" value="PASS" />
                <el-option label="不通过" value="REJECT" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="8">
            <el-form-item>
              <el-button type="primary" @click="getList">查询</el-button>
              <el-button @click="resetQuery" style="margin-left:10px">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="hover" class="table-card">
      <div class="table-container">
        <el-table
          :data="paginatedList"
          border
          stripe
          align="center"
          size="default"
          fit
        >
          <el-table-column label="姓名" prop="customerName" min-width="110" />
          
          <el-table-column label="退住类型" prop="type" min-width="130">
            <template #default="scope">
              <el-tag :type="
                scope.row.type === 'NORMAL' ? 'success' : 
                scope.row.type === 'DEAD' ? 'danger' : 'info'
              ">
                {{ 
                  scope.row.type === 'NORMAL' ? '正常退住' : 
                  scope.row.type === 'DEAD' ? '死亡退住' : '保留床位' 
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="退住原因" prop="reason" min-width="180" />
          <el-table-column label="退住时间" prop="outTime" min-width="160" />
          
          <el-table-column label="审核状态" prop="status" min-width="120">
            <template #default="scope">
              <el-tag :type="
                scope.row.status === 'PASS' ? 'success' : 
                scope.row.status === 'REJECT' ? 'danger' : 'warning'
              ">
                {{ 
                  scope.row.status === 'PENDING' ? '待审核' : 
                  scope.row.status === 'PASS' ? '通过' : '不通过' 
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="审批人" prop="approveUser" min-width="100" />
          <el-table-column label="审批时间" prop="approveTime" min-width="160" />

          <el-table-column label="操作" fixed="right" min-width="180">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="approve(scope.row, 'PASS')"
                :disabled="scope.row.status !== 'PENDING'"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                link
                @click="approve(scope.row, 'REJECT')"
                :disabled="scope.row.status !== 'PENDING'"
              >
                不通过
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="showList.length"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5,10,20]"
          background
          @size-change="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 客户数据（关联床位）
const customerList = ref([
  { id: 1, customerName: '毛兰英', bedStatus: 'USE' },
  { id: 2, customerName: '张三', bedStatus: 'USE' },
])

// 查询条件
const query = reactive({
  customerName: '',
  status: '',
})

// 退住数据
const tableData = ref([
  {
    id: 1,
    customerName: '毛兰英',
    type: 'NORMAL',
    reason: '家中有事',
    outTime: '2026-04-20 12:00:00',
    status: 'PENDING',
    approveUser: '',
    approveTime: '',
  },
])

// 显示列表
const showList = ref([])

// 分页
const pageNum = ref(1)
const pageSize = ref(5)

// 初始化加载全部
onMounted(() => {
  showList.value = [...tableData.value]
})

// 查询（模糊姓名 + 状态）
const getList = () => {
  let arr = [...tableData.value]
  if (query.customerName) {
    arr = arr.filter((item) => item.customerName.includes(query.customerName))
  }
  if (query.status) {
    arr = arr.filter((item) => item.status === query.status)
  }
  showList.value = arr
  pageNum.value = 1
  ElMessage.success('查询成功')
}

// 重置
const resetQuery = () => {
  query.customerName = ''
  query.status = ''
  showList.value = [...tableData.value]
  pageNum.value = 1
  ElMessage.success('已重置')
}

// 审核逻辑（核心需求）
const approve = (row, status) => {
  ElMessageBox.confirm('确定要执行审核操作吗？', '提示').then(() => {
    row.status = status
    row.approveUser = '管理员'
    row.approveTime = new Date().toLocaleString()

    // 需求：正常退住 / 死亡退住 → 审核通过 → 床位改为可用
    if (status === 'PASS') {
      if (row.type === 'NORMAL' || row.type === 'DEAD') {
        const cust = customerList.value.find((x) => x.customerName === row.customerName)
        if (cust) {
          cust.bedStatus = 'FREE'
          ElMessage.success('审核成功，床位状态已改为【可用】')
        }
      } else {
        ElMessage.success('审核成功（保留床位，不修改状态）')
      }
    } else {
      ElMessage.success('审核成功')
    }
  })
}

// 分页计算
const paginatedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  return showList.value.slice(start, start + pageSize.value)
})
</script>

<style scoped>
.customer-del {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}
.search-card { margin-bottom: 16px; }
.table-card { width: 100%; }
.table-container { width: 100%; overflow-x: auto; }
.pagination-box { margin-top: 16px; text-align: right; }
</style>