<template>
  <el-dialog v-model="visible" title="入住登记" width="700px">
    <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="customerName" required>
            <el-input v-model="form.customerName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender" required>
            <el-select v-model="form.gender">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期">
            <el-date-picker v-model="form.birthday" type="date" @change="computeAge" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input v-model="form.age" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard" required>
            <el-input v-model="form.idCard" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="血型">
            <el-input v-model="form.bloodType" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家属姓名" prop="familyName" required>
            <el-input v-model="form.familyName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家属电话" prop="familyPhone" required>
            <el-input v-model="form.familyPhone" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="楼栋" prop="buildingNo" required>
            <el-select v-model="form.buildingNo">
              <el-option label="606" value="606" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房间号" prop="roomNo" required>
            <el-select v-model="form.roomNo" @change="getBedList">
              <el-option label="101" value="101" />
              <el-option label="102" value="102" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="床位号" prop="bedNo" required>
            <el-select v-model="form.bedNo">
              <el-option v-for="item in bedList" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入住时间" prop="checkInTime" required>
            <el-date-picker v-model="form.checkInTime" type="datetime" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同到期" prop="contractEndTime" required>
            <el-date-picker v-model="form.contractEndTime" type="datetime" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['refresh'])

const visible = ref(false)
const formRef = ref(null)
const form = ref({})
const bedList = ref([])

const rules = {
  customerName: [{ required: true, trigger: 'blur' }],
  gender: [{ required: true, trigger: 'change' }],
  idCard: [{ required: true, trigger: 'blur' }],
  familyName: [{ required: true, trigger: 'blur' }],
  familyPhone: [{ required: true, trigger: 'blur' }],
  buildingNo: [{ required: true, trigger: 'change' }],
  roomNo: [{ required: true, trigger: 'change' }],
  bedNo: [{ required: true, trigger: 'change' }],
  checkInTime: [{ required: true, trigger: 'change' }],
  contractEndTime: [{ required: true, trigger: 'change' }]
}

const open = (row = null) => {
  form.value = row ? { ...row } : {}
  visible.value = true
}

const computeAge = () => {
  if (!form.value.birthday) return
  const birth = new Date(form.value.birthday)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--
  form.value.age = age
}

const getBedList = () => {
  bedList.value = ['01', '02', '03']
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
}

const submitForm = () => {
  formRef.value.validate(valid => {
    if (!valid) return

    // 格式化时间
    form.value.birthday = formatDate(form.value.birthday)
    form.value.checkInTime = formatDate(form.value.checkInTime)
    form.value.contractEndTime = formatDate(form.value.contractEndTime)

    visible.value = false
    ElMessage.success(form.value.id ? '编辑成功' : '新增成功')
    
    // ✅ 关键：把表单数据抛给父页面保存
    emit('save', form.value)
  })
}

defineExpose({ open })
</script>