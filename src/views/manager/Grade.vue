<template>
  <div class="grade-container">
    <!-- 搜索区域 -->
    <div class="search-card">
      <div class="search-title">
        <el-icon><Document /></el-icon>
        <span>成绩管理</span>
      </div>
      <div class="search-content">
        <el-select 
          v-model="data.courseId" 
          placeholder="请选择课程" 
          clearable
          class="search-input"
          @change="load"
        >
          <el-option
            v-for="item in data.courseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <div class="search-buttons">
          <el-button type="primary" @click="load">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <el-icon><List /></el-icon>
          <span>学生列表</span>
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
        empty-text="暂无数据"
      >
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="collegeName" label="学院" width="150" />
        <el-table-column prop="specialityName" label="专业" width="150" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="usualScore" label="平时成绩" width="100" />
        <el-table-column prop="examScore" label="考试成绩" width="100" />
        <el-table-column prop="totalScore" label="总成绩" width="100" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleAddGrade(scope.row)"
            >
              录入成绩
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 录入成绩弹窗 -->
    <el-dialog 
      v-model="data.dialogVisible" 
      title="录入成绩" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="data.form" 
        :rules="data.rules" 
        ref="formRef" 
        label-width="100px"
      >
        <el-form-item label="学生姓名">
          <el-input v-model="data.form.studentName" disabled />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="data.form.studentNo" disabled />
        </el-form-item>
        <el-form-item label="平时成绩" prop="usualScore">
          <el-input-number 
            v-model="data.form.usualScore" 
            :min="0" 
            :max="100"
            placeholder="请输入平时成绩"
          />
        </el-form-item>
        <el-form-item label="考试成绩" prop="examScore">
          <el-input-number 
            v-model="data.form.examScore" 
            :min="0" 
            :max="100"
            placeholder="请输入考试成绩"
          />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="data.form.semester" placeholder="请选择学期">
            <el-option label="第一学期" value="第一学期" />
            <el-option label="第二学期" value="第二学期" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, List, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

const formRef = ref()

const data = reactive({
  courseId: null,
  courseList: [],
  tableData: [],
  dialogVisible: false,
  form: {
    studentId: null,
    studentName: '',
    studentNo: '',
    courseId: null,
    usualScore: null,
    examScore: null,
    semester: ''
  },
  rules: {
    usualScore: [
      { required: true, message: '请输入平时成绩', trigger: 'blur' }
    ],
    examScore: [
      { required: true, message: '请输入考试成绩', trigger: 'blur' }
    ],
    semester: [
      { required: true, message: '请选择学期', trigger: 'change' }
    ]
  }
})

// 加载课程列表
const loadCourses = () => {
  request.get('/course/list').then(res => {
    if (res.code === '200') {
      data.courseList = res.data
    } else {
      ElMessage.error(res.msg || '获取课程列表失败')
    }
  })
}

// 加载学生列表
const load = () => {
  if (!data.courseId) {
    ElMessage.warning('请先选择课程')
    return
  }
  
  request.get(`/choice/students/${data.courseId}`).then(res => {
    if (res.code === '200') {
      data.tableData = res.data || []
    } else {
      ElMessage.error(res.msg || '获取学生列表失败')
    }
  })
}

// 打开录入成绩弹窗
const handleAddGrade = (row) => {
  data.form = {
    studentId: row.id,
    studentName: row.name,
    studentNo: row.studentNo,
    courseId: data.courseId,
    usualScore: row.usualScore || null,
    examScore: row.examScore || null,
    semester: row.semester || ''
  }
  data.dialogVisible = true
}

// 提交成绩
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/grade/add', data.form).then(res => {
        if (res.code === '200') {
          ElMessage.success('成绩录入成功')
          data.dialogVisible = false
          load() // 刷新列表
        } else {
          ElMessage.error(res.msg || '成绩录入失败')
        }
      })
    }
  })
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.grade-container {
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
  width: 300px;
}

.search-buttons {
  display: flex;
  gap: 10px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
