import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    role: null,
    name: null,
    avatar: null,
    isLoggedIn: false
  }),

  getters: {
    // 获取教师ID（当角色为教师时）
    teacherId: (state) => {
      return state.role === 'TEACHER' ? state.userId : null
    },
    
    // 获取学生ID（当角色为学生时）
    studentId: (state) => {
      return state.role === 'STUDENT' ? state.userId : null
    },
    
    // 获取管理员ID（当角色为管理员时）
    adminId: (state) => {
      return state.role === 'ADMIN' ? state.userId : null
    },
    
    // 检查是否已登录
    isAuthenticated: (state) => {
      return state.isLoggedIn && state.userId && state.role
    }
  },

  actions: {
    // 设置用户信息（登录成功后调用）
    setUser(userData) {
      this.userId = userData.id
      this.role = userData.role
      this.name = userData.name
      this.avatar = userData.avatar || null
      this.isLoggedIn = true
      
      // 持久化到localStorage
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userRole', userData.role)
      localStorage.setItem('userName', userData.name)
      if (userData.avatar) {
        localStorage.setItem('userAvatar', userData.avatar)
      }
      
      // 保存完整用户信息到localStorage（兼容现有代码）
      localStorage.setItem('system-user', JSON.stringify(userData))
    },

    // 从localStorage恢复登录状态
    restoreUser() {
      const userId = localStorage.getItem('userId')
      const role = localStorage.getItem('userRole')
      const name = localStorage.getItem('userName')
      const avatar = localStorage.getItem('userAvatar')
      
      if (userId && role) {
        this.userId = userId
        this.role = role
        this.name = name
        this.avatar = avatar
        this.isLoggedIn = true
        
        // 同时恢复到system-user（兼容现有代码）
        const systemUser = {
          id: userId,
          role: role,
          name: name,
          avatar: avatar
        }
        localStorage.setItem('system-user', JSON.stringify(systemUser))
        
        return true
      }
      return false
    },

    // 清除用户信息（退出登录时调用）
    clearUser() {
      this.userId = null
      this.role = null
      this.name = null
      this.avatar = null
      this.isLoggedIn = false
      
      // 清除localStorage
      localStorage.removeItem('userId')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('system-user')
    },

    // 更新用户信息
    updateUser(userData) {
      if (userData.id) this.userId = userData.id
      if (userData.role) this.role = userData.role
      if (userData.name) this.name = userData.name
      if (userData.avatar !== undefined) this.avatar = userData.avatar
      
      // 更新localStorage
      if (userData.id) localStorage.setItem('userId', userData.id)
      if (userData.role) localStorage.setItem('userRole', userData.role)
      if (userData.name) localStorage.setItem('userName', userData.name)
      if (userData.avatar !== undefined) {
        if (userData.avatar) {
          localStorage.setItem('userAvatar', userData.avatar)
        } else {
          localStorage.removeItem('userAvatar')
        }
      }
      
      // 更新system-user
      const currentUser = JSON.parse(localStorage.getItem('system-user') || '{}')
      const updatedUser = { ...currentUser, ...userData }
      localStorage.setItem('system-user', JSON.stringify(updatedUser))
    }
  }
})
