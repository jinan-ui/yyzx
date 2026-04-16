<template>
  <div class="bed-map-container">
    <div class="top-bar">
      <el-select v-model="queryForm.floorId" @change="loadBedMap">
        <el-option v-for="f in floorList" :key="f.id" :label="f.name" :value="f.id" />
      </el-select>
      <div class="stats">
        <el-tag type="success">总床:{{ stats.total }}</el-tag>
        <el-tag type="danger">空闲:{{ stats.free }}</el-tag>
        <el-tag type="info">有人:{{ stats.occupied }}</el-tag>
        <el-tag type="primary">外出:{{ stats.out }}</el-tag>
      </div>
    </div>

    <div class="bed-grid">
      <div v-for="room in roomList" :key="room.id" class="room-card">
        <div class="room-title">{{ room.roomNo }}</div>
        <div class="bed-list">
          <div v-for="bed in room.beds" :key="bed.id" class="bed-item" :class="getStatusClass(bed.status)">
            <div>{{ bed.bedNo }}</div>
            <div>{{ getStatusText(bed.status) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFloorList, getBedMapByFloor } from '../api/bed.js'

const floorList = ref([])
const roomList = ref([])
const stats = ref({ total: 0, free: 0, occupied: 0, out: 0 })
const queryForm = ref({ floorId: 1 })

onMounted(() => {
  loadFloorList()
  loadBedMap()
})

const loadFloorList = async () => {
  const res = await getFloorList()
  floorList.value = res.data
}

const loadBedMap = async () => {
  const res = await getBedMapByFloor(queryForm.value.floorId)
  roomList.value = res.data.rooms
  stats.value = res.data.stats
}

const getStatusClass = (s) => ({
  0: 'status-free',
  1: 'status-occupied',
  2: 'status-out'
}[s])

const getStatusText = (s) => ({ 0: '空闲', 1: '有人', 2: '外出' }[s])
</script>

<style scoped>
.bed-map-container {
  padding: 20px;
  background: #f5f7fa;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 10px;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.room-card {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
}

.room-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.bed-item {
  padding: 8px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 6px;
  font-size: 16px;
}

.status-free {
  background: #f0f9eb;
  color: #67c23a;
}

.status-occupied {
  background: #fef0f0;
  color: #f56c6c;
}

.status-out {
  background: #ecf5ff;
  color: #409eff;
}
</style>