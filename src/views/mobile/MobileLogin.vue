<template>
  <div class="mobile-login">
    <div class="login-header">
      <div class="logo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="8" fill="#1890FF"/>
          <path d="M16 20H24V28H16V20ZM16 32H32V36H16V32Z" fill="white"/>
        </svg>
      </div>
      <h1>城运街道</h1>
      <p>网格化治理平台</p>
    </div>
    
    <div class="login-form">
      <el-form :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="login-footer">
      <span>© 2024 城运街道办事处</span>
      <span class="pc-link" @click="goPC">后台管理入口</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  if (form.username === 'admin' && form.password === 'admin') {
    sessionStorage.setItem('user', JSON.stringify({ username: form.username }))
    router.push('/mobile/checkin')
  } else {
    ElMessage.error('用户名或密码错误')
  }
}

const goPC = () => {
  router.push('/login')
}
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 30px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.pc-link {
  display: block;
  margin-top: 12px;
  color: white;
}
</style>
