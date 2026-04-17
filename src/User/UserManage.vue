<template>
  <div class="page-content">

    <!-- 查询区域 -->
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="用户姓名">
        <el-input v-model="queryForm.userName" placeholder="请输入用户姓名" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAddUser">添加</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <div class="table-container">
      <el-table :data="userList" border stripe :row-style="{ height: '60px' }" height="450" :header-cell-style="{ height: '60px' }">
        <el-table-column prop="id" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center" />
        <el-table-column prop="realName" label="姓名" align="center" />
        <el-table-column prop="phone" label="电话" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="role" label="员工类型" align="center" />
        <el-table-column prop="password" label="默认密码" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEditUser(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
      layout="total, prev, pager, next, jumper" @size-change="getUserListData" @current-change="getUserListData"
      class="pagination" />

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="90%" :style="{ maxWidth: '500px' }">
      <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="80px" class="dialog-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" @input="setDefaultPwd" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码">
          <el-input v-model="userForm.password" placeholder="默认手机号后6位" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="userForm.gender">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="员工类型" prop="role">
          <el-select v-model="userForm.role">
            <el-option label="护工" value="护工" />
            <el-option label="医生" value="医生" />
            <el-option label="管理员" value="管理员" />
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

// 查询条件
const queryForm = ref({ userName: '' })

// 列表
const userList = ref([])
const currentPage = ref(1)
const pageSize = ref(30)
const total = ref(0)

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const userFormRef = ref(null)

// 表单
const userForm = reactive({
  id: null,
  username: '',
  realName: '',
  phone: '',
  gender: '',
  email: '',
  role: '',
  password: ''
})

// 校验
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

// 生成用户名
function generateUsername() {
  const first = ['zhang', 'li', 'wang', 'zhao', 'liu', 'chen', 'yang', 'huang', 'wu', 'zhou', 'xu', 'sun', 'hu', 'lin', 'guo']
  const second = ['ming', 'hua', 'wei', 'fang', 'li', 'na', 'yu', 'hong', 'qiang', 'min', 'jing', 'tao', 'peng', 'fei', 'ying']
  const num = Math.floor(Math.random() * 90) + 10
  return first[Math.floor(Math.random() * first.length)] + second[Math.floor(Math.random() * second.length)] + num
}

// 模拟数据
const generateMockData = () => {
  let list = []
  let id = 1
  // 医生
  for (let i = 1; i <= 400; i++) {
    let phone = `1380013${String(i).padStart(4, '0')}`
    list.push({
      id: id++,
      username: generateUsername(),
      realName: `医生${i}`,
      phone: phone,
      password: phone.slice(-6),
      gender: i % 2 === 0 ? '男' : '女',
      email: `doctor${i}@example.com`,
      role: '医生'
    })
  }
  // 护工
  for (let i = 1; i <= 700; i++) {
    let phone = `1380014${String(i).padStart(4, '0')}`
    list.push({
      id: id++,
      username: generateUsername(),
      realName: `护士${i}`,
      phone: phone,
      password: phone.slice(-6),
      gender: i % 2 === 0 ? '女' : '男',
      email: `nurse${i}@example.com`,
      role: '护工'
    })
  }
  // 管理员
  for (let i = 1; i <= 50; i++) {
    let phone = `1380015${String(i).padStart(4, '0')}`
    list.push({
      id: id++,
      username: generateUsername(),
      realName: `管理员${i}`,
      phone: phone,
      password: phone.slice(-6),
      gender: i % 2 === 0 ? '男' : '女',
      email: `admin${i}@example.com`,
      role: '管理员'
    })
  }
  return list
}

const mockUserList = ref(generateMockData())

// 加载列表
const getUserListData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  userList.value = mockUserList.value.slice(start, end)
  total.value = mockUserList.value.length
}

// 自动设置密码
const setDefaultPwd = (val) => {
  if (val && val.length >= 6) {
    userForm.password = val.slice(-6)
  }
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  const filtered = mockUserList.value.filter(item => item.realName.includes(queryForm.value.userName))
  userList.value = filtered.slice(0, pageSize.value)
  total.value = filtered.length
}

// 重置
const handleReset = () => {
  queryForm.value.userName = ''
  getUserListData()
}

// 新增
const handleAddUser = () => {
  isEdit.value = false
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
  Object.assign(userForm, {
    id: null,
    username: '',
    realName: '',
    phone: '',
    gender: '',
    email: '',
    role: '',
    password: '' // 清空密码
  })
}

// 编辑
const handleEditUser = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  Object.assign(userForm, row)
}

// 提交
const handleSubmit = () => {
  userFormRef.value.validate(valid => {
    if (valid) {
      ElMessageBox.confirm('确认保存？').then(() => {
        if (!isEdit.value) {
          mockUserList.value.push({ ...userForm, id: mockUserList.value.length + 1 })
          ElMessage.success('新增成功')
        } else {
          const idx = mockUserList.value.findIndex(x => x.id === userForm.id)
          mockUserList.value[idx] = { ...userForm }
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        getUserListData()
      })
    }
  })
}

// 删除
const handleDeleteUser = (id) => {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }).then(() => {
    const idx = mockUserList.value.findIndex(x => x.id === id)
    mockUserList.value.splice(idx, 1)
    ElMessage.success('删除成功')
    getUserListData()
  })
}

onMounted(() => {
  getUserListData()
})
</script>

<style scoped>
.page-content {
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - 120px);
  position: relative;
}

.user-manage-page::before {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.care-record-page {
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - 120px);
  position: relative;
}
.search-form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

:deep(.el-table__row) {
  height: 60px !important;
}

:deep(.el-table__header-wrapper th),
:deep(.el-table__body-wrapper td) {
  height: 60px !important;
  line-height: 60px !important;
  text-align: center !important;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
  z-index: 1;
}
</style>