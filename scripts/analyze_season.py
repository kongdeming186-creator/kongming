#!/usr/bin/env python3
"""分析历史数据中月份/季节与事件类型、区域的关联规律"""
import json, re, os
from collections import Counter, defaultdict

BASE = r'C:\Users\18637\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6aa0031263dc579bd12f91f2\project\public'
KB_PATH = os.path.join(BASE, 'knowledge_base.json')
DATA_PATH = os.path.join(BASE, 'data.json')

with open(KB_PATH, 'r', encoding='utf-8') as f:
    kb = json.load(f)
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    rt = json.load(f)
rt_ids = set(r.get('办件编号', '') for r in rt)
merged = rt + [r for r in kb if r.get('办件编号', '') not in rt_ids]

print(f'总数据量: {len(merged)}')

# 按月份统计
month_type = defaultdict(Counter)  # month -> {issue_type: count}
month_area = defaultdict(Counter)   # month -> {area: count}
month_total = Counter()             # month -> total

# 事件类型关键词映射
weather_keywords = {
    '暴雨/积水': ['积水', '排水', '暴雨', '内涝', '防汛', '下水道', '窨井'],
    '环卫/垃圾': ['垃圾', '环卫', '清运', '污水横流', '臭气', '异味', '粪便'],
    '占道经营': ['占道', '出店', '流动摊贩', '夜市', '烧烤摊'],
    '商业噪音': ['商业噪音', '噪音扰民', '喇叭', '音响', '叫卖'],
    '高空坠物': ['高空坠物', '外墙脱落', '瓷砖脱落', '坠物'],
    '私搭乱建': ['违建', '私搭', '乱建', '扩建', '加建', '楼顶'],
    '共享单车': ['共享单车', '单车', '自行车乱停'],
    '油烟污染': ['油烟', '排烟', '餐饮油烟'],
    '道路破损': ['道路破损', '路面破损', '坑洼', '井盖'],
    '绿化/树枝': ['树枝', '树木', '绿化', '修剪', '倒伏', '断枝'],
}

# 区域关键词
area_keywords = ['长丰大道', '城华路', '天顺园', '古田四路', '紫润明园', 
                 '东风村', '华生', '古田二路', '丰美路', '龙湖',
                 '长风路', '丰竹园', '紫华路']

for r in merged:
    t = r.get('派发时间') or r.get('受理时间') or ''
    if not t or len(t) < 7:
        continue
    month = t[:7]  # YYYY-MM
    month_total[month] += 1
    
    content = f"{r.get('诉求内容', '')} {r.get('诉求主题', '')} {r.get('事项小类', '')}"
    issue = r.get('事项小类', '')
    issue_clean = re.sub(r'^\d+\.', '', issue).strip()
    
    for wtype, kws in weather_keywords.items():
        for kw in kws:
            if kw in content:
                month_type[month][wtype] += 1
                break
    
    for area in area_keywords:
        if area in content:
            month_area[month][area] += 1
            break

# 按季度/季节汇总
season_map = {
    '12': '冬', '01': '冬', '02': '冬',
    '03': '春', '04': '春', '05': '春',
    '06': '夏', '07': '夏', '08': '夏',
    '09': '秋', '10': '秋', '11': '秋',
}

season_type = defaultdict(Counter)
season_total = Counter()

for month, types in month_type.items():
    m = month[5:7]  # MM
    season = season_map.get(m, '其他')
    season_total[season] += month_total.get(month, 0)
    for t, c in types.items():
        season_type[season][t] += c

print('\n=== 季节 x 事件类型 ===')
for season in ['春', '夏', '秋', '冬']:
    total = season_total.get(season, 0)
    print(f'\n--- {season}季 (总{total}件) ---')
    for t, c in season_type[season].most_common(10):
        pct = c * 100 / max(total, 1)
        print(f'  {t:14s}: {c:5d} ({pct:5.1f}%)')

# 各月份事件类型分布
print('\n=== 月度 TOP3 事件类型 ===')
for month in sorted(month_type.keys()):
    total = month_total.get(month, 0)
    top3 = month_type[month].most_common(3)
    top_str = ', '.join(f'{t}({c})' for t, c in top3)
    print(f'  {month}: {total:5d}件 | {top_str}')

# 场景模拟：暴雨→积水/环卫，高温→异味/占道，大风→坠物/违建，春节→噪音/异味，夏季→占道/单车/噪音
print('\n=== 场景关联分析 ===')
scenarios = {
    '暴雨': ['积水', '排水', '暴雨', '下水道', '窨井', '环卫', '垃圾', '清运'],
    '高温': ['异味', '臭气', '占道', '夜市', '烧烤', '油烟'],
    '大风': ['高空坠物', '外墙脱落', '瓷砖', '违建', '私搭', '树枝', '倒伏'],
    '春节': ['商业噪音', '喇叭', '异味', '油烟', '占道'],
    '夏季': ['占道', '共享单车', '噪音', '夜市', '烧烤', '积水'],
}
for scenario, kws in scenarios.items():
    matched = 0
    type_counter = Counter()
    area_counter = Counter()
    for r in merged:
        content = f"{r.get('诉求内容', '')} {r.get('事项小类', '')}"
        for kw in kws:
            if kw in content:
                matched += 1
                issue = re.sub(r'^\d+\.', '', r.get('事项小类', '')).strip()
                type_counter[issue] += 1
                for area in area_keywords:
                    if area in content:
                        area_counter[area] += 1
                        break
                break
    print(f'\n--- {scenario}场景 (匹配{matched}件) ---')
    print(f'  TOP问题: {", ".join(f"{t}({c})" for t,c in type_counter.most_common(5))}')
    print(f'  TOP区域: {", ".join(f"{a}({c})" for a,c in area_counter.most_common(5))}')

# 9月开学季分析
print('\n=== 9月开学季分析 ===')
sep_data = [(m, month_type[m]) for m in sorted(month_type.keys()) if m.endswith('-09')]
for month, types in sep_data:
    total = month_total.get(month, 0)
    print(f'  {month}: {total}件 | TOP5: {", ".join(f"{t}({c})" for t,c in types.most_common(5))}')
