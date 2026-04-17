<template>
  <div class="nursing-record-container">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="客户姓名"
        style="width: 280px; height: 40px; font-size: 16px;"
        @keyup.enter="handleSearch"
      />
      <el-button
        type="primary"
        @click="handleSearch"
        style="width: 120px; height: 40px; font-size: 16px; margin-left: 10px;"
      >
        查询
      </el-button>
    </div>

    <!-- 左右分栏布局 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧：客户信息 -->
      <el-col :span="10">
        <div class="info-card">
          <div class="card-header blue-header">客户信息</div>
          <el-table
            :data="pagedCustomerList"
            border
            style="width: 100%;"
            :header-cell-style="{ background: '#f5f7fa', color: '#333' }"
            @row-click="handleSelectCustomer"
            :row-class-name="({ row }) => row.id === selectedCustomerId ? 'selected-row' : ''"
          >
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column prop="name" label="姓名" align="center" />
            <el-table-column prop="age" label="年龄" align="center" />
            <el-table-column prop="gender" label="性别" align="center" />
            <el-table-column prop="bedNo" label="床号" align="center" />
            <el-table-column prop="nurseLevel" label="护理级别" align="center" />
          </el-table>
          
          <!-- Element Plus 分页（真实可用，替换橙色占位） -->
          <div class="pagination-box">
            <el-pagination
              v-model:current-page="customerPage"
              v-model:page-size="customerPageSize"
              :total="filteredCustomerList.length"
              layout="total, prev, pager, next, jumper"
              background
              @size-change="handleCustomerPageChange"
            />
          </div>
        </div>
      </el-col>

      <!-- 右侧：护理记录 -->
      <el-col :span="14">
        <div class="info-card">
          <div class="card-header blue-header">护理记录</div>

          <!-- 空状态：未选择客户 -->
          <div v-if="!selectedCustomer" class="empty-state">
            <p>请从左侧选择客户查看护理记录</p>
          </div>

          <!-- 护理记录表格 -->
          <el-table
            v-else
            :data="pagedRecordList"
            border
            style="width: 100%;"
            :header-cell-style="{ background: '#f5f7fa', color: '#333' }"
          >
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column prop="itemCode" label="护理项目编号" align="center" />
            <el-table-column prop="itemName" label="护理项目名称" align="center" />
            <el-table-column prop="count" label="护理数量" align="center" />
            <el-table-column prop="content" label="护理内容" align="center" />
            <el-table-column prop="nurse" label="护理人员" align="center" />
            <el-table-column prop="nursePhone" label="护理人员手机" align="center" />
            <el-table-column prop="careTime" label="护理时间" align="center" />
          </el-table>

          <!-- Element Plus 分页（真实可用，替换橙色占位） -->
          <div class="pagination-box" v-if="selectedCustomer && currentCustomerRecords.length > 0">
            <el-pagination
              v-model:current-page="recordPage"
              v-model:page-size="recordPageSize"
              :total="currentCustomerRecords.length"
              layout="total, prev, pager, next, jumper"
              background
              @size-change="handleRecordPageChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索关键词
const searchKeyword = ref('')

// =============== 大量客户数据（20条，完全还原截图+扩展） ===============
const allCustomerList = ref([
  { id: 1, name: '孙瑞英', age: 68, gender: '女', bedNo: '2012-1', nurseLevel: '二级' },
  { id: 2, name: '张帆', age: 77, gender: '男', bedNo: '1014-1', nurseLevel: '三级' },
  { id: 3, name: '苗月兰', age: 67, gender: '女', bedNo: '2005-1', nurseLevel: '' },
  { id: 4, name: '李红梅', age: 72, gender: '女', bedNo: '3001-1', nurseLevel: '一级' },
  { id: 5, name: '王建国', age: 80, gender: '男', bedNo: '3002-2', nurseLevel: '特级' },
  { id: 6, name: '刘桂英', age: 75, gender: '女', bedNo: '1008-3', nurseLevel: '二级' },
  { id: 7, name: '陈大勇', age: 69, gender: '男', bedNo: '2009-2', nurseLevel: '三级' },
  { id: 8, name: '周秀兰', age: 71, gender: '女', bedNo: '3005-1', nurseLevel: '一级' },
  { id: 9, name: '吴桂兰', age: 78, gender: '女', bedNo: '1003-1', nurseLevel: '二级' },
  { id: 10, name: '郑志强', age: 73, gender: '男', bedNo: '2002-3', nurseLevel: '三级' },
  { id: 11, name: '马丽', age: 66, gender: '女', bedNo: '3008-2', nurseLevel: '一级' },
  { id: 12, name: '胡小明', age: 82, gender: '男', bedNo: '1010-1', nurseLevel: '特级' },
  { id: 13, name: '林小红', age: 70, gender: '女', bedNo: '2007-2', nurseLevel: '二级' },
  { id: 14, name: '谢芳', age: 74, gender: '女', bedNo: '3003-3', nurseLevel: '一级' },
  { id: 15, name: '郭建军', age: 79, gender: '男', bedNo: '1005-2', nurseLevel: '三级' },
  { id: 16, name: '杨芳', age: 76, gender: '女', bedNo: '2003-1', nurseLevel: '二级' },
  { id: 17, name: '黄伟', age: 65, gender: '男', bedNo: '3007-3', nurseLevel: '一级' },
  { id: 18, name: '董丽', age: 81, gender: '女', bedNo: '1002-2', nurseLevel: '特级' },
  { id: 19, name: '赵刚', age: 73, gender: '男', bedNo: '2006-1', nurseLevel: '三级' },
  { id: 20, name: '孙秀莲', age: 79, gender: '女', bedNo: '3004-2', nurseLevel: '二级' },
])

// =============== 大量护理记录数据（完全还原截图+扩展） ===============
const allNursingRecords = ref([
  { customerId: 1, records: [
    { id: 1, itemCode: 'HLXM0001', itemName: '吸氧', count: 1, content: '吸氧护理', nurse: '吴伟', nursePhone: '13517178987', careTime: '2023-11-24' },
    { id: 2, itemCode: 'HLXM0002', itemName: '协助服药', count: 1, content: '', nurse: '吴伟', nursePhone: '13517178987', careTime: '2023-11-24' },
    { id: 3, itemCode: 'HLXM0003', itemName: '血压测量', count: 2, content: '上午下午', nurse: '张护士', nursePhone: '13812345678', careTime: '2023-11-25' },
    { id: 4, itemCode: 'HLXM0004', itemName: '康复训练', count: 1, content: '肢体训练', nurse: '张护士', nursePhone: '13812345678', careTime: '2023-11-25' },
    { id: 5, itemCode: 'HLXM0005', itemName: '心理疏导', count: 1, content: '情绪安抚', nurse: '李护士', nursePhone: '13987654321', careTime: '2023-11-26' },
  ]},
  { customerId: 2, records: [
    { id: 10, itemCode: 'HLXM0003', itemName: '康复训练', count: 1, content: '日常训练', nurse: '刘护士', nursePhone: '13612345678', careTime: '2023-11-24' },
    { id: 11, itemCode: 'HLXM0001', itemName: '吸氧', count: 1, content: '辅助呼吸', nurse: '刘护士', nursePhone: '13612345678', careTime: '2023-11-25' },
    { id: 12, itemCode: 'HLXM0007', itemName: '翻身护理', count: 2, content: '防褥疮', nurse: '刘护士', nursePhone: '13612345678', careTime: '2023-11-26' },
  ]},
  { customerId: 3, records: [] },
  { customerId: 4, records: [
    { id: 20, itemCode: 'HLXM0002', itemName: '协助服药', count: 2, content: '定时服药', nurse: '吴伟', nursePhone: '13517178987', careTime: '2023-11-24' },
    { id: 21, itemCode: 'HLXM0004', itemName: '康复训练', count: 1, content: '关节活动', nurse: '吴伟', nursePhone: '13517178987', careTime: '2023-11-25' },
  ]},
  { customerId: 5, records: [
    { id: 30, itemCode: 'HLXM0001', itemName: '吸氧', count: 2, content: '持续吸氧', nurse: '王护士', nursePhone: '13711112222', careTime: '2023-11-24' },
    { id: 31, itemCode: 'HLXM0006', itemName: '喂食协助', count: 3, content: '流质食物', nurse: '王护士', nursePhone: '13711112222', careTime: '2023-11-25' },
    { id: 32, itemCode: 'HLXM0007', itemName: '翻身护理', count: 2, content: '定时翻身', nurse: '王护士', nursePhone: '13711112222', careTime: '2023-11-26' },
  ]},
  // 给剩余客户自动生成护理记录，数据量拉满
  ...Array.from({ length: 15 }, (_, i) => ({
    customerId: i + 6,
    records: Array.from({ length: 4 }, (_, j) => ({
      id: 100 + i * 10 + j,
      itemCode: `HLXM${String(i * 10 + j + 1).padStart(4, '0')}`,
      itemName: ['喂饭', '擦身', '给药', '测血压', '康复训练', '心理疏导'][Math.floor(Math.random() * 6)],
      count: 1 + Math.floor(Math.random() * 3),
      content: '正常护理，状态良好',
      nurse: ['吴伟', '张护士', '李护士', '刘护士', '王护士'][Math.floor(Math.random() * 5)],
      nursePhone: `13${String(Math.floor(Math.random() * 90 + 10))}${String(Math.floor(Math.random() * 10000000)).padStart(8, '0')}`,
      careTime: `2023-${String(Math.floor(Math.random() * 11 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 27 + 1)).padStart(2, '0')}`
    }))
  }))
])

// =============== 选中客户 ===============
const selectedCustomerId = ref(null)
const selectedCustomer = computed(() => {
  return allCustomerList.value.find(c => c.id === selectedCustomerId.value) || null
})

// =============== 筛选客户（模糊查询） ===============
const filteredCustomerList = computed(() => {
  if (!searchKeyword.value.trim()) return allCustomerList.value
  return allCustomerList.value.filter(c => 
    c.name.includes(searchKeyword.value.trim())
  )
})

// =============== 客户分页（Element Plus 真实分页） ===============
const customerPage = ref(1)
const customerPageSize = ref(5)
const pagedCustomerList = computed(() => {
  const start = (customerPage.value - 1) * customerPageSize.value
  const end = start + customerPageSize.value
  return filteredCustomerList.value.slice(start, end)
})
const handleCustomerPageChange = () => { customerPage.value = 1 }

// =============== 护理记录 ===============
const currentCustomerRecords = computed(() => {
  if (!selectedCustomerId.value) return []
  const rec = allNursingRecords.value.find(r => r.customerId === selectedCustomerId.value)
  return rec ? rec.records : []
})

// =============== 护理记录分页（Element Plus 真实分页） ===============
const recordPage = ref(1)
const recordPageSize = ref(5)
const pagedRecordList = computed(() => {
  const start = (recordPage.value - 1) * recordPageSize.value
  const end = start + recordPageSize.value
  return currentCustomerRecords.value.slice(start, end)
})
const handleRecordPageChange = () => { recordPage.value = 1 }

// =============== 方法 ===============
const handleSearch = () => {
  customerPage.value = 1
  ElMessage.success(`查询完成：共 ${filteredCustomerList.value.length} 位客户`)
}

const handleSelectCustomer = (row) => {
  selectedCustomerId.value = row.id
  recordPage.value = 1
  ElMessage.success(`已加载【${row.name}】的护理记录`)
}
</script>

<style scoped>
.nursing-record-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* 卡片样式（匹配截图） */
.info-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

/* 蓝色表头（完全还原截图） */
.blue-header {
  background-color: #0099ff;
  color: #ffffff;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 18px;
  text-align: left;
}

/* 表格样式 */
.el-table {
  font-size: 14px;
  --el-table-row-hover-bg-color: #f8f9fa;
  --el-table-border-color: #dcdfe6;
}

/* 选中行高亮 */
.selected-row {
  background-color: #e6f7ff !important;
}

/* 分页容器（美化，替换橙色占位） */
.pagination-box {
  padding: 15px 20px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

/* 空状态 */
.empty-state {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 16px;
  background: #fff;
}

/* 按钮样式（还原截图橙色） */
.el-button--primary {
  background-color: #ff9933 !important;
  border-color: #ff9933 !important;
  color: #ffffff !important;
  font-weight: bold;
  border-radius: 4px;
}

/* 分页美化 */
.el-pagination {
  --el-pagination-bg-color: #fff;
  --el-pagination-hover-bg-color: #ecf5ff;
  --el-pagination-active-bg-color: #409eff;
  --el-pagination-active-text-color: #fff;
}
</style>