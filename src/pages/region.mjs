import { layout, panel } from '../lib/html.mjs';
import { esc, hash, km, km2, won, josa, dirWord, rankWord } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, nearSpot, spotIndex, myeonList, guIndex, telCta,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_A_EUP, SPOT_LEAD_B, SPOT_LEAD_C, SPOT_LEAD_C_FAR,
  GU_LEAD, SIDO_LEAD, SEC,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 넓이를 말로 옮긴다 — 숫자만 적으면 뜻이 안 와 닿는다. */
function areaNote(a) {
  if (a < 1.5) return '집이 붙어 있어 골목마다 길이 다릅니다.';
  if (a < 6) return '걸어서 가로지를 만한 넓이입니다.';
  if (a < 20) return '차로 옮겨 다녀야 하는 넓이입니다.';
  return '한쪽 끝에서 반대편까지 한참 걸리는 넓이입니다.';
}

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 계산해서 나온 사실이다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses } = ctx;
  const rank = rankWord(s.areaRank, g.spotCount) || `${s.areaRank}번째로 넓은`;
  // ★가장 가까운 다른 거점이 12km 넘게 떨어지면 외딴 자리다. 여기에
  //   '맞붙어 있어 한 번에 이어 돈다'를 쓰면 거짓이 된다.
  const far = s.near.length ? s.near[0].km > 12 : true;
  const n = s.near;
  return {
    sido: sd.name, sidoFull: sd.full, gu: g.name, spot: s.name, kind: s.kind,
    josa_eun: josa(s.name, '은/는'),
    josa_n0_eun: n[0] ? josa(n[0].name, '은/는') : '은',
    dir: s.dir, area: s.area, kmFromGu: s.kmFromGu,
    rankPhrase: rank, areaNote: areaNote(s.area),
    guSpotCount: g.spotCount, guArea: g.area, guDongCount: g.dongCount, myeonCount: g.myeonCount,
    n0: n[0] ? n[0].name : '', n1: n[1] ? n[1].name : '', n2: n[2] ? n[2].name : '',
    k0: n[0] ? n[0].km : 0, k1: n[1] ? n[1].km : 0, k2: n[2] ? n[2].km : 0,
    place: `${g.name} ${s.name}`, unit: s.kind === '읍' ? '읍' : '동',
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
    nearList: n.slice(0, 3).map((x) => x.name).join('·'),
    far,
  };
}

/* ── 동·읍 쪽 — 이 사이트에서 가장 깊은 층 ──────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const poolA = s.kind === '읍' ? SPOT_LEAD_A_EUP : SPOT_LEAD_A;
  const lead = `<div class="say">
  <p>${at(h, poolA, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, c.far ? SPOT_LEAD_C_FAR : SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = panel('fact', 'DATA', `${esc(s.name)} 숫자로`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['갈래', s.kind === '읍' ? '읍 — 군에서 길이 모이는 곳' : '행정동'],
      ['넓이', `${km2(s.area)} · ${esc(g.name)}에서 ${esc(c.rankPhrase)} 자리`],
      ['시군구 중심에서', `${km(s.kmFromGu)} ${esc(dirWord(s.dir))}`],
      [c.far ? '가장 가까운 다른 거점' : '가까운 동·읍', s.near.slice(0, 3).map((n) => `${esc(n.name)} ${km(n.km)}`).join(' · ')],
      ['접수', `${esc(cfg.hours)} 전화 이어짐 · 값은 ${esc(cfg.pay)} · 집 앞까지 ${esc(cfg.arrive)}`],
    ]),
    at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  // 다른 시도의 거점 — 깊은 쪽끼리 이어 막힌 쪽이 생기지 않게 한다
  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    nearSpot(s, seed, '02', c.far),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, 'OTHER', at(h, SEC.crossHead, 8), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="tt-s">${s.kind === '읍' ? '읍' : '동'} 단위 출장마사지·홈타이</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 출장마사지·홈타이 방문 관리`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');
  const rank = rankWord(g.areaRank, sd.gu.length) || `${g.areaRank}번째로 넓은`;

  const c = {
    sido: sd.name, gu: g.name, josa_eun: josa(g.name, '은/는'),
    spotCount: g.spotCount, dongCount: g.dongCount, myeonCount: g.myeonCount,
    area: g.area, spanKm: g.spanKm, dir: g.dir, kmFromCenter: g.kmFromCenter,
    rankPhrase: rank,
    first: g.spots[0].name, last: g.spots[g.spots.length - 1].name,
    near0: g.near[0].gu, near1: g.near[1] ? g.near[1].gu : g.near[0].gu,
    nk0: g.near[0].km, nk1: g.near[1] ? g.near[1].km : g.near[0].km,
    myeonLine: g.myeonCount
      ? `면 ${g.myeonCount}곳은 이름만 적어 두었습니다 — 받지 않는다는 뜻이 아닙니다.`
      : '면이 없어 모든 행정동에 쪽이 있습니다.',
    place: `${sd.name} ${g.name}`, unit: '시군구',
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
    nearList: g.spots.slice(0, 3).map((x) => x.name).join('·'),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lead = `<div class="say">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const byArea = g.spots.slice().sort((a, b) => b.area - a.area);
  const facts = panel('fact', 'DATA', `${esc(g.name)} 숫자로`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['행정동 합', `${g.dongCount}곳`],
      ['쪽을 둔 동·읍', `${g.spotCount}곳`],
      ['면', g.myeonCount ? `${g.myeonCount}곳 — 이름만 적음` : '없음'],
      ['넓이', `${km2(g.area)} · ${esc(sd.name)}에서 ${esc(rank)} 축`],
      ['시도 중심에서', `${km(g.kmFromCenter)} ${esc(dirWord(g.dir))}`],
      ['끝에서 끝', g.spanKm ? `${km(g.spanKm)} — 가장 먼 두 거점 사이` : '거점 1곳'],
      ['가장 넓은 자리', `<a href="/${sd.slug}/${g.slug}/${byArea[0].slug}/">${esc(byArea[0].name)}</a> ${km2(byArea[0].area)}`],
      ['가까운 시군구', g.near.slice(0, 3).map((n) => `${esc(n.gu)} ${km(n.km)}`).join(' · ')],
      ['접수', `${esc(cfg.hours)} 전화 이어짐 · 값은 ${esc(cfg.pay)}`],
    ]), at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const nearGuBlock = panel('neargu', 'DISTANCE', `${esc(g.name)}${josa(g.name, '과/와')} 가까운 시군구`,
    `<ul class="dt">${g.near.map((n) => `<li><a href="/${n.sidoSlug}/${n.slug}/">
      <span class="dt-k">${km(n.km)}</span><span class="dt-n">${esc(n.gu)}</span><span class="dt-g">${n.same ? `같은 ${esc(sd.name)}` : esc(n.sido)}</span>
    </a></li>`).join('')}</ul>`,
    '중심점 사이를 잰 직선거리입니다. 경계 쪽 주소는 더 짧은 구에서 나섭니다.', '04');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${g.name}`, seed),
    spotIndex(sd, g, seed, null, '01'),
    myeonList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    nearGuBlock,
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, 'OTHER', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="tt-s">출장마사지·홈타이 동·읍 ${g.spotCount}곳</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 출장마사지·홈타이 방문 관리`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#spotlist`, `${g.name} 동·읍`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byArea = sd.gu.slice().sort((a, b) => b.area - a.area);

  const c = {
    sido: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, myeonCount: sd.myeonCount,
    biggest: byArea[0].name, smallest: byArea[byArea.length - 1].name,
    place: sd.name, unit: '시도',
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
    nearList: sd.gu.slice(0, 3).map((x) => x.name).join('·'),
  };

  const lead = `<div class="say"><p>${at(h, SIDO_LEAD, 0)(c)}</p></div>`;

  const facts = panel('fact', 'DATA', `${esc(sd.name)} 숫자로`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['시군구', `${sd.gu.length}곳`],
      ['쪽을 둔 동·읍', `${sd.spotCount}곳`],
      ['면', sd.myeonCount ? `${sd.myeonCount}곳 — 시군구 쪽 안에 이름으로` : '없음'],
      ['받는 넓이', km2(sd.area)],
      ['가장 넓은 구', `<a href="/${sd.slug}/${byArea[0].slug}/">${esc(byArea[0].name)}</a> ${km2(byArea[0].area)}`],
      ['가장 좁은 구', `<a href="/${sd.slug}/${byArea[byArea.length - 1].slug}/">${esc(byArea[byArea.length - 1].name)}</a> ${km2(byArea[byArea.length - 1].area)}`],
      ['접수', `${esc(cfg.hours)} 전화 이어짐 · 값은 ${esc(cfg.pay)}`],
    ]), at(h, SEC.factSub, 7), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = panel('sidocourse', 'COURSE', `${esc(sd.name)} 코스별 안내`,
    `<ul class="ln">${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)} 출장마사지</a></li>`).join('')}</ul>`,
    `코스마다 세기와 길이가 다릅니다. ${esc(sd.name)} 안에서는 어느 자리든 같은 값입니다.`, '03');

  const topSpots = [];
  for (const g of sd.gu) for (const s of g.spots) topSpots.push({ g, s });
  topSpots.sort((a, b) => b.s.area - a.s.area);
  const spotPick = panel('spotpick', 'PLACES', `${esc(sd.name)}에서 넓은 동·읍`,
    `<ul class="ln">${topSpots.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${km2(x.s.area)}</a></li>`).join('')}</ul>`,
    `넓은 자리는 집마다 드는 길이 달라 길이를 따로 봅니다. 전체 ${sd.spotCount}곳은 구를 눌러 보십시오.`, '02');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    spotPick,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, 'OTHER', '다른 시도', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="tt-s">동·읍 ${sd.spotCount}곳 출장마사지·홈타이</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '지역', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 출장마사지·홈타이 방문 관리`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
