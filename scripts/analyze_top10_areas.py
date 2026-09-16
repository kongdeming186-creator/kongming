#!/usr/bin/env python3
"""精细分析知识库数据，提取TOP10高发区域"""
import json, re, os
from collections import Counter

BASE = r'C:\Users\18637\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6aa0031263dc579bd12f91f2\project\public'
KB_PATH = os.path.join(BASE, 'knowledge_base.json')
DATA_PATH = os.path.join(BASE, 'data.json')

# 加载合并数据
with open(KB_PATH, 'r', encoding='utf-8') as f:
    kb = json.load(f)
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    rt = json.load(f)
rt_ids = set(r.get('办件编号', '') for r in rt)
kb_only = [r for r in kb if r.get('办件编号', '') not in rt_ids]
merged = rt + kb_only

print(f'总数据量: {len(merged)}')

# 更细粒度的地址关键词
keywords = [
    # 道路/地标
    '长风路', '长丰大道', '城华路', '丰美路', '丰竹园', '紫华路',
    '古田一路', '古田二路', '古田三路', '古田四路', '古田五路',
    '解放大道', '南泥湾', '汉口北', '汉西',
    # 小区/片区
    '天顺园', '华生南', '华生北', '紫润明园', '紫润',
    '丰华园', '东风里', '龙湖春江', '美好香域', '华润翡翠城',
    '汉口城市广场', '蓝焰', '汽配城', '东风村', '长丰村', '长丰城',
    # 社区
    '永利', '正康', '团结', '百泽', '长源', '天勤',
    '新墩', '长宜', '长宁', '荣荟', '园博',
]

# 统计
area_counter = Counter()
area_issues = {}
area_cats = {}

for r in merged:
    text = f"{r.get('诉求内容', '')} {r.get('诉求主题', '')} {r.get('办理单位', '')}"
    for kw in keywords:
        if kw in text:
            area_counter[kw] += 1
            issue = re.sub(r'^\d+\.', '', r.get('事项小类', '')).strip() or '其他'
            area_issues.setdefault(kw, Counter())[issue] += 1
            cat = r.get('事项大类', '未知').strip()
            area_cats.setdefault(kw, Counter())[cat] += 1
            break

# 输出TOP15
print('\n=== TOP15 高发区域 ===')
for i, (area, count) in enumerate(area_counter.most_common(15), 1):
    pct = count * 100 / len(merged)
    top_issue = area_issues.get(area, Counter()).most_common(1)
    ti_str = f"{top_issue[0][0]}({top_issue[0][1]})" if top_issue else 'N/A'
    top_cat = area_cats.get(area, Counter()).most_common(1)
    tc_str = f"{top_cat[0][0]}({top_cat[0][1]})" if top_cat else 'N/A'
    print(f'{i:2d}. {area:14s}: {count:5d} ({pct:5.1f}%) | 主问题: {ti_str:30s} | 大类: {tc_str}')

# 输出前10个区域的样本地址
print('\n=== TOP10 区域样本地址 ===')
top10 = [a for a, _ in area_counter.most_common(10)]
for area in top10:
    print(f'\n--- {area} (共{area_counter[area]}条) ---')
    samples = [r for r in merged if area in f"{r.get('诉求内容', '')} {r.get('诉求主题', '')}"][:3]
    for s in samples:
        content = (s.get('诉求内容', '') or s.get('诉求主题', ''))[:80]
        print(f'  {content}')
