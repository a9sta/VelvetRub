import { layout, panel, telBtn } from '../lib/html.mjs';
import { esc, hash, shuffle, won, km, km2, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, siteLinks, telCta,
} from '../lib/blocks.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

function faqCtx(ctx, place, unit) {
  const { cfg, courses } = ctx;
  return {
    place, unit,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
    nearList: '옆 동·읍',
  };
}

function allSpots(regions) {
  const out = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) {
    out.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }
  return out;
}
function allGu(regions) {
  const out = [];
  for (const r of regions) for (const g of r.gu) out.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  return out;
}

/* ── 홈 ───────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const path = '/';
  const url = `${siteUrl}/`;
  const seed = 'home';
  const minP = Math.min(...courses.map((c) => c.price));

  const top = `<section class="top" aria-label="${esc(cfg.brand.ko)} 접수 안내">
  <p class="top-k">${esc(cfg.brand.slogan)}</p>
  <p class="top-l">오실 곳이 없습니다. 전화를 받고 ${esc(cfg.arrive)} 안에 관리사가 주소로 갑니다. 쪽을 둔 자리가 동·읍 ${counts.spot}곳이고, 면 ${counts.myeon}곳도 같은 번호로 받습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <dl class="top-n">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤에도 새벽에도 사람이 전화를 받습니다</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>마친 뒤 그 방에서 치릅니다</dd></div>
    <div><dt>${won(minP)}원부터</dt><dd>새벽 할증도 길 값도 없습니다</dd></div>
  </dl>
</section>`;

  const sidoGrid = panel('sido', 'AREA', '사시는 지역을 고르십시오',
    `<ul class="sb">${regions.map((r) => `<li>
      <a href="/${r.slug}/">
        <span class="sb-n">${esc(r.name)}</span>
        <span class="sb-m">시군구 ${r.gu.length} · 동읍 ${r.spotCount} · 면 ${r.myeonCount}</span>
        <span class="sb-g">${r.gu.slice(0, 4).map((g) => esc(g.name)).join(' · ')}${r.gu.length > 4 ? ` 외 ${r.gu.length - 4}` : ''}</span>
      </a></li>`).join('')}</ul>
     <p class="pn-tail">층은 셋입니다 — 시도, 시군구, 동·읍. <a href="/area/">받는 자리 전체</a>를 한 쪽에 펴 두었습니다.</p>`,
    '구 이름을 누르면 그 안의 동·읍이 한 묶음으로 펼쳐집니다.', '01');

  const how = panel('how', 'HOW', '이 사이트가 지역을 다루는 방식',
    `<div class="cols">
      <section><h3>길이를 먼저 잽니다</h3><p>동과 읍마다 경계 도형에서 무게중심을 뽑아 좌표로 두었습니다. 자기 자리를 열면 옆 거점까지 몇 킬로미터인지 숫자로 나옵니다. 그 길이가 곧 집까지 몇 분인지의 출발점입니다.</p></section>
      <section><h3>직선거리라고 적습니다</h3><p>잰 값은 차가 달리는 길이가 아닙니다. 산이 끼면 돌아가고 강이 있으면 다리까지 가야 합니다. 그래서 통화에서는 이 길이에 골목과 오르막 몫을 더해 말씀드립니다.</p></section>
      <section><h3>면은 쪽을 내지 않았습니다</h3><p>면 하나가 동보다 훨씬 넓은데 마을이 흩어져 있어, 중심점을 찍어도 집까지 다시 몇 킬로미터가 남습니다. 쪽에 적을 쓸모 있는 숫자가 안 나와서 이름만 적었습니다.</p></section>
      <section><h3>지어낸 숫자가 없습니다</h3><p>후기·별점·사람 사진을 쓰지 않습니다. 화면에 있는 숫자는 모두 공개 자료에서 계산해 나온 것이고, 손으로 적어 넣은 칸이 없습니다.</p></section>
    </div>`,
    null, '02');

  const nums = panel('num', 'NUMBERS', '한 쪽에 요약',
    factTable([
      ['받는 시도', `${counts.sido}곳 — ${cfg.coverage.sido.join(' · ')}`],
      ['시군구', `${counts.gu}곳`],
      ['쪽을 둔 동·읍', `${counts.spot}곳 — 동 ${counts.dong} · 읍 ${counts.eup}`],
      ['이름으로 적은 면', `${counts.myeon}곳`],
      ['코스', `${courses.length}가지 · ${won(minP)}원부터`],
      ['운영', `${esc(cfg.hours)} 전화 이어짐 · 집 앞까지 ${esc(cfg.arrive)} · 값은 ${esc(cfg.pay)}`],
      ['접수 창구', '예약 문의 버튼(안심번호) 한 곳뿐입니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '받는 자리', '지역'), 6, '06');

  const posts = panel('post', 'NOTES', '받기 전에 읽어 두면 좋은 기록',
    `<ul class="rd">${POSTS.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((p) => `<li>
      <a href="/magazine/${p.slug}/"><span class="rd-t">${esc(p.title)}</span><time datetime="${p.date}">${p.date}</time></a>
      <p class="rd-s">${esc(p.summary)}</p></li>`).join('')}</ul>`,
    '후기가 아니라 설명입니다.', '07');

  const body = [
    top, sidoGrid, how, nums,
    courseGrid(courses, seed, '받는 자리', '04'),
    stepList(seed, '05'),
    telCta(cfg, '사시는 동·읍', seed),
    faqHtml, posts,
    longtail(allSpots(regions), seed, 30, 'PLACES', '동·읍별 안내', null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.home(),
      desc: clampDesc(desc.home(), 165),
      h1: `${esc(cfg.brand.ko)} <span class="tt-s">출장마사지·홈타이 ${cfg.coverage.sido.join('·')} 동·읍 ${counts.spot}곳</span>`,
      body,
      pageKind: 'home',
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${cfg.brand.ko} 출장마사지·홈타이 방문 관리`,
          desc: clampDesc(desc.home(), 165),
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses,
        }),
        S.itemList(`${url}#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const path = '/area/';
  const url = `${siteUrl}${path}`;
  const seed = 'area';

  const lead = `<div class="say">
  <p>받는 자리를 한 쪽에 모두 펴 두었습니다. 쪽이 있는 동·읍이 ${counts.spot}곳이고, 그것을 시군구 ${counts.gu}곳과 시도 ${counts.sido}곳으로 묶어 두었습니다.</p>
  <p>구 이름 옆에 그 구의 동·읍 개수와 넓이를 적었습니다. 이름을 누르면 그 자리까지 잰 거리와 가까운 거점이 나옵니다.</p>
</div>`;

  const tree = regions.map((r) => `<section class="tw" aria-labelledby="tw-${r.slug}">
    <h2 class="tw-h" id="tw-${r.slug}"><a href="/${r.slug}/">${esc(r.name)}</a> <span class="tw-m">시군구 ${r.gu.length} · 동읍 ${r.spotCount} · 면 ${r.myeonCount}</span></h2>
    <ul class="tw-ul">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}</a> <span class="tw-s">동읍 ${g.spotCount} / ${km2(g.area)}</span></li>`).join('')}</ul>
  </section>`).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '받는 자리', '지역'), 4, '03');

  const body = [
    lead,
    panel('tree', 'ALL', '시도별 시군구', tree, '구를 짚으면 그 아래 동·읍이 모두 열립니다.', '01'),
    telCta(cfg, '사시는 자리', seed),
    courseGrid(courses, seed, '받는 자리', '02'),
    faqHtml,
    longtail(allSpots(regions), seed, 40, 'PLACES', '동·읍 바로가기', null, '04'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 자리 <span class="tt-s">시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳</span>`,
      body,
      pageKind: 'area',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '지역', url }],
      jsonld: [
        S.itemList(`${url}#list`, '받는 시군구', allGu(regions).map((x) => ({ name: x.label, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = '/course/';
  const url = `${siteUrl}${path}`;
  const seed = 'coursehub';
  const oil = courses.filter((c) => c.oil), dry = courses.filter((c) => !c.oil);

  const lead = `<div class="say">
  <p>코스는 ${courses.length}가지입니다. 고르실 때 맨 먼저 갈리는 것은 세기가 아니라 오일입니다 — 오일을 쓰면 마치고 씻어야 하고, 안 쓰면 옷을 그대로 입고 일어서면 됩니다.</p>
  <p>오일을 쓰는 쪽이 ${oil.length}가지(${oil.map((c) => esc(c.ko)).join(' · ')}), 쓰지 않는 쪽이 ${dry.length}가지(${dry.map((c) => esc(c.ko)).join(' · ')})입니다.</p>
  <p>값은 지역으로 달라지지 않습니다. 이름을 다 아실 필요도 없습니다 — 걸리는 자리만 말씀하시면 골라 드립니다.</p>
</div>`;

  const table = panel('tbl', 'TABLE', `${courses.length}가지를 한 표로`,
    `<div class="wide"><table class="gr">
      <caption>세기 · 길이 · 값 견주기</caption>
      <thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">오일</th><th scope="col">손이 머무는 자리</th></tr></thead>
      <tbody>${courses.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td><td>${esc(c.focus)}</td></tr>`).join('')}</tbody>
    </table></div>`,
    '사시는 자리로 길이나 값이 달라지지 않습니다.', '01');

  const pickGuide = panel('pick', 'CHOOSE', '이 문장 가운데 가장 가까운 것을 고르십시오',
    `<dl class="ch">
      ${[
        ['하루가 끝나면 무거운데 딱 집히는 데는 없다', 'swedish'],
        ['한 군데가 또렷하게 걸리고 몇 주째 그대로다', 'deep'],
        ['쭈그려 앉았다 일어설 때 다리가 안 펴진다', 'thai'],
        ['눕고도 머리가 돌아가 잠까지 한참 걸린다', 'aroma'],
        ['오래 묵어서 한두 번으로는 안 풀릴 듯하다', 'gyeongrak'],
        ['저녁이면 발목이 굵어지고 신발이 낀다', 'lymph'],
        ['짧게 어깨만 풀고 곧 움직여야 한다', 'dry'],
      ].map(([q, slug]) => {
        const c = courses.find((x) => x.slug === slug);
        return `<div><dt>${esc(q)}</dt><dd><a href="/course/${c.slug}/">${esc(c.ko)}</a> ${c.min}분 ${won(c.price)}원</dd></div>`;
      }).join('')}
    </dl>`,
    null, '02');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '코스', '코스'), 5, '04');

  const body = [
    lead, table, pickGuide,
    telCta(cfg, '고르신 코스', seed),
    courseGrid(courses, seed, '받는 자리', '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(allGu(regions), seed, 24, 'AREA', '지역별 안내', null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page(`코스 ${courses.length}가지 견주기`),
      desc: clampDesc(`출장마사지 코스 ${courses.length}가지를 세기·길이·값·오일 여부로 갈라 적었습니다. 시군구 ${counts.gu}곳 어디서나 같은 값이고, 걸리는 자리만 말씀하시면 골라 드립니다.`),
      h1: `코스 ${courses.length}가지 <span class="tt-s">세기 · 길이 · 값 견주기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url }],
      jsonld: [
        S.itemList(`${url}#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 값 ───────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = '/price/';
  const url = `${siteUrl}${path}`;
  const seed = 'price';
  const minP = Math.min(...courses.map((c) => c.price));
  const maxP = Math.max(...courses.map((c) => c.price));

  const lead = `<div class="say">
  <p>값을 정하는 것은 코스와 길이, 이 둘뿐입니다. 사시는 자리나 시각, 요일로 달라지지 않습니다. 낮은 쪽이 ${won(minP)}원, 높은 쪽이 ${won(maxP)}원입니다.</p>
  <p>계산은 마친 뒤입니다. 예약금·보증금·길 값을 먼저 보내 달라고 하는 일이 없습니다.</p>
</div>`;

  const table = panel('tbl', 'TABLE', '코스별 값',
    `<div class="wide"><table class="gr">
      <caption>기본 길이와 값 — 어느 지역이든 같음</caption>
      <thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">값</th><th scope="col">10분 더할 때</th><th scope="col">세기</th></tr></thead>
      <tbody>${courses.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${won(Math.round(c.price / c.min * 10 / 1000) * 1000)}원</td><td>${esc(c.pressure)}</td></tr>`).join('')}</tbody>
    </table></div>`,
    '10분 더하는 값은 기본 길이의 분당 값을 천 원 단위로 맞춘 것입니다.', '01');

  const notAdd = panel('notadd', 'NO EXTRA', '여기에 더 붙는 것이 없습니다',
    `<ul class="nt">
      <li><b>새벽 할증</b> — 몇 시에 받으셔도 표에 적힌 값 그대로입니다.</li>
      <li><b>길 값·출장비</b> — 읍이든 구 끝이든 같습니다. 거리로 올려 받지 않습니다.</li>
      <li><b>주말·공휴일 할증</b> — 요일로 값이 달라지지 않습니다.</li>
      <li><b>예약금·보증금</b> — 없습니다. 먼저 입금해 달라는 연락이 온다면 저희 쪽이 아닙니다.</li>
      <li><b>무르는 값</b> — 두지 않았습니다. 나서기 전에 말씀하시면 그걸로 정리됩니다.</li>
      <li><b>재료비·주차비</b> — 오일과 깔개는 가방에 들어 있고, 주차비를 이용자께 청구하지 않습니다.</li>
    </ul>`,
    null, '02');

  const how = panel('how', 'PAY', '어떻게 계산합니까',
    factTable([
      ['때', '마친 뒤 그 방에서'],
      ['방법', '현금 또는 계좌 이체'],
      ['길게 하신 경우', '10분 단위로 늘어난 만큼만 보탭니다'],
      ['둘이 받는 경우', '사람 수만큼입니다. 묶음 할인을 두지 않았습니다'],
      ['영수', '필요하다고 말씀하시면 드립니다'],
      ['지역차', `없습니다. 시군구 ${counts.gu}곳이 한 표를 씁니다`],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '값', '지역'), 5, '04');

  const body = [
    lead, table, notAdd, how,
    telCta(cfg, '값 확인', seed),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(allGu(regions), seed, 24, 'AREA', '지역별 안내', null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('값'),
      desc: clampDesc(`출장마사지 코스별 값. ${won(minP)}원부터 ${won(maxP)}원까지이고 새벽 할증·길 값·예약금·무르는 값이 없습니다. 계산은 마친 뒤에 하며 시군구 ${counts.gu}곳이 한 표를 씁니다.`),
      h1: `값 <span class="tt-s">${won(minP)}원부터 · 후불 · 할증 없음</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '값', url }],
      jsonld: [
        S.service({
          siteUrl, url, cfg, name: '출장마사지·홈타이 코스 값',
          desc: '코스별 기본 길이와 값. 지역·시각·요일로 달라지지 않는다.',
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const path = '/guide/';
  const url = `${siteUrl}${path}`;
  const seed = 'guide';

  const lead = `<div class="say">
  <p>접수에서 계산까지의 차례, 미리 봐 두실 것, 접수를 돌려 드리는 경우를 모아 두었습니다.</p>
  <p>통화에서 정하는 것과 집 앞에서 맞추는 것을 갈라 적었습니다. 읽어 두시면 통화가 짧아집니다.</p>
</div>`;

  const prep = panel('prep', 'BEFORE', '미리 봐 두실 것',
    `<div class="cols">
      <section><h3>누울 자리</h3><p>깔개 한 장 펼 데가 나오면 됩니다. 이부자리를 펴 두실 것도 없고 방이 좁아도 그대로 합니다. 바닥이 찬 집이면 그 한마디만 해 주십시오.</p></section>
      <section><h3>차를 세울 데</h3><p>집 앞이나 근처에 댈 자리가 있는지 봐 주십시오. 방문 차량 등록이 필요한 단지면 미리 알려 주셔야 입구에서 멈추지 않습니다.</p></section>
      <section><h3>드는 길</h3><p>공동현관 번호, 지하에서 올라오는 길, 엘리베이터가 붙은 라인. 이 가운데 하나라도 모르면 집 앞에서 시간을 씁니다.</p></section>
      <section><h3>씻기</h3><p>오일을 쓰는 코스면 먼저 씻어 두시는 쪽이 낫습니다. 살갗에 기름이 덜 겉돌아 손이 걸리지 않습니다.</p></section>
    </div>`,
    null, '01');

  const refuse = panel('refuse', 'DECLINE', '접수를 받지 않는 경우',
    `<ul class="nt">
      <li>술을 드신 상태일 때. 어디까지 견디는지를 본인도 가늠하기 어려워집니다.</li>
      <li>열이 나거나 부딪힌 자리의 부기가 남아 있을 때.</li>
      <li>임신하신 경우, 염증이 한창일 때.</li>
      <li>코스에 적히지 않은 요구를 하실 때. 그 자리에서 멈추고 나옵니다.</li>
      <li>주소를 끝까지 알려 주지 않으실 때. 어디로 가는지 모르는 채로는 차를 돌릴 수 없습니다.</li>
      <li>관리사의 개인 번호를 달라고 하실 때. 번호를 하나로 묶어 둔 까닭이 없어집니다.</li>
    </ul>`,
    '받지 않을 때도 까닭은 그 자리에서 밝힙니다.', '02');

  const atDoor = panel('door', 'ON SITE', '집 앞에서 하는 것',
    `<ol class="wk-ol">
      <li class="wk"><span class="wk-n">01</span><div class="wk-b"><h3 class="wk-t">차가 움직이면</h3><p class="wk-d">출발을 한 번 알려 드립니다. 그때부터 집 앞까지가 말씀드린 길이입니다.</p></div></li>
      <li class="wk"><span class="wk-n">02</span><div class="wk-b"><h3 class="wk-t">차를 세우고</h3><p class="wk-d">댈 데가 없으면 그것만으로 몇 분이 갑니다. 미리 들은 자리로 바로 들어갑니다.</p></div></li>
      <li class="wk"><span class="wk-n">03</span><div class="wk-b"><h3 class="wk-t">안에서 짐을 풉니다</h3><p class="wk-d">복도에서 가방을 열지 않습니다. 들어가 창을 닫고 불을 낮춘 뒤 자리를 펍니다.</p></div></li>
      <li class="wk"><span class="wk-n">04</span><div class="wk-b"><h3 class="wk-t">세기와 차례를 정합니다</h3><p class="wk-d">어디부터 볼지와 세기를 맞춥니다. 시작하고 오 분쯤 지나 한 번 더 여쭙습니다.</p></div></li>
      <li class="wk"><span class="wk-n">05</span><div class="wk-b"><h3 class="wk-t">마치고 계산</h3><p class="wk-d">정한 길이만큼 하고 그 자리에서 치릅니다. 짐을 안에서 챙겨 한 번에 나옵니다.</p></div></li>
    </ol>`,
    null, '03');

  const info = panel('info', 'SUMMARY', '운영 요약',
    factTable([
      ['받는 시간', esc(cfg.hours)],
      ['집 앞까지', `${esc(cfg.arrive)} — 주소를 들은 뒤 다시 말씀드립니다`],
      ['계산', `${esc(cfg.pay)} · 선입금 없음`],
      ['접수 창구', telBtn(cfg, { size: 'm' })],
      ['받는 자리', `시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳 · 면 ${counts.myeon}곳`],
      ['코스', `${courses.length}가지 · 자세한 것은 <a href="/course/">코스 안내</a>`],
      ['취소·변경', '무르는 값 없음. 나서기 전이면 바로 다시 잡습니다'],
    ]), null, '04');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '이용', '지역'), 6, '05');

  const body = [
    lead, prep, refuse, atDoor, info,
    telCta(cfg, '접수', seed),
    faqHtml,
    noticeBlock(seed, '06'),
    longtail(allGu(regions), seed, 24, 'AREA', '지역별 안내', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('이용안내'),
      desc: clampDesc('접수에서 계산까지의 차례, 차를 세울 데와 드는 길, 접수를 돌려 드리는 경우를 모아 두었습니다. 통화에서 정하는 것과 집 앞에서 맞추는 것을 갈라 적었습니다.'),
      h1: `이용안내 <span class="tt-s">걸고 · 재고 · 들어가고 · 치르기</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url }],
      jsonld: [S.faqPage(url, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const path = '/company/';
  const url = `${siteUrl}${path}`;
  const seed = 'company';

  const lead = `<div class="say">
  <p>${esc(cfg.brand.ko)}${josa(cfg.brand.ko, '은/는')} 매장을 두지 않고 관리사가 이용자 주소로 가는 방문 관리를 합니다. ${cfg.coverage.sido.join(' · ')}에서 접수하며 받는 번호는 화면의 하나뿐입니다.</p>
  <p>넘지 않기로 정한 선과, 화면에 적힌 숫자가 어디서 나왔는지를 적어 둡니다.</p>
</div>`;

  const lines = panel('line', 'RULES', '넘지 않기로 정한 선',
    `<ol class="law">
      <li><h3>창구가 하나입니다</h3><p>안심번호 말고는 요청을 받는 길을 두지 않았습니다. 개인 번호가 오가지 않으니 마친 뒤에 따로 연락이 닿을 수가 없습니다. 모르는 번호에서 걸려 왔다면 저희 쪽이 아닙니다.</p></li>
      <li><h3>적어 둔 것만 합니다</h3><p>성적인 일을 하지 않습니다. 그런 요구가 나오면 관리사는 하던 것을 멈추고 짐을 챙겨 나옵니다. 그 요청에 값을 매기지 않습니다.</p></li>
      <li><h3>의료 행위가 아닙니다</h3><p>병을 고치거나 가려내지 않습니다. 아픈 데가 있으면 진료를 먼저 보셔야 하고, 병원에 다니는 부위가 있으면 그 자리를 비우고 짭니다.</p></li>
      <li><h3>받은 적 없는 평가를 안 씁니다</h3><p>후기와 체험담, 별점과 평균 점수를 올리지 않습니다. 사람 사진도 걸지 않습니다 — 화면의 얼굴과 문을 두드리는 사람이 다르면 그 사진이 곧 거짓말이 됩니다.</p></li>
      <li><h3>값을 숨기지 않습니다</h3><p>표에 적힌 값 밖에 붙는 것이 없습니다. 시각·거리·요일로 올려 받지 않고 선입금을 받지 않습니다.</p></li>
      <li><h3>조용히 들고 나옵니다</h3><p>복도에서 짐을 꺼내지 않고, 가방에 상호를 적지 않습니다. 나올 때도 안에서 챙겨 한 번에 나옵니다.</p></li>
    </ol>`,
    null, '01');

  const where = panel('where', 'SOURCE', '화면의 숫자는 어디서 나왔습니까',
    factTable([
      ['지역 이름·경계', esc(data.source)],
      ['자료 판', esc(data.version)],
      ['뽑은 범위', esc(data.coverageFrom)],
      ['넓이·중심점', '경계 도형에서 계산 — 평면 근사 뒤 면적가중 무게중심'],
      ['거점 사이 거리', '중심점 좌표로 구면 거리를 계산 (직선거리)'],
      ['쪽을 둔 단위', `동 ${counts.dong} · 읍 ${counts.eup} = ${counts.spot}곳. 면 ${counts.myeon}곳은 이름만`],
      ['갱신 표시', '쪽마다 글이 실제로 바뀐 날만 올라갑니다'],
    ]),
    '어림으로 넣은 칸이 없습니다. 자료 판이 새로 나오면 다시 계산해 화면 숫자도 같이 갑니다.', '02');

  const ai = panel('ai', 'AI', 'AI 도구를 어떻게 썼습니까',
    `<p class="pn-p">지역 문장은 위 자료의 계산값을 문장 틀에 끼워 만듭니다. 그 틀과 설명 글을 쓸 때 AI 도구를 썼고, 사람이 처음부터 다시 읽어 고쳤습니다. 사람이나 방을 지어낸 그림은 한 장도 쓰지 않습니다 — 화면에 있는 것은 글자와 선뿐입니다.</p>
     <p class="pn-p">같은 고지를 쪽마다 아래에 달아 두었습니다. 사실과 다른 대목을 보시면 예약 문의 통화로 알려 주십시오. 고친 뒤 그 쪽의 갱신 날짜를 올립니다.</p>`,
    null, '03');

  const body = [lead, lines, where, ai, telCta(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('소개'),
      desc: clampDesc(`${cfg.brand.ko}가 넘지 않기로 정한 선과, 화면에 적힌 지역 숫자가 어디서 나왔는지를 적어 두었습니다. 후기·평점·사람 사진을 쓰지 않는 이유도 함께 밝힙니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="tt-s">정한 선과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const path = '/terms/';
  const url = `${siteUrl}${path}`;
  const A = [
    ['제1조 (목적)', `이 약관은 ${cfg.brand.ko}(이하 "회사")의 방문 관리 서비스를 쓰실 때 회사와 이용자가 각각 무엇을 지키는지를 적은 것입니다. 전화로 접수하신 때에 이 약관을 읽으신 것으로 봅니다.`],
    ['제2조 (용어)', '"방문 관리"란 관리사가 들은 주소로 찾아가 정해진 코스를 진행하는 일을 말합니다. "접수"란 화면의 안심번호로 통화해 코스와 시각과 주소를 맞추는 일입니다. "거점"이란 이 사이트가 쪽을 하나씩 둔 동 또는 읍을 가리킵니다.'],
    ['제3조 (접수 창구)', '접수는 화면의 예약 문의 버튼으로 이어지는 통화로만 받습니다. 문자·메신저·댓글이나 다른 번호로는 받지 않습니다. 통화에서 코스, 시각, 방문할 주소 셋이 정해지면 접수된 것으로 봅니다.'],
    ['제4조 (도착 시각)', '회사는 통화에서 집 앞까지 걸리는 시각을 숫자로 알려 드립니다. 화면에 적힌 거점 사이 거리는 중심점 좌표로 계산한 직선거리이므로 실제 길의 길이와 다를 수 있으며, 회사는 여기에 길과 오르막 사정을 더해 안내합니다. 길이 막혀 늦어지면 가는 길에 다시 알려 드립니다.'],
    ['제5조 (변경과 취소)', '이용자가 시각을 바꾸고자 하실 때 관리사가 나서기 전이면 다시 잡아 드리고, 이미 길에 있으면 어디까지 왔는지 알려 드린 뒤 상의해 정합니다. 무르는 값을 받지 않습니다. 다만 관리사가 집 앞에 닿은 뒤 아무도 없거나 연락이 닿지 않으면 그 요청은 끝난 것으로 봅니다.'],
    ['제6조 (값과 계산)', '값은 코스와 길이로만 정해지며 값 표에 적힌 것이 전부입니다. 시각·거리·요일로 올려 받지 않습니다. 계산은 마친 뒤 현장에서 하고, 회사는 예약금·보증금·길 값을 미리 받지 않습니다. 먼저 입금하라는 연락은 회사의 것이 아닙니다.'],
    ['제7조 (회사가 하지 않는 일)', '회사는 성적인 일을 하지 않으며, 병을 가려내거나 고치는 의료 행위도 하지 않습니다. 코스에 없는 요구가 나오면 관리사는 하던 것을 멈추고 나올 수 있고, 그 요청에는 값을 매기지 않습니다.'],
    ['제8조 (받지 않는 경우)', '음주 상태, 발열, 다친 자리의 부기가 남은 상태, 임신 중, 염증이 한창인 상태에서는 접수를 받지 않거나 진행을 미룹니다. 주소를 끝까지 알려 주지 않으시는 경우와 관리사의 개인 연락처를 요구하시는 경우에도 받지 않습니다.'],
    ['제9조 (이용자가 알려 주실 것)', '칼을 댄 자리, 병원에 다니는 부위, 특정 성분에 대한 반응, 혈액 관련 약을 드시는 사정이 있으면 접수할 때 알려 주셔야 합니다. 알려 주시지 않아 생긴 일에 대해 회사가 책임을 지기 어렵습니다. 세기가 안 맞을 때는 참지 말고 바로 알려 주십시오.'],
    ['제10조 (관리사 보호)', '관리사를 찍거나 개인 번호를 달라고 하실 수 없습니다. 받는 길을 안심번호 하나로 좁혀 둔 까닭도 여기에 있습니다. 몸에 손을 대거나 말로 위협하는 경우 진행을 곧바로 멈추고 이후 요청을 받지 않을 수 있습니다.'],
    ['제11조 (책임이 미치는 범위)', '회사는 코스에 적어 둔 범위에서 성실히 진행합니다. 다만 이용자의 체질이나 미리 알려 주지 않은 건강 사정에서 비롯한 결과, 그리고 천재지변이나 교통 통제처럼 회사가 손쓸 수 없는 일로 늦어진 것까지는 책임이 닿지 않습니다. 회사 쪽 잘못으로 진행하지 못한 경우에는 값을 받지 않습니다.'],
    ['제12조 (약관의 변경과 분쟁)', '약관을 고치면 이 쪽에 바뀐 내용과 날짜를 적습니다. 바뀐 뒤 접수하신 분께는 바뀐 약관이, 이미 잡아 둔 요청에는 접수하신 때의 약관이 적용됩니다. 다툼이 생기면 먼저 안심번호 통화로 사실을 맞춰 보는 것을 원칙으로 하고, 그래도 풀리지 않으면 대한민국 법을 따르며 관할은 민사소송법이 정한 법원으로 합니다.'],
  ];
  const body = `<div class="say"><p>접수하기 전에 한 번 훑어 보시기를 권합니다. 법률 용어를 줄이고 실제로 벌어지는 차례를 따라 적었습니다.</p></div>
${panel('terms', 'TERMS', '이용약관', `<ol class="law">${A.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>`, `조문은 ${A.length}개입니다. 고친 날짜는 이 쪽 맨 아래에 찍혀 있습니다.`, '01')}
${siteLinks(ctx, 'terms')}`;

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 방문 관리 서비스 이용약관 ${A.length}개 조문. 접수 창구, 도착 시각, 변경과 취소, 값과 계산, 회사가 하지 않는 것, 받지 않는 경우를 적었습니다.`),
      h1: `이용약관 <span class="tt-s">${A.length}개 조문</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const path = '/privacy/';
  const url = `${siteUrl}${path}`;
  const b = cfg.business;
  const A = [
    ['1. 무엇을 받는가', '접수 통화에서 받는 것은 셋입니다 — 연락받을 번호, 방문할 주소, 정하신 코스와 시각. 주민등록번호·계좌·직장 같은 것은 받지 않습니다. 회원가입을 두지 않았으므로 아이디와 비밀번호도 없습니다.'],
    ['2. 왜 받는가', '주소는 어느 길로 나설지 잡기 위해, 번호는 출발과 도착을 알리고 시각이 어긋났을 때 닿기 위해, 코스와 시각은 그 요청을 챙기기 위해 받습니다. 이 셋 말고 다른 데에는 쓰지 않습니다.'],
    ['3. 얼마나 두는가', '일이 끝나고 다툴 여지가 사라지는 때까지만 둡니다. 다시 부르실 때 조건을 맞추려고 번호와 지난 코스만 남기며, 그것조차 지워 달라고 하시면 지웁니다.'],
    ['4. 번호를 어떻게 다루는가', '화면의 번호는 안심번호입니다. 중간에서 한 번 돌려 주는 방식이라 양쪽 실제 번호가 서로에게 남지 않습니다. 관리사에게는 그날 갈 주소와 시각만 전달하고 이용자의 번호를 넘기지 않습니다.'],
    ['5. 넘기지 않습니다', '받은 것을 팔지 않고 다른 업체와 나누지도 않습니다. 법이 정한 절차를 밟아 수사기관이 요구할 때만 그 범위에서 내놓으며, 요구받지 않은 것은 함께 보내지 않습니다.'],
    ['6. 이용자가 할 수 있는 것', '무엇이 남아 있는지 묻거나, 틀린 것을 바로잡거나, 전부 지워 달라고 하실 수 있습니다. 예약 문의 통화로 말씀하시면 처리한 뒤 결과까지 알려 드리고, 대리인이 대신하셔도 됩니다.'],
    ['7. 쿠키와 추적', '로그인도 장바구니도 댓글도 없어서 쿠키를 둘 까닭이 없습니다. 광고 추적 코드와 바깥 분석 스크립트를 넣지 않았고 글꼴과 그림도 모두 이 서버 것입니다. 그래서 어느 쪽을 보셨는지 저희 쪽에 남지 않습니다.'],
    ['8. 어린이와 지키는 방법', '만 14세 미만인 분의 접수는 받지 않습니다 — 보호자 동의를 확인할 방법을 두지 않았기 때문입니다. 종이에 적은 기록은 잠그는 곳에 두고, 전자 기록은 접수 담당자만 볼 수 있게 제한하며, 사이트는 전부 암호화된 연결로만 제공합니다.'],
    ['9. 바뀔 때와 책임자', `방침을 손대면 무엇을 어떻게 고쳤는지와 날짜를 이 쪽에 남깁니다. ${b.privacyOfficer ? `개인정보 책임자는 ${b.privacyOfficer}입니다.` : '개인정보 책임자는 정해지는 대로 이 자리에 적습니다.'} 지금 열려 있는 창구는 예약 문의 통화 하나이고, 그 통화에서 하신 말씀이 책임자에게 그대로 올라갑니다.`],
  ];
  const body = `<div class="say"><p>받는 것이 적습니다. 회원가입·게시판·결제 창구를 두지 않았으므로 남는 것은 접수 통화에서 들은 세 가지뿐입니다.</p></div>
${panel('pp', 'PRIVACY', '개인정보처리방침', `<ol class="law">${A.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>`, `항목은 ${A.length}개입니다. 고친 날짜는 이 쪽 맨 아래에 찍혀 있습니다.`, '01')}
${siteLinks(ctx, 'privacy')}`;

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 받는 것은 연락받을 번호와 방문할 주소, 정하신 코스와 시각뿐입니다. 쿠키와 외부 추적 코드를 쓰지 않고 받은 것을 팔거나 넘기지 않습니다.'),
      h1: `개인정보처리방침 <span class="tt-s">셋만 받고 · 짧게 두고 · 말하면 지움</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url }],
    }),
  };
}

/* ── 기록 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const path = '/magazine/';
  const url = `${siteUrl}${path}`;
  const seed = 'magazine';
  const sorted = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));

  const lead = `<div class="say">
  <p>미리 읽어 두면 통화에서 물으실 것이 줄어드는 설명만 모았습니다. 후기와 체험담, 평점은 올리지 않습니다 — 받은 적 없는 평가를 적는 일이기 때문입니다.</p>
  <p>글은 ${POSTS.length}편이고 <a href="/rss.xml">RSS</a>로도 받아 보실 수 있습니다.</p>
</div>`;

  const list = panel('list', 'NOTES', `방문 기록 ${POSTS.length}편`,
    `<ul class="rd">${sorted.map((p) => `<li>
      <a href="/magazine/${p.slug}/"><span class="rd-t">${esc(p.title)}</span><time datetime="${p.date}">${p.date}</time></a>
      <p class="rd-s">${esc(p.summary)}</p></li>`).join('')}</ul>`,
    '새 글은 위에 붙습니다.', '01');

  const body = [lead, list, telCta(cfg, '접수', seed), longtail(allGu(regions), seed, 20, 'AREA', '지역별 안내', null, '02')].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page(`방문 기록 ${POSTS.length}편`),
      desc: clampDesc(`${cfg.brand.ko}가 적어 두는 방문 관리 기록 ${POSTS.length}편. 거리를 어떻게 재는지, 차 세울 자리와 드는 길, 면에서 부르실 때, 세기와 멍을 다룹니다.`),
      h1: `방문 기록 <span class="tt-s">${POSTS.length}편 · 후기 아님</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '기록', url }],
      jsonld: [S.itemList(`${url}#list`, '방문 기록', sorted.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

/* ── 글 한 편 ─────────────────────────────────────────────────── */
export function postPage(ctx, p) {
  const { cfg, siteUrl, regions } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `post/${p.slug}`;
  const sorted = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const others = sorted.filter((x) => x.slug !== p.slug).slice(0, 4);

  const article = p.body.map((n) => {
    if (typeof n === 'string') return `<p>${esc(n)}</p>`;
    if (n[0] === 'h3') return `<h3>${esc(n[1])}</h3>`;
    if (n[0] === 'ul') return `<ul>${n[1].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    return '';
  }).join('\n');

  const body = [
    `<p class="date"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 방문 기록</p>`,
    `<article class="doc">${article}</article>`,
    telCta(cfg, '접수', seed),
    panel('more', 'NOTES', '다른 기록',
      `<ul class="rd">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><span class="rd-t">${esc(x.title)}</span><time datetime="${x.date}">${x.date}</time></a><p class="rd-s">${esc(x.summary)}</p></li>`).join('')}</ul>`,
      null, '01'),
    longtail(allGu(regions), seed, 20, 'AREA', '지역별 안내', null, '02'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(p.summary),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '기록', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions, counts } = ctx;
  const path = '/404.html';
  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('없는 쪽입니다'),
      desc: '주소가 바뀌었거나 없는 쪽입니다. 아래에서 지역이나 코스를 골라 주십시오.',
      h1: `찾는 쪽이 없습니다 <span class="tt-s">주소를 한 번 더 봐 주십시오</span>`,
      noindex: true,
      body: [
        `<div class="say"><p>찾으시는 쪽이 없습니다. 지역 쪽은 <code>/시도/시군구/동읍/</code> 꼴이고 코스 쪽은 <code>/course/코스/</code> 꼴입니다.</p></div>`,
        panel('go', 'LINKS', '여기서 고르십시오',
          `<ul class="ln">
            <li><a href="/">처음으로</a></li>
            <li><a href="/area/">받는 자리 전체 (시군구 ${counts.gu}곳)</a></li>
            <li><a href="/course/">코스</a></li>
            <li><a href="/price/">값</a></li>
            <li><a href="/guide/">이용안내</a></li>
            ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}
          </ul>`, null, '01'),
        telCta(cfg, '접수', '404'),
      ].join('\n'),
      pageKind: '404',
    }),
  };
}
