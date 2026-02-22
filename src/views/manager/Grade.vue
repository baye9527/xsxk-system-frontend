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
        <div class="table-buttons">
          <el-button type="success" @click="handleImportExcel">
            <el-icon><Upload /></el-icon>
            <span>Excel导入成绩</span>
          </el-button>
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
        <el-table-column prop="studentName" label="姓名" width="100" />
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
          <el-select v-model="data.form.semesterDisplay" placeholder="请选择学期" @change="handleSemesterChange">
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

    <!-- Excel导入弹窗 -->
    <el-dialog 
      v-model="data.importDialogVisible" 
      title="Excel导入成绩" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="data.importForm" 
        :rules="data.importRules" 
        ref="importFormRef" 
        label-width="100px"
      >
        <el-form-item label="选择课程" prop="courseId">
          <el-select 
            v-model="data.importForm.courseId" 
            placeholder="请选择课程" 
            style="width: 100%"
          >
            <el-option
              v-for="item in data.courseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择学期" prop="semesterDisplay">
          <el-select 
            v-model="data.importForm.semesterDisplay" 
            placeholder="请选择学期" 
            @change="handleImportSemesterChange"
            style="width: 100%"
          >
            <el-option label="第一学期" value="第一学期" />
            <el-option label="第二学期" value="第二学期" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Excel文件" prop="file">
          <input 
            ref="fileInput"
            type="file"
            accept=".xls,.xlsx"
            @change="handleFileInputChange"
            style="display: none"
          />
          <el-button type="primary" @click="$refs.fileInput.click()">
            选择文件
          </el-button>
          <div v-if="data.importForm.file" style="margin-top: 10px; color: #606266;">
            已选择文件: {{ data.importForm.file.name }}
            <el-button type="text" @click="handleFileRemove" style="margin-left: 10px;">
              移除
            </el-button>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xls/xlsx 文件，且不超过 10MB
            </div>
          </template>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport" :loading="data.importLoading">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, List, Document, Upload } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const formRef = ref()
const importFormRef = ref()
const uploadRef = ref()
const userStore = useUserStore()

const data = reactive({
  courseId: null,
  courseList: [],
  tableData: [],
  dialogVisible: false,
  importDialogVisible: false,
  importLoading: false,
  currentAcademicYear: '2024-2025', // 当前学年
  form: {
    choiceId: null, // 选课记录ID
    studentId: null,
    studentName: '',
    studentNo: '',
    courseId: null,
    usualScore: null,
    examScore: null,
    semesterDisplay: '', // 显示用的学期（第一学期/第二学期）
    semester: '' // 提交给后端的完整学期（2024-2025-1/2024-2025-2）
  },
  importForm: {
    courseId: null,
    semesterDisplay: '',
    semester: '',
    file: null
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
  },
  importRules: {
    courseId: [
      { required: true, message: '请选择课程', trigger: 'change' }
    ],
    semesterDisplay: [
      { required: true, message: '请选择学期', trigger: 'change' }
    ],
    file: [
      { required: true, message: '请选择Excel文件', trigger: 'change' }
    ]
  }
})

// 加载课程列表
const loadCourses = () => {
  // 使用现有的分页接口获取教师课程列表
  request.get(`/course/selectPage?teacherId=${userStore.teacherId}&pageNum=1&pageSize=100`).then(res => {
    if (res.code === '200') {
      // 根据实际接口返回，课程列表在 data.list 中
      data.courseList = res.data?.list || []
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
  
  request.get(`/choice/selectStudentsByCourseId/${data.courseId}`).then(res => {
    if (res.code === '200') {
      data.tableData = res.data || []
    } else {
      ElMessage.error(res.msg || '获取学生列表失败')
    }
  })
}

// 处理学期选择变化
const handleSemesterChange = (value) => {
  if (value === '第一学期') {
    data.form.semester = `${data.currentAcademicYear}-1`
  } else if (value === '第二学期') {
    data.form.semester = `${data.currentAcademicYear}-2`
  }
}

// 计算总成绩
const calculateTotalScore = () => {
  if (data.form.usualScore !== null && data.form.examScore !== null) {
    // 总成绩 = 平时成绩 + 考试成绩
    return data.form.usualScore + data.form.examScore
  }
  return null
}

// 打开Excel导入弹窗
const handleImportExcel = () => {
  data.importForm = {
    courseId: data.courseId, // 默认选择当前课程
    semesterDisplay: '',
    semester: '',
    file: null
  }
  data.importDialogVisible = true
}

// 处理导入学期选择变化
const handleImportSemesterChange = (value) => {
  if (value === '第一学期') {
    data.importForm.semester = `${data.currentAcademicYear}-1`
  } else if (value === '第二学期') {
    data.importForm.semester = `${data.currentAcademicYear}-2`
  }
}

// 处理文件选择
const handleFileInputChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 检查文件类型
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/i)) {
      ElMessage.error('请选择Excel文件（.xls或.xlsx格式）')
      event.target.value = ''
      return
    }
    
    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过10MB')
      event.target.value = ''
      return
    }
    
    data.importForm.file = file
  } else {
    data.importForm.file = null
  }
}

// 处理文件移除
const handleFileRemove = () => {
  data.importForm.file = null
  if (document.querySelector('input[type="file"]')) {
    document.querySelector('input[type="file"]').value = ''
  }
}

// 提交Excel导入
const submitImport = () => {
  importFormRef.value.validate((valid) => {
    if (valid) {
      if (!data.importForm.file) {
        ElMessage.error('请选择Excel文件')
        return
      }
      
      data.importLoading = true
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', data.importForm.file)
      formData.append('courseId', data.importForm.courseId)
      formData.append('semester', data.importForm.semester)
      
      // 使用原生XMLHttpRequest确保正确的multipart格式
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'http://localhost:9091/score/import', true)
      
      xhr.onload = function() {
        data.importLoading = false
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.code === '200') {
              ElMessage.success('导入成功')
              data.importDialogVisible = false
              load() // 刷新学生成绩列表
            } else {
              ElMessage.error(response.msg || '导入失败')
            }
          } catch (e) {
            ElMessage.error('导入失败，响应格式错误')
          }
        } else {
          ElMessage.error('导入失败，服务器错误')
        }
      }
      
      xhr.onerror = function() {
        data.importLoading = false
        ElMessage.error('导入失败，网络错误')
      }
      
      // 发送FormData，让浏览器自动设置Content-Type
      xhr.send(formData)
    }
  })
}

// 打开录入成绩弹窗
const handleAddGrade = (row) => {
  data.form = {
    choiceId: row.choiceId, // 使用choiceId作为标识
    studentId: row.studentId,
    studentName: row.studentName,
    studentNo: row.studentNo,
    courseId: data.courseId,
    usualScore: row.usualScore || null,
    examScore: row.examScore || null,
    semesterDisplay: '', // 重置显示值
    semester: '' // 重置提交值
  }
  data.dialogVisible = true
}

// 提交成绩
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 自动计算总成绩
      const totalScore = calculateTotalScore()
      const submitData = {
        choiceId: data.form.choiceId, // 修正：使用choiceId作为标识
        usualScore: data.form.usualScore,
        examScore: data.form.examScore,
        totalScore: totalScore,
        semester: data.form.semester
      }
      
      request.post('/score/batchUpdate', [submitData]).then(res => {
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

.table-buttons {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style>
