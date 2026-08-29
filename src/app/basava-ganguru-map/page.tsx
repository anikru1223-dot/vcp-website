'use client';

import { useEffect, useRef } from 'react';

/**
 * Basavanaganguru Interactive Map
 * Converted from the supplied standalone HTML while preserving the original
 * CSS, SVG/map markup, translations, and browser-side interaction logic.
 */

const MAP_CSS = String.raw`
:root{
  --ink-0:#050b11; --ink-1:#08131c;
  --edge:rgba(180,230,255,.22); --edge-hi:rgba(180,230,255,.40);
  --txt:#eef6fa; --txt-dim:#a7bcc8; --txt-mute:#7590a0;
  --acc:#5fe3c8;
  --available:#3ecfb2; --hold:#f0b458; --reserved:#e2794e; --sold:#b6403f;
  --r:18px; --blur:blur(40px) saturate(210%) brightness(1.08);
  --panelA:rgba(14,24,37,.52); --panelB:rgba(9,17,27,.40);
  --edgetint:rgba(180,230,255,.22); --spec:rgba(255,255,255,.45);
  --asphalt:#1b2026; --asphalt2:#141a1f; --paint:rgba(244,250,253,.95);
  --maptxt:#06181a;
  --appmax:1180px;                 /* content centers within this width on wide screens */
  /* Panels sit near the screen edges (as before). --fx only kicks in to
     center content on very wide screens; on phones it's just 14px. */
  --fx:max(14px, calc((100vw - var(--appmax)) / 2));  /* side edge for panels */
  --ft:0px;                         /* top edge (panels use their own top offset) */
  --fb:0px;                         /* bottom edge */
  --gx:var(--fx);                   /* alias */
  --inx:var(--fx);                  /* panel left/right */
  --intop:74px;                     /* panel top offset below header */
  --navh:84px;                      /* nav clearance */
  --abovenav:calc(var(--navh) + 14px); /* bottom offset to clear the nav */
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%;margin:0}
body{
  background:radial-gradient(120% 80% at 78% 8%,#123146 0,transparent 55%),
             radial-gradient(90% 70% at 8% 92%,#102c34 0,transparent 55%),
             linear-gradient(168deg,var(--ink-1) 0,var(--ink-0) 62%,#061019 100%);
  color:var(--txt);font-family:'Sora',system-ui,sans-serif;overflow:hidden;overscroll-behavior:none;
  transition:background .6s ease;
}
body.lit{
  --txt:#05080a; --txt-dim:#1c2622; --txt-mute:#3a453f;
  --edge:rgba(255,255,255,.85); --edge-hi:rgba(60,90,100,.30);
  --panelA:rgba(255,255,255,.58); --panelB:rgba(248,250,252,.46);
  --edgetint:rgba(255,255,255,.85); --spec:rgba(255,255,255,.9);
  --asphalt:#2f333a; --asphalt2:#282c32; --paint:#ffffff; --maptxt:#0a1410;
  background:radial-gradient(120% 90% at 70% 10%,#d6d3c0 0,transparent 60%),
             linear-gradient(170deg,#c7ccb6 0%,#bcc5aa 55%,#b0bc9c 100%);
}
body.real{
  --asphalt:#41474f; --asphalt2:#383e46; --paint:#ffffff; --maptxt:#141c14;
  background:radial-gradient(110% 90% at 62% 4%,#d8d4c1 0,transparent 62%),
             linear-gradient(168deg,#cbccb2 0%,#bcc4a4 58%,#aeba98 100%);
}
.mono{font-family:'IBM Plex Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}

#stage{position:fixed;inset:0;touch-action:none;cursor:grab}#stage.drag{cursor:grabbing}
#svg{width:100%;height:100%;display:block;text-rendering:geometricPrecision}

.plot{stroke:rgba(4,14,20,.92);stroke-width:.9px;vector-effect:non-scaling-stroke;
  cursor:pointer;transition:fill .25s,opacity .18s}
body.lit .plot{stroke:rgba(34,44,32,.66)}
body.real .plot{stroke:rgba(38,46,34,.55);stroke-width:1.1px}
.plot:hover{filter:brightness(1.28)}
.plot.dim{opacity:.10}
.plot.filtered{opacity:.12;pointer-events:none}
body.lit .plot.dim{opacity:.30}
.pad{fill:#ddd2b9;stroke:none;display:none}
body.real .pad{display:inline}
#hit path{fill:transparent;stroke:none;cursor:pointer}

.road{fill:var(--asphalt)}
.roadx{fill:var(--asphalt2)}
.lane{fill:none;stroke:var(--paint);stroke-linecap:butt;stroke-linejoin:round}
.lane.ctr{stroke-dasharray:3 3.2}
.kerb{fill:none;stroke:rgba(255,255,255,.10);stroke-width:1px;vector-effect:non-scaling-stroke}
.brk{fill:none;stroke:var(--paint);stroke-linecap:round;stroke-linejoin:round;opacity:.85}
body.real .kerb{stroke:rgba(255,255,255,.22)}
.site{fill:none;stroke:rgba(150,205,230,.55);stroke-width:1.7px;stroke-dasharray:9 5;vector-effect:non-scaling-stroke}
.survey{fill:none;stroke-width:1.5px;stroke-dasharray:7 4;vector-effect:non-scaling-stroke;opacity:.92}
body.lit .site{stroke:rgba(70,90,60,.66)}
.amen{stroke:rgba(4,14,20,.55);stroke-width:.8px;vector-effect:non-scaling-stroke;cursor:pointer;transition:fill .25s,opacity .18s}
.amen.dim{opacity:.12}
.kharab{stroke:rgba(150,190,140,.85);stroke-width:1.1px;vector-effect:non-scaling-stroke}
.tree{fill:rgba(86,140,74,.60);stroke:rgba(48,92,44,.55);stroke-width:.6px;vector-effect:non-scaling-stroke;display:none}
body.real .tree{display:inline}

/* --- map text: no plate, no halo, just sharp type --- */
text{pointer-events:none;text-rendering:geometricPrecision}
.pnum{font-family:'IBM Plex Mono',monospace;font-weight:700;fill:var(--maptxt);text-anchor:middle;
  dominant-baseline:middle;letter-spacing:-.02em}
.amenlbl{font-family:'Oswald',sans-serif;font-weight:600;text-anchor:middle;letter-spacing:.1em;paint-order:stroke;stroke-linejoin:round;
  dominant-baseline:middle}
.roadlbl{font-family:'Oswald',sans-serif;font-weight:600;text-anchor:middle;dominant-baseline:middle;
  letter-spacing:.06em;fill:var(--paint)}
body.real .roadlbl{fill:rgba(255,255,255,.96)}
body.lit .amenlbl{stroke:rgba(255,255,255,.55);stroke-width:.14px;font-weight:700}
.dimtxt{font-family:'IBM Plex Mono',monospace;font-weight:600;fill:#d6fbff;text-anchor:middle;
  paint-order:stroke;stroke:#04121a;stroke-linejoin:round;dominant-baseline:middle}
body.lit .dimtxt{fill:#06343c;stroke:#f8f7ec}

.selhi{fill:rgba(127,243,255,.14);stroke:#8ff7ff;stroke-width:2.6px;vector-effect:non-scaling-stroke;
  stroke-linejoin:round;pointer-events:none;filter:drop-shadow(0 0 7px rgba(120,240,255,.6))}
body.lit .selhi{fill:rgba(20,90,90,.14);stroke:#0d4f57;filter:drop-shadow(0 0 5px rgba(30,90,90,.45))}
.hovhi{fill:rgba(255,255,255,.09);stroke:rgba(190,245,255,.75);stroke-width:1.5px;
  vector-effect:non-scaling-stroke;stroke-linejoin:round;pointer-events:none}
body.lit .hovhi{fill:rgba(20,60,60,.08);stroke:rgba(15,70,75,.6)}
.dimline{stroke:#7ff3ff;stroke-width:1.6px;vector-effect:non-scaling-stroke;opacity:.95;stroke-linecap:round}
body.lit .dimline{stroke:#0c5560}

.glass{position:relative;background:linear-gradient(155deg,var(--panelA),var(--panelB));
  -webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);
  border:1px solid var(--edgetint);border-radius:var(--r);
  box-shadow:
    0 30px 60px -12px rgba(0,0,0,.45),
    0 18px 36px -18px rgba(0,0,0,.30),
    inset 0 1.5px 0.5px 0 var(--spec),
    inset 0 -1px 1px 0 rgba(255,255,255,.12),
    inset 1px 0 1px -0.5px rgba(255,255,255,.10),
    inset -1px 0 1px -0.5px rgba(255,255,255,.06);
  transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s cubic-bezier(.34,1.56,.64,1)}
.glass::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(120% 88% at 12% -10%,rgba(255,255,255,.28),rgba(255,255,255,.06) 42%,transparent 60%)}
.glass::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:.7;
  background:linear-gradient(118deg,rgba(255,255,255,.30) 0%,transparent 20%,transparent 72%,var(--edgetint) 100%);
  mix-blend-mode:screen}
body.lit .glass{box-shadow:
    0 30px 60px -12px rgba(40,50,60,.28),
    0 18px 36px -18px rgba(40,50,60,.20),
    inset 0 1.5px 0.5px 0 rgba(255,255,255,.95),
    inset 0 -1px 1px 0 rgba(255,255,255,.4)}
body.lit .glass::before{background:radial-gradient(130% 95% at 16% -8%,rgba(255,255,255,.65),rgba(255,255,255,.16) 46%,transparent 64%)}
body.lit .glass::after{opacity:.45;
  background:linear-gradient(115deg,rgba(255,255,255,.55) 0%,transparent 24%,transparent 76%,rgba(120,200,235,.20) 100%)}
body.lit #toggles,body.lit #legend,body.lit #searchwrap,body.lit #layermenu,body.lit .lm,body.lit #scalebar{color:var(--txt)}
body.lit .tgrow span,body.lit .lgrow,body.lit .lm b,body.lit #sblabel,body.lit .lgn{font-weight:600;color:#05080a}
body.lit .lgtitle,body.lit #sblabel{color:#2a332e;font-weight:700}
body.lit .lm small{color:#2f3b35}
body.lit .lm.on b{color:#0a3a26}
body.lit #search{color:#05080a}
body.lit #search::placeholder{color:#4a554e}
/* click ripple: a bright glass highlight that blooms on press (esp. visible in light mode) */
@keyframes glassPulse{0%{opacity:.55;transform:scale(.4)}100%{opacity:0;transform:scale(1.9)}}
.ripple{position:absolute;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(255,255,255,.9),rgba(255,255,255,.25) 45%,transparent 70%);
  mix-blend-mode:screen;animation:glassPulse .5s ease-out forwards}
body.lit .ripple{background:radial-gradient(circle,rgba(255,255,255,.95),rgba(150,220,255,.4) 45%,transparent 70%)}
/* the glass answers the hand: a soft lift, a springy press */
.tbtn:hover,#layerbtn:hover,#compass:hover,#miq:hover{transform:translateY(-1.5px)}
.tbtn:active,#compass:active,#miq:active{transform:translateY(0) scale(.94)}
.nv{transition:transform .3s cubic-bezier(.34,1.5,.55,1),color .18s,background .18s}
.nv:hover{transform:translateY(-2px)}
.nv:active{transform:scale(.93)}

#top{position:fixed;top:0;left:0;right:0;padding:12px var(--fx);display:flex;gap:10px;align-items:flex-start;pointer-events:none;z-index:34}
#brand{pointer-events:auto;padding:8px 8px 8px 14px;display:flex;gap:11px;align-items:center;min-width:0;border-radius:999px}
#mark{width:34px;height:34px;flex:0 0 34px;border-radius:9px;display:grid;place-items:center;
  background:#0d1626;color:#e3b579;border:1px solid rgba(227,181,121,.28)}
body.lit #mark{background:#12203a}
#mark svg{width:22px;height:22px}
#brandtxt{flex:1 1 auto}
#brand h1{margin:0;font-size:14px;font-weight:700;letter-spacing:.1px;white-space:nowrap}
#brand p{margin:2px 0 0;font-size:9px;letter-spacing:1.4px;color:var(--txt-mute);text-transform:uppercase;white-space:nowrap}

#layerwrap{pointer-events:auto;position:relative}
#langwrap{pointer-events:auto;position:relative}
#sharewrap{pointer-events:auto;position:relative}
#sharebtn{display:flex;align-items:center;gap:8px;padding:7px 11px;cursor:pointer;color:var(--txt-dim);transition:.18s}
#sharebtn:hover,#sharebtn.on{color:var(--acc)}
#sharebtn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#sharebtn span{font-size:11px}
#sharepop{position:fixed;width:238px;padding:8px;z-index:64;
  transform-origin:top right;transform:scale(.96) translateY(-6px);opacity:0;pointer-events:none;transition:.2s}
#sharepop.show{transform:none;opacity:1;pointer-events:auto}
#sptitle{font-size:8.5px;letter-spacing:1.3px;color:var(--txt-mute);text-transform:uppercase;padding:4px 8px 7px}
#layerbtn{display:flex;align-items:center;gap:8px;padding:7px 11px;cursor:pointer;color:var(--txt-dim);transition:.18s}
#layerbtn:hover,#layerbtn.on{color:var(--acc)}
#layerbtn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#layerbtn span{font-size:11px}
#layermenu{overflow-y:auto;-webkit-overflow-scrolling:touch;position:absolute;top:calc(100% + 8px);right:0;width:214px;padding:6px;z-index:30;border-radius:18px;
  transform-origin:top right;transform:scale(.96) translateY(-6px);opacity:0;pointer-events:none;transition:.2s}
#layermenu.show{transform:none;opacity:1;pointer-events:auto}
body.menu-open #miq{opacity:0;pointer-events:none}
.lm{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;border-radius:10px;cursor:pointer;transition:.15s}
.lm:hover{background:rgba(128,150,160,.12)}
.lm.on{background:rgba(95,227,200,.17)}
body.lit .lm.on{background:rgba(45,105,70,.20)}
.lm i{width:9px;height:9px;border-radius:99px;flex:0 0 9px;margin-top:4px;border:1.5px solid var(--txt-mute)}
.lmsec{font-size:8.5px;letter-spacing:1.3px;color:var(--txt-mute);text-transform:uppercase;
  padding:10px 10px 5px;margin-top:5px;border-top:1px solid var(--edge)}
.lm.f i{border-color:var(--fc);background:transparent;margin-top:3px}
.lm.f.on i{background:var(--fc);border-color:var(--fc)}
.lm.f.on b{color:var(--fc)}
body.lit .lm.f.on b{color:var(--txt);font-weight:700}
body.lit .lm.f i{border-width:2px}
.lm.c.dis{opacity:.4;cursor:default}
.lm.c.dis:hover{background:none}
#ldot{display:none;width:7px;height:7px;border-radius:99px;background:currentColor;margin-left:1px}
#ldot.on{display:block}
.lm.on i{border-color:var(--acc);background:var(--acc)}
body.lit .lm.on i{border-color:#2c6b28;background:#2c6b28}
.lm b{display:block;font-size:11.5px;font-weight:600;color:var(--txt)}
.lm.on b{color:#7ff0d8} body.lit .lm.on b{color:#0d4232;font-weight:700}
.lm small{display:block;font-size:9.5px;color:var(--txt-dim);opacity:.85;margin-top:2px;line-height:1.45}

#stats{margin-left:auto;pointer-events:auto;display:flex;padding:9px 4px}
.stat{padding:0 13px;text-align:center;border-right:1px solid var(--edge)}
.stat:last-child{border:0}
.stat b{display:block;font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:600;line-height:1}
.stat span{font-size:8.5px;letter-spacing:1px;color:var(--txt-mute);text-transform:uppercase}

#left{position:fixed;left:var(--inx);top:var(--intop);z-index:20;display:flex;flex-direction:column;gap:10px;max-width:200px}
#legend{padding:11px 13px;min-width:150px}
.lgtitle{font-size:8.5px;letter-spacing:1.3px;color:var(--txt-mute);text-transform:uppercase;margin-bottom:8px}
.lgrow{display:flex;align-items:center;gap:8px;font-size:11px;padding:3.5px 0;cursor:pointer;color:var(--txt-dim);transition:.15s}
.lgrow:hover{color:var(--txt)}
.lgrow.off{opacity:.35}
.sw{width:11px;height:11px;border-radius:3.5px;flex:0 0 11px}
.lgn{margin-left:auto;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--txt-mute)}
#scalebar{position:fixed;left:calc(var(--inx) + 2px);z-index:22;padding:0;width:132px;
  background:none;border:none;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;bottom:var(--abovenav)}
#scalebar::before,#scalebar::after{display:none}
#sblabel{font-size:9.5px;color:var(--txt-mute);margin-bottom:5px;letter-spacing:.5px}
#sbline{height:5px;border-left:1.5px solid var(--txt-dim);border-right:1.5px solid var(--txt-dim);border-bottom:1.5px solid var(--txt-dim)}

#right{position:fixed;right:var(--inx);top:var(--intop);z-index:20;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
#toggles{padding:9px 13px;min-width:200px}
.tgrow{display:flex;align-items:center;gap:10px;font-size:11px;padding:5px 0;color:var(--txt-dim)}
.tgrow span{flex:1}
.sw2{width:34px;height:19px;border-radius:99px;background:rgba(128,150,160,.28);position:relative;cursor:pointer;flex:0 0 34px;transition:.2s}
.sw2:after{content:'';position:absolute;top:2.5px;left:2.5px;width:14px;height:14px;border-radius:99px;background:#c8d8de;transition:.2s}
.sw2.on{background:linear-gradient(120deg,#3ecfb2,#2b8f9c)}
.sw2.on:after{transform:translateX(15px);background:#04141a}
body.lit .sw2.on{background:linear-gradient(120deg,#5a8f4e,#79a95c)}
#tools{display:flex;gap:8px}
.tbtn{width:40px;height:40px;display:grid;place-items:center;cursor:pointer;color:var(--txt-dim)}
.tbtn:hover{color:var(--acc)}.tbtn:active{transform:scale(.93)}
.tbtn svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}
#searchwrap{display:flex;align-items:center;gap:9px;padding:0 16px;height:42px;width:200px;border-radius:999px}
#search{background:none;border:0;outline:none;color:var(--txt);font-family:'IBM Plex Mono',monospace;font-size:12.5px;width:100%}
#search::placeholder{color:var(--txt-mute)}
#sgo{width:26px;height:26px;flex:0 0 26px;display:grid;place-items:center;border-radius:8px;cursor:pointer;
  color:var(--txt-mute);background:rgba(128,150,160,.16);transition:.18s}
#sgo:hover{color:var(--acc);background:rgba(95,227,200,.18)}
#serr{max-height:0;overflow:hidden;opacity:0;transition:.25s;font-size:10.5px;color:#e08b6a;padding:0 13px;border-radius:10px;width:200px}
#serr.show{max-height:48px;opacity:1;padding:7px 13px;background:var(--panelA);border:1px solid var(--edge)}

#detail{position:fixed;right:var(--inx);top:70px;width:min(330px,calc(100vw - 28px));max-height:calc(100vh - 96px);z-index:25;
  display:flex;flex-direction:column;overflow:hidden;
  transform:translateX(calc(100% + 22px));opacity:0;pointer-events:none;
  transition:transform .38s cubic-bezier(.19,1,.22,1),opacity .3s}
#detail.show{transform:none;opacity:1;pointer-events:auto}
#dhead{padding:13px 15px 0;display:flex;align-items:flex-start;gap:10px}
#dnum{font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:600;line-height:.92}
#dnum small{font-size:9px;color:var(--txt-mute);display:block;letter-spacing:1.4px;margin-bottom:3px;font-weight:400}
#dctrl{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:5px}
#dshare{cursor:pointer;color:var(--txt-mute);padding:3px;border-radius:8px;transition:.15s}
#dshare:hover{color:var(--acc);background:rgba(95,227,200,.12)}
#dshare svg{width:15px;height:15px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#dclose{cursor:pointer;color:var(--txt-mute);font-size:19px;padding:2px 4px}
#dclose:hover{color:var(--txt)}
#dbadge{align-self:center;padding:4px 10px;border-radius:99px;font-size:10px;letter-spacing:.7px;text-transform:uppercase;font-weight:600;color:#04141a}
#tabs{display:flex;gap:2px;padding:11px 13px 0;border-bottom:1px solid var(--edge);flex-wrap:wrap}
.tab{padding:8px 11px;font-size:11px;cursor:pointer;color:var(--txt-mute);border-bottom:2px solid transparent;margin-bottom:-1px;transition:.18s}
.tab.on{color:var(--acc);border-bottom-color:var(--acc)}
body.lit .tab.on{color:#14351a;border-bottom-color:#3f7a34;font-weight:600}
body.lit .tab{color:#3f4a45}
#tabbody{overflow-y:auto;flex:1}
.pane{display:none}.pane.on{display:block}
.dgrid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--edge)}
.dcell{background:linear-gradient(155deg,var(--panelA),var(--panelB));padding:11px 14px}
.dcell span{display:block;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--txt-mute);margin-bottom:3px}
.dcell b{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:500}
body.lit .dcell span{color:#39443f} body.lit .dcell b{color:#000}
.sec{padding:12px 15px}
.row{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;padding:4px 0;color:var(--txt-dim);border-bottom:1px solid rgba(128,150,160,.12)}
.row:last-child{border:0}
.row b{color:var(--txt);font-weight:500;font-family:'IBM Plex Mono',monospace;text-align:right}
body.lit .row{color:#26302b} body.lit .row b{color:#000}
body.lit #dnum,body.lit #brand h1,body.lit .stat b,body.lit #search{color:#000}

body.lit .lm small{color:#3c4741;opacity:1}
body.lit .lmsec{color:#4a554d}
body.lit .lm.f b{color:#1e2723}
body.lit .lgtitle,body.lit .lgn,body.lit #sblabel,body.lit .stat span,body.lit .lm i{opacity:1}
body.lit .lgtitle,body.lit .stat span{color:#44504a}
body.lit .lgn{color:#4a554d}
.note{padding:0 15px 14px;font-size:10px;color:var(--txt-mute);line-height:1.6}
.note b{color:var(--txt-dim);font-weight:600}
/* price calculator */
#priceview{padding:14px 15px 16px}
.pcalc{display:flex;flex-direction:column;gap:9px}
.pcrow{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:12px;color:var(--txt-dim)}
.pcrow b{font-family:'IBM Plex Mono',monospace;color:var(--txt);font-weight:500}
.pcop{color:var(--txt-mute);font-size:10.5px;text-align:center;font-family:'IBM Plex Mono',monospace;margin:-3px 0}
.pcdiv{height:1px;background:var(--edge);margin:5px 0}
.pctotal{display:flex;flex-direction:column;gap:3px;padding:13px 15px;margin-top:4px;border-radius:12px;
  background:linear-gradient(135deg,rgba(95,227,200,.16),rgba(43,143,156,.10));border:1px solid var(--edge-hi)}
body.lit .pctotal{background:linear-gradient(135deg,rgba(60,150,90,.16),rgba(45,105,70,.09))}
.pctotal small{font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--txt-mute)}
.pctotal .amt{font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:600;color:var(--acc);line-height:1.05}
body.lit .pctotal .amt{color:#1f6b46}
.pctotal .amtsub{font-size:10.5px;color:var(--txt-dim);font-family:'IBM Plex Mono',monospace}
.pcnote{font-size:9.5px;color:var(--txt-mute);line-height:1.55;margin-top:10px}
#shape{padding:8px 12px 2px}
#shape svg{width:100%;height:auto;display:block;overflow:visible}
.sh-poly{fill:rgba(95,227,200,.13);stroke:var(--acc);stroke-width:1.6;stroke-linejoin:round}
body.lit .sh-poly{fill:rgba(60,130,90,.14);stroke:#2c6b58}
.sh-lbl{font-family:'IBM Plex Mono',monospace;font-size:9.5px;font-weight:600;fill:var(--txt);text-anchor:middle;dominant-baseline:middle}
.sh-tick{stroke:var(--txt-mute);stroke-width:.9}
.sh-cap{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:var(--txt-mute);text-anchor:middle}
.sh-face line{stroke:var(--acc);stroke-width:1.6;stroke-linecap:round}
.sh-face polygon{fill:var(--acc)}
body.lit .sh-face line{stroke:#2c6b58} body.lit .sh-face polygon{fill:#2c6b58}
.sh-face-t{font-family:'IBM Plex Mono',monospace;font-weight:600;letter-spacing:.04em;
  fill:var(--txt);text-anchor:middle;dominant-baseline:middle}

#chip{position:fixed;left:50%;bottom:var(--abovenav);transform:translateX(-50%) translateY(16px);z-index:24;
  display:none;align-items:center;gap:9px;padding:9px 12px 9px 14px;font-size:12px;cursor:pointer;
  color:var(--txt);opacity:0;transition:opacity .25s,transform .25s}
#chip.show{display:flex;opacity:1;transform:translateX(-50%) translateY(0)}

#chip:hover{color:var(--acc)} body.lit #chip:hover{color:#2c6b28}
#chipx{font-style:normal;font-size:16px;line-height:1;color:var(--txt-mute);padding:0 2px 2px;margin-left:2px;
  border-left:1px solid var(--edge);padding-left:9px}
#chipx:hover{color:var(--txt)}
#compass{position:fixed;left:var(--inx);bottom:calc(var(--abovenav) + 52px);z-index:22;width:46px;height:46px;padding:3px;
  display:grid;place-items:center;cursor:pointer}
#compass svg{overflow:hidden;border-radius:inherit}
#compass:hover .c-ring{stroke:var(--acc)}
#compass svg{width:100%;height:100%;overflow:visible}
.c-ring{fill:none;stroke:var(--edge-hi);stroke-width:1}
.c-n{fill:var(--acc)} .c-s{fill:var(--txt-mute)}
body.lit .c-n{fill:#2c6b58} body.lit .c-s{fill:#7a857e}
.c-t{font-family:'IBM Plex Mono',monospace;font-size:6.5px;font-weight:700;fill:var(--txt-mute);text-anchor:middle;dominant-baseline:middle;letter-spacing:.2px}
.c-tn{fill:var(--acc)}
body.lit .c-tn{fill:#2c6b58}
#tip{position:fixed;z-index:40;padding:6px 10px;border-radius:9px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .12s;
  background:var(--panelA);border:1px solid var(--edge);font-family:'IBM Plex Mono',monospace;white-space:nowrap;color:var(--txt)}
#tip.show{opacity:1}
#hint{position:fixed;left:50%;bottom:var(--abovenav);transform:translateX(-50%);z-index:15;font-size:10.5px;color:var(--txt-mute);padding:7px 15px;pointer-events:none;transition:opacity .5s}
#toast{position:fixed;left:50%;bottom:calc(var(--abovenav) + 6px);transform:translateX(-50%) translateY(10px);z-index:60;
  max-width:min(420px,calc(100vw - 40px));text-align:center;line-height:1.5;
  padding:10px 16px;font-size:11px;opacity:0;pointer-events:none;transition:.25s;color:var(--txt)}
#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:6px}

@media(max-width:1119px){
  /* modest edge padding on mobile — panels sit near the screen edges */
  :root{--fx:14px; --ft:0px; --fb:0px; --intop:62px; --navh:80px; --r:11px}
  #stats{display:none}
  #left{max-width:150px;gap:8px}#legend{padding:8px 10px}
  .lgrow{font-size:10px;padding:2.5px 0;gap:7px}.sw{width:9px;height:9px;flex:0 0 9px}
  .lgtitle{font-size:8px;margin-bottom:6px}
  #scalebar{padding:7px 10px}#sblabel{font-size:9px;margin-bottom:4px}
  #right{gap:8px}
  .tgrow{font-size:10px;padding:3.5px 0;gap:8px}
  .sw2{width:28px;height:16px;flex:0 0 28px}
  .sw2:after{width:11px;height:11px;top:2.5px;left:2.5px}
  .sw2.on:after{transform:translateX(12px)}
  /* drawer: 40% tall, internal scroll, leaves the selected plot visible above it */
  #detail{top:auto;bottom:var(--abovenav);right:var(--fx);left:var(--fx);width:auto;height:40vh;max-height:40vh;
    transform:translateY(calc(100% + var(--abovenav) + 20px))}
  #detail.show{transform:none}
  #tabbody{overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex:1}
  #dhead{padding:9px 12px 0}#dnum{font-size:23px}#dnum small{font-size:8px}
  #dbadge{font-size:9px;padding:3px 8px}
  #tabs{padding:8px 10px 0}.tab{padding:6px 9px;font-size:10.5px}
  .dcell{padding:8px 11px}.dcell b{font-size:12.5px}.dcell span{font-size:8px}
  .sec{padding:9px 12px}.row{font-size:11px;padding:3px 0}
  .note{padding:0 12px 11px;font-size:9.5px}
  #shape{padding:4px 10px 0}
  #searchwrap{width:150px;height:36px;padding:0 10px}#serr{width:150px;font-size:9.5px}
  #search{font-size:11.5px}#sgo{width:22px;height:22px;flex:0 0 22px}
  #toggles{min-width:0;width:150px;padding:7px 10px}#hint{display:none}
  #tools{position:fixed;right:var(--inx);bottom:var(--abovenav);flex-direction:column;gap:6px;z-index:22}
  body.has-detail #tools{opacity:0;pointer-events:none;transition:opacity .2s}
  .tbtn{width:36px;height:36px}.tbtn svg{width:14px;height:14px}
  /* compass returns on mobile, bottom-left above the nav, hidden when drawer is open */
  #compass{display:grid;left:var(--inx);bottom:calc(var(--navh) + 84px);right:auto;width:38px;height:38px;padding:2px}
  #scalebar{width:118px;bottom:calc(var(--navh) + 52px)}
  body.has-detail #scalebar{opacity:0;pointer-events:none;transition:opacity .2s}
  body.has-detail #compass{opacity:0;pointer-events:none;transition:opacity .2s}
  #chip,#chip.show{display:none}
  #nav{padding:5px;gap:0}
  .nv{min-width:0;padding:6px 9px}.nv span{font-size:8.5px}.nv svg{width:18px;height:18px}
  #contactpop{bottom:calc(var(--abovenav) + 2px)}
  #brand{padding:7px 11px;gap:9px}#brand h1{font-size:12px}
  #mark{width:28px;height:28px;flex:0 0 28px;border-radius:7px}#mark svg{width:18px;height:18px}
  #brand p{font-size:8px;letter-spacing:1.1px}
  #top{padding:9px var(--fx);gap:8px}
  #layerbtn span{display:none}#layerbtn{padding:8px 10px}
  #layerbtn svg{width:16px;height:16px}
  #layermenu{width:200px;overflow-y:auto;-webkit-overflow-scrolling:touch;border-radius:18px}
  .lm{padding:8px 9px}.lm b{font-size:11px}.lm small{font-size:9px}
}
@media (min-width:700px) and (max-width:1119px) and (orientation:landscape){
  #detail{top:calc(var(--ft) + 54px);bottom:auto;left:auto;right:var(--inx);width:300px;
    height:auto;max-height:calc(100vh - var(--ft) - var(--fb) - 70px);
    transform:translateX(calc(100% + 22px))}
  #detail.show{transform:none}
  #compass{display:grid;bottom:var(--abovenav);left:var(--inx);right:auto}
  body.has-detail #compass{opacity:1;pointer-events:auto}
  #tools{position:fixed;right:var(--inx);bottom:var(--abovenav);flex-direction:row}
  body.has-detail #tools{opacity:1;pointer-events:auto}
}

/* ---------- MapIQ badge ---------- */
#miq{position:fixed;right:var(--inx);left:auto;bottom:14px;z-index:8;width:96px;height:44px;cursor:pointer;
  perspective:640px;transition:width .5s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.34,1.45,.5,1)}
#miq.flip{width:224px}
#miqin{position:absolute;inset:0;transform-style:preserve-3d;
  transition:transform .65s cubic-bezier(.32,1.25,.46,1)}
#miq.flip #miqin{transform:rotateY(180deg)}
.miqface{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;white-space:nowrap;overflow:hidden}
.miqlogo{font-family:'Sora',sans-serif;font-weight:700;font-size:15.5px;letter-spacing:-.02em;
  background:linear-gradient(115deg,#5fe3c8 10%,#7fb8ff 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
body.lit .miqlogo{background:linear-gradient(115deg,#0d6b52 10%,#1e5fa8 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.miqb{transform:rotateY(180deg);flex-direction:column;align-items:flex-start;gap:1px;padding:0 15px;justify-content:center}
.miqb small{font-size:9.5px;letter-spacing:.4px;color:var(--txt-dim)}
.miqb small .miqlogo{font-size:10.5px}
#miqlink{font-size:10.5px;font-weight:600;color:var(--acc);letter-spacing:.2px;
  border-bottom:1px dashed rgba(95,227,200,.55);line-height:1.5;cursor:pointer}
#miqlink:hover{filter:brightness(1.2)}
body.lit #miqlink{color:#0d6b52;border-bottom-color:rgba(13,107,82,.5)}
@media(max-width:1119px){
  /* MapIQ sits under the scale bar, bottom-left, and expands to the RIGHT */
  #miq{left:calc(var(--inx) + 2px);right:auto;bottom:calc(var(--navh) + 12px);height:34px;width:80px}
  #miq.flip{width:204px}.miqlogo{font-size:13px}
  #miq .miqb{padding:0 11px}#miq .miqb small{font-size:8.6px}#miqlink{font-size:9.6px}
  body.has-detail #miq{opacity:0;pointer-events:none;transition:opacity .2s}
}
@media (min-width:700px) and (max-width:1119px) and (orientation:landscape){
  #miq{right:calc(var(--inx) + 230px);bottom:var(--abovenav)}}

/* ---------- bottom nav / footer ---------- */
#nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:46;
  display:flex;gap:2px;padding:6px;pointer-events:auto}
.nv{display:flex;flex-direction:column;align-items:center;gap:4px;
  padding:7px 15px;border-radius:12px;cursor:pointer;color:var(--txt-dim);
  transition:.16s;min-width:60px;position:relative}
.nv:hover{color:var(--txt);background:rgba(128,150,160,.12)}
body.lit .nv:hover{background:rgba(45,105,70,.12)}
.nv svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.nv span{font-size:9.5px;letter-spacing:.3px;font-weight:500}
.nv.on{color:var(--acc)}
.nv.on::after{content:'';position:absolute;bottom:1px;width:16px;height:2.5px;border-radius:2px;background:var(--acc)}
body.lit .nv.on{color:#2c6b28}body.lit .nv.on::after{background:#2c6b28}

/* ---------- contact popover ---------- */
#contactpop{position:fixed;left:50%;bottom:calc(var(--abovenav) + 4px);transform:translateX(-50%) translateY(10px) scale(.96);
  z-index:48;width:min(300px,calc(100vw - 28px));padding:8px;opacity:0;pointer-events:none;
  transform-origin:bottom center;transition:.22s cubic-bezier(.19,1,.22,1)}
#contactpop.show{transform:translateX(-50%);opacity:1;pointer-events:auto}
.cpitem{display:flex;align-items:center;gap:12px;padding:12px 13px;border-radius:12px;
  cursor:pointer;color:var(--txt);transition:.15s;text-decoration:none}
.cpitem:hover{background:rgba(128,150,160,.14)}body.lit .cpitem:hover{background:rgba(45,105,70,.12)}
.cpico{width:38px;height:38px;flex:0 0 38px;border-radius:11px;display:grid;place-items:center}
.cpico svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cpico.call{background:linear-gradient(145deg,#3ecfb2,#2b8f9c)}
.cpico.wa{background:linear-gradient(145deg,#39c95f,#128c3e)}
.cptxt b{display:block;font-size:12.5px;font-weight:600}
.cptxt small{display:block;font-size:10.5px;color:var(--txt-mute);margin-top:1px}

/* ---------- info modal (details / amenities / images) ---------- */
#modal{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;
  padding:20px;opacity:0;pointer-events:none;transition:opacity .25s}
#modal.show{opacity:1;pointer-events:auto}
#modal .scrim{position:absolute;inset:0;background:rgba(3,10,15,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
body.lit #modal .scrim{background:rgba(40,50,35,.34)}
#mcard{position:relative;width:min(560px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;
  overflow:hidden;transform:translateY(14px) scale(.98);transition:transform .3s cubic-bezier(.19,1,.22,1)}
#modal.show #mcard{transform:none}
#mhead{display:flex;align-items:center;gap:11px;padding:16px 18px;border-bottom:1px solid var(--edge)}
#mico{width:34px;height:34px;flex:0 0 34px;border-radius:10px;display:grid;place-items:center;
  background:linear-gradient(145deg,#3ecfb2,#2b8f9c);color:#04141a}
#mico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#mttl{font-size:15px;font-weight:600;flex:1}
#mttl small{display:block;font-size:9.5px;letter-spacing:1.2px;color:var(--txt-mute);text-transform:uppercase;margin-top:2px;font-weight:400}
#mclose{cursor:pointer;color:var(--txt-mute);font-size:22px;line-height:1;padding:2px 6px;border-radius:8px}
#mclose:hover{color:var(--txt);background:rgba(128,150,160,.14)}
#mbody{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 0}
.mrow{display:flex;gap:12px;padding:9px 18px;font-size:12px;border-bottom:1px solid rgba(128,150,160,.1)}
.mrow:last-child{border:0}
.mrow .k{flex:0 0 42%;color:var(--txt-mute);font-weight:500}
.mrow .v{flex:1;color:var(--txt);font-family:'IBM Plex Mono',monospace;font-size:11.5px}
.msec{padding:13px 18px 5px;font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:var(--acc);font-weight:600;display:flex;align-items:center;gap:7px}
.mseci{display:inline-grid;place-items:center;width:16px;height:16px}
.mseci svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
body.lit .msec{color:#2c6b28}
.mli{display:flex;gap:10px;padding:7px 18px;font-size:12px;color:var(--txt-dim);line-height:1.5}
.mli svg{width:15px;height:15px;flex:0 0 15px;margin-top:2px;fill:none;stroke:var(--acc);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
body.lit .mli svg{stroke:#2c6b28}
.mli b{color:var(--txt);font-weight:600}
.mempty{padding:44px 20px;text-align:center;color:var(--txt-mute);font-size:12.5px}
.mempty svg{width:40px;height:40px;margin-bottom:12px;fill:none;stroke:currentColor;stroke-width:1.5;opacity:.6}
/* confirm dialog */
#confirm{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;
  padding:20px;opacity:0;pointer-events:none;transition:opacity .22s}
#confirm.show{opacity:1;pointer-events:auto}
#confirm .scrim{position:absolute;inset:0;background:rgba(3,10,15,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
body.lit #confirm .scrim{background:rgba(40,50,35,.34)}
#cfcard{position:relative;width:min(360px,100%);padding:22px 22px 18px;text-align:center;
  transform:translateY(12px) scale(.97);transition:transform .28s cubic-bezier(.19,1,.22,1)}
#confirm.show #cfcard{transform:none}
#cfico{width:46px;height:46px;margin:0 auto 14px;border-radius:14px;display:grid;place-items:center;
  color:#04141a;background:linear-gradient(145deg,#3ecfb2,#2b8f9c)}
#cfico svg{width:23px;height:23px}
#cftitle{font-size:16px;font-weight:600;color:var(--txt);margin-bottom:7px}
#cfmsg{font-size:12.5px;color:var(--txt-dim);line-height:1.55;margin-bottom:18px}
#cfbtns{display:flex;gap:9px}
.cfbtn{flex:1;padding:11px 14px;border-radius:12px;font-family:inherit;font-size:12.5px;font-weight:600;
  cursor:pointer;border:1px solid var(--edge);transition:.16s}
.cfno{background:rgba(128,150,160,.14);color:var(--txt-dim)}
.cfno:hover{background:rgba(128,150,160,.22);color:var(--txt)}
.cfyes{background:linear-gradient(120deg,#3ecfb2,#2b8f9c);color:#04141a;border-color:transparent}
.cfyes:hover{filter:brightness(1.08)}
body.lit .cfyes{background:linear-gradient(120deg,#4fae7a,#2c8f5c);color:#fff}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media(max-width:1119px){
  #modal{align-items:flex-end;padding:12px 10px calc(var(--navh) + 16px)}
  #mcard{max-height:calc(100vh - var(--navh) - 92px);display:flex;flex-direction:column}
  #mbody{overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex:1}
  #sharebtn span{display:none}
  #sharebtn{padding:8px 10px}
  body.has-detail #miq{opacity:0;pointer-events:none}
}
#miq{transition:width .5s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.34,1.45,.5,1),opacity .2s}

/* mobile portrait: profile centered & wide; four equal panels in a 2x2 grid */
@media(max-width:1119px) and (orientation:portrait){
  /* integrated header spans full width; brand grows, search pill at the right end */
  #top{flex-wrap:wrap}
  #brand{width:100%;order:0}
  #brandtxt{flex:1}
  #left{order:1;max-width:none;width:auto;align-self:flex-start}
  #right{order:2;margin-left:auto;align-items:flex-end;gap:10px}
  #legend{min-width:150px;padding:0 12px;height:56px;
    display:flex;flex-direction:column;justify-content:center}
  #legend .lgtitle{margin:0 0 2px;font-size:7.5px}
  #legend .lgrow{padding:0;font-size:10px}
  #legend .sw{width:8px;height:8px;flex:0 0 8px}
  #layerwrap,#sharewrap{align-self:flex-end}
}


/* ===== intro screens ===== */
#intro{position:fixed;inset:0;z-index:200;pointer-events:none}
body:not(.intro-active) #intro{display:none}
.introscreen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:0;opacity:0;pointer-events:none;transform:scale(1.03);
  transition:opacity .55s ease,transform .7s cubic-bezier(.2,.9,.25,1);
  background:radial-gradient(120% 90% at 50% 18%,#0e2436 0,#071019 62%,#040a11 100%)}
.introscreen.show{opacity:1;pointer-events:auto;transform:scale(1)}
.introscreen.leaving{opacity:0;transform:scale(1.05);transition:opacity .45s ease,transform .5s ease}
/* splash */
#splashlogo{width:96px;height:96px;border-radius:24px;display:grid;place-items:center;color:#f0c98a;
  background:linear-gradient(150deg,#16283f,#0c1a2b);border:1px solid rgba(240,201,138,.28);
  box-shadow:0 24px 60px -20px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.14);
  animation:splashPop .7s cubic-bezier(.2,1.1,.35,1) both}
#splashlogo svg{width:60px;height:60px}
@keyframes splashPop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
#splashname{margin-top:24px;font-family:'Sora',sans-serif;font-weight:700;font-size:30px;letter-spacing:.3px;
  color:#f4f8fa;animation:fadeUp .6s .2s both}
#splashsub{margin-top:7px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:3.5px;
  color:#6f8a9a;animation:fadeUp .6s .32s both}
#splashbar{margin-top:34px;width:150px;height:3px;border-radius:99px;background:rgba(255,255,255,.10);overflow:hidden;
  animation:fadeUp .6s .44s both}
#splashbar span{display:block;height:100%;width:40%;border-radius:99px;
  background:linear-gradient(90deg,transparent,#5fe3c8,transparent);animation:barSweep 1.25s ease-in-out infinite}
@keyframes barSweep{0%{transform:translateX(-140%)}100%{transform:translateX(360%)}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
/* language */
#langscreen.show #langlogo{animation:fadeUp .5s .05s both}
#langscreen.show #langtitle{animation:fadeUp .5s .14s both}
#langscreen.show #langsub{animation:fadeUp .5s .2s both}
#langscreen.show .langbtn{animation:fadeUp .5s both}
#langscreen.show .langbtn:nth-child(1){animation-delay:.26s}
#langscreen.show .langbtn:nth-child(2){animation-delay:.32s}
#langscreen.show .langbtn:nth-child(3){animation-delay:.38s}
#langscreen.show .langbtn:nth-child(4){animation-delay:.44s}
#langscreen.show .langbtn:nth-child(5){animation-delay:.5s}
#langlogo{width:60px;height:60px;border-radius:16px;display:grid;place-items:center;color:#f0c98a;
  background:linear-gradient(150deg,#16283f,#0c1a2b);border:1px solid rgba(240,201,138,.24);margin-bottom:20px}
#langlogo svg{width:38px;height:38px}
#langtitle{font-family:'Sora',sans-serif;font-weight:600;font-size:22px;color:#f4f8fa}
#langsub{margin-top:8px;font-size:11px;letter-spacing:.6px;color:#6f8a9a;text-align:center;padding:0 24px}
#langgrid{margin-top:30px;display:grid;grid-template-columns:repeat(3,minmax(0,150px));gap:12px;padding:0 22px;
  max-width:520px}
.langbtn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:16px 12px;cursor:pointer;
  border-radius:15px;border:1px solid rgba(180,222,240,.2);background:linear-gradient(150deg,rgba(18,40,58,.7),rgba(9,20,30,.55));
  -webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);color:#eaf3f7;
  transition:transform .2s cubic-bezier(.34,1.4,.5,1),border-color .2s,background .2s;position:relative;overflow:hidden}
.langbtn:hover{transform:translateY(-3px);border-color:rgba(95,227,200,.6);background:linear-gradient(150deg,rgba(24,52,72,.8),rgba(12,26,38,.6))}
.langbtn:active{transform:scale(.95)}
.langbtn b{font-family:'Sora',sans-serif;font-size:17px;font-weight:600}
.langbtn small{font-size:10px;letter-spacing:.5px;color:#89a2b1}
@media(max-width:520px){
  #langgrid{grid-template-columns:repeat(2,minmax(0,1fr));width:calc(100vw - 44px)}
  .langbtn:nth-child(5){grid-column:1 / -1}
  #splashname{font-size:25px}
}

/* book-visit tile in contact popover */
.cpico.book{background:linear-gradient(145deg,#6a8bff,#4a63d8)}
.cpico.book svg{width:20px;height:20px}
/* ===== booking modal ===== */
#book{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;
  padding:20px;opacity:0;pointer-events:none;transition:opacity .25s}
#book.show{opacity:1;pointer-events:auto}
#book .scrim{position:absolute;inset:0;background:rgba(4,10,16,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#bcard{position:relative;width:min(460px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;
  overflow:hidden;transform:translateY(14px) scale(.98);transition:transform .3s cubic-bezier(.19,1,.22,1)}
#book.show #bcard{transform:none}
#bhead{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--edge)}
#bico{width:40px;height:40px;flex:0 0 40px;border-radius:12px;display:grid;place-items:center;
  color:var(--acc);background:rgba(95,227,200,.14)}
body.lit #bico{color:#0d6b52;background:rgba(45,105,70,.16)}
#bico svg{width:22px;height:22px}
#bttl{flex:1;min-width:0}
#bkick{display:block;font-size:8.5px;letter-spacing:1.6px;color:var(--txt-mute);text-transform:uppercase}
#bttltxt{font-family:'Sora',sans-serif;font-weight:600;font-size:16px;color:var(--txt)}
#bclose{cursor:pointer;color:var(--txt-mute);font-size:22px;line-height:1;padding:2px 6px;border-radius:8px}
#bclose:hover{color:var(--txt);background:rgba(128,150,160,.14)}
#bbody{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 18px 18px}
.bstep{display:none;flex-direction:column;gap:12px}
.bstep.show{display:flex;animation:fadeUp .3s both}
.bsite[hidden]{display:none}
.bsite{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:11px;
  background:rgba(95,227,200,.12);font-size:12.5px;font-weight:600;color:var(--acc)}
body.lit .bsite{background:rgba(45,105,70,.14);color:#0d6b52}
.bsitedot{width:8px;height:8px;border-radius:99px;background:currentColor}
.bfield{display:flex;flex-direction:column;gap:5px}
.bfield span{font-size:11px;font-weight:600;color:var(--txt-dim)}
.bfield span i{color:#e2794e;font-style:normal;margin-left:2px}
.bfield span em{color:var(--txt-mute);font-style:normal;font-weight:400}
.bfield input{background:rgba(255,255,255,.04);border:1px solid var(--edge);border-radius:11px;
  padding:11px 13px;font-size:13.5px;color:var(--txt);font-family:inherit;transition:.15s;outline:none}
body.lit .bfield input{background:rgba(255,255,255,.5);border-color:rgba(40,70,80,.22)}
.bfield input:focus{border-color:var(--acc);background:rgba(95,227,200,.06)}
body.lit .bfield input:focus{border-color:#2c8f5c;background:rgba(255,255,255,.75)}
.bfield input::placeholder{color:var(--txt-mute)}
.berr{font-size:11.5px;color:#e2794e;min-height:0;display:none}
.berr.show{display:block}
.bbtn{padding:12px 16px;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;
  border:1px solid transparent;transition:transform .2s cubic-bezier(.34,1.4,.5,1),filter .15s;position:relative;overflow:hidden}
.bbtn:active{transform:scale(.96)}
.bbtn.primary{background:linear-gradient(120deg,#3ecfb2,#2b8f9c);color:#04141a}
.bbtn.primary:hover{filter:brightness(1.08)}
body.lit .bbtn.primary{background:linear-gradient(120deg,#4fae7a,#2c8f5c);color:#fff}
.bbtn.ghost{background:rgba(128,150,160,.12);color:var(--txt-dim);border-color:var(--edge)}
.bbtn.ghost:hover{color:var(--txt)}
.brow{display:flex;gap:10px}.brow .bbtn{flex:1}
.bsub{font-size:12px;color:var(--txt-dim);font-weight:600}
.bdates{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.bdate{padding:9px 4px;border-radius:11px;border:1px solid var(--edge);cursor:pointer;text-align:center;
  background:rgba(255,255,255,.03);transition:.15s}
.bdate small{display:block;font-size:9px;color:var(--txt-mute);text-transform:uppercase;letter-spacing:.5px}
.bdate b{display:block;font-size:16px;color:var(--txt);font-weight:700;margin-top:1px;font-family:'Sora',sans-serif}
.bdate span{font-size:8.5px;color:var(--txt-mute)}
.bdate.on{border-color:var(--acc);background:rgba(95,227,200,.14)}
.bdate.on b{color:var(--acc)}
body.lit .bdate.on{border-color:#2c8f5c;background:rgba(45,105,70,.14)}
body.lit .bdate.on b{color:#0d6b52}
.btimes{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.btime{padding:10px 4px;border-radius:10px;border:1px solid var(--edge);cursor:pointer;text-align:center;
  font-size:12px;font-weight:600;color:var(--txt-dim);background:rgba(255,255,255,.03);transition:.15s}
.btime.on{border-color:var(--acc);background:rgba(95,227,200,.14);color:var(--acc)}
body.lit .btime.on{border-color:#2c8f5c;background:rgba(45,105,70,.14);color:#0d6b52}
.bsuccess{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:10px 0}
.bcheck{width:64px;height:64px;border-radius:99px;display:grid;place-items:center;color:#fff;
  background:linear-gradient(145deg,#3ecfb2,#2b8f9c);box-shadow:0 12px 30px -8px rgba(62,207,178,.5);
  animation:splashPop .5s cubic-bezier(.2,1.3,.4,1) both}
.bcheck svg{width:32px;height:32px}
.bsucctitle{font-family:'Sora',sans-serif;font-weight:700;font-size:19px;color:var(--txt);margin-top:4px}
.bsuccsub{font-size:13px;color:var(--txt-dim);max-width:300px}
.bsuccwa{font-size:11.5px;color:var(--acc);margin-top:2px}
body.lit .bsuccwa{color:#0d6b52}
.bsuccess .bbtn{margin-top:8px;min-width:140px}
@media(max-width:1119px){
  #book{align-items:flex-end;padding:12px 10px calc(var(--navh) + 16px)}
  #bcard{max-height:calc(100vh - var(--navh) - 80px)}
}

#dfoot{padding:12px 15px;border-top:1px solid var(--edge);flex:0 0 auto}
#dfoot .bbtn{width:100%}
@media(max-width:1119px){#dfoot{padding:10px 12px}}

/* custom date picker */
.bcal{border:1px solid var(--edge);border-radius:14px;padding:10px 11px;background:rgba(255,255,255,.03)}
body.lit .bcal{background:rgba(255,255,255,.4)}
.bcalhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.bcalmon{font-family:'Sora',sans-serif;font-weight:600;font-size:14px;color:var(--txt)}
.bcalnav{width:30px;height:30px;border-radius:9px;border:1px solid var(--edge);background:rgba(255,255,255,.04);
  color:var(--txt-dim);font-size:18px;line-height:1;cursor:pointer;display:grid;place-items:center;transition:.15s}
.bcalnav:hover:not(:disabled){color:var(--acc);border-color:var(--acc)}
.bcalnav:disabled{opacity:.3;cursor:not-allowed}
body.lit .bcalnav{background:rgba(255,255,255,.5)}
.bcaldow{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
.bcaldow span{text-align:center;font-size:9px;font-weight:600;color:var(--txt-mute);text-transform:uppercase;padding:3px 0}
.bcalgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.bcell{aspect-ratio:1;display:grid;place-items:center;border-radius:9px;font-size:13px;font-weight:600;
  color:var(--txt);cursor:pointer;transition:.12s;border:1px solid transparent;font-family:'Sora',sans-serif}
.bcell:hover:not(.disabled):not(.empty){background:rgba(95,227,200,.12)}
.bcell.empty{cursor:default}
.bcell.disabled{color:var(--txt-mute);opacity:.35;cursor:not-allowed}
.bcell.today{border-color:var(--edge-hi)}
.bcell.on{background:var(--acc);color:#04141a;font-weight:700}
body.lit .bcell.on{background:#2c8f5c;color:#fff}

/* + shaped control cluster (mobile only) */
#pcluster{display:none}
@media(max-width:1119px){
  #tools{display:none!important}
  #pcluster{display:grid;position:fixed;right:var(--inx);bottom:calc(var(--abovenav) + 4px);z-index:22;
    grid-template-columns:repeat(3,34px);grid-template-rows:repeat(3,34px);gap:6px;
    grid-template-areas:". up ." "left fit right" ". down .";pointer-events:none}
  .pbtn{width:34px;height:34px;display:grid;place-items:center;cursor:pointer;color:var(--txt-dim);
    border-radius:11px;pointer-events:auto}
  .pbtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  #p-in{grid-area:up}#p-out{grid-area:down}#p-left{grid-area:left}#p-right{grid-area:right}#p-fit{grid-area:fit}
  body.has-detail #pcluster{opacity:0;pointer-events:none;transition:opacity .2s}
}

/* settings gear + language popover */
#gear{width:38px;height:38px;
  display:grid;place-items:center;cursor:pointer;color:var(--txt-dim);transition:.15s}
#gear:hover,#gear.on{color:var(--acc)}
#gear svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#gearpop{position:absolute;top:calc(100% + 8px);right:0;z-index:33;width:190px;padding:8px;
  transform-origin:top right;transform:scale(.96) translateY(-6px);opacity:0;pointer-events:none;transition:.2s}
#gearpop.show{transform:none;opacity:1;pointer-events:auto}
#gptitle{font-size:8.5px;letter-spacing:1.3px;color:var(--txt-mute);text-transform:uppercase;padding:4px 8px 8px}
#gplangs{display:flex;flex-direction:column;gap:3px}
.gplang{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;cursor:pointer;
  background:transparent;border:1px solid transparent;color:var(--txt);text-align:left;transition:.14s}
.gplang:hover{background:rgba(95,227,200,.1);border-color:rgba(95,227,200,.25)}
.gplang.on{background:rgba(95,227,200,.16);border-color:rgba(95,227,200,.4)}
body.lit .gplang:hover{background:rgba(45,105,70,.1)}
body.lit .gplang.on{background:rgba(45,105,70,.16);border-color:rgba(45,105,70,.4)}
.gplang b{font-family:'Sora',sans-serif;font-size:13px;font-weight:600;flex:0 0 auto;min-width:52px}
.gplang small{font-size:9.5px;color:var(--txt-mute)}
@media(max-width:1119px){
  #gear{width:36px;height:36px}
  #gearpop{width:180px}
  body.has-detail #gear,body.has-detail #gearpop{opacity:0;pointer-events:none;transition:opacity .2s}
  body.has-detail #gearpop{pointer-events:none}
}

/* ===== liquid glass micro-interactions ===== */
/* interactive glass controls lift on hover, press with spring */
#layerbtn,#sharebtn,#compass,#gear,.tbtn,.pbtn,.nv,#miq,#b-fit{
  transition:transform .35s cubic-bezier(.34,1.56,.64,1),color .2s,background .2s,box-shadow .35s cubic-bezier(.34,1.56,.64,1)}
#compass:hover,#gear:hover,.pbtn:hover,#miq:hover{transform:translateY(-2px) scale(1.015)}
#compass:active,#gear:active,.pbtn:active,.tbtn:active{transform:scale(.94)}
/* focus/hover accent glow on glass panels that accept input */
#searchwrap:focus-within{box-shadow:
  0 30px 60px -12px rgba(0,0,0,.45),
  0 18px 36px -18px rgba(0,0,0,.30),
  inset 0 1.5px 0.5px 0 var(--spec),
  inset 0 -1px 1px 0 rgba(255,255,255,.12),
  0 0 0 1px rgba(95,227,200,.5),
  0 0 22px -4px rgba(95,227,200,.42)}
body.lit #searchwrap:focus-within{box-shadow:
  0 30px 60px -12px rgba(40,50,60,.28),
  inset 0 1.5px 0.5px 0 rgba(255,255,255,.95),
  0 0 0 1px rgba(44,143,92,.45),
  0 0 20px -4px rgba(44,143,92,.35)}
/* accent glow on primary actions + active toggles */
.bbtn.primary{box-shadow:0 8px 22px -8px rgba(62,207,178,.55),inset 0 1px 0 rgba(255,255,255,.35)}
.bbtn.primary:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 14px 30px -8px rgba(62,207,178,.7),inset 0 1px 0 rgba(255,255,255,.4)}
.sw2.on{box-shadow:0 0 14px -2px rgba(95,227,200,.5),inset 0 1px 2px rgba(0,0,0,.2)}
/* nav items get a soft glass pill on the active/pressed one */
.nv:active{transform:scale(.94)}
/* the flip badge and layer/share/compass keep specular edges */
#miq,.tbtn,.pbtn{position:relative}

/* display toggles inside the layers menu (tap rows, not switches) */
.lm.t i{width:16px;height:16px;border-radius:5px;margin-top:1px;border:1.5px solid var(--txt-mute);
  position:relative;background:transparent;transition:.15s}
.lm.t.on i{border-color:var(--acc);background:var(--acc)}
body.lit .lm.t.on i{border-color:#2c8f5c;background:#2c8f5c}
.lm.t.on i:after{content:'';position:absolute;left:4.5px;top:1.5px;width:4px;height:8px;
  border:solid #04141a;border-width:0 2px 2px 0;transform:rotate(45deg)}
body.lit .lm.t.on i:after{border-color:#fff}

/* integrated header search trigger — darker, clickable pill */
#searchtrigger{flex:0 0 auto;width:40px;height:40px;border-radius:999px;display:grid;place-items:center;cursor:pointer;
  color:var(--txt);background:linear-gradient(150deg,rgba(4,12,20,.55),rgba(2,8,14,.42));
  border:1px solid var(--edgetint);
  box-shadow:inset 0 1.5px 0.5px 0 rgba(255,255,255,.22),inset 0 -1px 1px 0 rgba(255,255,255,.06),0 2px 8px -3px rgba(0,0,0,.5);
  transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .2s,box-shadow .25s}
body.lit #searchtrigger{background:linear-gradient(150deg,rgba(30,50,66,.16),rgba(20,36,50,.10));
  color:#0a2028;box-shadow:inset 0 1.5px 0.5px 0 rgba(255,255,255,.6),0 2px 8px -3px rgba(40,50,60,.2)}
#searchtrigger:hover{transform:scale(1.06);color:var(--acc)}
body.lit #searchtrigger:hover{color:#0d6b52}
#searchtrigger:active{transform:scale(.92)}
#searchtrigger svg{width:18px;height:18px}
@media(max-width:1119px){#searchtrigger{width:36px;height:36px}#searchtrigger svg{width:16px;height:16px}}

/* ===== search overlay (liquid glass) ===== */
#searchov{position:fixed;inset:0;z-index:120;display:flex;align-items:flex-start;justify-content:center;
  padding:76px 18px 18px;opacity:0;pointer-events:none;transition:opacity .25s}
#searchov.show{opacity:1;pointer-events:auto}
#searchov .scrim{position:absolute;inset:0;background:rgba(4,10,16,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#sovcard{position:relative;width:min(560px,100%);max-height:calc(100vh - 110px);display:flex;flex-direction:column;
  overflow:hidden;transform:translateY(-14px) scale(.98);transition:transform .3s cubic-bezier(.19,1,.22,1)}
#searchov.show #sovcard{transform:none}
#sovtop{display:flex;align-items:center;gap:11px;padding:15px 16px;border-bottom:1px solid var(--edge)}
#sovicon{width:20px;height:20px;flex:0 0 20px;color:var(--txt-mute)}
#sovinput{flex:1;background:transparent;border:none;outline:none;font-family:inherit;font-size:15px;color:var(--txt)}
#sovinput::placeholder{color:var(--txt-mute)}
#sovclose{cursor:pointer;color:var(--txt-mute);font-size:22px;line-height:1;padding:2px 6px;border-radius:8px}
#sovclose:hover{color:var(--txt);background:rgba(128,150,160,.14)}
#sovresults{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px}
.sovcat{font-size:8.5px;letter-spacing:1.4px;text-transform:uppercase;color:var(--txt-mute);padding:8px 10px 4px;font-weight:700}
.sovitem{display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:11px;cursor:pointer;transition:.13s;border:1px solid transparent}
.sovitem:hover,.sovitem.sel{background:rgba(95,227,200,.12);border-color:rgba(95,227,200,.28)}
body.lit .sovitem:hover,body.lit .sovitem.sel{background:rgba(45,105,70,.1);border-color:rgba(45,105,70,.25)}
.sovico{width:32px;height:32px;flex:0 0 32px;border-radius:9px;display:grid;place-items:center;color:#fff}
.sovico svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sovico.site{background:linear-gradient(145deg,#4a9fd8,#2f6ea8)}
.sovico.amen{background:linear-gradient(145deg,#6a8bff,#4a63d8)}
.sovico.meas{background:linear-gradient(145deg,#3ecfb2,#2b8f9c)}
.sovtxt{flex:1;min-width:0}
.sovtxt b{display:block;font-size:13.5px;color:var(--txt);font-weight:600}
.sovtxt small{display:block;font-size:11px;color:var(--txt-mute);margin-top:1px}
.sovempty{padding:26px 16px;text-align:center;color:var(--txt-mute);font-size:13px}
`;

const MAP_HTML = String.raw`
<!-- ===== intro: splash + language ===== -->
<div id="intro">
  <!-- splash -->
  <div id="splash" class="introscreen show">
    <div id="splashlogo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
        <rect x="4.2" y="7.4" width="6.1" height="11.2"/>
        <rect x="5.5" y="8.8" width="1.5" height="1.5"/><rect x="7.5" y="8.8" width="1.5" height="1.5"/>
        <rect x="5.5" y="11" width="1.5" height="1.5"/><rect x="7.5" y="11" width="1.5" height="1.5"/>
        <rect x="5.5" y="13.2" width="1.5" height="1.5"/><rect x="7.5" y="13.2" width="1.5" height="1.5"/>
        <rect x="5.5" y="15.4" width="1.5" height="1.5"/><rect x="7.5" y="15.4" width="1.5" height="1.5"/>
        <rect x="13.7" y="3.9" width="6.1" height="14.7"/>
        <rect x="15" y="5.3" width="1.5" height="1.5"/><rect x="17" y="5.3" width="1.5" height="1.5"/>
        <rect x="15" y="7.5" width="1.5" height="1.5"/><rect x="17" y="7.5" width="1.5" height="1.5"/>
        <rect x="15" y="9.7" width="1.5" height="1.5"/><rect x="17" y="9.7" width="1.5" height="1.5"/>
        <rect x="15" y="11.9" width="1.5" height="1.5"/><rect x="17" y="11.9" width="1.5" height="1.5"/>
        <rect x="15" y="14.1" width="1.5" height="1.5"/><rect x="17" y="14.1" width="1.5" height="1.5"/>
        <rect x="15" y="16.3" width="1.5" height="1.5"/><rect x="17" y="16.3" width="1.5" height="1.5"/>
        <path d="M2.6 20.9h18.8" stroke-width="1.6" stroke-linecap="round"/>
      </svg></div>
    <div id="splashname">Basavanaganguru</div>
    <div id="splashsub">SUDA · SY. NO. 157/1 · 6 · 9 · 10</div>
    <div id="splashbar"><span></span></div>
  </div>
  <!-- language -->
  <div id="langscreen" class="introscreen">
    <div id="langlogo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
        <rect x="4.2" y="7.4" width="6.1" height="11.2"/>
        <rect x="5.5" y="8.8" width="1.5" height="1.5"/><rect x="7.5" y="8.8" width="1.5" height="1.5"/>
        <rect x="5.5" y="11" width="1.5" height="1.5"/><rect x="7.5" y="11" width="1.5" height="1.5"/>
        <rect x="5.5" y="13.2" width="1.5" height="1.5"/><rect x="7.5" y="13.2" width="1.5" height="1.5"/>
        <rect x="5.5" y="15.4" width="1.5" height="1.5"/><rect x="7.5" y="15.4" width="1.5" height="1.5"/>
        <rect x="13.7" y="3.9" width="6.1" height="14.7"/>
        <rect x="15" y="5.3" width="1.5" height="1.5"/><rect x="17" y="5.3" width="1.5" height="1.5"/>
        <rect x="15" y="7.5" width="1.5" height="1.5"/><rect x="17" y="7.5" width="1.5" height="1.5"/>
        <rect x="15" y="9.7" width="1.5" height="1.5"/><rect x="17" y="9.7" width="1.5" height="1.5"/>
        <rect x="15" y="11.9" width="1.5" height="1.5"/><rect x="17" y="11.9" width="1.5" height="1.5"/>
        <rect x="15" y="14.1" width="1.5" height="1.5"/><rect x="17" y="14.1" width="1.5" height="1.5"/>
        <rect x="15" y="16.3" width="1.5" height="1.5"/><rect x="17" y="16.3" width="1.5" height="1.5"/>
        <path d="M2.6 20.9h18.8" stroke-width="1.6" stroke-linecap="round"/>
      </svg></div>
    <div id="langtitle" data-i18n="choose_lang">Choose your language</div>
    <div id="langsub" class="mono" data-i18n="select_lang">SELECT LANGUAGE</div>
    <div id="langgrid">
      <button class="langbtn" data-lang="en"><b>English</b><small>English</small></button>
      <button class="langbtn" data-lang="kn"><b>ಕನ್ನಡ</b><small>Kannada</small></button>
      <button class="langbtn" data-lang="te"><b>తెలుగు</b><small>Telugu</small></button>
      <button class="langbtn" data-lang="ta"><b>தமிழ்</b><small>Tamil</small></button>
      <button class="langbtn" data-lang="hi"><b>हिन्दी</b><small>Hindi</small></button>
    </div>
  </div>
</div>

<div id="stage"><svg id="svg">
  <defs>
    <pattern id="pat-ca" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="1.6" height="1.6" fill="rgba(206,104,68,.24)"/>
      <line x1="0" y1="0" x2="0" y2="1.6" stroke="rgba(255,164,124,.34)" stroke-width=".28"/>
    </pattern>
    <pattern id="pat-park" width="1.9" height="1.9" patternUnits="userSpaceOnUse">
      <rect width="1.9" height="1.9" fill="rgba(96,170,100,.19)"/>
      <circle cx=".6" cy=".6" r=".17" fill="rgba(168,224,150,.40)"/>
      <circle cx="1.45" cy="1.35" r=".17" fill="rgba(168,224,150,.30)"/>
    </pattern>
    <pattern id="pat-grass" width="1.4" height="1.4" patternUnits="userSpaceOnUse">
      <rect width="1.4" height="1.4" fill="#9dbe7e"/>
      <circle cx=".4" cy=".5" r=".2" fill="#8cb06e"/>
      <circle cx="1.05" cy="1.1" r=".2" fill="#a9c98a"/>
    </pattern>
    <pattern id="pat-rock" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
      <rect width="2.4" height="2.4" fill="#b9b49c"/>
      <circle cx=".8" cy=".7" r=".45" fill="#a7a08a"/>
      <circle cx="1.9" cy="1.8" r=".38" fill="#c7c2ab"/>
    </pattern>
    <mask id="lanemask" maskUnits="userSpaceOnUse">
      <rect x="-500" y="-500" width="3000" height="3000" fill="#fff"/>
      <g id="lm-cut" fill="#000"></g>
      <g id="lm-junc" fill="#000"></g>
    </mask>
    <mask id="edgemask" maskUnits="userSpaceOnUse">
      <rect x="-500" y="-500" width="3000" height="3000" fill="#fff"/>
      <g id="em-cut" fill="#000"></g>
    </mask>
    <pattern id="pat-brick" width="2.4" height="1.2" patternUnits="userSpaceOnUse">
      <rect width="2.4" height="1.2" fill="#9c4a34"/>
      <rect x="0.06" y="0.06" width="1.08" height="0.48" fill="#b3583e"/>
      <rect x="1.26" y="0.06" width="1.08" height="0.48" fill="#a8523a"/>
      <rect x="0.66" y="0.66" width="1.08" height="0.48" fill="#b3583e"/>
      <rect x="-0.54" y="0.66" width="1.08" height="0.48" fill="#a8523a"/>
      <rect x="1.86" y="0.66" width="1.08" height="0.48" fill="#a8523a"/>
    </pattern>
  </defs>
</svg></div>

<div id="top">
  <div id="brand" class="glass">
    <div id="mark" aria-label="Basavanaganguru">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
        <rect x="4.2" y="7.4" width="6.1" height="11.2"/>
        <rect x="5.5" y="8.8" width="1.5" height="1.5"/><rect x="7.5" y="8.8" width="1.5" height="1.5"/>
        <rect x="5.5" y="11" width="1.5" height="1.5"/><rect x="7.5" y="11" width="1.5" height="1.5"/>
        <rect x="5.5" y="13.2" width="1.5" height="1.5"/><rect x="7.5" y="13.2" width="1.5" height="1.5"/>
        <rect x="5.5" y="15.4" width="1.5" height="1.5"/><rect x="7.5" y="15.4" width="1.5" height="1.5"/>
        <rect x="13.7" y="3.9" width="6.1" height="14.7"/>
        <rect x="15" y="5.3" width="1.5" height="1.5"/><rect x="17" y="5.3" width="1.5" height="1.5"/>
        <rect x="15" y="7.5" width="1.5" height="1.5"/><rect x="17" y="7.5" width="1.5" height="1.5"/>
        <rect x="15" y="9.7" width="1.5" height="1.5"/><rect x="17" y="9.7" width="1.5" height="1.5"/>
        <rect x="15" y="11.9" width="1.5" height="1.5"/><rect x="17" y="11.9" width="1.5" height="1.5"/>
        <rect x="15" y="14.1" width="1.5" height="1.5"/><rect x="17" y="14.1" width="1.5" height="1.5"/>
        <rect x="15" y="16.3" width="1.5" height="1.5"/><rect x="17" y="16.3" width="1.5" height="1.5"/>
        <path d="M2.6 20.9h18.8" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </div>
    <div id="brandtxt" style="min-width:0"><h1>Basavanaganguru</h1>
    <p class="mono" data-i18n="interactive_map">INTERACTIVE MAP</p></div>
    <div id="searchtrigger" role="button" tabindex="0" aria-label="Search" title="Search sites, amenities, measurements">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    </div>
  </div>
  <div id="stats" class="glass">
    <div class="stat"><b id="s-tot">—</b><span>Sites</span></div>
    <div class="stat"><b id="s-avl">—</b><span>Available</span></div>
    <div class="stat"><b id="s-area">—</b><span>Plot area m²</span></div>
  </div>
</div>

<!-- ===== smart search overlay ===== -->
<div id="searchov">
  <div class="scrim" id="sov-scrim"></div>
  <div id="sovcard" class="glass" role="dialog" aria-modal="true" aria-label="Search">
    <div id="sovtop">
      <svg id="sovicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="sovinput" type="text" placeholder="Search sites, amenities, measurements…" data-i18n-ph="search_ph2" autocomplete="off"/>
      <div id="sovclose" role="button" tabindex="0" title="Close">×</div>
    </div>
    <div id="sovresults"></div>
  </div>
</div>

<div id="left">
  <div id="legend" class="glass"><div class="lgtitle" id="lgtitle" data-i18n="layout">Status</div><div id="lgrows"></div></div>
</div>

<div id="right">
  <div id="layerwrap">
    <div id="layerbtn" class="glass" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
      <svg viewBox="0 0 24 24"><path d="M12 3 2.5 8 12 13l9.5-5L12 3Z"/><path d="M2.5 12 12 17l9.5-5"/><path d="M2.5 16 12 21l9.5-5"/></svg><span id="layername">Realistic</span><i id="ldot"></i>
    </div>
    <div id="layermenu" class="glass">
      <div class="lmsec" data-i18n="display">Display</div>
      <div class="lm t on" id="tg-lbl" role="button" tabindex="0"><i></i><div><b data-i18n="site_numbers">Site numbers</b></div></div>
      <div class="lm t on" id="tg-lit" role="button" tabindex="0"><i></i><div><b data-i18n="daylight_theme">Daylight theme</b></div></div>
      <div class="lm t" id="tg-sur" role="button" tabindex="0"><i></i><div><b data-i18n="survey_parcels">Survey parcels</b></div></div>
      <div class="lmsec" data-i18n="view_mode">View</div>
      <div class="lm" data-l="schematic"><i></i><div><b data-i18n="schematic">Schematic</b><small data-i18n="schematic_sub">Sanctioned plan, dark drafting view</small></div></div>
      <div class="lm on" data-l="realistic"><i></i><div><b data-i18n="realistic">Realistic</b><small data-i18n="realistic_sub">Daylight ground view with materials</small></div></div>
      <div class="lm" data-l="geomap"><i></i><div><b data-i18n="geomap">GeoMap</b><small data-i18n="geomap_sub">Aligned to Google Maps · needs coordinates</small></div></div>
      <div class="lmsec" data-i18n="colour_sites">Colour sites</div>
      <div class="lm c" data-c="avail"><i></i><div><b data-i18n="by_availability">By availability</b><small data-i18n="by_availability_sub">Status colours from the sales board</small></div></div>
      <div class="lm c" data-c="size"><i></i><div><b data-i18n="by_size">By size</b><small data-i18n="by_size_sub">Banded by site area</small></div></div>
      <div class="lm c on" data-c="plain"><i></i><div><b data-i18n="plain">Plain</b><small data-i18n="plain_sub">One colour, drawing style</small></div></div>
      <div class="lmsec" data-i18n="filter_sites">Filter sites</div>
      <div class="lm f on" data-f="all"><i style="--fc:#8ea9b8"></i><div><b data-i18n="all_sites">All sites</b></div></div>
      <div class="lm f" data-f="available"><i style="--fc:#3ecfb2"></i><div><b data-i18n="available">Available</b></div></div>
      <div class="lm f" data-f="hold"><i style="--fc:#f0b458"></i><div><b data-i18n="on_hold">On hold</b></div></div>
      <div class="lm f" data-f="reserved"><i style="--fc:#e2794e"></i><div><b data-i18n="reserved">Reserved</b></div></div>
      <div class="lm f" data-f="sold"><i style="--fc:#b6403f"></i><div><b data-i18n="sold">Sold</b></div></div>
    </div>
  </div>
  <div id="langwrap">
    <div id="gear" class="glass" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" title="Language">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3c2.6 2.4 4.1 5.6 4.1 9s-1.5 6.6-4.1 9c-2.6-2.4-4.1-5.6-4.1-9S9.4 5.4 12 3Z"/></svg>
    </div>
    <div id="gearpop" class="glass" role="menu">
      <div id="gptitle" data-i18n="select_lang">SELECT LANGUAGE</div>
      <div id="gplangs">
        <button class="gplang" data-lang="en"><b>English</b><small>English</small></button>
        <button class="gplang" data-lang="kn"><b>ಕನ್ನಡ</b><small>Kannada</small></button>
        <button class="gplang" data-lang="te"><b>తెలుగు</b><small>Telugu</small></button>
        <button class="gplang" data-lang="ta"><b>தமிழ்</b><small>Tamil</small></button>
        <button class="gplang" data-lang="hi"><b>हिन्दी</b><small>Hindi</small></button>
      </div>
    </div>
  </div>
  <div id="sharewrap">
    <div id="sharebtn" class="glass" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" title="Share this map">
      <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3"/></svg><span data-i18n="share">Share</span>
    </div>
  </div>

  <div id="tools">
    <div class="tbtn glass" id="b-in" role="button" tabindex="0" title="Zoom in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5"/></svg></div>
    <div class="tbtn glass" id="b-out" role="button" tabindex="0" title="Zoom out"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-3.5-3.5"/></svg></div>
    <div class="tbtn glass" id="b-rl" role="button" tabindex="0" title="Rotate left"><svg viewBox="0 0 24 24"><path d="M3.5 8.5v-5m0 5h5m-5 0a8.5 8.5 0 1 1-1.6 6.2"/></svg></div>
    <div class="tbtn glass" id="b-rr" role="button" tabindex="0" title="Rotate right"><svg viewBox="0 0 24 24"><path d="M20.5 8.5v-5m0 5h-5m5 0a8.5 8.5 0 1 0 1.6 6.2"/></svg></div>
    <div class="tbtn glass" id="b-fit" role="button" tabindex="0" title="Fit to layout"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></div>
  </div>
</div>

<div id="pcluster">
  <div class="pbtn glass" id="p-in" role="button" tabindex="0" title="Zoom in"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></div>
  <div class="pbtn glass" id="p-left" role="button" tabindex="0" title="Pan left"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></div>
  <div class="pbtn glass" id="p-fit" role="button" tabindex="0" title="Fit to layout"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></div>
  <div class="pbtn glass" id="p-right" role="button" tabindex="0" title="Pan right"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
  <div class="pbtn glass" id="p-out" role="button" tabindex="0" title="Zoom out"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></div>
</div>

<div id="detail" class="glass">
  <div id="dhead">
    <div id="dnum"><small data-i18n="site">SITE</small><span id="dnumv">—</span></div>
    <div id="dbadge">—</div>
    <div id="dctrl">
      <div id="dclose" role="button" tabindex="0" title="Close">×</div>
      <div id="dshare" role="button" tabindex="0" title="Share this site" aria-haspopup="true">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3"/></svg>
      </div>
    </div>
  </div>
  <div id="tabs">
    <div class="tab on" data-p="dims" data-i18n="tab_dims">Dimensions</div>
    <div class="tab" data-p="plot" data-i18n="tab_site">Site</div>
    <div class="tab" data-p="layout" data-i18n="tab_layout">Layout</div>
    <!-- price tab hidden: no sanctioned pricing data for this project -->
  </div>
  <div id="tabbody">
    <div class="pane on" id="pane-dims">
      <div id="shape"></div>
      <div class="sec" id="d-edges"></div>
      <div class="note" data-i18n="dims_note">Figures are the sanctioned side lengths from the plot dimension schedule, in metres. The plan notes that actual dimensions are confirmed at the time of site release.</div>
    </div>
    <div class="pane" id="pane-plot">
      <div class="dgrid">
        <div class="dcell"><span>Area</span><b id="d-m">—</b></div>
        <div class="dcell"><span>Area</span><b id="d-ft">—</b></div>
        <div class="dcell"><span>Area</span><b id="d-yd">—</b></div>
        <div class="dcell"><span>Nominal size</span><b id="d-sh">—</b></div>
      </div>
      <div class="sec" id="d-attrs"></div>
      <div class="note" id="dnote"></div>
    </div>
    <div class="pane" id="pane-layout">
      <div class="sec" id="d-site"></div>
      <div class="note" id="d-notes"></div>
    </div>
    <div class="pane" id="pane-price">
      <div id="priceview"></div>
    </div>
  </div>
  <div id="dfoot">
    <button id="d-book" class="bbtn primary" data-i18n="book_for_plot">Book a site visit for this plot</button>
  </div>
</div>

<div id="chip" class="glass mono"><span id="chiptxt">Site —</span>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v.01M11 12h1v4h1"/><circle cx="12" cy="12" r="9"/></svg>
  <i id="chipx">×</i></div>
<div id="scalebar"><div id="sblabel" class="mono">20 m</div><div id="sbline" style="width:96px"></div></div>
<div id="compass" class="glass" role="button" tabindex="0" aria-label="North indicator. Activate to reset rotation" title="Tap to face north">
  <svg viewBox="0 0 44 44" aria-label="North arrow">
    <g id="rose">
      <circle cx="22" cy="22" r="15" class="c-ring"/>
      <path d="M22 10 L25.4 21 L22 18.8 L18.6 21 Z" class="c-n"/>
      <path d="M22 34 L18.6 23 L22 25.2 L25.4 23 Z" class="c-s"/>
      <text x="22" y="9.6" class="c-t c-tn">N</text>
      <text x="22" y="38.6" class="c-t">S</text>
      <text x="35.4" y="24.4" class="c-t">E</text>
      <text x="8.6" y="24.4" class="c-t">W</text>
    </g>
  </svg>
</div>


<div id="miq" class="glass" role="button" tabindex="0" aria-label="MapIQ — interactive maps. Activate to flip" aria-pressed="false">
  <div id="miqin">
    <div class="miqface"><span class="miqlogo">MapIQ.</span></div>
    <div class="miqface miqb">
      <small><span data-i18n="maps_by">Interactive maps by</span> <span class="miqlogo">MapIQ.</span></small>
      <span id="miqlink" role="link" tabindex="0" data-i18n="get_yours">Get yours now →</span>
    </div>
  </div>
</div>
<div id="tip" class="mono"></div>
<div id="hint" class="glass mono" data-i18n="drag_hint">Drag to pan · Scroll to zoom · Tap a site</div>
<div id="toast" class="glass mono"></div>

<nav id="nav" class="glass">
  <div class="nv" data-nav="location" role="button" tabindex="0">
    <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
    <span data-i18n="nav_location">Location</span></div>
  <div class="nv" data-nav="contact" role="button" tabindex="0">
    <svg viewBox="0 0 24 24"><path d="M4.5 5.5c0 8 6 14 14 14 .8 0 1.5-.7 1.5-1.5v-2.6c0-.7-.5-1.3-1.2-1.5l-2.7-.6c-.6-.1-1.2.1-1.5.6l-.7 1c-2.2-1-3.9-2.7-4.9-4.9l1-.7c.5-.3.7-.9.6-1.5l-.6-2.7C9.3 4.2 8.7 3.7 8 3.7H5.5c-.8 0-1.5.7-1.5 1.5Z"/></svg>
    <span data-i18n="nav_contact">Contact</span></div>
  <div class="nv" data-nav="details" role="button" tabindex="0">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.01"/></svg>
    <span data-i18n="nav_details">Details</span></div>
  <div class="nv" data-nav="images" role="button" tabindex="0">
    <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2.2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4.5"/></svg>
    <span data-i18n="nav_images">Images</span></div>
  <div class="nv" data-nav="amenities" role="button" tabindex="0">
    <svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 20.6l1-5.8-4.3-4.1 5.9-.9Z"/></svg>
    <span data-i18n="nav_amenities">Amenities</span></div>
</nav>

    <div id="sharepop" class="glass" role="menu">
      <div id="sptitle" data-i18n="share_map">Share this map</div>
      <a class="cpitem" id="sp-wa" role="menuitem" tabindex="0">
        <div class="cpico wa"><svg viewBox="0 0 24 24" fill="#fff" stroke="none" style="width:18px;height:18px"><path fill-rule="evenodd" d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C1.166 6.443 5.6 2.009 11.053 2.009c2.64 0 5.121 1.03 6.988 2.898a9.825 9.825 0 0 1 2.892 6.994c-.003 5.45-4.437 9.884-9.882 9.884Zm8.412-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" transform="translate(6.55 6.28) scale(.46)"/></svg></div>
        <div class="cptxt"><b data-i18n="whatsapp">WhatsApp</b><small id="spsub" data-i18n="send_to_chat">Send to any chat</small></div>
      </a>
    </div>

<div id="contactpop" class="glass">
  <a class="cpitem" id="cp-call" href="tel:+919980061727">
    <div class="cpico call"><svg viewBox="0 0 24 24"><path d="M4.5 5.5c0 8 6 14 14 14 .8 0 1.5-.7 1.5-1.5v-2.6c0-.7-.5-1.3-1.2-1.5l-2.7-.6c-.6-.1-1.2.1-1.5.6l-.7 1c-2.2-1-3.9-2.7-4.9-4.9l1-.7c.5-.3.7-.9.6-1.5l-.6-2.7C9.3 4.2 8.7 3.7 8 3.7H5.5c-.8 0-1.5.7-1.5 1.5Z"/></svg></div>
    <div class="cptxt"><b data-i18n="call">Call</b><small>+91 99800 61727</small></div>
  </a>
  <a class="cpitem" id="cp-wa" href="https://wa.me/919980061727" target="_blank" rel="noopener">
    <div class="cpico wa"><svg viewBox="0 0 24 24" fill="#fff" stroke="none"><path fill-rule="evenodd" d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C1.166 6.443 5.6 2.009 11.053 2.009c2.64 0 5.121 1.03 6.988 2.898a9.825 9.825 0 0 1 2.892 6.994c-.003 5.45-4.437 9.884-9.882 9.884Zm8.412-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" transform="translate(6.55 6.28) scale(.46)"/></svg></div>
    <div class="cptxt"><b data-i18n="whatsapp">WhatsApp</b><small>Chat on +91 99800 61727</small></div>
  </a>
  <div class="cpitem" id="cp-book" role="button" tabindex="0">
    <div class="cpico book"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M8.5 14l2 2 4-4"/></svg></div>
    <div class="cptxt"><b data-i18n="book_visit">Book site visit</b><small id="cp-book-sub" data-i18n="request_appt">Request an appointment</small></div>
  </div>
</div>

<!-- ===== booking modal ===== -->
<div id="book">
  <div class="scrim" id="bscrim"></div>
  <div id="bcard" class="glass" role="dialog" aria-modal="true" aria-label="Book a site visit">
    <div id="bhead">
      <div id="bico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg></div>
      <div id="bttl"><small id="bkick" data-i18n="site_visit">SITE VISIT</small><span id="bttltxt" data-i18n="book_appt">Book an appointment</span></div>
      <div id="bclose" role="button" tabindex="0" title="Close">×</div>
    </div>
    <div id="bbody">
      <!-- step 1: details -->
      <div class="bstep show" data-step="1">
        <div id="bsitechip" class="bsite" hidden><span class="bsitedot"></span><span id="bsitetext">Site —</span></div>
        <label class="bfield"><span><span data-i18n="name">Name</span><i>*</i></span><input id="bf-name" type="text" placeholder="Your full name" data-i18n-ph="name_ph" autocomplete="name"></label>
        <label class="bfield"><span><span data-i18n="phone">Phone</span><i>*</i></span><input id="bf-phone" type="tel" placeholder="10-digit mobile number" data-i18n-ph="phone_ph" autocomplete="tel" inputmode="numeric"></label>
        <label class="bfield"><span><span data-i18n="email">Email</span> <em data-i18n="optional">(optional)</em></span><input id="bf-email" type="email" placeholder="you@example.com" autocomplete="email"></label>
        <div class="berr" id="bf-err"></div>
        <button class="bbtn primary" id="bf-next" data-i18n="choose_dt">Choose date &amp; time →</button>
      </div>
      <!-- step 2: date & time -->
      <div class="bstep" data-step="2">
        <div class="bsub" data-i18n="pick_slot">Pick a preferred slot</div>
        <div class="bcal">
          <div class="bcalhead">
            <button class="bcalnav" id="bcal-prev" aria-label="Previous month">‹</button>
            <div class="bcalmon" id="bcal-mon">—</div>
            <button class="bcalnav" id="bcal-next" aria-label="Next month">›</button>
          </div>
          <div class="bcaldow" id="bcal-dow"></div>
          <div class="bcalgrid" id="bcal-grid"></div>
        </div>
        <div class="btimes" id="bf-times"></div>
        <div class="berr" id="bf-err2"></div>
        <div class="brow">
          <button class="bbtn ghost" id="bf-back" data-i18n="back">← Back</button>
          <button class="bbtn primary" id="bf-confirm" data-i18n="confirm_req">Confirm request</button>
        </div>
      </div>
      <!-- step 3: success -->
      <div class="bstep" data-step="3">
        <div class="bsuccess">
          <div class="bcheck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg></div>
          <div class="bsucctitle" data-i18n="visit_requested">Site visit requested</div>
          <div class="bsuccsub" id="bsucc-detail">We’ll confirm your appointment shortly.</div>
          <div class="bsuccwa" id="bsucc-wa" data-i18n="opening_wa">Opening WhatsApp to send your request…</div>
          <button class="bbtn primary" id="bf-done" data-i18n="done">Done</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="modal">
  <div class="scrim" id="mscrim"></div>
  <div id="mcard" class="glass" role="dialog" aria-modal="true">
    <div id="mhead">
      <div id="mico"><svg id="micosvg" viewBox="0 0 24 24"></svg></div>
      <div id="mttl"><small id="mkick">—</small><span id="mttltxt">—</span></div>
      <div id="mclose" role="button" tabindex="0" title="Close">×</div>
    </div>
    <div id="mbody"></div>
  </div>
</div>

<div id="confirm">
  <div class="scrim" id="cfscrim"></div>
  <div id="cfcard" class="glass" role="dialog" aria-modal="true" aria-labelledby="cftitle">
    <div id="cfico">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
    </div>
    <div id="cftitle">Open in Google Maps?</div>
    <div id="cfmsg">This will take you to the project location on Google Maps in a new tab.</div>
    <div id="cfbtns">
      <button class="cfbtn cfno" id="cfno" type="button">Cancel</button>
      <button class="cfbtn cfyes" id="cfyes" type="button">Yes, continue</button>
    </div>
  </div>
</div>

`;

const MAP_SCRIPT = String.raw`
/* ===== i18n ===== */
const I18N={"en": {"choose_lang": "Choose your language", "select_lang": "SELECT LANGUAGE", "interactive_masterplan": "INTERACTIVE MASTERPLAN", "interactive_map": "INTERACTIVE MAP", "layout": "LAYOUT", "sites": "Sites", "status": "Status", "available": "Available", "on_hold": "On hold", "reserved": "Reserved", "sold": "Sold", "site_numbers": "Site numbers", "daylight_theme": "Daylight theme", "search_ph": "Site no. 1–103", "realistic": "Realistic", "schematic": "Schematic", "geomap": "GeoMap", "schematic_sub": "Sanctioned plan, dark drafting view", "realistic_sub": "Daylight ground view with materials", "geomap_sub": "Aligned to Google Maps · needs coordinates", "colour_sites": "Colour sites", "by_availability": "By availability", "by_availability_sub": "Status colours from the sales board", "by_size": "By size", "by_size_sub": "Banded by site area", "plain": "Plain", "plain_sub": "One colour, drawing style", "filter_sites": "Filter sites", "all_sites": "All sites", "share": "Share", "site": "SITE", "dimensions": "Dimensions", "tab_site": "Site", "tab_layout": "Layout", "tab_price": "Price", "dims_note": "Figures are the sanctioned side lengths from the plot dimension schedule, in metres. The plan notes that actual dimensions are confirmed at the time of site release.", "area": "Area", "nominal_size": "Nominal size", "book_for_plot": "Book a site visit for this plot", "nav_location": "Location", "nav_contact": "Contact", "nav_details": "Details", "nav_images": "Images", "nav_amenities": "Amenities", "share_map": "Share this map", "send_to_chat": "Send to any chat", "call": "Call", "whatsapp": "WhatsApp", "book_visit": "Book site visit", "request_appt": "Request an appointment", "site_visit": "SITE VISIT", "book_appt": "Book an appointment", "name": "Name", "phone": "Phone", "email": "Email", "optional": "(optional)", "name_ph": "Your full name", "phone_ph": "10-digit mobile number", "email_ph": "you@example.com", "choose_dt": "Choose date & time →", "pick_slot": "Pick a preferred slot", "back": "← Back", "confirm_req": "Confirm request", "visit_requested": "Site visit requested", "confirm_shortly": "We’ll confirm your appointment shortly.", "opening_wa": "Opening WhatsApp to send your request…", "done": "Done", "preselected": "preselected", "drag_hint": "Drag to pan · Scroll to zoom · Tap a site", "get_yours": "Get yours now →", "maps_by": "Interactive maps by", "book_visit_for": "Book a visit for", "tab_dims": "Dimensions", "d_land_type_l": "Land Type", "d_land_type_v": "Residential Layout", "d_survey_l": "Survey No.", "d_location_l": "Location", "d_location_v": "Basavanaganguru Village, Shivamogga District, Karnataka", "d_authority_l": "Planning Authority", "d_authority_v": "Shivamogga Urban Development Authority (SUDA)", "d_status_l": "Layout Status", "d_status_v": "Draft / Sanctioned Layout", "d_aln_l": "Approval Ref / ALN No.", "d_alndate_l": "ALN Date", "d_extent_l": "Land Extent", "d_kharab_l": "Kharab", "d_kharab_v": "00-04 (as per RTC, retained in road area)", "d_totalsites_l": "Total Sites", "d_totalsites_v": "103 Sites", "d_resarea_l": "Residential Area", "d_park_l": "Park / Open Space", "d_ca_l": "C.A.", "d_stp_l": "S.T.P.", "d_roadarea_l": "Road Area", "d_totalarea_l": "Total Layout Area", "d_roads_l": "Roads", "d_roads_v": "Layout & internal roads as per sanctioned plan", "d_pathway_l": "Pathway", "d_pathway_v": "As per sanctioned layout", "d_dims_l": "Site Dimensions", "d_dims_v": "9×15 m: 23 · 9×12 m: 28 · Odd sites: 52", "d_scale_l": "Scale", "details_kick": "Verification", "details_title": "Layout Details", "amen_kick": "What's around", "amen_title": "Amenities & Location", "images_kick": "Gallery", "images_title": "Project Images", "images_soon": "Images coming soon.", "a_key": "Key highlights", "a_conn": "Connectivity", "a_edu": "Education nearby", "a_health": "Healthcare nearby", "a_rec": "Recreation", "a_key_1": "Well connected roads with 40ft and 30ft roads", "a_key_2": "Dedicated park and civic amenities", "a_key_3": "Underground drainage system", "a_key_4": "24×7 electricity", "a_conn_1": "200 m from existing 80ft road", "a_conn_2": "300 m from upcoming 200ft ring road", "a_conn_3": "12 min to railway station", "a_conn_4": "13 min to DC office", "a_edu_1": "800 m from Keladi Shivappa Nayaka University of Agricultural & Horticultural Sciences", "a_edu_2": "1.3 km from JNNCE Engineering College", "a_edu_3": "1.3 km from Akshara PU College", "a_edu_4": "1 km from Bapuji Ayurvedic Medical College", "a_health_1": "10 min to Usha Multi Speciality Nursing Home", "a_health_2": "10 min to Chandragiri Multispeciality Hospital", "a_rec_1": "5 min to KSCA Cricket Stadium", "display": "Display", "view_mode": "View", "search_ph2": "Search sites, amenities, measurements…", "survey_parcels": "Survey parcels", "d_village_l": "Village", "d_district_l": "District", "d_state_l": "State", "d_units_l": "Units", "d_owner_l": "Ownership"}, "kn": {"choose_lang": "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", "select_lang": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", "interactive_masterplan": "ಇಂಟರ‍್ಯಾಕ್ಟಿವ್ ಮಾಸ್ಟರ್‌ಪ್ಲಾನ್", "interactive_map": "ಇಂಟರ‍್ಯಾಕ್ಟಿವ್ ಮ್ಯಾಪ್", "layout": "ಲೇಔಟ್", "sites": "ನಿವೇಶನಗಳು", "status": "ಸ್ಥಿತಿ", "available": "ಲಭ್ಯ", "on_hold": "ಹೋಲ್ಡ್‌ನಲ್ಲಿ", "reserved": "ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ", "sold": "ಮಾರಾಟವಾಗಿದೆ", "site_numbers": "ನಿವೇಶನ ಸಂಖ್ಯೆಗಳು", "daylight_theme": "ಹಗಲು ಥೀಮ್", "search_ph": "ನಿವೇಶನ ಸಂ. 1–103", "realistic": "ರಿಯಲಿಸ್ಟಿಕ್", "schematic": "ಸ್ಕೀಮ್ಯಾಟಿಕ್", "geomap": "ಜಿಯೋಮ್ಯಾಪ್", "schematic_sub": "ಮಂಜೂರಾದ ಪ್ಲಾನ್, ಡಾರ್ಕ್ ಡ್ರಾಫ್ಟಿಂಗ್ ವೀಕ್ಷಣೆ", "realistic_sub": "ಹಗಲು ನೆಲದ ವೀಕ್ಷಣೆ, ಮೆಟೀರಿಯಲ್‌ಗಳೊಂದಿಗೆ", "geomap_sub": "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ · ನಿರ್ದೇಶಾಂಕಗಳು ಬೇಕು", "colour_sites": "ನಿವೇಶನ ಬಣ್ಣ", "by_availability": "ಲಭ್ಯತೆ ಪ್ರಕಾರ", "by_availability_sub": "ಸೇಲ್ಸ್ ಬೋರ್ಡ್‌ನ ಸ್ಥಿತಿ ಬಣ್ಣಗಳು", "by_size": "ಗಾತ್ರದ ಪ್ರಕಾರ", "by_size_sub": "ನಿವೇಶನ ವಿಸ್ತೀರ್ಣದ ಪ್ರಕಾರ", "plain": "ಸರಳ", "plain_sub": "ಒಂದೇ ಬಣ್ಣ, ಡ್ರಾಯಿಂಗ್ ಶೈಲಿ", "filter_sites": "ನಿವೇಶನ ಫಿಲ್ಟರ್", "all_sites": "ಎಲ್ಲಾ ನಿವೇಶನಗಳು", "share": "ಶೇರ್", "site": "ನಿವೇಶನ", "dimensions": "ಅಳತೆಗಳು", "tab_site": "ನಿವೇಶನ", "tab_layout": "ಲೇಔಟ್", "tab_price": "ಬೆಲೆ", "dims_note": "ಈ ಅಂಕಿಗಳು ಪ್ಲಾಟ್ ಡೈಮೆನ್ಶನ್ ಶೆಡ್ಯೂಲ್‌ನಿಂದ ಮಂಜೂರಾದ ಬದಿ ಉದ್ದಗಳು, ಮೀಟರ್‌ಗಳಲ್ಲಿ. ನಿಜವಾದ ಅಳತೆಗಳನ್ನು ನಿವೇಶನ ಬಿಡುಗಡೆಯ ಸಮಯದಲ್ಲಿ ದೃಢೀಕರಿಸಲಾಗುತ್ತದೆ ಎಂದು ಪ್ಲಾನ್ ಸೂಚಿಸುತ್ತದೆ.", "area": "ವಿಸ್ತೀರ್ಣ", "nominal_size": "ನಾಮಮಾತ್ರ ಗಾತ್ರ", "book_for_plot": "ಈ ನಿವೇಶನಕ್ಕೆ ಸೈಟ್ ವಿಸಿಟ್ ಬುಕ್ ಮಾಡಿ", "nav_location": "ಸ್ಥಳ", "nav_contact": "ಸಂಪರ್ಕ", "nav_details": "ವಿವರಗಳು", "nav_images": "ಚಿತ್ರಗಳು", "nav_amenities": "ಸೌಲಭ್ಯಗಳು", "share_map": "ಈ ಮ್ಯಾಪ್ ಶೇರ್ ಮಾಡಿ", "send_to_chat": "ಯಾವುದೇ ಚಾಟ್‌ಗೆ ಕಳುಹಿಸಿ", "call": "ಕರೆ", "whatsapp": "ವಾಟ್ಸ್‌ಆ್ಯಪ್", "book_visit": "ಸೈಟ್ ವಿಸಿಟ್ ಬುಕ್ ಮಾಡಿ", "request_appt": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿನಂತಿಸಿ", "site_visit": "ಸೈಟ್ ವಿಸಿಟ್", "book_appt": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ", "name": "ಹೆಸರು", "phone": "ಫೋನ್", "email": "ಇಮೇಲ್", "optional": "(ಐಚ್ಛಿಕ)", "name_ph": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು", "phone_ph": "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", "email_ph": "you@example.com", "choose_dt": "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆಮಾಡಿ →", "pick_slot": "ಇಷ್ಟದ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ", "back": "← ಹಿಂದೆ", "confirm_req": "ವಿನಂತಿ ದೃಢೀಕರಿಸಿ", "visit_requested": "ಸೈಟ್ ವಿಸಿಟ್ ವಿನಂತಿಸಲಾಗಿದೆ", "confirm_shortly": "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಶೀಘ್ರದಲ್ಲೇ ದೃಢೀಕರಿಸುತ್ತೇವೆ.", "opening_wa": "ನಿಮ್ಮ ವಿನಂತಿ ಕಳುಹಿಸಲು ವಾಟ್ಸ್‌ಆ್ಯಪ್ ತೆರೆಯುತ್ತಿದೆ…", "done": "ಆಯಿತು", "preselected": "ಮೊದಲೇ ಆಯ್ಕೆಯಾಗಿದೆ", "drag_hint": "ಡ್ರ್ಯಾಗ್ ಮಾಡಿ · ಸ್ಕ್ರೋಲ್ ಮಾಡಿ ಜೂಮ್ · ನಿವೇಶನ ಟ್ಯಾಪ್ ಮಾಡಿ", "get_yours": "ಈಗಲೇ ಪಡೆಯಿರಿ →", "maps_by": "ಇಂಟರ‍್ಯಾಕ್ಟಿವ್ ಮ್ಯಾಪ್ಸ್", "book_visit_for": "ಇದಕ್ಕೆ ವಿಸಿಟ್ ಬುಕ್ ಮಾಡಿ", "tab_dims": "ಅಳತೆಗಳು", "d_land_type_l": "ಭೂಮಿ ವಿಧ", "d_land_type_v": "ವಸತಿ ಲೇಔಟ್", "d_survey_l": "ಸರ್ವೇ ಸಂ.", "d_location_l": "ಸ್ಥಳ", "d_location_v": "ಬಸವನಗಂಗೂರು ಗ್ರಾಮ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ", "d_authority_l": "ಯೋಜನಾ ಪ್ರಾಧಿಕಾರ", "d_authority_v": "ಶಿವಮೊಗ್ಗ ನಗರಾಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ (SUDA)", "d_status_l": "ಲೇಔಟ್ ಸ್ಥಿತಿ", "d_status_v": "ಡ್ರಾಫ್ಟ್ / ಮಂಜೂರಾದ ಲೇಔಟ್", "d_aln_l": "ಅನುಮೋದನೆ ಉಲ್ಲೇಖ / ALN ಸಂ.", "d_alndate_l": "ALN ದಿನಾಂಕ", "d_extent_l": "ಭೂಮಿ ವಿಸ್ತೀರ್ಣ", "d_kharab_l": "ಖರಾಬ್", "d_kharab_v": "00-04 (RTC ಪ್ರಕಾರ, ರಸ್ತೆ ಪ್ರದೇಶದಲ್ಲಿ)", "d_totalsites_l": "ಒಟ್ಟು ನಿವೇಶನಗಳು", "d_totalsites_v": "103 ನಿವೇಶನಗಳು", "d_resarea_l": "ವಸತಿ ಪ್ರದೇಶ", "d_park_l": "ಪಾರ್ಕ್ / ತೆರೆದ ಸ್ಥಳ", "d_ca_l": "C.A.", "d_stp_l": "S.T.P.", "d_roadarea_l": "ರಸ್ತೆ ಪ್ರದೇಶ", "d_totalarea_l": "ಒಟ್ಟು ಲೇಔಟ್ ಪ್ರದೇಶ", "d_roads_l": "ರಸ್ತೆಗಳು", "d_roads_v": "ಮಂಜೂರಾದ ಪ್ಲಾನ್ ಪ್ರಕಾರ ಲೇಔಟ್ ಮತ್ತು ಆಂತರಿಕ ರಸ್ತೆಗಳು", "d_pathway_l": "ಪಾದಚಾರಿ ಮಾರ್ಗ", "d_pathway_v": "ಮಂಜೂರಾದ ಲೇಔಟ್ ಪ್ರಕಾರ", "d_dims_l": "ನಿವೇಶನ ಅಳತೆಗಳು", "d_dims_v": "9×15 ಮೀ: 23 · 9×12 ಮೀ: 28 · ಇತರ: 52", "d_scale_l": "ಸ್ಕೇಲ್", "details_kick": "ಪರಿಶೀಲನೆ", "details_title": "ಲೇಔಟ್ ವಿವರಗಳು", "amen_kick": "ಸುತ್ತಮುತ್ತ", "amen_title": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಸ್ಥಳ", "images_kick": "ಗ್ಯಾಲರಿ", "images_title": "ಯೋಜನೆ ಚಿತ್ರಗಳು", "images_soon": "ಚಿತ್ರಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ.", "a_key": "ಪ್ರಮುಖ ಅಂಶಗಳು", "a_conn": "ಸಂಪರ್ಕ", "a_edu": "ಹತ್ತಿರದ ಶಿಕ್ಷಣ", "a_health": "ಹತ್ತಿರದ ಆರೋಗ್ಯ ಸೇವೆ", "a_rec": "ಮನರಂಜನೆ", "a_key_1": "40ft ಮತ್ತು 30ft ರಸ್ತೆಗಳೊಂದಿಗೆ ಉತ್ತಮ ಸಂಪರ್ಕದ ರಸ್ತೆಗಳು", "a_key_2": "ಮೀಸಲಾದ ಪಾರ್ಕ್ ಮತ್ತು ನಾಗರಿಕ ಸೌಲಭ್ಯಗಳು", "a_key_3": "ಭೂಗತ ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆ", "a_key_4": "24×7 ವಿದ್ಯುತ್", "a_conn_1": "ಈಗಿನ 80ft ರಸ್ತೆಯಿಂದ 200 ಮೀ", "a_conn_2": "ಮುಂಬರುವ 200ft ರಿಂಗ್ ರಸ್ತೆಯಿಂದ 300 ಮೀ", "a_conn_3": "ರೈಲ್ವೆ ನಿಲ್ದಾಣಕ್ಕೆ 12 ನಿಮಿಷ", "a_conn_4": "DC ಕಚೇರಿಗೆ 13 ನಿಮಿಷ", "a_edu_1": "Keladi Shivappa Nayaka University of Agricultural & Horticultural Sciences ನಿಂದ 800 ಮೀ", "a_edu_2": "JNNCE Engineering College ನಿಂದ 1.3 ಕಿಮೀ", "a_edu_3": "Akshara PU College ನಿಂದ 1.3 ಕಿಮೀ", "a_edu_4": "Bapuji Ayurvedic Medical College ನಿಂದ 1 ಕಿಮೀ", "a_health_1": "Usha Multi Speciality Nursing Home ಗೆ 10 ನಿಮಿಷ", "a_health_2": "Chandragiri Multispeciality Hospital ಗೆ 10 ನಿಮಿಷ", "a_rec_1": "KSCA Cricket Stadium ಗೆ 5 ನಿಮಿಷ", "display": "ಪ್ರದರ್ಶನ", "view_mode": "ವೀಕ್ಷಣೆ", "search_ph2": "ನಿವೇಶನ, ಸೌಲಭ್ಯ, ಅಳತೆ ಹುಡುಕಿ…", "survey_parcels": "ಸರ್ವೇ ಪಾರ್ಸೆಲ್‌ಗಳು", "d_village_l": "ಗ್ರಾಮ", "d_district_l": "ಜಿಲ್ಲೆ", "d_state_l": "ರಾಜ್ಯ", "d_units_l": "ಘಟಕಗಳು", "d_owner_l": "ಮಾಲೀಕತ್ವ"}, "te": {"choose_lang": "మీ భాషను ఎంచుకోండి", "select_lang": "భాష ఎంచుకోండి", "interactive_masterplan": "ఇంటరాక్టివ్ మాస్టర్‌ప్లాన్", "interactive_map": "ఇంటరాక్టివ్ మ్యాప్", "layout": "లేఔట్", "sites": "స్థలాలు", "status": "స్థితి", "available": "అందుబాటులో", "on_hold": "హోల్డ్‌లో", "reserved": "రిజర్వ్ చేయబడింది", "sold": "అమ్ముడైంది", "site_numbers": "స్థల సంఖ్యలు", "daylight_theme": "పగటి థీమ్", "search_ph": "స్థలం నం. 1–103", "realistic": "రియలిస్టిక్", "schematic": "స్కీమాటిక్", "geomap": "జియోమ్యాప్", "schematic_sub": "ఆమోదిత ప్లాన్, డార్క్ డ్రాఫ్టింగ్ వీక్షణ", "realistic_sub": "పగటి నేల వీక్షణ, మెటీరియల్స్‌తో", "geomap_sub": "గూగుల్ మ్యాప్స్‌కు సర్దుబాటు · కోఆర్డినేట్స్ అవసరం", "colour_sites": "స్థల రంగులు", "by_availability": "అందుబాటు ప్రకారం", "by_availability_sub": "సేల్స్ బోర్డ్ స్థితి రంగులు", "by_size": "పరిమాణం ప్రకారం", "by_size_sub": "స్థల విస్తీర్ణం ప్రకారం", "plain": "సాదా", "plain_sub": "ఒకే రంగు, డ్రాయింగ్ శైలి", "filter_sites": "స్థలాలు ఫిల్టర్", "all_sites": "అన్ని స్థలాలు", "share": "షేర్", "site": "స్థలం", "dimensions": "కొలతలు", "tab_site": "స్థలం", "tab_layout": "లేఔట్", "tab_price": "ధర", "dims_note": "ఈ అంకెలు ప్లాట్ డైమెన్షన్ షెడ్యూల్ నుండి ఆమోదిత వైపు పొడవులు, మీటర్లలో. అసలు కొలతలు స్థల విడుదల సమయంలో ధృవీకరించబడతాయని ప్లాన్ సూచిస్తుంది.", "area": "విస్తీర్ణం", "nominal_size": "నామమాత్ర పరిమాణం", "book_for_plot": "ఈ స్థలానికి సైట్ విసిట్ బుక్ చేయండి", "nav_location": "స్థానం", "nav_contact": "సంప్రదించండి", "nav_details": "వివరాలు", "nav_images": "చిత్రాలు", "nav_amenities": "సౌకర్యాలు", "share_map": "ఈ మ్యాప్ షేర్ చేయండి", "send_to_chat": "ఏదైనా చాట్‌కు పంపండి", "call": "కాల్", "whatsapp": "వాట్సాప్", "book_visit": "సైట్ విసిట్ బుక్ చేయండి", "request_appt": "అపాయింట్‌మెంట్ అభ్యర్థించండి", "site_visit": "సైట్ విసిట్", "book_appt": "అపాయింట్‌మెంట్ బుక్ చేయండి", "name": "పేరు", "phone": "ఫోన్", "email": "ఇమెయిల్", "optional": "(ఐచ్ఛికం)", "name_ph": "మీ పూర్తి పేరు", "phone_ph": "10-అంకెల మొబైల్ నంబర్", "email_ph": "you@example.com", "choose_dt": "తేదీ & సమయం ఎంచుకోండి →", "pick_slot": "ఇష్టమైన సమయం ఎంచుకోండి", "back": "← వెనుకకు", "confirm_req": "అభ్యర్థన ధృవీకరించండి", "visit_requested": "సైట్ విసిట్ అభ్యర్థించబడింది", "confirm_shortly": "మీ అపాయింట్‌మెంట్ త్వరలో ధృవీకరిస్తాము.", "opening_wa": "మీ అభ్యర్థన పంపడానికి వాట్సాప్ తెరుస్తోంది…", "done": "అయింది", "preselected": "ముందే ఎంపిక", "drag_hint": "డ్ర్యాగ్ చేయండి · స్క్రోల్ జూమ్ · స్థలం ట్యాప్ చేయండి", "get_yours": "ఇప్పుడే పొందండి →", "maps_by": "ఇంటరాక్టివ్ మ్యాప్స్", "book_visit_for": "దీనికి విసిట్ బుక్ చేయండి", "tab_dims": "కొలతలు", "d_land_type_l": "భూమి రకం", "d_land_type_v": "నివాస లేఔట్", "d_survey_l": "సర్వే నం.", "d_location_l": "స్థానం", "d_location_v": "బసవనగంగూరు గ్రామం, శివమొగ్గ జిల్లా, కర్ణాటక", "d_authority_l": "ప్రణాళికా ప్రాధికారం", "d_authority_v": "శివమొగ్గ పట్టణాభివృద్ధి ప్రాధికారం (SUDA)", "d_status_l": "లేఔట్ స్థితి", "d_status_v": "డ్రాఫ్ట్ / ఆమోదిత లేఔట్", "d_aln_l": "ఆమోదం రిఫరెన్స్ / ALN నం.", "d_alndate_l": "ALN తేదీ", "d_extent_l": "భూమి విస్తీర్ణం", "d_kharab_l": "ఖరాబ్", "d_kharab_v": "00-04 (RTC ప్రకారం, రహదారి ప్రాంతంలో)", "d_totalsites_l": "మొత్తం స్థలాలు", "d_totalsites_v": "103 స్థలాలు", "d_resarea_l": "నివాస ప్రాంతం", "d_park_l": "పార్క్ / ఖాళీ స్థలం", "d_ca_l": "C.A.", "d_stp_l": "S.T.P.", "d_roadarea_l": "రహదారి ప్రాంతం", "d_totalarea_l": "మొత్తం లేఔట్ ప్రాంతం", "d_roads_l": "రహదారులు", "d_roads_v": "ఆమోదిత ప్లాన్ ప్రకారం లేఔట్ మరియు అంతర్గత రహదారులు", "d_pathway_l": "నడక దారి", "d_pathway_v": "ఆమోదిత లేఔట్ ప్రకారం", "d_dims_l": "స్థల కొలతలు", "d_dims_v": "9×15 మీ: 23 · 9×12 మీ: 28 · ఇతర: 52", "d_scale_l": "స్కేల్", "details_kick": "ధృవీకరణ", "details_title": "లేఔట్ వివరాలు", "amen_kick": "చుట్టుపక్కల", "amen_title": "సౌకర్యాలు మరియు స్థానం", "images_kick": "గ్యాలరీ", "images_title": "ప్రాజెక్ట్ చిత్రాలు", "images_soon": "చిత్రాలు త్వరలో వస్తాయి.", "a_key": "ముఖ్య అంశాలు", "a_conn": "కనెక్టివిటీ", "a_edu": "సమీప విద్య", "a_health": "సమీప ఆరోగ్య సేవ", "a_rec": "వినోదం", "a_key_1": "40ft మరియు 30ft రహదారులతో బాగా అనుసంధానించబడిన రహదారులు", "a_key_2": "ప్రత్యేక పార్క్ మరియు పౌర సౌకర్యాలు", "a_key_3": "భూగర్భ డ్రైనేజీ వ్యవస్థ", "a_key_4": "24×7 విద్యుత్", "a_conn_1": "ప్రస్తుత 80ft రహదారి నుండి 200 మీ", "a_conn_2": "రాబోయే 200ft రింగ్ రహదారి నుండి 300 మీ", "a_conn_3": "రైల్వే స్టేషన్‌కు 12 నిమిషాలు", "a_conn_4": "DC ఆఫీసుకు 13 నిమిషాలు", "a_edu_1": "Keladi Shivappa Nayaka University of Agricultural & Horticultural Sciences నుండి 800 మీ", "a_edu_2": "JNNCE Engineering College నుండి 1.3 కిమీ", "a_edu_3": "Akshara PU College నుండి 1.3 కిమీ", "a_edu_4": "Bapuji Ayurvedic Medical College నుండి 1 కిమీ", "a_health_1": "Usha Multi Speciality Nursing Home కు 10 నిమిషాలు", "a_health_2": "Chandragiri Multispeciality Hospital కు 10 నిమిషాలు", "a_rec_1": "KSCA Cricket Stadium కు 5 నిమిషాలు", "display": "డిస్‌ప్లే", "view_mode": "వీక్షణ", "search_ph2": "స్థలం, సౌకర్యం, కొలత వెతకండి…", "survey_parcels": "సర్వే పార్శిల్‌లు", "d_village_l": "గ్రామం", "d_district_l": "జిల్లా", "d_state_l": "రాష్ట్రం", "d_units_l": "యూనిట్లు", "d_owner_l": "యాజమాన్యం"}, "ta": {"choose_lang": "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்", "select_lang": "மொழி தேர்ந்தெடுக்கவும்", "interactive_masterplan": "இண்டராக்டிவ் மாஸ்டர்பிளான்", "interactive_map": "இண்டராக்டிவ் மேப்", "layout": "லேஅவுட்", "sites": "மனைகள்", "status": "நிலை", "available": "கிடைக்கிறது", "on_hold": "ஹோல்டில்", "reserved": "முன்பதிவு", "sold": "விற்பனையானது", "site_numbers": "மனை எண்கள்", "daylight_theme": "பகல் தீம்", "search_ph": "மனை எண். 1–103", "realistic": "ரியலிஸ்டிக்", "schematic": "ஸ்கீமாட்டிக்", "geomap": "ஜியோமேப்", "schematic_sub": "அங்கீகரிக்கப்பட்ட பிளான், டார்க் டிராஃப்டிங் காட்சி", "realistic_sub": "பகல் தரை காட்சி, மெட்டீரியல்களுடன்", "geomap_sub": "கூகுள் மேப்ஸுடன் சீரமைப்பு · கோஆர்டினேட்ஸ் தேவை", "colour_sites": "மனை நிறங்கள்", "by_availability": "கிடைப்பு அடிப்படையில்", "by_availability_sub": "சேல்ஸ் போர்டு நிலை நிறங்கள்", "by_size": "அளவு அடிப்படையில்", "by_size_sub": "மனை பரப்பளவு அடிப்படையில்", "plain": "எளிய", "plain_sub": "ஒரே நிறம், டிராயிங் பாணி", "filter_sites": "மனைகள் வடிகட்டு", "all_sites": "அனைத்து மனைகள்", "share": "ஷேர்", "site": "மனை", "dimensions": "அளவுகள்", "tab_site": "மனை", "tab_layout": "லேஅவுட்", "tab_price": "விலை", "dims_note": "இந்த எண்கள் பிளாட் டைமென்ஷன் ஷெட்யூலில் இருந்து அங்கீகரிக்கப்பட்ட பக்க நீளங்கள், மீட்டரில். உண்மையான அளவுகள் மனை வெளியீட்டின் போது உறுதிப்படுத்தப்படும் என பிளான் குறிப்பிடுகிறது.", "area": "பரப்பளவு", "nominal_size": "பெயரளவு அளவு", "book_for_plot": "இந்த மனைக்கு சைட் விசிட் புக் செய்யவும்", "nav_location": "இடம்", "nav_contact": "தொடர்பு", "nav_details": "விவரங்கள்", "nav_images": "படங்கள்", "nav_amenities": "வசதிகள்", "share_map": "இந்த மேப்பை ஷேர் செய்யவும்", "send_to_chat": "எந்த சாட்டுக்கும் அனுப்பவும்", "call": "அழைப்பு", "whatsapp": "வாட்ஸ்அப்", "book_visit": "சைட் விசிட் புக் செய்யவும்", "request_appt": "அப்பாயின்ட்மென்ட் கோரவும்", "site_visit": "சைட் விசிட்", "book_appt": "அப்பாயின்ட்மென்ட் புக் செய்யவும்", "name": "பெயர்", "phone": "போன்", "email": "இமெயில்", "optional": "(விருப்பம்)", "name_ph": "உங்கள் முழு பெயர்", "phone_ph": "10-இலக்க மொபைல் எண்", "email_ph": "you@example.com", "choose_dt": "தேதி & நேரம் தேர்ந்தெடுக்கவும் →", "pick_slot": "விருப்பமான நேரம் தேர்ந்தெடுக்கவும்", "back": "← பின்", "confirm_req": "கோரிக்கையை உறுதிப்படுத்தவும்", "visit_requested": "சைட் விசிட் கோரப்பட்டது", "confirm_shortly": "உங்கள் அப்பாயின்ட்மென்ட்டை விரைவில் உறுதிப்படுத்துவோம்.", "opening_wa": "உங்கள் கோரிக்கையை அனுப்ப வாட்ஸ்அப் திறக்கிறது…", "done": "முடிந்தது", "preselected": "முன்பே தேர்வு", "drag_hint": "டிராக் செய்யவும் · ஸ்க்ரோல் ஜூம் · மனையை டேப் செய்யவும்", "get_yours": "இப்போதே பெறுங்கள் →", "maps_by": "இண்டராக்டிவ் மேப்ஸ்", "book_visit_for": "இதற்கு விசிட் புக் செய்யவும்", "tab_dims": "அளவுகள்", "d_land_type_l": "நில வகை", "d_land_type_v": "குடியிருப்பு லேஅவுட்", "d_survey_l": "சர்வே எண்.", "d_location_l": "இடம்", "d_location_v": "பசவனகங்கூரு கிராமம், சிவமொக்க மாவட்டம், கர்நாடகா", "d_authority_l": "திட்டமிடல் ஆணையம்", "d_authority_v": "சிவமொக்க நகர்ப்புற வளர்ச்சி ஆணையம் (SUDA)", "d_status_l": "லேஅவுட் நிலை", "d_status_v": "வரைவு / அங்கீகரிக்கப்பட்ட லேஅவுட்", "d_aln_l": "ஒப்புதல் குறிப்பு / ALN எண்.", "d_alndate_l": "ALN தேதி", "d_extent_l": "நில பரப்பு", "d_kharab_l": "கராப்", "d_kharab_v": "00-04 (RTC படி, சாலைப் பகுதியில்)", "d_totalsites_l": "மொத்த மனைகள்", "d_totalsites_v": "103 மனைகள்", "d_resarea_l": "குடியிருப்பு பகுதி", "d_park_l": "பூங்கா / திறந்தவெளி", "d_ca_l": "C.A.", "d_stp_l": "S.T.P.", "d_roadarea_l": "சாலை பகுதி", "d_totalarea_l": "மொத்த லேஅவுட் பகுதி", "d_roads_l": "சாலைகள்", "d_roads_v": "அங்கீகரிக்கப்பட்ட பிளான் படி லேஅவுட் மற்றும் உள் சாலைகள்", "d_pathway_l": "நடைபாதை", "d_pathway_v": "அங்கீகரிக்கப்பட்ட லேஅவுட் படி", "d_dims_l": "மனை அளவுகள்", "d_dims_v": "9×15 மீ: 23 · 9×12 மீ: 28 · மற்றவை: 52", "d_scale_l": "அளவுகோல்", "details_kick": "சரிபார்ப்பு", "details_title": "லேஅவுட் விவரங்கள்", "amen_kick": "சுற்றியுள்ளவை", "amen_title": "வசதிகள் மற்றும் இடம்", "images_kick": "கேலரி", "images_title": "திட்ட படங்கள்", "images_soon": "படங்கள் விரைவில் வரும்.", "a_key": "முக்கிய அம்சங்கள்", "a_conn": "இணைப்பு", "a_edu": "அருகிலுள்ள கல்வி", "a_health": "அருகிலுள்ள சுகாதாரம்", "a_rec": "பொழுதுபோக்கு", "a_key_1": "40ft மற்றும் 30ft சாலைகளுடன் நன்கு இணைக்கப்பட்ட சாலைகள்", "a_key_2": "தனி பூங்கா மற்றும் குடிமை வசதிகள்", "a_key_3": "நிலத்தடி வடிகால் அமைப்பு", "a_key_4": "24×7 மின்சாரம்", "a_conn_1": "தற்போதைய 80ft சாலையிலிருந்து 200 மீ", "a_conn_2": "வரவிருக்கும் 200ft ரிங் சாலையிலிருந்து 300 மீ", "a_conn_3": "ரயில் நிலையத்திற்கு 12 நிமிடம்", "a_conn_4": "DC அலுவலகத்திற்கு 13 நிமிடம்", "a_edu_1": "Keladi Shivappa Nayaka University of Agricultural & Horticultural Sciences இலிருந்து 800 மீ", "a_edu_2": "JNNCE Engineering College இலிருந்து 1.3 கிமீ", "a_edu_3": "Akshara PU College இலிருந்து 1.3 கிமீ", "a_edu_4": "Bapuji Ayurvedic Medical College இலிருந்து 1 கிமீ", "a_health_1": "Usha Multi Speciality Nursing Home க்கு 10 நிமிடம்", "a_health_2": "Chandragiri Multispeciality Hospital க்கு 10 நிமிடம்", "a_rec_1": "KSCA Cricket Stadium க்கு 5 நிமிடம்", "display": "காட்சி", "view_mode": "பார்வை", "search_ph2": "மனை, வசதி, அளவு தேடுங்கள்…", "survey_parcels": "சர்வே பார்சல்கள்", "d_village_l": "கிராமம்", "d_district_l": "மாவட்டம்", "d_state_l": "மாநிலம்", "d_units_l": "அலகுகள்", "d_owner_l": "உரிமை"}, "hi": {"choose_lang": "अपनी भाषा चुनें", "select_lang": "भाषा चुनें", "interactive_masterplan": "इंटरैक्टिव मास्टरप्लान", "interactive_map": "इंटरैक्टिव मैप", "layout": "लेआउट", "sites": "साइट", "status": "स्थिति", "available": "उपलब्ध", "on_hold": "होल्ड पर", "reserved": "आरक्षित", "sold": "बिक गया", "site_numbers": "साइट नंबर", "daylight_theme": "डेलाइट थीम", "search_ph": "साइट नं. 1–103", "realistic": "रियलिस्टिक", "schematic": "स्कीमैटिक", "geomap": "जियोमैप", "schematic_sub": "स्वीकृत प्लान, डार्क ड्राफ्टिंग व्यू", "realistic_sub": "डेलाइट ग्राउंड व्यू, मटेरियल के साथ", "geomap_sub": "गूगल मैप्स के साथ संरेखित · कोऑर्डिनेट्स आवश्यक", "colour_sites": "साइट रंग", "by_availability": "उपलब्धता के अनुसार", "by_availability_sub": "सेल्स बोर्ड की स्थिति के रंग", "by_size": "आकार के अनुसार", "by_size_sub": "साइट क्षेत्रफल के अनुसार", "plain": "सादा", "plain_sub": "एक ही रंग, ड्रॉइंग शैली", "filter_sites": "साइट फ़िल्टर", "all_sites": "सभी साइट", "share": "शेयर", "site": "साइट", "dimensions": "माप", "tab_site": "साइट", "tab_layout": "लेआउट", "tab_price": "कीमत", "dims_note": "ये आंकड़े प्लॉट डाइमेंशन शेड्यूल से स्वीकृत भुजा लंबाई हैं, मीटर में। प्लान बताता है कि वास्तविक माप साइट रिलीज़ के समय पुष्टि किए जाते हैं।", "area": "क्षेत्रफल", "nominal_size": "नॉमिनल आकार", "book_for_plot": "इस प्लॉट के लिए साइट विज़िट बुक करें", "nav_location": "लोकेशन", "nav_contact": "संपर्क", "nav_details": "विवरण", "nav_images": "तस्वीरें", "nav_amenities": "सुविधाएं", "share_map": "यह मैप शेयर करें", "send_to_chat": "किसी भी चैट पर भेजें", "call": "कॉल", "whatsapp": "व्हाट्सएप", "book_visit": "साइट विज़िट बुक करें", "request_appt": "अपॉइंटमेंट का अनुरोध करें", "site_visit": "साइट विज़िट", "book_appt": "अपॉइंटमेंट बुक करें", "name": "नाम", "phone": "फ़ोन", "email": "ईमेल", "optional": "(वैकल्पिक)", "name_ph": "आपका पूरा नाम", "phone_ph": "10-अंकों का मोबाइल नंबर", "email_ph": "you@example.com", "choose_dt": "तारीख़ और समय चुनें →", "pick_slot": "पसंदीदा समय चुनें", "back": "← वापस", "confirm_req": "अनुरोध की पुष्टि करें", "visit_requested": "साइट विज़िट का अनुरोध किया गया", "confirm_shortly": "हम आपका अपॉइंटमेंट जल्द ही पुष्टि करेंगे।", "opening_wa": "आपका अनुरोध भेजने के लिए व्हाट्सएप खुल रहा है…", "done": "हो गया", "preselected": "पूर्व-चयनित", "drag_hint": "ड्रैग करें · स्क्रॉल ज़ूम · साइट टैप करें", "get_yours": "अभी पाएं →", "maps_by": "इंटरैक्टिव मैप्स", "book_visit_for": "इसके लिए विज़िट बुक करें", "tab_dims": "माप", "d_land_type_l": "भूमि प्रकार", "d_land_type_v": "आवासीय लेआउट", "d_survey_l": "सर्वे नं.", "d_location_l": "स्थान", "d_location_v": "बसवनगंगूरु गाँव, शिवमोग्गा जिला, कर्नाटक", "d_authority_l": "योजना प्राधिकरण", "d_authority_v": "शिवमोग्गा शहरी विकास प्राधिकरण (SUDA)", "d_status_l": "लेआउट स्थिति", "d_status_v": "ड्राफ्ट / स्वीकृत लेआउट", "d_aln_l": "स्वीकृति संदर्भ / ALN नं.", "d_alndate_l": "ALN तिथि", "d_extent_l": "भूमि विस्तार", "d_kharab_l": "खराब", "d_kharab_v": "00-04 (RTC अनुसार, सड़क क्षेत्र में)", "d_totalsites_l": "कुल साइट", "d_totalsites_v": "103 साइट", "d_resarea_l": "आवासीय क्षेत्र", "d_park_l": "पार्क / खुला स्थान", "d_ca_l": "C.A.", "d_stp_l": "S.T.P.", "d_roadarea_l": "सड़क क्षेत्र", "d_totalarea_l": "कुल लेआउट क्षेत्र", "d_roads_l": "सड़कें", "d_roads_v": "स्वीकृत प्लान अनुसार लेआउट व आंतरिक सड़कें", "d_pathway_l": "पैदल मार्ग", "d_pathway_v": "स्वीकृत लेआउट अनुसार", "d_dims_l": "साइट माप", "d_dims_v": "9×15 मी: 23 · 9×12 मी: 28 · अन्य: 52", "d_scale_l": "स्केल", "details_kick": "सत्यापन", "details_title": "लेआउट विवरण", "amen_kick": "आसपास", "amen_title": "सुविधाएं और स्थान", "images_kick": "गैलरी", "images_title": "प्रोजेक्ट तस्वीरें", "images_soon": "तस्वीरें जल्द आ रही हैं।", "a_key": "मुख्य विशेषताएं", "a_conn": "कनेक्टिविटी", "a_edu": "नज़दीकी शिक्षा", "a_health": "नज़दीकी स्वास्थ्य सेवा", "a_rec": "मनोरंजन", "a_key_1": "40ft और 30ft सड़कों के साथ अच्छी तरह जुड़ी सड़कें", "a_key_2": "समर्पित पार्क और नागरिक सुविधाएं", "a_key_3": "भूमिगत जल निकासी प्रणाली", "a_key_4": "24×7 बिजली", "a_conn_1": "मौजूदा 80ft सड़क से 200 मी", "a_conn_2": "आगामी 200ft रिंग रोड से 300 मी", "a_conn_3": "रेलवे स्टेशन तक 12 मिनट", "a_conn_4": "DC कार्यालय तक 13 मिनट", "a_edu_1": "Keladi Shivappa Nayaka University of Agricultural & Horticultural Sciences से 800 मी", "a_edu_2": "JNNCE Engineering College से 1.3 किमी", "a_edu_3": "Akshara PU College से 1.3 किमी", "a_edu_4": "Bapuji Ayurvedic Medical College से 1 किमी", "a_health_1": "Usha Multi Speciality Nursing Home तक 10 मिनट", "a_health_2": "Chandragiri Multispeciality Hospital तक 10 मिनट", "a_rec_1": "KSCA Cricket Stadium तक 5 मिनट", "display": "डिस्प्ले", "view_mode": "व्यू", "search_ph2": "साइट, सुविधा, माप खोजें…", "survey_parcels": "सर्वे पार्सल", "d_village_l": "गाँव", "d_district_l": "जिला", "d_state_l": "राज्य", "d_units_l": "इकाइयाँ", "d_owner_l": "स्वामित्व"}};
let LANG='en';
function t(key){ return (I18N[LANG]&&I18N[LANG][key]) || I18N.en[key] || key; }
function applyLang(code){
  LANG = I18N[code] ? code : 'en';
  document.documentElement.lang = LANG;
  // text nodes
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n'); el.textContent=t(k);
  });
  // placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  // dynamic bits that may be open
  if(typeof relabelDynamic==='function') relabelDynamic();
}



const DATA = {"plots": [{"id": 1, "ring": [[202.071, 141.366], [192.258, 134.879], [185.833, 145.658], [204.73, 156.921], [205.773, 152.115]], "centroid": [197.956, 148.886], "sqm": 220.2, "sqft": 2370.5, "sqyd": 263.4, "std": false, "survey": "157/9", "size": "12.55 × 22.00", "dims": ["11.76", "12.55", "22.00", "4.92", "11.37"], "face": "NW", "edges": [{"label": "11.76", "val": 11.76, "a": [202.071, 141.366], "b": [192.258, 134.879]}, {"label": "12.55", "val": 12.55, "a": [192.258, 134.879], "b": [185.833, 145.658]}, {"label": "22.00", "val": 22, "a": [185.833, 145.658], "b": [204.73, 156.921]}, {"label": "4.92", "val": 4.92, "a": [204.73, 156.921], "b": [205.773, 152.115]}, {"label": "11.37", "val": 11.37, "a": [205.773, 152.115], "b": [202.071, 141.366]}]}, {"id": 2, "ring": [[185.833, 145.658], [181.225, 153.389], [202.184, 165.881], [202.93, 165.214], [204.73, 156.921]], "centroid": [192.978, 155.155], "sqm": 211.3, "sqft": 2274.2, "sqyd": 252.7, "std": false, "survey": "157/9", "size": "9.00 × 24.70", "dims": ["9.00", "24.40", "1.00", "8.49", "22.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [185.833, 145.658], "b": [181.225, 153.389]}, {"label": "24.40", "val": 24.4, "a": [181.225, 153.389], "b": [202.184, 165.881]}, {"label": "1.00", "val": 1, "a": [202.184, 165.881], "b": [202.93, 165.214]}, {"label": "8.49", "val": 8.49, "a": [202.93, 165.214], "b": [204.73, 156.921]}, {"label": "22.00", "val": 22, "a": [204.73, 156.921], "b": [185.833, 145.658]}]}, {"id": 3, "ring": [[181.225, 153.389], [176.618, 161.12], [195.152, 172.167], [202.184, 165.881]], "centroid": [189.401, 163.5], "sqm": 206.9, "sqft": 2227, "sqyd": 247.4, "std": false, "survey": "157/1", "size": "9.00 × 24.40", "dims": ["9.00", "21.58", "9.43", "24.40"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [181.225, 153.389], "b": [176.618, 161.12]}, {"label": "21.58", "val": 21.58, "a": [176.618, 161.12], "b": [195.152, 172.167]}, {"label": "9.43", "val": 9.43, "a": [195.152, 172.167], "b": [202.184, 165.881]}, {"label": "24.40", "val": 24.4, "a": [202.184, 165.881], "b": [181.225, 153.389]}]}, {"id": 4, "ring": [[176.618, 161.12], [172.01, 168.851], [188.121, 178.453], [195.152, 172.167]], "centroid": [183.581, 170.509], "sqm": 181.5, "sqft": 1953.6, "sqyd": 217.1, "std": false, "survey": "157/1", "size": "9.00 × 21.58", "dims": ["9.00", "18.76", "9.43", "21.58"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [176.618, 161.12], "b": [172.01, 168.851]}, {"label": "18.76", "val": 18.76, "a": [172.01, 168.851], "b": [188.121, 178.453]}, {"label": "9.43", "val": 9.43, "a": [188.121, 178.453], "b": [195.152, 172.167]}, {"label": "21.58", "val": 21.58, "a": [195.152, 172.167], "b": [176.618, 161.12]}]}, {"id": 5, "ring": [[172.01, 168.851], [167.402, 176.582], [181.151, 184.777], [181.285, 184.564], [188.121, 178.453]], "centroid": [177.761, 177.518], "sqm": 156.1, "sqft": 1680.4, "sqyd": 186.7, "std": false, "survey": "157/1", "size": "9.00 × 18.76", "dims": ["9.00", "16.01", "0.25", "9.17", "18.76"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [172.01, 168.851], "b": [167.402, 176.582]}, {"label": "16.01", "val": 16.01, "a": [167.402, 176.582], "b": [181.151, 184.777]}, {"label": "0.25", "val": 0.25, "a": [181.151, 184.777], "b": [181.285, 184.564]}, {"label": "9.17", "val": 9.17, "a": [181.285, 184.564], "b": [188.121, 178.453]}, {"label": "18.76", "val": 18.76, "a": [188.121, 178.453], "b": [172.01, 168.851]}]}, {"id": 6, "ring": [[167.402, 176.582], [162.794, 184.313], [176.329, 192.38], [181.151, 184.777]], "centroid": [171.972, 184.545], "sqm": 142.9, "sqft": 1538.5, "sqyd": 170.9, "std": false, "survey": "157/1", "size": "9.00 × 16.01", "dims": ["9.00", "15.76", "9.00", "16.01"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [167.402, 176.582], "b": [162.794, 184.313]}, {"label": "15.76", "val": 15.76, "a": [162.794, 184.313], "b": [176.329, 192.38]}, {"label": "9.00", "val": 9, "a": [176.329, 192.38], "b": [181.151, 184.777]}, {"label": "16.01", "val": 16.01, "a": [181.151, 184.777], "b": [167.402, 176.582]}]}, {"id": 7, "ring": [[162.794, 184.313], [158.186, 192.044], [171.507, 199.983], [176.329, 192.38]], "centroid": [167.257, 192.212], "sqm": 140.7, "sqft": 1514.4, "sqyd": 168.3, "std": false, "survey": "157/1", "size": "9.00 × 15.76", "dims": ["9.00", "15.51", "9.00", "15.76"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [162.794, 184.313], "b": [158.186, 192.044]}, {"label": "15.51", "val": 15.51, "a": [158.186, 192.044], "b": [171.507, 199.983]}, {"label": "9.00", "val": 9, "a": [171.507, 199.983], "b": [176.329, 192.38]}, {"label": "15.76", "val": 15.76, "a": [176.329, 192.38], "b": [162.794, 184.313]}]}, {"id": 8, "ring": [[158.186, 192.044], [144.58, 214.872], [161.693, 215.457], [171.507, 199.983]], "centroid": [157.901, 207.427], "sqm": 341.3, "sqft": 3674.2, "sqyd": 408.2, "std": false, "survey": "157/1", "size": "15.51 × 26.58", "dims": ["26.58", "17.12", "18.32", "15.51"], "face": "SW", "edges": [{"label": "26.58", "val": 26.58, "a": [158.186, 192.044], "b": [144.58, 214.872]}, {"label": "17.12", "val": 17.12, "a": [144.58, 214.872], "b": [161.693, 215.457]}, {"label": "18.32", "val": 18.32, "a": [161.693, 215.457], "b": [171.507, 199.983]}, {"label": "15.51", "val": 15.51, "a": [171.507, 199.983], "b": [158.186, 192.044]}]}, {"id": 9, "ring": [[180.134, 137.641], [184.742, 129.91], [172.216, 121.628], [167.25, 129.961]], "centroid": [174.114, 125.769], "sqm": 140.3, "sqft": 1509.7, "sqyd": 167.7, "std": false, "survey": "157/9", "size": "9.70 × 15.00", "dims": ["9.00", "15.02", "9.70", "15.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [180.134, 137.641], "b": [184.742, 129.91]}, {"label": "15.02", "val": 15.02, "a": [184.742, 129.91], "b": [172.216, 121.628]}, {"label": "9.70", "val": 9.7, "a": [172.216, 121.628], "b": [167.25, 129.961]}, {"label": "15.00", "val": 15, "a": [167.25, 129.961], "b": [180.134, 137.641]}]}, {"id": 10, "ring": [[175.527, 145.372], [180.134, 137.641], [167.25, 129.961], [162.642, 137.692]], "centroid": [171.388, 137.666], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [175.527, 145.372], "b": [180.134, 137.641]}, {"label": "15.00", "val": 15, "a": [180.134, 137.641], "b": [167.25, 129.961]}, {"label": "9.00", "val": 9, "a": [167.25, 129.961], "b": [162.642, 137.692]}, {"label": "15.00", "val": 15, "a": [162.642, 137.692], "b": [175.527, 145.372]}]}, {"id": 11, "ring": [[170.919, 153.103], [175.527, 145.372], [162.642, 137.692], [158.034, 145.423]], "centroid": [166.78, 145.397], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [170.919, 153.103], "b": [175.527, 145.372]}, {"label": "15.00", "val": 15, "a": [175.527, 145.372], "b": [162.642, 137.692]}, {"label": "9.00", "val": 9, "a": [162.642, 137.692], "b": [158.034, 145.423]}, {"label": "15.00", "val": 15, "a": [158.034, 145.423], "b": [170.919, 153.103]}]}, {"id": 12, "ring": [[166.311, 160.833], [170.919, 153.103], [158.034, 145.423], [153.426, 153.154]], "centroid": [162.172, 153.128], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [166.311, 160.833], "b": [170.919, 153.103]}, {"label": "15.00", "val": 15, "a": [170.919, 153.103], "b": [158.034, 145.423]}, {"label": "9.00", "val": 9, "a": [158.034, 145.423], "b": [153.426, 153.154]}, {"label": "15.00", "val": 15, "a": [153.426, 153.154], "b": [166.311, 160.833]}]}, {"id": 13, "ring": [[161.703, 168.564], [166.311, 160.833], [153.426, 153.154], [148.818, 160.885]], "centroid": [157.564, 160.859], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/1", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [161.703, 168.564], "b": [166.311, 160.833]}, {"label": "15.00", "val": 15, "a": [166.311, 160.833], "b": [153.426, 153.154]}, {"label": "9.00", "val": 9, "a": [153.426, 153.154], "b": [148.818, 160.885]}, {"label": "15.00", "val": 15, "a": [148.818, 160.885], "b": [161.703, 168.564]}]}, {"id": 14, "ring": [[157.095, 176.295], [161.703, 168.564], [148.818, 160.885], [144.21, 168.616]], "centroid": [152.957, 168.59], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/1", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [157.095, 176.295], "b": [161.703, 168.564]}, {"label": "15.00", "val": 15, "a": [161.703, 168.564], "b": [148.818, 160.885]}, {"label": "9.00", "val": 9, "a": [148.818, 160.885], "b": [144.21, 168.616]}, {"label": "15.00", "val": 15, "a": [144.21, 168.616], "b": [157.095, 176.295]}]}, {"id": 15, "ring": [[152.487, 184.026], [157.095, 176.295], [144.21, 168.616], [139.602, 176.347]], "centroid": [148.349, 176.321], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/1", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [152.487, 184.026], "b": [157.095, 176.295]}, {"label": "15.00", "val": 15, "a": [157.095, 176.295], "b": [144.21, 168.616]}, {"label": "9.00", "val": 9, "a": [144.21, 168.616], "b": [139.602, 176.347]}, {"label": "15.00", "val": 15, "a": [139.602, 176.347], "b": [152.487, 184.026]}]}, {"id": 16, "ring": [[147.879, 191.757], [152.487, 184.026], [139.602, 176.347], [134.994, 184.077]], "centroid": [143.741, 184.052], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/1", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [147.879, 191.757], "b": [152.487, 184.026]}, {"label": "15.00", "val": 15, "a": [152.487, 184.026], "b": [139.602, 176.347]}, {"label": "9.00", "val": 9, "a": [139.602, 176.347], "b": [134.994, 184.077]}, {"label": "15.00", "val": 15, "a": [134.994, 184.077], "b": [147.879, 191.757]}]}, {"id": 17, "ring": [[143.271, 199.488], [147.879, 191.757], [134.994, 184.077], [130.387, 191.808]], "centroid": [139.133, 191.783], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/1", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [143.271, 199.488], "b": [147.879, 191.757]}, {"label": "15.00", "val": 15, "a": [147.879, 191.757], "b": [134.994, 184.077]}, {"label": "9.00", "val": 9, "a": [134.994, 184.077], "b": [130.387, 191.808]}, {"label": "15.00", "val": 15, "a": [130.387, 191.808], "b": [143.271, 199.488]}]}, {"id": 18, "ring": [[117.435, 213.538], [134.367, 214.428], [143.271, 199.488], [130.387, 191.808]], "centroid": [130.353, 206.513], "sqm": 320.2, "sqft": 3446.2, "sqyd": 382.9, "std": false, "survey": "157/1", "size": "15.00 × 25.30", "dims": ["16.96", "17.39", "15.00", "25.30"], "face": "SW", "edges": [{"label": "16.96", "val": 16.96, "a": [117.435, 213.538], "b": [134.367, 214.428]}, {"label": "17.39", "val": 17.39, "a": [134.367, 214.428], "b": [143.271, 199.488]}, {"label": "15.00", "val": 15, "a": [143.271, 199.488], "b": [130.387, 191.808]}, {"label": "25.30", "val": 25.3, "a": [130.387, 191.808], "b": [117.435, 213.538]}]}, {"id": 19, "ring": [[162.195, 115.003], [156.942, 123.817], [167.25, 129.961], [172.216, 121.628]], "centroid": [164.579, 122.723], "sqm": 119.8, "sqft": 1289.2, "sqyd": 143.2, "std": false, "survey": "157/9", "size": "10.26 × 12.00", "dims": ["10.26", "12.00", "9.70", "12.01"], "face": "SE", "edges": [{"label": "10.26", "val": 10.26, "a": [162.195, 115.003], "b": [156.942, 123.817]}, {"label": "12.00", "val": 12, "a": [156.942, 123.817], "b": [167.25, 129.961]}, {"label": "9.70", "val": 9.7, "a": [167.25, 129.961], "b": [172.216, 121.628]}, {"label": "12.01", "val": 12.01, "a": [172.216, 121.628], "b": [162.195, 115.003]}]}, {"id": 20, "ring": [[156.942, 123.817], [152.334, 131.548], [162.642, 137.692], [167.25, 129.961]], "centroid": [159.792, 130.754], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [156.942, 123.817], "b": [152.334, 131.548]}, {"label": "12.00", "val": 12, "a": [152.334, 131.548], "b": [162.642, 137.692]}, {"label": "9.00", "val": 9, "a": [162.642, 137.692], "b": [167.25, 129.961]}, {"label": "12.00", "val": 12, "a": [167.25, 129.961], "b": [156.942, 123.817]}]}, {"id": 21, "ring": [[152.334, 131.548], [147.726, 139.279], [158.034, 145.423], [162.642, 137.692]], "centroid": [155.184, 138.485], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [152.334, 131.548], "b": [147.726, 139.279]}, {"label": "12.00", "val": 12, "a": [147.726, 139.279], "b": [158.034, 145.423]}, {"label": "9.00", "val": 9, "a": [158.034, 145.423], "b": [162.642, 137.692]}, {"label": "12.00", "val": 12, "a": [162.642, 137.692], "b": [152.334, 131.548]}]}, {"id": 22, "ring": [[147.726, 139.279], [143.118, 147.01], [153.426, 153.154], [158.034, 145.423]], "centroid": [150.576, 146.216], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [147.726, 139.279], "b": [143.118, 147.01]}, {"label": "12.00", "val": 12, "a": [143.118, 147.01], "b": [153.426, 153.154]}, {"label": "9.00", "val": 9, "a": [153.426, 153.154], "b": [158.034, 145.423]}, {"label": "12.00", "val": 12, "a": [158.034, 145.423], "b": [147.726, 139.279]}]}, {"id": 23, "ring": [[143.118, 147.01], [138.51, 154.741], [148.818, 160.885], [153.426, 153.154]], "centroid": [145.968, 153.947], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [143.118, 147.01], "b": [138.51, 154.741]}, {"label": "12.00", "val": 12, "a": [138.51, 154.741], "b": [148.818, 160.885]}, {"label": "9.00", "val": 9, "a": [148.818, 160.885], "b": [153.426, 153.154]}, {"label": "12.00", "val": 12, "a": [153.426, 153.154], "b": [143.118, 147.01]}]}, {"id": 24, "ring": [[138.51, 154.741], [133.902, 162.472], [144.21, 168.616], [148.818, 160.885]], "centroid": [141.36, 161.678], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [138.51, 154.741], "b": [133.902, 162.472]}, {"label": "12.00", "val": 12, "a": [133.902, 162.472], "b": [144.21, 168.616]}, {"label": "9.00", "val": 9, "a": [144.21, 168.616], "b": [148.818, 160.885]}, {"label": "12.00", "val": 12, "a": [148.818, 160.885], "b": [138.51, 154.741]}]}, {"id": 25, "ring": [[133.902, 162.472], [129.294, 170.203], [139.602, 176.347], [144.21, 168.616]], "centroid": [136.752, 169.409], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [133.902, 162.472], "b": [129.294, 170.203]}, {"label": "12.00", "val": 12, "a": [129.294, 170.203], "b": [139.602, 176.347]}, {"label": "9.00", "val": 9, "a": [139.602, 176.347], "b": [144.21, 168.616]}, {"label": "12.00", "val": 12, "a": [144.21, 168.616], "b": [133.902, 162.472]}]}, {"id": 26, "ring": [[129.294, 170.203], [124.686, 177.934], [134.994, 184.077], [139.602, 176.347]], "centroid": [132.144, 177.14], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [129.294, 170.203], "b": [124.686, 177.934]}, {"label": "12.00", "val": 12, "a": [124.686, 177.934], "b": [134.994, 184.077]}, {"label": "9.00", "val": 9, "a": [134.994, 184.077], "b": [139.602, 176.347]}, {"label": "12.00", "val": 12, "a": [139.602, 176.347], "b": [129.294, 170.203]}]}, {"id": 27, "ring": [[124.686, 177.934], [120.079, 185.665], [130.387, 191.808], [134.994, 184.077]], "centroid": [127.536, 184.871], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NW", "edges": [{"label": "9.00", "val": 9, "a": [124.686, 177.934], "b": [120.079, 185.665]}, {"label": "12.00", "val": 12, "a": [120.079, 185.665], "b": [130.387, 191.808]}, {"label": "9.00", "val": 9, "a": [130.387, 191.808], "b": [134.994, 184.077]}, {"label": "12.00", "val": 12, "a": [134.994, 184.077], "b": [124.686, 177.934]}]}, {"id": 28, "ring": [[120.079, 185.665], [115.471, 193.396], [125.779, 199.539], [130.387, 191.808]], "centroid": [122.929, 192.602], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/1", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SE", "edges": [{"label": "9.00", "val": 9, "a": [120.079, 185.665], "b": [115.471, 193.396]}, {"label": "12.00", "val": 12, "a": [115.471, 193.396], "b": [125.779, 199.539]}, {"label": "9.00", "val": 9, "a": [125.779, 199.539], "b": [130.387, 191.808]}, {"label": "12.00", "val": 12, "a": [130.387, 191.808], "b": [120.079, 185.665]}]}, {"id": 29, "ring": [[103.972, 212.687], [117.435, 213.538], [125.779, 199.539], [115.471, 193.396]], "centroid": [114.876, 206.113], "sqm": 232.5, "sqft": 2502.9, "sqyd": 278.1, "std": false, "survey": "157/1", "size": "12.00 × 22.46", "dims": ["13.49", "16.30", "12.00", "22.46"], "face": "SW", "edges": [{"label": "13.49", "val": 13.49, "a": [103.972, 212.687], "b": [117.435, 213.538]}, {"label": "16.30", "val": 16.3, "a": [117.435, 213.538], "b": [125.779, 199.539]}, {"label": "12.00", "val": 12, "a": [125.779, 199.539], "b": [115.471, 193.396]}, {"label": "22.46", "val": 22.46, "a": [115.471, 193.396], "b": [103.972, 212.687]}]}, {"id": 30, "ring": [[136.228, 140.992], [125.078, 133.62], [116.806, 146.133], [128.539, 153.891]], "centroid": [126.6, 143.562], "sqm": 205.7, "sqft": 2214.6, "sqyd": 246.1, "std": false, "survey": "157/9", "size": "14.07 × 15.00", "dims": ["13.37", "15.00", "14.07", "15.02"], "face": "NE", "edges": [{"label": "13.37", "val": 13.37, "a": [136.228, 140.992], "b": [125.078, 133.62]}, {"label": "15.00", "val": 15, "a": [125.078, 133.62], "b": [116.806, 146.133]}, {"label": "14.07", "val": 14.07, "a": [116.806, 146.133], "b": [128.539, 153.891]}, {"label": "15.02", "val": 15.02, "a": [128.539, 153.891], "b": [136.228, 140.992]}]}, {"id": 31, "ring": [[109.298, 141.17], [108.247, 154.86], [122.389, 164.21], [128.539, 153.891]], "centroid": [113.864, 147.53], "sqm": 240.1, "sqft": 2584.6, "sqyd": 287.2, "std": false, "survey": "157/9", "size": "12.00 × 23.63", "dims": ["13.73", "16.95", "12.01", "23.07"], "face": "SE", "edges": [{"label": "13.73", "val": 13.73, "a": [109.298, 141.17], "b": [108.247, 154.86]}, {"label": "16.95", "val": 16.95, "a": [108.247, 154.86], "b": [122.389, 164.21]}, {"label": "12.01", "val": 12.01, "a": [122.389, 164.21], "b": [128.539, 153.891]}, {"label": "23.07", "val": 23.07, "a": [128.539, 153.891], "b": [109.298, 141.17]}]}, {"id": 32, "ring": [[108.247, 154.86], [107.459, 165.128], [117.776, 171.949], [122.389, 164.21]], "centroid": [111.603, 159.535], "sqm": 131.9, "sqft": 1420.2, "sqyd": 157.8, "std": false, "survey": "157/1", "size": "9.00 × 17.37", "dims": ["10.30", "12.37", "9.01", "16.95"], "face": "SE", "edges": [{"label": "10.30", "val": 10.3, "a": [108.247, 154.86], "b": [107.459, 165.128]}, {"label": "12.37", "val": 12.37, "a": [107.459, 165.128], "b": [117.776, 171.949]}, {"label": "9.01", "val": 9.01, "a": [117.776, 171.949], "b": [122.389, 164.21]}, {"label": "16.95", "val": 16.95, "a": [122.389, 164.21], "b": [108.247, 154.86]}]}, {"id": 33, "ring": [[107.459, 165.128], [105.334, 192.825], [117.776, 171.949]], "centroid": [108.845, 182.387], "sqm": 150.1, "sqft": 1615.9, "sqyd": 179.5, "std": false, "survey": "157/1", "size": "10.81 × 27.78", "dims": ["27.78", "24.30", "12.37"], "face": "W", "edges": [{"label": "27.78", "val": 27.78, "a": [107.459, 165.128], "b": [105.334, 192.825]}, {"label": "24.30", "val": 24.3, "a": [105.334, 192.825], "b": [117.776, 171.949]}, {"label": "12.37", "val": 12.37, "a": [117.776, 171.949], "b": [107.459, 165.128]}]}, {"id": 34, "ring": [[110.611, 124.056], [109.298, 141.17], [116.806, 146.133], [125.078, 133.62]], "centroid": [116.085, 137.395], "sqm": 197.6, "sqft": 2126.6, "sqyd": 236.3, "std": false, "survey": "157/9", "size": "15.00 × 17.34", "dims": ["17.16", "9.00", "15.00", "17.34"], "face": "SE", "edges": [{"label": "17.16", "val": 17.16, "a": [110.611, 124.056], "b": [109.298, 141.17]}, {"label": "9.00", "val": 9, "a": [109.298, 141.17], "b": [116.806, 146.133]}, {"label": "15.00", "val": 15, "a": [116.806, 146.133], "b": [125.078, 133.62]}, {"label": "17.34", "val": 17.34, "a": [125.078, 133.62], "b": [110.611, 124.056]}]}, {"id": 35, "ring": [[90.175, 67.389], [92.897, 83.574], [102.901, 90.188], [109.519, 80.178]], "centroid": [95.549, 73.783], "sqm": 211.1, "sqft": 2272.2, "sqyd": 252.5, "std": false, "survey": "157/6", "size": "12.00 × 23.19", "dims": ["16.41", "11.99", "12.00", "23.19"], "face": "SE", "edges": [{"label": "16.41", "val": 16.41, "a": [90.175, 67.389], "b": [92.897, 83.574]}, {"label": "11.99", "val": 11.99, "a": [92.897, 83.574], "b": [102.901, 90.188]}, {"label": "12.00", "val": 12, "a": [102.901, 90.188], "b": [109.519, 80.178]}, {"label": "23.19", "val": 23.19, "a": [109.519, 80.178], "b": [90.175, 67.389]}]}, {"id": 36, "ring": [[117.027, 85.141], [109.519, 80.178], [102.901, 90.188], [110.409, 95.151]], "centroid": [109.964, 87.664], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/6", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SW", "edges": [{"label": "9.00", "val": 9, "a": [117.027, 85.141], "b": [109.519, 80.178]}, {"label": "12.00", "val": 12, "a": [109.519, 80.178], "b": [102.901, 90.188]}, {"label": "9.00", "val": 9, "a": [102.901, 90.188], "b": [110.409, 95.151]}, {"label": "12.00", "val": 12, "a": [110.409, 95.151], "b": [117.027, 85.141]}]}, {"id": 37, "ring": [[124.534, 90.105], [117.027, 85.141], [110.409, 95.151], [117.916, 100.115]], "centroid": [117.472, 92.628], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NE", "edges": [{"label": "9.00", "val": 9, "a": [124.534, 90.105], "b": [117.027, 85.141]}, {"label": "12.00", "val": 12, "a": [117.027, 85.141], "b": [110.409, 95.151]}, {"label": "9.00", "val": 9, "a": [110.409, 95.151], "b": [117.916, 100.115]}, {"label": "12.00", "val": 12, "a": [117.916, 100.115], "b": [124.534, 90.105]}]}, {"id": 38, "ring": [[132.042, 95.068], [124.534, 90.105], [117.916, 100.115], [125.424, 105.078]], "centroid": [124.979, 97.591], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NE", "edges": [{"label": "9.00", "val": 9, "a": [132.042, 95.068], "b": [124.534, 90.105]}, {"label": "12.00", "val": 12, "a": [124.534, 90.105], "b": [117.916, 100.115]}, {"label": "9.00", "val": 9, "a": [117.916, 100.115], "b": [125.424, 105.078]}, {"label": "12.00", "val": 12, "a": [125.424, 105.078], "b": [132.042, 95.068]}]}, {"id": 39, "ring": [[139.549, 100.031], [132.042, 95.068], [125.424, 105.078], [132.931, 110.042]], "centroid": [132.487, 102.555], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "NE", "edges": [{"label": "9.00", "val": 9, "a": [139.549, 100.031], "b": [132.042, 95.068]}, {"label": "12.00", "val": 12, "a": [132.042, 95.068], "b": [125.424, 105.078]}, {"label": "9.00", "val": 9, "a": [125.424, 105.078], "b": [132.931, 110.042]}, {"label": "12.00", "val": 12, "a": [132.931, 110.042], "b": [139.549, 100.031]}]}, {"id": 40, "ring": [[147.057, 104.995], [139.549, 100.031], [132.931, 110.042], [140.439, 115.005]], "centroid": [139.994, 107.518], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "SW", "edges": [{"label": "9.00", "val": 9, "a": [147.057, 104.995], "b": [139.549, 100.031]}, {"label": "12.00", "val": 12, "a": [139.549, 100.031], "b": [132.931, 110.042]}, {"label": "9.00", "val": 9, "a": [132.931, 110.042], "b": [140.439, 115.005]}, {"label": "12.00", "val": 12, "a": [140.439, 115.005], "b": [147.057, 104.995]}]}, {"id": 41, "ring": [[148.529, 120.353], [154.679, 110.034], [147.057, 104.995], [140.439, 115.005]], "centroid": [147.64, 112.52], "sqm": 113, "sqft": 1216.4, "sqyd": 135.2, "std": false, "survey": "157/9", "size": "9.70 × 12.00", "dims": ["12.01", "9.14", "12.00", "9.70"], "face": "NE", "edges": [{"label": "12.01", "val": 12.01, "a": [148.529, 120.353], "b": [154.679, 110.034]}, {"label": "9.14", "val": 9.14, "a": [154.679, 110.034], "b": [147.057, 104.995]}, {"label": "12.00", "val": 12, "a": [147.057, 104.995], "b": [140.439, 115.005]}, {"label": "9.70", "val": 9.7, "a": [140.439, 115.005], "b": [148.529, 120.353]}]}, {"id": 42, "ring": [[97.212, 109.227], [111.731, 109.471], [117.916, 100.115], [92.897, 83.574]], "centroid": [99.847, 91.844], "sqm": 353.9, "sqft": 3809.4, "sqyd": 423.3, "std": false, "survey": "157/6", "size": "19.02 × 29.99", "dims": ["14.52", "11.22", "29.99", "26.01"], "face": "SE", "edges": [{"label": "14.52", "val": 14.52, "a": [97.212, 109.227], "b": [111.731, 109.471]}, {"label": "11.22", "val": 11.22, "a": [111.731, 109.471], "b": [117.916, 100.115]}, {"label": "29.99", "val": 29.99, "a": [117.916, 100.115], "b": [92.897, 83.574]}, {"label": "26.01", "val": 26.01, "a": [92.897, 83.574], "b": [97.212, 109.227]}]}, {"id": 43, "ring": [[111.731, 109.471], [111.4, 113.788], [117.151, 117.591], [125.424, 105.078], [117.916, 100.115]], "centroid": [118.577, 107.274], "sqm": 131, "sqft": 1410.3, "sqyd": 156.7, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["4.33", "6.89", "15.00", "9.00", "11.22"], "face": "NE", "edges": [{"label": "4.33", "val": 4.33, "a": [111.731, 109.471], "b": [111.4, 113.788]}, {"label": "6.89", "val": 6.89, "a": [111.4, 113.788], "b": [117.151, 117.591]}, {"label": "15.00", "val": 15, "a": [117.151, 117.591], "b": [125.424, 105.078]}, {"label": "9.00", "val": 9, "a": [125.424, 105.078], "b": [117.916, 100.115]}, {"label": "11.22", "val": 11.22, "a": [117.916, 100.115], "b": [111.731, 109.471]}]}, {"id": 44, "ring": [[117.151, 117.591], [124.659, 122.554], [132.931, 110.042], [125.424, 105.078]], "centroid": [125.041, 113.816], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "SW", "edges": [{"label": "9.00", "val": 9, "a": [117.151, 117.591], "b": [124.659, 122.554]}, {"label": "15.00", "val": 15, "a": [124.659, 122.554], "b": [132.931, 110.042]}, {"label": "9.00", "val": 9, "a": [132.931, 110.042], "b": [125.424, 105.078]}, {"label": "15.00", "val": 15, "a": [125.424, 105.078], "b": [117.151, 117.591]}]}, {"id": 45, "ring": [[124.659, 122.554], [132.167, 127.518], [140.439, 115.005], [132.931, 110.042]], "centroid": [132.549, 118.78], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "NE", "edges": [{"label": "9.00", "val": 9, "a": [124.659, 122.554], "b": [132.167, 127.518]}, {"label": "15.00", "val": 15, "a": [132.167, 127.518], "b": [140.439, 115.005]}, {"label": "9.00", "val": 9, "a": [140.439, 115.005], "b": [132.931, 110.042]}, {"label": "15.00", "val": 15, "a": [132.931, 110.042], "b": [124.659, 122.554]}]}, {"id": 46, "ring": [[140.841, 133.252], [148.529, 120.353], [140.439, 115.005], [132.167, 127.518]], "centroid": [140.464, 123.936], "sqm": 150.7, "sqft": 1622.3, "sqyd": 180.3, "std": false, "survey": "157/9", "size": "10.40 × 15.00", "dims": ["15.02", "9.70", "15.00", "10.40"], "face": "NE", "edges": [{"label": "15.02", "val": 15.02, "a": [140.841, 133.252], "b": [148.529, 120.353]}, {"label": "9.70", "val": 9.7, "a": [148.529, 120.353], "b": [140.439, 115.005]}, {"label": "15.00", "val": 15, "a": [140.439, 115.005], "b": [132.167, 127.518]}, {"label": "10.40", "val": 10.4, "a": [132.167, 127.518], "b": [140.841, 133.252]}]}, {"id": 47, "ring": [[187.826, 10.672], [175.684, 10.634], [178.159, 26.978], [190.024, 25.181]], "centroid": [182.857, 17.927], "sqm": 187.2, "sqft": 2015.3, "sqyd": 223.9, "std": false, "survey": "157/10", "size": "12.00 × 16.53", "dims": ["12.14", "16.53", "12.00", "14.67"], "face": "W", "edges": [{"label": "12.14", "val": 12.14, "a": [187.826, 10.672], "b": [175.684, 10.634]}, {"label": "16.53", "val": 16.53, "a": [175.684, 10.634], "b": [178.159, 26.978]}, {"label": "12.00", "val": 12, "a": [178.159, 26.978], "b": [190.024, 25.181]}, {"label": "14.67", "val": 14.67, "a": [190.024, 25.181], "b": [187.826, 10.672]}]}, {"id": 48, "ring": [[190.024, 25.181], [178.159, 26.978], [179.507, 35.877], [191.371, 34.08]], "centroid": [184.765, 30.529], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["12.00", "9.00", "12.00", "9.00"], "face": "S", "edges": [{"label": "12.00", "val": 12, "a": [190.024, 25.181], "b": [178.159, 26.978]}, {"label": "9.00", "val": 9, "a": [178.159, 26.978], "b": [179.507, 35.877]}, {"label": "12.00", "val": 12, "a": [179.507, 35.877], "b": [191.371, 34.08]}, {"label": "9.00", "val": 9, "a": [191.371, 34.08], "b": [190.024, 25.181]}]}, {"id": 49, "ring": [[191.371, 34.08], [179.507, 35.877], [180.854, 44.775], [192.719, 42.978]], "centroid": [186.113, 39.428], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["12.00", "9.00", "12.00", "9.00"], "face": "N", "edges": [{"label": "12.00", "val": 12, "a": [191.371, 34.08], "b": [179.507, 35.877]}, {"label": "9.00", "val": 9, "a": [179.507, 35.877], "b": [180.854, 44.775]}, {"label": "12.00", "val": 12, "a": [180.854, 44.775], "b": [192.719, 42.978]}, {"label": "9.00", "val": 9, "a": [192.719, 42.978], "b": [191.371, 34.08]}]}, {"id": 50, "ring": [[192.719, 42.978], [180.854, 44.775], [182.202, 53.674], [194.066, 51.877]], "centroid": [187.46, 48.326], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["12.00", "9.00", "12.00", "9.00"], "face": "S", "edges": [{"label": "12.00", "val": 12, "a": [192.719, 42.978], "b": [180.854, 44.775]}, {"label": "9.00", "val": 9, "a": [180.854, 44.775], "b": [182.202, 53.674]}, {"label": "12.00", "val": 12, "a": [182.202, 53.674], "b": [194.066, 51.877]}, {"label": "9.00", "val": 9, "a": [194.066, 51.877], "b": [192.719, 42.978]}]}, {"id": 51, "ring": [[194.066, 51.877], [182.202, 53.674], [183.549, 62.572], [195.458, 60.769], [195.343, 60.306]], "centroid": [188.772, 56.99], "sqm": 108, "sqft": 1162.6, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.04", "dims": ["12.00", "9.00", "12.04", "0.48", "8.53"], "face": "N", "edges": [{"label": "12.00", "val": 12, "a": [194.066, 51.877], "b": [182.202, 53.674]}, {"label": "9.00", "val": 9, "a": [182.202, 53.674], "b": [183.549, 62.572]}, {"label": "12.04", "val": 12.04, "a": [183.549, 62.572], "b": [195.458, 60.769]}, {"label": "0.48", "val": 0.48, "a": [195.458, 60.769], "b": [195.343, 60.306]}, {"label": "8.53", "val": 8.53, "a": [195.343, 60.306], "b": [194.066, 51.877]}]}, {"id": 52, "ring": [[195.458, 60.769], [183.549, 62.572], [184.897, 71.471], [197.637, 69.542]], "centroid": [190.424, 66.057], "sqm": 112.2, "sqft": 1207.5, "sqyd": 134.2, "std": false, "survey": "157/9", "size": "9.00 × 12.89", "dims": ["12.04", "9.00", "12.89", "9.04"], "face": "N", "edges": [{"label": "12.04", "val": 12.04, "a": [195.458, 60.769], "b": [183.549, 62.572]}, {"label": "9.00", "val": 9, "a": [183.549, 62.572], "b": [184.897, 71.471]}, {"label": "12.89", "val": 12.89, "a": [184.897, 71.471], "b": [197.637, 69.542]}, {"label": "9.04", "val": 9.04, "a": [197.637, 69.542], "b": [195.458, 60.769]}]}, {"id": 53, "ring": [[197.637, 69.542], [184.897, 71.471], [186.244, 80.369], [199.816, 78.314]], "centroid": [192.191, 74.892], "sqm": 119.8, "sqft": 1289, "sqyd": 143.2, "std": false, "survey": "157/9", "size": "9.00 × 13.73", "dims": ["12.89", "9.00", "13.73", "9.04"], "face": "N", "edges": [{"label": "12.89", "val": 12.89, "a": [197.637, 69.542], "b": [184.897, 71.471]}, {"label": "9.00", "val": 9, "a": [184.897, 71.471], "b": [186.244, 80.369]}, {"label": "13.73", "val": 13.73, "a": [186.244, 80.369], "b": [199.816, 78.314]}, {"label": "9.04", "val": 9.04, "a": [199.816, 78.314], "b": [197.637, 69.542]}]}, {"id": 54, "ring": [[199.816, 78.314], [186.244, 80.369], [187.592, 89.268], [201.995, 87.087]], "centroid": [193.957, 83.728], "sqm": 127.3, "sqft": 1370.5, "sqyd": 152.3, "std": true, "survey": "157/9", "size": "9.00 × 14.57", "dims": ["13.73", "9.00", "14.57", "9.04"], "face": "N", "edges": [{"label": "13.73", "val": 13.73, "a": [199.816, 78.314], "b": [186.244, 80.369]}, {"label": "9.00", "val": 9, "a": [186.244, 80.369], "b": [187.592, 89.268]}, {"label": "14.57", "val": 14.57, "a": [187.592, 89.268], "b": [201.995, 87.087]}, {"label": "9.04", "val": 9.04, "a": [201.995, 87.087], "b": [199.816, 78.314]}]}, {"id": 55, "ring": [[201.995, 87.087], [187.592, 89.268], [188.939, 98.166], [204.175, 95.859]], "centroid": [195.723, 92.564], "sqm": 134.9, "sqft": 1452, "sqyd": 161.3, "std": true, "survey": "157/9", "size": "9.00 × 15.41", "dims": ["14.57", "9.00", "15.41", "9.04"], "face": "N", "edges": [{"label": "14.57", "val": 14.57, "a": [201.995, 87.087], "b": [187.592, 89.268]}, {"label": "9.00", "val": 9, "a": [187.592, 89.268], "b": [188.939, 98.166]}, {"label": "15.41", "val": 15.41, "a": [188.939, 98.166], "b": [204.175, 95.859]}, {"label": "9.04", "val": 9.04, "a": [204.175, 95.859], "b": [201.995, 87.087]}]}, {"id": 56, "ring": [[206.354, 104.632], [204.175, 95.859], [188.939, 98.166], [190.287, 107.065]], "centroid": [197.49, 101.399], "sqm": 142.5, "sqft": 1533.5, "sqyd": 170.4, "std": false, "survey": "157/9", "size": "9.00 × 16.25", "dims": ["9.04", "15.41", "9.00", "16.25"], "face": "N", "edges": [{"label": "9.04", "val": 9.04, "a": [206.354, 104.632], "b": [204.175, 95.859]}, {"label": "15.41", "val": 15.41, "a": [204.175, 95.859], "b": [188.939, 98.166]}, {"label": "9.00", "val": 9, "a": [188.939, 98.166], "b": [190.287, 107.065]}, {"label": "16.25", "val": 16.25, "a": [190.287, 107.065], "b": [206.354, 104.632]}]}, {"id": 57, "ring": [[206.354, 104.632], [190.287, 107.065], [191.635, 115.964], [205.554, 113.856], [208.465, 113.132]], "centroid": [199.229, 110.099], "sqm": 149.6, "sqft": 1610.4, "sqyd": 178.9, "std": false, "survey": "157/9", "size": "9.00 × 17.06", "dims": ["16.25", "9.00", "14.08", "3.00", "8.76"], "face": "S", "edges": [{"label": "16.25", "val": 16.25, "a": [206.354, 104.632], "b": [190.287, 107.065]}, {"label": "9.00", "val": 9, "a": [190.287, 107.065], "b": [191.635, 115.964]}, {"label": "14.08", "val": 14.08, "a": [191.635, 115.964], "b": [205.554, 113.856]}, {"label": "3.00", "val": 3, "a": [205.554, 113.856], "b": [208.465, 113.132]}, {"label": "8.76", "val": 8.76, "a": [208.465, 113.132], "b": [206.354, 104.632]}]}, {"id": 58, "ring": [[192.933, 124.536], [211.208, 136.618], [205.554, 113.856], [191.635, 115.964]], "centroid": [205.889, 130.577], "sqm": 234.9, "sqft": 2528, "sqyd": 280.9, "std": false, "survey": "157/9", "size": "14.82 × 24.76", "dims": ["21.91", "23.45", "14.08", "8.67"], "face": "E", "edges": [{"label": "21.91", "val": 21.91, "a": [192.933, 124.536], "b": [211.208, 136.618]}, {"label": "23.45", "val": 23.45, "a": [211.208, 136.618], "b": [205.554, 113.856]}, {"label": "14.08", "val": 14.08, "a": [205.554, 113.856], "b": [191.635, 115.964]}, {"label": "8.67", "val": 8.67, "a": [191.635, 115.964], "b": [192.933, 124.536]}]}, {"id": 59, "ring": [[165.028, 0.375], [149.928, 0.848], [151.544, 11.519], [166.375, 9.273]], "centroid": [158.152, 5.061], "sqm": 148.4, "sqft": 1597.8, "sqyd": 177.5, "std": false, "survey": "157/10", "size": "10.79 × 15.00", "dims": ["15.11", "10.79", "15.00", "9.00"], "face": "S", "edges": [{"label": "15.11", "val": 15.11, "a": [165.028, 0.375], "b": [149.928, 0.848]}, {"label": "10.79", "val": 10.79, "a": [149.928, 0.848], "b": [151.544, 11.519]}, {"label": "15.00", "val": 15, "a": [151.544, 11.519], "b": [166.375, 9.273]}, {"label": "9.00", "val": 9, "a": [166.375, 9.273], "b": [165.028, 0.375]}]}, {"id": 60, "ring": [[167.723, 18.172], [166.375, 9.273], [151.544, 11.519], [152.892, 20.418]], "centroid": [159.634, 14.845], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/10", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [167.723, 18.172], "b": [166.375, 9.273]}, {"label": "15.00", "val": 15, "a": [166.375, 9.273], "b": [151.544, 11.519]}, {"label": "9.00", "val": 9, "a": [151.544, 11.519], "b": [152.892, 20.418]}, {"label": "15.00", "val": 15, "a": [152.892, 20.418], "b": [167.723, 18.172]}]}, {"id": 61, "ring": [[169.07, 27.07], [167.723, 18.172], [152.892, 20.418], [154.239, 29.316]], "centroid": [160.981, 23.744], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/10", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [169.07, 27.07], "b": [167.723, 18.172]}, {"label": "15.00", "val": 15, "a": [167.723, 18.172], "b": [152.892, 20.418]}, {"label": "9.00", "val": 9, "a": [152.892, 20.418], "b": [154.239, 29.316]}, {"label": "15.00", "val": 15, "a": [154.239, 29.316], "b": [169.07, 27.07]}]}, {"id": 62, "ring": [[170.418, 35.969], [169.07, 27.07], [154.239, 29.316], [155.587, 38.215]], "centroid": [162.329, 32.642], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/10", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [170.418, 35.969], "b": [169.07, 27.07]}, {"label": "15.00", "val": 15, "a": [169.07, 27.07], "b": [154.239, 29.316]}, {"label": "9.00", "val": 9, "a": [154.239, 29.316], "b": [155.587, 38.215]}, {"label": "15.00", "val": 15, "a": [155.587, 38.215], "b": [170.418, 35.969]}]}, {"id": 63, "ring": [[171.765, 44.867], [170.418, 35.969], [155.587, 38.215], [156.935, 47.113]], "centroid": [163.676, 41.541], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/10", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [171.765, 44.867], "b": [170.418, 35.969]}, {"label": "15.00", "val": 15, "a": [170.418, 35.969], "b": [155.587, 38.215]}, {"label": "9.00", "val": 9, "a": [155.587, 38.215], "b": [156.935, 47.113]}, {"label": "15.00", "val": 15, "a": [156.935, 47.113], "b": [171.765, 44.867]}]}, {"id": 64, "ring": [[173.113, 53.766], [171.765, 44.867], [156.935, 47.113], [158.282, 56.012]], "centroid": [165.024, 50.44], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/10", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [173.113, 53.766], "b": [171.765, 44.867]}, {"label": "15.00", "val": 15, "a": [171.765, 44.867], "b": [156.935, 47.113]}, {"label": "9.00", "val": 9, "a": [156.935, 47.113], "b": [158.282, 56.012]}, {"label": "15.00", "val": 15, "a": [158.282, 56.012], "b": [173.113, 53.766]}]}, {"id": 65, "ring": [[174.461, 62.664], [173.113, 53.766], [158.282, 56.012], [159.63, 64.91]], "centroid": [166.371, 59.338], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [174.461, 62.664], "b": [173.113, 53.766]}, {"label": "15.00", "val": 15, "a": [173.113, 53.766], "b": [158.282, 56.012]}, {"label": "9.00", "val": 9, "a": [158.282, 56.012], "b": [159.63, 64.91]}, {"label": "15.00", "val": 15, "a": [159.63, 64.91], "b": [174.461, 62.664]}]}, {"id": 66, "ring": [[175.808, 71.563], [174.461, 62.664], [159.63, 64.91], [160.977, 73.809]], "centroid": [167.719, 68.237], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [175.808, 71.563], "b": [174.461, 62.664]}, {"label": "15.00", "val": 15, "a": [174.461, 62.664], "b": [159.63, 64.91]}, {"label": "9.00", "val": 9, "a": [159.63, 64.91], "b": [160.977, 73.809]}, {"label": "15.00", "val": 15, "a": [160.977, 73.809], "b": [175.808, 71.563]}]}, {"id": 67, "ring": [[177.156, 80.461], [175.808, 71.563], [160.977, 73.809], [162.325, 82.707]], "centroid": [169.066, 77.135], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [177.156, 80.461], "b": [175.808, 71.563]}, {"label": "15.00", "val": 15, "a": [175.808, 71.563], "b": [160.977, 73.809]}, {"label": "9.00", "val": 9, "a": [160.977, 73.809], "b": [162.325, 82.707]}, {"label": "15.00", "val": 15, "a": [162.325, 82.707], "b": [177.156, 80.461]}]}, {"id": 68, "ring": [[178.503, 89.36], [177.156, 80.461], [162.325, 82.707], [163.672, 91.606]], "centroid": [170.414, 86.034], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [178.503, 89.36], "b": [177.156, 80.461]}, {"label": "15.00", "val": 15, "a": [177.156, 80.461], "b": [162.325, 82.707]}, {"label": "9.00", "val": 9, "a": [162.325, 82.707], "b": [163.672, 91.606]}, {"label": "15.00", "val": 15, "a": [163.672, 91.606], "b": [178.503, 89.36]}]}, {"id": 69, "ring": [[179.851, 98.259], [178.503, 89.36], [163.672, 91.606], [165.02, 100.504]], "centroid": [171.762, 94.932], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/9", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [179.851, 98.259], "b": [178.503, 89.36]}, {"label": "15.00", "val": 15, "a": [178.503, 89.36], "b": [163.672, 91.606]}, {"label": "9.00", "val": 9, "a": [163.672, 91.606], "b": [165.02, 100.504]}, {"label": "15.00", "val": 15, "a": [165.02, 100.504], "b": [179.851, 98.259]}]}, {"id": 70, "ring": [[182.817, 117.848], [179.851, 98.259], [165.02, 100.504], [165.958, 106.702]], "centroid": [178.181, 112.275], "sqm": 195.6, "sqft": 2105.5, "sqyd": 233.9, "std": false, "survey": "157/9", "size": "15.00 × 19.81", "dims": ["19.81", "15.00", "6.27", "20.21"], "face": "NW", "edges": [{"label": "19.81", "val": 19.81, "a": [182.817, 117.848], "b": [179.851, 98.259]}, {"label": "15.00", "val": 15, "a": [179.851, 98.259], "b": [165.02, 100.504]}, {"label": "6.27", "val": 6.27, "a": [165.02, 100.504], "b": [165.958, 106.702]}, {"label": "20.21", "val": 20.21, "a": [165.958, 106.702], "b": [182.817, 117.848]}]}, {"id": 71, "ring": [[149.928, 0.848], [137.849, 1.227], [139.68, 13.316], [151.544, 11.519]], "centroid": [144.697, 6.373], "sqm": 138.1, "sqft": 1486.6, "sqyd": 165.2, "std": false, "survey": "157/10", "size": "12.00 × 12.23", "dims": ["12.08", "12.23", "12.00", "10.79"], "face": "W", "edges": [{"label": "12.08", "val": 12.08, "a": [149.928, 0.848], "b": [137.849, 1.227]}, {"label": "12.23", "val": 12.23, "a": [137.849, 1.227], "b": [139.68, 13.316]}, {"label": "12.00", "val": 12, "a": [139.68, 13.316], "b": [151.544, 11.519]}, {"label": "10.79", "val": 10.79, "a": [151.544, 11.519], "b": [149.928, 0.848]}]}, {"id": 72, "ring": [[139.68, 13.316], [141.027, 22.214], [152.892, 20.418], [151.544, 11.519]], "centroid": [146.286, 16.867], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [139.68, 13.316], "b": [141.027, 22.214]}, {"label": "12.00", "val": 12, "a": [141.027, 22.214], "b": [152.892, 20.418]}, {"label": "9.00", "val": 9, "a": [152.892, 20.418], "b": [151.544, 11.519]}, {"label": "12.00", "val": 12, "a": [151.544, 11.519], "b": [139.68, 13.316]}]}, {"id": 73, "ring": [[141.027, 22.214], [142.375, 31.113], [154.239, 29.316], [152.892, 20.418]], "centroid": [147.633, 25.765], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [141.027, 22.214], "b": [142.375, 31.113]}, {"label": "12.00", "val": 12, "a": [142.375, 31.113], "b": [154.239, 29.316]}, {"label": "9.00", "val": 9, "a": [154.239, 29.316], "b": [152.892, 20.418]}, {"label": "12.00", "val": 12, "a": [152.892, 20.418], "b": [141.027, 22.214]}]}, {"id": 74, "ring": [[142.375, 31.113], [143.722, 40.011], [155.587, 38.215], [154.239, 29.316]], "centroid": [148.981, 34.664], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [142.375, 31.113], "b": [143.722, 40.011]}, {"label": "12.00", "val": 12, "a": [143.722, 40.011], "b": [155.587, 38.215]}, {"label": "9.00", "val": 9, "a": [155.587, 38.215], "b": [154.239, 29.316]}, {"label": "12.00", "val": 12, "a": [154.239, 29.316], "b": [142.375, 31.113]}]}, {"id": 75, "ring": [[143.722, 40.011], [145.07, 48.91], [156.935, 47.113], [155.587, 38.215]], "centroid": [150.328, 43.562], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [143.722, 40.011], "b": [145.07, 48.91]}, {"label": "12.00", "val": 12, "a": [145.07, 48.91], "b": [156.935, 47.113]}, {"label": "9.00", "val": 9, "a": [156.935, 47.113], "b": [155.587, 38.215]}, {"label": "12.00", "val": 12, "a": [155.587, 38.215], "b": [143.722, 40.011]}]}, {"id": 76, "ring": [[145.07, 48.91], [146.417, 57.808], [158.282, 56.012], [156.935, 47.113]], "centroid": [151.676, 52.461], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/10", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [145.07, 48.91], "b": [146.417, 57.808]}, {"label": "12.00", "val": 12, "a": [146.417, 57.808], "b": [158.282, 56.012]}, {"label": "9.00", "val": 9, "a": [158.282, 56.012], "b": [156.935, 47.113]}, {"label": "12.00", "val": 12, "a": [156.935, 47.113], "b": [145.07, 48.91]}]}, {"id": 77, "ring": [[146.417, 57.808], [147.765, 66.707], [159.63, 64.91], [158.282, 56.012]], "centroid": [153.024, 61.359], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [146.417, 57.808], "b": [147.765, 66.707]}, {"label": "12.00", "val": 12, "a": [147.765, 66.707], "b": [159.63, 64.91]}, {"label": "9.00", "val": 9, "a": [159.63, 64.91], "b": [158.282, 56.012]}, {"label": "12.00", "val": 12, "a": [158.282, 56.012], "b": [146.417, 57.808]}]}, {"id": 78, "ring": [[147.765, 66.707], [149.113, 75.606], [160.977, 73.809], [159.63, 64.91]], "centroid": [154.371, 70.258], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [147.765, 66.707], "b": [149.113, 75.606]}, {"label": "12.00", "val": 12, "a": [149.113, 75.606], "b": [160.977, 73.809]}, {"label": "9.00", "val": 9, "a": [160.977, 73.809], "b": [159.63, 64.91]}, {"label": "12.00", "val": 12, "a": [159.63, 64.91], "b": [147.765, 66.707]}]}, {"id": 79, "ring": [[149.113, 75.606], [150.46, 84.504], [162.325, 82.707], [160.977, 73.809]], "centroid": [155.719, 79.156], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [149.113, 75.606], "b": [150.46, 84.504]}, {"label": "12.00", "val": 12, "a": [150.46, 84.504], "b": [162.325, 82.707]}, {"label": "9.00", "val": 9, "a": [162.325, 82.707], "b": [160.977, 73.809]}, {"label": "12.00", "val": 12, "a": [160.977, 73.809], "b": [149.113, 75.606]}]}, {"id": 80, "ring": [[150.46, 84.504], [151.808, 93.403], [163.672, 91.606], [162.325, 82.707]], "centroid": [157.066, 88.055], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/9", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [150.46, 84.504], "b": [151.808, 93.403]}, {"label": "12.00", "val": 12, "a": [151.808, 93.403], "b": [163.672, 91.606]}, {"label": "9.00", "val": 9, "a": [163.672, 91.606], "b": [162.325, 82.707]}, {"label": "12.00", "val": 12, "a": [162.325, 82.707], "b": [150.46, 84.504]}]}, {"id": 81, "ring": [[151.808, 93.403], [152.471, 97.785], [165.958, 106.702], [163.672, 91.606]], "centroid": [162.249, 102.244], "sqm": 118.2, "sqft": 1272.4, "sqyd": 141.4, "std": false, "survey": "157/9", "size": "12.00 × 15.27", "dims": ["4.43", "16.17", "15.27", "12.00"], "face": "NW", "edges": [{"label": "4.43", "val": 4.43, "a": [151.808, 93.403], "b": [152.471, 97.785]}, {"label": "16.17", "val": 16.17, "a": [152.471, 97.785], "b": [165.958, 106.702]}, {"label": "15.27", "val": 15.27, "a": [165.958, 106.702], "b": [163.672, 91.606]}, {"label": "12.00", "val": 12, "a": [163.672, 91.606], "b": [151.808, 93.403]}]}, {"id": 82, "ring": [[81.258, 68.634], [79.907, 60.6], [75.155, 57.459], [64.159, 57.408], [66.466, 71.122]], "centroid": [72.977, 64.617], "sqm": 182.6, "sqft": 1965.1, "sqyd": 218.3, "std": false, "survey": "157/6", "size": "13.91 × 15.00", "dims": ["8.15", "5.70", "11.00", "13.91", "15.00"], "face": "N", "edges": [{"label": "8.15", "val": 8.15, "a": [81.258, 68.634], "b": [79.907, 60.6]}, {"label": "5.70", "val": 5.7, "a": [79.907, 60.6], "b": [75.155, 57.459]}, {"label": "11.00", "val": 11, "a": [75.155, 57.459], "b": [64.159, 57.408]}, {"label": "13.91", "val": 13.91, "a": [64.159, 57.408], "b": [66.466, 71.122]}, {"label": "15.00", "val": 15, "a": [66.466, 71.122], "b": [81.258, 68.634]}]}, {"id": 83, "ring": [[82.751, 77.51], [81.258, 68.634], [66.466, 71.122], [67.959, 79.998]], "centroid": [74.608, 74.316], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/6", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [82.751, 77.51], "b": [81.258, 68.634]}, {"label": "15.00", "val": 15, "a": [81.258, 68.634], "b": [66.466, 71.122]}, {"label": "9.00", "val": 9, "a": [66.466, 71.122], "b": [67.959, 79.998]}, {"label": "15.00", "val": 15, "a": [67.959, 79.998], "b": [82.751, 77.51]}]}, {"id": 84, "ring": [[84.244, 86.385], [82.751, 77.51], [67.959, 79.998], [69.451, 88.873]], "centroid": [76.101, 83.191], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/6", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [84.244, 86.385], "b": [82.751, 77.51]}, {"label": "15.00", "val": 15, "a": [82.751, 77.51], "b": [67.959, 79.998]}, {"label": "9.00", "val": 9, "a": [67.959, 79.998], "b": [69.451, 88.873]}, {"label": "15.00", "val": 15, "a": [69.451, 88.873], "b": [84.244, 86.385]}]}, {"id": 85, "ring": [[85.736, 95.26], [84.244, 86.385], [69.451, 88.873], [70.944, 97.748]], "centroid": [77.594, 92.067], "sqm": 135, "sqft": 1453.1, "sqyd": 161.5, "std": true, "survey": "157/6", "size": "9.00 × 15.00", "dims": ["9.00", "15.00", "9.00", "15.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [85.736, 95.26], "b": [84.244, 86.385]}, {"label": "15.00", "val": 15, "a": [84.244, 86.385], "b": [69.451, 88.873]}, {"label": "9.00", "val": 9, "a": [69.451, 88.873], "b": [70.944, 97.748]}, {"label": "15.00", "val": 15, "a": [70.944, 97.748], "b": [85.736, 95.26]}]}, {"id": 86, "ring": [[72.806, 108.819], [88.06, 109.074], [85.736, 95.26], [70.944, 97.748]], "centroid": [79.48, 103.283], "sqm": 189.3, "sqft": 2037.1, "sqyd": 226.3, "std": false, "survey": "157/6", "size": "14.01 × 15.00", "dims": ["15.26", "14.01", "15.00", "11.23"], "face": "N", "edges": [{"label": "15.26", "val": 15.26, "a": [72.806, 108.819], "b": [88.06, 109.074]}, {"label": "14.01", "val": 14.01, "a": [88.06, 109.074], "b": [85.736, 95.26]}, {"label": "15.00", "val": 15, "a": [85.736, 95.26], "b": [70.944, 97.748]}, {"label": "11.23", "val": 11.23, "a": [70.944, 97.748], "b": [72.806, 108.819]}]}, {"id": 87, "ring": [[45.93, 57.323], [54.181, 73.189], [66.466, 71.122], [64.159, 57.408]], "centroid": [57.426, 64.265], "sqm": 230.9, "sqft": 2485.2, "sqyd": 276.1, "std": false, "survey": "157/6", "size": "17.01 × 17.96", "dims": ["17.88", "12.46", "13.91", "18.23"], "face": "S", "edges": [{"label": "17.88", "val": 17.88, "a": [45.93, 57.323], "b": [54.181, 73.189]}, {"label": "12.46", "val": 12.46, "a": [54.181, 73.189], "b": [66.466, 71.122]}, {"label": "13.91", "val": 13.91, "a": [66.466, 71.122], "b": [64.159, 57.408]}, {"label": "18.23", "val": 18.23, "a": [64.159, 57.408], "b": [45.93, 57.323]}]}, {"id": 88, "ring": [[54.181, 73.189], [54.867, 74.507], [56.125, 81.988], [67.959, 79.998], [66.466, 71.122]], "centroid": [61.413, 77.253], "sqm": 108.3, "sqft": 1166, "sqyd": 129.6, "std": false, "survey": "157/6", "size": "9.00 × 12.46", "dims": ["1.49", "7.59", "12.00", "9.00", "12.46"], "face": "S", "edges": [{"label": "1.49", "val": 1.49, "a": [54.181, 73.189], "b": [54.867, 74.507]}, {"label": "7.59", "val": 7.59, "a": [54.867, 74.507], "b": [56.125, 81.988]}, {"label": "12.00", "val": 12, "a": [56.125, 81.988], "b": [67.959, 79.998]}, {"label": "9.00", "val": 9, "a": [67.959, 79.998], "b": [66.466, 71.122]}, {"label": "12.46", "val": 12.46, "a": [66.466, 71.122], "b": [54.181, 73.189]}]}, {"id": 89, "ring": [[56.125, 81.988], [57.618, 90.863], [69.451, 88.873], [67.959, 79.998]], "centroid": [62.788, 85.431], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/6", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [56.125, 81.988], "b": [57.618, 90.863]}, {"label": "12.00", "val": 12, "a": [57.618, 90.863], "b": [69.451, 88.873]}, {"label": "9.00", "val": 9, "a": [69.451, 88.873], "b": [67.959, 79.998]}, {"label": "12.00", "val": 12, "a": [67.959, 79.998], "b": [56.125, 81.988]}]}, {"id": 90, "ring": [[57.618, 90.863], [59.11, 99.739], [70.944, 97.748], [69.451, 88.873]], "centroid": [64.281, 94.306], "sqm": 108, "sqft": 1162.5, "sqyd": 129.2, "std": true, "survey": "157/6", "size": "9.00 × 12.00", "dims": ["9.00", "12.00", "9.00", "12.00"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [57.618, 90.863], "b": [59.11, 99.739]}, {"label": "12.00", "val": 12, "a": [59.11, 99.739], "b": [70.944, 97.748]}, {"label": "9.00", "val": 9, "a": [70.944, 97.748], "b": [69.451, 88.873]}, {"label": "12.00", "val": 12, "a": [69.451, 88.873], "b": [57.618, 90.863]}]}, {"id": 91, "ring": [[60.603, 108.614], [72.806, 108.819], [70.944, 97.748], [59.11, 99.739]], "centroid": [65.941, 104.176], "sqm": 121.4, "sqft": 1306.2, "sqyd": 145.1, "std": false, "survey": "157/6", "size": "11.23 × 12.00", "dims": ["12.20", "11.23", "12.00", "9.00"], "face": "N", "edges": [{"label": "12.20", "val": 12.2, "a": [60.603, 108.614], "b": [72.806, 108.819]}, {"label": "11.23", "val": 11.23, "a": [72.806, 108.819], "b": [70.944, 97.748]}, {"label": "12.00", "val": 12, "a": [70.944, 97.748], "b": [59.11, 99.739]}, {"label": "9.00", "val": 9, "a": [59.11, 99.739], "b": [60.603, 108.614]}]}, {"id": 92, "ring": [[142.356, 91.098], [139.533, 72.454], [120.441, 75.345], [120.654, 76.75]], "centroid": [136.387, 83.924], "sqm": 195.8, "sqft": 2107.2, "sqyd": 234.1, "std": false, "survey": "157/9", "size": "18.86 × 19.31", "dims": ["18.86", "19.31", "1.42", "26.02"], "face": "NW", "edges": [{"label": "18.86", "val": 18.86, "a": [142.356, 91.098], "b": [139.533, 72.454]}, {"label": "19.31", "val": 19.31, "a": [139.533, 72.454], "b": [120.441, 75.345]}, {"label": "1.42", "val": 1.42, "a": [120.441, 75.345], "b": [120.654, 76.75]}, {"label": "26.02", "val": 26.02, "a": [120.654, 76.75], "b": [142.356, 91.098]}]}, {"id": 93, "ring": [[128.789, 1.511], [119.995, 1.787], [119.226, 11.811], [130.1, 10.164]], "centroid": [124.57, 5.976], "sqm": 92.1, "sqft": 991.3, "sqyd": 110.1, "std": false, "survey": "157/10", "size": "9.80 × 11.00", "dims": ["8.80", "10.05", "11.00", "8.75"], "face": "N", "edges": [{"label": "8.80", "val": 8.8, "a": [128.789, 1.511], "b": [119.995, 1.787]}, {"label": "10.05", "val": 10.05, "a": [119.995, 1.787], "b": [119.226, 11.811]}, {"label": "11.00", "val": 11, "a": [119.226, 11.811], "b": [130.1, 10.164]}, {"label": "8.75", "val": 8.75, "a": [130.1, 10.164], "b": [128.789, 1.511]}]}, {"id": 94, "ring": [[119.226, 11.811], [118.519, 21.02], [131.447, 19.063], [130.1, 10.164]], "centroid": [124.923, 15.437], "sqm": 108.3, "sqft": 1166, "sqyd": 129.6, "std": false, "survey": "157/10", "size": "9.00 × 13.08", "dims": ["9.24", "13.08", "9.00", "11.00"], "face": "N", "edges": [{"label": "9.24", "val": 9.24, "a": [119.226, 11.811], "b": [118.519, 21.02]}, {"label": "13.08", "val": 13.08, "a": [118.519, 21.02], "b": [131.447, 19.063]}, {"label": "9.00", "val": 9, "a": [131.447, 19.063], "b": [130.1, 10.164]}, {"label": "11.00", "val": 11, "a": [130.1, 10.164], "b": [119.226, 11.811]}]}, {"id": 95, "ring": [[118.519, 21.02], [117.812, 30.23], [132.795, 27.961], [131.447, 19.063]], "centroid": [125.261, 24.491], "sqm": 127, "sqft": 1367.3, "sqyd": 151.9, "std": true, "survey": "157/10", "size": "9.00 × 15.15", "dims": ["9.24", "15.15", "9.00", "13.08"], "face": "N", "edges": [{"label": "9.24", "val": 9.24, "a": [118.519, 21.02], "b": [117.812, 30.23]}, {"label": "15.15", "val": 15.15, "a": [117.812, 30.23], "b": [132.795, 27.961]}, {"label": "9.00", "val": 9, "a": [132.795, 27.961], "b": [131.447, 19.063]}, {"label": "13.08", "val": 13.08, "a": [131.447, 19.063], "b": [118.519, 21.02]}]}, {"id": 96, "ring": [[117.812, 30.23], [117.106, 39.44], [134.142, 36.86], [132.795, 27.961]], "centroid": [125.599, 33.545], "sqm": 145.7, "sqft": 1568.6, "sqyd": 174.3, "std": false, "survey": "157/10", "size": "9.00 × 17.23", "dims": ["9.24", "17.23", "9.00", "15.15"], "face": "N", "edges": [{"label": "9.24", "val": 9.24, "a": [117.812, 30.23], "b": [117.106, 39.44]}, {"label": "17.23", "val": 17.23, "a": [117.106, 39.44], "b": [134.142, 36.86]}, {"label": "9.00", "val": 9, "a": [134.142, 36.86], "b": [132.795, 27.961]}, {"label": "15.15", "val": 15.15, "a": [132.795, 27.961], "b": [117.812, 30.23]}]}, {"id": 97, "ring": [[117.106, 39.44], [116.399, 48.649], [135.49, 45.758], [134.142, 36.86]], "centroid": [125.937, 42.599], "sqm": 164.4, "sqft": 1769.9, "sqyd": 196.7, "std": false, "survey": "157/10", "size": "9.00 × 19.31", "dims": ["9.24", "19.31", "9.00", "17.23"], "face": "N", "edges": [{"label": "9.24", "val": 9.24, "a": [117.106, 39.44], "b": [116.399, 48.649]}, {"label": "19.31", "val": 19.31, "a": [116.399, 48.649], "b": [135.49, 45.758]}, {"label": "9.00", "val": 9, "a": [135.49, 45.758], "b": [134.142, 36.86]}, {"label": "17.23", "val": 17.23, "a": [134.142, 36.86], "b": [117.106, 39.44]}]}, {"id": 98, "ring": [[136.838, 54.657], [135.49, 45.758], [116.399, 48.649], [117.746, 57.548]], "centroid": [126.618, 51.653], "sqm": 173.8, "sqft": 1870.6, "sqyd": 207.8, "std": false, "survey": "157/9", "size": "9.00 × 19.31", "dims": ["9.00", "19.31", "9.00", "19.31"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [136.838, 54.657], "b": [135.49, 45.758]}, {"label": "19.31", "val": 19.31, "a": [135.49, 45.758], "b": [116.399, 48.649]}, {"label": "9.00", "val": 9, "a": [116.399, 48.649], "b": [117.746, 57.548]}, {"label": "19.31", "val": 19.31, "a": [117.746, 57.548], "b": [136.838, 54.657]}]}, {"id": 99, "ring": [[138.185, 63.555], [136.838, 54.657], [117.746, 57.548], [119.094, 66.447]], "centroid": [127.966, 60.552], "sqm": 173.8, "sqft": 1870.6, "sqyd": 207.8, "std": false, "survey": "157/9", "size": "9.00 × 19.31", "dims": ["9.00", "19.31", "9.00", "19.31"], "face": "S", "edges": [{"label": "9.00", "val": 9, "a": [138.185, 63.555], "b": [136.838, 54.657]}, {"label": "19.31", "val": 19.31, "a": [136.838, 54.657], "b": [117.746, 57.548]}, {"label": "9.00", "val": 9, "a": [117.746, 57.548], "b": [119.094, 66.447]}, {"label": "19.31", "val": 19.31, "a": [119.094, 66.447], "b": [138.185, 63.555]}]}, {"id": 100, "ring": [[139.533, 72.454], [138.185, 63.555], [119.094, 66.447], [120.441, 75.345]], "centroid": [129.313, 69.45], "sqm": 173.8, "sqft": 1870.6, "sqyd": 207.8, "std": false, "survey": "157/9", "size": "9.00 × 19.31", "dims": ["9.00", "19.31", "9.00", "19.31"], "face": "N", "edges": [{"label": "9.00", "val": 9, "a": [139.533, 72.454], "b": [138.185, 63.555]}, {"label": "19.31", "val": 19.31, "a": [138.185, 63.555], "b": [119.094, 66.447]}, {"label": "9.00", "val": 9, "a": [119.094, 66.447], "b": [120.441, 75.345]}, {"label": "19.31", "val": 19.31, "a": [120.441, 75.345], "b": [139.533, 72.454]}]}, {"id": 101, "ring": [[116.399, 48.649], [107.29, 48.607], [110.539, 70.063], [120.654, 76.75]], "centroid": [113.469, 59.356], "sqm": 225.5, "sqft": 2427.8, "sqyd": 269.8, "std": false, "survey": "157/6", "size": "9.00 × 29.83", "dims": ["9.11", "21.70", "12.13", "28.42"], "face": "E", "edges": [{"label": "9.11", "val": 9.11, "a": [116.399, 48.649], "b": [107.29, 48.607]}, {"label": "21.70", "val": 21.7, "a": [107.29, 48.607], "b": [110.539, 70.063]}, {"label": "12.13", "val": 12.13, "a": [110.539, 70.063], "b": [120.654, 76.75]}, {"label": "28.42", "val": 28.42, "a": [120.654, 76.75], "b": [116.399, 48.649]}]}, {"id": 102, "ring": [[107.29, 48.607], [98.181, 48.565], [100.424, 63.375], [110.539, 70.063]], "centroid": [103.857, 55.991], "sqm": 165.1, "sqft": 1776.6, "sqyd": 197.4, "std": false, "survey": "157/6", "size": "9.00 × 23.11", "dims": ["9.11", "14.98", "12.13", "21.70"], "face": "E", "edges": [{"label": "9.11", "val": 9.11, "a": [107.29, 48.607], "b": [98.181, 48.565]}, {"label": "14.98", "val": 14.98, "a": [98.181, 48.565], "b": [100.424, 63.375]}, {"label": "12.13", "val": 12.13, "a": [100.424, 63.375], "b": [110.539, 70.063]}, {"label": "21.70", "val": 21.7, "a": [110.539, 70.063], "b": [107.29, 48.607]}]}, {"id": 103, "ring": [[98.181, 48.565], [77.88, 48.471], [100.424, 63.375]], "centroid": [94.263, 55.97], "sqm": 150.2, "sqft": 1617, "sqyd": 179.7, "std": false, "survey": "157/6", "size": "11.12 × 27.02", "dims": ["20.30", "27.03", "14.98"], "face": "NW", "edges": [{"label": "20.30", "val": 20.3, "a": [98.181, 48.565], "b": [77.88, 48.471]}, {"label": "27.03", "val": 27.03, "a": [77.88, 48.471], "b": [100.424, 63.375]}, {"label": "14.98", "val": 14.98, "a": [100.424, 63.375], "b": [98.181, 48.565]}]}], "amenities": [{"name": "Kharab", "kind": "kharab", "ring": [[67.564, 48.423], [216.919, 147.166], [216.1, 143.869], [71.762, 48.443]], "sqm": 404.7, "dims": [], "centroid": [141.847, 96.156]}, {"name": "Park", "kind": "park", "ring": [[151.103, 275.155], [147.079, 275.02], [136.887, 274.612], [126.698, 274.135], [116.513, 273.591], [106.331, 272.978], [99.218, 272.503], [96.533, 307.488]], "sqm": 903.4, "dims": [], "centroid": [110.796, 291.321]}, {"name": "Park", "kind": "park", "ring": [[230.182, 181.091], [225.578, 180.146], [220.319, 160.85], [216.919, 147.166], [208.676, 152.887], [205.655, 166.802], [183.596, 186.523], [165.186, 215.551], [168.873, 215.649], [178.671, 215.846], [188.47, 215.977], [196.852, 216.034], [204.388, 204.152]], "sqm": 1817.3, "dims": [], "centroid": [206.889, 183.807]}, {"name": "Park", "kind": "park", "ring": [[17.427, 87.043], [20.944, 107.95], [51.451, 108.461], [46.227, 77.4], [31.069, 48.254], [0, 48.111], [2.247, 57.855]], "sqm": 1927.9, "dims": [], "centroid": [30.979, 82.222]}, {"name": "Park", "kind": "park", "ring": [[223.609, 10.781], [216.426, 10.759], [217.951, 36.314], [224.037, 65.077]], "sqm": 250.8, "dims": [], "centroid": [222.459, 50.695]}], "site": [[216.426, 10.759], [187.826, 10.672], [195.343, 60.306], [220.319, 160.85], [225.578, 180.146], [230.182, 181.091], [204.388, 204.152], [164.327, 267.319], [96.533, 307.488], [103.696, 214.163], [108.823, 147.359], [111.731, 109.471], [103.932, 109.34], [20.944, 107.95], [17.427, 87.043], [2.247, 57.855], [0, 48.111], [109.999, 48.62], [116.399, 48.649], [119.995, 1.787], [176.967, 0], [212.959, 0.781], [223.536, 1.479], [224.037, 65.077], [217.951, 36.314]], "surface": [{"outer": [[165.958, 106.702], [152.471, 97.785], [151.808, 93.403], [150.46, 84.504], [149.113, 75.606], [147.765, 66.707], [146.417, 57.808], [145.07, 48.91], [143.722, 40.011], [142.375, 31.113], [141.027, 22.214], [139.68, 13.316], [137.849, 1.227], [141.595, 1.11], [128.789, 1.511], [130.1, 10.164], [131.447, 19.063], [132.795, 27.961], [134.142, 36.86], [135.49, 45.758], [136.838, 54.657], [138.185, 63.555], [139.533, 72.454], [142.356, 91.098], [120.654, 76.75], [110.539, 70.063], [100.424, 63.375], [77.88, 48.471], [84.556, 48.502], [0, 48.111], [31.069, 48.254], [46.227, 77.4], [51.451, 108.461], [65.056, 108.689], [60.603, 108.614], [59.11, 99.739], [57.618, 90.863], [56.125, 81.988], [54.867, 74.507], [54.181, 73.189], [45.93, 57.323], [64.159, 57.408], [75.155, 57.459], [79.907, 60.6], [81.258, 68.634], [82.751, 77.51], [84.244, 86.385], [85.736, 95.26], [88.06, 109.074], [99.494, 109.266], [97.212, 109.227], [92.897, 83.574], [90.175, 67.389], [109.519, 80.178], [117.027, 85.141], [124.534, 90.105], [132.042, 95.068], [139.549, 100.031], [147.057, 104.995], [154.679, 110.034], [148.529, 120.353], [140.841, 133.252], [132.167, 127.518], [124.659, 122.554], [117.151, 117.591], [111.4, 113.788], [109.415, 139.649], [110.611, 124.056], [125.078, 133.62], [136.228, 140.992], [128.539, 153.891], [122.389, 164.21], [117.776, 171.949], [105.334, 192.825], [107.459, 165.128], [108.247, 154.86], [109.236, 141.975], [108.823, 147.359], [103.696, 214.163], [96.533, 307.488], [99.218, 272.503], [106.331, 272.978], [116.513, 273.591], [126.698, 274.135], [136.887, 274.612], [147.079, 275.02], [151.103, 275.155], [164.327, 267.319], [196.852, 216.034], [188.47, 215.977], [178.671, 215.846], [168.873, 215.649], [165.186, 215.551], [183.596, 186.523], [205.655, 166.802], [208.676, 152.887], [216.919, 147.166], [216.919, 147.166], [67.564, 48.423], [71.762, 48.443], [216.1, 143.869], [216.28, 144.591], [208.465, 113.132], [205.554, 113.856], [211.208, 136.618], [192.933, 124.536], [191.635, 115.964], [190.287, 107.065], [188.939, 98.166], [187.592, 89.268], [186.244, 80.369], [184.897, 71.471], [183.549, 62.572], [182.202, 53.674], [180.854, 44.775], [179.507, 35.877], [178.159, 26.978], [175.684, 10.634], [187.826, 10.672], [216.426, 10.759], [223.609, 10.781], [224.037, 65.077], [223.536, 1.479], [212.959, 0.781], [176.967, 0], [164.175, 0.401], [165.028, 0.375], [166.375, 9.273], [167.723, 18.172], [169.07, 27.07], [170.418, 35.969], [171.765, 44.867], [173.113, 53.766], [174.461, 62.664], [175.808, 71.563], [177.156, 80.461], [178.503, 89.36], [179.851, 98.259], [182.817, 117.848]], "holes": [[[158.186, 192.044], [162.794, 184.313], [167.402, 176.582], [172.01, 168.851], [176.618, 161.12], [181.225, 153.389], [185.833, 145.658], [192.258, 134.879], [202.071, 141.366], [205.773, 152.115], [204.73, 156.921], [202.93, 165.214], [202.184, 165.881], [195.152, 172.167], [188.121, 178.453], [181.285, 184.564], [181.151, 184.777], [176.329, 192.38], [171.507, 199.983], [161.693, 215.457], [144.58, 214.872]], [[103.972, 212.687], [115.471, 193.396], [120.079, 185.665], [124.686, 177.934], [129.294, 170.203], [133.902, 162.472], [138.51, 154.741], [143.118, 147.01], [147.726, 139.279], [152.334, 131.548], [156.942, 123.817], [162.195, 115.003], [172.216, 121.628], [184.742, 129.91], [180.134, 137.641], [175.527, 145.372], [170.919, 153.103], [166.311, 160.833], [161.703, 168.564], [157.095, 176.295], [152.487, 184.026], [147.879, 191.757], [143.271, 199.488], [134.367, 214.428], [117.435, 213.538]]]}], "survey": [{"name": "157/1", "ring": [[103.696, 214.163], [96.533, 307.488], [164.327, 267.319], [204.388, 204.152], [230.182, 181.091], [225.578, 180.146], [220.319, 160.85], [108.823, 147.359]], "sqm": 12191.2}, {"name": "157/10", "ring": [[119.995, 1.787], [116.399, 48.649], [195.343, 60.306], [187.826, 10.672], [216.426, 10.759], [217.951, 36.314], [223.92, 64.525], [224.033, 64.542], [223.536, 1.479], [212.959, 0.781], [176.967, 0]], "sqm": 4500.5}, {"name": "157/6", "ring": [[111.731, 109.471], [116.399, 48.649], [109.999, 48.62], [0, 48.111], [2.247, 57.855], [17.427, 87.043], [20.944, 107.95], [103.932, 109.34]], "sqm": 6168.8}, {"name": "157/9", "ring": [[111.731, 109.471], [108.823, 147.359], [220.319, 160.85], [195.343, 60.306], [116.399, 48.649]], "sqm": 9377.1}], "edge": [], "sline": [], "junc": [], "breaks": [], "ext": [], "lanes": [{"pts": [[73.6, 55.2], [35.2, 50.4]], "w": 9, "id": "r0"}, {"pts": [[150.4, 97.6], [135.2, 4.8]], "w": 9, "id": "r1"}, {"pts": [[187.2, 130.4], [140, 218.4]], "w": 9, "id": "r2"}, {"pts": [[107.2, 203.2], [114.4, 119.2]], "w": 9, "id": "r3"}, {"pts": [[220.8, 4], [177.6, 5.6]], "w": 9, "id": "r4"}, {"pts": [[171.2, 6.4], [185.6, 119.2]], "w": 9, "id": "r5"}, {"pts": [[40.8, 54.4], [54.4, 104.8]], "w": 9, "id": "r6"}, {"pts": [[82.4, 60.8], [91.2, 105.6]], "w": 9, "id": "r7"}, {"pts": [[156.8, 114.4], [141.6, 140]], "w": 9, "id": "r8"}], "plates": [], "meta": {"project": "Proposed Residential Draft Layout — Sy. No. 157/1, 157/6, 157/9, 157/10", "village": "Basavanaganguru", "authority": "Shivamogga Urban Development Authority", "district": "Shivamogga", "state": "Karnataka", "scale": "1:1000", "units": "metres", "sched_sites": 103, "sched_sizes": [["9.00 × 15.00 m", 23], ["9.00 × 12.00 m", 28], ["Odd sites", 52]], "land_use": [["Residential", 15054.75, 49.44], ["Park", 4887.39, 16.05], ["Road", 10510.48, 34.51]], "total_sqm": 30452.62, "site_sqm": 32237.6, "owners": [["157/1", "02-38 G", "00-00", "Sri. Umapathi B.H., S/o Hanumanthappa", "708481 · 08-05-2025"], ["157/6", "01-20 G", "00-01", "Sri. Shivakumar, S/o Basappa", "708485 · 08-05-2025"], ["157/9", "02-10 G", "00-03", "Smt. Gangamma, W/o Late Palakshappa", "708477 · 08-05-2025"], ["157/10", "00-33 G", "00-00", "Sri. H.B. Shekarappa, S/o Hanumanthappa", "708479 · 08-05-2025"]], "total_extent": "07-21 G", "total_kharab": "00-04", "notes": ["Land alienated for residential purpose vide Shimoga Dist. D.C. order noted above.", "Site numbers and actual dimensions will be given at the time of site release.", "Excess area of layout boundary (1,376.23 m²) is reserved in road area except layout road.", "All dimensions are in metres."]}};
const P=DATA.plots, AM=DATA.amenities, SITE=DATA.site, SURF=DATA.surface||[], EDGE=DATA.edge||[], SLINE=DATA.sline||[],
      JUNC=DATA.junc||[], BREAKS=DATA.breaks||[], EXT=DATA.ext||[], LANES=DATA.lanes||[],
      PLATES=DATA.plates||[], SURV=DATA.survey||[], M=DATA.meta;

/* -------------------------------------------------------------
   STATUS — edit to run the board from a sales desk.
   Anything not listed is available.   e.g. {4:'sold', 12:'hold'}
------------------------------------------------------------- */
const STATUS = {
  /* Sales board: every site available. Mark sites here to change status,
     e.g. { 4:'sold', 12:'hold', 30:'reserved' } — anything unlisted is available. */
};
function SLABELt(k){return {available:t('available'),hold:t('on_hold'),reserved:t('reserved'),sold:t('sold')}[k];}
const SLABEL=new Proxy({},{get:(_,k)=>SLABELt(k)});
const SCOL={available:'#3ecfb2',hold:'#f0b458',reserved:'#e2794e',sold:'#b6403f'};
P.forEach(p=>p.status=STATUS[p.id]||'available');

const BANDS=[
  {k:'a',lbl:'Up to 110 m²',col:'#7fd4ff',t:p=>p.sqm<110},
  {k:'b',lbl:'110 – 135 m²',col:'#5fe3c8',t:p=>p.sqm>=110&&p.sqm<135},
  {k:'c',lbl:'135 – 160 m²',col:'#a8e06a',t:p=>p.sqm>=135&&p.sqm<160},
  {k:'d',lbl:'160 m² and above',col:'#f0b458',t:p=>p.sqm>=160}
];
P.forEach(p=>p.band=(BANDS.find(b=>b.t(p))||BANDS[0]).k);

/* ---------- projection: metres -> world (y flipped) ---------- */
let MINX=1e9,MINY=1e9,MAXX=-1e9,MAXY=-1e9;
const grow=([x,y])=>{MINX=Math.min(MINX,x);MAXX=Math.max(MAXX,x);MINY=Math.min(MINY,y);MAXY=Math.max(MAXY,y);};
SITE.forEach(grow); EXT.forEach(e=>e.ring.forEach(grow));
const PAD=5;
const W=(MAXX-MINX)+PAD*2, H=(MAXY-MINY)+PAD*2;
const fx=x=>x-MINX+PAD, fy=y=>(MAXY-y)+PAD;
/* the layout itself, with enough margin to show where the roads connect */
let SX0=1e9,SY0=1e9,SX1=-1e9,SY1=-1e9;
SITE.forEach(([x,y])=>{SX0=Math.min(SX0,x);SX1=Math.max(SX1,x);SY0=Math.min(SY0,y);SY1=Math.max(SY1,y);});
let FM=15, FW=0, FH=0, FX=0, FY=0;
function setFrame(){FM=(window.innerWidth>=1120)?15:7;
  FW=(SX1-SX0)+FM*2; FH=(SY1-SY0)+FM*2; FX=fx(SX0)-FM; FY=fy(SY1)-FM;}
setFrame();
const pt=([x,y])=>fx(x).toFixed(2)+' '+fy(y).toFixed(2);
const path=r=>'M'+r.map(pt).join('L')+'Z';
const line=r=>'M'+r.map(pt).join('L');
const NS='http://www.w3.org/2000/svg';
const el=(t,a)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);return n;};
const $=s=>document.querySelector(s);

const svg=$('#svg'), stage=$('#stage');
const root=el('g',{id:'root'});
const vec=el('g',{id:'vec'}), fxg=el('g',{id:'fx'}), hit=el('g',{id:'hit'});
svg.appendChild(root); root.append(vec,fxg,hit);

const gRoadX=el('g',{}), gRoad=el('g',{}), gEdge=el('g',{mask:'url(#edgemask)'}), gLane=el('g',{mask:'url(#lanemask)'}), gAmen=el('g',{}), gTree=el('g',{}),
      gPad=el('g',{}), gPlot=el('g',{}), gSite=el('g',{}), gTxt=el('g',{});
vec.append(gRoadX,gRoad,gEdge,gLane,gAmen,gTree,gPad,gPlot,gSite,gTxt);
const gSel=el('g',{}), gDim=el('g',{});
fxg.append(gSel,gDim);

/* ---------- every road as a single merged surface ---------- */
SURF.forEach(r=>{
  let d=path(r.outer); (r.holes||[]).forEach(h=>d+=path(h));
  gRoadX.appendChild(el('path',{d,class:'road','fill-rule':'evenodd'}));
  gRoad.appendChild(el('path',{d,class:'kerb','fill-rule':'evenodd'}));
});

/* ---------- lane markings ---------- */
function offsetPoly(pts,d){
  const segs=[];
  for(let i=0;i<pts.length-1;i++){
    const [x1,y1]=pts[i],[x2,y2]=pts[i+1];
    const L=Math.hypot(x2-x1,y2-y1)||1;
    const nx=-(y2-y1)/L*d, ny=(x2-x1)/L*d;
    segs.push([[x1+nx,y1+ny],[x2+nx,y2+ny]]);
  }
  const X=(a,b,c,e)=>{
    const d1=(a[0]-b[0])*(c[1]-e[1])-(a[1]-b[1])*(c[0]-e[0]);
    if(Math.abs(d1)<1e-9)return null;
    const p=a[0]*b[1]-a[1]*b[0], q=c[0]*e[1]-c[1]*e[0];
    return [(p*(c[0]-e[0])-(a[0]-b[0])*q)/d1,(p*(c[1]-e[1])-(a[1]-b[1])*q)/d1];
  };
  const out=[segs[0][0]];
  for(let i=0;i<segs.length-1;i++)
    out.push(X(segs[i][0],segs[i][1],segs[i+1][0],segs[i+1][1])||segs[i][1]);
  out.push(segs[segs.length-1][1]);
  return out;
}
const lmCut=document.getElementById('lm-cut');
const emCut=document.getElementById('em-cut');
const lmJunc=document.getElementById('lm-junc');
JUNC.forEach(r=>lmJunc.appendChild(el('path',{d:path(r)})));
const laneNodes=[];
EDGE.forEach(r=>laneNodes.push(gEdge.appendChild(el('path',{d:line(r)+'Z',class:'lane'}))));
LANES.forEach(L=>{
  if(L.foot)return;                                   // footpaths carry no centre line
  laneNodes.push(gLane.appendChild(el('path',{d:line(L.pts),class:'lane ctr'})));
});

/* ---------- break marks: this road continues beyond the sheet ---------- */
const breakNodes=BREAKS.map(b=>{
  const a=b.a*Math.PI/180, dx=Math.cos(a), dy=Math.sin(a);
  const nx=-dy, ny=dx, w=b.w, k=w*0.17;
  const P4=[[w/2,0],[w/6,0],[w/12,k],[-w/12,-k],[-w/6,0],[-w/2,0]]
    .map(([u,v])=>[b.x+nx*u+dx*v, b.y+ny*u+dy*v]);
  const n=el('path',{d:line(P4),class:'brk'});
  gLane.parentNode.insertBefore(n,gLane.nextSibling);
  return n;
});

/* ---------- amenities ---------- */
const AMFILL={ca:'url(#pat-ca)',park:'url(#pat-park)',stp:'rgba(150,180,210,.40)',
              path:'rgba(156,74,52,.55)',kharab:'rgba(150,190,140,.20)'};
const AMREAL={ca:'#d8c3a6',park:'url(#pat-grass)',stp:'#a9b6c4',path:'url(#pat-brick)',kharab:'url(#pat-rock)'};
const amNodes=[];
AM.forEach((a,i)=>{
  const cls=a.kind==='kharab'?'kharab':'amen';
  const n=el('path',{d:path(a.ring),class:cls,fill:AMFILL[a.kind]});
  n.dataset.am=a.kind; n.dataset.ai=i; gAmen.appendChild(n); amNodes.push([n,a.kind]);
  if(a.kind!=='kharab'){const h=el('path',{d:path(a.ring)});h.dataset.am=a.kind;h.dataset.ai=i;hit.appendChild(h);}
});
/* tree canopies for the realistic view, laid inside the park but clear of the kharab */
(function(){
  const park=AM.find(a=>a.kind==='park'), kh=AM.find(a=>a.kind==='kharab');
  if(!park)return;
  const inside=(pt,ring)=>{let c=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [xi,yi]=ring[i],[xj,yj]=ring[j];
      if((yi>pt[1])!==(yj>pt[1]) && pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)c=!c;
    } return c;};
  let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<70;i++){
    const x=7+rnd()*52, y=12+rnd()*34;
    if(!inside([x,y],park.ring))continue;
    if(kh&&inside([x,y],kh.ring))continue;
    gTree.appendChild(el('circle',{cx:fx(x),cy:fy(y),r:(1.0+rnd()*1.1).toFixed(2),class:'tree'}));
  }
})();

/* ---------- plots ---------- */
const nodes={},hits={};
P.forEach(p=>{
  gPad.appendChild(el('path',{d:path(p.ring),class:'pad'}));
  const n=el('path',{d:path(p.ring),class:'plot'});
  n.dataset.id=p.id; gPlot.appendChild(n); nodes[p.id]=n;
  const h=el('path',{d:path(p.ring)}); h.dataset.id=p.id; hit.appendChild(h); hits[p.id]=h;
});
SLINE.forEach(seg=>gSite.appendChild(el('path',{d:line(seg),fill:'none',class:'site'})));
/* ---------- survey parcels (LEVIT 1) ---------- */
const SURCOL={'157/1':'#7fd4ff','157/6':'#ffd27f','157/9':'#b9a7ff','157/10':'#8fe6a8'};
const gSurv=el('g',{}); gSite.parentNode.insertBefore(gSurv,gSite);
const survNodes=[], survTxt=[];
SURV.forEach(s=>{
  const col=SURCOL[s.name]||'#8ea9b8';
  const n=el('path',{d:path(s.ring),class:'survey',stroke:col,fill:'none'});
  gSurv.appendChild(n); survNodes.push(n);
  const c=(function(r){let a=0,cx=0,cy=0;for(let i=0;i<r.length;i++){const[x1,y1]=r[i],[x2,y2]=r[(i+1)%r.length];const cr=x1*y2-x2*y1;a+=cr;cx+=(x1+x2)*cr;cy+=(y1+y2)*cr;}a*=0.5;return Math.abs(a)<1e-9?[r[0][0],r[0][1]]:[cx/(6*a),cy/(6*a)];})(s.ring);
  const t=el('text',{class:'amenlbl',x:fx(c[0]),y:fy(c[1]),fill:col});
  t.textContent='Sy. '+s.name; t.dataset.f=.7; t.dataset.c=col; t.dataset.cr=col;
  gSurv.appendChild(t); survTxt.push(t);
});
gSurv.style.display='none';
function setSurvey(v){ gSurv.style.display=v?'':'none'; }

/* ---------- map text ---------- */
const txtNum={};
P.forEach(p=>{
  const t=el('text',{class:'pnum',x:fx(p.centroid[0]),y:fy(p.centroid[1])});
  t.textContent=p.id; gTxt.appendChild(t); txtNum[p.id]=t;
});
// colour + relative label size per amenity kind; position = amenity centroid.
const AMSTYLE={ca:{f:.80,c:'#ffbb9a',cr:'#5a2f16'},
               park:{f:.80,c:'#c6ecb6',cr:'#0f2e0c'},
               kharab:{f:.66,c:'#9fd08e',cr:'#1c1a10'},
               stp:{f:.46,c:'#dcebf6',cr:'#0f1a24'},
               path:{f:.46,c:'#f0cbb2',cr:'#4a2416'}};
const amTxt=[];
AM.forEach(a=>{
  const o=AMSTYLE[a.kind]||AMSTYLE.park;
  const c=a.centroid||[0,0];
  // scale the label to the amenity's footprint so big parks read larger
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  a.ring.forEach(([px,py])=>{x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);});
  const span=Math.min(x1-x0,y1-y0);
  const f=Math.max(.42,Math.min(1.0,o.f*(span/26)));
  const t=el('text',{class:'amenlbl',x:fx(c[0]),y:fy(c[1]),fill:o.c});
  t.textContent=a.name.toUpperCase(); t.dataset.f=f; t.dataset.c=o.c; t.dataset.cr=o.cr;
  gTxt.appendChild(t); amTxt.push(t);
});
/* road names: always upright, one size per road class, drawn once */
const RSIZE={r12:2.5, r9:2.0};              // world-metre cap: 12 m road a touch larger
function roadClass(t){ return /12 m/.test(t) ? 'r12' : 'r9'; }
/*__PLATE__*/const plateNodes=PLATES.map(o=>{
  const X=fx(o.x), Y=fy(o.y);
  const t=el('text',{class:'roadlbl',x:X,y:Y});
  // parallel to the road: rotate by the lane angle, in the same space as the map,
  // so it tracks the road at every zoom and stays parallel to the white lines
  if(o.rot) t.setAttribute('transform',\`rotate(\${o.rot} \${X} \${Y})\`);
  t.textContent=o.t.replace(/\s+/g,' ').trim();
  t.dataset.cls=roadClass(o.t);
  t.setAttribute('font-size', RSIZE[roadClass(o.t)]);
  gTxt.appendChild(t);
  return {t,o};
});
cutRoadWindows();
// carve the lane-marking windows once, from the final upright text metrics
function cutRoadWindows(){
  lmCut.textContent=''; emCut.textContent='';
  plateNodes.forEach(({t,o})=>{
    const s=RSIZE[t.dataset.cls];
    const len=t.textContent.length*s*0.62+s*2.2, thick=s*2.1;  // along text / across
    const cx=fx(o.x), cy=fy(o.y);
    const rect=el('rect',{x:cx-len/2,y:cy-thick/2,width:len,height:thick,rx:s*0.3});
    if(o.rot) rect.setAttribute('transform',\`rotate(\${o.rot} \${cx} \${cy})\`);
    const rect2=rect.cloneNode();
    lmCut.appendChild(rect); emCut.appendChild(rect2);
  });
}

/* ---------- dimensions ---------- */
function clearDims(){ gDim.textContent=''; }
function drawDims(p){
  clearDims();
  p.edges.forEach(e=>{
    const ax=fx(e.a[0]),ay=fy(e.a[1]),bx=fx(e.b[0]),by=fy(e.b[1]);
    let mx=(ax+bx)/2,my=(ay+by)/2;
    const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;
    const nx=-dy/L,ny=dx/L;
    const cx=fx(p.centroid[0]),cy=fy(p.centroid[1]);
    const s=((cx-mx)*nx+(cy-my)*ny)>0?-1:1;
    mx+=nx*1.75*s; my+=ny*1.75*s;
    const t=el('text',{class:'dimtxt',x:mx,y:my});
    t.textContent=e.label;
    t.dataset.rot=Math.atan2(dy,dx)*180/Math.PI; t.dataset.x=mx; t.dataset.y=my;
    gDim.appendChild(t);
    gDim.insertBefore(el('line',{class:'dimline',x1:ax,y1:ay,x2:bx,y2:by}),gDim.firstChild);
  });
  sizeText();
}

/* ---------- view ---------- */
let V={k:1,x:0,y:0,r:0}, VW=0, VH=0;
const PIVX=()=>FX+FW/2, PIVY=()=>FY+FH/2;
function resize(){
  VW=stage.clientWidth; VH=stage.clientHeight; setFrame();
  svg.setAttribute('viewBox',\`0 0 \${VW} \${VH}\`);
  fit(false);
}
function apply(){
  root.setAttribute('transform',
    \`translate(\${V.x} \${V.y}) scale(\${V.k}) rotate(\${V.r} \${PIVX()} \${PIVY()})\`);
  if(rose)rose.setAttribute('transform',\`rotate(\${-V.r} 22 22)\`);
  sizeText(); scalebar();
}
function box(){
  const open=detail.classList.contains('show');
  if(VW>=1120){const l=226,r=open?358:232;
    return {x:l,y:104,w:Math.max(140,VW-l-r),h:Math.max(140,VH-160)};}
  const y=140;
  // drawer now covers ~40vh at the bottom; keep the plot in the top ~60vh
  return {x:10,y,w:Math.max(140,VW-20),h:Math.max(130,(open?VH*0.60-y-16:VH-y-80))};
}
function fitK(){
  const b=box();
  const a=Math.abs(V.r*Math.PI/180), c=Math.abs(Math.cos(a)), s=Math.abs(Math.sin(a));
  const rw=FW*c+FH*s, rh=FW*s+FH*c;
  return Math.min(b.w/rw,b.h/rh);
}
/* zoom-out floor: don't let the user zoom out past the whole-layout fit
   (this is what kept showing the tiny map at a 50 m / 100 m scale). */
function minK(){ return fitK()*0.92; }
function fit(anim){
  const b=box();
  const a=Math.abs(V.r*Math.PI/180), c=Math.abs(Math.cos(a)), s=Math.abs(Math.sin(a));
  const rw=FW*c+FH*s, rh=FW*s+FH*c;              // frame turns with the map
  const k=Math.min(b.w/rw,b.h/rh);
  const nx=b.x+b.w/2-PIVX()*k, ny=b.y+b.h/2-PIVY()*k;
  if(anim) glide({k,x:nx,y:ny}); else {V={k,x:nx,y:ny,r:V.r};apply();}
}
function glide(to,ms=520){
  const from={...V}, t0=performance.now(), ease=t=>1-Math.pow(1-t,3);
  (function step(now){
    const t=Math.min(1,(now-t0)/ms), e=ease(t);
    V={k:from.k+(to.k-from.k)*e,x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,r:V.r};
    apply(); if(t<1)requestAnimationFrame(step);
  })(t0);
}
function zoomAt(cx,cy,f){
  const k=Math.max(minK(),Math.min(26,V.k*f));
  V.x=cx-(cx-V.x)*(k/V.k); V.y=cy-(cy-V.y)*(k/V.k); V.k=k; apply();
}
function focusPlot(p){
  const xs=p.ring.map(r=>fx(r[0])), ys=p.ring.map(r=>fy(r[1]));
  const w=Math.max(...xs)-Math.min(...xs), h=Math.max(...ys)-Math.min(...ys);
  const b=box(), target=VW>980?0.44:0.46;
  const k=Math.min(b.w*target/w, b.h*target/h);
  const kk=VW>980?Math.max(V.k,Math.max(3.2,Math.min(k,11))):Math.max(1.8,Math.min(k,8));
  const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2;
  const a=V.r*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), px=PIVX(), py=PIVY();
  const rx=px+(cx-px)*ca-(cy-py)*sa, ry=py+(cx-px)*sa+(cy-py)*ca;
  // on mobile, nudge the site up ~5% of viewport so it stays fully clear of the drawer
  const upBias = (VW<1120 && detail.classList.contains('show')) ? VH*0.05 : 0;
  glide({k:kk,x:b.x+b.w/2-rx*kk, y:b.y+b.h/2-ry*kk-upBias});
}

let lastR=null;
function sizeText(){
  const k=V.k, spun=lastR!==V.r; lastR=V.r;
  const num=Math.min(3.6,Math.max(1.05,13/k));
  for(const id in txtNum){
    const t=txtNum[id];
    t.setAttribute('font-size',num);
    t.style.display=TG.lbl?'':'none';
    // site numbers stay upright however far the map is turned
    if(spun)t.setAttribute('transform',\`rotate(\${-V.r} \${t.getAttribute('x')} \${t.getAttribute('y')})\`);
  }
  amTxt.forEach(t=>{
    const f=+t.dataset.f, s=Math.min(4.2*f,Math.max(1.25*f,15*f/k));
    t.setAttribute('font-size',s);
    t.setAttribute('fill', document.body.classList.contains('lit')?t.dataset.cr:t.dataset.c);
    if(spun){
      const base=t.dataset.r?+t.dataset.r:0;
      t.setAttribute('transform',\`rotate(\${base-V.r} \${t.getAttribute('x')} \${t.getAttribute('y')})\`);
    }
  });
  // road labels are fixed-size with baked rotation & one-time mask windows — only toggle visibility by zoom
  const showRoad = k>1.15 && k<22;   // responsive but capped both ways
  plateNodes.forEach(({t})=>{ t.style.display = showRoad ? '' : 'none'; });
  const lw=Math.min(.5,Math.max(.16,2.2/k));
  laneNodes.forEach(n=>{n.setAttribute('stroke-width',lw); n.style.display=k>1.9?'':'none';});
  const bw=Math.min(.55,Math.max(.2,2.6/k));
  breakNodes.forEach(n=>n.setAttribute('stroke-width',bw));
  const dm=Math.min(2.3,Math.max(.62,7.6/k));
  gDim.querySelectorAll('text').forEach(t=>{
    t.setAttribute('font-size',dm); t.setAttribute('stroke-width',dm*.16);
    let r=+t.dataset.rot;                    // keep side lengths reading left to right
    while(r+V.r>90)r-=180; while(r+V.r<-90)r+=180;
    t.setAttribute('transform',\`rotate(\${r} \${t.dataset.x} \${t.dataset.y})\`);
  });
}
function scalebar(){
  const m=[5,10,20,25,50,100].find(t=>t*V.k>=64)||100;
  $('#sbline').style.width=(m*V.k).toFixed(0)+'px';
  $('#sblabel').textContent=m+' m';
}

/* ---------- pan / zoom ---------- */
let drag=null, moved=0;
const touches=new Map();
let pinch=null;
/* pan momentum */
let vel={x:0,y:0}, lastMove=0, glideRAF=null;
function stopGlide(){if(glideRAF){cancelAnimationFrame(glideRAF);glideRAF=null;}}
function startGlide(){
  stopGlide();
  const decay=0.92;                          // per-frame friction
  (function step(){
    vel.x*=decay; vel.y*=decay;
    if(Math.hypot(vel.x,vel.y)<0.04){glideRAF=null;stage.classList.remove('drag');return;}
    V.x+=vel.x; V.y+=vel.y; apply();
    glideRAF=requestAnimationFrame(step);
  })();
}
stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('.glass'))return;
  stopGlide(); vel={x:0,y:0};
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{stage.setPointerCapture(e.pointerId);}catch(_){}
  if(touches.size===1){
    drag={x:e.clientX,y:e.clientY,vx:V.x,vy:V.y}; moved=0; lastMove=performance.now();
    stage.classList.add('drag');
  }else{
    drag=null; pinch=null;                    // second finger: hand over to pinch
  }
});
stage.addEventListener('pointermove',e=>{
  if(touches.has(e.pointerId)) touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===2){
    const [a,b]=[...touches.values()];
    const r=stage.getBoundingClientRect();
    const d=Math.hypot(a.x-b.x,a.y-b.y), cx=(a.x+b.x)/2-r.left, cy=(a.y+b.y)/2-r.top;
    if(pinch){
      smoothZoom(cx,cy,d/pinch.d,true);
      V.x+=cx-pinch.cx; V.y+=cy-pinch.cy; apply();
    }
    pinch={d,cx,cy}; moved=99; vel={x:0,y:0};
    return;
  }
  if(drag){
    const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
    moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));
    const now=performance.now(), dt=Math.max(8,now-lastMove);
    /* smoothed velocity in px/frame (~16ms) */
    vel.x=0.6*vel.x + 0.4*(e.movementX!==undefined?e.movementX:dx)*(16/dt);
    vel.y=0.6*vel.y + 0.4*(e.movementY!==undefined?e.movementY:dy)*(16/dt);
    lastMove=now;
    V.x=drag.vx+dx; V.y=drag.vy+dy; apply();
  } else hover(e);
});
function endPointer(e){
  touches.delete(e.pointerId);
  if(touches.size<2)pinch=null;
  if(touches.size===1){
    const [p]=[...touches.values()];
    drag={x:p.x,y:p.y,vx:V.x,vy:V.y};        // continue panning with the finger left
  }else if(touches.size===0){
    drag=null;
    /* release with a flick → glide to a stop */
    if(moved>4 && Math.hypot(vel.x,vel.y)>0.6 && performance.now()-lastMove<90){
      startGlide();
    }else{
      stage.classList.remove('drag');
    }
  }
}
stage.addEventListener('pointerup',endPointer);
stage.addEventListener('pointercancel',endPointer);
addEventListener('pointerup',()=>{if(touches.size===0){drag=null;stage.classList.remove('drag');}});
let zTarget=null, zRAF=0;
// wheel/pinch zoom applies immediately (no lag); button zoom gets a short ease
function smoothZoom(cx,cy,f,instant){
  const k=Math.max(minK(),Math.min(26,(zTarget?zTarget.k:V.k)*f));
  if(instant){ zTarget=null; cancelAnimationFrame(zRAF);
    V.x=cx-(cx-V.x)*(k/V.k); V.y=cy-(cy-V.y)*(k/V.k); V.k=k; apply(); return; }
  zTarget={k,cx,cy};
  if(!zRAF) zRAF=requestAnimationFrame(zStep);
}
function zStep(){
  zRAF=0; if(!zTarget)return;
  const nk=V.k+(zTarget.k-V.k)*0.55;                 // snappier settle, ~3 frames
  V.x=zTarget.cx-(zTarget.cx-V.x)*(nk/V.k);
  V.y=zTarget.cy-(zTarget.cy-V.y)*(nk/V.k);
  V.k=nk; apply();
  if(Math.abs(zTarget.k-V.k)/V.k>0.006) zRAF=requestAnimationFrame(zStep);
  else { V.k=zTarget.k; apply(); zTarget=null; }
}
stage.addEventListener('wheel',e=>{e.preventDefault();
  const r=stage.getBoundingClientRect();
  smoothZoom(e.clientX-r.left, e.clientY-r.top, e.deltaY<0?1.16:1/1.16, true);},{passive:false});
$('#b-in').onclick=()=>smoothZoom(VW/2,VH/2,1.5);
$('#b-out').onclick=()=>smoothZoom(VW/2,VH/2,1/1.5);
$('#b-out').onclick=()=>smoothZoom(VW/2,VH/2,1/1.5);
$('#b-fit').onclick=()=>{clear(false);fit(true);};



/* ===== smart search (sites · amenities · measurements) ===== */
const searchov=$('#searchov'), sovinput=$('#sovinput'), sovresults=$('#sovresults');
// build a lightweight index once
const SEARCH_INDEX=(function(){
  const idx=[];
  // sites
  DATA.plots.forEach(p=>{
    const st=STATUS[p.id]||'available';
    idx.push({type:'site', id:p.id, title:'Site '+p.id,
      sub:\`\${p.sqm.toFixed(0)} m² · \${p.dims.join(' × ')} m · \${p.face} facing\`,
      keywords:('site '+p.id+' '+p.sqm+' '+p.sqft+' '+p.dims.join(' ')+' '+p.face+' '+st).toLowerCase()});
  });
  // amenities
  DATA.amenities.forEach((a,i)=>{
    const nm=a.name||({ca:'Civic Amenity',park:'Park',kharab:'Kharab',stp:'S.T.P.',path:'Pathway'}[a.kind]);
    idx.push({type:'amen', kind:a.kind, ref:'am'+i, title:nm,
      sub:\`\${a.sqm.toFixed(0)} m²\`,
      keywords:(nm+' '+a.name+' '+a.kind+' amenity park '+a.sqm).toLowerCase()});
  });
  // measurement quick-answers: unique dimension values across sites
  const dimSet=new Set();
  DATA.plots.forEach(p=>p.dims.forEach(d=>dimSet.add(d)));
  [...dimSet].sort((x,y)=>parseFloat(x)-parseFloat(y)).forEach(d=>{
    const sites=DATA.plots.filter(p=>p.dims.includes(d)).map(p=>p.id);
    idx.push({type:'meas', dim:d, sites, title:d+' m side',
      sub:\`On \${sites.length} site\${sites.length>1?'s':''}: \${sites.slice(0,8).join(', ')}\${sites.length>8?'…':''}\`,
      keywords:(d+' m metre meter measurement dimension side length').toLowerCase()});
  });
  return idx;
})();

const ICO={
  site:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M9 20V9h11"/></svg>',
  amen:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>',
  meas:'<svg viewBox="0 0 24 24"><path d="M3 7h18v10H3zM7 7v3M11 7v4M15 7v3M19 7v4"/></svg>'
};
const CAT={site:'Sites', amen:'Amenities', meas:'Measurements'};

function openSearch(v){
  searchov.classList.toggle('show',v);
  if(v){ sovinput.value=''; runSearch(''); setTimeout(()=>sovinput.focus(),120); }
}
function runSearch(q){
  q=(q||'').trim().toLowerCase();
  let hits = q ? SEARCH_INDEX.filter(it=>it.keywords.includes(q)) : SEARCH_INDEX.slice();
  // rank: exact site number first
  if(/^\d+$/.test(q)){ hits.sort((a,b)=>(a.type==='site'&&a.id==+q?-1:0)-(b.type==='site'&&b.id==+q?-1:0)); }
  hits = hits.slice(0,40);
  if(!hits.length){ sovresults.innerHTML='<div class="sovempty">No matches. Try a site number, amenity, or a measurement like “9.00”.</div>'; return; }
  // group by type
  const groups={site:[],amen:[],meas:[]};
  hits.forEach(h=>groups[h.type].push(h));
  let html='';
  ['site','amen','meas'].forEach(tp=>{
    if(!groups[tp].length)return;
    html+=\`<div class="sovcat">\${CAT[tp]}</div>\`;
    groups[tp].forEach((h,i)=>{
      html+=\`<div class="sovitem" data-type="\${h.type}" data-ref="\${h.id||h.ref||h.dim}">\`
        +\`<div class="sovico \${tp}">\${ICO[tp]}</div>\`
        +\`<div class="sovtxt"><b>\${h.title}</b><small>\${h.sub}</small></div></div>\`;
    });
  });
  sovresults.innerHTML=html;
  sovresults.querySelectorAll('.sovitem').forEach(el=>{
    el.onclick=()=>navResult(el.dataset.type, el.dataset.ref);
  });
}
function navResult(type,ref){
  openSearch(false);
  if(type==='site'){ select(+ref); }
  else if(type==='amen'){
    const i=+String(ref).replace('am',''); const a=DATA.amenities[i];
    if(a){ toast(\`\${a.name} · \${a.sqm.toFixed(0)} m²\`); }
  }
  else if(type==='meas'){
    // jump to the first site carrying that measurement
    const it=SEARCH_INDEX.find(x=>x.type==='meas'&&x.dim===ref);
    if(it&&it.sites.length){ select(it.sites[0]); toast(\`\${ref} m side · sites \${it.sites.join(', ')}\`); }
  }
}
$('#searchtrigger').addEventListener('click',()=>openSearch(true));
$('#searchtrigger').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSearch(true);}});
$('#sovclose').addEventListener('click',()=>openSearch(false));
$('#sov-scrim').addEventListener('click',()=>openSearch(false));
sovinput.addEventListener('input',()=>runSearch(sovinput.value));
sovinput.addEventListener('keydown',e=>{
  if(e.key==='Escape'){openSearch(false);}
  if(e.key==='Enter'){ const first=sovresults.querySelector('.sovitem'); if(first)first.click(); }
});

/* settings gear + in-app language switch */
(function(){
  const gear=$('#gear'), pop=$('#gearpop');
  function openGear(v){
    pop.classList.toggle('show',v); gear.classList.toggle('on',v);
    gear.setAttribute('aria-expanded',v);
    if(v){ document.querySelectorAll('.gplang').forEach(b=>b.classList.toggle('on',b.dataset.lang===LANG)); }
  }
  gear.addEventListener('click',e=>{e.stopPropagation();openGear(!pop.classList.contains('show'));});
  gear.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();gear.click();}});
  document.querySelectorAll('.gplang').forEach(btn=>{
    btn.addEventListener('click',()=>{ applyLang(btn.dataset.lang); openGear(false); });
  });
  document.addEventListener('click',e=>{ if(!e.target.closest('#gearpop')&&!e.target.closest('#gear'))openGear(false); });
})();

/* + cluster (mobile) */
function panBy(dx,dy){ V.x+=dx; V.y+=dy; apply(); }
(function(){
  const step=()=>Math.max(60, VW*0.22);
  const b=(id,fn)=>{const n=$(id); if(n){n.onclick=fn; n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});}};
  b('#p-in',  ()=>smoothZoom(VW/2,VH/2,1.5));
  b('#p-out', ()=>smoothZoom(VW/2,VH/2,1/1.5));
  b('#p-left',()=>panBy(step(),0));
  b('#p-right',()=>panBy(-step(),0));
  b('#p-fit', ()=>{clear(false);fit(true);});
})();


/* ---------- hover ---------- */
const tip=$('#tip');
let hoverNode=null, hoverId=null;
function outline(p,cls){const n=el('path',{d:path(p.ring),class:cls});gSel.appendChild(n);return n;}
function setHover(id){
  if(hoverId===id)return; hoverId=id;
  if(hoverNode){hoverNode.remove();hoverNode=null;}
  if(id&&id!==sel){const p=P.find(x=>x.id===id); if(p)hoverNode=outline(p,'hovhi');}
}
function amAt(t){ if(!t||!t.dataset)return null;
  if(t.dataset.ai!=null)return AM[+t.dataset.ai];
  if(t.dataset.am)return AM.find(x=>x.kind===t.dataset.am); return null; }
function hover(e){
  const t=document.elementFromPoint(e.clientX,e.clientY);
  const id=t&&t.dataset&&t.dataset.id, am=t&&t.dataset&&t.dataset.am;
  setHover(id?+id:null);
  if(id){const p=P.find(x=>x.id==+id);
    tip.textContent=\`Site \${p.id} · \${nominal(p)} · \${p.sqm.toFixed(0)} m²\`; place(e);}
  else if(am){const a=amAt(t);
    tip.textContent=\`\${(a&&a.name)||am} · \${a?a.sqm.toFixed(0):''} m²\`; place(e);}
  else tip.classList.remove('show');
}
function place(e){
  tip.classList.add('show');
  tip.style.left=Math.min(VW-tip.offsetWidth-10,Math.max(10,e.clientX+14))+'px';
  tip.style.top=(e.clientY-34)+'px';
}
stage.addEventListener('pointerleave',()=>{tip.classList.remove('show');setHover(null);});

/* ---------- selection ---------- */
const detail=$('#detail'), chip=$('#chip');
let sel=null;
const AMNAME={ca:'Civic Amenity',park:'Park',kharab:'Kharab (unusable land)',stp:'S.T.P.',path:'Pathway'};
stage.addEventListener('click',e=>{
  if(moved>6)return;
  const t=document.elementFromPoint(e.clientX,e.clientY);
  const id=t&&t.dataset&&t.dataset.id;
  const am=t&&t.dataset&&t.dataset.am;
  if(id){select(+id);return;}
  if(am){
    const a=amAt(t);
    toast(\`\${(a&&a.name)||AMNAME[am]||am}\${a?\` · \${a.sqm.toFixed(0)} m²\`:''}\`);
    return;
  }
  if(!e.target.closest('.glass'))clear();
});
function select(id,noZoom){
  const p=P.find(x=>x.id===id); if(!p)return;
  sel=id;
  for(const k in nodes){nodes[k].classList.toggle('dim',+k!==id);}
  gAmen.querySelectorAll('.amen').forEach(n=>n.classList.add('dim'));
  gSel.textContent=''; hoverNode=null; hoverId=null;
  outline(p,'selhi'); drawDims(p);
  fill(p); detail.classList.add('show'); document.body.classList.add('has-detail');
  chip.classList.add('show'); $('#chiptxt').textContent=\`Site \${p.id} · \${p.sqm.toFixed(0)} m²\`;
  $('#hint').style.opacity=0;
  document.querySelectorAll('.tab').forEach((x,i)=>x.classList.toggle('on',i===0));
  document.querySelectorAll('.pane').forEach(x=>x.classList.toggle('on',x.id==='pane-dims'));
  if(!noZoom)requestAnimationFrame(()=>focusPlot(p));
}
function clear(refit){
  sel=null;
  for(const k in nodes)nodes[k].classList.remove('dim');
  gAmen.querySelectorAll('.amen').forEach(n=>n.classList.remove('dim'));
  gSel.textContent=''; hoverNode=null; hoverId=null; clearDims();
  detail.classList.remove('show'); chip.classList.remove('show'); document.body.classList.remove('has-detail');
  if(refit!==false)requestAnimationFrame(()=>fit(true));
}
$('#dclose').onclick=()=>clear();
$('#chipx').onclick=e=>{e.stopPropagation();clear();};
chip.onclick=()=>{const p=P.find(x=>x.id===sel);if(p)focusPlot(p);};

/* ---------- detail panel ---------- */
const FACE={N:['North',-90],NE:['North-east',-45],E:['East',0],SE:['South-east',45],
            S:['South',90],SW:['South-west',135],W:['West',180],NW:['North-west',-135]};
function nominal(p){
  if(p.size) return p.size+' m';           // LEVIT 1 provides the sanctioned nominal size
  const v=p.dims.map(Number).sort((a,b)=>a-b);
  if(v.length<2) return (v[0]||0).toFixed(2)+' m';
  const w=Math.abs(v[0]-v[1])<0.06?v[0].toFixed(2):v[0].toFixed(2)+'–'+v[1].toFixed(2);
  const hi=v.length>=4?[v[2],v[3]]:[v[v.length-2],v[v.length-1]];
  const d=Math.abs(hi[0]-hi[1])<0.06?hi[0].toFixed(2):hi[0].toFixed(2)+'–'+hi[1].toFixed(2);
  return w+' × '+d+' m';
}
function frontRoad(p){ return 'Internal layout road'; }
function fill(p){
  $('#dnumv').textContent=p.id;
  const b=$('#dbadge'); b.textContent=SLABEL[p.status]; b.style.background=SCOL[p.status];
  $('#d-edges').innerHTML=p.edges.map((e,i)=>
    \`<div class="row"><span>Side \${'ABCD'[i]||i+1}</span><b>\${e.label} m</b></div>\`).join('')
    +\`<div class="row"><span>Perimeter</span><b>\${p.edges.reduce((s,e)=>s+e.val,0).toFixed(2)} m</b></div>\`
    +\`<div class="row"><span>Area</span><b>\${p.sqm.toFixed(2)} m²</b></div>\`
    +\`<div class="row"><span>Area (sq ft)</span><b>\${Math.round(p.sqft).toLocaleString('en-IN')} ft²</b></div>\`
    +\`<div class="row"><span>Facing</span><b>\${FACE[p.face][0]} · \${p.face}</b></div>\`;
  $('#shape').innerHTML=shapeSVG(p);
  $('#d-m').textContent=p.sqm.toFixed(2)+' m²';
  $('#d-ft').textContent=p.sqft.toLocaleString('en-IN')+' ft²';
  $('#d-yd').textContent=p.sqyd.toFixed(0)+' yd²';
  $('#d-sh').textContent=nominal(p);
  const s=p.dims.map(Number).sort((a,b)=>a-b);
  $('#d-attrs').innerHTML=[
    ['Survey number','Sy. No. '+p.survey],
    ['Nominal size',p.size?p.size+' m':nominal(p)],
    ['Type',p.std?'Standard site':'Odd site'],
    ['Sides',String(p.ring.length)],
    ['Facing',FACE[p.face][0]+' · '+p.face],
    ['Status',SLABEL[p.status]]
  ].map(([k,v])=>\`<div class="row"><span>\${k}</span><b>\${v}</b></div>\`).join('');
  $('#dnote').innerHTML=\`<b>Site \${p.id}</b> of \${P.length} read from the SUDA draft layout (Sy. No. 157/1, 157/6, 157/9, 157/10). \`+
    \`Provisional number — the sanctioned plan states site numbers and actual dimensions are issued at the time of site release. Areas are computed from the CAD geometry.\`;
  const rowsH=a=>a.map(([k,v])=>\`<div class="row"><span>\${k}</span><b>\${v}</b></div>\`).join('');
  const detected=P.reduce((s,x)=>s+x.sqm,0);
  $('#d-site').innerHTML=
    \`<div class="lgtitle">Land use — as scheduled</div>\`+
    rowsH(M.land_use.map(([n,a,pc])=>[n,a.toLocaleString()+' m² · '+pc+'%']))+
    rowsH([['Total',M.total_sqm.toLocaleString()+' m²']])+
    \`<div class="lgtitle" style="margin-top:12px">Site schedule</div>\`+
    rowsH(M.sched_sizes.map(([n,c])=>[n,c+' sites']))+
    rowsH([['Total',M.sched_sites+' sites']])+
    \`<div class="lgtitle" style="margin-top:12px">Survey numbers</div>\`+
    rowsH(M.owners.map(o=>['Sy. No. '+o[0],o[1]+(o[2]!=='00-00'?' · kharab '+o[2]:'')]))+
    rowsH([['Total extent',M.total_extent+' · kharab '+M.total_kharab]])+
    \`<div class="lgtitle" style="margin-top:12px">Approval</div>\`+
    rowsH([['Authority',M.authority],['Village',M.village],['District',M.district],['State',M.state],['Scale',M.scale],['Units',M.units]])+
    \`<div class="lgtitle" style="margin-top:12px">Read from CAD</div>\`+
    rowsH([['Sites detected',P.length+' / '+M.sched_sites],['Site area',Math.round(detected).toLocaleString()+' m²'],['Survey boundary',Math.round(M.site_sqm).toLocaleString()+' m²']]);
  $('#d-notes').innerHTML='<b>Notes from the plan</b><br>'+M.notes.map((n,i)=>(i+1)+'. '+n).join('<br>');
  /* price disabled for this project (no pricing data) */
}
const RATE=2300;                       // ₹ per sq ft
function inr(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
function priceHTML(p){
  const sqft=p.sqft, total=sqft*RATE;
  return \`<div class="pcalc">
    <div class="pcrow"><span>Plot area</span><b>\${p.sqm.toFixed(2)} m²</b></div>
    <div class="pcrow"><span>Converted to sq ft</span><b>\${Math.round(sqft).toLocaleString('en-IN')} ft²</b></div>
    <div class="pcop">× \${inr(RATE)} per sq ft</div>
    <div class="pcdiv"></div>
    <div class="pctotal">
      <small>Indicative plot price</small>
      <span class="amt">\${inr(total)}</span>
      <span class="amtsub">\${Math.round(sqft).toLocaleString('en-IN')} ft² × \${inr(RATE)}</span>
    </div>
    <div class="pcnote">Calculated as built-up plot area in square feet multiplied by ₹\${RATE.toLocaleString('en-IN')}/sq ft. Indicative only — final price, taxes, registration and other charges are confirmed at the time of booking.</div>
  </div>\`;
}
function shapeSVG(p){
  const xs=p.ring.map(r=>r[0]), ys=p.ring.map(r=>r[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const w=x1-x0||1,h=y1-y0||1, BW=286,BH=176,PADB=40;
  const k=Math.min((BW-PADB*2)/w,(BH-PADB*2)/h);
  const ox=(BW-w*k)/2-x0*k, oy=(BH-h*k)/2+y1*k;
  const X=v=>v*k+ox, Y=v=>oy-v*k;
  const poly=p.ring.map(r=>X(r[0]).toFixed(1)+','+Y(r[1]).toFixed(1)).join(' ');
  let lb='';
  p.edges.forEach(e=>{
    const ax=X(e.a[0]),ay=Y(e.a[1]),bx=X(e.b[0]),by=Y(e.b[1]);
    const mx=(ax+bx)/2,my=(ay+by)/2, dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;
    let nx=-dy/L,ny=dx/L;
    const cx=X(p.centroid[0]),cy=Y(p.centroid[1]);
    if((cx-mx)*nx+(cy-my)*ny>0){nx=-nx;ny=-ny;}
    const lx=mx+nx*15, ly=my+ny*15;
    let r=Math.atan2(dy,dx)*180/Math.PI; if(r>90)r-=180; if(r<-90)r+=180;
    lb+=\`<line class="sh-tick" x1="\${mx.toFixed(1)}" y1="\${my.toFixed(1)}" x2="\${(mx+nx*8).toFixed(1)}" y2="\${(my+ny*8).toFixed(1)}"/>\`
      + \`<text class="sh-lbl" x="\${lx.toFixed(1)}" y="\${ly.toFixed(1)}" transform="rotate(\${r.toFixed(1)} \${lx.toFixed(1)} \${ly.toFixed(1)})">\${e.label} m</text>\`;
  });
  const [fname,fdeg]=FACE[p.face];
  const cx=X(p.centroid[0]), cy=Y(p.centroid[1]);
  const inW=(x1-x0)*k, inH=(y1-y0)*k;                 // room inside the outline
  const a=fdeg*Math.PI/180, ax=Math.cos(a), ay=Math.sin(a);
  const L=Math.min(13,inH*0.20,inW*0.24);
  const ah=L*0.55, ay0=cy-inH*0.13;
  const hx=cx+ax*L, hy=ay0+ay*L, tx=cx-ax*L*0.5, ty=ay0-ay*L*0.5;
  const arrow=\`<g class="sh-face">
      <line x1="\${tx.toFixed(1)}" y1="\${ty.toFixed(1)}" x2="\${hx.toFixed(1)}" y2="\${hy.toFixed(1)}"/>
      <polygon points="\${hx.toFixed(1)},\${hy.toFixed(1)} \${(hx-ax*ah-ay*ah*0.5).toFixed(1)},\${(hy-ay*ah+ax*ah*0.5).toFixed(1)} \${(hx-ax*ah+ay*ah*0.5).toFixed(1)},\${(hy-ay*ah-ax*ah*0.5).toFixed(1)}"/>
    </g>\`;
  // shrink, then wrap, then abbreviate — whatever it takes to sit inside the outline
  const avail=inW*0.84;
  let lines=[fname.toUpperCase()+' FACING'], fs=8.5;
  const wide=(ls,f)=>Math.max(...ls.map(t=>t.length))*f*0.62;
  if(wide(lines,fs)>avail) lines=[fname.toUpperCase(),'FACING'];
  if(wide(lines,fs)>avail) lines=[p.face,'FACING'];
  fs=Math.max(5.6,Math.min(8.5,avail/(Math.max(...lines.map(t=>t.length))*0.62)));
  const fy0=cy+inH*0.14-(lines.length-1)*fs*0.6;
  const ftxt=lines.map((t,i)=>
    \`<text class="sh-face-t" x="\${cx.toFixed(1)}" y="\${(fy0+i*fs*1.15).toFixed(1)}" font-size="\${fs.toFixed(1)}">\${t}</text>\`).join('');
  const cid='clip'+p.id;
  return \`<svg viewBox="0 0 \${BW} \${BH}" role="img" aria-label="Site \${p.id}, \${fname} facing, side lengths">
    <defs><clipPath id="\${cid}"><polygon points="\${poly}"/></clipPath></defs>
    <polygon class="sh-poly" points="\${poly}"/>\${lb}
    <g clip-path="url(#\${cid})">\${arrow}\${ftxt}</g>
    <text class="sh-cap" x="\${BW/2}" y="\${BH-3}">SITE \${p.id} · \${p.sqm.toFixed(2)} m² · METRES</text></svg>\`;
}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));
  document.querySelectorAll('.pane').forEach(x=>x.classList.toggle('on',x.id==='pane-'+t.dataset.p));
});

/* ---------- colouring ---------- */
const OFF=new Set();
function paint(){
  const real=MODE==='realistic';
  const lit=document.body.classList.contains('lit');
  P.forEach(p=>{
    let c;
    if(FILTER!=='all' && p.status===FILTER) c=SCOL[p.status];
    else if(lit) c=PLAIN_LIT;
    else c = COLOUR==='size' ? BANDS.find(b=>b.k===p.band).col
           : COLOUR==='avail' ? SCOL[p.status] : PLAIN;
    nodes[p.id].setAttribute('fill',c);
    txtNum[p.id].setAttribute('fill', lum(c)<0.46 ? '#f2f8f4' : 'var(--maptxt)');
    nodes[p.id].setAttribute('fill-opacity',real?.66:1);
    const on = lit || COLOUR==='plain' || !OFF.has(COLOUR==='size'?p.band:p.status);
    const shown = on && (FILTER==='all' || p.status===FILTER);
    nodes[p.id].classList.toggle('filtered', on && !shown);
    nodes[p.id].style.display=on?'':'none';
    hits[p.id].style.pointerEvents=shown?'':'none';
    txtNum[p.id].style.opacity=shown?1:(on?.18:0);
  });
  amNodes.forEach(([n,k])=>n.setAttribute('fill',(real?AMREAL:AMFILL)[k]));
}
function legend(){
  const lit=document.body.classList.contains('lit');
  if(lit){
    if(FILTER==='all'){
      $('#lgtitle').textContent=t('layout');
      $('#lgrows').innerHTML='<div class="lgrow" style="cursor:default">'
        +'<i class="sw" style="background:'+PLAIN_LIT+'"></i>Sites<span class="lgn">'+P.length+'</span></div>';
    }else{
      $('#lgtitle').textContent=t('layout');
      $('#lgrows').innerHTML='<div class="lgrow" style="cursor:default">'
        +'<i class="sw" style="background:'+SCOL[FILTER]+'"></i>'+SLABEL[FILTER]
        +'<span class="lgn">'+P.filter(p=>p.status===FILTER).length+'</span></div>';
    }
    return;
  }
  if(COLOUR==='plain'){
    $('#lgtitle').textContent=t('layout');
    $('#lgrows').innerHTML='<div class="lgrow" style="cursor:default">'
      +'<i class="sw" style="background:'+PLAIN+'"></i>Sites<span class="lgn">'+P.length+'</span></div>';
    return;
  }
  const rows = COLOUR==='size'
    ? BANDS.map(b=>({k:b.k,lbl:b.lbl,col:b.col,n:P.filter(p=>p.band===b.k).length}))
    : Object.keys(SLABEL).map(k=>({k,lbl:SLABEL[k],col:SCOL[k],n:P.filter(p=>p.status===k).length}));
  $('#lgtitle').textContent=COLOUR==='size'?t('by_size'):t('status');
  $('#lgrows').innerHTML=rows.map(r=>
    \`<div class="lgrow\${OFF.has(r.k)?' off':''}" data-k="\${r.k}" role="button" tabindex="0">
      <i class="sw" style="background:\${r.col}"></i>\${r.lbl}<span class="lgn">\${r.n}</span></div>\`).join('');
  $('#lgrows').querySelectorAll('.lgrow').forEach(n=>n.onclick=()=>{
    const k=n.dataset.k; OFF.has(k)?OFF.delete(k):OFF.add(k); legend(); paint();
  });
}

/* ---------- layers ---------- */
let MODE='realistic';
const lbtn=$('#layerbtn'), lmenu=$('#layermenu');
function sizeMenu(){
  // measure where the menu starts, then cap its height so it ends with a gap
  const top=lmenu.getBoundingClientRect().top;
  const isMobile=window.innerWidth<1120;
  // mobile: leave room above the nav bar; desktop: a medium gap from screen bottom
  const nav=document.querySelector('#nav');
  const floor=isMobile && nav ? nav.getBoundingClientRect().top - 12
                              : window.innerHeight - 28;
  lmenu.style.maxHeight=Math.max(160, floor - top)+'px';
}
function openMenu(v){
  lmenu.classList.toggle('show',v); lbtn.classList.toggle('on',v);
  document.body.classList.toggle('menu-open',v);
  lbtn.setAttribute('aria-expanded',v);
  if(v) requestAnimationFrame(sizeMenu);
}
lbtn.onclick=e=>{e.stopPropagation();openMenu(!lmenu.classList.contains('show'));};
lbtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lbtn.click();}});
addEventListener('click',()=>openMenu(false));
lmenu.onclick=e=>e.stopPropagation();
function setLayer(l){
  if(l==='geomap'){
    toast('GeoMap needs the site georeferenced first — send the latitude and longitude of any two boundary corners and this view will sit on Google Maps.');
    openMenu(false); return;
  }
  MODE=l;
  const active=document.querySelector('.lm[data-l="'+l+'"]');
  document.querySelectorAll('.lm:not(.c):not(.f):not(.t)').forEach(x=>x.classList.toggle('on',x===active));
  if(active)$('#layername').textContent=active.querySelector('b').textContent;
  const real=l==='realistic';
  document.body.classList.toggle('real',real);
  if(real)TG.lit=true;                    // realistic is a daylight view
  if(l==='schematic'){
    TG.lit=false;                         // schematic returns to the dark board
    COLOUR='plain';                       // and defaults to plain blue — colour only on demand
    document.querySelectorAll('.lm.c').forEach(x=>x.classList.toggle('on',x.dataset.c==='plain'));
  }
  document.body.classList.toggle('lit',TG.lit||real);
  $('#tg-lit').classList.toggle('on',TG.lit||real);
  syncColourRows(); legend(); paint(); sizeText(); openMenu(false);
}
document.querySelectorAll('.lm').forEach(n=>n.onclick=()=>setLayer(n.dataset.l));

let FILTER='all';
document.querySelectorAll('.lm.f').forEach(n=>n.onclick=()=>{
  FILTER=n.dataset.f;
  document.querySelectorAll('.lm.f').forEach(x=>x.classList.toggle('on',x===n));
  const dot=$('#ldot');
  dot.classList.toggle('on',FILTER!=='all');
  dot.style.color=SCOL[FILTER]||'var(--txt-mute)';
  if(sel&&FILTER!=='all'&&P.find(p=>p.id===sel).status!==FILTER)clear(false);
  legend(); paint(); openMenu(false);
});

/* ---------- toggles ---------- */
const TG={lbl:true,lit:true,sur:false};
let COLOUR='plain';
const PLAIN='#5aa6d6', PLAIN_LIT='#2f6b3a';
function lum(hex){
  const n=parseInt(hex.slice(1),16);
  return (0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255))/255;
}
function tg(id,key,after){
  const n=$(id); n.onclick=()=>{TG[key]=!TG[key];n.classList.toggle('on',TG[key]);after&&after();};
}
tg('#tg-lbl','lbl',()=>sizeText());
tg('#tg-sur','sur',()=>setSurvey(TG.sur));
document.querySelectorAll('.lm.c').forEach(n=>n.onclick=()=>{
  if(document.body.classList.contains('lit')){
    toast('Daylight always shows sites in green — colour modes apply to the dark schematic.');
    return;
  }
  COLOUR=n.dataset.c;
  document.querySelectorAll('.lm.c').forEach(x=>x.classList.toggle('on',x===n));
  OFF.clear(); legend(); paint(); openMenu(false);
});
function syncColourRows(){
  const lit=document.body.classList.contains('lit');
  document.querySelectorAll('.lm.c').forEach(x=>x.classList.toggle('dis',lit));
}
tg('#tg-lit','lit',()=>{
  // Daylight OFF → drop to the dark schematic board.
  // Daylight ON  → bring back the realistic daylight view.
  setLayer(TG.lit ? 'realistic' : 'schematic');
});

/* ---------- search ---------- */


addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(e.key==='Escape'){if(bookModal.classList.contains('show')){closeBooking();return;}clear();openMenu(false);return;}
  if(e.key==='+'||e.key==='=')smoothZoom(VW/2,VH/2,1.3);
  if(e.key==='-')smoothZoom(VW/2,VH/2,1/1.3);
  if(e.key==='f')fit(true);
});
['b-in','b-out','b-rl','b-rr','b-fit','dclose'].forEach(id=>{
  const n=document.getElementById(id);
  if(n)n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();n.click();}});
});

const rose=document.getElementById('rose'), compass=$('#compass');
function glideR(to,ms=360){
  const from=V.r, t0=performance.now(), ease=t=>1-Math.pow(1-t,3);
  (function step(now){
    const t=Math.min(1,(now-t0)/ms);
    V.r=from+(to-from)*ease(t); apply();
    if(t<1)requestAnimationFrame(step); else {V.r=((to%360)+360)%360===0?0:to; apply();}
  })(t0);
}
compass.addEventListener('click',()=>{
  let r=((V.r%360)+360)%360;                 // take the short way home
  glideR(V.r - (r<=180 ? r : r-360));
});
compass.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();glideR(0);}
});
$('#b-rl').onclick=()=>glideR(V.r-15);
$('#b-rr').onclick=()=>glideR(V.r+15);

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),4200);}

/* ---------- bottom nav: location / contact / details / images / amenities ---------- */
const MAPS_URL='https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw';

const ICONS={
  details:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.01"/>',
  amenities:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 20.6l1-5.8-4.3-4.1 5.9-.9Z"/>',
  images:'<rect x="3.5" y="5" width="17" height="14" rx="2.2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4.5"/>'
};
const tick='<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-12"/></svg>';
// relevant icons per amenity section
const AMICON={
  'a_key':'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>',
  'a_conn':'<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8 16.5 16 7.5"/></svg>',
  'a_edu':'<svg viewBox="0 0 24 24"><path d="M12 4 2.5 9 12 14l9.5-5L12 4Z"/><path d="M6 11v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/></svg>',
  'a_health':'<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke-width="2.4"/></svg>',
  'a_rec':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/></svg>'
};

/* verification details */
// Built from LEVIT 1 real meta. Land-use %s straight from the sanctioned schedule.
const _lu=Object.fromEntries(M.land_use.map(([n,a,pc])=>[n,{a,pc}]));
const _fmt=o=>o?\`\${o.a.toLocaleString()} m² — \${o.pc}%\`:'—';
const DETAILS=[
  ['d_land_type_l','@d_land_type_v'],
  ['d_survey_l','157/1, 157/6, 157/9, 157/10'],
  ['d_location_l','@d_location_v'],
  ['d_authority_l','@d_authority_v'],
  ['d_status_l','@d_status_v'],
  ['d_extent_l',M.total_extent],
  ['d_kharab_l','@d_kharab_v'],
  ['d_totalsites_l','@d_totalsites_v'],
  ['d_resarea_l',_fmt(_lu['Residential'])],
  ['d_park_l',_fmt(_lu['Park'])],
  ['d_roadarea_l',_fmt(_lu['Road'])],
  ['d_totalarea_l',M.total_sqm.toLocaleString()+' m² — 100%'],
  ['d_roads_l','@d_roads_v'],
  ['d_dims_l','@d_dims_v'],
  ['d_village_l',M.village],
  ['d_district_l',M.district],
  ['d_state_l',M.state],
  ['d_scale_l',M.scale],
  ['d_units_l',M.units]
];

/* amenities — grouped (keys resolve via t()) */
const AMEN=[
  ['a_key',['a_key_1','a_key_2','a_key_3','a_key_4']],
  ['a_conn',['a_conn_1','a_conn_2','a_conn_3','a_conn_4']],
  ['a_edu',['a_edu_1','a_edu_2','a_edu_3','a_edu_4']],
  ['a_health',['a_health_1','a_health_2']],
  ['a_rec',['a_rec_1']]
];

const modal=$('#modal');
// resolve a stored value: '@key' → t(key); otherwise literal stays as-is
function resolveVal(v){ return (typeof v==='string' && v[0]==='@') ? t(v.slice(1)) : v; }
let modalKind=null;
function renderModalBody(kind){
  let ttl,kick,body;
  if(kind==='details'){
    kick=t('details_kick'); ttl=t('details_title');
    body=DETAILS.map(([k,v])=>\`<div class="mrow"><div class="k">\${t(k)}</div><div class="v">\${resolveVal(v)}</div></div>\`).join('');
  }else if(kind==='amenities'){
    kick=t('amen_kick'); ttl=t('amen_title');
    body=AMEN.map(([sec,items])=>
      \`<div class="msec"><span class="mseci">\${AMICON[sec]||''}</span>\${t(sec)}</div>\`+
      items.map(k=>\`<div class="mli">\${tick}<div>\${t(k)}</div></div>\`).join('')
    ).join('');
  }else{ // images
    kick=t('images_kick'); ttl=t('images_title');
    body='<div class="mempty"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2.2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4.5"/></svg><div>'+t('images_soon')+'</div></div>';
  }
  $('#mkick').textContent=kick;
  $('#mttltxt').textContent=ttl;
  $('#micosvg').innerHTML=ICONS[kind];
  $('#mbody').innerHTML=body;
}
function openModal(kind){
  modalKind=kind;
  renderModalBody(kind);
  $('#mbody').scrollTop=0;
  modal.classList.add('show');
}
function closeModal(){modal.classList.remove('show'); modalKind=null;}
$('#mclose').onclick=closeModal;
$('#mscrim').onclick=closeModal;
$('#mclose').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeModal();}});

/* contact popover */
const cpop=$('#contactpop');
const PHONE='+919980061727', PHONE_DISP='+91 99800 61727';
function openContact(v){cpop.classList.toggle('show',v);
  document.querySelector('.nv[data-nav="contact"]').classList.toggle('on',v);}
document.addEventListener('click',e=>{
  if(!e.target.closest('#contactpop')&&!e.target.closest('.nv[data-nav="contact"]'))openContact(false);
});
function isMobile(){return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);}
$('#cp-call').addEventListener('click',e=>{
  e.preventDefault(); e.stopPropagation();
  openContact(false);
  if(isMobile()){ window.location.href='tel:'+PHONE; }
  else{
    // no dialer on desktop — copy the number and let the user know
    if(navigator.clipboard) navigator.clipboard.writeText(PHONE_DISP).catch(()=>{});
    toast('Call '+PHONE_DISP+'  ·  number copied to clipboard');
  }
});
$('#cp-wa').addEventListener('click',e=>{
  e.preventDefault(); e.stopPropagation();
  openContact(false);
  const msg=encodeURIComponent('Hi, I\'m interested in the Basavanaganguru layout (Sy. No. 157/1, 157/6, 157/9, 157/10). Please share the details.');
  window.open('https://wa.me/919980061727?text='+msg,'_blank','noopener');
});

/* location confirm dialog */
const confirmEl=$('#confirm');
function openLocationConfirm(){confirmEl.classList.add('show');}
function closeLocationConfirm(){confirmEl.classList.remove('show');}
$('#cfscrim').onclick=closeLocationConfirm;
$('#cfno').onclick=closeLocationConfirm;
$('#cfyes').onclick=()=>{closeLocationConfirm();window.open(MAPS_URL,'_blank','noopener');};

function navAction(kind){
  if(kind!=='contact')openContact(false);
  if(kind==='location'){openLocationConfirm();return;}
  if(kind==='contact'){openContact(!cpop.classList.contains('show'));return;}
  openModal(kind);
}
document.querySelectorAll('.nv').forEach(n=>{
  n.addEventListener('click',e=>{e.stopPropagation();navAction(n.dataset.nav);});
  n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navAction(n.dataset.nav);}});
});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();openContact(false);closeLocationConfirm();openShare(false);}});


/* MapIQ badge */
const miq=$('#miq');
miq.addEventListener('click',e=>{
  if(e.target.id==='miqlink')return;
  const f=!miq.classList.contains('flip');
  miq.classList.toggle('flip',f);
  miq.setAttribute('aria-pressed',f);
});
miq.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();miq.click();}
});
$('#miqlink').addEventListener('click',e=>{
  e.stopPropagation();
  toast('MapIQ — website on its way. Interactive maps for your layout.');
});
$('#miqlink').addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.stopPropagation();$('#miqlink').click();}
});


/* ---------- share ---------- */
const SHARE_LINK='';                      // paste the hosted URL here once live
const sharebtn=$('#sharebtn'), sharepop=$('#sharepop');
let shareSite=null;
function openShare(v,site){
  shareSite=site||null;
  if(v){
    $('#sptitle').textContent=shareSite?('Share site '+shareSite):'Share this map';
    $('#spsub').textContent=shareSite?('Send site '+shareSite+' to any chat'):'Send to any chat';
    const r=(shareSite?$('#dshare'):sharebtn).getBoundingClientRect();
    sharepop.style.position='fixed';
    sharepop.style.top=(r.bottom+8)+'px';
    sharepop.style.right=Math.max(10,innerWidth-r.right)+'px';
  }
  sharepop.classList.toggle('show',v);
  sharebtn.classList.toggle('on',v&&!shareSite);
  sharebtn.setAttribute('aria-expanded',v&&!shareSite);
}
sharebtn.addEventListener('click',e=>{e.stopPropagation();openShare(!sharepop.classList.contains('show'),null);});
$('#dshare').addEventListener('click',e=>{e.stopPropagation();openShare(true,sel);});
['#sharebtn','#dshare'].forEach(id=>$(id).addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();$(id).click();}}));
$('#sp-wa').addEventListener('click',e=>{
  e.stopPropagation();
  const msg=shareSite
    ? 'Hey, have a look at this plot number '+shareSite+' at Basavanaganguru'
    : 'Hey, look at this interactive map of Basavanaganguru (SUDA layout)';
  openShare(false);
  const text=SHARE_LINK?msg+' '+SHARE_LINK:msg;
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');
});
$('#sp-wa').addEventListener('keydown',e=>{if(e.key==='Enter'){$('#sp-wa').click();}});
document.addEventListener('click',e=>{
  if(!e.target.closest('#sharepop')&&!e.target.closest('#sharebtn')&&!e.target.closest('#dshare'))openShare(false);
});

/* ---------- boot ---------- */
$('#s-tot').textContent=P.length;
$('#s-avl').textContent=P.filter(p=>p.status==='available').length;
$('#s-area').textContent=P.reduce((s,p)=>s+p.sqm,0).toFixed(0);

/* liquid-glass click ripple on interactive glass elements */
(function(){
  const sel='.tbtn,#layerbtn,#sharebtn,#gear,#compass,#miq,.nv,.sw2,.lm,#b-fit';
  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest(sel);
    if(!el)return;
    if(getComputedStyle(el).position==='static')el.style.position='relative';
    if(getComputedStyle(el).overflow!=='hidden')el.style.overflow='hidden';
    const r=el.getBoundingClientRect();
    const d=Math.max(r.width,r.height)*1.1;
    const rp=document.createElement('span');
    rp.className='ripple';
    rp.style.width=rp.style.height=d+'px';
    rp.style.left=(e.clientX-r.left-d/2)+'px';
    rp.style.top=(e.clientY-r.top-d/2)+'px';
    el.appendChild(rp);
    setTimeout(()=>rp.remove(),520);
  },{passive:true});
})();




/* re-apply language to dynamically generated bits */
function relabelDynamic(){
  // booking chip/titles if the modal is open
  if(typeof bookModal!=='undefined' && bookModal.classList.contains('show')){
    const chip=$('#bsitechip');
    if(bookSite){
      $('#bsitetext').textContent=t('site')+' '+bookSite+' \u00b7 '+t('preselected');
      $('#bkick').textContent=t('site')+' '+bookSite+' \u00b7 '+t('site_visit');
      $('#bttltxt').textContent=t('book_visit_for')+' '+t('site')+' '+bookSite;
    }else{
      $('#bkick').textContent=t('site_visit'); $('#bttltxt').textContent=t('book_appt');
    }
  }
  // legend re-render picks up translated status labels
  if(typeof legend==='function') legend();
  // if the details/amenities/images modal is open, re-render it in the new language
  if(typeof modalKind!=='undefined' && modalKind && modal.classList.contains('show')){
    renderModalBody(modalKind);
  }
  // refresh the layers button label from its (now translated) active option
  const va=document.querySelector('.lm[data-l]:not(.t).on b');
  if(va && document.querySelector('#layername')) $('#layername').textContent=va.textContent;
}
/* ===== booking flow ===== */
const bookModal=$('#book');
let bookSite=null;              // site id if preselected, else null
let bookDate=null, bookTime=null;

function openBooking(site){
  bookSite = site || null;
  bookDate=null; bookTime=null;
  // reset fields
  $('#bf-name').value=''; $('#bf-phone').value=''; $('#bf-email').value='';
  $('#bf-err').classList.remove('show'); $('#bf-err2').classList.remove('show');
  // site chip
  const chip=$('#bsitechip');
  if(bookSite){
    chip.hidden=false; $('#bsitetext').textContent=t('site')+' '+bookSite+' \u00b7 '+t('preselected');
    $('#bkick').textContent=t('site')+' '+bookSite+' \u00b7 '+t('site_visit');
    $('#bttltxt').textContent=t('book_visit_for')+' '+t('site')+' '+bookSite;
  }else{
    chip.hidden=true;
    $('#bkick').textContent=t('site_visit');
    $('#bttltxt').textContent=t('book_appt');
  }
  showStep(1);
  buildDates();
  bookModal.classList.add('show');
}
function closeBooking(){ bookModal.classList.remove('show'); }
function showStep(n){
  document.querySelectorAll('.bstep').forEach(el=>el.classList.toggle('show',+el.dataset.step===n));
  $('#bbody').scrollTop=0;
}

// date chips: next 7 days
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['S','M','T','W','T','F','S'];
const MONABBR=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYABBR=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let calView=new Date(); calView.setDate(1);
let bookDateObj=null;
function buildDates(){
  bookDateObj=null;
  const today=new Date(); today.setHours(0,0,0,0);
  calView=new Date(today.getFullYear(),today.getMonth(),1);
  // weekday header
  $('#bcal-dow').innerHTML=DOW.map(d=>\`<span>\${d}</span>\`).join('');
  renderCal();
  // time slots
  const tw=$('#bf-times'); tw.innerHTML='';
  ['10:00 AM','11:30 AM','1:00 PM','3:00 PM','4:30 PM','6:00 PM'].forEach(tm=>{
    const el=document.createElement('div'); el.className='btime'; el.textContent=tm;
    el.onclick=()=>{ document.querySelectorAll('.btime').forEach(x=>x.classList.remove('on'));
      el.classList.add('on'); bookTime=tm; };
    tw.appendChild(el);
  });
}
function renderCal(){
  const today=new Date(); today.setHours(0,0,0,0);
  const y=calView.getFullYear(), m=calView.getMonth();
  $('#bcal-mon').textContent=\`\${MON[m]} \${y}\`;
  // limit navigation: current month to +3 months
  const minM=new Date(today.getFullYear(),today.getMonth(),1);
  const maxM=new Date(today.getFullYear(),today.getMonth()+3,1);
  $('#bcal-prev').disabled = (y===minM.getFullYear()&&m===minM.getMonth());
  $('#bcal-next').disabled = (y===maxM.getFullYear()&&m===maxM.getMonth());
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const grid=$('#bcal-grid'); grid.innerHTML='';
  for(let i=0;i<first;i++){ const e=document.createElement('div'); e.className='bcell empty'; grid.appendChild(e); }
  for(let d=1;d<=days;d++){
    const cell=document.createElement('div'); cell.className='bcell'; cell.textContent=d;
    const date=new Date(y,m,d); date.setHours(0,0,0,0);
    if(date<today || date.getTime()===today.getTime()){ cell.classList.add('disabled'); }  // only future days
    else{
      cell.onclick=()=>{
        document.querySelectorAll('.bcell').forEach(x=>x.classList.remove('on'));
        cell.classList.add('on');
        bookDateObj=date;
        bookDate=\`\${DAYABBR[date.getDay()]}, \${d} \${MONABBR[m]} \${y}\`;
      };
    }
    if(bookDateObj && date.getTime()===bookDateObj.getTime()) cell.classList.add('on');
    grid.appendChild(cell);
  }
}
$('#bcal-prev').onclick=()=>{ calView.setMonth(calView.getMonth()-1); renderCal(); };
$('#bcal-next').onclick=()=>{ calView.setMonth(calView.getMonth()+1); renderCal(); };

// step 1 -> validate details
$('#bf-next').onclick=()=>{
  const name=$('#bf-name').value.trim();
  const phone=$('#bf-phone').value.trim();
  const err=$('#bf-err');
  if(!name){ err.textContent='Please enter your name.'; err.classList.add('show'); return; }
  if(!/^[0-9+\s-]{7,15}$/.test(phone)){ err.textContent='Please enter a valid phone number.'; err.classList.add('show'); return; }
  err.classList.remove('show');
  showStep(2);
};
$('#bf-back').onclick=()=>showStep(1);

// step 2 -> confirm -> success + whatsapp
$('#bf-confirm').onclick=()=>{
  const err=$('#bf-err2');
  if(!bookDate||!bookTime){ err.textContent='Please pick a date and a time.'; err.classList.add('show'); return; }
  err.classList.remove('show');
  const name=$('#bf-name').value.trim();
  const phone=$('#bf-phone').value.trim();
  const email=$('#bf-email').value.trim();
  // success screen detail
  const line = bookSite
    ? \`Site \${bookSite} \u00b7 \${bookDate} at \${bookTime}\`
    : \`\${bookDate} at \${bookTime}\`;
  $('#bsucc-detail').textContent = \`\${line}. \`+t('confirm_shortly');
  showStep(3);
  // build whatsapp message
  let msg = bookSite
    ? \`Hi, I\u2019d like to book a site visit for Plot number \${bookSite} at Basavanaganguru (SUDA layout).\`
    : \`Hi, I\u2019d like to book a site visit at Basavanaganguru (SUDA layout).\`;
  msg += \`\n\nName: \${name}\nPhone: \${phone}\`;
  if(email) msg += \`\nEmail: \${email}\`;
  msg += \`\nPreferred slot: \${bookDate} at \${bookTime}\`;
  // open whatsapp to the project number with the details prefilled
  setTimeout(()=>{ window.open('https://wa.me/919980061727?text='+encodeURIComponent(msg),'_blank','noopener'); },600);
};
$('#bf-done').onclick=closeBooking;
$('#bclose').onclick=closeBooking;
$('#bscrim').onclick=closeBooking;
['#bclose','#bf-next','#bf-back','#bf-confirm','#bf-done'].forEach(id=>{
  const n=$(id); if(n)n.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();n.click();}});
});

// entry points
$('#cp-book').addEventListener('click',()=>{ openContact(false); openBooking(sel); });
$('#cp-book').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#cp-book').click();}});
$('#d-book').addEventListener('click',()=>{ openBooking(sel); });

// contact popover book-visit subtitle reflects selection
const _origOpenContact=openContact;
openContact=function(v){
  _origOpenContact(v);
  if(v){ $('#cp-book-sub').textContent = sel ? (t('site')+' '+sel+' \u00b7 '+t('preselected')) : t('request_appt'); }
};

/* ===== intro sequence: splash -> language -> map ===== */
(function(){
  const intro=$('#intro'), splash=$('#splash'), lang=$('#langscreen');
  const LANGNAME={en:'English',kn:'Kannada',te:'Telugu',ta:'Tamil',hi:'Hindi'};
  // splash shows ~1.8s, then reveals language
  setTimeout(()=>{
    splash.classList.add('leaving');
    setTimeout(()=>{
      splash.classList.remove('show','leaving');
      lang.classList.add('show');
    },500);
  },1900);
  // pick language -> dismiss intro, reveal map
  document.querySelectorAll('.langbtn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      window.APP_LANG=btn.dataset.lang; applyLang(btn.dataset.lang);
      lang.classList.add('leaving');
      setTimeout(()=>{
        document.body.classList.remove('intro-active');
        intro.remove();
        resize();                       // re-fit now that the stage is visible
      },500);
    });
  });
})();

applyLang('en'); syncColourRows(); legend(); paint(); resize();
addEventListener('resize',resize);
setTimeout(()=>{$('#hint').style.opacity=0;},7000);

`;

export default function BasavanaganguruMap() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const style = document.createElement('style');
        style.setAttribute('data-basavanaganguru-map', 'true');
        style.textContent = MAP_CSS;
        document.head.appendChild(style);

        root.innerHTML = MAP_HTML;

        const previousBodyClass = document.body.className;
        document.body.className = 'lit real intro-active';

        try {
            // The supplied source is a browser script. Run it after its DOM exists.
            // eslint-disable-next-line no-new-func
            const runOriginalScript = new Function(MAP_SCRIPT);
            runOriginalScript();
        } catch (error) {
            console.error('Basavanaganguru map initialization failed:', error);
        }

        return () => {
            document.body.className = previousBodyClass;
            style.remove();
            root.innerHTML = '';
        };
    }, []);

    return <div ref={rootRef} style={{ position: 'fixed', inset: 0 }} />;
}
