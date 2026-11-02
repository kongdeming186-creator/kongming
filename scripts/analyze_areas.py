#!/usr/bin/env python3
"""分析知识库数据中的区域分布，提取高发区域"""
import json, re, os
from collections import Counter

BASE = r'C:\Users\18637\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6aa0031263dc579bd12f91f2\project\public'
KB_PATH = os.path.join(BASE, 'knowledge_base.json')
DATA_PATH = os.path.join(BASE, 'data.json')

# 加载所有数据
with open(KB_PATH, 'r', encoding='utf-8') as f:
    kb = json.load(f)
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    rt = json.load(f)

# 合并去重
rt_ids = set(r.get('办件编号', '') for r in rt)
kb_only = [r for r in kb if r.get('办件编号', '') not in rt_ids]
merged = rt + kb_only

print(f'总数据量: {len(merged)}')
print()

# 提取地址关键词
# 从 诉求内容/诉求主题/办理单位 中提取地址信息
area_keywords = [
    '长风路', '长丰大道', '长丰村', '长丰城',
    '城华路', '华生南区', '华生北区',
    '丰美路', '丰竹园',
    '紫润', '紫华路',
    '东风村', '东风大道',
    '长天路', '天顺园',
    '园博园', '园博',
    '正康', '团结', '百泽', '永利', '长源', '天勤',
    '新墩', '长宜', '长宁', '荣荟',
    '古田', '汉口', '汉江湾',
    '解放大道', '南泥湾', '古田一路', '古田二路', '古田三路',
    '古田四路', '古田五路',
]

# 统计各区域事件数
area_counter = Counter()
area_issues = {}  # area -> {issue: count}
area_categories = {}  # area -> {category: count}

for r in merged:
    text = f"{r.get('诉求内容', '')} {r.get('诉求主题', '')} {r.get('办理单位', '')} {r.get('诉求人', '')}"

    matched = False
    for kw in area_keywords:
        if kw in text:
            area_counter[kw] += 1
            # 统计该区域的问题类型
            issue = re.sub(r'^\d+\.', '', r.get('事项小类', '')).strip()
            if not issue:
                issue = '其他'
            if kw not in area_issues:
                area_issues[kw] = Counter()
            area_issues[kw][issue] += 1
            # 统计大类
            cat = r.get('事项大类', '未知').strip()
            if kw not in area_categories:
                area_categories[kw] = Counter()
            area_categories[kw][cat] += 1
            matched = True
            break  # 只匹配第一个

    if not matched:
        area_counter['其他/未匹配'] += 1

print('=== 区域分布 TOP20 ===')
for area, count in area_counter.most_common(20):
    pct = count * 100 / len(merged)
    top_issue = area_issues.get(area, Counter()).most_common(1)
    top_issue_str = f"{top_issue[0][0]}({top_issue[0][1]})" if top_issue else 'N/A'
    top_cat = area_categories.get(area, Counter()).most_common(1)
    top_cat_str = f"{top_cat[0][0]}({top_cat[0][1]})" if top_cat else 'N/A'
    print(f'  {area:12s}: {count:5d} ({pct:5.1f}%) | 主问题: {top_issue_str} | 大类: {top_cat_str}')

# 分析长丰街道内具体区域
print()
print('=== 长丰街道内区域细分 ===')
cf_areas = ['长风路', '长丰大道', '长丰村', '长丰城', '城华路', '丰美路', '丰竹园',
            '紫润', '紫华路', '东风村', '长天路', '天顺园', '园博园',
            '正康', '团结', '百泽', '永利', '长源', '天勤', '新墩', '长宜', '长宁', '荣荟']
cf_total = sum(area_counter.get(a, 0) for a in cf_areas)
print(f'长丰街道内匹配总数: {cf_total}')
for a in cf_areas:
    c = area_counter.get(a, 0)
    if c > 0:
        print(f'  {a:12s}: {c:4d}')

# 分析高发区域的具体地址
print()
print('=== 高发区域详细地址采样（前3区域各5条）===')
top5_areas = [a for a, _ in area_counter.most_common(10) if a != '其他/未匹配'][:5]
for area in top5_areas:
    print(f'\n--- {area} (共{area_counter[area]}条) ---')
    samples = [r for r in merged if area in f"{r.get('诉求内容', '')} {r.get('诉求主题', '')}"][:5]
    for s in samples:
        content = (s.get('诉求内容', '') or s.get('诉求主题', ''))[:60]
        print(f'  编号:{s.get("办件编号","")[:15]} | {content}')
