<template>
  <div class="patient-care-set-container">
    <!-- 搜索栏（原型图样式） -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="客户姓名"
        style="width: 350px; margin-right: 10px;"
      />
      <el-button 
        type="primary" 
        @click="handleSearch"
        :disabled="!searchKeyword?.trim()"
        style="width: 120px; height: 40px; font-size: 16px;"
      >
        查询
      </el-button>
    </div>

    <!-- 客户列表表格（1:1还原原型图） -->
    <el-table :data="filteredCustomerList" border style="width: 100%; margin-top: 20px;">
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column prop="name" label="客户姓名" align="center" width="120" />
      <el-table-column prop="age" label="年龄" align="center" width="80" />
      <el-table-column prop="gender" label="性别" align="center" width="80" />
      <el-table-column prop="roomNo" label="房间号" align="center" width="100" />
      <el-table-column prop="bedNo" label="床号" align="center" width="100" />
      <el-table-column prop="building" label="所属楼房" align="center" width="100" />
      <el-table-column prop="phone" label="联系电话" align="center" width="150" />
      <el-table-column prop="nurseLevel" label="护理级别" align="center" width="100" />
      <el-table-column label="操作" align="center" width="180">
        <template #default="{ row }">
          <!-- 原型图按钮：有级别=移除护理级别，无级别=设置护理级别 -->
          <el-button 
            v-if="row.nurseLevel" 
            type="danger" 
            @click="handleRemoveLevel(row)"
            style="width: 140px;"
          >
            移除护理级别
          </el-button>
          <el-button 
            v-else 
            type="primary" 
            @click="handleSetLevel(row)"
            style="width: 140px;"
          >
            设置护理级别
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（和另外两个页面完全统一） -->
    <div class="pagination-container">
      <div class="custom-pagination">
        <span class="total-text">共 {{ total }} 条</span>
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

    <!-- 护理级别设置弹窗（1:1还原原型图） -->
    <el-dialog
      v-model="levelDialogVisible"
      title="客户护理设置"
      width="85%"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
    >
      <!-- 护理级别下拉选择 -->
      <div class="level-select">
        <el-select 
          v-model="selectedLevel" 
          placeholder="请选择护理级别"
          style="width: 300px;"
          @change="handleLevelChange"
        >
          <el-option 
            v-for="level in nurseLevelList" 
            :key="level.id" 
            :label="level.levelName" 
            :value="level.id"
          />
        </el-select>
      </div>

      <!-- 护理项目表格（完全匹配原型图列） -->
      <el-table 
        :data="currentLevelItems" 
        border 
        style="width: 100%; margin-top: 15px;"
        :show-header="true"
      >
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column prop="id" label="编号" align="center" width="120" />
        <el-table-column prop="name" label="名称" align="center" width="120" />
        <el-table-column prop="price" label="价格" align="center" width="100" />
        <el-table-column prop="frequency" label="执行周次" align="center" width="100" />
        <el-table-column prop="times" label="执行次数" align="center" width="80" />
        <el-table-column label="服务购买日期" align="center" width="150">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.buyDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :default-value="new Date()"
              @change="updateExpireDate(row)"
              style="width: 130px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="购买数量" align="center" width="120">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.buyCount" 
              :min="1" 
              :default-value="1"
              style="width: 80px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="服务到期日期" align="center" width="150">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.expireDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :default-value="getDefaultExpireDate(row.buyDate)"
              style="width: 130px;"
            />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveLevel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// ==================== 全局共享数据（和护理级别/项目页面联动） ====================
// 护理级别列表
const nurseLevelList = ref([
  { id: 1, levelName: '一级', status: 1 },
  { id: 2, levelName: '二级', status: 1 },
  { id: 3, levelName: '三级', status: 1 },
  { id: 4, levelName: '特级', status: 1 },
  { id: 5, levelName: '康复护理', status: 1 }
])

// 护理项目列表（匹配原型图编号）
const nurseItemList = ref([
  { id: 'HLXM0001', name: '吸氧', price: '60元/次', frequency: '每天', times: 2 },
  { id: 'HLXM0002', name: '协助服药', price: '免费', frequency: '每天', times: 3 },
  { id: 'HLXM0003', name: '康复训练', price: '100元/次', frequency: '每周', times: 2 },
  { id: 'HLXM0004', name: '生命体征监测', price: '80元/次', frequency: '每天', times: 2 },
  { id: 'HLXM0005', name: '压疮护理', price: '50元/次', frequency: '每天', times: 1 },
  { id: 'HLXM0006', name: '口腔护理', price: '30元/次', frequency: '每天', times: 1 },
  { id: 'HLXM0007', name: '静脉输液', price: '40元/次', frequency: '每天', times: 1 },
  { id: 'HLXM0008', name: '导尿护理', price: '70元/次', frequency: '每天', times: 1 },
  { id: 'HLXM0009', name: '伤口换药', price: '45元/次', frequency: '每天', times: 1 },
  { id: 'HLXM0010', name: '雾化吸入', price: '35元/次', frequency: '每天', times: 1 }
])

// 级别-项目关联
const levelItemMap = ref({
  1: ['HLXM0001', 'HLXM0002'],
  2: ['HLXM0001'],
  3: ['HLXM0003', 'HLXM0004'],
  4: ['HLXM0005', 'HLXM0006'],
  5: ['HLXM0007', 'HLXM0008', 'HLXM0009', 'HLXM0010']
})

// ==================== 页面局部数据 ====================
// 客户列表（完全匹配原型图数据）
const customerList = ref([
  { id: 1, name: '孙瑞英', age: 68, gender: '女', roomNo: '2012', bedNo: '2012-1', building: '606', phone: '18167564213', nurseLevel: '二级', levelId: 2, careItems: [] },
  { id: 2, name: '张帆', age: 77, gender: '女', roomNo: '1014', bedNo: '1014-1', building: '606', phone: '17745189064', nurseLevel: '', levelId: null, careItems: [] },
  { id: 3, name: '李桂兰', age: 72, gender: '女', roomNo: '3021', bedNo: '3021-1', building: '606', phone: '13912345678', nurseLevel: '一级', levelId: 1, careItems: [] },
  { id: 4, name: '王建国', age: 79, gender: '男', roomNo: '3022', bedNo: '3022-1', building: '606', phone: '13812345678', nurseLevel: '', levelId: null, careItems: [] },
  { id: 5, name: '刘淑珍', age: 81, gender: '女', roomNo: '4011', bedNo: '4011-1', building: '606', phone: '13712345678', nurseLevel: '三级', levelId: 3, careItems: [] },
  { id: 6, name: '赵天明', age: 75, gender: '男', roomNo: '4012', bedNo: '4012-1', building: '606', phone: '13612345678', nurseLevel: '', levelId: null, careItems: [] },
  { id: 7, name: '陈秀琴', age: 83, gender: '女', roomNo: '5011', bedNo: '5011-1', building: '606', phone: '13512345678', nurseLevel: '特级', levelId: 4, careItems: [] },
  { id: 8, name: '周志强', age: 70, gender: '男', roomNo: '5012', bedNo: '5012-1', building: '606', phone: '13412345678', nurseLevel: '', levelId: null, careItems: [] },
  { id: 9, name: '吴玉英', age: 85, gender: '女', roomNo: '6011', bedNo: '6011-1', building: '606', phone: '13312345678', nurseLevel: '康复护理', levelId: 5, careItems: [] },
  { id: 10, name: '郑大海', age: 78, gender: '男', roomNo: '6012', bedNo: '6012-1', building: '606', phone: '13212345678', nurseLevel: '', levelId: null, careItems: [] }
])

// 搜索与分页
const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const jumpPage = ref('')

// 总条数
const total = computed(() => {
  let list = [...customerList.value]
  if (searchKeyword.value) {
    list = list.filter(item => item.name.includes(searchKeyword.value))
  }
  return list.length
})

// 总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 页码数组
const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

// 过滤后的客户列表
const filteredCustomerList = computed(() => {
  let list = [...customerList.value]
  if (searchKeyword.value) {
    list = list.filter(customer => 
      customer.name.includes(searchKeyword.value)
    )
  }
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// 弹窗相关
const levelDialogVisible = ref(false)
const currentCustomer = ref(null)
const selectedLevel = ref(1) // 默认选中一级
const currentLevelItems = ref([])

// ==================== 工具方法 ====================
// 获取默认到期日期（购买日期+3个月）
const getDefaultExpireDate = (buyDate) => {
  const date = buyDate ? new Date(buyDate) : new Date()
  date.setMonth(date.getMonth() + 3)
  return date
}

// 更新到期日期（购买日期变更时联动）
const updateExpireDate = (row) => {
  row.expireDate = getDefaultExpireDate(row.buyDate)
}

// 弹窗关闭重置
const handleDialogClose = () => {
  selectedLevel.value = 1
  currentLevelItems.value = []
  levelDialogVisible.value = false
}

// ==================== 交互方法 ====================
// 1. 查询客户
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  pageNum.value = 1
  ElMessage.success('查询完成')
}

// 2. 设置护理级别（打开弹窗，加载对应级别项目）
const handleSetLevel = (row) => {
  currentCustomer.value = row
  // 打开弹窗时，默认选中客户当前级别（如果有）
  selectedLevel.value = row.levelId || 1
  handleLevelChange(selectedLevel.value)
  levelDialogVisible.value = true
}

// 3. 选择护理级别后，加载对应项目（批量自动填充信息）
const handleLevelChange = (levelId) => {
  if (!levelId) {
    currentLevelItems.value = []
    return
  }

  // 获取级别对应的项目ID列表
  const itemIds = levelItemMap.value[levelId] || []
  // 匹配项目详情，并初始化购买信息（完全匹配需求）
  const today = new Date() // 当前系统时间
  const items = itemIds.map(itemId => {
    const item = nurseItemList.value.find(i => i.id === itemId)
    return {
      ...item,
      buyDate: today, // 购买日期=当前系统时间
      buyCount: 1,   // 购买数量=默认1
      expireDate: getDefaultExpireDate(today) // 到期日期=默认3个月
    }
  })

  currentLevelItems.value = items
}

// 4. 保存护理级别（修改客户级别+批量添加项目）
const handleSaveLevel = () => {
  // 校验：必须选择级别
  if (!selectedLevel.value) {
    ElMessage.warning('请先选择护理级别')
    return
  }

  // 校验：项目信息完整
  const hasInvalid = currentLevelItems.value.some(item => 
    !item.buyDate || !item.expireDate || item.buyCount < 1
  )
  if (hasInvalid) {
    ElMessage.warning('请完善所有护理项目的购买信息')
    return
  }

  // 更新客户的护理级别
  const level = nurseLevelList.value.find(l => l.id === selectedLevel.value)
  const index = customerList.value.findIndex(item => item.id === currentCustomer.value.id)
  if (index !== -1) {
    customerList.value[index].nurseLevel = level.levelName
    customerList.value[index].levelId = level.id
    // 批量保存客户的护理项目详情
    customerList.value[index].careItems = [...currentLevelItems.value]
  }

  ElMessage.success('护理级别设置成功')
  levelDialogVisible.value = false
}

// 5. 移除护理级别（级联删除项目）
const handleRemoveLevel = (row) => {
  ElMessageBox.confirm(
    `确定要移除客户「${row.name}」的护理级别吗？\n此操作将删除该客户所有当前级别的护理项目，无法恢复！`,
    '警告',
    {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 1. 更新客户级别为null
    const index = customerList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      customerList.value[index].nurseLevel = ''
      customerList.value[index].levelId = null
      // 2. 删除客户在当前级别的所有护理项目详情
      customerList.value[index].careItems = []
    }
    ElMessage.success('护理级别移除成功，关联项目已清空')
  }).catch(() => {})
}

// ==================== 分页方法 ====================
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  jumpPage.value = ''
}

const handlePrevPage = () => {
  if (pageNum.value > 1) {
    pageNum.value--
    jumpPage.value = pageNum.value
  }
}

const handleNextPage = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    jumpPage.value = pageNum.value
  }
}

const goToPage = (page) => {
  pageNum.value = page
  jumpPage.value = page
}

const handleJumpPage = () => {
  const page = parseInt(jumpPage.value)
  if (page && page >= 1 && page <= totalPages.value) {
    pageNum.value = page
  } else {
    ElMessage.warning('请输入有效的页码')
    jumpPage.value = pageNum.value
  }
}

// 初始化：页面加载时默认加载一级项目（弹窗打开时自动显示）
handleLevelChange(1)
</script>

<style scoped>
.patient-care-set-container {
  padding: 20px;
}

/* 搜索栏样式（原型图匹配） */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

/* 级别选择样式（原型图匹配） */
.level-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* ========== 分页样式（和另外两个页面完全统一） ========== */
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
  justify-content: flex-start;
  gap: 8px;
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
  gap: 4px;
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

/* 表格样式优化（原型图对齐） */
.el-table {
  font-size: 14px;
}

/* 弹窗表格样式优化 */
.el-dialog__body {
  padding: 20px;
}
</style>