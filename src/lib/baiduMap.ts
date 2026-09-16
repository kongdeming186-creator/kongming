// 百度地图 JS API v3.0 动态加载器 + 坐标转换（真实卫星影像底图基础设施）
// 官方文档: https://lbsyun.baidu.com/index.php?title=jspopular3.0
import type { BadAny } from './badAny';

/** 百度地图 API 宽松类型（百度官方无类型声明，仅用到的成员动态调用） */
export type BMapApi = BadAny;

/** 平台内置百度地图浏览器端 AK（浏览器 AK 属公开信息，需在百度地图控制台配置 Referer 白名单防盗用） */
export const BAIDU_MAP_AK = 'OeTpXHgdUrRT2pPyAPRL7pog6GlMlQzl';

/** 长丰街道办事处（GCJ-02）：硚口区长丰街道办事处 */
export const MAP_CENTER_GCJ: [number, number] = [114.21, 30.61];

/** 初始缩放级别（16 级，道路级别） */
export const MAP_ZOOM = 16;

let loadPromise: Promise<BMapApi> | null = null;

/** 动态注入百度地图 JS API（幂等，JSONP 回调式加载） */
export function loadBaiduMap(): Promise<BMapApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('非浏览器环境'));
  const w = window as unknown as Record<string, BMapApi>;
  if (w.BMap) return Promise.resolve(w.BMap);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<BMapApi>((resolve, reject) => {
    const callback = '__bmap_jsonp_ready__';
    const timer = setTimeout(() => reject(new Error('百度地图脚本加载超时')), 15000);
    w[callback] = () => {
      clearTimeout(timer);
      if (w.BMap) {
        resolve(w.BMap);
      } else {
        reject(new Error('百度地图初始化异常'));
      }
    };
    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_AK}&callback=${callback}`;
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('百度地图脚本加载失败（网络不可用或 AK 无效）'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

/** GCJ-02（国测局/高德坐标系）→ BD-09（百度坐标系），公开换算公式 */
export function gcj02ToBd09(lng: number, lat: number): [number, number] {
  const xPi = (Math.PI * 3000) / 180;
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPi);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPi);
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
}
