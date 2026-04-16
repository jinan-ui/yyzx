<template>
  <div class="customer-goout">
    <!-- 查询区域：一行横排 + 响应式 -->
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
          <!-- 完全匹配截图的列表标题 -->
          <el-table-column label="序号" type="index" width="80" />
          <el-table-column label="客户姓名" prop="customerName" min-width="110" />
          <el-table-column label="外出事由" prop="reason" min-width="120" />
          <el-table-column label="外出时间" prop="goTime" min-width="140" />
          <el-table-column label="预计回院时间" prop="backTime" min-width="140" />
          <el-table-column label="实际回院时间" prop="realBackTime" min-width="140" />
          <el-table-column label="陪同人" prop="companion" min-width="100" />
          <el-table-column label="与老人关系" prop="relation" min-width="120" />
          <el-table-column label="陪同人电话" prop="companionPhone" min-width="140" />

          <el-table-column label="审批状态" prop="status" min-width="120">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === 'PASS'
                    ? 'success'
                    : scope.row.status === 'REJECT'
                    ? 'danger'
                    : 'warning'
                "
              >
                {{
                  scope.row.status === 'PENDING'
                    ? '已提交'
                    : scope.row.status === 'PASS'
                    ? '通过'
                    : '不通过'
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" fixed="right" min-width="120">
            <template #default="scope">
              <el-button
                type="success"
                @click="approve(scope.row, 'PASS')"
                :disabled="scope.row.status !== 'PENDING'"
                
              >
                审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Element Plus 分页插件 -->
      <div class="pagination-box">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="showList.length"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
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

// 原始数据
const customerList = ref([
  { id: 1, customerName: '孙瑞英', bedStatus: 'USE' },
  { id: 2, customerName: '张帆', bedStatus: 'USE' },
])

// 查询条件
const query = reactive({
  customerName: '',
  status: '',
})

// 原始外出数据（完全匹配截图）
const tableData = ref([
  {
    id: 1,
    customerName: '毛兰英',
    reason: '回家',
    goTime: '2026-4-20',
    backTime: '2026-4-24',
    realBackTime: '2023-11-4',
    companion: '毛丽',
    relation: '子女',
    companionPhone: '13456786754',
    status: 'PASS',
    approveUser: '管理员',
    approveTime: '2023-11-3 10:00:00',
  },
  {
    id: 2,
    customerName: '张三',
    reason: '买东西',
    goTime: '2023-11-10',
    backTime: '2023-11-11',
    realBackTime: '',
    companion: '',
    relation: '',
    companionPhone: '13456786754',
    status: 'REJECT',
    approveUser: '管理员',
    approveTime: '2023-11-10 10:00:00',
  },
  {
    id: 3,
    customerName: '王五',
    reason: '买东西',
    goTime: '2023-11-10',
    backTime: '2023-11-11',
    realBackTime: '',
    companion: '',
    relation: '',
    companionPhone: '13456786754',
    status: 'PENDING',
    approveUser: '',
    approveTime: '',
  }
  
])

// 表格显示的数据
const showList = ref([])

// 分页参数
const pageNum = ref(1)
const pageSize = ref(5)

// ======================
// 1. 刚进页面显示全部
// ======================
onMounted(() => {
  showList.value = [...tableData.value]
})

// ======================
// 2. 点击查询才筛选
// ======================
const getList = () => {
  let arr = [...tableData.value]

  // 姓名模糊查询
  if (query.customerName) {
    arr = arr.filter(item =>
      item.customerName.includes(query.customerName)
    )
  }

  // 状态筛选
  if (query.status) {
    arr = arr.filter(item => item.status === query.status)
  }

  showList.value = arr
  pageNum.value = 1 // 查询后回到第一页
  ElMessage.success('查询成功')
}

// ======================
// 分页计算
// ======================
const paginatedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return showList.value.slice(start, end)
})

// ======================
// 重置 → 恢复全部数据
// ======================
const resetQuery = () => {
  query.customerName = ''
  query.status = ''
  showList.value = [...tableData.value]
  pageNum.value = 1
  ElMessage.success('已重置')
}

// ======================
// 审核（点击审批按钮）
// ======================
const approve = (row, status) => {
  ElMessageBox.confirm('确定要执行审核操作吗？', '提示').then(() => {
    row.status = status
    row.approveUser = '管理员'
    row.approveTime = new Date().toLocaleString()

    if (status === 'PASS') {
      const cust = customerList.value.find(x => x.customerName === row.customerName)
      if (cust) cust.bedStatus = 'OUT'
      ElMessage.success('审核成功，床位状态已改为【外出】')
    } else {
      ElMessage.success('审核成功')
    }
  })
}

// ======================
// 回院（保留功能，可扩展）
// ======================
const back = (row) => {
  row.realBackTime = new Date().toLocaleString()
  const cust = customerList.value.find(x => x.customerName === row.customerName)
  if (cust) cust.bedStatus = 'USE'
  ElMessage.success('已登记回院，床位恢复使用')
}
</script>

<style scoped>
.customer-goout {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}
.search-card { margin-bottom: 16px; }
.table-card { width: 100%; }
.table-container { width: 100%; overflow-x: auto; }

/* 分页样式 */
.pagination-box {
  margin-top: 16px;
  text-align: right;
}
</style>