<template>
  <div class="page-content">
    <div class="page-title">膳食管理</div>
    <div class="page-desc">颐养中心膳食配置、食谱管理、膳食发放记录</div>

    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="客户姓名">
        <el-input v-model="queryForm.customerName" placeholder="请输入客户姓名" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="膳食类型">
        <el-select v-model="queryForm.type" placeholder="全部" style="width: 160px">
          <el-option label="全部类型" value="" />
          <el-option label="早餐" value="早餐" />
          <el-option label="午餐" value="午餐" />
          <el-option label="晚餐" value="晚餐" />
          <el-option label="加餐" value="加餐" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">新增膳食记录</el-button>
      </el-form-item>
    </el-form>

    <div class="table-container">
      <el-table :data="tableData" border stripe height="450">
        <el-table-column label="序号" type="index" align="center" width="70" />
        <el-table-column label="客户姓名" prop="customerName" align="center" />
        <el-table-column label="膳食类型" prop="type" align="center" />
        <el-table-column label="膳食内容" prop="content" align="center" />
        <el-table-column label="膳食日期" prop="date" align="center" />
        <el-table-column label="发放状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发放' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      class="pagination"
      @size-change="loadList"
      @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="膳食类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="加餐" value="加餐" />
          </el-select>
        </el-form-item>
        <el-form-item label="膳食内容" prop="content">
          <el-input v-model="form.content" type="textarea" rows="3" placeholder="请填写膳食内容" />
        </el-form-item>
        <el-form-item label="膳食日期" prop="date">
          <el-input v-model="form.date" placeholder="例：2026-04-17" />
        </el-form-item>
        <el-form-item label="发放状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="未发放" value="未发放" />
            <el-option label="已发放" value="已发放" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({
  customerName: '',
  type: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const tableData = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  customerName: '',
  type: '',
  content: '',
  date: '',
  status: '未发放'
})

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择膳食类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入膳食内容', trigger: 'blur' }],
  date: [{ required: true, message: '请输入膳食日期', trigger: 'blur' }]
}

const mockData = ref([])

const names = [
  '张桂英', '李福才', '王秀兰', '刘桂兰', '陈秀英', '周桂英', '吴桂兰', '郑福才', '王桂英', '林秀英'
]
const types = ['早餐', '午餐', '晚餐', '加餐']
const contents = [
  '小米粥、鸡蛋、馒头',
  '米饭、鱼香肉丝、蛋汤',
  '面条、青菜、卤蛋',
  '牛奶、面包、水果',
  '馄饨、油条、豆浆',
  '炒饭、时蔬、汤品',
  '包子、粥、小咸菜'
]
const statusList = ['已发放', '未发放']

for (let i = 1; i <= 84; i++) {
  mockData.value.push({
    id: i,
    customerName: names[i % names.length],
    type: types[i % types.length],
    content: contents[i % contents.length],
    date: `2026-04-${String(i % 30 + 1).padStart(2, '0')}`,
    status: statusList[i % statusList.length]
  })
}

const loadList = () => {
 
  let data = [...mockData.value]
  const { customerName, type } = queryForm.value

  if (customerName) {
    data = data.filter(item => item.customerName.includes(customerName))
  }
  if (type) {
    data = data.filter(item => item.type === type)
  }

  total.value = data.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = data.slice(start, end)
}

const handleQuery = () => {
  currentPage.value = 1
  loadList()
}


const handleReset = () => {
  queryForm.value.customerName = ''
  queryForm.value.type = ''
  currentPage.value = 1
  loadList()
}


const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增膳食记录'
  dialogVisible.value = true
  Object.assign(form, {
    id: null,
    customerName: '',
    type: '',
    content: '',
    date: '',
    status: '未发放'
  })
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑膳食记录'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    if (!isEdit.value) {
      const newId = mockData.value.length + 1
      mockData.value.unshift({ ...form, id: newId })
      ElMessage.success('新增成功')
    } else {
      const index = mockData.value.findIndex(item => item.id === form.id)
      mockData.value[index] = { ...form }
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    loadList()
  })
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该记录吗？')
  mockData.value = mockData.value.filter(item => item.id !== id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.page-content {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}
.page-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}
.search-form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.table-container {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}
.pagination {
  display: flex;
  justify-content: center;
}
</style>