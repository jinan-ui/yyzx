<template>
  <div class="nursing-level-container">
    <!-- 操作按钮区+筛选区 -->
    <div class="top-bar">
      <div class="btn-group">
        <el-button type="primary" class="add-btn" @click="handleAdd">添加</el-button>
        <div class="batch-btns">
          <el-button 
            type="success" 
            @click="handleBatchEnable"
            :disabled="selectedLevelRows.length === 0"
          >
            批量启用
          </el-button>
          <el-button 
            type="warning" 
            @click="handleBatchDisable"
            :disabled="selectedLevelRows.length === 0"
          >
            批量停用
          </el-button>
        </div>
      </div>
      <!-- 状态筛选 -->
      <div class="filter-group">
        <span>状态筛选：</span>
        <el-select v-model="statusFilter" placeholder="全部" style="width: 120px;">
          <el-option label="全部" :value="''" />
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </div>
    </div>

    <!-- 护理级别表格（带多选） -->
    <el-table 
      :data="filteredLevelList" 
      border 
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column prop="levelName" label="护理级别" align="center" />
      <el-table-column prop="status" label="状态" align="center" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
          <el-button type="success" link @click="handleConfigItems(row)">护理项目配置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件（1:1还原截图样式） -->
    <div class="pagination-container">
      <div class="custom-pagination">
        <span class="total-text">共 {{ levelTotal }} 条</span>
        <el-select 
          v-model="pageSize" 
          class="page-size-select"
          @change="handleSizeChange"
        >
          <el-option label="5条/页" :value="5" />
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
        </el-select>
        <el-button 
          :icon="ArrowLeft" 
          :disabled="pageNum === 1"
          @click="handlePrevPage"
          class="page-btn"
        />
        <div class="page-numbers">
          <span 
            v-for="page in pageNumbers" 
            :key="page"
            :class="{ active: page === pageNum }"
            class="page-number"
            @click="goToPage(page)"
          >
            {{ page }}
          </span>
        </div>
        <el-button 
          :icon="ArrowRight" 
          :disabled="pageNum === totalPages"
          @click="handleNextPage"
          class="page-btn"
        />
        <span class="jump-text">前往</span>
        <el-input 
          v-model="jumpPage" 
          class="jump-input"
          @keyup.enter="handleJumpPage"
        />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
<el-dialog
  v-model="dialogVisible"
  :title="isEdit ? '编辑护理级别' : '添加护理级别'"
  width="500px"
  :close-on-click-modal="false"
  @close="handleDialogClose"
>
  <el-form :model="levelForm" :rules="levelFormRules" ref="levelFormRef" label-width="120px">
    <!-- 护理级别名称：编辑时只读不可改 -->
    <el-form-item label="护理级别:" prop="levelName">
      <el-input 
        v-model="levelForm.levelName" 
        placeholder="请输入护理级别名称" 
        :readonly="isEdit" 
        :disabled="isEdit" 
      />
    </el-form-item>
    <el-form-item label="状态:" prop="status">
      <el-select v-model="levelForm.status" placeholder="请选择状态">
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

    <!-- 护理项目配置弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="`${currentConfigLevel?.levelName || ''} - 护理项目配置`"
      width="85%"
      :close-on-click-modal="false"
      @close="handleItemDialogClose"
    >
      <div class="search-bar">
        <el-input 
          v-model="itemSearchKeyword" 
          placeholder="护理项目名称" 
          style="width: 220px; margin-right: 10px;"
        />
        <el-button type="primary" @click="handleItemSearch">查询</el-button>
        <el-button type="primary" @click="saveLevelItemConfig">保存配置</el-button>
        <el-button @click="itemDialogVisible = false">返回</el-button>
      </div>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 左侧：所有启用状态的护理项目（未在当前级别配置的） -->
        <el-col :span="12">
          <div class="table-title">可添加护理项目</div>
          <el-table 
            :data="filteredAvailableItems" 
            border 
            style="width: 100%;" 
            height="400"
            :show-header="true"
          >
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column prop="id" label="编号" align="center" width="100" />
            <el-table-column prop="name" label="名称" align="center" width="120" />
            <el-table-column prop="price" label="价格" align="center" width="100" />
            <el-table-column prop="frequency" label="执行周次" align="center" width="100" />
            <el-table-column prop="times" label="执行次数" align="center" width="80" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="addItemToSelected(row)"
                >
                  添加
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <!-- 右侧：当前级别已配置的护理项目 -->
        <el-col :span="12">
          <div class="table-title">已配置护理项目（{{ currentConfigLevel?.levelName || '' }}）</div>
          <el-table 
            :data="selectedItems" 
            border 
            style="width: 100%;" 
            height="400"
            :show-header="true"
          >
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column prop="id" label="编号" align="center" width="100" />
            <el-table-column prop="name" label="名称" align="center" width="120" />
            <el-table-column prop="price" label="价格" align="center" width="100" />
            <el-table-column prop="frequency" label="执行周次" align="center" width="100" />
            <el-table-column prop="times" label="执行次数" align="center" width="80" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row, $index }">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeItemFromSelected($index)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <!-- 配置分页（同主页面样式） -->
      <div class="item-pagination">
        <div class="custom-pagination">
          <span class="total-text">共 {{ itemTotal }} 条</span>
          <el-select 
            v-model="itemPageSize" 
            class="page-size-select"
            @change="handleItemSizeChange"
          >
            <el-option label="5条/页" :value="5" />
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
          </el-select>
          <el-button 
            :icon="ArrowLeft" 
            :disabled="itemPageNum === 1"
            @click="handleItemPrevPage"
            class="page-btn"
          />
          <div class="page-numbers">
            <span 
              v-for="page in itemPageNumbers" 
              :key="page"
              :class="{ active: page === itemPageNum }"
              class="page-number"
              @click="goToItemPage(page)"
            >
              {{ page }}
            </span>
          </div>
          <el-button 
            :icon="ArrowRight" 
            :disabled="itemPageNum === itemTotalPages"
            @click="handleItemNextPage"
            class="page-btn"
          />
          <span class="jump-text">前往</span>
          <el-input 
            v-model="itemJumpPage" 
            class="jump-input"
            @keyup.enter="handleItemJumpPage"
          />
          <span class="jump-text">页</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// ==================== 全局共享数据（和护理项目页面联动） ====================
// 护理项目列表（从NursingItem.vue共享，仅显示启用状态）
const allNursingItems = ref([
  { id: 'HLXM0001', name: '吸氧', price: '60元/次', frequency: '每天', times: 2, status: 1 },
  { id: 'HLXM0002', name: '协助服药', price: '免费', frequency: '每天', times: 3, status: 1 },
  { id: 'HLXM0003', name: '康复训练', price: '100元/次', frequency: '每周', times: 2, status: 1 },
  { id: 'HLXM0004', name: '生命体征监测', price: '80元/次', frequency: '每天', times: 2, status: 1 },
  { id: 'HLXM0005', name: '压疮护理', price: '50元/次', frequency: '每天', times: 1, status: 1 },
  { id: 'HLXM0006', name: '口腔护理', price: '30元/次', frequency: '每天', times: 1, status: 1 },
  { id: 'HLXM0007', name: '静脉输液', price: '40元/次', frequency: '每天', times: 1, status: 1 },
  { id: 'HLXM0008', name: '导尿护理', price: '70元/次', frequency: '每天', times: 1, status: 1 }
])

// 级别-项目关联数据（存储每个级别已配置的项目）
const levelItemConfig = ref({
  1: ['HLXM0001', 'HLXM0002'], // 一级已配置项目
  2: ['HLXM0001'], // 二级已配置项目
  3: ['HLXM0003', 'HLXM0004'],
  4: ['HLXM0005', 'HLXM0006'],
  5: ['HLXM0007', 'HLXM0008']
})

// ==================== 页面局部数据 ====================
// 1. 护理级别列表数据
const nursingLevelList = ref([
  { id: 1, levelName: '一级护理', status: 1 }, 
  { id: 2, levelName: '二级护理', status: 1 },
  { id: 3, levelName: '三级护理', status: 1 },
  { id: 4, levelName: '特级护理', status: 1 },
  { id: 5, levelName: '康复护理', status: 1 },
  { id: 6, levelName: '术后护理', status: 0 },
  { id: 7, levelName: '老年护理', status: 1 },
  { id: 8, levelName: '重症护理', status: 0 }
])

// 2. 分页相关（主列表）
const pageNum = ref(1)
const pageSize = ref(5) // 默认5条/页，匹配截图
const statusFilter = ref('') // 状态筛选
const jumpPage = ref('')

// 3. 多选相关
const selectedLevelRows = ref([])

// 4. 新增/编辑弹窗状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref(null)
const levelFormRef = ref(null)

// 5. 表单数据
const levelForm = ref({
  levelName: '',
  status: 1
})

// 6. 表单校验规则
const levelFormRules = {
  levelName: [{ required: true, message: '请输入护理级别名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 7. 护理项目配置弹窗相关
const itemDialogVisible = ref(false)
const currentConfigLevel = ref(null)
const itemSearchKeyword = ref('')
const selectedItems = ref([])
const itemPageNum = ref(1)
const itemPageSize = ref(5)
const itemJumpPage = ref('')

// ==================== 计算属性 ====================
// 主列表总条数（用于分页显示）
const levelTotal = computed(() => {
  let list = [...nursingLevelList.value]
  if (statusFilter.value !== '') {
    list = list.filter(item => item.status === statusFilter.value)
  }
  return list.length
})

// 总页数（主列表）
const totalPages = computed(() => Math.ceil(levelTotal.value / pageSize.value))

// 页码数组（主列表，用于渲染页码按钮）
const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

// 过滤后的护理级别列表（按状态筛选+分页）
const filteredLevelList = computed(() => {
  let list = [...nursingLevelList.value]
  // 状态筛选
  if (statusFilter.value !== '') {
    list = list.filter(item => item.status === statusFilter.value)
  }
  // 分页
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// 项目列表总条数
const itemTotal = computed(() => {
  let list = [...availableItems.value]
  if (itemSearchKeyword.value) {
    list = list.filter(item => item.name.includes(itemSearchKeyword.value))
  }
  return list.length
})

// 项目总页数
const itemTotalPages = computed(() => Math.ceil(itemTotal.value / itemPageSize.value))

// 项目页码数组
const itemPageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= itemTotalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

// 可添加的护理项目（所有启用+未在当前级别配置）
const availableItems = computed(() => {
  if (!currentConfigLevel.value) return []
  const currentLevelId = currentConfigLevel.value.id
  const configuredItemIds = levelItemConfig.value[currentLevelId] || []
  // 过滤：启用状态 + 未在当前级别配置
  return allNursingItems.value.filter(item => 
    item.status === 1 && !configuredItemIds.includes(item.id)
  )
})

// 过滤后的可添加项目（按搜索关键词+分页）
const filteredAvailableItems = computed(() => {
  let list = [...availableItems.value]
  // 搜索过滤
  if (itemSearchKeyword.value) {
    list = list.filter(item => 
      item.name.includes(itemSearchKeyword.value)
    )
  }
  // 分页
  const start = (itemPageNum.value - 1) * itemPageSize.value
  const end = start + itemPageSize.value
  return list.slice(start, end)
})

// ==================== 工具方法 ====================
// 弹窗关闭重置
const handleDialogClose = () => {
  levelFormRef.value?.resetFields()
  levelForm.value = { levelName: '', status: 1 }
  isEdit.value = false
  currentEditId.value = null
}

// 项目配置弹窗关闭重置
const handleItemDialogClose = () => {
  itemSearchKeyword.value = ''
  selectedItems.value = []
  currentConfigLevel.value = null
  itemPageNum.value = 1
  itemJumpPage.value = ''
}

// ==================== 交互方法 ====================
// 1. 新增护理级别
const handleAdd = () => {
  handleDialogClose()
  dialogVisible.value = true
}

// 2. 编辑护理级别
const handleEdit = (row) => {
  isEdit.value = true
  currentEditId.value = row.id
  levelForm.value = { ...row }
  dialogVisible.value = true
}

// 3. 提交表单（新增/编辑）
const handleSubmit = () => {
  levelFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑：仅修改状态
        const index = nursingLevelList.value.findIndex(item => item.id === currentEditId.value)
        if (index !== -1) {
          nursingLevelList.value[index].status = levelForm.value.status
        }
        ElMessage.success('修改成功')
      } else {
        // 新增：添加级别
        const newId = nursingLevelList.value.length ? Math.max(...nursingLevelList.value.map(item => item.id)) + 1 : 1
        nursingLevelList.value.push({ 
          ...levelForm.value, 
          id: newId 
        })
        // 初始化级别项目配置
        levelItemConfig.value[newId] = []
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      pageNum.value = 1 // 新增后回到第一页
    }
  })
}

// 4. 表格多选事件
const handleSelectionChange = (selection) => {
  selectedLevelRows.value = selection
}

// 5. 批量启用
const handleBatchEnable = () => {
  if (selectedLevelRows.value.length === 0) {
    ElMessage.warning('请先选择要启用的护理级别')
    return
  }
  ElMessageBox.confirm(
    `确定要批量启用选中的 ${selectedLevelRows.value.length} 个护理级别吗？`,
    '确认',
    { type: 'warning' }
  ).then(() => {
    selectedLevelRows.value.forEach(row => {
      const index = nursingLevelList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        nursingLevelList.value[index].status = 1
      }
    })
    ElMessage.success('批量启用成功')
    selectedLevelRows.value = []
  }).catch(() => {})
}

// 6. 批量停用
const handleBatchDisable = () => {
  if (selectedLevelRows.value.length === 0) {
    ElMessage.warning('请先选择要停用的护理级别')
    return
  }
  ElMessageBox.confirm(
    `确定要批量停用选中的 ${selectedLevelRows.value.length} 个护理级别吗？`,
    '确认',
    { type: 'warning' }
  ).then(() => {
    selectedLevelRows.value.forEach(row => {
      const index = nursingLevelList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        nursingLevelList.value[index].status = 0
      }
    })
    ElMessage.success('批量停用成功')
    selectedLevelRows.value = []
  }).catch(() => {})
}

// 7. 打开护理项目配置
const handleConfigItems = (row) => {
  currentConfigLevel.value = row
  // 加载当前级别已配置的项目
  const configuredIds = levelItemConfig.value[row.id] || []
  selectedItems.value = allNursingItems.value.filter(item => 
    configuredIds.includes(item.id)
  )
  itemDialogVisible.value = true
  itemPageNum.value = 1
}

// 8. 添加项目到当前级别
const addItemToSelected = (row) => {
  const isExist = selectedItems.value.some(item => item.id === row.id)
  if (!isExist) {
    selectedItems.value.push({ ...row })
    // 关键：同步更新关联配置，让左侧列表自动刷新
    const levelId = currentConfigLevel.value.id
    levelItemConfig.value[levelId] = selectedItems.value.map(item => item.id)
    ElMessage.success('添加成功')
  } else {
    ElMessage.warning('该项目已在当前护理级别中')
  }
}

// 9. 从当前级别移除项目
const removeItemFromSelected = (index) => {
  selectedItems.value.splice(index, 1)
  // 关键：同步更新关联配置，让左侧列表自动刷新
  const levelId = currentConfigLevel.value.id
  levelItemConfig.value[levelId] = selectedItems.value.map(item => item.id)
  ElMessage.success('移除成功')
}

// 10. 保存项目配置
const saveLevelItemConfig = () => {
  if (!currentConfigLevel.value) return
  // 最终保存
  levelItemConfig.value[currentConfigLevel.value.id] = selectedItems.value.map(item => item.id)
  ElMessage.success('护理项目配置保存成功')
  itemDialogVisible.value = false
}

// 11. 项目搜索
const handleItemSearch = () => {
  itemPageNum.value = 1
  ElMessage.success('查询完成')
}

// ==================== 分页交互方法（主列表） ====================
// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  jumpPage.value = ''
}

// 上一页
const handlePrevPage = () => {
  if (pageNum.value > 1) {
    pageNum.value--
    jumpPage.value = pageNum.value
  }
}

// 下一页
const handleNextPage = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    jumpPage.value = pageNum.value
  }
}

// 跳转到指定页码
const goToPage = (page) => {
  pageNum.value = page
  jumpPage.value = page
}

// 输入页码跳转
const handleJumpPage = () => {
  const page = parseInt(jumpPage.value)
  if (page && page >= 1 && page <= totalPages.value) {
    pageNum.value = page
  } else {
    ElMessage.warning('请输入有效的页码')
    jumpPage.value = pageNum.value
  }
}

// ==================== 分页交互方法（项目列表） ====================
// 每页条数改变
const handleItemSizeChange = (val) => {
  itemPageSize.value = val
  itemPageNum.value = 1
  itemJumpPage.value = ''
}

// 上一页
const handleItemPrevPage = () => {
  if (itemPageNum.value > 1) {
    itemPageNum.value--
    itemJumpPage.value = itemPageNum.value
  }
}

// 下一页
const handleItemNextPage = () => {
  if (itemPageNum.value < itemTotalPages.value) {
    itemPageNum.value++
    itemJumpPage.value = itemPageNum.value
  }
}

// 跳转到指定页码
const goToItemPage = (page) => {
  itemPageNum.value = page
  itemJumpPage.value = page
}

// 输入页码跳转
const handleItemJumpPage = () => {
  const page = parseInt(itemJumpPage.value)
  if (page && page >= 1 && page <= itemTotalPages.value) {
    itemPageNum.value = page
  } else {
    ElMessage.warning('请输入有效的页码')
    itemJumpPage.value = itemPageNum.value
  }
}
</script>

<style scoped>
.nursing-level-container {
  padding: 20px;
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.btn-group {
  display: flex;
  align-items: center;
  gap: 15px;
}
.add-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
}
.batch-btns {
  display: flex;
  gap: 10px;
}
.batch-btns .el-button {
  width: 100px;
  height: 40px;
  font-size: 16px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* 表格标题样式 */
.table-title {
  background-color: #409eff;
  color: #fff;
  padding: 8px 12px;
  font-weight: bold;
  font-size: 14px;
}

/* ========== 分页样式优化（紧凑美观） ========== */
/* 分页容器（白色背景 + 靠左） */
.pagination-container {
  margin-top: 15px;
  padding: 12px 0;
  background: #ffffff;
  border: none;
  text-align: left;
}

.item-pagination {
  margin-top: 15px;
  padding: 12px 0;
  background: #ffffff;
  border: none;
  text-align: left;
}

/* 自定义分页：紧凑布局，间距均匀 */
.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px; /* 缩小整体间距，更紧凑 */
  font-size: 16px;
}

.total-text {
  font-size: 16px;
  color: #333;
  margin-right: 4px;
}

.page-size-select {
  width: 110px;
  height: 40px;
  font-size: 16px;
}

.page-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px; /* 页码之间间距缩小，更紧凑 */
}

.page-number {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.page-number.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.jump-text {
  font-size: 16px;
  color: #333;
  margin: 0 2px;
}

.jump-input {
  width: 60px;
  height: 40px;
  text-align: center;
  font-size: 16px;
}

/* 表格样式优化 */
.el-table {
  font-size: 14px;
}

/* 弹窗样式优化 */
.el-dialog__body {
  padding: 20px;
}
</style>