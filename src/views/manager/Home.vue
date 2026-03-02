<template>
  <div class="home-container">
    <!-- 欢迎卡片 - 仪表盘风格 -->
    <div class="welcome-dashboard">
      <div class="welcome-left">
        <div class="welcome-main">欢迎您，{{ data.user.name }}</div>
        <div class="welcome-subtitle">荆州学院 · {{ getChineseDate() }}</div>
        <div class="welcome-greeting">{{ getProfessionalGreeting() }}</div>
      </div>
      <div class="welcome-right">
        <div class="flip-clock">
          <div class="flip-unit">
            <div class="flip-digit" :data-value="data.hours">
              <div class="flip-card" :class="{ flipping: data.hoursFlipping }">
                <div class="flip-card-front">{{ data.displayHours }}</div>
                <div class="flip-card-back">{{ data.nextHours }}</div>
              </div>
            </div>
          </div>
          <div class="flip-separator">:</div>
          <div class="flip-unit">
            <div class="flip-digit" :data-value="data.minutes">
              <div class="flip-card" :class="{ flipping: data.minutesFlipping }">
                <div class="flip-card-front">{{ data.displayMinutes }}</div>
                <div class="flip-card-back">{{ data.nextMinutes }}</div>
              </div>
            </div>
          </div>
          <div class="flip-separator">:</div>
          <div class="flip-unit">
            <div class="flip-digit" :data-value="data.seconds">
              <div class="flip-card" :class="{ flipping: data.secondsFlipping }">
                <div class="flip-card-front">{{ data.displaySeconds }}</div>
                <div class="flip-card-back">{{ data.nextSeconds }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-container">
      <div class="stat-card" v-for="(item, index) in data.statsCards" :key="index">
        <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
          <el-icon :size="24" :color="'white'">
            <component :is="item.icon"></component>
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 学院人数统计图 -->
      <div class="chart-card">
        <div class="card-header">
          <div class="card-title"><el-icon><PieChart /></el-icon> 学院学生人数分布</div>
          <el-button type="primary" link @click="loadCollegeStats">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
        <div class="chart-container" ref="collegeChartRef"></div>
      </div>

      <!-- 课程选课人数统计 -->
      <div class="chart-card">
        <div class="card-header">
          <div class="card-title"><el-icon><Histogram /></el-icon> 热门课程选课统计</div>
          <el-button type="primary" link @click="loadCourseStats">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
        <div class="chart-container" ref="courseChartRef"></div>
      </div>
    </div>

    <!-- 公告区域 -->
    <div class="notice-card">
      <div class="card-header">
        <div class="card-title"><el-icon><Bell /></el-icon> 系统公告</div>
        <el-button type="primary" link @click="loadNotice">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
      <div class="notice-scroll-container">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in data.noticeData"
            :key="index"
            :timestamp="item.time"
            :color="getTimelineColor(index)"
          >
            <div class="notice-content">{{ item.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import * as echarts from 'echarts';
import { 
  User, Bell, PieChart, Histogram, Refresh, 
  Collection, Reading, School, Medal, Clock
} from '@element-plus/icons-vue';

// 定义图表实例引用
const collegeChartRef = ref(null);
const courseChartRef = ref(null);
let collegeChart = null;
let courseChart = null;

// 定义响应式数据
const data = reactive({
  user: JSON.parse(localStorage.getItem('system-user') || '{}'),
  noticeData: [],
  collegeStats: [],
  courseStats: [],
  currentTime: '',
  hours: 0,
  minutes: 0,
  seconds: 0,
  displayHours: '00',
  displayMinutes: '00',
  displaySeconds: '00',
  nextHours: '00',
  nextMinutes: '00',
  nextSeconds: '00',
  hoursFlipping: false,
  minutesFlipping: false,
  secondsFlipping: false,
  statsCards: [
    { title: '学生总数', value: 0, icon: 'User', bgColor: '#1e88e5' },
    { title: '课程总数', value: 0, icon: 'Reading', bgColor: '#43a047' },
    { title: '学院总数', value: 0, icon: 'School', bgColor: '#fb8c00' },
    { title: '选课总数', value: 0, icon: 'Collection', bgColor: '#e53935' }
  ]
});

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了，注意休息';
  if (hour < 9) return '早上好，新的一天';
  if (hour < 12) return '上午好，状态很棒';
  if (hour < 14) return '中午好，注意休息';
  if (hour < 17) return '下午好，继续加油';
  if (hour < 19) return '傍晚好，辛苦了';
  if (hour < 22) return '晚上好，放松一下';
  return '夜深了，注意休息';
};

// 获取中文日期格式
const getChineseDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
};

// 获取专业问候语
const getProfessionalGreeting = () => {
  const hour = new Date().getHours();
  const isStudent = data.user.role === 'STUDENT';
  
  if (hour < 9) {
    return isStudent ? '早上好，祝您今天学习顺利' : '早上好，祝您今天工作顺利';
  }
  if (hour < 12) {
    return isStudent ? '上午好，祝您今天学习顺利' : '上午好，祝您今天工作顺利';
  }
  if (hour < 14) {
    return '中午好，注意休息';
  }
  if (hour < 17) {
    return isStudent ? '下午好，祝您今天学习愉快' : '下午好，祝您今天工作顺利';
  }
  if (hour < 19) {
    return isStudent ? '傍晚好，今天辛苦了' : '傍晚好，辛苦了';
  }
  if (hour < 22) {
    return isStudent ? '晚上好，注意休息' : '晚上好，注意休息';
  }
  return '夜深了，注意休息';
};

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取星期
const getWeekDay = () => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[new Date().getDay()];
};

// 更新翻页时钟
const updateFlipClock = () => {
  const now = new Date();
  const newHours = now.getHours();
  const newMinutes = now.getMinutes();
  const newSeconds = now.getSeconds();
  
  // 格式化显示
  data.displayHours = String(data.hours).padStart(2, '0');
  data.displayMinutes = String(data.minutes).padStart(2, '0');
  data.displaySeconds = String(data.seconds).padStart(2, '0');
  
  data.nextHours = String(newHours).padStart(2, '0');
  data.nextMinutes = String(newMinutes).padStart(2, '0');
  data.nextSeconds = String(newSeconds).padStart(2, '0');
  
  // 检查是否需要翻页
  if (newHours !== data.hours) {
    data.hoursFlipping = true;
    setTimeout(() => {
      data.hoursFlipping = false;
      data.hours = newHours;
    }, 600);
  }
  
  if (newMinutes !== data.minutes) {
    data.minutesFlipping = true;
    setTimeout(() => {
      data.minutesFlipping = false;
      data.minutes = newMinutes;
    }, 600);
  }
  
  if (newSeconds !== data.seconds) {
    data.secondsFlipping = true;
    setTimeout(() => {
      data.secondsFlipping = false;
      data.seconds = newSeconds;
    }, 600);
  }
};

// 定时器引用
let flipTimer = null;

// 获取时间线颜色
const getTimelineColor = (index) => {
  const colors = ['#1e88e5', '#43a047', '#fb8c00', '#e53935', '#5e35b1'];
  return colors[index % colors.length];
};

// 初始化学院图表
const initCollegeChart = () => {
  if (collegeChart) {
    collegeChart.dispose();
  }
  
  collegeChart = echarts.init(collegeChartRef.value);
  collegeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.collegeStats.map(item => item.name)
    },
    series: [
      {
        name: '学院人数',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.collegeStats.map(item => ({
          name: item.name,
          value: item.count
        }))
      }
    ]
  });
  
  window.addEventListener('resize', () => {
    collegeChart.resize();
  });
};

// 初始化课程图表
const initCourseChart = () => {
  if (courseChart) {
    courseChart.dispose();
  }
  
  courseChart = echarts.init(courseChartRef.value);
  courseChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: data.courseStats.map(item => item.name)
    },
    series: [
      {
        name: '选课人数',
        type: 'bar',
        data: data.courseStats.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  });
  
  window.addEventListener('resize', () => {
    courseChart.resize();
  });
};

// 加载公告数据
const loadNotice = () => {
  request.get('/notice/selectAll').then(res => {
    if (res.code === '200') {
      data.noticeData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

// 加载学院统计数据
const loadCollegeStats = () => {
  request.get('/student/collegeCount').then(res => {
    if (res.code === '200') {
      data.collegeStats = res.data;
      initCollegeChart();
    } else {
      ElMessage.error(res.msg || '获取学院统计数据失败');
    }
  }).catch(() => {
    // 如果接口不存在，使用模拟数据
    data.collegeStats = [
      { name: '计算机学院', count: 120 },
      { name: '电子信息学院', count: 80 },
      { name: '数学学院', count: 65 },
      { name: '物理学院', count: 50 },
      { name: '化学学院', count: 45 }
    ];
    initCollegeChart();
  });
};

// 加载课程统计数据
const loadCourseStats = () => {
  request.get('/course/choiceCount').then(res => {
    if (res.code === '200') {
      data.courseStats = res.data.slice(0, 7); // 只取前7条
      initCourseChart();
    } else {
      ElMessage.error(res.msg || '获取课程统计数据失败');
    }
  }).catch(() => {
    // 如果接口不存在，使用模拟数据
    data.courseStats = [
      { name: '高等数学', count: 96 },
      { name: '大学英语', count: 85 },
      { name: '计算机基础', count: 75 },
      { name: '数据结构', count: 68 },
      { name: '操作系统', count: 45 },
      { name: '计算机网络', count: 42 },
      { name: '软件工程', count: 32 }
    ];
    initCourseChart();
  });
};

// 加载统计卡片数据
const loadStatsCardData = () => {
  // 学生总数
  request.get('/student/count').then(res => {
    if (res.code === '200') {
      data.statsCards[0].value = res.data || 0;
    }
  }).catch(() => {
    data.statsCards[0].value = 328;  // 模拟数据
  });
  
  // 课程总数
  request.get('/course/count').then(res => {
    if (res.code === '200') {
      data.statsCards[1].value = res.data || 0;
    }
  }).catch(() => {
    data.statsCards[1].value = 42;  // 模拟数据
  });
  
  // 学院总数
  request.get('/college/count').then(res => {
    if (res.code === '200') {
      data.statsCards[2].value = res.data || 0;
    }
  }).catch(() => {
    data.statsCards[2].value = 8;  // 模拟数据
  });
  
  // 选课总数
  request.get('/choice/count').then(res => {
    if (res.code === '200') {
      data.statsCards[3].value = res.data || 0;
    }
  }).catch(() => {
    data.statsCards[3].value = 645;  // 模拟数据
  });
};

// 生命周期钩子：挂载后
onMounted(() => {
  // 初始化翻页时钟
  updateFlipClock();
  flipTimer = setInterval(updateFlipClock, 1000);
  
  loadNotice();
  loadCollegeStats();
  loadCourseStats();
  loadStatsCardData();
});

// 生命周期钩子：卸载前
onBeforeUnmount(() => {
  if (flipTimer) {
    clearInterval(flipTimer); // 清理翻页时钟定时器
  }
  
  if (collegeChart) {
    collegeChart.dispose();
  }
  if (courseChart) {
    courseChart.dispose();
  }
  window.removeEventListener('resize', () => {
    if (collegeChart) collegeChart.resize();
    if (courseChart) courseChart.resize();
  });
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 15px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏主容器滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏主容器滚动条 - Chrome, Safari and Opera */
.home-container::-webkit-scrollbar {
  display: none;
}

/* 欢迎卡片 - 仪表盘风格 */
.welcome-dashboard {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.welcome-left {
  flex: 1;
}

.welcome-main {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.welcome-greeting {
  font-size: 14px;
  color: #999;
}

.welcome-right {
  display: flex;
  align-items: center;
}

/* 翻页时钟样式 */
.flip-clock {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2c3e50;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flip-unit {
  position: relative;
  width: 40px;
  height: 60px;
  perspective: 200px;
}

.flip-digit {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: white;
  background: #34495e;
  border-radius: 4px;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
}

.flip-card-back {
  transform: rotateX(180deg);
}

.flip-card.flipping {
  animation: flip 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes flip {
  0% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-90deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}

.flip-separator {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 4px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

/* 统计卡片样式 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.card-title .el-icon {
  margin-right: 6px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 公告卡片样式 */
.notice-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.notice-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  /* 隐藏公告容器滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏公告容器滚动条 - Chrome, Safari and Opera */
.notice-scroll-container::-webkit-scrollbar {
  display: none;
}

.notice-content {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  line-height: 1.5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.notice-content:hover {
  transform: translateX(5px);
  background-color: #f0f7ff;
}

/* 适配小屏幕 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>