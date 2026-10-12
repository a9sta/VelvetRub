import { esc } from './util.mjs';
import * as S from './schema.mjs';

export const ASSET_V = '1';

/**
 * 공통 레이아웃.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   푸터  — 네이버 C랭크 4신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **telBtn() 으로만** 찍는다. 번호만 덩그러니 적힌 자리가 생기면 안 된다
 *   (지시: 안심번호 옆에 '예약 문의'를 늘 적고 버튼으로 만든다). 검사도구가 그걸 본다.
 *
 * ★골격을 앞서 만든 세 사이트와 겹치지 않게 짰다.
 *   루네사      : 둥근 점머리 · 알약 버튼 · 4열 푸터
 *   리바이브모션: 왼쪽 눈금 레일 + 모노 순번 · 각진 판(radius 0) · 4열 푸터
 *   세린터치    : 대괄호 머리표 · 점선 가름 · 둥근 블록(14px) · 머리띠 두 줄 · 3열 푸터
 *   벨벳럽      : **굵은 괘선(3px) + 큰 순번 숫자** · 흑백 고대비 + 크랜베리 ·
 *                 머리띠 한 줄 + 검정 띠 안의 버튼 · 2열 푸터
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, bodyClass = '', pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/velvet.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body class="${bodyClass}" data-kind="${pageKind}">
<a class="jump" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? crumbHtml(crumbs) : ''}
<main id="main">
<h1 class="tt">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${callbar(cfg)}
<script src="/assets/velvet.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   안심번호 옆에 '예약 문의'가 **늘 붙어 있어야 한다**. 모양은 버튼이지만
   `<a href="tel:">` 로 둔다 — <button> 이면 자바스크립트 없이는 아무 일도
   일어나지 않고, 눌렀을 때 바로 통화로 넘어가야 하기 때문이다.
   size: s(머리띠) · m(본문) · l(대문) */
export function telBtn(cfg, { size = 'm', note = true, block = false } = {}) {
  return `<a class="pb pb-${size}${block ? ' pb-w' : ''}" href="tel:${cfg.telRaw}">
  <span class="pb-ic" aria-hidden="true">${phoneMark()}</span>
  <span class="pb-tx"><span class="pb-lb">${esc(cfg.telLabel)}</span><span class="pb-nm">${esc(cfg.tel)}</span></span>
  ${note ? `<span class="pb-nt">${esc(cfg.telNote)}</span>` : ''}
</a>`;
}

/** 머리띠 — 한 줄(상호 + 글자 메뉴), 그 아래 검정 띠에 버튼 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  return `<header class="hb">
  <div class="hb-in">
    <a class="sig" href="/" aria-label="${esc(cfg.brand.ko)} 처음으로">
      ${grainMark()}<span class="sig-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <nav class="menu" aria-label="주요 메뉴">
      <a href="/area/"${on('/area/')}>지역</a>
      <a href="/course/"${on('/course/')}>코스</a>
      <a href="/price/"${on('/price/')}>값</a>
      <a href="/guide/"${on('/guide/')}>이용안내</a>
      <a href="/magazine/"${on('/magazine/')}>기록</a>
    </nav>
  </div>
  <div class="hb-call">
    ${telBtn(cfg, { size: 's', note: true })}
    <span class="hb-run">${esc(cfg.hours)} · ${esc(cfg.pay)}</span>
  </div>
</header>`;
}

function crumbHtml(crumbs) {
  return `<nav class="way" aria-label="현재 위치"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 푸터 = 네이버 C랭크 4신호 + AI 고지. 2열 + 아래 띠. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');

  return `<footer class="fb">
  <div class="fb-grid">
    <div class="fb-left">
      <p class="fb-h">${esc(cfg.brand.ko)}</p>
      <p class="fb-say">매장을 두지 않습니다. 관리사가 이용자 주소로 가며, 시도 ${counts.sido}곳 · 시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳에 쪽을 두었습니다. 받는 번호는 아래 하나입니다.</p>
      ${telBtn(cfg, { size: 'm' })}
      <p class="fb-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
      ${biz ? `<p class="fb-biz">${biz}</p>` : '<p class="fb-biz fb-dim">사업자 정보는 확인되는 대로 이 자리에 적습니다.</p>'}
      <nav class="fb-reg" aria-label="지역 바로가기">
        <ul>${regions.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
        <p class="fb-sm"><a href="/area/">시군구 ${counts.gu}곳 전체</a> · 동읍 ${counts.spot}곳 · 면 ${counts.myeon}곳</p>
      </nav>
    </div>
    <div class="fb-right">
      <nav aria-label="안내 문서">
        <p class="fb-h">안내</p>
        <ul class="fb-ul">
          <li><a href="/guide/">이용안내</a></li>
          <li><a href="/price/">값</a></li>
          <li><a href="/course/">코스</a></li>
          <li><a href="/company/">소개</a></li>
          <li><a href="/terms/">이용약관</a></li>
          <li><a href="/privacy/">개인정보처리방침</a></li>
        </ul>
      </nav>
      <nav aria-label="최근 글과 수집 경로">
        <p class="fb-h">최근 기록</p>
        <ul class="fb-ul fb-post">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
        <ul class="fb-feed">
          <li><a href="/rss.xml">RSS</a></li>
          <li><a href="/sitemap.xml">사이트맵</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
        </ul>
        <p class="fb-sm">마지막 갱신 <time datetime="@@LM@@">@@LM@@</time></p>
      </nav>
    </div>
  </div>
  <div class="fb-end">
    <p class="fb-ai">이 사이트의 지역 문장은 공개 행정동 경계 자료(중심점 좌표·넓이·거점 사이 실거리)를 계산해 <strong>AI 도구의 도움을 받아 쓰고</strong> 사람이 다시 읽어 고쳤습니다. 후기·체험담·평점을 싣지 않고 사람 사진도 쓰지 않습니다. 경계 자료 출처: ${esc(data.source)}</p>
    <p class="fb-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 질병을 치료하는 의료 행위가 아니며, 성적 서비스를 제공하지 않습니다.</p>
  </div>
</footer>`;
}

/** 모바일 하단 고정 바 — 여기도 '예약 문의'가 번호 옆에 붙는다. */
function callbar(cfg) {
  return `<div class="bar">
  ${telBtn(cfg, { size: 'l', note: true, block: true })}
  <span class="bar-s">집 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/** 로고 — 네모를 가로지르는 굵은 결. 달·호·문과 겹치지 않는 모양. */
export function grainMark() {
  return `<svg class="gm" viewBox="0 0 26 26" aria-hidden="true" focusable="false"><rect x="2" y="2" width="22" height="22" fill="none" stroke-width="2.6"/><path d="M4.4 19.6 19.6 4.4" stroke-width="4.4" stroke-linecap="square"/><path d="M12.4 21.6 21.6 12.4" stroke-width="1.8" stroke-linecap="square" opacity=".55"/></svg>`;
}
function phoneMark() {
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4.2 1.6 6 1.2l1.5 3.3-1.6 1.2c.6 1.7 2 3.1 3.7 3.7l1.2-1.6 3.3 1.5-.4 1.8c-.2.8-.9 1.3-1.7 1.2C7.6 11.8 4.1 8.3 3 3.3c-.1-.8.4-1.5 1.2-1.7Z"/></svg>`;
}

/**
 * 섹션 틀 — 굵은 가로 괘선과 큰 순번 숫자가 이 사이트의 표시다.
 *   ━━━━━━━━━━━━━━
 *   01   큰 제목
 *        작은 부제
 */
export function panel(id, label, h2, inner, sub, n) {
  return `<section class="pn" id="${id}" aria-labelledby="${id}-h">
  <header class="pn-h">
    <span class="pn-no" aria-hidden="true">${n || '—'}</span>
    <div class="pn-tx">
      <p class="pn-lb" aria-hidden="true">${esc(label)}</p>
      <h2 id="${id}-h">${h2}</h2>
      ${sub ? `<p class="pn-sb">${sub}</p>` : ''}
    </div>
  </header>
  ${inner}
</section>`;
}
