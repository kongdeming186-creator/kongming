<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="48" height="48" rx="8" fill="#1890FF"/>
            <path d="M16 20H24V28H16V20ZM16 32H32V36H16V32Z" fill="white"/>
          </svg>
        </div>
        <h1>六角亭街道民政系统</h1>
        <p>网格化治理综合平台</p>
      </div>
      
      <el-form ref="loginForm" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名…"
            prefix-icon="User"
            size="large"
            autocomplete="username"
            name="username"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码…"
            prefix-icon="Lock"
            size="large"
            show-password
            autocomplete="current-password"
            name="password"
          />
        </el-form-item>
        
        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input 
              v-model="form.captcha" 
              placeholder="请输入验证码…"
              prefix-icon="CircleCheck"
              size="large"
              autocomplete="off"
              name="captcha"
            />
            <button type="button" class="captcha-img" @click="refreshCaptcha" aria-label="刷新验证码">{{ captcha }}</button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
          <button type="button" class="forgot-link">忘记密码？</button>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <span>© 2024 六角亭街道办事处</span>
        <button type="button" class="mobile-link" @click="goMobile">移动端入口 →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginForm = ref(null)

const form = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const captcha = ref('ABCD')

const refreshCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captcha.value = result
}

const handleLogin = () => {
  loginForm.value.validate((valid) => {
    if (valid) {
      if (form.username === 'admin' && form.password === 'admin') {
        sessionStorage.setItem('user', JSON.stringify({ username: form.username }))
        router.push('/dashboard')
      } else {
        ElMessage.error('用户名或密码错误')
      }
    }
  })
}

const goMobile = () => {
  router.push('/mobile/login')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.captcha-row {
  display: flex;
  gap: 12px;
}

.captcha-img {
  flex-shrink: 0;
  width: 100px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  letter-spacing: 4px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

.mobile-link {
  color: #1890FF;
  cursor: pointer;
}

.forgot-link {
  float: right;
  font-size: 12px;
  color: #999;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.forgot-link:hover {
  color: #1890FF;
}

.mobile-link {
  color: #1890FF;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.mobile-link:hover {
  text-decoration: underline;
}
</style>
