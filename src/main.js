import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// PRD原型标注系统
import './utils/annotation.js'
