<template>
    <!-- 只在这里加了背景样式，其他完全不动 -->
    <el-row style="height:100vh; background:url(/image.png) center / cover no-repeat fixed;">
        <el-col :xs="{span:24,offset:0}" :sm="{span:8,offset:8}">
             <div style="text-align:center; margin-bottom:20px;" class="is-full-screen">
                <img 
                    src="/tb.png" 
                    alt="logo" 
                    style="width:100px; height:100px; vertical-align:middle; margin-right:10px;">
                <h1 style="display:inline-block; vertical-align:middle; font-size:26px;">东软颐养中心</h1>
            </div>
            <el-form :model="formData" ref="formData">
                <el-input placeholder="请输入用户名" prefix-icon="User" 
                v-model="formData.username" clearable style="margin-bottom: 10px" maxlength="18" show-word-limit 
                :status="formData.username ? 'success' : ''"></el-input>
                <el-input placeholder="请输入密码" prefix-icon="Key" 
                v-model="formData.password" show-password style="margin-bottom:10px"></el-input>
            </el-form>
            
            <el-select v-model="value" placeholder="请选择" style="width: 100%; margin-bottom:10px">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" >
                </el-option>
            </el-select>

            <el-button type="success"  style="width: 100%"  :disabled="!formData.username || !formData.password" @click="login">
                登录
            </el-button>
        </el-col>
    </el-row>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
    name: 'UserLogin',
    data() {
        return {
            input: ref(''),
            radio2: ref('1'),
            disabled: false,
            formData: {
                username: "",
                password: "",
                userType: "1"
            },
            options: [
                { value: '1', label: '系统管理员' },
                { value: '2', label: '健康管家', disabled: true }
            ],
            value: ref('1')
        }
    },
    methods: {
        login() {
            const allowed = ['admin', 'admin1', 'admin2']
            const user = this.formData.username
            const pwd = this.formData.password

            if (user === pwd && allowed.includes(user)) {
                this.formData.userType = this.value
                this.$emit('login', this.formData)
                ElMessage.success({
                    message: '登录成功！',
                    duration: 2000  
                })
                this.$router.push('/layout')
                
            } else {
               ElMessage.error({
                    message: '用户名或密码错误',
                    duration: 3000  
                })
                
            }
        }
    }
}
</script>