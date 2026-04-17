<!-- 服务关注-客户列表和客户服务列表page3
 服务分配页面 -->
<template>
    <!-- Customer:客户 -->
    <div>
        <el-row :gutter="0">
            <el-col :span="20">
                <el-input v-model="searchCustomerName" placeholder="查询客户姓名"></el-input>
            </el-col>
            <el-col :span="4">
                <el-button @click="handleSearchCustomer">查询</el-button>
                <el-button type="default" @click="$router.back()">返回</el-button>
            </el-col>
        </el-row>
    </div>

    <el-row :gutter="40">
        <el-col :span="12">
            <div class="table-left">
                <!-- 搜索栏 -->
                <el-row>
                    <el-col :xs="24" :sm="6" :md="4">
                        <h3>客户信息</h3>
                    </el-col>
                </el-row>
                <!-- 左侧：客户信息-->
                <el-table :data="customerListNoManager" stripe @selection-change="handleLeftSelect">
                    <el-table-column prop="id" label="序号" width="70"></el-table-column>
                    <el-table-column prop="name" label="客户" width="80"></el-table-column>
                    <el-table-column prop="age" label="年龄" width="80"></el-table-column>
                    <el-table-column prop="sex" label="性别" width="80"></el-table-column>
                    <el-table-column prop="bedId" label="床号" width="100"></el-table-column>
                    <el-table-column prop="level" label="护理级别"></el-table-column>
                    <el-table-column label="状态" width="120">
                        <template #default="scope">
                            <el-button size="small" @click="viewCustomerProjects(scope.row)">
                                查看
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination-box">
                    <el-pagination layout="prev, pager, next" :total="50"></el-pagination>
                </div>
            </div>
        </el-col>

        <el-col :span="12">
            <!-- 右侧：当前管家服务的客户 -->
            <div class="table-right">
                <h3>{{ selectedCustomersName }}已购护理项目</h3>
                <el-col :span="8">
                    <el-button @click="toServiceBuy" type="success" :disabled="isDisabled">添加护理项目</el-button>
                </el-col>
                <el-table :data="customerBuyList" stripe @selection-change="handleRightSelect">
                    <el-table-column prop="id" label="序号" width="80"></el-table-column>
                    <el-table-column prop="projectId" label="护理项目编号" width="120"></el-table-column>
                    <el-table-column prop="projectName" label="护理项目名称" width="120"></el-table-column>
                    <el-table-column prop="price" label="价格" width="100"></el-table-column>
                    <el-table-column prop="remain" label="余量" width="100"></el-table-column>
                    <el-table-column prop="serviceDate" label="服务到位日期" width="100"></el-table-column>
                    <el-table-column label="状态" width="120">
                        <el-table-column prop="isUsedUp" label="是否用完" width="100"></el-table-column>
                        <el-table-column prop="isExpired" label="是否到期" width="100"></el-table-column>
                    </el-table-column>
                    <el-table-column label="操作" width="120">

                        <template #default="scope">
                            <!-- 点击移除删除 -->
                            <el-button type="danger" size="small" @click="removeCustomer(scope.row)">
                                移除
                            </el-button>
                            <!-- 点击续费会跳非模态框 -->
                            <!-- 取到当前行数据scope.row -->
                            <el-button type="danger" size="small" @click="openRenewDialog(scope.row)">
                                续费
                            </el-button>
                        </template>
                    </el-table-column>

                </el-table>
                <!-- 分页组件 -->
                <div class="pagination-box">
                    <el-pagination layout="prev, pager, next" :total="30"></el-pagination>
                </div>

            </div>

        </el-col>
    </el-row>
    <!-- 非模态框 -->
    <!-- 关键：去掉遮罩层 --> <!-- 可选：防止点击背景关闭 --> <!-- 可选：非模态框通常配合可拖拽使用 -->
    <el-dialog v-model="dialogVisible" title="护理项目续费" :modal="false" :close-on-click-modal="false" draggable>
        <el-form :model="formData" label-width="120px">
            <!-- 客户姓名 -->
            <el-form-item label="客户姓名：">
                <el-input v-model="formData.customerName" disabled></el-input>
            </el-form-item>

            <!-- 护理项目编号 -->
            <el-form-item label="护理项目编号：">
                <el-input v-model="formData.projectId" disabled></el-input>
            </el-form-item>

            <!-- 护理项目名称 -->
            <el-form-item label="护理项目名称：">
                <el-input v-model="formData.projectName" disabled></el-input>
            </el-form-item>

            <!-- 价格 -->
            <el-form-item label="价格：">
                <el-input v-model="formData.price" disabled></el-input>
            </el-form-item>

            <!-- 原有数量 -->
            <el-form-item label="原有数量：">
                <el-input v-model.number="formData.originalCount" disabled></el-input>
            </el-form-item>

            <!-- 新增数量 -->
            <el-form-item label="新增数量：">
                <el-input v-model.number="formData.addCount" type="number" min="0" placeholder="请输入新增数量"></el-input>
            </el-form-item>

            <!-- 总数量（自动计算） -->
            <el-form-item label="总数量：">
                <el-input v-model.number="formData.totalCount" disabled></el-input>
            </el-form-item>

            <!-- 服务到期日（日期控件） -->
            <el-form-item label="服务到期日：">
                <el-date-picker v-model="formData.serviceDate" type="date" placeholder="选择服务到期日期"
                    style="width: 100%"></el-date-picker>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
    </el-dialog>
</template>

<script>
export default {
    name: 'ServiceAssign',
    data() {
        return {
            isDisabled: false,   // 控制添加按钮是否禁用（可根据需要修改逻辑）
            selectedCustomerId: null,   // 当前选中的客户ID
            // 
            originalCustomerList: [
                { id: 1, name: '张三', phone: '13812345678', sex: '男', bedId: '001', level: '一级护理', age: 68 },
                { id: 2, name: '李四', phone: '13812345678', sex: '女', bedId: '002', level: '二级护理', age: 72 },
                { id: 3, name: '王五', phone: '13812345678', sex: '男', bedId: '003', level: '三级护理', age: 65 },
                { id: 4, name: '赵六', phone: '13812345678', sex: '女', bedId: '004', level: '四级护理', age: 70 },
                { id: 5, name: '钱七', phone: '13812345678', sex: '男', bedId: '005', level: '五级护理', age: 66 }
            ],
            customerListNoManager: [
                { id: 1, name: '张三', phone: '13812345678', sex: '男', bedId: '001', level: '一级护理', age: 68 },
                { id: 2, name: '李四', phone: '13812345678', sex: '女', bedId: '002', level: '二级护理', age: 72 },
                { id: 3, name: '王五', phone: '13812345678', sex: '男', bedId: '003', level: '三级护理', age: 65 },
                { id: 4, name: '赵六', phone: '13812345678', sex: '女', bedId: '004', level: '四级护理', age: 70 },
                { id: 5, name: '钱七', phone: '13812345678', sex: '男', bedId: '005', level: '五级护理', age: 66 }
            ],
            // 右侧表格显示新空数组
            customerBuyList: [],
            // 列表（本应该是数组）对应的对象
            customerBuyMap: {
                1: [
                    { id: 1, projectId: 'XM001', projectName: '基础护理套餐', price: 299.00, remain: 8, serviceDate: '2025-06-01', isUsedUp: '否', isExpired: '否' },
                    { id: 2, projectId: 'XM003', projectName: '心理疏导咨询', price: 199.00, remain: 12, serviceDate: '2025-05-28', isUsedUp: '否', isExpired: '是' }
                ],
                2: [
                    { id: 3, projectId: 'XM002', projectName: '康复理疗服务', price: 499.00, remain: 5, serviceDate: '2025-06-03', isUsedUp: '否', isExpired: '否' }
                ],
                3: [
                    { id: 4, projectId: 'XM004', projectName: '营养膳食定制', price: 399.00, remain: 3, serviceDate: '2025-06-10', isUsedUp: '否', isExpired: '否' },
                    { id: 5, projectId: 'XM005', projectName: '24小时陪护', price: 899.00, remain: 2, serviceDate: '2025-05-25', isUsedUp: '否', isExpired: '是' }
                ],
                4: [
                    { id: 6, projectId: 'XM006', projectName: '中医养生调理', price: 599.00, remain: 6, serviceDate: '2025-06-15', isUsedUp: '否', isExpired: '否' }
                ],
                5: [
                    { id: 7, projectId: 'XM007', projectName: '康复训练指导', price: 349.00, remain: 4, serviceDate: '2025-06-08', isUsedUp: '否', isExpired: '否' },
                    { id: 8, projectId: 'XM001', projectName: '基础护理套餐', price: 299.00, remain: -5, serviceDate: '2025-06-20', isUsedUp: '是', isExpired: '否' }
                ],
            },
            //存储左侧选中的客户，批量操作用
            selectedLeftCustomers: [],
            selectedCustomersName: '未知',
            dialogVisible: false, // 续费对话框的显示状态
            // 输入框，不然搜不到值
            searchCustomerName: '',
            formData: {
                customerName: '',
                projectId: '',
                projectName: '',
                price: 0,
                originalCount: 0,
                addCount: 0,
                totalCount: 0,
                serviceDate: null
            },
            currentProject: null   // 存储当前要续费的项目
        }

    },
    watch: {
        // 新增：监听新增数量变化，自动计算总数量
        'formData.addCount'(newVal) {
            const original = this.formData.originalCount || 0;
            const add = newVal && !isNaN(newVal) ? Number(newVal) : 0;
            this.formData.totalCount = original + add;
        }

    },
    methods: {
        toServiceBuy() {
            // 跳转购买界面
            if (!this.selectedCustomerId) {
                this.$message.warning('请先选择一个客户');
                return;
            }
            this.$router.push({
                path: '/servicebuy',
                query: { customerId: this.selectedCustomerId }
            });
        },
        // toServiceBuy() {

        //     this.$router.push('/servicebuy');
        //     // 如果需要传递参数，可以使用 query 或 params：
        //     // this.$router.push({ path: '/add-project', query: { from: 'service-assign' } });
        // },
        // 查看客户已购项目
        viewCustomerProjects(customer) {
            this.customerBuyList = this.customerBuyMap[customer.id] || [];
            // 更新标题中的客户名称
            this.selectedCustomersName = customer.name;
            this.selectedCustomerId = customer.id;   // 记录客户ID
        },
        // 续费项目
        renewProject(row) {
            this.customerBuyList = this.customerBuyList.filter(item => item.id !== row.id);
            console.log('续费项目', row);
            // 打开弹窗
            this.dialogVisible = true;
        },



        // 新增
        openRenewDialog(row) {
            // 填充表单数据（根据当前行的项目信息）
            this.formData = {
                customerName: this.selectedCustomersName,  // 当前选中的客户名
                projectId: row.projectId,
                projectName: row.projectName,
                price: row.price,
                originalCount: row.remain,
                addCount: 0,
                totalCount: row.remain,
                serviceDate: row.serviceDate ? new Date(row.serviceDate) : null
            };
            this.currentProject = row;
            this.dialogVisible = true;
        },
        // 保存续费
        handleSave() {
            const addCount = this.formData.addCount;
            if (!addCount || addCount <= 0) {
                alert('请输入有效的新增数量');
                return;
            }
            // 更新右侧表格中对应项目的余量
            const index = this.customerBuyList.findIndex(item => item.id === this.currentProject.id);
            if (index !== -1) {
                this.customerBuyList[index].remain = this.formData.totalCount;
                // 同时更新 customerBuyMap 中的对应数据（保持数据一致性）
                const customerId = this.customerListNoManager.find(c => c.name === this.selectedCustomersName)?.id;
                if (customerId && this.customerBuyMap[customerId]) {
                    const mapItem = this.customerBuyMap[customerId].find(i => i.id === this.currentProject.id);
                    if (mapItem) mapItem.remain = this.formData.totalCount;
                }
            }
            if (this.$message) this.$message.success('续费成功');
            this.dialogVisible = false;
        },
        handleSearchCustomer() {
            const name = this.searchCustomerName.trim();
            if (name === '') {
                // 恢复原始数据（需要备份）
                this.customerListNoManager = [...this.originalCustomerList];
                return;
            }
            const newList = this.originalCustomerList.filter(item => item.name.includes(name));
            this.customerListNoManager = newList;
        },
        handleLeftSelect(selection) {
            this.selectedLeftCustomers = selection;
        },
        handleRightSelect(selection) {
            console.log('右侧选中', selection);
        }
    },
}

</script>

<style scoped>
/* 全局基础 */
* {
  box-sizing: border-box;
}

/* 页面整体间距 */
.el-row {
  margin-bottom: 20px;
}

/* 搜索栏整体往下移 */
.el-row:first-child {
  margin-top: 12px;
}

/* 输入框宽度 */
.el-input {
  width: 100%;
}

/* 按钮间距统一 */
.el-button {
  margin-right: 8px;
}

/* 左右卡片容器 */
.table-left,
.table-right {
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 22px;
  border-radius: 10px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
}

/* 标题美化 */
h3 {
  margin: 0 0 18px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-left: 10px;
  border-left: 4px solid #409eff;
  line-height: 1.4;
}

/* 右侧添加按钮间距 */
.table-right .el-col {
  margin-bottom: 14px;
}

/* 表格优化 */
.el-table {
  --el-table-header-text-color: #444;
  --el-table-row-hover-bg-color: #f8f9fa;
  margin-bottom: 16px;
}

/* 分页居中 */
.pagination-box {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* 弹窗表单间距 */
.el-form-item {
  margin-bottom: 16px;
}
</style>