#!/usr/bin/env python3
"""同步已办结工单到知识库"""
import json, os, sys
from datetime import datetime

BASE = r'C:\Users\18637\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6aa0031263dc579bd12f91f2\project\public'
KB_PATH = os.path.join(BASE, 'knowledge_base.json')
DATA_PATH = os.path.join(BASE, 'data.json')

def conv(v):
    if v is None: return None
    if isinstance(v, datetime): return v.strftime('%Y-%m-%d %H:%M:%S')
    return str(v).strip() if isinstance(v, str) else v

# 加载知识库
with open(KB_PATH, 'r', encoding='utf-8') as f:
    kb = json.load(f)
kb_ids = set(r.get('办件编号', '') for r in kb)
print(f'知识库记录数: {len(kb)}')
print(f'知识库唯一编号数: {len(kb_ids)}')

# 加载实时数据
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    realtime = json.load(f)
print(f'实时数据总数: {len(realtime)}')

# 字段映射: 实时字段 -> 知识库字段
FIELD_MAP = {
    '办件编号': '办件编号',
    '市级编号': '市级编号',
    '事件来源': '办件来源',
    '诉求主题': '诉求主题',
    '诉求内容': '诉求内容',
    '受理部门': '办理单位',
    '诉求人': '诉求人',
    '诉求人手机号': '诉求人电话',
    '处理结果': '处理结果',
    '事项大类': '事项大类',
    '事项小类': '事项小类',
    '受理时间': '派发时间',
    '承诺时间': '承诺完成时间',
    '办件状态': '办件状态',
}

# 找出已办结但不在知识库中的工单
resolved_new = []
pending_new = []
for r in realtime:
    rid = r.get('办件编号', '')
    if not rid or rid in kb_ids:
        continue
    status = str(r.get('办件状态', ''))
    # 转换为知识库格式
    kb_record = {}
    for rt_field, kb_field in FIELD_MAP.items():
        val = r.get(rt_field)
        if val is not None:
            kb_record[kb_field] = conv(val)
    kb_record['_source'] = 'realtime'
    if '已办结' in status:
        resolved_new.append(kb_record)
    else:
        pending_new.append(kb_record)

print(f'已办结且需追加: {len(resolved_new)} 条')
print(f'未办结(暂不追加): {len(pending_new)} 条')

if resolved_new:
    print('\n前5条已办结工单:')
    for r in resolved_new[:5]:
        print(f"  编号: {r.get('办件编号', '')}, 大类: {r.get('事项大类', '')}, 时间: {r.get('派发时间', '')}")

# 追加已办结工单到知识库
if resolved_new:
    # 分配序号
    max_seq = max([r.get('序号', 0) or 0 for r in kb], default=0)
    for i, r in enumerate(resolved_new):
        r['序号'] = max_seq + i + 1
    kb.extend(resolved_new)
    with open(KB_PATH, 'w', encoding='utf-8') as f:
        json.dump(kb, f, ensure_ascii=False, separators=(',', ':'))
    fsize = os.path.getsize(KB_PATH) / 1024 / 1024
    print(f'\n知识库已更新: {len(kb)} 条 (新增 {len(resolved_new)} 条已办结)')
    print(f'文件大小: {fsize:.1f} MB')
else:
    print('\n无新已办结工单需要追加')
