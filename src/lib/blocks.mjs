import { esc, hash, shuffle, km, km2, won, dirWord } from './util.mjs';
import { panel, telBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function telCta(cfg, place, seedKey) {
  const h = hash(seedKey, 'cta');
  const lines = [
    `${place} 주소를 끝까지 들으면 집까지 몇 분인지 그 자리에서 나옵니다.`,
    `${place} 쪽으로 지금 나설 수 있는지 통화에서 바로 봐 드립니다.`,
    `${place}에서 받으시려면 코스·시각·주소 셋만 정하면 끝납니다.`,
    `${place} 요청은 이 번호 하나로만 들어옵니다. 다른 창구를 두지 않았습니다.`,
  ];
  return `<section class="call" aria-label="${esc(place)} 예약 문의">
  <p class="call-p">${esc(at(h, lines))}</p>
  ${telBtn(cfg, { size: 'l' })}
  <p class="call-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 일곱 개 설명을 다 달면 어느 쪽이든 같은 일곱 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li class="cr">
    <a class="cr-a" href="/course/${c.slug}/">
      <span class="cr-k">${esc(c.ko)}</span>
      <span class="cr-v">${c.min}<i>분</i> / ${won(c.price)}<i>원</i></span>
      <span class="cr-p">세기 ${esc(c.pressure)}${c.oil ? ' · 오일' : ' · 오일 없음'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="cr-d">${esc(line)}</p>` : ''}
  </li>`;
  }).join('');
  return panel('course', 'COURSE', `${esc(place)}에서 고를 수 있는 코스`,
    `<ul class="cr-ul">${list}</ul>
     <p class="pn-tail">${esc(at(h, SEC.courseTail, 2))} <a href="/course/">코스별 차이</a>와 <a href="/price/">값</a>을 따로 두었습니다.</p>`,
    at(h, SEC.courseSub, 1), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return panel('step', 'STEPS', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="wk-ol">${steps.map((s, i) => `<li class="wk"><span class="wk-n">${String(i + 1).padStart(2, '0')}</span><div class="wk-b"><h3 class="wk-t">${esc(s.t)}</h3><p class="wk-d">${esc(s.d)}</p></div></li>`).join('')}</ol>`,
    at(h, SEC.stepSub, 2), num);
}

/* ── 빠른 정보 표 ─────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="fx"><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
}

/* ── FAQ ─────────────────────────────────────────────────────── */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = panel('faq', 'Q&A', esc(at(h, SEC.faqTitle, 3)),
    `<div class="qs">${qa.map((x, i) => `<div class="qs-i"><h3 class="qs-q"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(x.q)}</h3><p class="qs-a">${esc(x.a)}</p></div>`).join('')}</div>`,
    at(h, SEC.faqSub, 4), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return panel('notice', 'NOTE', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="nt">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`, null, num);
}

/* ── 롱테일 링크 격자 ─────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const frame = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(frame(p.label))}</a></li>`;
  }).join('');
  return panel('longtail', label, heading, `<ul class="ln">${items}</ul>`, sub || at(h, SEC.ltSub, 6), num);
}

/* ── 가까운 거점 ─────────────────────────────────────────────── */
export function nearSpot(s, seedKey, num, far = false) {
  const items = s.near.map((n) => `<li>
    <a href="/${n.sidoSlug}/${n.guSlug}/${n.slug}/">
      <span class="dt-k">${km(n.km)}</span>
      <span class="dt-n">${esc(n.name)}</span>
      <span class="dt-g">${n.sameGu ? '같은 구' : esc(n.gu)}</span>
    </a></li>`).join('');
  return panel('near', 'DISTANCE', far ? `${esc(s.name)}에서 가장 가까운 다른 거점` : `${esc(s.name)} 가까운 동·읍`,
    `<ul class="dt">${items}</ul>`,
    at(hash(seedKey, 'nb'), far ? SEC.nearSubFar : SEC.nearSub), num);
}

/* ── 구 안의 거점 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="here"' : ''}>
    <a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="ix-n">${esc(s.name)}</span>
      <span class="ix-m">${km2(s.area)} · ${esc(dirWord(s.dir))}</span>
    </a></li>`).join('');
  return panel('spotidx', 'PLACES', `${esc(g.name)}에서 쪽을 둔 자리 ${g.spotCount}곳`,
    `<ul class="ix">${items}</ul>`,
    at(hash(seedKey, 'sx'), SEC.spotIdxSub), num);
}

/* ── 구 안의 면 목록 ─────────────────────────────────────────────
   면은 쪽을 내지 않는다(마을이 흩어져 있어 쪽을 채울 고유 사실이 안 나온다).
   받지 않는다는 뜻이 아니므로 이름을 그대로 적어 둔다. */
export function myeonList(g, seedKey, num) {
  if (!g.myeonCount) return '';
  return panel('myeon', 'MYEON', `${esc(g.name)} 면 ${g.myeonCount}곳`,
    `<ul class="mn">${g.myeon.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`,
    at(hash(seedKey, 'my'), SEC.myeonSub), num);
}

/* ── 시도 안의 구 목록 ────────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="here"' : ''}>
    <a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="ix-n">${esc(g.name)}</span>
      <span class="ix-m">동읍 ${g.spotCount} · ${km2(g.area)}</span>
    </a></li>`).join('');
  return panel('guidx', 'DISTRICTS', `${esc(sd.name)} 시군구 ${sd.gu.length}곳`,
    `<ul class="ix">${items}</ul>`,
    at(hash(seedKey, 'gi'), SEC.guIdxSub), num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return panel('also', 'MORE', '이어서 볼 곳',
    `<ul class="ln">
      <li><a href="/area/">받는 자리 전체</a></li>
      <li><a href="/guide/">이용안내</a></li>
      <li><a href="/price/">값</a></li>
      <li><a href="/course/">코스 안내</a></li>
      <li><a href="/magazine/">방문 기록</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('')}
    </ul>`,
    '층은 셋입니다 — 시도, 시군구, 동·읍. 면은 시군구 쪽 목록에 이름만 올려 두었습니다.');
}
