# AI智能报告生成 & AI智能派单 — 落地方案

> 编制日期：2026-08-05
> 适用项目：六角亭街道综合管理平台
> 版本：v1.0

---

## 一、AI智能报告生成

### 1.1 现状分析

| 维度 | 现状 | 问题 |
|------|------|------|
| 报表页面 | [Report.vue](file:///d:/原型/src/views/backend/Report.vue) 468行 | 仅展示固定统计卡片和图表，无分析结论 |
| 数据来源 | 直接import Mock数据 | computed硬编码统计，无时间维度筛选 |
| 导出功能 | `exportReport()` 仅 `ElMessage.success('报表导出成功')` | 无真实导出，无Word/PDF生成 |
| 分析能力 | 无 | 人工看数字，无趋势分析、无异常发现、无建议生成 |
| 报告类型 | 无 | 缺少月报、季报、年报、专项报告等模板 |

### 1.2 目标

用AI自动生成**结构化、有分析、有建议**的工作报告，支持多种报告类型，一键导出Word/PDF。

### 1.3 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互层                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 选择报告  │  │ 选择时间  │  │ AI生成中  │  │ 预览&编辑 │        │
│  │ 类型      │  │ 范围      │  │ 进度条    │  │ 导出      │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      AI报告生成引擎                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ 数据采集    │→ │ 数据分析    │→ │ LLM生成    │→ │ 格式化    │  │
│  │ 模块        │  │ 模块        │  │ 模块        │  │ 输出模块  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        数据与模型层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ 居民数据  │  │ 预警数据  │  │ 任务数据  │  │ 历史报告模板  │   │
│  │ DB       │  │ DB       │  │ DB       │  │ 向量库       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LLM 大语言模型（通义千问 / DeepSeek / 文心一言）          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 报告类型设计

| 报告类型 | 触发方式 | 包含内容 | 输出格式 |
|---------|---------|---------|---------|
| **月度工作总结** | 每月1日自动生成 / 手动触发 | 居民变动、预警处理、标签变动、补贴发放、网格员考核 | Word + PDF |
| **季度分析报告** | 每季度首月自动生成 | 月度对比、趋势分析、问题总结、下季度建议 | Word + PDF |
| **年度总结报告** | 每年1月自动生成 | 全年概览、同比环比、亮点工作、问题与展望 | Word + PDF + PPT |
| **预警专项报告** | 预警处理完成后触发 | 预警概况、处理情况、未处理预警、风险分析 | Word |
| **社区专项报告** | 按社区手动生成 | 单社区详细数据、居民画像、政策覆盖、问题清单 | Word |
| **自定义报告** | 用户自定义选题 | 根据用户输入主题，AI采集相关数据生成 | Word |

### 1.5 核心流程

```
用户选择报告类型 + 时间范围
        │
        ▼
┌─ Step1: 数据采集 ──────────────────────────────────────┐
│  根据报告类型，从DB采集多维度数据：                       │
│  • 居民统计：总数、新增、迁出、性别/年龄/社区分布          │
│  • 标签统计：各类型数量、新增、停发、补贴总额              │
│  • 预警统计：总数、各类型、处理率、平均处理时长            │
│  • 任务统计：派发数、完成率、超时率                      │
│  • 网格员统计：任务量、完成率、考核得分                  │
│  • 同比环比：与上月/上年同期对比                        │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step2: 数据分析 ──────────────────────────────────────┐
│  AI对采集的数据进行深度分析：                             │
│  • 趋势识别：哪些指标在上升/下降                         │
│  • 异常检测：哪些数据偏离正常范围                        │
│  • 关联分析：预警高发社区与什么因素相关                   │
│  • 排名对比：各社区/网格员横向对比                       │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step3: LLM生成 ───────────────────────────────────────┐
│  将结构化数据 + 分析结果组装为Prompt，调用LLM生成报告正文：│
│                                                         │
│  Prompt模板示例（月报）：                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 你是六角亭街道民政办的报告撰写助手。请根据以下     │    │
│  │ 数据生成本月工作总结报告。                        │    │
│  │                                                 │    │
│  │ 【报告月份】2024年6月                            │    │
│  │ 【数据概览】                                     │    │
│  │ - 居民总数：XX人（新增XX，迁出XX）                │    │
│  │ - 保障标签：XX个（新增XX，停发XX）                │    │
│  │ - 预警情况：XX条（已处理XX，待处理XX，处理率XX%） │    │
│  │ - 补贴总额：XX万元                               │    │
│  │ 【趋势分析】...（AI分析结果）                     │    │
│  │ 【异常数据】...（AI异常检测结果）                  │    │
│  │                                                 │    │
│  │ 请按以下结构生成报告：                            │    │
│  │ 一、本月工作概况                                 │    │
│  │ 二、各项业务开展情况                             │    │
│  │   1. 居民信息管理                                │    │
│  │   2. 保障政策落实                                │    │
│  │   3. 预警核查处理                                │    │
│  │   4. 网格员工作情况                              │    │
│  │ 三、存在的主要问题                               │    │
│  │ 四、下月工作建议                                 │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step4: 格式化输出 ────────────────────────────────────┐
│  • 将LLM生成的Markdown转换为Word（docx格式）             │
│  • 嵌入ECharts图表截图（趋势图、饼图等）                  │
│  • 套用报告模板（页眉页脚、封面、目录）                   │
│  • 生成PDF版本                                          │
└────────────────────────────────────────────────────────┘
```

### 1.6 报告结构模板（月报示例）

```markdown
# 六角亭街道民政办 2024年6月工作总结报告

## 报告基本信息
- 报告周期：2024-06-01 至 2024-06-30
- 生成时间：2024-07-01 08:00
- 数据来源：六角亭街道综合管理平台

## 一、本月工作概况
> AI生成：概述本月整体工作情况，2-3段

## 二、各项业务开展情况

### 2.1 居民信息管理
| 指标 | 本月数值 | 上月数值 | 环比变化 |
|------|---------|---------|---------|
| 居民总数 | 156 | 152 | +2.6% |
| 新增居民 | 4 | 6 | -33.3% |
| 迁出居民 | 0 | 1 | -100% |

> AI分析：本月新增居民主要集中在六角社区...

### 2.2 保障政策落实
> 各政策类型统计表 + 补贴金额 + AI分析

### 2.3 预警核查处理
> 预警统计表 + 处理率 + 超时情况 + AI分析

### 2.4 网格员工作情况
> 网格员任务统计 + 完成率 + 考核排名 + AI点评

## 三、存在的主要问题
> AI根据数据分析自动识别问题：
> 1. XX社区预警处理率偏低（仅45%），建议...
> 2. 残疾人补贴年审即将集中到期（7月到期12人），建议...
> 3. 网格员小李本月任务完成率下降明显...

## 四、下月工作建议
> AI生成针对性建议：
> 1. 建议重点跟进XX社区的XX类预警...
> 2. 建议在7月10日前完成残疾人补贴集中年审...
> 3. 建议对网格员小李进行工作辅导...

## 附录：数据明细
> 完整数据表格
```

### 1.7 技术实现方案

#### 1.7.1 后端服务设计

```
/api/report/
├── POST /generate          # 触发报告生成
│   请求: { type: 'monthly', startDate, endDate, community? }
│   响应: { taskId, status: 'processing' }
│
├── GET  /status/:taskId    # 查询生成进度
│   响应: { status, progress, message }
│
├── GET  /result/:taskId    # 获取生成结果
│   响应: { content, charts, metadata }
│
├── GET  /list              # 获取历史报告列表
│   响应: [{ id, type, title, createTime, status }]
│
├── GET  /download/:id      # 下载报告（Word/PDF）
│   请求: { format: 'docx' | 'pdf' }
│
└── POST /custom            # 自定义主题报告
    请求: { topic, startDate, endDate, keywords }
```

#### 1.7.2 后端核心模块

```python
# report_generator.py（伪代码）

class ReportGenerator:
    """AI报告生成器"""

    def __init__(self, llm_client, db_client):
        self.llm = llm_client          # LLM客户端（通义千问/DeepSeek）
        self.db = db_client            # 数据库客户端
        self.templates = self._load_templates()  # 报告模板

    async def generate(self, report_type, start_date, end_date, community=None):
        """生成报告主流程"""

        # Step1: 数据采集
        data = await self._collect_data(report_type, start_date, end_date, community)

        # Step2: 数据分析
        analysis = await self._analyze_data(data, report_type)

        # Step3: 生成图表
        charts = await self._generate_charts(data, report_type)

        # Step4: LLM生成报告正文
        prompt = self._build_prompt(report_type, data, analysis)
        content = await self.llm.generate(prompt, max_tokens=4000)

        # Step5: 组装报告
        report = self._assemble_report(report_type, content, charts, data)

        # Step6: 格式化输出
        docx = self._to_docx(report)
        pdf = self._to_pdf(docx)

        return { 'content': report, 'docx': docx, 'pdf': pdf }

    async def _collect_data(self, report_type, start, end, community):
        """采集多维度数据"""
        return {
            'residents': await self._collect_resident_stats(start, end, community),
            'tags': await self._collect_tag_stats(start, end, community),
            'warnings': await self._collect_warning_stats(start, end, community),
            'tasks': await self._collect_task_stats(start, end, community),
            'grid_workers': await self._collect_worker_stats(start, end, community),
            'comparison': await self._collect_comparison(start, end, community),
        }

    async def _analyze_data(self, data, report_type):
        """数据分析：趋势、异常、关联"""
        return {
            'trends': self._detect_trends(data),
            'anomalies': self._detect_anomalies(data),
            'rankings': self._calculate_rankings(data),
            'correlations': self._find_correlations(data),
        }

    def _build_prompt(self, report_type, data, analysis):
        """构建LLM Prompt"""
        template = self.templates[report_type]
        return template.render(data=data, analysis=analysis)
```

#### 1.7.3 前端页面改造

在 [Report.vue](file:///d:/原型/src/views/backend/Report.vue) 基础上新增AI报告生成面板：

```vue
<!-- 新增：AI报告生成面板 -->
<template>
  <div class="ai-report-section">
    <!-- 报告类型选择 -->
    <el-card class="report-generator-card">
      <template #header>
        <div class="card-header">
          <span>AI智能报告生成</span>
          <el-tag type="success" effect="dark">AI驱动</el-tag>
        </div>
      </template>

      <el-form :model="reportForm" label-width="100px" inline>
        <el-form-item label="报告类型">
          <el-select v-model="reportForm.type" placeholder="选择报告类型">
            <el-option label="月度工作总结" value="monthly" />
            <el-option label="季度分析报告" value="quarterly" />
            <el-option label="年度总结报告" value="annual" />
            <el-option label="预警专项报告" value="warning" />
            <el-option label="社区专项报告" value="community" />
            <el-option label="自定义主题" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围" v-if="reportForm.type !== 'custom'">
          <el-date-picker
            v-model="reportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item label="社区" v-if="reportForm.type === 'community'">
          <el-select v-model="reportForm.community" placeholder="选择社区">
            <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>

        <el-form-item label="报告主题" v-if="reportForm.type === 'custom'">
          <el-input v-model="reportForm.topic" placeholder="如：低保政策落实情况分析" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="generating" @click="generateReport">
            <el-icon><MagicStick /></el-icon>生成报告
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 生成进度 -->
      <div v-if="generating" class="generation-progress">
        <el-progress :percentage="progress" :status="progressStatus">
          <template #default>{{ progressMessage }}</template>
        </el-progress>
      </div>
    </el-card>

    <!-- 报告预览 -->
    <el-card v-if="generatedReport" class="report-preview-card">
      <template #header>
        <div class="card-header">
          <span>{{ generatedReport.title }}</span>
          <div>
            <el-button size="small" @click="editReport">编辑</el-button>
            <el-button size="small" type="success" @click="downloadReport('docx')">
              下载Word
            </el-button>
            <el-button size="small" type="warning" @click="downloadReport('pdf')">
              下载PDF
            </el-button>
          </div>
        </div>
      </template>

      <!-- 报告正文（Markdown渲染） -->
      <div class="report-content" v-html="renderedContent" />

      <!-- 报告统计图表 -->
      <div class="report-charts">
        <div v-for="(chart, idx) in generatedReport.charts" :key="idx"
             :id="`report-chart-${idx}`" class="report-chart-item" />
      </div>

      <!-- AI生成说明 -->
      <el-alert type="info" :closable="false" class="ai-notice">
        <template #title>
          本报告由AI自动生成，基于平台截至 {{ generatedReport.generateTime }} 的数据。
          如需修改请点击"编辑"按钮手动调整。
        </template>
      </el-alert>
    </el-card>

    <!-- 历史报告列表 -->
    <el-card class="report-history-card">
      <template #header>历史报告</template>
      <el-table :data="reportHistory" stripe>
        <el-table-column prop="title" label="报告名称" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="period" label="报告周期" width="200" />
        <el-table-column prop="generateTime" label="生成时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" link @click="viewReport(row)">查看</el-button>
            <el-button size="small" link @click="downloadReport(row, 'docx')">Word</el-button>
            <el-button size="small" link @click="downloadReport(row, 'pdf')">PDF</el-button>
            <el-button size="small" link type="danger" @click="deleteReport(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
```

#### 1.7.4 前端服务层

```javascript
// src/services/reportService.js

import request from './request'

const API_BASE = '/api/report'

/**
 * 触发AI报告生成
 */
export async function generateReport(params) {
  const { data } = await request.post(`${API_BASE}/generate`, params)
  return data  // { taskId, status }
}

/**
 * 轮询生成进度
 */
export async function getReportStatus(taskId) {
  const { data } = await request.get(`${API_BASE}/status/${taskId}`)
  return data  // { status, progress, message }
}

/**
 * 获取生成结果
 */
export async function getReportResult(taskId) {
  const { data } = await request.get(`${API_BASE}/result/${taskId}`)
  return data  // { content, charts, metadata }
}

/**
 * 获取历史报告列表
 */
export async function getReportList(params) {
  const { data } = await request.get(`${API_BASE}/list`, { params })
  return data
}

/**
 * 下载报告
 */
export async function downloadReport(reportId, format) {
  const response = await request.get(`${API_BASE}/download/${reportId}`, {
    params: { format },
    responseType: 'blob'
  })
  // 触发浏览器下载
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `报告_${reportId}.${format}`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 轮询直到报告生成完成
 */
export async function pollReportCompletion(taskId, onProgress) {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getReportStatus(taskId)
        onProgress?.(status)

        if (status.status === 'completed') {
          const result = await getReportResult(taskId)
          resolve(result)
        } else if (status.status === 'failed') {
          reject(new Error(status.message || '报告生成失败'))
        } else {
          setTimeout(poll, 2000)  // 2秒后再次轮询
        }
      } catch (err) {
        reject(err)
      }
    }
    poll()
  })
}
```

### 1.8 数据分析算法说明

| 分析类型 | 算法/方法 | 示例 |
|---------|---------|------|
| **趋势识别** | 环比/同比计算 + 线性回归斜率 | "低保人数连续3个月上升，月均增长2.3%" |
| **异常检测** | Z-Score / IQR异常值检测 | "XX社区预警数偏离均值2.5个标准差" |
| **排名对比** | 标准化评分 + 排序 | "各社区预警处理率排名：六角社区(92%) > 幸福社区(78%)" |
| **关联分析** | 皮尔逊相关系数 | "预警数量与网格员任务量呈强正相关(r=0.82)" |
| **预测建议** | 简单时序外推 + 规则匹配 | "按当前趋势，7月预计新增预警15-18条，建议..." |

### 1.9 Word/PDF生成技术选型

| 方案 | 技术 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|:---:|
| **python-docx** | Python库 | 纯代码生成，灵活度高 | 复杂排版受限 | ⭐⭐⭐⭐ |
| **LibreOffice转换** | docx→pdf | 格式还原度高 | 依赖LibreOffice环境 | ⭐⭐⭐⭐ |
| **Puppeteer** | HTML→PDF | 前端友好，样式控制强 | 仅PDF，不支持Word | ⭐⭐⭐ |
| **Apache POI** | Java库 | 与Java后端无缝集成 | API复杂 | ⭐⭐⭐ |
| **Markdown→docx** | Pandoc | 简单快速 | 样式定制有限 | ⭐⭐⭐⭐ |

**推荐方案**：`python-docx` 生成Word + `LibreOffice` 转PDF

---

## 二、AI智能派单

### 2.1 现状分析

| 维度 | 现状 | 问题 |
|------|------|------|
| 任务数据 | [mock.js#L1137](file:///d:/原型/src/data/mock.js#L1137) tasks数组 | `gridWorker` 和 `assignee` 字段硬编码 |
| 派单方式 | 无派单功能 | 预警产生后，人工决定派给谁 |
| 网格员数据 | [mock.js#L1381](file:///d:/原型/src/data/mock.js#L1381) gridWorkers数组 | 有任务量、完成率、考核分，但未用于派单决策 |
| 调度逻辑 | 无 | 不考虑距离、工作量、技能匹配、紧急程度 |
| 任务追踪 | 无 | 派单后无法追踪进度、无法自动催办、无法改派 |

### 2.2 目标

当预警产生需要核实时，AI自动选择最合适的网格员派发任务，综合考虑**距离、工作量、技能匹配、紧急程度、历史表现**五大因素。

### 2.3 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        触发层                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 预警产生  │  │ 定时任务  │  │ 手动派单  │                      │
│  │ 自动触发  │  │ 批量调度  │  │ AI建议    │                      │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘                      │
└────────┼─────────────┼─────────────┼───────────────────────────┘
         │             │             │
         ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI智能派单引擎                                 │
│                                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ 候选筛选  │→  │ 多因子   │→  │ 评分排序  │→  │ 派单决策  │     │
│  │ 模块      │   │ 评估模块  │   │ 模块      │   │ 模块      │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                                   │
│  评估维度：                                                       │
│  ① 地理距离（居民地址 ↔ 网格员负责区域）                           │
│  ② 当前工作量（待处理任务数 + 今日已处理数）                        │
│  ③ 技能匹配（任务类型 ↔ 网格员专长）                               │
│  ④ 紧急程度（预警级别 ↔ 网格员响应速度历史）                       │
│  ⑤ 历史表现（任务完成率 + 考核得分 + 居民满意度）                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      执行与追踪层                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 自动派发  │  │ 消息通知  │  │ 进度追踪  │  │ 超时催办  │        │
│  │ 任务      │  │ (短信/APP)│  │ 状态流转  │  │ 自动改派  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 派单决策算法

#### 2.4.1 候选网格员筛选规则

```
输入：一条预警/任务
输出：候选网格员列表

筛选规则（硬性条件，不满足直接排除）：
1. 状态 = 在职
2. 所属社区 = 居民所在社区（跨社区派单需特殊审批）
3. 今日待处理任务 < 上限阈值（默认10）
4. 非请假/休假状态
5. AB岗互斥：同一时间A岗和B岗不能同时被派同一任务

特殊情况：
- 紧急预警：放宽至同街道跨社区
- 无人可用：标记为"待人工派单"，通知管理员
```

#### 2.4.2 多因子评分模型

```
总分 = W1×距离分 + W2×负载分 + W3×技能分 + W4×紧急分 + W5×绩效分

权重配置（可调）：
  W1(距离)   = 0.30  —— 距离越近，响应越快
  W2(负载)   = 0.25  —— 负载越低，越能及时处理
  W3(技能)   = 0.15  —— 技能匹配度越高，处理质量越好
  W4(紧急)   = 0.15  —— 响应速度越快，越适合紧急任务
  W5(绩效)   = 0.15  —— 历史表现越好，越值得信赖
```

**各维度评分算法（0-100分）：**

```python
# dispatch_scorer.py（伪代码）

class DispatchScorer:

    # ===== 1. 距离评分 =====
    def score_distance(self, worker, task):
        """
        计算网格员到任务地点的距离评分
        - 同网格：100分
        - 同社区不同网格：80分
        - 同街道不同社区：50分
        - 跨街道：20分（需特殊审批）
        """
        if worker.grid == task.gridName:
            return 100
        elif worker.community == task.community:
            return 80
        elif same_street(worker, task):
            return 50
        else:
            return 20

    # ===== 2. 负载评分 =====
    def score_workload(self, worker):
        """
        根据当前待处理任务数评分
        0个待处理 = 100分
        每增加1个，扣10分
        最低0分
        """
        pending = worker.pendingTasks
        score = 100 - (pending * 10)
        return max(0, score)

    # ===== 3. 技能匹配评分 =====
    def score_skill(self, worker, task):
        """
        网格员技能标签与任务类型匹配度
        - 完全匹配（如残疾专干+残疾任务）：100分
        - 相关匹配（如社保专干+低保任务）：70分
        - 通用任务（走访/采集）：85分（所有人都能做）
        - 不匹配（如无医学背景+重症核实）：30分
        """
        skill_map = {
            '低保': ['低保专干', '民政全能'],
            '残疾': ['残疾专干', '民政全能'],
            '老年': ['老龄专干', '民政全能'],
            '社保': ['社保专干', '民政全能'],
            '重症': ['医务背景', '残疾专干'],
            '走访': ['全部'],          # 通用任务
            '采集': ['全部'],          # 通用任务
            '年审': ['对应政策专干', '民政全能'],
        }
        required_skills = skill_map.get(task.type, ['全部'])
        if '全部' in required_skills:
            return 85
        worker_skills = worker.skills or ['民政全能']
        if any(s in required_skills for s in worker_skills):
            return 100
        return 30

    # ===== 4. 紧急响应评分 =====
    def score_urgency(self, worker, task):
        """
        根据任务紧急程度和网格员历史响应速度评分
        紧急任务：优先派给历史响应快的网格员
        """
        if task.urgency == '紧急':
            # 历史平均响应时间越短，分数越高
            avg_response = worker.avgResponseHours or 24
            if avg_response <= 2:
                return 100
            elif avg_response <= 4:
                return 80
            elif avg_response <= 8:
                return 60
            else:
                return 30
        else:
            # 非紧急任务，响应速度要求降低
            return 70

    # ===== 5. 历史绩效评分 =====
    def score_performance(self, worker):
        """
        综合历史表现评分
        - 任务完成率 × 40%
        - 考核得分 × 30%
        - 居民满意度 × 30%
        """
        completion_rate = worker.completedTasks / max(worker.totalTasks, 1) * 100
        assessment_score = worker.monthlyScore or 80
        satisfaction = worker.satisfactionScore or 85

        return (completion_rate * 0.4 +
                assessment_score * 0.3 +
                satisfaction * 0.3)

    # ===== 综合评分 =====
    def calculate_total_score(self, worker, task):
        weights = {
            'distance': 0.30,
            'workload': 0.25,
            'skill': 0.15,
            'urgency': 0.15,
            'performance': 0.15
        }

        scores = {
            'distance': self.score_distance(worker, task),
            'workload': self.score_workload(worker),
            'skill': self.score_skill(worker, task),
            'urgency': self.score_urgency(worker, task),
            'performance': self.score_performance(worker),
        }

        total = sum(weights[k] * scores[k] for k in weights)
        return { 'total': round(total, 1), 'details': scores }
```

#### 2.4.3 评分示例

```
场景：李四生存状态预警（紧急），居住在六角社区第二网格

候选网格员评分：

┌────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────────────────┐
│ 网格员  │ 距离 │ 负载 │ 技能 │ 紧急 │ 绩效 │ 总分  │ 是否推荐          │
├────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────────────────┤
│ 小王    │  80  │  50  │ 100  │ 100  │  92  │ 78.8  │ ✅ 推荐派单       │
│ 小李    │ 100  │   0  │  70  │  60  │  68  │ 57.3  │ ❌ 负载过高       │
│ 小张    │  50  │  80  │ 100  │ 100  │  98  │ 76.7  │ ✅ 备选           │
│ 小刘    │  50  │  90  │  30  │  30  │  82  │ 62.3  │ ❌ 技能不匹配     │
└────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────────────────┘

决策结果：派给小王（总分78.8）
理由：小王同社区且技能完全匹配，虽然待处理任务有5个，
      但历史响应速度快（2小时内），综合评分最高。
备选：小张（总分76.7），跨网格但绩效最优。
```

### 2.5 派单流程

```
预警产生（如：李四生存状态异常）
        │
        ▼
┌─ Step1: 任务创建 ──────────────────────────────────────┐
│  根据预警类型自动创建任务：                              │
│  • 任务标题：核实李四生存状态                           │
│  • 任务类型：核实                                      │
│  • 紧急程度：紧急（继承预警级别）                       │
│  • 截止时间：紧急24h / 普通72h / 低优先级7天            │
│  • 任务要求：需上门核实，如已去世需拍照上传死亡证明      │
│  • 所需材料：死亡证明照片、户口本变更页                 │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step2: 候选筛选 ──────────────────────────────────────┐
│  硬性条件过滤：                                         │
│  ✓ 在职状态                                            │
│  ✓ 同社区（六角社区）                                   │
│  ✓ 待处理任务 < 10                                     │
│  ✓ 非休假                                              │
│  结果：小王、小李、小张、小刘                           │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step3: AI评分排序 ────────────────────────────────────┐
│  五维度评分 → 加权求和 → 排序                           │
│  结果：小王(78.8) > 小张(76.7) > 小刘(62.3) > 小李(57.3)│
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step4: 派单决策 ──────────────────────────────────────┐
│  自动派单模式：直接派给第一名（小王）                    │
│  建议派单模式：展示Top3，由管理员确认                    │
│  人工派单模式：展示评分参考，管理员手动选择              │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Step5: 通知与追踪 ────────────────────────────────────┐
│  • 短信/APP推送通知网格员                               │
│  • 任务状态：待处理 → 处理中 → 已完成/已超时            │
│  • 进度追踪：网格员上传处理过程和结果                    │
│  • 超时催办：截止时间前2h未处理，自动提醒                │
│  • 超时改派：超时后自动重新派单给第二名                  │
└────────────────────────────────────────────────────────┘
```

### 2.6 技术实现方案

#### 2.6.1 后端API设计

```
/api/dispatch/
├── POST /auto              # 自动派单（预警触发）
│   请求: { warningId, taskType, urgency }
│   响应: { taskId, assignee, score, candidates }
│
├── POST /suggest           # AI建议派单（管理员确认）
│   请求: { warningId, taskType, urgency }
│   响应: { candidates: [{ worker, score, details, reason }] }
│
├── POST /manual            # 手动派单（管理员指定）
│   请求: { warningId, workerId, remark }
│   响应: { taskId, status }
│
├── POST /reassign          # 改派
│   请求: { taskId, newWorkerId, reason }
│   响应: { taskId, newAssignee, status }
│
├── GET  /candidates        # 查询候选网格员
│   请求: { community, taskType, urgency }
│   响应: [{ workerId, name, score, details, currentLoad }]
│
├── GET  /config            # 获取派单配置（权重等）
│   响应: { weights, thresholds, rules }
│
├── PUT  /config            # 更新派单配置
│   请求: { weights, thresholds }
│
└── GET  /statistics        # 派单统计
    请求: { startDate, endDate }
    响应: { totalDispatched, autoRate, avgResponseTime, ... }
```

#### 2.6.2 后端核心模块

```python
# dispatch_engine.py（伪代码）

class DispatchEngine:
    """AI智能派单引擎"""

    def __init__(self, db, config):
        self.db = db
        self.weights = config.get('weights', {
            'distance': 0.30,
            'workload': 0.25,
            'skill': 0.15,
            'urgency': 0.15,
            'performance': 0.15
        })
        self.scorer = DispatchScorer()

    async def dispatch(self, warning_id, task_type, urgency, mode='auto'):
        """
        派单主流程
        mode: 'auto' | 'suggest' | 'manual'
        """
        # 1. 获取预警信息
        warning = await self.db.get_warning(warning_id)
        resident = await self.db.get_resident(warning.residentId)

        # 2. 创建任务
        task = self._create_task(warning, resident, task_type, urgency)

        # 3. 筛选候选网格员
        candidates = await self._filter_candidates(resident, task)

        if not candidates:
            return { 'status': 'no_candidate', 'task': task }

        # 4. 评分排序
        scored = []
        for worker in candidates:
            score = self.scorer.calculate_total_score(worker, task)
            scored.append({
                'worker': worker,
                'score': score['total'],
                'details': score['details'],
                'reason': self._generate_reason(worker, task, score)
            })
        scored.sort(key=lambda x: x['score'], reverse=True)

        # 5. 根据模式决策
        if mode == 'auto':
            # 自动派给第一名
            assignee = scored[0]
            await self._assign_task(task, assignee['worker'])
            await self._notify_worker(assignee['worker'], task)
            return {
                'status': 'dispatched',
                'task': task,
                'assignee': assignee,
                'candidates': scored[:3]
            }

        elif mode == 'suggest':
            # 返回Top3建议，等待管理员确认
            return {
                'status': 'suggested',
                'task': task,
                'candidates': scored[:3]
            }

    async def _filter_candidates(self, resident, task):
        """筛选候选网格员"""
        all_workers = await self.db.get_grid_workers(
            community=resident.community,
            status='在职'
        )

        candidates = []
        for worker in all_workers:
            # 硬性条件过滤
            if worker.pendingTasks >= 10:
                continue
            if worker.on_leave:
                continue
            # AB岗互斥检查
            if self._is_ab_conflict(worker, task):
                continue
            candidates.append(worker)

        # 紧急任务放宽至跨社区
        if not candidates and task.urgency == '紧急':
            candidates = await self.db.get_grid_workers(
                status='在职'
            )

        return candidates

    def _generate_reason(self, worker, task, score):
        """生成派单理由（可接入LLM生成自然语言）"""
        details = score['details']
        reasons = []

        if details['distance'] >= 80:
            reasons.append(f"{worker.name}负责{task.gridName}，距离近")
        if details['workload'] >= 70:
            reasons.append(f"当前待处理任务{worker.pendingTasks}个，负载适中")
        if details['skill'] >= 85:
            reasons.append(f"具备{task.type}相关技能")
        if details['performance'] >= 85:
            reasons.append(f"历史任务完成率{worker.completedTasks/max(worker.totalTasks,1)*100:.0f}%")

        return '；'.join(reasons) if reasons else '综合评分最优'

    async def check_timeout(self):
        """定时检查超时任务，自动催办或改派"""
        timeout_tasks = await self.db.get_timeout_tasks()

        for task in timeout_tasks:
            if task.timeout_count == 0:
                # 第一次超时：催办
                await self._urge_worker(task)
            elif task.timeout_count >= 1:
                # 第二次超时：改派给第二名
                await self._reassign(task)
```

#### 2.6.3 前端页面设计

新增AI派单面板，集成到预警详情弹窗中：

```vue
<!-- 在WarningList.vue的预警详情弹窗中新增AI派单面板 -->
<template>
  <div class="ai-dispatch-panel">
    <!-- 派单模式切换 -->
    <el-radio-group v-model="dispatchMode" class="dispatch-mode">
      <el-radio-button label="auto">AI自动派单</el-radio-button>
      <el-radio-button label="suggest">AI建议派单</el-radio-button>
      <el-radio-button label="manual">手动派单</el-radio-button>
    </el-radio-group>

    <!-- 自动派单模式 -->
    <div v-if="dispatchMode === 'auto'" class="auto-dispatch">
      <el-alert type="success" :closable="false">
        AI已分析所有候选网格员，推荐以下人选：
      </el-alert>

      <div class="recommended-worker">
        <div class="worker-info">
          <el-avatar :size="48">{{ recommendedWorker.name[0] }}</el-avatar>
          <div class="worker-detail">
            <div class="worker-name">{{ recommendedWorker.name }}</div>
            <div class="worker-meta">
              {{ recommendedWorker.grid }} · 待处理{{ recommendedWorker.pendingTasks }}个
            </div>
          </div>
          <div class="worker-score">
            <div class="score-value">{{ recommendedWorker.score }}</div>
            <div class="score-label">综合评分</div>
          </div>
        </div>
        <div class="dispatch-reason">
          <el-icon><InfoFilled /></el-icon>
          {{ recommendedWorker.reason }}
        </div>
      </div>

      <!-- 评分详情雷达图 -->
      <div class="score-radar">
        <div :id="'radar-chart'" class="radar-chart" />
      </div>

      <!-- 备选网格员 -->
      <el-collapse>
        <el-collapse-item title="查看其他候选网格员" :name="1">
          <el-table :data="otherCandidates" stripe size="small">
            <el-table-column prop="name" label="姓名" width="80" />
            <el-table-column prop="grid" label="网格" width="100" />
            <el-table-column prop="score" label="总分" width="80">
              <template #default="{ row }">
                <span :class="{'high-score': row.score >= 70}">{{ row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="pendingTasks" label="待处理" width="80" />
            <el-table-column label="评分详情">
              <template #default="{ row }">
                <div class="score-bars">
                  <div v-for="(val, key) in row.details" :key="key" class="score-bar">
                    <span class="bar-label">{{ dimensionLabel[key] }}</span>
                    <el-progress :percentage="val" :show-text="false"
                      :color="getScoreColor(val)" :stroke-width="6" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" link @click="assignTo(row)">派给TA</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <!-- 派单配置 -->
      <div class="dispatch-config">
        <el-popover trigger="click" width="400" placement="top">
          <template #reference>
            <el-button link type="primary">
              <el-icon><Setting /></el-icon>派单权重配置
            </el-button>
          </template>
          <div class="weight-config">
            <div v-for="(val, key) in weights" :key="key" class="weight-item">
              <span class="weight-label">{{ dimensionLabel[key] }}</span>
              <el-slider v-model="weights[key]" :min="0" :max="50" :step="5"
                :format-tooltip="v => v + '%'" style="flex:1" />
            </div>
            <el-button size="small" @click="resetWeights">恢复默认</el-button>
            <el-button size="small" type="primary" @click="saveWeights">保存</el-button>
          </div>
        </el-popover>
      </div>

      <div class="dispatch-actions">
        <el-button @click="showDispatchPanel = false">取消</el-button>
        <el-button type="primary" @click="confirmAutoDispatch">
          确认派单给{{ recommendedWorker.name }}
        </el-button>
      </div>
    </div>

    <!-- 建议派单模式 -->
    <div v-if="dispatchMode === 'suggest'" class="suggest-dispatch">
      <el-table :data="allCandidates" stripe>
        <!-- 同上表格，但Top3高亮 -->
      </el-table>
      <div class="dispatch-actions">
        <el-button @click="showDispatchPanel = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedWorker" @click="confirmSuggestDispatch">
          确认派单给{{ selectedWorker?.name }}
        </el-button>
      </div>
    </div>

    <!-- 手动派单模式 -->
    <div v-if="dispatchMode === 'manual'" class="manual-dispatch">
      <el-select v-model="manualWorkerId" filterable placeholder="选择网格员">
        <el-option v-for="w in allWorkers" :key="w.id" :label="w.name" :value="w.id">
          <span>{{ w.name }}</span>
          <span style="float: right; color: #9ca3af; font-size: 12px">
            {{ w.grid }} · 待处理{{ w.pendingTasks }}个 · 评分{{ w.score }}
          </span>
        </el-option>
      </el-select>
      <el-input v-model="manualRemark" type="textarea" :rows="2"
        placeholder="派单说明（选填）" />
      <div class="dispatch-actions">
        <el-button @click="showDispatchPanel = false">取消</el-button>
        <el-button type="primary" @click="confirmManualDispatch">确认派单</el-button>
      </div>
    </div>
  </div>
</template>
```

#### 2.6.4 前端服务层

```javascript
// src/services/dispatchService.js

import request from './request'

const API_BASE = '/api/dispatch'

/**
 * AI自动派单
 */
export async function autoDispatch(warningId, taskType, urgency) {
  const { data } = await request.post(`${API_BASE}/auto`, {
    warningId, taskType, urgency
  })
  return data
}

/**
 * 获取AI派单建议（Top3候选）
 */
export async function suggestDispatch(warningId, taskType, urgency) {
  const { data } = await request.post(`${API_BASE}/suggest`, {
    warningId, taskType, urgency
  })
  return data
}

/**
 * 手动派单
 */
export async function manualDispatch(warningId, workerId, remark) {
  const { data } = await request.post(`${API_BASE}/manual`, {
    warningId, workerId, remark
  })
  return data
}

/**
 * 改派
 */
export async function reassign(taskId, newWorkerId, reason) {
  const { data } = await request.post(`${API_BASE}/reassign`, {
    taskId, newWorkerId, reason
  })
  return data
}

/**
 * 查询候选网格员
 */
export async function getCandidates(community, taskType, urgency) {
  const { data } = await request.get(`${API_BASE}/candidates`, {
    params: { community, taskType, urgency }
  })
  return data
}

/**
 * 获取派单配置
 */
export async function getDispatchConfig() {
  const { data } = await request.get(`${API_BASE}/config`)
  return data
}

/**
 * 更新派单配置
 */
export async function updateDispatchConfig(config) {
  const { data } = await request.put(`${API_BASE}/config`, config)
  return data
}

/**
 * 派单统计
 */
export async function getDispatchStatistics(startDate, endDate) {
  const { data } = await request.get(`${API_BASE}/statistics`, {
    params: { startDate, endDate }
  })
  return data
}
```

### 2.7 超时自动处理机制

```
任务截止时间到达
        │
        ├── 提前2小时未处理 → 发送催办短信/APP通知
        │
        ├── 超时0-2小时 → 再次催办 + 通知管理员
        │
        └── 超时2小时+ → 自动改派
              │
              ├── 重新计算候选网格员（排除原网格员）
              ├── 派给第二名
              ├── 通知新网格员 + 通知管理员
              └── 记录改派日志（影响原网格员绩效）
```

---

## 三、数据模型扩展

### 3.1 新增数据表（后端）

#### 报告相关

```sql
-- AI报告记录表
CREATE TABLE ai_reports (
    id              VARCHAR(36) PRIMARY KEY,
    type            VARCHAR(20) NOT NULL,      -- monthly/quarterly/annual/warning/community/custom
    title           VARCHAR(200) NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    community       VARCHAR(50),               -- 社区专项报告时使用
    status          VARCHAR(20) DEFAULT 'processing',  -- processing/completed/failed
    content         TEXT,                      -- Markdown格式报告正文
    charts          JSON,                      -- 图表数据
    metadata        JSON,                      -- 生成元数据（数据量、耗时等）
    generated_by    VARCHAR(50),               -- auto/manual
    created_by      VARCHAR(36),               -- 操作人ID
    created_at      DATETIME DEFAULT NOW(),
    completed_at    DATETIME
);

-- 报告模板表
CREATE TABLE report_templates (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    structure       JSON NOT NULL,             -- 报告结构定义
    prompt_template TEXT NOT NULL,             -- LLM Prompt模板
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT NOW()
);
```

#### 派单相关

```sql
-- 派单记录表
CREATE TABLE dispatch_records (
    id              VARCHAR(36) PRIMARY KEY,
    task_id         VARCHAR(36) NOT NULL,
    warning_id      VARCHAR(36),
    worker_id       VARCHAR(36) NOT NULL,
    dispatch_mode   VARCHAR(20) NOT NULL,      -- auto/suggest/manual
    score           DECIMAL(5,1),              -- 综合评分
    score_details   JSON,                      -- 各维度评分详情
    reason          TEXT,                      -- 派单理由
    status          VARCHAR(20) DEFAULT 'assigned',  -- assigned/accepted/rejected/reassigned
    created_at      DATETIME DEFAULT NOW(),
    accepted_at     DATETIME,
    completed_at    DATETIME
);

-- 网格员技能表（扩展现有gridWorkers）
ALTER TABLE grid_workers ADD COLUMN skills JSON;          -- 技能标签
ALTER TABLE grid_workers ADD COLUMN avg_response_hours DECIMAL(4,1);  -- 平均响应时长
ALTER TABLE grid_workers ADD COLUMN satisfaction_score DECIMAL(4,1);  -- 满意度评分
ALTER TABLE grid_workers ADD COLUMN on_leave BOOLEAN DEFAULT FALSE;   -- 是否休假

-- 派单配置表
CREATE TABLE dispatch_config (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    config_key      VARCHAR(50) NOT NULL UNIQUE,
    config_value    JSON NOT NULL,
    updated_at      DATETIME DEFAULT NOW()
);
```

### 3.2 Mock数据扩展

在 [mock.js](file:///d:/原型/src/data/mock.js) 中扩展网格员数据：

```javascript
// 扩展gridWorkers，新增字段
export const gridWorkers = [
  {
    id: 'gw1',
    name: '小王',
    // ... 现有字段 ...
    // 新增AI派单相关字段
    skills: ['低保专干', '残疾专干', '民政全能'],
    avgResponseHours: 2.5,
    satisfactionScore: 92,
    onLeave: false,
    todayDispatched: 2,     // 今日已派发任务数
  },
  // ...
]
```

---

## 四、实施计划

### 4.1 里程碑

| 阶段 | 周期 | 交付物 | 依赖 |
|------|------|--------|------|
| **阶段一：AI报告生成** | | | |
| 1.1 数据采集模块 | 第1-2周 | 后端数据采集API | 后端DB |
| 1.2 报告模板设计 | 第1周 | 6种报告模板（结构+Prompt） | 业务方确认 |
| 1.3 LLM集成 | 第2-3周 | LLM调用服务 | LLM API账号 |
| 1.4 Word/PDF生成 | 第3周 | docx+pdf导出 | LibreOffice环境 |
| 1.5 前端页面改造 | 第3-4周 | Report.vue AI报告面板 | 前后端联调 |
| 1.6 测试与优化 | 第4周 | 测试报告 + 优化 | — |
| **阶段二：AI智能派单** | | | |
| 2.1 评分算法实现 | 第1-2周 | DispatchScorer模块 | — |
| 2.2 派单引擎开发 | 第2-3周 | DispatchEngine模块 | 后端DB |
| 2.3 超时处理机制 | 第3周 | 定时任务 + 催办/改派 | 短信平台 |
| 2.4 前端页面开发 | 第3-4周 | 派单面板 + 雷达图 | 前后端联调 |
| 2.5 权重配置页面 | 第4周 | 可视化权重调优 | — |
| 2.6 测试与优化 | 第4周 | 派单准确率测试 | — |

### 4.2 技术选型汇总

| 组件 | 技术 | 说明 |
|------|------|------|
| **LLM** | 通义千问 / DeepSeek | 中文理解强，成本低（通义千问免费额度） |
| **LLM调用** | OpenAI兼容API | 统一接口，便于切换模型 |
| **Word生成** | python-docx | 灵活生成结构化文档 |
| **PDF转换** | LibreOffice headless | 格式还原度高 |
| **图表渲染** | ECharts + echarts-to-image | 后端截图嵌入Word |
| **定时任务** | APScheduler (Python) | 超时检查、定时报告 |
| **消息通知** | 阿里云短信 / WebSocket | 派单通知、超时催办 |
| **评分算法** | Python纯代码 | 五因子加权评分 |

### 4.3 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| LLM API调用 | ~200元/月 | 月报+季报+派单，约50万token/月 |
| 短信通知 | ~100元/月 | 派单通知+催办，约2000条/月 |
| LibreOffice服务器 | 0 | 复用现有服务器 |
| **合计** | ~300元/月 | 运营成本极低 |

---

## 五、预期效果

### 5.1 AI智能报告生成

| 指标 | 改造前 | 改造后 | 提升 |
|------|--------|--------|------|
| 月报撰写时间 | 2-3小时/人 | 5分钟自动生成 + 15分钟人工校对 | **效率提升85%** |
| 报告质量 | 因人而异，格式不统一 | 结构化、有数据支撑、有分析建议 | **质量标准化** |
| 报告类型 | 仅月度总结 | 6种类型按需生成 | **覆盖面提升** |
| 数据准确性 | 人工统计易出错 | 系统采集，100%准确 | **零差错** |
| 历史可追溯 | 无归档 | 全部存档可查可对比 | **可追溯** |

### 5.2 AI智能派单

| 指标 | 改造前 | 改造后 | 提升 |
|------|--------|--------|------|
| 派单耗时 | 5-10分钟/单（人工思考） | 3秒自动完成 | **效率提升99%** |
| 派单合理性 | 凭经验/关系派单 | 五维评分科学决策 | **科学化** |
| 任务响应时间 | 平均8小时 | 平均3小时（距离+负载优化） | **响应提升62%** |
| 超时率 | 约15% | 预计<5%（超时自动改派） | **超时降低67%** |
| 负载均衡 | 忙闲不均 | AI自动平衡工作量 | **均衡化** |
| 工作可追溯 | 无记录 | 全链路日志（派单-接收-处理-完成） | **全链路追踪** |

---

> 本方案基于六角亭街道综合管理平台现状编制，实施前需确认：
> 1. LLM服务商选型及API账号申请
> 2. 短信平台对接（如阿里云短信）
> 3. 报告模板结构由业务方确认
> 4. 派单权重配置由街道办确认
