<template>
    <div>
        <div>
            <el-row :gutter="8">
                <el-col :span="20">
                    <el-input v-model="searchCustomerName" placeholder="输入护理项目名称"></el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="handleSearchCustomer">查询</el-button>
                    <el-button type="default" @click="$router.back()">返回</el-button>
                </el-col>
            </el-row>
        </div>

        <!-- 上方：已购护理项目 -->
        <el-row :gutter="40">
            <el-col :span="24">
                <div class="table-left">
                    <h3>已购护理项目</h3>
                    <el-table :data="customerBuyList" stripe @selection-change="handleLeftSelect">
                        <el-table-column prop="id" label="序号" width="80"></el-table-column>
                        <el-table-column prop="projectId" label="护理项目编号" width="120"></el-table-column>
                        <el-table-column prop="projectName" label="护理项目名称" width="120"></el-table-column>
                        <el-table-column prop="price" label="价格" width="100"></el-table-column>
                        <el-table-column prop="weekTimes" label="执行周次" width="100"></el-table-column>
                        <el-table-column prop="execTimes" label="执行次数" width="100"></el-table-column>
                        <!-- <el-table-column prop="remark" label="备注" width="100"></el-table-column> -->

                    </el-table>
                </div>
            </el-col>
        </el-row>

        <!-- 下方：客户信息 -->
        <el-row :gutter="40">
            <el-col :span="24">
                <div class="table-right">
                    <h3>护理项目</h3>
                    <el-table :data="customerListNoManager" stripe @selection-change="handleRightSelect">
                        <el-table-column type="selection" width="55"></el-table-column>
                        <el-table-column prop="id" label="序号" width="80"></el-table-column>
                        <el-table-column prop="customerCode" label="编号" width="120"></el-table-column>
                        <el-table-column prop="name" label="名称" width="120"></el-table-column>
                        <el-table-column prop="buyNum" label="服务购买次数" width="120"></el-table-column>
                        <el-table-column prop="level" label="购买数量" width="100"></el-table-column>
                        <el-table-column prop="expireTime" label="服务到期时间" width="120"></el-table-column>

                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeCustomer(scope.row)">移除</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button size="small" @click="addProject(scope.row)">添加</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedCustomerId: null,  // 记录当前选中的客户ID
            searchCustomerName: '',  // 搜索关键词
            selectedCustomersName: '客户',  // 选中的客户名称
            customerBuyList: [],// 左侧表格数据 - 已购护理项目
            nextProjectId: 9,   // 根据当前最大id(8) +1，用于添加新项目时自增id

            customerBuyMap: {
                1: [  // 张三
                    { id: 1, projectId: "XM001", projectName: "基础护理套餐", price: "299.00", weekTimes: "每周3次", execTimes: 8, remark: "" },
                    { id: 2, projectId: "XM003", projectName: "心理疏导咨询", price: "199.00", weekTimes: "每周2次", execTimes: 12, remark: "" }
                ],
                2: [  // 李四
                    { id: 3, projectId: "XM002", projectName: "康复理疗服务", price: "499.00", weekTimes: "每周1次", execTimes: 5, remark: "" }
                ],
                3: [  // 王五
                    { id: 4, projectId: "XM004", projectName: "营养膳食定制", price: "399.00", weekTimes: "每周2次", execTimes: 3, remark: "" },
                    { id: 5, projectId: "XM005", projectName: "24小时陪护", price: "899.00", weekTimes: "每周7次", execTimes: 2, remark: "" }
                ],
                4: [  // 赵六
                    { id: 6, projectId: "XM006", projectName: "中医养生调理", price: "599.00", weekTimes: "每周1次", execTimes: 6, remark: "" }
                ],
                5: [  // 钱七
                    { id: 7, projectId: "XM007", projectName: "康复训练指导", price: "349.00", weekTimes: "每周3次", execTimes: 4, remark: "" },
                    { id: 8, projectId: "XM001", projectName: "基础护理套餐", price: "299.00", weekTimes: "每周3次", execTimes: 10, remark: "续费" }
                ]
            },

            // customerBuyList: [
            //     {
            //         id: 1,
            //         projectId: "HL001",
            //         projectName: "基础护理",
            //         price: "200",
            //         weekTimes: "每周3次",
            //         execTimes: 12,
            //         remark: "常规护理"
            //     },
            //     {
            //         id: 2,
            //         projectId: "HL002",
            //         projectName: "康复按摩",
            //         price: "350",
            //         weekTimes: "每周2次",
            //         execTimes: 8,
            //         remark: ""
            //     }
            // ],

            // 右侧表格数据 - 客户列表
            customerListNoManager: [
                {
                    id: 1,
                    customerCode: "KH2026001",
                    name: "基础护理",
                    buyNum: 1,
                    expireTime: "2026-12-31",
                    level: "一级护理"
                },
                {
                    id: 2,
                    customerCode: "KH2026002",
                    name: "史诗护理",
                    buyNum: 1,
                    expireTime: "2026-10-20",
                    level: "二级护理"
                }
            ],
            // ② 项目库（可添加的护理项目列表），字段与上方表格一致
            projectLibrary: [
                { id: 101, code: "KH2026001", name: "基础护理", price: "200.00", weekTimes: "每周3次", execTimes: 12 },
                { id: 102, code: "KH2026002", name: "史诗护理", price: "350.00", weekTimes: "每周2次", execTimes: 8 }

            ],

            // 选中项缓存
            leftSelectList: [],
            rightSelectList: []
        }
    },
    mounted() {
        // ④ 在 mounted 生命周期中接收路由参数
        const customerId = this.$route.query.customerId;
        if (customerId) {
            this.selectedCustomerId = parseInt(customerId);
            // ⑤ 根据客户ID加载对应的已购项目列表
            const projects = this.customerBuyMap[this.selectedCustomerId];
            if (projects) {
                this.customerBuyList = projects;
                // 可选：同时更新客户名称（如果映射表中没有，可从其他途径获取）
                this.selectedCustomersName = `客户${this.selectedCustomerId}`;
            } else {
                this.customerBuyList = [];
            }
        }
    },
    methods: {
        addProject(item) {
            // 简单组装上表格需要的字段
            const newProject = {
                id: Date.now(),
                projectId: item.customerCode,
                projectName: item.name,
                price: item.level,
                weekTimes: "每周1次",
                execTimes: item.buyNum
            };
            // 直接添加到上方【已购护理项目】表格
            this.customerBuyList.push(newProject);

            // 可选：同步缓存（你原来的map保留，不删）
            if (this.selectedCustomerId) {
                if (!this.customerBuyMap[this.selectedCustomerId]) {
                    this.customerBuyMap[this.selectedCustomerId] = [];
                }
                this.customerBuyMap[this.selectedCustomerId].push(newProject);
            }

            this.$message.success("添加成功");
        },
        // 查询护理项目
        handleSearchCustomer() {
            const name = this.searchCustomerName.trim();
            if (name === '') {
                // 恢复全部数据（需要备份原始数据）
                return;
            }
            const newList = this.customerBuyList.filter(item =>
                item.projectName.includes(name)
            );
            this.customerBuyList = newList;
        },

        // // 查看客户已购项目
        // viewCustomerProjects(customer) {
        //     this.customerBuyList = this.customerBuyMap[customer.id] || [];
        //     // 这里可以根据 customer.id 加载对应的项目列表
        //     this.selectedCustomersName = customer.name;
        //     this.selectedCustomerId = customer.id;   // 记录客户ID
        // },



        // 移除客户
        removeCustomer(row) {
            this.customerListNoManager = this.customerListNoManager.filter(
                item => item.id !== row.id
            );
            console.log('移除客户:', row);
        },

        // 左侧表格选中变化
        handleLeftSelect(selection) {
            this.leftSelectList = selection;
            console.log('左侧选中:', selection);
        },

        // 右侧表格选中变化
        handleRightSelect(selection) {
            this.rightSelectList = selection;
            console.log('右侧选中:', selection);
        }
    }
}
</script>
<style scoped>
.el-row:first-of-type {
  margin-top: 10px;
}
/* 全局基础样式 */
* {
  box-sizing: border-box;
}

/* 页面整体间距 */
.el-row {
  margin-bottom: 20px;
}

/* 搜索栏样式 */
.el-input {
  width: 100%;
}

/* 按钮统一间距 */
.el-button {
  margin-right: 8px;
}

/* 卡片容器 */
.table-left,
.table-right {
  border: 1px solid #ebeef5;
  padding: 22px;
  border-radius: 10px;
  background-color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.06);
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

/* 表格样式优化 */
.el-table {
  --el-table-header-text-color: #555;
  --el-table-row-hover-bg-color: #f8f9fa;
}

/* 分页居中 */
.pagination-box {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>