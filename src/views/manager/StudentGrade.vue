<template>
  <div class="student-grade-container">
    <!-- 搜索筛选区域 -->
    <div class="search-card">
      <div class="search-title">
        <el-icon><Document /></el-icon>
        <span>成绩查询</span>
      </div>
      <div class="search-content">
        <el-select 
          v-model="data.semester" 
          placeholder="请选择学期" 
          clearable
          class="search-input"
          @change="loadGrades"
        >
          <el-option label="2024-2025-1" value="2024-2025-1" />
          <el-option label="2024-2025-2" value="2024-2025-2" />
          <el-option label="2023-2024-1" value="2023-2024-1" />
          <el-option label="2023-2024-2" value="2023-2024-2" />
        </el-select>
        <div class="search-buttons">
          <el-button type="primary" @click="loadGrades">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="reset">
            <el-icon><RefreshRight /></el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 成绩统计卡片 -->
    <div class="stats-container">
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ data.stats.totalCourses }}</div>
          <div class="stats-label">已修课程数</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ data.stats.averageScore }}</div>
          <div class="stats-label">平均分</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon><CaretTop /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ data.stats.maxScore }}</div>
          <div class="stats-label">最高分</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon><CaretBottom /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ data.stats.minScore }}</div>
          <div class="stats-label">最低分</div>
        </div>
      </div>
    </div>

    <!-- 成绩表格 -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <el-icon><List /></el-icon>
          <span>成绩列表</span>
        </div>
      </div>
      
      <el-table 
        :data="data.tableData" 
        stripe 
        border 
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266',
          fontWeight: 'bold'
        }"
        empty-text="暂无成绩数据"
      >
        <el-table-column prop="courseName" label="课程名称" width="200" />
        <el-table-column prop="usualScore" label="平时成绩" width="100" />
        <el-table-column prop="examScore" label="考试成绩" width="100" />
        <el-table-column prop="score" label="总成绩" width="100">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.score)">
              {{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="courseType" label="课程类型" width="100">
          <template #default="scope">
            <el-tag :type="getCourseTypeTag(scope.row.courseType)">
              {{ scope.row.courseType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="data.pageNum"
          v-model:page-size="data.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="data.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  List, 
  Document, 
  Calendar, 
  TrendCharts, 
  CaretTop, 
  CaretBottom,
  RefreshRight 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const userStore = useUserStore()

const data = reactive({
  semester: '2024-2025-1', // 默认当前学期
  pageNum: 1,
  pageSize: 10,
  total: 0,
  tableData: [],
  stats: {
    totalCourses: 0,
    averageScore: 0,
    maxScore: 0,
    minScore: 0
  }
})

// 加载成绩列表
const loadGrades = () => {
  // TODO: 对接真实接口
  // request.get(`/score/student/${userStore.studentId}`, {
  //   params: {
  //     semester: data.semester,
  //     pageNum: data.pageNum,
  //     pageSize: data.pageSize
  //   }
  // }).then(res => {
  //   if (res.code === '200') {
  //     data.tableData = res.data?.records || []
  //     data.total = res.data?.total || 0
  //     loadStats() // 加载统计数据
  //   } else {
  //     ElMessage.error(res.msg || '获取成绩列表失败')
  //   }
  // })
  
  // 临时占位 - 模拟数据（后续删除）
  console.log('加载成绩列表，学生ID:', userStore.studentId, '学期:', data.semester)
}

// 加载统计数据
const loadStats = () => {
  // TODO: 对接真实接口
  // request.get(`/score/student/${userStore.studentId}/stats`, {
  //   params: {
  //     semester: data.semester
  //   }
  // }).then(res => {
  //   if (res.code === '200') {
  //     data.stats = res.data || {
  //       totalCourses: 0,
  //       averageScore: 0,
  //       maxScore: 0,
  //       minScore: 0
  //     }
  //   }
  // })
  
  // 临时占位
  console.log('加载统计数据')
}

// 重置筛选条件
const reset = () => {
  data.semester = '2024-2025-1'
  data.pageNum = 1
  data.pageSize = 10
  loadGrades()
}

// 分页大小改变
const handleSizeChange = (size) => {
  data.pageSize = size
  data.pageNum = 1
  loadGrades()
}

// 页码改变
const handleCurrentChange = (page) => {
  data.pageNum = page
  loadGrades()
}

// 获取分数样式类
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-pass'
  if (score >= 60) return 'score-min-pass'
  return 'score-fail'
}

// 获取课程类型标签样式
const getCourseTypeTag = (type) => {
  const tagMap = {
    '必修': 'danger',
    '选修': 'warning',
    '实践': 'success',
    '公选': 'info'
  }
  return tagMap[type] || 'info'
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const tagMap = {
    '已通过': 'success',
    '未通过': 'danger',
    '待考试': 'warning',
    '待录入': 'info'
  }
  return tagMap[status] || 'info'
}

onMounted(() => {
  loadGrades()
})
</script>

<style scoped>
.student-grade-container {
  padding: 20px;
}

.search-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.search-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.search-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
}

.search-buttons {
  display: flex;
  gap: 10px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stats-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

.table-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.table-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 分数样式 */
.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-pass {
  color: #e6a23c;
  font-weight: bold;
}

.score-min-pass {
  color: #f56c6c;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .search-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-buttons {
    justify-content: center;
  }
}
</style>
