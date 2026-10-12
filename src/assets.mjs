/**
 * 화면 자산(CSS·JS·SVG)을 dist/assets 에 떨어뜨린다. 외부에서 글꼴이나 그림을
 * 불러오지 않는다 — 수집기가 볼 때 불러오는 것이 적을수록 좋고, 바깥으로 나가는
 * 요청이 없으면 이용자가 어디를 봤는지도 남지 않는다.
 *
 * ★배색과 골격을 앞서 만든 세 사이트와 겹치지 않게 짰다.
 *   루네사       : 밤남색 바탕 + 금빛 · 알약 버튼 · 둥근 점머리
 *   리바이브모션 : 뼈색 바탕 + 짙은 청록 + 녹슨 주황 · 각진 판 · 눈금 레일
 *   세린터치     : 미색 바탕 + 따뜻한 먹 + 숲 청록 · 둥근 블록(14px) · 대괄호 머리표
 *   벨벳럽       : **순백 바탕 + 거의 검정(#141414) + 크랜베리(#AE2B45)** ·
 *                  굵은 괘선(3px) · 큰 순번 숫자 · 라틴 대문자 라벨
 */
import fs from 'node:fs';
import path from 'node:path';

const C = {
  paper: '#FFFFFF',
  soft: '#F2F0ED',
  ink: '#141414',
  dim: '#5C5A57',
  acc: '#AE2B45',
  accDk: '#8E1F35',
  accSoft: '#FBEEF1',
  line: '#D7D3CD',
};

const css = `/* 벨벳럽 — 손으로 쓴 스타일시트. 빌드 때 그대로 복사된다. */
:root{
  --paper:${C.paper}; --soft:${C.soft};
  --ink:${C.ink}; --dim:${C.dim};
  --acc:${C.acc}; --acc-dk:${C.accDk}; --acc-soft:${C.accSoft};
  --line:${C.line};
  --rule:3px solid var(--ink);
  --r:3px;
  --w:1060px;
  --ff:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;
  --fm:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.72 var(--ff);
  padding-bottom:86px;word-break:keep-all;overflow-wrap:anywhere}
img,svg{max-width:100%}
a{color:var(--acc-dk);text-decoration:none}
a:hover,a:focus-visible{text-decoration:underline}
:focus-visible{outline:3px solid var(--acc);outline-offset:1px}
code{font-family:var(--fm);font-size:.92em;background:var(--soft);padding:.1em .35em}
.jump{position:absolute;left:-9999px}
.jump:focus{left:10px;top:10px;z-index:50;background:var(--ink);color:#fff;padding:.5rem .9rem}

/* ── 머리띠 ───────────────────────────────────────────── */
.hb{border-bottom:var(--rule);background:var(--paper)}
.hb-in{max-width:var(--w);margin:0 auto;padding:.7rem 1rem;display:flex;align-items:center;
  gap:1rem;justify-content:space-between;flex-wrap:wrap}
.sig{display:inline-flex;align-items:center;gap:.5rem;color:var(--ink)}
.sig:hover{text-decoration:none}
.gm{width:24px;height:24px;stroke:var(--acc);fill:none}
.gm rect{stroke:var(--ink)}
.gm path{stroke:var(--acc)}
.sig-t{display:flex;flex-direction:column;line-height:1.1}
.sig-t b{font-size:1.1rem;letter-spacing:-.02em}
.sig-t i{font-style:normal;font-size:.6rem;letter-spacing:.2em;color:var(--dim)}
.menu{display:flex;gap:1rem;font-size:.92rem;flex-wrap:wrap}
.menu a{color:var(--ink);padding-bottom:2px;border-bottom:3px solid transparent}
.menu a:hover{text-decoration:none;border-bottom-color:var(--line)}
.menu a[aria-current]{border-bottom-color:var(--acc);color:var(--acc-dk);font-weight:700}
.hb-call{background:var(--ink);color:#fff}
.hb-call>span,.hb-call{}
.hb-call{max-width:none;display:flex;align-items:center;gap:.9rem;justify-content:center;
  padding:.45rem 1rem;flex-wrap:wrap}
.hb-run{font-size:.74rem;letter-spacing:.04em;color:#CFCBC6}

/* ── 예약 문의 버튼 ────────────────────────────────────── */
.pb{display:inline-flex;align-items:center;gap:.55rem;border:2px solid var(--ink);
  background:var(--paper);color:var(--ink);padding:.45rem .75rem;border-radius:var(--r)}
.pb:hover,.pb:focus-visible{text-decoration:none;background:var(--acc);border-color:var(--acc);color:#fff}
.pb:hover .pb-ic svg,.pb:focus-visible .pb-ic svg{fill:#fff}
.pb:hover .pb-lb,.pb:focus-visible .pb-lb{color:#fff}
.pb-ic{display:block;flex:0 0 auto}
.pb-ic svg{fill:var(--acc);display:block}
.pb-tx{display:flex;flex-direction:column;line-height:1.15}
.pb-lb{font-size:.68rem;letter-spacing:.12em;font-weight:700;color:var(--acc-dk)}
.pb-nm{font-weight:700;font-size:1.02rem;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.pb-nt{font-size:.64rem;border:1px solid currentColor;padding:.08rem .34rem;white-space:nowrap}
.hb-call .pb{background:transparent;border-color:#fff;color:#fff}
.hb-call .pb-lb{color:#fff}
.hb-call .pb-ic svg{fill:#fff}
.hb-call .pb:hover{background:#fff;color:var(--ink)}
.hb-call .pb:hover .pb-lb,.hb-call .pb:hover .pb-nm{color:var(--ink)}
.hb-call .pb:hover .pb-ic svg{fill:var(--acc)}
.pb-s{padding:.3rem .6rem}
.pb-s .pb-nm{font-size:.94rem}
.pb-l{padding:.7rem 1.1rem;border-width:3px}
.pb-l .pb-nm{font-size:1.16rem}
.pb-w{display:flex;width:100%;justify-content:center}

/* ── 갈피 ─────────────────────────────────────────────── */
.way{max-width:var(--w);margin:0 auto;padding:.8rem 1rem 0;font-size:.8rem;color:var(--dim)}
.way ol{list-style:none;display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0}
.way li+li::before{content:'\\203A';margin-right:.35rem;color:var(--line)}

/* ── 본문 ─────────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:1rem 1rem 3rem}
.tt{font-size:1.72rem;line-height:1.3;letter-spacing:-.025em;margin:.9rem 0 1.3rem}
.tt-s{display:block;font-size:.86rem;font-weight:500;color:var(--dim);letter-spacing:.01em;margin-top:.4rem}
.say{display:grid;gap:.75rem;margin:0 0 1.8rem;font-size:1.03rem;max-width:46rem}
.say p{margin:0}

/* 섹션 = 굵은 괘선 + 큰 순번 */
.pn{margin:2.4rem 0;padding-top:1.1rem;border-top:var(--rule)}
.pn-h{display:flex;gap:1rem;align-items:flex-start;margin-bottom:1.1rem}
.pn-no{font-family:var(--fm);font-size:2.1rem;line-height:1;font-weight:700;color:var(--acc);
  flex:0 0 auto;letter-spacing:-.04em}
.pn-tx{min-width:0}
.pn-lb{margin:0 0 .15rem;font-size:.64rem;letter-spacing:.22em;color:var(--dim);font-weight:700}
.pn-h h2{margin:0;font-size:1.22rem;letter-spacing:-.02em;line-height:1.38}
.pn-sb{margin:.3rem 0 0;font-size:.89rem;color:var(--dim)}
.pn-tail{margin:1rem 0 0;font-size:.89rem;color:var(--dim)}
.pn-p{margin:0 0 .75rem;max-width:46rem}

/* 예약 문의 띠 */
.call{margin:2rem 0;padding:1.3rem 1rem;border-top:var(--rule);border-bottom:var(--rule);
  background:var(--acc-soft);text-align:center}
.call-p{margin:0 0 .85rem;font-size:1.03rem}
.call-s{margin:.75rem 0 0;font-size:.8rem;color:var(--dim)}

/* 사실 표 */
.fx{width:100%;border-collapse:collapse;font-size:.95rem}
.fx th{text-align:left;width:9.5rem;padding:.55rem .8rem .55rem 0;vertical-align:top;
  font-weight:600;font-size:.84rem;color:var(--dim);border-bottom:1px solid var(--line)}
.fx td{padding:.55rem 0;border-bottom:1px solid var(--line)}
.fx tr:last-child th,.fx tr:last-child td{border-bottom:2px solid var(--ink)}

/* 코스 */
.cr-ul{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.cr{border-bottom:1px solid var(--line);padding:.75rem 0}
.cr-a{display:grid;grid-template-columns:1fr auto;gap:.1rem .8rem;align-items:baseline;color:var(--ink)}
.cr-a:hover{text-decoration:none}
.cr-k{font-weight:700;font-size:1.06rem;color:var(--acc-dk)}
.cr-v{font-family:var(--fm);font-size:.9rem;font-variant-numeric:tabular-nums}
.cr-v i{font-style:normal;font-size:.76em;color:var(--dim)}
.cr-p{grid-column:1/-1;font-size:.76rem;letter-spacing:.04em;color:var(--dim)}
.cr-d{margin:.45rem 0 0;font-size:.88rem;color:#3C3A37;max-width:44rem}

/* 순서 */
.wk-ol{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.wk{display:flex;gap:1rem;padding:.85rem 0;border-bottom:1px solid var(--line)}
.wk-n{font-family:var(--fm);font-size:1.3rem;font-weight:700;color:var(--acc);flex:0 0 2.1rem;line-height:1.3}
.wk-b{min-width:0}
.wk-t{margin:0 0 .2rem;font-size:1rem}
.wk-d{margin:0;font-size:.9rem;color:#3C3A37}

/* 질문 */
.qs{border-top:1px solid var(--line)}
.qs-i{padding:.9rem 0;border-bottom:1px solid var(--line)}
.qs-q{margin:0 0 .35rem;font-size:1rem;display:flex;gap:.6rem;align-items:baseline}
.qs-q span{font-family:var(--fm);font-size:.78rem;color:var(--acc);flex:0 0 auto}
.qs-a{margin:0 0 0 1.9rem;font-size:.93rem;color:#3C3A37}

/* 주의 */
.nt{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.nt li{padding:.7rem 0 .7rem 1.1rem;border-bottom:1px solid var(--line);font-size:.92rem;position:relative}
.nt li::before{content:'';position:absolute;left:0;top:1.1rem;width:.42rem;height:.42rem;background:var(--acc)}
.nt b{color:var(--acc-dk)}

/* 링크 격자 */
.ln{list-style:none;margin:0;padding:0;display:grid;gap:.3rem .9rem;
  grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));font-size:.9rem}

/* 거리 */
.dt{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.dt li{border-bottom:1px solid var(--line)}
.dt a{display:grid;grid-template-columns:4.4rem 1fr auto;gap:.6rem;align-items:baseline;
  padding:.55rem 0;color:var(--ink)}
.dt a:hover{text-decoration:none;color:var(--acc-dk)}
.dt-k{font-family:var(--fm);font-weight:700;color:var(--acc);font-variant-numeric:tabular-nums}
.dt-n{font-weight:600}
.dt-g{font-size:.76rem;color:var(--dim)}

/* 거점·구 목록 */
.ix{list-style:none;margin:0;padding:0;display:grid;gap:.35rem;
  grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr))}
.ix a{display:grid;gap:.05rem;border:1px solid var(--line);padding:.5rem .65rem;color:var(--ink);border-radius:var(--r)}
.ix a:hover{text-decoration:none;border-color:var(--ink)}
.ix li.here a{border-color:var(--acc);border-width:2px;background:var(--acc-soft)}
.ix-n{font-weight:600;font-size:.95rem}
.ix-m{font-size:.73rem;color:var(--dim);font-variant-numeric:tabular-nums}

/* 면 */
.mn{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem .5rem;font-size:.84rem;color:var(--dim)}
.mn li{border:1px solid var(--line);padding:.14rem .5rem}

/* 대문 */
.top{margin:.4rem 0 2.2rem;padding:0 0 1.4rem;border-bottom:var(--rule)}
.top-k{margin:0 0 .7rem;font-size:1.34rem;font-weight:700;letter-spacing:-.025em;color:var(--acc-dk)}
.top-l{margin:0 0 1.2rem;font-size:1.03rem;max-width:46rem}
.top-n{margin:1.4rem 0 0;display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))}
.top-n div{border-left:3px solid var(--acc);padding-left:.7rem}
.top-n dt{font-weight:700;font-size:1.02rem}
.top-n dd{margin:.1rem 0 0;font-size:.84rem;color:var(--dim)}

/* 시도 목록 */
.sb{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.sb li{border-bottom:1px solid var(--line)}
.sb a{display:grid;grid-template-columns:7rem 1fr;gap:.2rem .9rem;align-items:baseline;padding:.75rem 0;color:var(--ink)}
.sb a:hover{text-decoration:none;color:var(--acc-dk)}
.sb-n{font-size:1.14rem;font-weight:700}
.sb-m{font-size:.82rem;font-variant-numeric:tabular-nums}
.sb-g{grid-column:2;font-size:.76rem;color:var(--dim)}

/* 설명 칸 */
.cols{display:grid;gap:0;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));border-top:1px solid var(--line)}
.cols section{padding:.9rem 1rem .9rem 0;border-bottom:1px solid var(--line)}
.cols h3{margin:0 0 .3rem;font-size:1rem;color:var(--acc-dk)}
.cols p{margin:0;font-size:.9rem;color:#3C3A37}

/* 기록 목록 */
.rd{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.rd li{padding:.85rem 0;border-bottom:1px solid var(--line)}
.rd a{display:flex;flex-wrap:wrap;align-items:baseline;gap:.6rem;color:var(--ink)}
.rd a:hover{text-decoration:none;color:var(--acc-dk)}
.rd-t{font-weight:700;font-size:1.02rem}
.rd time{font-family:var(--fm);font-size:.75rem;color:var(--dim)}
.rd-s{margin:.25rem 0 0;font-size:.88rem;color:var(--dim)}

/* 지역 나무 */
.tw{margin:0 0 1.5rem}
.tw-h{margin:0 0 .5rem;font-size:1.06rem;padding-bottom:.3rem;border-bottom:2px solid var(--ink)}
.tw-m{font-size:.74rem;font-weight:400;color:var(--dim);font-variant-numeric:tabular-nums}
.tw-ul{list-style:none;margin:0;padding:0;display:grid;gap:.22rem .9rem;
  grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));font-size:.89rem}
.tw-s{font-size:.72rem;color:var(--dim);font-variant-numeric:tabular-nums}

/* 표 */
.wide{overflow-x:auto}
.gr{width:100%;border-collapse:collapse;font-size:.9rem}
.gr caption{caption-side:top;text-align:left;font-size:.78rem;color:var(--dim);padding:0 0 .5rem}
.gr th,.gr td{padding:.5rem .7rem .5rem 0;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}
.gr thead th{border-bottom:2px solid var(--ink);font-size:.76rem;letter-spacing:.06em;color:var(--dim)}
.gr tbody th{font-weight:700;color:var(--acc-dk)}

/* 고르기 */
.ch{margin:0;display:grid;gap:0;border-top:1px solid var(--line)}
.ch div{display:grid;grid-template-columns:1fr auto;gap:.25rem .9rem;align-items:baseline;
  padding:.6rem 0;border-bottom:1px solid var(--line)}
.ch dt{margin:0;font-size:.93rem}
.ch dd{margin:0;font-size:.85rem;font-variant-numeric:tabular-nums}

/* 코스 비교 */
.cp{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.cp li{padding:.7rem 0;border-bottom:1px solid var(--line)}
.cp a{display:grid;grid-template-columns:1fr auto;gap:.1rem .8rem;align-items:baseline;color:var(--ink)}
.cp a:hover{text-decoration:none}
.cp-k{font-weight:700;color:var(--acc-dk)}
.cp-v{font-family:var(--fm);font-size:.82rem;font-variant-numeric:tabular-nums}
.cp-d{margin:.3rem 0 0;font-size:.86rem;color:var(--dim)}

/* 조문 */
.law{margin:0;padding:0;list-style:none;display:grid;gap:0;border-top:1px solid var(--line)}
.law li{padding:1rem 0;border-bottom:1px solid var(--line)}
.law h3{margin:0 0 .35rem;font-size:1rem;color:var(--acc-dk)}
.law p{margin:0;font-size:.92rem;color:#3C3A37;max-width:46rem}

/* 글 */
.date{margin:0 0 1.1rem;font-family:var(--fm);font-size:.76rem;color:var(--dim)}
.doc{max-width:44rem}
.doc h3{margin:2rem 0 .55rem;font-size:1.1rem;padding-top:1rem;border-top:2px solid var(--ink)}
.doc p{margin:0 0 .9rem}
.doc ul{margin:0 0 1.2rem;padding-left:1.1rem}
.doc li{margin:.32rem 0}

/* 하단 고정 바 */
.bar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--ink);
  border-top:3px solid var(--acc);padding:.5rem .8rem .6rem;display:grid;gap:.22rem;justify-items:center}
.bar .pb{background:transparent;border-color:#fff;color:#fff}
.bar .pb-lb{color:#fff}
.bar .pb-ic svg{fill:#fff}
.bar-s{font-size:.7rem;color:#CFCBC6}

/* 푸터 */
.fb{border-top:var(--rule);margin-top:2.5rem;background:var(--soft)}
.fb-grid{max-width:var(--w);margin:0 auto;padding:2rem 1rem 1.4rem;display:grid;gap:1.8rem;
  grid-template-columns:minmax(17rem,1.5fr) minmax(12rem,1fr)}
.fb-h{margin:0 0 .5rem;font-size:.68rem;letter-spacing:.2em;font-weight:700;color:var(--acc-dk)}
.fb-say{margin:0 0 .9rem;font-size:.9rem;color:#3C3A37}
.fb-run{margin:.8rem 0 0;font-size:.82rem;color:var(--dim)}
.fb-biz{margin:.5rem 0 0;font-size:.76rem;color:var(--dim)}
.fb-dim{opacity:.75}
.fb-reg{margin-top:1.2rem;padding-top:.9rem;border-top:1px solid var(--line)}
.fb-reg ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.88rem}
.fb-right nav+nav{margin-top:1.3rem}
.fb-ul{list-style:none;margin:0;padding:0;display:grid;gap:.22rem;font-size:.88rem}
.fb-post li{display:grid}
.fb-post time{font-family:var(--fm);font-size:.7rem;color:var(--dim)}
.fb-feed{list-style:none;margin:.6rem 0 0;padding:0;display:flex;gap:.8rem;font-size:.8rem}
.fb-sm{margin:.6rem 0 0;font-size:.76rem;color:var(--dim)}
.fb-end{border-top:1px solid var(--line)}
.fb-end>p{max-width:var(--w);margin:0 auto;padding:.9rem 1rem;font-size:.76rem;color:var(--dim)}
.fb-ai strong{color:var(--acc-dk)}
.fb-cr{padding-top:0 !important}

@media (max-width:680px){
  .tt{font-size:1.4rem}
  .pn-no{font-size:1.6rem}
  .pn{margin:1.9rem 0}
  .fx th{width:auto;display:block;border-bottom:0;padding-bottom:.1rem}
  .fx td{display:block;padding-top:0}
  .fx tr{display:block;border-bottom:1px solid var(--line);padding:.45rem 0}
  .fx th,.fx td{border-bottom:0}
  .sb a{grid-template-columns:1fr}
  .sb-g{grid-column:1}
  .fb-grid{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
@media print{.hb-call,.bar,.call{display:none}body{padding-bottom:0}}
`;

/* 자바스크립트는 거의 두지 않는다. 화면을 바꾸는 무작위 요소를 넣으면
   '같은 주소 = 같은 응답' 원칙이 흔들린다. 여기서는 푸터가 보일 때
   하단 고정 바를 내리는 일만 한다. */
const js = `(function(){
  var bar=document.querySelector('.bar'), ft=document.querySelector('.fb');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  bar.style.transition='transform .18s ease-out';
  new IntersectionObserver(function(es){
    es.forEach(function(e){ bar.style.transform = e.isIntersecting ? 'translateY(110%)' : 'translateY(0)'; });
  },{threshold:0.08}).observe(ft);
})();
`;

/** 네모를 가로지르는 굵은 결 — 머리띠 로고와 같은 모양 */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${C.ink}"/><rect x="6" y="6" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M8.4 23.6 23.6 8.4" stroke="${C.acc}" stroke-width="4.6" stroke-linecap="square"/></svg>`;

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56" role="img" aria-label="벨벳럽 VelvetRub"><rect width="220" height="56" fill="${C.paper}"/><rect x="12" y="12" width="32" height="32" fill="none" stroke="${C.ink}" stroke-width="3"/><path d="M15 41 41 15" stroke="${C.acc}" stroke-width="6" stroke-linecap="square"/><text x="56" y="30" font-family="sans-serif" font-size="20" font-weight="700" fill="${C.ink}">벨벳럽</text><text x="56" y="44" font-family="sans-serif" font-size="9" letter-spacing="3" fill="${C.dim}">VELVETRUB</text></svg>`;

const og = (cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${C.paper}"/><rect x="0" y="0" width="1200" height="18" fill="${C.ink}"/><rect x="0" y="612" width="1200" height="18" fill="${C.acc}"/><rect x="72" y="86" width="112" height="112" fill="none" stroke="${C.ink}" stroke-width="9"/><path d="M80 190 176 94" stroke="${C.acc}" stroke-width="18" stroke-linecap="square"/><text x="72" y="306" font-family="sans-serif" font-size="74" font-weight="700" fill="${C.ink}">${cfg.brand.ko} 출장마사지</text><text x="72" y="382" font-family="sans-serif" font-size="36" fill="${C.dim}">${cfg.coverage.sido.join(' · ')} 동·읍 방문 관리</text><text x="72" y="448" font-family="sans-serif" font-size="34" fill="${C.accDk}">${cfg.hours} · ${cfg.pay} · ${cfg.telLabel}</text><text x="72" y="552" font-family="sans-serif" font-size="26" letter-spacing="5" fill="${C.dim}">VELVETRUB — ${cfg.brand.slogan}</text></svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'velvet.css'), css);
  fs.writeFileSync(path.join(dir, 'velvet.js'), js);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), favicon);
  fs.writeFileSync(path.join(dir, 'logo.svg'), logo);
  fs.writeFileSync(path.join(dir, 'og.svg'), og(cfg));
}
export const THEME = C;
