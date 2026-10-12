import { layout, panel } from '../lib/html.mjs';
import { esc, hash, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { stepList, factTable, faqBlock, noticeBlock, longtail, telCta } from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

function faqCtx(ctx, place, unit, nearList) {
  const { cfg, courses } = ctx;
  return {
    place, unit,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
    nearList: nearList || '옆 동·읍',
  };
}

/* ── 코스 한 가지 ─────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed);

  const lead = `<div class="say">
  <p>${esc(c.lines[0])}</p>
  <p>${esc(c.for)} 고르시면 맞습니다. 손이 머무는 자리는 ${esc(c.focus)}, 세기는 ${esc(c.pressure)}, 속도는 ${esc(c.tempo)}${josa(c.tempo, '으로/로')} 둡니다.</p>
  <p>${esc(c.lines[2])}</p>
</div>`;

  const facts = panel('fact', 'SPEC', `${esc(c.ko)} 기본값`,
    factTable([
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — 어느 지역이든 같음`],
      ['세기', esc(c.pressure)],
      ['속도', esc(c.tempo)],
      ['손이 머무는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다 — 받기 전 샤워를 권합니다' : '쓰지 않습니다'],
      ['받는 시간', `${esc(cfg.hours)} 전화 이어짐 · 값은 ${esc(cfg.pay)}`],
    ]),
    '새벽 할증과 길 값이라는 항목이 없습니다. 10분 더 하시면 그 10분 값만 얹습니다.', '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = panel('compare', 'COMPARE', '다른 코스와 무엇이 다릅니까',
    `<ul class="cp">${others.map((x) => `<li>
      <a href="/course/${x.slug}/"><span class="cp-k">${esc(x.ko)}</span><span class="cp-v">${x.min}분 ${won(x.price)}원 · 세기 ${esc(x.pressure)}</span></a>
      <p class="cp-d">${esc(x.for)} 고르는 쪽입니다.</p>
    </li>`).join('')}</ul>`,
    `${esc(c.ko)}${josa(c.ko, '과/와')} 견주실 수 있게 세기와 길이를 같이 적었습니다.`, '01');

  const sidoLinks = panel('bysido', 'AREA', `시도별 ${esc(c.ko)} 안내`,
    `<ul class="ln">${regions.map((r) => `<li><a href="/${r.slug}/course/${c.slug}/">${esc(r.name)} ${esc(c.ko)} 출장마사지</a></li>`).join('')}</ul>`,
    `시도 ${counts.sido}곳 어디든 ${won(c.price)}원 한 가지 값입니다.`, '02');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, c.ko, '코스'), 4, '04');

  const pool = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) {
    pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }

  const body = [
    lead, facts,
    telCta(cfg, c.ko, seed),
    compare, sidoLinks,
    stepList(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(pool, seed, 24, 'PLACES', `${esc(c.ko)}${josa(c.ko, '을/를')} 받을 수 있는 동·읍`, null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="tt-s">출장마사지·홈타이 ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장마사지·홈타이`,
          desc: clampDesc(desc.course(c)),
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────────
   ★동·읍 × 코스는 만들지 않는다. 438 × 7 = 3,066쪽이 되는데 자리가 달라져도 코스
     설명이 같아 전부 얇은 조합 페이지가 된다(doorway-thin-combo 규칙). */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.slug}/${c.slug}`;
  const h = hash(seed);
  const byArea = sd.gu.slice().sort((a, b) => b.area - a.area);

  const opens = [
    `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 받으시려면 예약 문의 버튼으로 접수하시면 됩니다. 동·읍 ${sd.spotCount}곳 모두 ${c.min}분 ${won(c.price)}원 한 가지 값입니다.`,
    `값은 ${sd.name} 안 어디서나 ${won(c.price)}원입니다. ${c.ko}${josa(c.ko, '은/는')} ${c.min}분으로 두었고, 멀다고 길 값을 붙이지 않습니다.`,
    `${c.focus}에 시간을 몰아 쓰는 코스가 ${c.ko}입니다. ${sd.name} 시군구 ${sd.gu.length}곳 어디서나 같은 짜임으로 들어갑니다.`,
  ];

  const lead = `<div class="say">
  <p>${esc(at(h, opens, 0))}</p>
  <p>${esc(c.lines[1])}</p>
  <p>${esc(c.for)} 맞는 코스입니다. 세기를 ${esc(c.pressure)}, 속도를 ${esc(c.tempo)}에 두고 가되 받는 중에 바꿔 달라고 하셔도 그 자리에서 맞춥니다.</p>
</div>`;

  const facts = panel('fact', 'SPEC', `${esc(sd.name)} ${esc(c.ko)} 기본값`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a> 시군구 ${sd.gu.length}곳 · 동읍 ${sd.spotCount}곳`],
      ['코스', `<a href="/course/${c.slug}/">${esc(c.ko)}</a> ${c.min}분`],
      ['값', `${won(c.price)}원`],
      ['세기 · 속도', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['손이 머무는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다' : '쓰지 않습니다'],
      ['접수', `${esc(cfg.hours)} 전화 이어짐 · 집 앞까지 ${esc(cfg.arrive)}`],
    ]), null, '00');

  const guLinks = panel('gulist', 'DISTRICTS', `${esc(sd.name)} 시군구에서 ${esc(c.ko)}`,
    `<ul class="ln">${sd.gu.map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} ${esc(c.ko)} 드는 길</a></li>`).join('')}</ul>`,
    '구 쪽에 그 안의 동·읍 목록과 가까운 시군구까지 잰 거리를 적어 두었습니다.', '01');

  const otherCourse = panel('oc', 'OTHER', `${esc(sd.name)}에서 고를 수 있는 다른 코스`,
    `<ul class="ln">${courses.filter((x) => x.slug !== c.slug).map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)} ${x.min}분</a></li>`).join('')}</ul>`,
    null, '02');

  const { html: faqHtml, qa } = faqBlock(seed,
    faqCtx(ctx, `${sd.name} ${c.ko}`, '시도', byArea.slice(0, 3).map((g) => g.name).join('·')), 4, '04');

  const crossPool = [];
  for (const r of ctx.regions) {
    if (r.slug !== sd.slug) crossPool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
    for (const g of r.gu) for (const s of g.spots) crossPool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }

  const body = [
    lead, facts,
    telCta(cfg, `${sd.name} ${c.ko}`, seed),
    guLinks, otherCourse,
    stepList(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(crossPool, seed, 24, 'MORE', at(h, SEC.crossHead, 4), null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="tt-s">출장마사지 ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장마사지·홈타이`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
