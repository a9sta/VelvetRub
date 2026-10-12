/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 이 사이트는 **동·읍 단위**가 가장 깊은 쪽이다. 시도 → 시군구 → 동·읍 세 층.
 *   ★면(面)은 쪽을 내지 않는다. 가구가 흩어져 있어 한 쪽을 채울 만한 고유 사실이
 *     안 나오고, 그대로 만들면 얇은 쪽 400여 장이 된다. 대신 시군구 페이지 안에
 *     이름을 그대로 적어 검색어는 받는다.
 *   ★읍은 쪽을 낸다. 읍은 군의 중심이라 주소가 몰려 있고 실제로 방문이 들어온다.
 *
 * 뽑는 값은 전부 계산해서 나온 것이다 — 지어낸 숫자가 없다.
 *   동·읍 : 중심점 좌표 · 면적 · 가까운 거점 6곳(시군구를 넘어도 거리순) ·
 *           시군구 중심에서의 방위와 거리 · 시군구 안 면적 순위
 *   시군구 : 면적가중 중심점 · 면적 · 행정동 수 · 거점 수 · 면 목록 ·
 *           가장 먼 두 거점 사이 거리 · 가까운 시군구 5곳
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* 이 사이트가 받는 시도. ★앞서 만든 세 사이트가 수도권·부산(루네사), 전국 시군구
   (리바이브모션), 영남·대구·광주·대전·울산(세린터치)을 맡고 있다. 이쪽은 남은
   강원·충청·전라를 맡아 동·읍 쪽이 서로 한 장도 겹치지 않게 한다. */
const SIDO = {
  강원: { full: '강원특별자치도', alias: '강원도', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도' },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도' },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도' },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도' },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시' },
};
/* 경계 자료가 광주·전남을 `전남광주통합특별시` 로 합쳐 두었다. 이 다섯 구는 광주이므로
   이 사이트(전남)에서는 **뺀다**. 행정 명칭이 합쳐져도 검색어는 따라오지 않는다. */
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);

/* ── 기하 ─────────────────────────────────────────────────── */
const R = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const s = ringStats(ring, lat0);
      if (!s.area) return;
      kx = s.kx; ky = s.ky;
      const w = (idx === 0 ? 1 : -1) * Math.abs(s.area);
      A += w; X += s.cx * w; Y += s.cy * w;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky };
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
/** `포항시남구` → `포항시 남구` */
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const buckets = new Map();                 // '대구|수성구' → [{name,kind,...}]
for (const ft of geo.features) {
  const p = ft.properties;
  let sido = null;
  for (const [short, m] of Object.entries(SIDO)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시' && GWANGJU_GU.has(p.sggnm)) continue;
    sido = short; break;
  }
  if (!sido) continue;
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const k = `${sido}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push({ name, kind: kindOf(name), code: p.adm_cd2, lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area) });
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const spots = list.filter((d) => d.kind !== '면');
  const myeon = list.filter((d) => d.kind === '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko'));
  const g = {
    sidoKey, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length, myeon, myeonCount: myeon.length,
    spots: [],
  };
  /* 거점(동·읍) 쪽. 슬러그가 겹치면 뒤에 번호를 붙인다 — 조용히 덮어써지면 못 찾는다. */
  const used = new Set();
  for (const d of spots) {
    let sl = adminSlug(d.name);
    if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
    used.add(sl);
    const s = { name: d.name, kind: d.kind, slug: sl, lat: d.lat, lng: d.lng, area: d.area, guKey: k };
    g.spots.push(s); spotAll.push(s);
  }
  /* 거점끼리 가장 먼 두 곳 사이 거리 — "같은 구라도 끝과 끝이 다르다"를 숫자로 말하는 값 */
  let span = 0;
  for (let i = 0; i < g.spots.length; i++)
    for (let j = i + 1; j < g.spots.length; j++) {
      const v = haversine(g.spots[i], g.spots[j]); if (v > span) span = v;
    }
  g.spanKm = r1(span);
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* 가까운 시군구 5곳 — 시도 경계를 넘어도 거리로 본다 */
for (const g of guAll) {
  g.near = guAll.filter((o) => o !== g)
    .map((o) => ({ sido: o.sidoKey, sidoSlug: SIDO[o.sidoKey].slug, gu: o.name, slug: o.slug, km: r1(haversine(g, o)), same: o.sidoKey === g.sidoKey }))
    .sort((a, b) => a.km - b.km).slice(0, 5);
}

/* 거점별: 가까운 거점 6곳 + 구 중심에서의 방위·거리 + 구 안 면적 순위 */
const guOf = new Map(guAll.map((g) => [`${g.sidoKey}|${g.raw}`, g]));
for (const g of guAll) {
  const byArea = g.spots.slice().sort((a, b) => b.area - a.area);
  for (const s of g.spots) {
    const dy = s.lat - g.lat, dx = s.lng - g.lng;
    const ns = dy > 0.012 ? '북' : dy < -0.012 ? '남' : '';
    const ew = dx > 0.012 ? '동' : dx < -0.012 ? '서' : '';
    s.dir = (ns + ew) || '중앙';
    s.areaRank = byArea.indexOf(s) + 1;
    s.kmFromGu = r1(haversine(g, s));
    s.gu = g.name; s.guSlug = g.slug; s.sido = g.sidoKey; s.sidoSlug = SIDO[g.sidoKey].slug;
  }
}
for (const s of spotAll) {
  s.near = spotAll.filter((o) => o !== s)
    .map((o) => ({
      name: o.name, slug: o.slug, gu: o.gu, guSlug: o.guSlug,
      sido: o.sido, sidoSlug: o.sidoSlug, km: r1(haversine(s, o)), sameGu: o.guKey === s.guKey,
    }))
    .sort((a, b) => a.km - b.km).slice(0, 6);
  delete s.guKey;
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const key of Object.keys(SIDO)) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  const c = { lat: Y / A, lng: X / A };
  const byArea = gus.slice().sort((a, b) => b.area - a.area);
  for (const g of gus) {
    const dy = g.lat - c.lat, dx = g.lng - c.lng;
    const ns = dy > 0.03 ? '북' : dy < -0.03 ? '남' : '';
    const ew = dx > 0.03 ? '동' : dx < -0.03 ? '서' : '';
    g.dir = (ns + ew) || '중앙';
    g.areaRank = byArea.indexOf(g) + 1;
    g.kmFromCenter = r1(haversine(c, g));
    delete g.sidoKey;
  }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  for (const g of gus) g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  sido.push({
    name: key, full: SIDO[key].full, alias: SIDO[key].alias, slug: SIDO[key].slug, iso: SIDO[key].iso,
    lat: r6(c.lat), lng: r6(c.lng), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    gu: gus,
  });
}

const out = {
  version: VERSION,
  source: 'admdongkor (https://github.com/vuski/admdongkor) · CC BY 4.0 · 원자료 국가공간정보포털 행정동 경계',
  built: new Date().toISOString().slice(0, 10),
  coverageFrom: '행정동 경계 자료에서 강원·충북·충남·전북·전남 전역을 그대로 뽑았다(광주 5구는 전남에서 뺐다·면은 쪽을 내지 않고 이름만 적는다)',
  counts: {
    sido: sido.length,
    gu: guAll.length,
    spot: spotAll.length,
    dong: spotAll.filter((s) => s.kind === '동').length,
    eup: spotAll.filter((s) => s.kind === '읍').length,
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido} · 시군구 ${C.gu} · 거점(쪽 있음) ${C.spot} = 동 ${C.dong} + 읍 ${C.eup} · 면(쪽 없음) ${C.myeon} · 행정동 합 ${C.admin}`);
for (const s of sido) console.log(`   ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 거점 ${String(s.spotCount).padStart(3)} · 면 ${String(s.myeonCount).padStart(3)}`);
const noSpot = guAll.filter((g) => !g.spotCount);
if (noSpot.length) console.log(`★거점 없는 시군구 ${noSpot.length}곳: ${noSpot.map((g) => g.name).join(', ')}`);
