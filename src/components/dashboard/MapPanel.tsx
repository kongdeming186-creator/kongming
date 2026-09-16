// 中央地图：百度地图 + Canvas 标准热力图覆盖物（事件真实地址密度分布）
// 热力图数据来自真实 12345 工单（data.json + 实时接口），渐变：事件少→绿，事件多→红；点击热力区域弹出附近事件列表
import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Layers, Loader2, Map as MapIcon, X } from 'lucide-react';
import { gcj02ToBd09, loadBaiduMap, MAP_CENTER_GCJ, MAP_ZOOM, type BMapApi } from '@/lib/baiduMap';
import { type CommunityInfo } from '@/data/communities';
import { type EventCategory, type HazardEvent, CATEGORY_COLORS } from '@/data/eventData';
import { useFilteredData } from '@/hooks/useFilteredData';
import { useRealData } from '@/contexts/RealDataContext';
import CommunityDetail from './CommunityDetail';
import EventDetailCard from './EventDetailCard';

interface MapPanelProps {
  onSelect: (c: CommunityInfo | null) => void;
  selected: CommunityInfo | null;
  selectedEvent: HazardEvent | null;
  onSelectEvent: (e: HazardEvent | null) => void;
  onMatchCases: (query: string) => void;
  activeScenario: string | null;
  /** 注册地图定位能力（GCJ-02 入参，自动转 BD-09），供页面级城运事件弹窗调用 */
  registerLocate?: (fn: (lng: number, lat: number) => void) => void;
}

/** HTML 转义（覆盖物标签内容拼 HTML 前调用，防数据驱动的标签注入） */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));
}

// 热力图渐变色带：事件少→绿，事件多→黄→红
const HEAT_STOPS: [number, string][] = [
  [0.0, 'rgba(34,197,94,0)'],
  [0.2, 'rgba(34,197,94,0.55)'],
  [0.45, 'rgba(234,179,8,0.75)'],
  [0.7, 'rgba(249,115,22,0.85)'],
  [1.0, 'rgba(220,38,38,0.95)'],
];
const HEAT_RADIUS = 38;
const NEARBY_THRESHOLD_PX = 46;

/** 预生成 256 级热力色带（按强度查表）；注意 CSS rgba 的 alpha 是 0~1，需换算为 0~255 */
const HEAT_PALETTE: [number, number, number, number][] = (() => {
  const stops = HEAT_STOPS.map(([t, c]) => {
    const [r, g, b, a] = c.replace(/rgba?\(|\)/g, '').split(',').map(Number);
    return { t, r, g, b, a: a * 255 };
  });
  return Array.from({ length: 256 }, (_, i) => {
    const t = i / 255;
    if (t <= 0) return [0, 0, 0, 0];
    for (let s = 1; s < stops.length; s++) {
      if (t <= stops[s].t) {
        const s0 = stops[s - 1];
        const s1 = stops[s];
        const k = (t - s0.t) / (s1.t - s0.t || 1);
        return [
          Math.round(s0.r + (s1.r - s0.r) * k),
          Math.round(s0.g + (s1.g - s0.g) * k),
          Math.round(s0.b + (s1.b - s0.b) * k),
          Math.round(s0.a + (s1.a - s0.a) * k),
        ];
      }
    }
    const last = stops[stops.length - 1];
    return [last.r, last.g, last.b, last.a];
  });
})();

/** 场景 → 关键词（用于从历史事件中匹配真实风险点位） */
const SCENARIO_KEYWORDS: Record<string, string[]> = {
  rainstorm: ['暴雨', '大雨', '积水', '淹水', '内涝', '排水', '井盖', '下水道', '雨污', '水浸', '雨涝'],
  hightemp: ['高温', '异味', '臭味', '臭气', '夜市', '油烟', '垃圾', '炎热', '热'],
  gale: ['大风', '狂风', '台风', '坠物', '掉落', '吹落', '树枝', '外墙', '搭建', '违建'],
  summer: ['占道', '单车', '共享', '噪音', '夜市', '烧烤', '油烟'],
  spring: ['噪音', '油烟', '占道', '鞭炮', '烟花', '春节'],
};

/** 事件是否命中某场景关键词 */
function eventMatchesScenario(e: HazardEvent, scenario: string): boolean {
  const kws = SCENARIO_KEYWORDS[scenario];
  if (!kws?.length) return false;
  const text = `${e.content} ${e.category} ${e.community}`;
  return kws.some((kw) => text.includes(kw));
}

/** 两点间 haversine 距离（米） */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 简单 DBSCAN 聚类（基于真实距离，单位：米） */
function clusterEvents(events: HazardEvent[], radiusMeters: number): HazardEvent[][] {
  if (events.length === 0) return [];
  const visited = new Set<string>();
  const clusters: HazardEvent[][] = [];
  for (const e of events) {
    if (visited.has(e.id)) continue;
    const cluster: HazardEvent[] = [];
    const queue: HazardEvent[] = [e];
    visited.add(e.id);
    while (queue.length) {
      const cur = queue.shift()!;
      cluster.push(cur);
      for (const other of events) {
        if (visited.has(other.id)) continue;
        if (haversineM(cur.lat, cur.lng, other.lat, other.lng) <= radiusMeters) {
          visited.add(other.id);
          queue.push(other);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

/** 聚类中心（均值） */
function centroid(events: HazardEvent[]): { lng: number; lat: number } {
  const lng = events.reduce((s, e) => s + e.lng, 0) / events.length;
  const lat = events.reduce((s, e) => s + e.lat, 0) / events.length;
  return { lng, lat };
}

/**
 * Canvas 标准热力图覆盖物（继承百度地图 Overlay）
 * 算法：① 离屏画布累积各事件点的强度（alpha 随局部密度叠加）→ ② 按强度查 256 级色带上色（绿→黄→红）→ ③ 放大绘制
 */
function createHeatOverlay(BMap: BMapApi, points: { lng: number; lat: number; weight: number }[]) {
  const HeatOverlay: any = function (this: any) {
    this._points = points;
  };
  HeatOverlay.prototype = new BMap.Overlay();
  HeatOverlay.prototype.initialize = function (map: any) {
    this._map = map;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '2';
    canvas.style.pointerEvents = 'none';
    this._canvas = canvas;
    map.getPanes().labelPane.appendChild(canvas);
    return canvas;
  };
  HeatOverlay.prototype.draw = function () {
    const map = this._map;
    const canvas = this._canvas;
    if (!map || !canvas) return;
    const size = map.getSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ① 低分辨率强度图：每个事件点画 radial gradient，alpha=weight，密集区域自然叠加变高
    const SCALE = 0.5;
    const w = Math.max(1, Math.round(size.width * SCALE));
    const h = Math.max(1, Math.round(size.height * SCALE));
    const heat = document.createElement('canvas');
    heat.width = w;
    heat.height = h;
    const hctx = heat.getContext('2d');
    if (!hctx) return;
    hctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const pts = this._points as { lng: number; lat: number; weight: number }[];

    // 像素坐标缓存：同一缩放级别下「各点相对首点的像素偏移」与平移无关，
    // 拖动地图时仅需 1 次坐标换算 + 偏移累加，避免每次 pan 对全部点位重复换算
    const zoom = map.getZoom();
    if (this._cacheZoom !== zoom || !this._deltas) {
      this._cacheZoom = zoom;
      const base0 = pts.length ? map.pointToOverlayPixel(new BMap.Point(pts[0].lng, pts[0].lat)) : { x: 0, y: 0 };
      const deltas = new Float32Array(pts.length * 2);
      for (let i = 0; i < pts.length; i++) {
        const px = i === 0 ? base0 : map.pointToOverlayPixel(new BMap.Point(pts[i].lng, pts[i].lat));
        deltas[i * 2] = px.x - base0.x;
        deltas[i * 2 + 1] = px.y - base0.y;
      }
      this._deltas = deltas;
      this._base = base0;
    } else {
      this._base = pts.length ? map.pointToOverlayPixel(new BMap.Point(pts[0].lng, pts[0].lat)) : { x: 0, y: 0 };
    }
    const base = this._base as { x: number; y: number };
    const deltas = this._deltas as Float32Array;
    for (let i = 0; i < pts.length; i++) {
      const px = { x: base.x + deltas[i * 2], y: base.y + deltas[i * 2 + 1] };
      // 视口外裁剪，减少无效绘制
      if (px.x < -HEAT_RADIUS || px.y < -HEAT_RADIUS || px.x > size.width + HEAT_RADIUS || px.y > size.height + HEAT_RADIUS) continue;
      const grad = hctx.createRadialGradient(px.x, px.y, 0, px.x, px.y, HEAT_RADIUS);
      grad.addColorStop(0, `rgba(0,0,0,${Math.min(1, pts[i].weight).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      hctx.fillStyle = grad;
      hctx.beginPath();
      hctx.arc(px.x, px.y, HEAT_RADIUS, 0, Math.PI * 2);
      hctx.fill();
    }

    // ② 强度 → 色带上色（事件少→绿，事件多→红，体现渐变过程）
    const img = hctx.getImageData(0, 0, w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const intensity = data[i + 3];
      if (intensity === 0) continue;
      const c = HEAT_PALETTE[intensity];
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = c[3];
    }
    hctx.putImageData(img, 0, 0);

    // ③ 放大绘制到主画布（平滑插值）
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(heat, 0, 0, canvas.width, canvas.height);
  };
  return HeatOverlay;
}

/** 密度统计半径（度，约 240m） */
const DENSITY_R = 0.0022;

/** 事件点局部密度权重：空间网格法（O(n)）统计半径内邻点数，归一化到 0.35~1.0（稀疏→绿、密集→红的渐变基础） */
function densityWeights(events: HazardEvent[]): number[] {
  const n = events.length;
  if (n === 0) return [];
  // 按 DENSITY_R 网格分桶，只比较 3×3 邻桶内的点（精确距离过滤，结果与 O(n²) 一致）
  const cells = new Map<string, number[]>();
  const cellOf = (lng: number, lat: number): [number, number] => [
    Math.floor(lng / DENSITY_R),
    Math.floor(lat / DENSITY_R),
  ];
  for (let i = 0; i < n; i++) {
    const [cx, cy] = cellOf(events[i].lng, events[i].lat);
    const key = `${cx},${cy}`;
    let bucket = cells.get(key);
    if (!bucket) {
      bucket = [];
      cells.set(key, bucket);
    }
    bucket.push(i);
  }
  const counts = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    const [cx, cy] = cellOf(events[i].lng, events[i].lat);
    let c = 0;
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const bucket = cells.get(`${gx},${gy}`);
        if (!bucket) continue;
        for (const j of bucket) {
          const dx = events[i].lng - events[j].lng;
          const dy = events[i].lat - events[j].lat;
          if (dx * dx + dy * dy <= DENSITY_R * DENSITY_R) c++;
        }
      }
    }
    counts[i] = c;
  }
  const max = Math.max(...counts, 1);
  return counts.map((c) => 0.35 + 0.65 * (c / max));
}

export default function MapPanel({
  onSelect, selected, selectedEvent, onSelectEvent, onMatchCases, activeScenario,
  registerLocate
}: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<BMapApi | null>(null);
  const heatOverlayRef = useRef<any>(null);
  const boundaryOverlaysRef = useRef<any[]>([]);
  const boundaryClampRef = useRef<(() => void) | null>(null);
  const scenarioOverlaysRef = useRef<any[]>([]);
  const scenarioAnimRef = useRef<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [nearbyEvents, setNearbyEvents] = useState<HazardEvent[] | null>(null);
  // 热力图事件大类筛选：null=全部大类
  const [heatCategory, setHeatCategory] = useState<EventCategory | null>(null);

  const fd = useFilteredData();
  const { data: realData } = useRealData();
  // 热力图数据：全部真实事件（按真实地址/社区点位分布，跟随全局时间筛选）
  const events = fd?.hazardEvents ?? [];
  const communityStats = fd?.communityStats;
  // 场景模拟使用全量历史事件（不受时间筛选影响），基于真实工单内容定位风险
  const allEvents = realData?.hazardEvents ?? events;

  // 各事件大类的工单数量（悬浮筛选面板展示，按数量降序）
  const categoryCounts = useMemo(() => {
    const m = new Map<EventCategory, number>();
    for (const e of events) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [events]);

  // 当前筛选大类下的事件（null=全部），热力图与点击就近事件均基于该集合
  const shownEvents = useMemo(
    () => (heatCategory ? events.filter((e) => e.category === heatCategory) : events),
    [events, heatCategory],
  );

  // 热力图点位权重：按局部事件密度预计算（稀疏→低权重偏绿，密集→高权重偏红）
  // 以「大类 + 事件 id 签名」做缓存：60s 自动刷新产生的新数组若内容未变则直接复用，避免无谓重算导致掉帧
  const heatPointsCacheRef = useRef<{ sig: string; pts: { lng: number; lat: number; weight: number }[] }>({ sig: '', pts: [] });
  const heatPoints = useMemo(() => {
    const sig = `${heatCategory ?? 'all'}|${shownEvents.map((e) => e.id).join(',')}`;
    const cached = heatPointsCacheRef.current;
    if (cached.sig === sig) return cached.pts;
    const pts = shownEvents.length === 0 ? [] : (() => {
      const weights = densityWeights(shownEvents);
      return shownEvents.map((e, i) => {
        const [lng, lat] = gcj02ToBd09(e.lng, e.lat);
        return { lng, lat, weight: weights[i] };
      });
    })();
    heatPointsCacheRef.current = { sig, pts };
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownEvents, heatCategory]);

  const statsOf = (c: CommunityInfo) => communityStats?.[c.name];

  const handleSelectCommunity = (c: CommunityInfo) => {
    const s = statsOf(c);
    if (!s) { onSelect(c); return; }
    onSelect({
      ...c,
      orders: s.orders,
      riskLevel: s.riskLevel,
      riskScore: s.riskScore,
      topIssues: s.topIssues,
      resolveRate: s.resolveRate,
      avgDays: Math.round(s.avgPendingDays),
      trend: s.trend,
    });
  };

  // 初始化普通地图
  useEffect(() => {
    let disposed = false;
    loadBaiduMap().then((BMap) => {
      if (disposed || !containerRef.current) return;
      const [lng, lat] = gcj02ToBd09(MAP_CENTER_GCJ[0], MAP_CENTER_GCJ[1]);
      const map = new BMap.Map(containerRef.current, {
        mapType: (window as unknown as Record<string, number>).BMAP_NORMAL_MAP ?? 0,
        enableMapClick: false,
        minZoom: 13,
        maxZoom: 19,
      });
      map.centerAndZoom(new BMap.Point(lng, lat), MAP_ZOOM);
      map.enableScrollWheelZoom(true);
      map.enableDragging();
      map.enableContinuousZoom();
      mapRef.current = map;
      setStatus('ready');
      // 暴露地图定位能力（GCJ-02 入参，内部转 BD-09），供页面级城运事件弹窗调用
      registerLocate?.((glng, glat) => {
        const [blng, blat] = gcj02ToBd09(glng, glat);
        map.panTo(new BMap.Point(blng, blat));
        map.setZoom(17);
      });
    }).catch(() => { if (!disposed) setStatus('error'); });
    return () => {
      disposed = true;
      if (heatOverlayRef.current) mapRef.current?.removeOverlay?.(heatOverlayRef.current);
      heatOverlayRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => mapRef.current?.checkResize?.());
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  // ⓪ 长丰街道行政区域边界（百度地图 Boundary API）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
    if (!BMap) return;

    // 清除旧边界覆盖物与拖拽范围监听
    boundaryOverlaysRef.current.forEach((o) => map.removeOverlay(o));
    boundaryOverlaysRef.current = [];
    if (boundaryClampRef.current) {
      map.removeEventListener('moveend', boundaryClampRef.current);
      boundaryClampRef.current = null;
    }

    const bdary = new (BMap as unknown as Record<string, any>).Boundary();
    bdary.get('硚口区长丰街', (rs: { boundaries: string[] }) => {
      if (!rs || !rs.boundaries || rs.boundaries.length === 0) return;
      const allPoints: any[] = [];
      for (let i = 0; i < rs.boundaries.length; i++) {
        const ply = new (BMap as unknown as Record<string, any>).Polygon(rs.boundaries[i], {
          strokeColor: '#FFA96E',
          strokeWeight: 2,
          strokeOpacity: 0.9,
          fillColor: '#DDE4F0',
          fillOpacity: 0.15,
        });
        map.addOverlay(ply);
        boundaryOverlaysRef.current.push(ply);
        allPoints.push(...ply.getPath());
      }
      // 居中至长丰街道办事处，保持道路级缩放，限制拖拽范围
      if (allPoints.length > 0) {
        // 计算边界外接矩形，作为拖拽限制范围
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        for (const pt of allPoints) {
          const lng = pt.lng;
          const lat = pt.lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        // 限制地图中心点不超出边界范围（监听器记录到 ref，effect 卸载时移除）
        const clampCenter = () => {
          const center = map.getCenter();
          if (center.lng < minLng || center.lng > maxLng || center.lat < minLat || center.lat > maxLat) {
            const clampedLng = Math.max(minLng, Math.min(maxLng, center.lng));
            const clampedLat = Math.max(minLat, Math.min(maxLat, center.lat));
            map.panTo(new BMap.Point(clampedLng, clampedLat));
          }
        };
        boundaryClampRef.current = clampCenter;
        map.addEventListener('moveend', clampCenter);
      }
    });
    return () => {
      if (boundaryClampRef.current) {
        mapRef.current?.removeEventListener('moveend', boundaryClampRef.current);
        boundaryClampRef.current = null;
      }
    };
  }, [status]);

  // ② Canvas 热力图覆盖物：全部真实事件按地址点位渲染密度热力（绿→黄→红渐变），缩放/拖动由 Overlay.draw 自动重绘
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
    if (!BMap) return;

    // 清除旧热力图层覆盖物
    if (heatOverlayRef.current) {
      map.removeOverlay(heatOverlayRef.current);
      heatOverlayRef.current = null;
    }
    if (heatPoints.length === 0) return;

    const HeatOverlay = createHeatOverlay(BMap, heatPoints);
    const overlay: any = new HeatOverlay();
    map.addOverlay(overlay);
    heatOverlayRef.current = overlay;

    // 百度地图初始定位动画期间覆盖物 pane 原点未与视口对齐，首次 draw 会全部裁空；
    // 等待定位完成（延时重绘 + moveend/zoomend）后再触发 draw，保证热力渲染到位
    const redraw = () => {
      if (heatOverlayRef.current === overlay) {
        if (typeof overlay.redraw === 'function') overlay.redraw();
        else overlay.draw();
      }
    };
    const timers = [400, 1200, 2600].map((ms) => window.setTimeout(redraw, ms));
    map.addEventListener('moveend', redraw);
    map.addEventListener('zoomend', redraw);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      map.removeEventListener('moveend', redraw);
      map.removeEventListener('zoomend', redraw);
    };
  }, [status, heatPoints]);

  // ②'' 场景模拟：选择暴雨/高温/大风/夏季/春节时，基于历史真实工单内容聚类定位风险区域并红色闪烁
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
    if (!BMap) return;

    // 清除旧场景覆盖物
    if (scenarioAnimRef.current) {
      cancelAnimationFrame(scenarioAnimRef.current);
      scenarioAnimRef.current = null;
    }
    scenarioOverlaysRef.current.forEach((o) => map.removeOverlay(o));
    scenarioOverlaysRef.current = [];

    if (!activeScenario) return;

    // 1. 从历史全量事件中匹配场景关键词
    const matched = allEvents.filter((e) => eventMatchesScenario(e, activeScenario));
    if (matched.length === 0) return;

    // 2. 聚类（暴雨/大风等空间聚集明显，半径 220m；其他 260m）
    const clusterRadius = activeScenario === 'rainstorm' || activeScenario === 'gale' ? 220 : 260;
    const clusters = clusterEvents(matched, clusterRadius);

    const Circle = (BMap as unknown as Record<string, any>).Circle;
    if (!Circle) return;

    const circles: { circle: any; cluster: HazardEvent[] }[] = [];
    clusters.forEach((cluster) => {
      const c = centroid(cluster);
      const [lng, lat] = gcj02ToBd09(c.lng, c.lat);
      // 半径根据聚类规模动态调整（单点 120m，大聚类最高 500m）
      const radius = Math.min(500, Math.max(120, 60 + cluster.length * 35));
      const circle = new Circle(new BMap.Point(lng, lat), radius, {
        strokeColor: '#ff0000',
        strokeWeight: 3,
        strokeOpacity: 0.9,
        fillColor: '#ff0000',
        fillOpacity: 0.25,
      });
      // 点击风险圈 → 弹出该簇真实事件列表 / 单事件直接打开详情
      circle.addEventListener('click', () => {
        if (cluster.length === 1) {
          onSelectEvent(cluster[0]);
          setNearbyEvents(null);
        } else {
          setNearbyEvents(cluster.slice(0, 20));
        }
      });
      map.addOverlay(circle);
      circles.push({ circle, cluster });

      // 风险标签：数量 + 聚类内主要社区（2 件及以上才显示，避免单点标签过多重叠）
      if (cluster.length >= 2) {
        const topCommunity = cluster.reduce<Map<string, number>>((acc, e) => {
          acc.set(e.community, (acc.get(e.community) ?? 0) + 1);
          return acc;
        }, new Map());
        const mainCommunity = [...topCommunity.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
        const safeCommunity = escapeHtml(mainCommunity);
        const labelText = safeCommunity ? `${safeCommunity} ${cluster.length}件` : `${cluster.length}件`;
        const label = new BMap.Label(
          `<div style="text-align:center;background:rgba(196,30,36,0.9);color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:700;white-space:nowrap;">${labelText}</div>`,
          { position: new BMap.Point(lng, lat), offset: new BMap.Size(0, -15) }
        );
        label.setStyle({ border: 'none', background: 'transparent' });
        map.addOverlay(label);
        scenarioOverlaysRef.current.push(label);
      }
    });
    scenarioOverlaysRef.current.push(...circles.map((c) => c.circle));

    // 闪烁动画：透明度周期变化
    let phase = 0;
    let animWarned = false;
    const animate = () => {
      phase += 0.05;
      const opacity = 0.15 + Math.abs(Math.sin(phase)) * 0.35;
      circles.forEach(({ circle }) => {
        try {
          circle.setFillOpacity(opacity);
          circle.setStrokeOpacity(0.6 + Math.abs(Math.sin(phase)) * 0.4);
        } catch (err) {
          // 动画循环内避免刷屏，仅首次失败告警
          if (!animWarned) {
            animWarned = true;
            console.warn('[MapPanel] 场景圈动画属性更新失败', err);
          }
        }
      });
      scenarioAnimRef.current = requestAnimationFrame(animate);
    };
    scenarioAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (scenarioAnimRef.current) {
        cancelAnimationFrame(scenarioAnimRef.current);
        scenarioAnimRef.current = null;
      }
    };
  }, [status, activeScenario, allEvents]);

  // ③ 点击地图：点中单个事件 → 打开事件详情；多个事件 → 弹出附近事件列表（跟随当前大类筛选）
  const handleMapClick = (e: { clientX?: number; clientY?: number; point?: { lng: number; lat: number } }) => {
    if (!e.point || shownEvents.length === 0) return;
    const map = mapRef.current;
    const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
    if (!map || !BMap) return;
    const clickPx = map.pointToOverlayPixel(new BMap.Point(e.point.lng, e.point.lat));
    const nearby = shownEvents.filter((ev) => {
      const [lng, lat] = gcj02ToBd09(ev.lng, ev.lat);
      const px = map.pointToOverlayPixel(new BMap.Point(lng, lat));
      const dist = Math.sqrt((px.x - clickPx.x) ** 2 + (px.y - clickPx.y) ** 2);
      return dist <= NEARBY_THRESHOLD_PX;
    });
    // 只点中一个事件 → 直接打开详情卡片
    if (nearby.length === 1) {
      onSelectEvent(nearby[0]);
      setNearbyEvents(null);
    } else {
      setNearbyEvents(nearby.length ? nearby : null);
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    map.addEventListener('click', handleMapClick);
    return () => map.removeEventListener('click', handleMapClick);
  }, [status, shownEvents, onSelectEvent]);

  // 列表定位：选中事件后平移地图
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !selectedEvent) return;
    const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
    if (!BMap) return;
    const [lng, lat] = gcj02ToBd09(selectedEvent.lng, selectedEvent.lat);
    map.panTo(new BMap.Point(lng, lat));
    // 选中事件时清除附近事件列表，避免遮挡详情卡片
    setNearbyEvents(null);
  }, [selectedEvent, status]);

  return (
    <div className="screen-panel corner-decor relative min-h-0 flex-1 overflow-hidden rounded-md">
      {/* 标题 + 图层切换 */}
      <div className="absolute left-3 top-2.5 z-30 flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <Layers className="h-4 w-4 text-primary" />
        长丰街道事件热力图
        <span className="flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs font-normal text-primary">
          <MapIcon className="h-3 w-3" />
          地图·道路标注
        </span>
      </div>

      {/* 右上角悬浮：事件大类筛选（切换对应大类的热力分布） */}
      <div className="absolute right-3 top-2.5 z-30 w-[104px] rounded-md border border-border/60 bg-background/85 py-1 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-1 px-2 pb-1 pt-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
          <Layers className="h-3 w-3 text-primary" />
          事件大类
          <span className="ml-auto font-normal text-muted-foreground/70">{shownEvents.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setHeatCategory(null)}
          className={`flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-[11px] transition-colors ${
            heatCategory === null ? 'bg-primary/20 font-semibold text-primary' : 'text-foreground/75 hover:bg-primary/10'
          }`}
        >
          <span className="h-2 w-2 rounded-full border border-border" style={{ background: 'linear-gradient(90deg,#22c55e,#ef4444)' }} />
          全部大类
          <span className="ml-auto text-[10px] text-muted-foreground">{events.length}</span>
        </button>
        {categoryCounts.map(([cat, n]) => {
          const isActive = heatCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setHeatCategory(isActive ? null : cat)}
              className={`flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-[11px] transition-colors ${
                isActive ? 'bg-primary/20 font-semibold text-primary' : 'text-foreground/75 hover:bg-primary/10'
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[cat], boxShadow: isActive ? `0 0 6px ${CATEGORY_COLORS[cat]}` : 'none' }} />
              {cat}
              <span className="ml-auto text-[10px] text-muted-foreground">{n}</span>
            </button>
          );
        })}
      </div>

      {/* 地图容器 */}
      <div
        ref={containerRef}
        className="map-gov-frame absolute inset-x-2 bottom-2 top-9 rounded-md bg-secondary/20"
        style={{ filter: 'brightness(0.85) sepia(0.3) saturate(1.15)' }}
      />

      {/* 科技网格叠加层 */}
      <div className="tech-grid-overlay pointer-events-none absolute inset-x-2 bottom-2 top-9 z-10 rounded-md" />

      {/* 加载 / 失败浮层 */}
      {status !== 'ready' && (
        <div className="absolute inset-x-2 bottom-2 top-9 z-20 flex flex-col items-center justify-center gap-2 rounded-md border border-border/60 bg-background/85 backdrop-blur-sm">
          {status === 'loading' ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">地图加载中…</p>
            </>
          ) : (
            <>
              <MapIcon className="h-8 w-8 text-primary/60" />
              <p className="text-sm font-medium text-foreground">地图加载失败</p>
              <p className="text-xs text-muted-foreground">请检查网络连接后刷新页面重试</p>
            </>
          )}
        </div>
      )}

      {/* 附近事件列表弹窗 */}
      {nearbyEvents && (
        <div className="absolute right-3 top-12 z-50 w-[460px] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border border-primary/40 bg-background/95 shadow-[0_0_28px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-border/70 bg-secondary/50 px-3 py-2">
            <Flame className="h-4 w-4 text-risk-high" />
            <span className="text-sm font-semibold text-foreground">区域事件列表</span>
            <span className="font-digital text-xs text-primary">（{nearbyEvents.length} 件）</span>
            <button
              type="button"
              onClick={() => setNearbyEvents(null)}
              className="ml-auto grid h-6 w-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="hre-scroll max-h-[70vh] space-y-1.5 overflow-y-auto p-3">
            {nearbyEvents.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { onSelectEvent(e); setNearbyEvents(null); }}
                className="block w-full rounded border border-border/70 bg-secondary/25 px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-[rgba(212,168,67,0.08)]"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="font-digital shrink-0 text-[11px] font-semibold text-primary">{e.id.replace(/[-\s]/g, '').slice(-6)}</span>
                  <span className="shrink-0 rounded bg-primary/15 px-1 py-px text-[9px] text-primary">{e.category}</span>
                  <span className={`shrink-0 rounded px-1 py-px text-[9px] ${e.status?.includes('已办结') ? 'bg-success/15 text-success' : 'bg-risk-high/15 text-risk-high'}`}>{e.status ?? '未知'}</span>
                  <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">{e.time}</span>
                </div>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground">{e.content}</p>
                <div className="mt-1 flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span>{e.community}</span>
                  {e.address && <><span>·</span><span className="line-clamp-1">{e.address}</span></>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 事件详情卡片（左）+ 社区下钻详情（右） */}
      <EventDetailCard
        event={selectedEvent}
        onClose={() => onSelectEvent(null)}
        onMatchCases={onMatchCases}
        onLocate={() => {
          const map = mapRef.current;
          const BMap = (window as unknown as Record<string, BMapApi | undefined>).BMap;
          if (map && BMap && selectedEvent) {
            const [lng, lat] = gcj02ToBd09(selectedEvent.lng, selectedEvent.lat);
            map.panTo(new BMap.Point(lng, lat));
            map.setZoom(17);
          }
        }}
      />

      <CommunityDetail community={selected} onClose={() => onSelect(null)} />
    </div>
  );
}
