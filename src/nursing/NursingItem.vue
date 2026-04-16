<template>
  <div class="nursing-items-container">
    <!-- 按钮组：查询 + 添加 一行，启用停用 一行（1:1还原原型图） -->
    <div class="btn-group card-shadow">
      <!-- 第一行：查询 + 添加 -->
      <div class="row1">
        <el-input
          v-model="searchKeyword"
          placeholder="护理项目名称"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <el-button 
          type="primary" 
          @click="handleSearch"
          :disabled="!searchKeyword.trim()"
          class="btn-radius"
        >
          查询
        </el-button>
        <el-button type="primary" class="add-btn btn-radius" @click="handleAdd">添加</el-button>
      </div>

      <!-- 第二行：启用 + 停用 -->
      <div class="batch-btns row2">
        <el-button 
          :type="batchActive === 'enable' ? 'primary' : 'info'" 
          :plain="batchActive !== 'enable'"
          class="btn-radius"
          @click="handleBatchEnable"
        >
          启用
        </el-button>
        <el-button 
          :type="batchActive === 'disable' ? 'primary' : 'info'" 
          :plain="batchActive !== 'disable'"
          class="btn-radius"
          @click="handleBatchDisable"
        >
          停用
        </el-button>
      </div>
    </div>

    <!-- 护理项目表格（原型图1核心） -->
    <el-table 
      :data="filteredItemsList" 
      border 
      style="width: 100%; margin-top: 20px;"
      :header-cell-style="{background:'#f5f7fa',color:'#333'}"
    >
      <el-table-column label="序号" type="index" width="80" align="center">
        <template #default="{ $index }">
          <span class="index-badge">{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="编号" align="center" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="price" label="价格" align="center">
        <template #default="{ row }">
          <span class="price-text">{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="frequency" label="执行周次" align="center">
        <template #default="{ row }">
          <el-icon style="margin-right:4px" size="14"><Clock /></el-icon>
          {{ row.frequency }}
        </template>
      </el-table-column>
      <el-table-column prop="times" label="执行次数" align="center" />
      <el-table-column prop="desc" label="描述" align="center" />
      <el-table-column prop="status" label="状态" align="center" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light" round>
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <div class="custom-pagination">
        <span class="total-text">共 {{ itemTotal }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handleSizeChange">
          <el-option label="5条/页" :value="5" />
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
        </el-select>
        <el-button :icon="ArrowLeft" :disabled="pageNum === 1" @click="handlePrevPage" class="page-btn" />
        <div class="page-numbers">
          <span v-for="page in pageNumbers" :key="page" :class="{ active: page === pageNum }" class="page-number" @click="goToPage(page)">{{ page }}</span>
        </div>
        <el-button :icon="ArrowRight" :disabled="pageNum === totalPages" @click="handleNextPage" class="page-btn" />
        <span class="jump-text">前往</span>
        <el-input v-model="jumpPage" class="jump-input" @keyup.enter="handleJumpPage" />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑护理项目' : '新增护理项目'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
      custom-class="dialog-card"
    >
      <el-form :model="itemForm" :rules="itemFormRules" ref="itemFormRef" label-width="100px">
        <el-form-item label="编号:" prop="id">
          <el-input v-model="itemForm.id" placeholder="请输入编号" :readonly="isEdit" />
        </el-form-item>
        <el-form-item label="名称:" prop="name">
          <el-input v-model="itemForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="价格:" prop="price">
          <el-input v-model="itemForm.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="执行周期:" prop="frequency">
          <el-select v-model="itemForm.frequency" placeholder="请选择执行周期">
            <el-option label="每天" value="每天" />
            <el-option label="每周" value="每周" />
            <el-option label="每月" value="每月" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行次数:" prop="times">
          <el-input v-model="itemForm.times" placeholder="请输入执行次数" />
        </el-form-item>
        <el-form-item label="描述:" prop="desc">
          <el-input v-model="itemForm.desc" placeholder="请输入描述" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态:" prop="status">
          <el-select v-model="itemForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, Clock } from '@element-plus/icons-vue'

// ==================== 护理级别-项目关联配置（与级别页面同步）====================
const levelItemConfig = ref({
  1: ['HLXM0001', 'HLXM0002'],
  2: ['HLXM0001']
})

// ==================== 局部变量 ====================
const itemsList = ref([
  { id: 'HLXM0001', name: '吸氧', price: '60元/次', frequency: '每天', times: 2, desc: '', status: 1 },
  { id: 'HLXM0002', name: '协助服药', price: '免费', frequency: '每天', times: 3, desc: '', status: 1 },
  { id: 'HLXM0003', name: '康复训练', price: '100元/次', frequency: '每周', times: 2, desc: '', status: 1 },
  { id: 'HLXM0004', name: '生命体征监测', price: '80元/次', frequency: '每天', times: 2, desc: '', status: 1 },
  { id: 'HLXM0005', name: '压疮护理', price: '50元/次', frequency: '每天', times: 1, desc: '', status: 1 },
  { id: 'HLXM0006', name: '口腔护理', price: '30元/次', frequency: '每天', times: 1, desc: '', status: 1 },
  { id: 'HLXM0007', name: '静脉输液', price: '40元/次', frequency: '每天', times: 1, desc: '', status: 1 },
  { id: 'HLXM0008', name: '导尿护理', price: '70元/次', frequency: '每天', times: 1, desc: '', status: 1 },
  { id: 'HLXM0009', name: '伤口换药', price: '45元/次', frequency: '每天', times: 1, desc: '', status: 1 },
  { id: 'HLXM0010', name: '雾化吸入', price: '35元/次', frequency: '每天', times: 1, desc: '', status: 1 }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref(null)
const itemFormRef = ref(null)

const itemForm = ref({
  id: '',
  name: '',
  price: '',
  frequency: '每天',
  times: '',
  desc: '',
  status: 1
})

const itemFormRules = {
  id: [{ required: true, message: '请输入编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  frequency: [{ required: true, message: '请选择执行周期', trigger: 'change' }],
  times: [{ required: true, message: '请输入执行次数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const batchActive = ref('enable')
const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const jumpPage = ref('')

const itemTotal = computed(() => {
  let list = [...itemsList.value]
  if (searchKeyword.value) list = list.filter(item => item.name.includes(searchKeyword.value))
  return list.length
})

const totalPages = computed(() => Math.ceil(itemTotal.value / pageSize.value))

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

const filteredItemsList = computed(() => {
  let list = [...itemsList.value]
  if (searchKeyword.value) list = list.filter(item => item.name.includes(searchKeyword.value))
  const start = (pageNum.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

// ==================== 核心方法 ====================
const removeItemFromLevelConfig = (itemId) => {
  Object.keys(levelItemConfig.value).forEach(levelId => {
    const list = levelItemConfig.value[levelId]
    if (list.includes(itemId)) {
      levelItemConfig.value[levelId] = list.filter(id => id !== itemId)
    }
  })
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  currentEditId.value = null
  itemForm.value = { id: '', name: '', price: '', frequency: '每天', times: '', desc: '', status: 1 }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  currentEditId.value = row.id
  itemForm.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除护理项目「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    removeItemFromLevelConfig(row.id)
    itemsList.value = itemsList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 提交
const handleSubmit = () => {
  itemFormRef.value.validate(valid => {
    if (!valid) return
    if (isEdit.value) {
      if (itemForm.value.status === 0) removeItemFromLevelConfig(itemForm.value.id)
      const index = itemsList.value.findIndex(item => item.id === currentEditId.value)
      if (index !== -1) itemsList.value[index] = { ...itemForm.value }
      ElMessage.success('修改成功')
    } else {
      itemsList.value.push({ ...itemForm.value })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  })
}

// 关闭重置
const handleDialogClose = () => {
  itemFormRef.value?.resetFields()
}

// 批量启用
const handleBatchEnable = () => {
  batchActive.value = 'enable'
  itemsList.value.forEach(item => item.status = 1)
  ElMessage.success('批量启用成功')
}

// 批量停用
const handleBatchDisable = () => {
  batchActive.value = 'disable'
  itemsList.value.forEach(item => {
    item.status = 0
    removeItemFromLevelConfig(item.id)
  })
  ElMessage.success('批量停用成功')
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  ElMessage.success('查询完成')
}

// 分页
const handleSizeChange = val => { pageSize.value = val; pageNum.value = 1 }
const handlePrevPage = () => pageNum.value--
const handleNextPage = () => pageNum.value++
const goToPage = p => pageNum.value = p
const handleJumpPage = () => {
  const p = Number(jumpPage.value)
  if (p > 0 && p <= totalPages.value) pageNum.value = p
  else ElMessage.warning('请输入有效页码')
}
</script>

<style scoped>
.nursing-items-container {
  padding: 20px;
}

/* 个性化卡片阴影 */
.card-shadow {
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 10px;
}
.row1 {
  display: flex;
  align-items: center;
  gap: 10px;
}
.row2 {
  display: flex;
  gap: 10px;
}
.add-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
}
.batch-btns .el-button {
  width: 100px;
  height: 40px;
  font-size: 16px;
}

/* 按钮圆角个性化 */
.btn-radius {
  border-radius: 8px !important;
}

/* 序号样式 */
.index-badge {
  display: inline-block;
  width: 26px;
  height: 26px;
  line-height: 26px;
  border-radius: 50%;
  background: #f4f6f8;
  color: #666;
  font-size: 13px;
}

/* 价格高亮 */
.price-text {
  font-weight: 600;
  color: #f56c6c;
  font-size: 15px;
}

/* 弹窗卡片 */
.dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

/* 分页样式 */
.pagination-container {
  margin-top: 15px;
  padding: 12px 0;
  background: #ffffff;
  border: none;
  text-align: left;
}
.custom-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}
.total-text { font-size: 16px; color: #333; }
.page-size-select { width: 110px; height: 40px; font-size: 16px; }
.page-btn { width: 40px; height: 40px; border-radius: 4px; }
.page-numbers { display: flex; gap: 4px; }
.page-number {
  width: 40px; height: 40px; line-height: 40px; text-align: center;
  border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer;
}
.page-number.active { background: #409eff; color: #fff; border-color: #409eff; }
.jump-text { font-size: 16px; color: #333; margin: 0 2px; }
.jump-input { width: 60px; height: 40px; text-align: center; font-size: 16px; }

.el-table {
  font-size: 14px;
  --el-table-row-hover-bg-color: #f8f9fa;
}
</style>