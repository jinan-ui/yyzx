<template>
  <div class="page-content">
    <div class="page-title">护理记录管理</div>
    <div class="page-desc">管理员查询、移除护理记录（符合需求文档）</div>

    <div class="search-box">
      <el-input 
        v-model="queryName" 
        placeholder="输入客户姓名" 
        style="width: 220px"
        clearable
      />
      <el-button type="primary" @click="queryRecord">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="recordList" border width="100%" height="450">
        <el-table-column label="序号" type="index" align="center" width="100"/>
        <el-table-column label="客户姓名" prop="customerName" align="center" />
        <el-table-column label="护理项目" prop="careItem" align="center" />
        <el-table-column label="护理时间" prop="careTime" align="center" />
        <el-table-column label="护理数量" prop="careNum" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeRecord(scope.row.id)"
            >
              移除记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-box">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const queryName = ref('')
const pageNum = ref(1)
const pageSize = ref(30)
const total = ref(100)

const recordList = ref([
  { id: 1, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-15 08:30", careNum: 2 },
  { id: 2, customerName: "李福才", careItem: "测量血压", careTime: "2026-04-15 09:00", careNum: 1 },
  { id: 3, customerName: "王秀兰", careItem: "口服给药", careTime: "2026-04-15 10:15", careNum: 1 },
  { id: 4, customerName: "刘桂兰", careItem: "口腔护理", careTime: "2026-04-15 10:30", careNum: 1 },
  { id: 5, customerName: "陈秀英", careItem: "皮肤护理", careTime: "2026-04-15 11:00", careNum: 1 },
  { id: 6, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-15 14:00", careNum: 2 },
  { id: 7, customerName: "吴桂兰", careItem: "测量体温", careTime: "2026-04-15 14:30", careNum: 1 },
  { id: 8, customerName: "郑福才", careItem: "喂饭护理", careTime: "2026-04-15 15:00", careNum: 1 },
  { id: 9, customerName: "王桂英", careItem: "康复训练", careTime: "2026-04-15 15:30", careNum: 1 },
  { id: 10, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-15 16:00", careNum: 2 },
  { id: 11, customerName: "张桂英", careItem: "测量血压", careTime: "2026-04-16 08:30", careNum: 1 },
  { id: 12, customerName: "李福才", careItem: "口服给药", careTime: "2026-04-16 09:00", careNum: 1 },
  { id: 13, customerName: "王秀兰", careItem: "口腔护理", careTime: "2026-04-16 10:15", careNum: 1 },
  { id: 14, customerName: "刘桂兰", careItem: "皮肤护理", careTime: "2026-04-16 10:30", careNum: 1 },
  { id: 15, customerName: "陈秀英", careItem: "翻身拍背", careTime: "2026-04-16 11:00", careNum: 2 },
  { id: 16, customerName: "周桂英", careItem: "测量体温", careTime: "2026-04-16 14:00", careNum: 1 },
  { id: 17, customerName: "吴桂兰", careItem: "喂饭护理", careTime: "2026-04-16 14:30", careNum: 1 },
  { id: 18, customerName: "郑福才", careItem: "康复训练", careTime: "2026-04-16 15:00", careNum: 1 },
  { id: 19, customerName: "王桂英", careItem: "翻身拍背", careTime: "2026-04-16 15:30", careNum: 2 },
  { id: 20, customerName: "林秀英", careItem: "测量血压", careTime: "2026-04-16 16:00", careNum: 1 },
  { id: 21, customerName: "张桂英", careItem: "口服给药", careTime: "2026-04-17 08:30", careNum: 1 },
  { id: 22, customerName: "李福才", careItem: "口腔护理", careTime: "2026-04-17 09:00", careNum: 1 },
  { id: 23, customerName: "王秀兰", careItem: "皮肤护理", careTime: "2026-04-17 10:15", careNum: 1 },
  { id: 24, customerName: "刘桂兰", careItem: "翻身拍背", careTime: "2026-04-17 10:30", careNum: 2 },
  { id: 25, customerName: "陈秀英", careItem: "测量体温", careTime: "2026-04-17 11:00", careNum: 1 },
  { id: 26, customerName: "周桂英", careItem: "喂饭护理", careTime: "2026-04-17 14:00", careNum: 1 },
  { id: 27, customerName: "吴桂兰", careItem: "康复训练", careTime: "2026-04-17 14:30", careNum: 1 },
  { id: 28, customerName: "郑福才", careItem: "翻身拍背", careTime: "2026-04-17 15:00", careNum: 2 },
  { id: 29, customerName: "王桂英", careItem: "测量血压", careTime: "2026-04-17 15:30", careNum: 1 },
  { id: 30, customerName: "林秀英", careItem: "口服给药", careTime: "2026-04-17 16:00", careNum: 1 },
  { id: 31, customerName: "张桂英", careItem: "口腔护理", careTime: "2026-04-18 08:30", careNum: 1 },
  { id: 32, customerName: "李福才", careItem: "皮肤护理", careTime: "2026-04-18 09:00", careNum: 1 },
  { id: 33, customerName: "王秀兰", careItem: "翻身拍背", careTime: "2026-04-18 10:15", careNum: 2 },
  { id: 34, customerName: "刘桂兰", careItem: "测量体温", careTime: "2026-04-18 10:30", careNum: 1 },
  { id: 35, customerName: "陈秀英", careItem: "喂饭护理", careTime: "2026-04-18 11:00", careNum: 1 },
  { id: 36, customerName: "周桂英", careItem: "康复训练", careTime: "2026-04-18 14:00", careNum: 1 },
  { id: 37, customerName: "吴桂兰", careItem: "翻身拍背", careTime: "2026-04-18 14:30", careNum: 2 },
  { id: 38, customerName: "郑福才", careItem: "测量血压", careTime: "2026-04-18 15:00", careNum: 1 },
  { id: 39, customerName: "王桂英", careItem: "口服给药", careTime: "2026-04-18 15:30", careNum: 1 },
  { id: 40, customerName: "林秀英", careItem: "口腔护理", careTime: "2026-04-18 16:00", careNum: 1 },
  { id: 41, customerName: "张桂英", careItem: "皮肤护理", careTime: "2026-04-19 08:30", careNum: 1 },
  { id: 42, customerName: "李福才", careItem: "翻身拍背", careTime: "2026-04-19 09:00", careNum: 2 },
  { id: 43, customerName: "王秀兰", careItem: "测量体温", careTime: "2026-04-19 10:15", careNum: 1 },
  { id: 44, customerName: "刘桂兰", careItem: "喂饭护理", careTime: "2026-04-19 10:30", careNum: 1 },
  { id: 45, customerName: "陈秀英", careItem: "康复训练", careTime: "2026-04-19 11:00", careNum: 1 },
  { id: 46, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-19 14:00", careNum: 2 },
  { id: 47, customerName: "吴桂兰", careItem: "测量血压", careTime: "2026-04-19 14:30", careNum: 1 },
  { id: 48, customerName: "郑福才", careItem: "口服给药", careTime: "2026-04-19 15:00", careNum: 1 },
  { id: 49, customerName: "王桂英", careItem: "口腔护理", careTime: "2026-04-19 15:30", careNum: 1 },
  { id: 50, customerName: "林秀英", careItem: "皮肤护理", careTime: "2026-04-19 16:00", careNum: 1 },
  { id: 51, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-20 08:30", careNum: 2 },
  { id: 52, customerName: "李福才", careItem: "测量体温", careTime: "2026-04-20 09:00", careNum: 1 },
  { id: 53, customerName: "王秀兰", careItem: "喂饭护理", careTime: "2026-04-20 10:15", careNum: 1 },
  { id: 54, customerName: "刘桂兰", careItem: "康复训练", careTime: "2026-04-20 10:30", careNum: 1 },
  { id: 55, customerName: "陈秀英", careItem: "翻身拍背", careTime: "2026-04-20 11:00", careNum: 2 },
  { id: 56, customerName: "周桂英", careItem: "测量血压", careTime: "2026-04-20 14:00", careNum: 1 },
  { id: 57, customerName: "吴桂兰", careItem: "口服给药", careTime: "2026-04-20 14:30", careNum: 1 },
  { id: 58, customerName: "郑福才", careItem: "口腔护理", careTime: "2026-04-20 15:00", careNum: 1 },
  { id: 59, customerName: "王桂英", careItem: "皮肤护理", careTime: "2026-04-20 15:30", careNum: 1 },
  { id: 60, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-20 16:00", careNum: 2 },
  { id: 61, customerName: "张桂英", careItem: "测量体温", careTime: "2026-04-21 08:30", careNum: 1 },
  { id: 62, customerName: "李福才", careItem: "喂饭护理", careTime: "2026-04-21 09:00", careNum: 1 },
  { id: 63, customerName: "王秀兰", careItem: "康复训练", careTime: "2026-04-21 10:15", careNum: 1 },
  { id: 64, customerName: "刘桂兰", careItem: "翻身拍背", careTime: "2026-04-21 10:30", careNum: 2 },
  { id: 65, customerName: "陈秀英", careItem: "测量血压", careTime: "2026-04-21 11:00", careNum: 1 },
  { id: 66, customerName: "周桂英", careItem: "口服给药", careTime: "2026-04-21 14:00", careNum: 1 },
  { id: 67, customerName: "吴桂兰", careItem: "口腔护理", careTime: "2026-04-21 14:30", careNum: 1 },
  { id: 68, customerName: "郑福才", careItem: "皮肤护理", careTime: "2026-04-21 15:00", careNum: 1 },
  { id: 69, customerName: "王桂英", careItem: "翻身拍背", careTime: "2026-04-21 15:30", careNum: 2 },
  { id: 70, customerName: "林秀英", careItem: "测量体温", careTime: "2026-04-21 16:00", careNum: 1 },
  { id: 71, customerName: "张桂英", careItem: "喂饭护理", careTime: "2026-04-22 08:30", careNum: 1 },
  { id: 72, customerName: "李福才", careItem: "康复训练", careTime: "2026-04-22 09:00", careNum: 1 },
  { id: 73, customerName: "王秀兰", careItem: "翻身拍背", careTime: "2026-04-22 10:15", careNum: 2 },
  { id: 74, customerName: "刘桂兰", careItem: "测量血压", careTime: "2026-04-22 10:30", careNum: 1 },
  { id: 75, customerName: "陈秀英", careItem: "口服给药", careTime: "2026-04-22 11:00", careNum: 1 },
  { id: 76, customerName: "周桂英", careItem: "口腔护理", careTime: "2026-04-22 14:00", careNum: 1 },
  { id: 77, customerName: "吴桂兰", careItem: "皮肤护理", careTime: "2026-04-22 14:30", careNum: 1 },
  { id: 78, customerName: "郑福才", careItem: "翻身拍背", careTime: "2026-04-22 15:00", careNum: 2 },
  { id: 79, customerName: "王桂英", careItem: "测量体温", careTime: "2026-04-22 15:30", careNum: 1 },
  { id: 80, customerName: "林秀英", careItem: "喂饭护理", careTime: "2026-04-22 16:00", careNum: 1 },
  { id: 81, customerName: "张桂英", careItem: "康复训练", careTime: "2026-04-23 08:30", careNum: 1 },
  { id: 82, customerName: "李福才", careItem: "翻身拍背", careTime: "2026-04-23 09:00", careNum: 2 },
  { id: 83, customerName: "王秀兰", careItem: "测量血压", careTime: "2026-04-23 10:15", careNum: 1 },
  { id: 84, customerName: "刘桂兰", careItem: "口服给药", careTime: "2026-04-23 10:30", careNum: 1 },
  { id: 85, customerName: "陈秀英", careItem: "口腔护理", careTime: "2026-04-23 11:00", careNum: 1 },
  { id: 86, customerName: "周桂英", careItem: "皮肤护理", careTime: "2026-04-23 14:00", careNum: 1 },
  { id: 87, customerName: "吴桂兰", careItem: "翻身拍背", careTime: "2026-04-23 14:30", careNum: 2 },
  { id: 88, customerName: "郑福才", careItem: "测量体温", careTime: "2026-04-23 15:00", careNum: 1 },
  { id: 89, customerName: "王桂英", careItem: "喂饭护理", careTime: "2026-04-23 15:30", careNum: 1 },
  { id: 90, customerName: "林秀英", careItem: "康复训练", careTime: "2026-04-23 16:00", careNum: 1 },
  { id: 91, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-24 08:30", careNum: 2 },
  { id: 92, customerName: "李福才", careItem: "测量血压", careTime: "2026-04-24 09:00", careNum: 1 },
  { id: 93, customerName: "王秀兰", careItem: "口服给药", careTime: "2026-04-24 10:15", careNum: 1 },
  { id: 94, customerName: "刘桂兰", careItem: "口腔护理", careTime: "2026-04-24 10:30", careNum: 1 },
  { id: 95, customerName: "陈秀英", careItem: "皮肤护理", careTime: "2026-04-24 11:00", careNum: 1 },
  { id: 96, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-24 14:00", careNum: 2 },
  { id: 97, customerName: "吴桂兰", careItem: "测量体温", careTime: "2026-04-24 14:30", careNum: 1 },
  { id: 98, customerName: "郑福才", careItem: "喂饭护理", careTime: "2026-04-24 15:00", careNum: 1 },
  { id: 99, customerName: "王桂英", careItem: "康复训练", careTime: "2026-04-24 15:30", careNum: 1 },
  { id: 100, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-24 16:00", careNum: 2 },
])

const queryRecord = () => {
  if(!queryName.value) {
    ElMessage.warning('请输入客户姓名')
    return
  }
  recordList.value = recordList.value.filter(item => 
    item.customerName.includes(queryName.value)
  )
}

const resetQuery = () => {
  queryName.value = ''
  recordList.value = [
    { id: 1, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-15 08:30", careNum: 2 },
    { id: 2, customerName: "李福才", careItem: "测量血压", careTime: "2026-04-15 09:00", careNum: 1 },
    { id: 3, customerName: "王秀兰", careItem: "口服给药", careTime: "2026-04-15 10:15", careNum: 1 },
    { id: 4, customerName: "刘桂兰", careItem: "口腔护理", careTime: "2026-04-15 10:30", careNum: 1 },
    { id: 5, customerName: "陈秀英", careItem: "皮肤护理", careTime: "2026-04-15 11:00", careNum: 1 },
    { id: 6, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-15 14:00", careNum: 2 },
    { id: 7, customerName: "吴桂兰", careItem: "测量体温", careTime: "2026-04-15 14:30", careNum: 1 },
    { id: 8, customerName: "郑福才", careItem: "喂饭护理", careTime: "2026-04-15 15:00", careNum: 1 },
    { id: 9, customerName: "王桂英", careItem: "康复训练", careTime: "2026-04-15 15:30", careNum: 1 },
    { id: 10, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-15 16:00", careNum: 2 },
    { id: 11, customerName: "张桂英", careItem: "测量血压", careTime: "2026-04-16 08:30", careNum: 1 },
    { id: 12, customerName: "李福才", careItem: "口服给药", careTime: "2026-04-16 09:00", careNum: 1 },
    { id: 13, customerName: "王秀兰", careItem: "口腔护理", careTime: "2026-04-16 10:15", careNum: 1 },
    { id: 14, customerName: "刘桂兰", careItem: "皮肤护理", careTime: "2026-04-16 10:30", careNum: 1 },
    { id: 15, customerName: "陈秀英", careItem: "翻身拍背", careTime: "2026-04-16 11:00", careNum: 2 },
    { id: 16, customerName: "周桂英", careItem: "测量体温", careTime: "2026-04-16 14:00", careNum: 1 },
    { id: 17, customerName: "吴桂兰", careItem: "喂饭护理", careTime: "2026-04-16 14:30", careNum: 1 },
    { id: 18, customerName: "郑福才", careItem: "康复训练", careTime: "2026-04-16 15:00", careNum: 1 },
    { id: 19, customerName: "王桂英", careItem: "翻身拍背", careTime: "2026-04-16 15:30", careNum: 2 },
    { id: 20, customerName: "林秀英", careItem: "测量血压", careTime: "2026-04-16 16:00", careNum: 1 },
    { id: 21, customerName: "张桂英", careItem: "口服给药", careTime: "2026-04-17 08:30", careNum: 1 },
    { id: 22, customerName: "李福才", careItem: "口腔护理", careTime: "2026-04-17 09:00", careNum: 1 },
    { id: 23, customerName: "王秀兰", careItem: "皮肤护理", careTime: "2026-04-17 10:15", careNum: 1 },
    { id: 24, customerName: "刘桂兰", careItem: "翻身拍背", careTime: "2026-04-17 10:30", careNum: 2 },
    { id: 25, customerName: "陈秀英", careItem: "测量体温", careTime: "2026-04-17 11:00", careNum: 1 },
    { id: 26, customerName: "周桂英", careItem: "喂饭护理", careTime: "2026-04-17 14:00", careNum: 1 },
    { id: 27, customerName: "吴桂兰", careItem: "康复训练", careTime: "2026-04-17 14:30", careNum: 1 },
    { id: 28, customerName: "郑福才", careItem: "翻身拍背", careTime: "2026-04-17 15:00", careNum: 2 },
    { id: 29, customerName: "王桂英", careItem: "测量血压", careTime: "2026-04-17 15:30", careNum: 1 },
    { id: 30, customerName: "林秀英", careItem: "口服给药", careTime: "2026-04-17 16:00", careNum: 1 },
    { id: 31, customerName: "张桂英", careItem: "口腔护理", careTime: "2026-04-18 08:30", careNum: 1 },
    { id: 32, customerName: "李福才", careItem: "皮肤护理", careTime: "2026-04-18 09:00", careNum: 1 },
    { id: 33, customerName: "王秀兰", careItem: "翻身拍背", careTime: "2026-04-18 10:15", careNum: 2 },
    { id: 34, customerName: "刘桂兰", careItem: "测量体温", careTime: "2026-04-18 10:30", careNum: 1 },
    { id: 35, customerName: "陈秀英", careItem: "喂饭护理", careTime: "2026-04-18 11:00", careNum: 1 },
    { id: 36, customerName: "周桂英", careItem: "康复训练", careTime: "2026-04-18 14:00", careNum: 1 },
    { id: 37, customerName: "吴桂兰", careItem: "翻身拍背", careTime: "2026-04-18 14:30", careNum: 2 },
    { id: 38, customerName: "郑福才", careItem: "测量血压", careTime: "2026-04-18 15:00", careNum: 1 },
    { id: 39, customerName: "王桂英", careItem: "口服给药", careTime: "2026-04-18 15:30", careNum: 1 },
    { id: 40, customerName: "林秀英", careItem: "口腔护理", careTime: "2026-04-18 16:00", careNum: 1 },
    { id: 41, customerName: "张桂英", careItem: "皮肤护理", careTime: "2026-04-19 08:30", careNum: 1 },
    { id: 42, customerName: "李福才", careItem: "翻身拍背", careTime: "2026-04-19 09:00", careNum: 2 },
    { id: 43, customerName: "王秀兰", careItem: "测量体温", careTime: "2026-04-19 10:15", careNum: 1 },
    { id: 44, customerName: "刘桂兰", careItem: "喂饭护理", careTime: "2026-04-19 10:30", careNum: 1 },
    { id: 45, customerName: "陈秀英", careItem: "康复训练", careTime: "2026-04-19 11:00", careNum: 1 },
    { id: 46, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-19 14:00", careNum: 2 },
    { id: 47, customerName: "吴桂兰", careItem: "测量血压", careTime: "2026-04-19 14:30", careNum: 1 },
    { id: 48, customerName: "郑福才", careItem: "口服给药", careTime: "2026-04-19 15:00", careNum: 1 },
    { id: 49, customerName: "王桂英", careItem: "口腔护理", careTime: "2026-04-19 15:30", careNum: 1 },
    { id: 50, customerName: "林秀英", careItem: "皮肤护理", careTime: "2026-04-19 16:00", careNum: 1 },
    { id: 51, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-20 08:30", careNum: 2 },
    { id: 52, customerName: "李福才", careItem: "测量体温", careTime: "2026-04-20 09:00", careNum: 1 },
    { id: 53, customerName: "王秀兰", careItem: "喂饭护理", careTime: "2026-04-20 10:15", careNum: 1 },
    { id: 54, customerName: "刘桂兰", careItem: "康复训练", careTime: "2026-04-20 10:30", careNum: 1 },
    { id: 55, customerName: "陈秀英", careItem: "翻身拍背", careTime: "2026-04-20 11:00", careNum: 2 },
    { id: 56, customerName: "周桂英", careItem: "测量血压", careTime: "2026-04-20 14:00", careNum: 1 },
    { id: 57, customerName: "吴桂兰", careItem: "口服给药", careTime: "2026-04-20 14:30", careNum: 1 },
    { id: 58, customerName: "郑福才", careItem: "口腔护理", careTime: "2026-04-20 15:00", careNum: 1 },
    { id: 59, customerName: "王桂英", careItem: "皮肤护理", careTime: "2026-04-20 15:30", careNum: 1 },
    { id: 60, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-20 16:00", careNum: 2 },
    { id: 61, customerName: "张桂英", careItem: "测量体温", careTime: "2026-04-21 08:30", careNum: 1 },
    { id: 62, customerName: "李福才", careItem: "喂饭护理", careTime: "2026-04-21 09:00", careNum: 1 },
    { id: 63, customerName: "王秀兰", careItem: "康复训练", careTime: "2026-04-21 10:15", careNum: 1 },
    { id: 64, customerName: "刘桂兰", careItem: "翻身拍背", careTime: "2026-04-21 10:30", careNum: 2 },
    { id: 65, customerName: "陈秀英", careItem: "测量血压", careTime: "2026-04-21 11:00", careNum: 1 },
    { id: 66, customerName: "周桂英", careItem: "口服给药", careTime: "2026-04-21 14:00", careNum: 1 },
    { id: 67, customerName: "吴桂兰", careItem: "口腔护理", careTime: "2026-04-21 14:30", careNum: 1 },
    { id: 68, customerName: "郑福才", careItem: "皮肤护理", careTime: "2026-04-21 15:00", careNum: 1 },
    { id: 69, customerName: "王桂英", careItem: "翻身拍背", careTime: "2026-04-21 15:30", careNum: 2 },
    { id: 70, customerName: "林秀英", careItem: "测量体温", careTime: "2026-04-21 16:00", careNum: 1 },
    { id: 71, customerName: "张桂英", careItem: "喂饭护理", careTime: "2026-04-22 08:30", careNum: 1 },
    { id: 72, customerName: "李福才", careItem: "康复训练", careTime: "2026-04-22 09:00", careNum: 1 },
    { id: 73, customerName: "王秀兰", careItem: "翻身拍背", careTime: "2026-04-22 10:15", careNum: 2 },
    { id: 74, customerName: "刘桂兰", careItem: "测量血压", careTime: "2026-04-22 10:30", careNum: 1 },
    { id: 75, customerName: "陈秀英", careItem: "口服给药", careTime: "2026-04-22 11:00", careNum: 1 },
    { id: 76, customerName: "周桂英", careItem: "口腔护理", careTime: "2026-04-22 14:00", careNum: 1 },
    { id: 77, customerName: "吴桂兰", careItem: "皮肤护理", careTime: "2026-04-22 14:30", careNum: 1 },
    { id: 78, customerName: "郑福才", careItem: "翻身拍背", careTime: "2026-04-22 15:00", careNum: 2 },
    { id: 79, customerName: "王桂英", careItem: "测量体温", careTime: "2026-04-22 15:30", careNum: 1 },
    { id: 80, customerName: "林秀英", careItem: "喂饭护理", careTime: "2026-04-22 16:00", careNum: 1 },
    { id: 81, customerName: "张桂英", careItem: "康复训练", careTime: "2026-04-23 08:30", careNum: 1 },
    { id: 82, customerName: "李福才", careItem: "翻身拍背", careTime: "2026-04-23 09:00", careNum: 2 },
    { id: 83, customerName: "王秀兰", careItem: "测量血压", careTime: "2026-04-23 10:15", careNum: 1 },
    { id: 84, customerName: "刘桂兰", careItem: "口服给药", careTime: "2026-04-23 10:30", careNum: 1 },
    { id: 85, customerName: "陈秀英", careItem: "口腔护理", careTime: "2026-04-23 11:00", careNum: 1 },
    { id: 86, customerName: "周桂英", careItem: "皮肤护理", careTime: "2026-04-23 14:00", careNum: 1 },
    { id: 87, customerName: "吴桂兰", careItem: "翻身拍背", careTime: "2026-04-23 14:30", careNum: 2 },
    { id: 88, customerName: "郑福才", careItem: "测量体温", careTime: "2026-04-23 15:00", careNum: 1 },
    { id: 89, customerName: "王桂英", careItem: "喂饭护理", careTime: "2026-04-23 15:30", careNum: 1 },
    { id: 90, customerName: "林秀英", careItem: "康复训练", careTime: "2026-04-23 16:00", careNum: 1 },
    { id: 91, customerName: "张桂英", careItem: "翻身拍背", careTime: "2026-04-24 08:30", careNum: 2 },
    { id: 92, customerName: "李福才", careItem: "测量血压", careTime: "2026-04-24 09:00", careNum: 1 },
    { id: 93, customerName: "王秀兰", careItem: "口服给药", careTime: "2026-04-24 10:15", careNum: 1 },
    { id: 94, customerName: "刘桂兰", careItem: "口腔护理", careTime: "2026-04-24 10:30", careNum: 1 },
    { id: 95, customerName: "陈秀英", careItem: "皮肤护理", careTime: "2026-04-24 11:00", careNum: 1 },
    { id: 96, customerName: "周桂英", careItem: "翻身拍背", careTime: "2026-04-24 14:00", careNum: 2 },
    { id: 97, customerName: "吴桂兰", careItem: "测量体温", careTime: "2026-04-24 14:30", careNum: 1 },
    { id: 98, customerName: "郑福才", careItem: "喂饭护理", careTime: "2026-04-24 15:00", careNum: 1 },
    { id: 99, customerName: "王桂英", careItem: "康复训练", careTime: "2026-04-24 15:30", careNum: 1 },
    { id: 100, customerName: "林秀英", careItem: "翻身拍背", careTime: "2026-04-24 16:00", careNum: 2 },
  ]
}

const removeRecord = (id) => {
  recordList.value = recordList.value.filter(item => item.id !== id)
  ElMessage.success('移除成功（逻辑删除）')
}
</script>

<style scoped>
.page-content {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.page-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}
.table-wrapper {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}
.pagination-box {
  margin-top: 20px;
  text-align: center;
  display:flex;
  justify-content:center;
}
.care-record-page::before {
  content: '';
  position: fixed;
  right: 0;
  bottom: 0;
  width: 350px;
  height: auto;
  background-image: url("/tb.png");
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 350px auto;
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}
</style>