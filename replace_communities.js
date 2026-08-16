/**
 * 全量社区名替换脚本
 * 新社区名（5个）：学堂社区、荣东社区、六角社区、由义社区、民意社区
 *
 * 策略：将所有旧社区名循环映射到新的5个上，保证所有引用（字符串拼接的列表、网格前缀、图表数据、SVG文本）一次性口径统一
 */
const fs = require('fs');
const path = require('path');

const NEW_NAMES = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区'];

// 需要替换的所有旧社区名（按出现顺序收集，不包含已在新名单中的"六角社区"）
const OLD_NAMES = [
  '紫润北社区', '天勤社区', '丰竹园社区', '园博北社区', '长宜社区',
  '百泽社区', '东风社区', '荣荟社区', '天顺北社区', '天顺南社区',
  '新墩社区', '永利社区', '园博南社区', '长丰社区', '长源社区',
  '正康社区', '紫润南社区', '团结社区', '长宁社区', '长顺社区',
  '幸福社区', '阳光社区', '常青社区'
];

// 构造映射：旧名 → 新名（按 0,1,2,3,4 循环分配，六角社区保留原名）
const mapping = { '六角社区': '六角社区' };
OLD_NAMES.forEach((oldName, idx) => {
  mapping[oldName] = NEW_NAMES[idx % NEW_NAMES.length];
});
console.log('【映射表】');
console.log(mapping);
console.log();

// 需要遍历的目录
const SRC_DIR = path.join(__dirname, 'src');
const EXTS = new Set(['.vue', '.js']);
const REPLACED_FILES = [];

// 统计
let totalReplacements = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.isFile() && EXTS.has(path.extname(full).toLowerCase())) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  // 对旧社区名从长到短排序，避免前缀误匹配（例如长的"天顺北社区"先于短的"天顺南社区"，虽然都完整不会冲突，但以防万一）
  const orderedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
  for (const oldName of orderedKeys) {
    const newName = mapping[oldName];
    if (oldName === newName) continue; // 无需替换
    // 用 split/join 代替正则，避免特殊字符问题（社区名是纯中文安全）
    const occurrences = content.split(oldName).length - 1;
    if (occurrences > 0) {
      content = content.split(oldName).join(newName);
      totalReplacements += occurrences;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    REPLACED_FILES.push(path.relative(SRC_DIR, filePath));
  }
}

// Start
walk(SRC_DIR);

// 最后专门修正：Dashboard 中的 NEW_NAMES[0..3] 若被替换导致重复（比如多个旧名均被映射为"学堂社区"，在地图的8个社区里会出现多个同名SVG块），
// 这个需要后续通过手动改 Dashboard 来处理。脚本只做字面量替换。
console.log(`替换完成：共替换 ${totalReplacements} 处 / 涉及 ${REPLACED_FILES.length} 个文件`);
console.log('涉及文件：');
REPLACED_FILES.forEach(f => console.log('  -', f));
