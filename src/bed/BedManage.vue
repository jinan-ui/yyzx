<template>
    <div class="bed-manage-container">
        <div class="search-bar">
            <el-form :inline="true" :model="queryForm">
                <el-form-item label="姓名：">
                    <el-input v-model="queryForm.name" clearable />
                </el-form-item>
                <el-form-item label="入住日期：">
                    <el-date-picker v-model="queryForm.startDate" type="date" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="loadRecordList">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-tabs v-model="activeTab" @tab-change="loadRecordList">
            <el-tab-pane label="正在使用" name="active" />
            <el-tab-pane label="使用历史" name="history" />
        </el-tabs>

        <el-table :data="tableData" border v-loading="loading" style="width:100%;margin-top:20px">
            <el-table-column label="序号" width="80" align="center">
                <template #default="scope">
                    <span>{{ (pagination.page - 1) * pagination.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="customerName" label="姓名" width="120" align="center" />
            <el-table-column prop="gender" label="性别" width="80" align="center" />
            <el-table-column prop="bedDetail" label="床位" align="center" />
            <el-table-column prop="startDate" label="开始日期" align="center" />
            <el-table-column prop="endDate" label="结束日期" align="center" />
            <el-table-column label="操作" align="center" width="160">
                <template #default="scope">
                    <el-button link type="primary" @click="openModifyDialog(scope.row)">修改</el-button>
                    <el-button link type="primary" @click="openExchangeDialog(scope.row)">调换</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total"
            @size-change="loadRecordList" @current-change="loadRecordList"
            style="margin-top:20px;justify-content:flex-end" />

        <el-dialog v-model="modifyVisible" title="修改结束日期" width="500px">
            <el-form :model="modifyForm" label-width="120px">
                <el-form-item label="结束日期">
                    <el-date-picker v-model="modifyForm.endDate" type="date" value-format="YYYY-MM-DD"
                        style="width:100%" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="modifyVisible = false">取消</el-button>
                <el-button type="primary" @click="submitModify">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="exchangeVisible" title="床位调换" width="95%" :close-on-click-modal="false" top="5vh">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="exchange-info-card">
                        <div class="info-item">
                            <label>姓名：</label>
                            <span>{{ exchangeForm.customerName }}</span>
                        </div>
                        <div class="info-item">
                            <label>性别：</label>
                            <span>{{ exchangeForm.gender }}</span>
                        </div>
                        <div class="info-item">
                            <label>旧床位：</label>
                            <span>{{ exchangeForm.oldBedDetail }}</span>
                        </div>
                        <div class="info-item">
                            <label>新床位：</label>
                            <span>{{ exchangeForm.newBedDetail || '未选择' }}</span>
                        </div>
                        <div class="info-item">
                            <label>入住日期：</label>
                            <span>{{ exchangeForm.startDate }}</span>
                        </div>
                        <div class="info-item">
                            <label>结束日期：</label>
                            <span>{{ exchangeForm.endDate }}</span>
                        </div>
                    </div>
                </el-col>

                <el-col :span="18">
                    <div class="bed-map-panel">
                        <div class="map-top-bar">
                            <el-select v-model="floorId" @change="loadBedMap" style="width:180px" size="large">
                                <el-option v-for="f in floorList" :key="f.id" :label="f.name" :value="f.id" />
                            </el-select>
                            <div class="stats">
                                <el-tag type="success" size="large" style="font-size:16px;padding:8px 16px">空闲: {{
                                    stats.free
                                    }}</el-tag>
                                <el-tag type="danger" size="large" style="font-size:16px;padding:8px 16px">已入住: {{
                                    stats.occupied }}</el-tag>
                                <el-tag type="info" size="large" style="font-size:16px;padding:8px 16px">外出: {{
                                    stats.out
                                    }}</el-tag>
                            </div>
                        </div>

                        <div class="room-grid" v-loading="loadingMap">
                            <div v-for="room in roomList" :key="room.id" class="room-card">
                                <div class="room-header">
                                    <span class="room-title">{{ room.roomNo }} 房间</span>
                                    <span class="room-free">
                                        空闲: {{room.beds.filter(b => b.status === 0).length}}/{{ room.beds.length }}
                                    </span>
                                </div>

                                <div class="bed-items">
                                    <div v-for="bed in room.beds" :key="bed.id" class="bed-box"
                                        :class="getBedClass(bed.status)" @click="selectBed(room, bed)"
                                        :style="{ cursor: bed.status === 0 ? 'pointer' : 'not-allowed' }">
                                        <div class="bed-no">{{ bed.bedNo }}</div>
                                        <div class="bed-status" :class="getTextClass(bed.status)">
                                            {{ getStatusText(bed.status) }}
                                        </div>
                                        <div v-if="bed.status === 1 || bed.status === 2" class="bed-owner">
                                            {{ getCustomerName(bed.customerId) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <template #footer>
                <el-button @click="exchangeVisible = false" size="large" style="font-size:16px">取消</el-button>
                <el-button type="primary" @click="submitExchange" :disabled="!exchangeForm.newBedDetail" size="large"
                    style="font-size:16px;padding:0 30px">
                    确认调换
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
    getBedRecordList,
    updateBedRecord,
    exchangeBed,
    getFloorList,
    getBedMapByFloor,
    mockCustomers
} from '../api/bed.js'

const loading = ref(false)
const activeTab = ref('active')
const queryForm = reactive({ name: '', startDate: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const tableData = ref([])

const modifyVisible = ref(false)
const modifyForm = reactive({ id: null, endDate: '' })

const exchangeVisible = ref(false)
const exchangeForm = reactive({
    id: null,
    customerName: '',
    gender: '',
    oldBedDetail: '',
    newBedDetail: '',
    startDate: '',
    endDate: ''
})

const floorList = ref([])
const floorId = ref(1)
const roomList = ref([])
const stats = ref({ free: 0, occupied: 0, out: 0 })
const loadingMap = ref(false)

const customerMap = computed(() => {
    const map = {}
    mockCustomers.forEach(c => {
        map[c.id] = c.name
    })
    return map
})

onMounted(() => {
    loadRecordList()
    loadFloorList()
    loadBedMap()
})

const loadFloorList = async () => {
    const res = await getFloorList()
    floorList.value = res.data
}

const loadBedMap = async () => {
    loadingMap.value = true
    const res = await getBedMapByFloor(floorId.value)
    roomList.value = res.data.rooms
    stats.value = res.data.stats
    loadingMap.value = false
}

const loadRecordList = async () => {
    loading.value = true
    const res = await getBedRecordList({
        ...queryForm,
        isActive: activeTab.value === 'active',
        page: pagination.page,
        pageSize: pagination.pageSize
    })
    tableData.value = res.data.list.sort((a, b) =>
        a.customerName.localeCompare(b.customerName, 'zh-CN')
    )
    pagination.total = res.data.total
    loading.value = false
}

const resetQuery = () => {
    queryForm.name = ''
    queryForm.startDate = ''
    loadRecordList()
}

const openModifyDialog = (row) => {
    modifyForm.id = row.id
    modifyForm.endDate = row.endDate
    modifyVisible.value = true
}

const submitModify = async () => {
    try {
        await updateBedRecord(modifyForm.id, modifyForm.endDate)
        ElMessage.success('修改成功')
        modifyVisible.value = false
        loadRecordList()
        loadBedMap()
    } catch (e) {
        ElMessage.error('修改失败')
    }
}

const openExchangeDialog = (row) => {
    Object.assign(exchangeForm, {
        id: row.id,
        customerName: row.customerName,
        gender: row.gender,
        oldBedDetail: row.bedDetail,
        newBedDetail: '',
        startDate: row.startDate,
        endDate: row.endDate
    })
    exchangeVisible.value = true
}

const selectBed = (room, bed) => {
    if (bed.status !== 0) {
        ElMessage.warning('只能选择空闲床位')
        return
    }
    exchangeForm.newBedDetail = bed.bedNo
    ElMessage.success(`已选择床位：${exchangeForm.newBedDetail}`)
}

const submitExchange = async () => {
    if (!exchangeForm.newBedDetail) {
        ElMessage.warning('请先选择新床位')
        return
    }
    try {
        await exchangeBed({
            recordId: exchangeForm.id,
            oldBedDetail: exchangeForm.oldBedDetail,
            newBedDetail: exchangeForm.newBedDetail,
            startDate: exchangeForm.startDate,
            endDate: exchangeForm.endDate
        })
        ElMessage.success('调换成功')
        exchangeVisible.value = false
        loadRecordList()
        loadBedMap()
    } catch (e) {
        ElMessage.error('调换失败')
    }
}

const getBedClass = (status) => {
    if (status === 0) return 'bed-free'
    if (status === 1) return 'bed-occupied'
    if (status === 2) return 'bed-out'
    return ''
}

const getTextClass = (status) => {
    if (status === 0) return 'text-green'
    if (status === 1) return 'text-red'
    if (status === 2) return 'text-blue'
    return ''
}

const getStatusText = (status) => {
    if (status === 0) return '空闲'
    if (status === 1) return '已入住'
    if (status === 2) return '外出'
    return ''
}

const getCustomerName = (customerId) => {
    return customerMap.value[customerId] || '未知'
}
</script>

<style scoped>
.bed-manage-container {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100vh;
}

.search-bar {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.exchange-info-card {
    background: #fff;
    padding: 24px;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    height: fit-content;
}

.info-item {
    margin-bottom: 20px;
    font-size: 18px;
    display: flex;
    align-items: center;
}

.info-item label {
    width: 90px;
    font-weight: bold;
    color: #333;
}

.info-item span {
    color: #666;
}

.bed-map-panel {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    max-height: 70vh;
    overflow-y: auto;
}

.map-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.stats {
    display: flex;
    gap: 12px;
}

.room-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.room-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.room-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 12px;
}

.room-free {
    font-weight: normal;
    color: #666;
    font-size: 16px;
}

.bed-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.bed-box {
    padding: 14px;
    border-radius: 8px;
    text-align: center;
    font-size: 16px;
    transition: all 0.2s;
}

.bed-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bed-free {
    background: #f0fff0;
}

.bed-occupied {
    background: #ffebee;
}

.bed-out {
    background: #e3f2fd;
}

.text-green {
    color: #00b42a;
    font-weight: bold;
    font-size: 17px;
}

.text-red {
    color: #f53f3f;
    font-weight: bold;
    font-size: 17px;
}

.text-blue {
    color: #409eff;
    font-weight: bold;
    font-size: 17px;
}

.bed-no {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 4px;
    color: #333;
}

.bed-owner {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
}
</style>