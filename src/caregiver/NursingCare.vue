<template>
    <div class="nursing-care-container">
        <!-- 客户列表区域 -->
        <el-card class="customer-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span>客户护理项目</span>
                    <el-input v-model="searchKeyword" placeholder="客户姓名" clearable style="width: 240px"
                        @keyup.enter="searchCustomers">
                        <template #append>
                            <el-button @click="searchCustomers" :icon="Search" />
                        </template>
                    </el-input>
                </div>
            </template>

            <el-table :data="customerList" stripe border style="width: 100%" @row-click="handleSelectCustomer"
                highlight-current-row>
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="name" label="客户姓名" />
                <el-table-column prop="age" label="年龄" />
                <el-table-column prop="gender" label="性别" />
                <el-table-column prop="roomNo" label="房间号" />
                <el-table-column prop="bedNo" label="床号" />
                <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click.stop="selectAndView(row)">选择</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                    :page-sizes="[5, 10, 20]" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 护理项目列表区域 -->
        <el-card class="project-card" shadow="hover" v-if="selectedCustomer">
            <template #header>
                <div class="card-header">
                    <span>{{ selectedCustomer.name }} - 护理项目列表</span>
                    <el-tag type="success" size="large">共 {{ nursingProjects.length }} 项</el-tag>
                </div>
            </template>

            <el-table :data="nursingProjects" stripe border style="width: 100%">
                <el-table-column prop="projectId" label="项目编号" width="120" />
                <el-table-column prop="projectName" label="护理项目" />
                <el-table-column prop="requiredQuantity" label="应护理数量" width="120">
                    <template #default="{ row }">
                        {{ row.requiredQuantity }} {{ row.unit }}
                    </template>
                </el-table-column>
                <el-table-column prop="completedQuantity" label="已护理数量" width="120">
                    <template #default="{ row }">
                        <el-progress :percentage="row.completedPercent"
                            :format="() => `${row.completedQuantity} / ${row.requiredQuantity}`" :stroke-width="10"
                            :status="row.completedQuantity >= row.requiredQuantity ? 'success' : undefined" />
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="项目状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openAddRecordDialog(row)"
                            :disabled="row.status === '已完成'">
                            {{ row.status === '已完成' ? '已完成' : '添加护理' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加护理记录弹窗 -->
        <el-dialog v-model="recordDialogVisible" title="添加护理记录" width="500px" :close-on-click-modal="false">
            <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="100px">
                <el-form-item label="客户姓名">
                    <el-input :value="selectedCustomer?.name" disabled />
                </el-form-item>
                <el-form-item label="护理项目编号">
                    <el-input :value="currentProject?.projectId" disabled />
                </el-form-item>
                <el-form-item label="护理项目">
                    <el-input :value="currentProject?.projectName" disabled />
                </el-form-item>
                <el-form-item label="护理时间" prop="nursingTime">
                    <el-date-picker v-model="recordForm.nursingTime" type="datetime" placeholder="请选择护理时间"
                        format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                </el-form-item>
                <el-form-item label="护理数量" prop="nursingQuantity">
                    <el-input-number v-model="recordForm.nursingQuantity" :min="1" :max="remainingQuantity"
                        :precision="0" controls-position="right" style="width: 100%" />
                    <div class="form-tip">可护理数量上限：{{ remainingQuantity }}</div>
                </el-form-item>
                <el-form-item label="护理内容">
                    <el-input v-model="recordForm.nursingContent" type="textarea" :rows="3" placeholder="请输入护理内容（选填）" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="recordDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitNursingRecord" :loading="submitting">立即创建</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// ---------- 模拟数据 ----------
// 模拟客户数据
const mockCustomers = [
    { id: 1, name: '孙瑞英', age: 68, gender: '女', roomNo: '2012', bedNo: '2012-1' },
    { id: 2, name: '张帆', age: 77, gender: '女', roomNo: '1014', bedNo: '1014-1' },
    { id: 3, name: '李建国', age: 82, gender: '男', roomNo: '3018', bedNo: '3018-2' },
    { id: 4, name: '王淑芬', age: 71, gender: '女', roomNo: '2025', bedNo: '2025-1' },
    { id: 5, name: '陈永强', age: 65, gender: '男', roomNo: '1032', bedNo: '1032-3' },
]

// 模拟护理项目数据（按客户ID）
const mockNursingProjects = {
    1: [ // 孙瑞英的项目
        {
            id: 101,
            projectId: 'HLXM0001',
            projectName: '吸氧',
            requiredQuantity: 10,
            completedQuantity: 3,
            unit: '次',
            status: '进行中'
        },
        {
            id: 102,
            projectId: 'HLXM0002',
            projectName: '翻身拍背',
            requiredQuantity: 30,
            completedQuantity: 15,
            unit: '次',
            status: '进行中'
        },
        {
            id: 103,
            projectId: 'HLXM0003',
            projectName: '口腔护理',
            requiredQuantity: 20,
            completedQuantity: 20,
            unit: '次',
            status: '已完成'
        },
    ],
    2: [ // 张帆的项目
        {
            id: 201,
            projectId: 'HLXM0004',
            projectName: '血压监测',
            requiredQuantity: 60,
            completedQuantity: 30,
            unit: '次',
            status: '进行中'
        },
        {
            id: 202,
            projectId: 'HLXM0005',
            projectName: '血糖监测',
            requiredQuantity: 40,
            completedQuantity: 28,
            unit: '次',
            status: '进行中'
        },
    ],
    3: [ // 李建国的项目
        {
            id: 301,
            projectId: 'HLXM0006',
            projectName: '肢体康复训练',
            requiredQuantity: 50,
            completedQuantity: 10,
            unit: '分钟',
            status: '进行中'
        },
    ],
    4: [ // 王淑芬的项目
        {
            id: 401,
            projectId: 'HLXM0007',
            projectName: '用药提醒',
            requiredQuantity: 90,
            completedQuantity: 45,
            unit: '次',
            status: '进行中'
        },
    ],
    5: [ // 陈永强的项目
        {
            id: 501,
            projectId: 'HLXM0008',
            projectName: '助浴服务',
            requiredQuantity: 12,
            completedQuantity: 4,
            unit: '次',
            status: '进行中'
        },
    ],
}

// 模拟护理记录存储
const nursingRecords = ref([])

// ---------- 响应式数据 ----------
const searchKeyword = ref('')
const customerList = ref([])
const selectedCustomer = ref(null)
const nursingProjects = ref([])
const pagination = reactive({
    pageNum: 1,
    pageSize: 5,
    total: 0,
})

const recordDialogVisible = ref(false)
const currentProject = ref(null)
const recordForm = reactive({
    nursingTime: '',
    nursingQuantity: 1,
    nursingContent: '',
})
const recordFormRef = ref(null)
const submitting = ref(false)

// 计算剩余可护理数量
const remainingQuantity = computed(() => {
    if (!currentProject.value) return 0
    const project = currentProject.value
    return Math.max(0, project.requiredQuantity - project.completedQuantity)
})

// 表单验证规则
const recordRules = {
    nursingTime: [
        { required: true, message: '请选择护理时间', trigger: 'change' }
    ],
    nursingQuantity: [
        { required: true, message: '请输入护理数量', trigger: 'blur' },
        { type: 'number', min: 1, message: '护理数量必须大于0', trigger: 'blur' }
    ]
}

// ---------- 辅助函数 ----------
const getStatusType = (status) => {
    switch (status) {
        case '已完成': return 'success'
        case '进行中': return 'primary'
        default: return 'info'
    }
}

const updateProjectStatus = (project) => {
    project.completedPercent = Math.round((project.completedQuantity / project.requiredQuantity) * 100)
    if (project.completedQuantity >= project.requiredQuantity) {
        project.status = '已完成'
    } else {
        project.status = '进行中'
    }
}

// 加载客户列表
const loadCustomers = () => {
    let filtered = [...mockCustomers]
    if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        filtered = filtered.filter(customer =>
            customer.name.toLowerCase().includes(keyword)
        )
    }
    pagination.total = filtered.length
    const start = (pagination.pageNum - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    customerList.value = filtered.slice(start, end)
}

const searchCustomers = () => {
    pagination.pageNum = 1
    loadCustomers()
    selectedCustomer.value = null
    nursingProjects.value = []
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    loadCustomers()
}

const handleCurrentChange = (page) => {
    pagination.pageNum = page
    loadCustomers()
}

const handleSelectCustomer = (customer) => {
    selectedCustomer.value = customer
    loadNursingProjects(customer.id)
}

const selectAndView = (customer) => {
    selectedCustomer.value = customer
    loadNursingProjects(customer.id)
}

const loadNursingProjects = (customerId) => {
    const projects = mockNursingProjects[customerId] || []
    nursingProjects.value = projects.map(project => ({
        ...project,
        completedPercent: Math.round((project.completedQuantity / project.requiredQuantity) * 100)
    }))
}

const openAddRecordDialog = (project) => {
    if (project.status === '已完成') {
        ElMessage.warning('该项目已完成护理，无需继续添加')
        return
    }
    currentProject.value = project
    recordForm.nursingTime = ''
    recordForm.nursingQuantity = 1
    recordForm.nursingContent = ''
    recordDialogVisible.value = true
}

const submitNursingRecord = async () => {
    if (!recordFormRef.value) return

    await recordFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitting.value = true

        try {
            const quantity = recordForm.nursingQuantity
            const newCompleted = currentProject.value.completedQuantity + quantity

            if (newCompleted > currentProject.value.requiredQuantity) {
                ElMessage.error(`护理数量超出上限，最多可护理 ${remainingQuantity.value} 次`)
                submitting.value = false
                return
            }

            // 创建护理记录
            const newRecord = {
                id: Date.now(),
                customerId: selectedCustomer.value.id,
                customerName: selectedCustomer.value.name,
                projectId: currentProject.value.projectId,
                projectName: currentProject.value.projectName,
                nursingTime: recordForm.nursingTime,
                nursingQuantity: quantity,
                nursingContent: recordForm.nursingContent,
                createTime: new Date().toISOString()
            }
            nursingRecords.value.push(newRecord)

            // 更新项目的已护理数量
            currentProject.value.completedQuantity = newCompleted
            updateProjectStatus(currentProject.value)

            // 更新 mockNursingProjects 中的数据
            const projects = mockNursingProjects[selectedCustomer.value.id]
            const targetProject = projects.find(p => p.id === currentProject.value.id)
            if (targetProject) {
                targetProject.completedQuantity = newCompleted
                targetProject.status = currentProject.value.status
            }

            // 重新加载护理项目列表
            loadNursingProjects(selectedCustomer.value.id)

            ElMessage.success(`护理记录添加成功，${currentProject.value.projectName} 已护理数量更新为 ${newCompleted}`)
            recordDialogVisible.value = false

        } catch (error) {
            console.error('提交失败:', error)
            ElMessage.error('添加失败，请重试')
        } finally {
            submitting.value = false
        }
    })
}

onMounted(() => {
    loadCustomers()
})
</script>

<style scoped>
.nursing-care-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100%;
}

.customer-card,
.project-card {
    margin-bottom: 20px;
    border-radius: 8px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

:deep(.el-table__row) {
    cursor: pointer;
}

:deep(.el-table__row.current-row) {
    background-color: #ecf5ff;
}

:deep(.el-progress-bar__outer) {
    background-color: #ebeef5;
}

:deep(.el-progress-bar__inner) {
    transition: width 0.3s ease;
}
</style>