// 模拟后端API，伪造床位、客户、楼层数据
// 固定楼栋：606，楼层：1-6层，每层12个房间
// 1-3层：双人间（2床/间），4-5层：单人间（1床/间），6层：高级护理间（1床/间）

// 模拟数据库数据
const mockFloors = [
    { id: 1, name: '一层' },
    { id: 2, name: '二层' },
    { id: 3, name: '三层' },
    { id: 4, name: '四层' },
    { id: 5, name: '五层' },
    { id: 6, name: '六层' }
]

// 床位状态：0-空闲，1-有人，2-外出
const mockRooms = []
// 生成每层12个房间
for (let floor = 1; floor <= 6; floor++) {
    for (let room = 1; room <= 12; room++) {
        const roomNo = `${floor}${String(room).padStart(3, '0')}`
        const roomId = (floor - 1) * 12 + room
        const beds = []
        // 1-3层：双人间（2床）
        if (floor <= 3) {
            beds.push(
                { id: roomId * 2 - 1, bedNo: `${roomNo}-1`, status: 0, customerId: null, type: '标准双人间', price: 2600 },
                { id: roomId * 2, bedNo: `${roomNo}-2`, status: 0, customerId: null, type: '标准双人间', price: 2600 }
            )
        }
        // 4-5层：单人间（1床）
        else if (floor <= 5) {
            beds.push(
                { id: roomId, bedNo: `${roomNo}-1`, status: 0, customerId: null, type: '舒适单人间', price: 4200 }
            )
        }
        // 6层：高级护理间（1床）
        else {
            beds.push(
                { id: roomId, bedNo: `${roomNo}-1`, status: 0, customerId: null, type: '高级护理间', price: 6800 }
            )
        }
        mockRooms.push({
            id: roomId,
            floorId: floor,
            roomNo: roomNo,
            beds: beds,
            facilities: ['单人床', '衣柜', '空调', '电视', '呼叫器', '卫生间']
        })
    }
}

// 模拟15个入住客户 + 5个历史客户
const mockCustomers = [
    // 15个当前入住客户
    { id: 1, name: '张三', gender: '男', idCard: '110101194001011234' },
    { id: 2, name: '李四', gender: '女', idCard: '110101194505051234' },
    { id: 3, name: '王五', gender: '男', idCard: '110101193808081234' },
    { id: 4, name: '赵六', gender: '女', idCard: '110101194203031234' },
    { id: 5, name: '毛兰英', gender: '女', idCard: '110101193909091234' },
    { id: 6, name: '孙七', gender: '男', idCard: '110101194102021234' },
    { id: 7, name: '周八', gender: '女', idCard: '110101194304041234' },
    { id: 8, name: '吴九', gender: '男', idCard: '110101193706061234' },
    { id: 9, name: '郑十', gender: '女', idCard: '110101194407071234' },
    { id: 10, name: '钱十一', gender: '男', idCard: '110101193608081234' },
    { id: 11, name: '陈十二', gender: '女', idCard: '110101194609091234' },
    { id: 12, name: '刘十三', gender: '男', idCard: '110101193510101234' },
    { id: 13, name: '杨十四', gender: '女', idCard: '110101194711111234' },
    { id: 14, name: '黄十五', gender: '男', idCard: '110101193412121234' },
    { id: 15, name: '张桂兰', gender: '女', idCard: '110101193303031234' },
    // 5个历史客户
    { id: 16, name: '李十六', gender: '男', idCard: '110101193204041234' },
    { id: 17, name: '王十七', gender: '女', idCard: '110101193105051234' },
    { id: 18, name: '赵十八', gender: '男', idCard: '110101193006061234' },
    { id: 19, name: '孙十九', gender: '女', idCard: '110101192907071234' },
    { id: 20, name: '周二十', gender: '男', idCard: '110101192808081234' }
]

// 床位使用记录（核心业务表）：15个正在使用 + 5个历史
const mockBedRecords = [
    // 15个正在使用的记录
    {
        id: 1, customerId: 1, customerName: '张三', gender: '男',
        bedDetail: '606#1001-1', floorId: 1, roomNo: '1001', bedNo: '1001-1',
        startDate: '2022-01-01', endDate: null, isActive: true
    },
    {
        id: 2, customerId: 2, customerName: '李四', gender: '女',
        bedDetail: '606#1001-2', floorId: 1, roomNo: '1001', bedNo: '1001-2',
        startDate: '2023-01-01', endDate: null, isActive: true
    },
    {
        id: 3, customerId: 3, customerName: '王五', gender: '男',
        bedDetail: '606#1003-1', floorId: 1, roomNo: '1003', bedNo: '1003-1',
        startDate: '2021-05-01', endDate: null, isActive: true, status: 2 // 外出
    },
    {
        id: 4, customerId: 4, customerName: '赵六', gender: '女',
        bedDetail: '606#2001-1', floorId: 2, roomNo: '2001', bedNo: '2001-1',
        startDate: '2022-03-15', endDate: null, isActive: true
    },
    {
        id: 5, customerId: 5, customerName: '毛兰英', gender: '女',
        bedDetail: '606#6005-1', floorId: 6, roomNo: '6005', bedNo: '6005-1',
        startDate: '2023-11-17', endDate: null, isActive: true
    },
    {
        id: 6, customerId: 6, customerName: '孙七', gender: '男',
        bedDetail: '606#2002-1', floorId: 2, roomNo: '2002', bedNo: '2002-1',
        startDate: '2022-06-01', endDate: null, isActive: true
    },
    {
        id: 7, customerId: 7, customerName: '周八', gender: '女',
        bedDetail: '606#3001-1', floorId: 3, roomNo: '3001', bedNo: '3001-1',
        startDate: '2021-09-01', endDate: null, isActive: true
    },
    {
        id: 8, customerId: 8, customerName: '吴九', gender: '男',
        bedDetail: '606#3002-1', floorId: 3, roomNo: '3002', bedNo: '3002-1',
        startDate: '2022-02-15', endDate: null, isActive: true
    },
    {
        id: 9, customerId: 9, customerName: '郑十', gender: '女',
        bedDetail: '606#4001-1', floorId: 4, roomNo: '4001', bedNo: '4001-1',
        startDate: '2023-05-01', endDate: null, isActive: true
    },
    {
        id: 10, customerId: 10, customerName: '钱十一', gender: '男',
        bedDetail: '606#4002-1', floorId: 4, roomNo: '4002', bedNo: '4002-1',
        startDate: '2022-11-01', endDate: null, isActive: true
    },
    {
        id: 11, customerId: 11, customerName: '陈十二', gender: '女',
        bedDetail: '606#5001-1', floorId: 5, roomNo: '5001', bedNo: '5001-1',
        startDate: '2023-03-01', endDate: null, isActive: true
    },
    {
        id: 12, customerId: 12, customerName: '刘十三', gender: '男',
        bedDetail: '606#5002-1', floorId: 5, roomNo: '5002', bedNo: '5002-1',
        startDate: '2021-12-01', endDate: null, isActive: true
    },
    {
        id: 13, customerId: 13, customerName: '杨十四', gender: '女',
        bedDetail: '606#6001-1', floorId: 6, roomNo: '6001', bedNo: '6001-1',
        startDate: '2022-08-01', endDate: null, isActive: true
    },
    {
        id: 14, customerId: 14, customerName: '黄十五', gender: '男',
        bedDetail: '606#6002-1', floorId: 6, roomNo: '6002', bedNo: '6002-1',
        startDate: '2023-02-15', endDate: null, isActive: true
    },
    {
        id: 15, customerId: 15, customerName: '张桂兰', gender: '女',
        bedDetail: '606#1001-1', floorId: 1, roomNo: '1001', bedNo: '1001-1',
        startDate: '2024-01-01', endDate: null, isActive: true
    },
    // 5个历史使用记录
    {
        id: 16, customerId: 16, customerName: '李十六', gender: '男',
        bedDetail: '606#1002-1', floorId: 1, roomNo: '1002', bedNo: '1002-1',
        startDate: '2020-01-01', endDate: '2023-12-31', isActive: false
    },
    {
        id: 17, customerId: 17, customerName: '王十七', gender: '女',
        bedDetail: '606#2003-1', floorId: 2, roomNo: '2003', bedNo: '2003-1',
        startDate: '2021-03-01', endDate: '2024-03-01', isActive: false
    },
    {
        id: 18, customerId: 18, customerName: '赵十八', gender: '男',
        bedDetail: '606#3003-1', floorId: 3, roomNo: '3003', bedNo: '3003-1',
        startDate: '2019-06-01', endDate: '2022-06-01', isActive: false
    },
    {
        id: 19, customerId: 19, customerName: '孙十九', gender: '女',
        bedDetail: '606#4003-1', floorId: 4, roomNo: '4003', bedNo: '4003-1',
        startDate: '2020-09-01', endDate: '2023-09-01', isActive: false
    },
    {
        id: 20, customerId: 20, customerName: '周二十', gender: '男',
        bedDetail: '606#5003-1', floorId: 5, roomNo: '5003', bedNo: '5003-1',
        startDate: '2021-01-01', endDate: '2024-01-01', isActive: false
    }
]

// 同步床位状态（根据入住记录）
mockBedRecords.forEach(record => {
    if (record.isActive) {
        const room = mockRooms.find(r => r.roomNo === record.roomNo)
        if (room) {
            const bed = room.beds.find(b => b.bedNo === record.bedNo)
            if (bed) {
                bed.status = record.status || 1 // 1=有人，2=外出
                bed.customerId = record.customerId
            }
        }
    }
})

// 工具函数：延迟模拟网络请求
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// ==================== API 接口 ====================
// 1. 获取楼层列表
export const getFloorList = async () => {
    await delay()
    return { code: 200, data: mockFloors }
}

// 2. 获取指定楼层的房间&床位列表 + 统计数据
export const getBedMapByFloor = async (floorId) => {
    await delay()
    const rooms = mockRooms.filter(r => r.floorId === floorId)
    let total = 0, free = 0, occupied = 0, out = 0
    rooms.forEach(room => {
        room.beds.forEach(bed => {
            total++
            if (bed.status === 0) free++
            if (bed.status === 1) occupied++
            if (bed.status === 2) out++
        })
    })
    return {
        code: 200,
        data: {
            rooms,
            stats: { total, free, occupied, out }
        }
    }
}

// 3. 获取床位使用记录列表（支持多条件查询）
export const getBedRecordList = async (params) => {
    await delay()
    let list = [...mockBedRecords]
    if (params.name) {
        list = list.filter(item => item.customerName.includes(params.name))
    }
    if (params.startDate) {
        list = list.filter(item => item.startDate >= params.startDate)
    }
    if (params.isActive !== undefined) {
        list = list.filter(item => item.isActive === params.isActive)
    }
    const { page = 1, pageSize = 10 } = params
    const total = list.length
    const data = list.slice((page - 1) * pageSize, page * pageSize)
    return { code: 200, data: { list: data, total } }
}

// 4. 修改床位使用记录（仅修改结束时间）
export const updateBedRecord = async (id, endDate) => {
    await delay()
    const record = mockBedRecords.find(r => r.id === id)
    if (record) {
        record.endDate = endDate
        if (endDate && new Date(endDate) <= new Date()) {
            record.isActive = false
            const bed = mockRooms.find(r => r.roomNo === record.roomNo)?.beds.find(b => b.bedNo === record.bedNo)
            if (bed) bed.status = 0
        }
        return { code: 200, msg: '修改成功' }
    }
    return { code: 500, msg: '记录不存在' }
}

// 5. 床位调换（核心业务）
export const exchangeBed = async (params) => {
    await delay()
    const { recordId, oldBedDetail, newRoomNo, newBedNo, startDate, endDate } = params
    const newBed = mockRooms.find(r => r.roomNo === newRoomNo)?.beds.find(b => b.bedNo === newBedNo)
    if (!newBed || newBed.status !== 0) {
        return { code: 400, msg: '新床位非空闲，无法调换' }
    }
    const today = new Date().toISOString().split('T')[0]
    if (startDate !== today) {
        return { code: 400, msg: '只能当天办理床位调换' }
    }

    const oldRecord = mockBedRecords.find(r => r.id === recordId)
    if (!oldRecord) return { code: 400, msg: '旧床位记录不存在' }

    oldRecord.endDate = today
    oldRecord.isActive = false
    const oldBed = mockRooms.find(r => r.roomNo === oldRecord.roomNo)?.beds.find(b => b.bedNo === oldRecord.bedNo)
    if (oldBed) oldBed.status = 0

    const newRecord = {
        id: mockBedRecords.length + 1,
        customerId: oldRecord.customerId,
        customerName: oldRecord.customerName,
        gender: oldRecord.gender,
        bedDetail: `606#${newRoomNo}-${newBedNo.split('-')[1]}`,
        floorId: Math.floor(Number(newRoomNo) / 1000),
        roomNo: newRoomNo,
        bedNo: newBedNo,
        startDate: startDate,
        endDate: endDate,
        isActive: true
    }
    mockBedRecords.push(newRecord)

    newBed.status = 1
    newBed.customerId = oldRecord.customerId

    return { code: 200, msg: '床位调换成功' }
}

// 6. 获取所有房间（分组：按楼层）
export const getRoomGroupList = async () => {
    await delay()
    const group = []
    mockFloors.forEach(floor => {
        const rooms = mockRooms
            .filter(r => r.floorId === floor.id)
            .map(r => ({ value: r.roomNo, label: r.roomNo }))
        group.push({ label: floor.name, options: rooms })
    })
    return { code: 200, data: group }
}

// 7. 根据房间号获取空闲床位
export const getFreeBedsByRoom = async (roomNo) => {
    await delay()
    const room = mockRooms.find(r => r.roomNo === roomNo)
    if (!room) return { code: 200, data: [] }
    const freeBeds = room.beds
        .filter(b => b.status === 0)
        .map(b => ({ value: b.bedNo, label: b.bedNo, type: b.type, price: b.price }))
    return { code: 200, data: freeBeds }
}

// 8. 根据床位ID获取客户信息
export const getCustomerByBed = async (bedId) => {
    await delay()
    const bed = mockRooms.flatMap(r => r.beds).find(b => b.id === bedId)
    if (!bed || !bed.customerId) return { code: 200, data: null }
    const customer = mockCustomers.find(c => c.id === bed.customerId)
    return { code: 200, data: customer }
}

// 9. 获取所有客户
export const getCustomerList = async () => {
    await delay()
    return { code: 200, data: mockCustomers }
}
export { mockFloors, mockRooms, mockCustomers, mockBedRecords }