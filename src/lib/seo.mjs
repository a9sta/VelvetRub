/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 세 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *   가운데 이음은 줄표(—), 브랜드 앞은 가운뎃점(·)이다. 넷이 서로 다른 구두점 모양이 된다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 *
 * 디스크립션은 **가운데 문장을 그 자리의 실측값으로 채운다.** 경쟁사 설명이
 * 둘째·셋째 문장을 글자까지 돌려 쓰는 약점을 피하려는 것이다.
 */
import { hash, km, km2, dirWord, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '벨벳럽';
const KEY = '출장마사지·홈타이 방문 관리';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '경락', '림프', '건식'];
/** 제목 꼬리 행동어 */
const ACT = ['거리 확인', '늦은 밤 접수', '오늘 접수', '출장 안내', '길 안내'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} 출장마사지 홈타이 — 강원·충북·충남·전북·전남 동읍 방문 관리 24시`,
  areaHub: (c) => `동·읍 ${c.spot}곳 출장마사지 받는 자리 — 시군구 ${c.gu}곳 홈타이 방문 · ${BRAND}`,
  sido: (sd) => `${sd.name} 출장마사지 홈타이 — ${sd.name} 동읍 ${sd.spotCount}곳 방문 ${at(hash(sd.name, 'sdt'), ACT)} · ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    return `${g.name} 출장마사지 홈타이 — ${sd.name} ${g.name} 동읍 ${g.spotCount}곳 방문 ${at(h, ACT, 0)} · ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${at(h, COURSE_WORD, 0)} 출장마사지 홈타이 — ${g.name} ${s.name} 방문 ${at(h, ACT, 1)} · ${BRAND}`;
  },
  course: (c) => `${c.ko} 출장마사지 홈타이 — ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} · ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} 출장마사지 — ${sd.name} 홈타이 방문 ${at(hash(sd.name, c.slug), ACT)} · ${BRAND}`,
  page: (t) => `${t} — ${BRAND} 출장마사지 홈타이`,
  post: (p) => `${p.title} — ${BRAND} 방문 기록`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 거점 설명 가운데 문장 — 그 동·읍에서만 나오는 숫자로 짠다. */
function spotMiddle(sd, g, s, h) {
  const n0 = s.near[0], n1 = s.near[1];
  const frames = [
    () => `${g.name} 중심에서 ${km(s.kmFromGu)} ${dirWord(s.dir)}, 넓이는 ${km2(s.area)}`,
    () => `다음 거점 ${n0.name}까지 ${km(n0.km)}·${n1.name}까지 ${km(n1.km)}`,
    () => `${g.name} 거점 ${g.spotCount}곳 중 ${s.areaRank}번째로 넓은 ${km2(s.area)}`,
    () => `${s.kind === '읍' ? `${g.name}에서 길이 모이는 읍, 둘레는 면 ${g.myeonCount}곳` : `${km2(s.area)}에 ${n0.name}과 ${km(n0.km)} 거리`}`,
    () => `잰 거리로 ${n0.name} ${km(n0.km)}, ${g.name} 중심에서 ${km(s.kmFromGu)}`,
    () => `${g.name} ${dirWord(s.dir)} ${km2(s.area)}, 드는 길은 ${n0.name} 쪽`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '예약 문의 버튼으로 접수하고 마친 뒤 계산합니다',
  '안심번호 한 통이면 되고 미리 보내실 것이 없습니다',
  '24시간 전화가 이어지며 새벽 할증이 없습니다',
  '길 값을 따로 붙이지 않고 후불로 받습니다',
  '밤낮 없이 접수하고 값은 어느 자리든 같습니다',
];

export const desc = {
  home: () =>
    '강원·충북·충남·전북·전남 동·읍 438곳 출장마사지·홈타이 방문 관리. 사시는 동이나 읍을 눌러 잰 거리와 가까운 거점을 먼저 확인하시고, 안심번호로 접수해 마친 뒤 계산하십시오.',
  areaHub: (c) =>
    `출장마사지·홈타이를 받는 동·읍 ${c.spot}곳을 시도와 시군구로 갈라 두었습니다. 자리마다 넓이와 방향, 가까운 거점까지 잰 거리를 적어 길이가 왜 다른지 알 수 있게 했습니다.`,
  sido: (sd) =>
    `${sd.name} ${KEY} 안내. 시군구 ${sd.gu.length}곳·동읍 ${sd.spotCount}곳에 쪽을 두고 면 ${sd.myeonCount}곳도 같은 번호로 받습니다. 후불이고 24시간 전화가 이어집니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const n0 = g.near[0];
    const mid = [
      `동·읍 ${g.spotCount}곳에 쪽을 두었고 넓이는 ${km2(g.area)}`,
      `${g.dir === '중앙' ? `${sd.name} 가운데` : `${sd.name} ${dirWord(g.dir)}`}에 있고 끝에서 끝이 ${km(g.spanKm)}`,
      `행정동 ${g.dongCount}곳 가운데 ${g.spotCount}곳에 쪽을 두고 ${n0.gu}까지 ${km(n0.km)}`,
      `${km2(g.area)}에 거점 ${g.spotCount}곳, ${sd.name} 중심에서 ${km(g.kmFromCenter)}`,
    ][parseInt(h.substr(3, 3), 16) % 4];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length]}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length]}.`;
  },
  course: (c) =>
    `${c.ko} 출장마사지 방문 안내. ${c.focus}를 보며 세기는 ${c.pressure}, 속도는 ${c.tempo}${josa(c.tempo, '으로/로')} 둡니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원이고 동·읍이 달라져도 같은 값입니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.for} 고르는 코스로 ${c.focus}${josa(c.focus, '을/를')} 봅니다. ${sd.name} 동·읍 ${sd.spotCount}곳 모두 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원입니다.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘기면 문장 단위로 자른다. */
export function clampDesc(s, limit = 155) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
