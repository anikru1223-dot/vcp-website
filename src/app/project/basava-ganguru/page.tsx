'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from 'next/font/google';
import {
    Phone,
    MessageCircle,
    MapPin,
    Mail,
    ArrowRight,
    Check,
    Building2,
    Home as HomeIcon,
    Shield,
    Users,
    Zap,
    Star,
    Menu,
    X,
    FileText,
    DollarSign,
    KeyIcon,
    LandPlot,
    Hammer,
    Map as MapIcon,
    Navigation as NavigationIcon,
    Trees,
    Droplets,
    GraduationCap,
    Hospital,
    Train,
    TrendingUp,
    Ruler,
    Route,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// External links / constants for THIS project
// ---------------------------------------------------------------------------
const PHONE = '+919980061727';
const PHONE_DISPLAY = '+91 99800 61727';
const WHATSAPP = 'https://wa.me/919980061727';
const EMAIL = 'anilkrui223@gmail.com';
const MAPS_LINK = 'https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw';
const LAYOUT_MAP_ROUTE = '/layout-map'; // routes to LayoutMap.tsx page

// ---------------------------------------------------------------------------
// Fonts (identical to company site)
// ---------------------------------------------------------------------------
const display = Bricolage_Grotesque({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-display',
});
const body = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-body',
});
const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-mono',
});

// ---------------------------------------------------------------------------
// Global styles (same design tokens + section CSS as the company site)
// ---------------------------------------------------------------------------
function GlobalStyles() {
    return (
        <style jsx global>{`

/* ============ RESET & BASE ============ */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
:root{
  --ink:#0b1120;
  --ink-soft:#131b30;
  --ink-softer:#1b2540;
  --linen:#f5f1e6;
  --linen-soft:#ece5d4;
  --paper:#faf7ef;
  --brass:#b8894a;
  --brass-light:#e3be86;
  --brass-dark:#8f6a38;
  --moss:#4b5c42;
  --moss-light:#7c8f6e;
  --graphite:#2b2a26;
  --graphite-soft:#57544c;
  --mist:#e7e1d2;
  --line:rgba(184,137,74,0.28);
  --line-soft:rgba(43,42,38,0.12);
  --white:#ffffff;
  --font-display:'Bricolage Grotesque',sans-serif;
  --font-body:'Manrope',sans-serif;
  --font-mono:'IBM Plex Mono',monospace;
  --container:1240px;
}
body{
  font-family:var(--font-body);
  background:var(--paper);
  color:var(--graphite);
  line-height:1.5;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
img{max-width:100%;display:block;}
a{color:inherit;text-decoration:none;}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
ul{list-style:none;}
h1,h2,h3,h4{font-family:var(--font-display);font-weight:600;line-height:1.05;letter-spacing:-0.02em;}
.container{max-width:var(--container);margin:0 auto;padding:0 32px;}
:focus-visible{outline:2px solid var(--brass);outline-offset:3px;}
@media (prefers-reduced-motion: reduce){
  *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;scroll-behavior:auto !important;}
}

/* ============ TYPE HELPERS ============ */
.eyebrow{
  font-family:var(--font-mono);
  font-size:12px;
  letter-spacing:0.16em;
  text-transform:uppercase;
  color:var(--brass-dark);
  display:inline-flex;
  align-items:center;
  gap:10px;
  margin-bottom:20px;
}
.eyebrow::before{
  content:'';
  width:7px;height:7px;
  background:var(--brass);
  transform:rotate(45deg);
  flex-shrink:0;
}
.eyebrow.on-dark{color:var(--brass-light);}
.section-title{
  font-size:clamp(32px,4.2vw,52px);
  color:var(--ink);
  margin-bottom:20px;
}
.section-title em{font-style:normal;color:var(--brass-dark);}
.section-title.on-dark{color:var(--linen);}
.section-title.on-dark em{color:var(--brass-light);}
.section-lede{
  font-size:17px;
  color:var(--graphite-soft);
  max-width:520px;
  line-height:1.65;
}
.section-lede.on-dark{color:rgba(245,241,230,0.7);}
.section-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  flex-wrap:wrap;
  gap:24px;
  margin-bottom:64px;
}

/* ============ BUTTONS ============ */
.btn{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  font-family:var(--font-body);
  font-weight:700;
  font-size:15px;
  padding:16px 30px;
  border-radius:999px;
  transition:transform 0.35s cubic-bezier(.22,.98,.28,1), box-shadow 0.35s ease;
  white-space:nowrap;
  overflow:hidden;
}
.btn-primary{
  background:linear-gradient(135deg,var(--brass-light),var(--brass) 55%,var(--brass-dark));
  color:var(--ink);
  box-shadow:0 10px 30px -8px rgba(184,137,74,0.55);
}
.btn-primary:hover{box-shadow:0 16px 40px -8px rgba(184,137,74,0.7);}
.btn-ghost{
  border:1.5px solid rgba(245,241,230,0.35);
  color:var(--linen);
  background:rgba(245,241,230,0.05);
  backdrop-filter:blur(6px);
}
.btn-ghost:hover{background:rgba(245,241,230,0.12);border-color:rgba(245,241,230,0.6);}
.btn-ghost.dark{border-color:rgba(43,42,38,0.25);color:var(--ink);background:rgba(43,42,38,0.04);}
.btn-ghost.dark:hover{background:rgba(43,42,38,0.08);border-color:rgba(43,42,38,0.45);}

/* ============ NAVIGATION ============ */
.nav-wrap{
  position:fixed;
  top:18px;left:0;right:0;
  z-index:100;
  display:flex;
  justify-content:center;
  padding:0 20px;
}
.nav-pill{
  width:100%;
  max-width:1140px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:12px 14px 12px 24px;
  border-radius:999px;
  background:rgba(11,17,32,0.72);
  border:1px solid rgba(184,137,74,0.25);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  box-shadow:0 20px 45px -20px rgba(0,0,0,0.5);
  transition:box-shadow 0.3s ease, background 0.3s ease;
}
.nav-pill.is-scrolled{
  background:rgba(11,17,32,0.88);
  box-shadow:0 24px 50px -18px rgba(0,0,0,0.6);
}
.nav-logo{
  display:flex;align-items:center;gap:12px;
  font-family:var(--font-display);
  font-weight:700;
  font-size:15px;
  color:var(--linen);
  flex-shrink:0;
}
.nav-logo-mark{
  width:32px;height:32px;
  position:relative;
  flex-shrink:0;
}
.nav-links{
  display:flex;
  align-items:center;
  gap:30px;
}
.nav-link{
  font-size:13.5px;
  font-weight:600;
  color:rgba(245,241,230,0.75);
  position:relative;
  padding:4px 0;
  transition:color 0.25s ease;
}
.nav-link::after{
  content:'';
  position:absolute;left:0;bottom:-2px;
  width:0;height:1.5px;
  background:var(--brass-light);
  transition:width 0.3s cubic-bezier(.22,.98,.28,1);
}
.nav-link:hover{color:var(--linen);}
.nav-link:hover::after{width:100%;}
.nav-cta{
  padding:11px 22px;
  font-size:13.5px;
}
.nav-toggle{
  display:none;
  width:40px;height:40px;
  align-items:center;justify-content:center;
  color:var(--linen);
  flex-shrink:0;
}
.nav-mobile{
  position:fixed;
  top:78px;left:20px;right:20px;
  z-index:99;
  background:rgba(11,17,32,0.96);
  border:1px solid rgba(184,137,74,0.25);
  border-radius:24px;
  backdrop-filter:blur(18px);
  padding:12px;
  display:flex;
  flex-direction:column;
  gap:2px;
}
.nav-mobile a, .nav-mobile button{
  padding:14px 16px;
  border-radius:14px;
  font-size:15px;
  font-weight:600;
  color:var(--linen);
  transition:background 0.2s ease;
  display:block;
  width:100%;
  text-align:left;
}
.nav-mobile a:hover, .nav-mobile button:hover{background:rgba(184,137,74,0.14);}

/* ============ HERO ============ */
.hero{
  position:relative;
  min-height:100vh;
  display:flex;
  align-items:center;
  background:
    radial-gradient(ellipse 900px 700px at 15% 15%, rgba(184,137,74,0.16), transparent 60%),
    radial-gradient(ellipse 800px 800px at 88% 82%, rgba(75,92,66,0.18), transparent 60%),
    var(--ink);
  padding:150px 0 70px;
  overflow:hidden;
}
.hero::before{
  content:'';
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(184,137,74,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,137,74,0.05) 1px, transparent 1px);
  background-size:56px 56px;
  mask-image:radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent);
  pointer-events:none;
}
.hero-grid{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:40px;
  align-items:center;
}
.hero-copy .eyebrow{color:var(--brass-light);}
.hero-title{
  font-size:clamp(38px,5.4vw,74px);
  color:var(--linen);
  margin-bottom:26px;
}
.hero-title .accent{
  color:var(--brass-light);
  display:block;
}
.hero-sub{
  font-size:18px;
  color:rgba(245,241,230,0.68);
  max-width:480px;
  line-height:1.65;
  margin-bottom:24px;
}
.hero-price{
  display:inline-flex;
  align-items:baseline;
  gap:10px;
  padding:14px 24px;
  border:1px solid rgba(184,137,74,0.35);
  border-radius:14px;
  background:rgba(184,137,74,0.08);
  margin-bottom:36px;
}
.hero-price .amt{
  font-family:var(--font-mono);
  font-size:30px;
  font-weight:600;
  color:var(--brass-light);
}
.hero-price .unit{
  font-size:13px;
  color:rgba(245,241,230,0.6);
  letter-spacing:0.04em;
}
.hero-actions{
  display:flex;
  flex-wrap:wrap;
  gap:16px;
  margin-bottom:56px;
}
.hero-stats{
  display:flex;
  gap:0;
  flex-wrap:wrap;
}
.hero-stat{
  padding:0 28px;
  border-left:1px solid rgba(184,137,74,0.25);
}
.hero-stat:first-child{padding-left:0;border-left:none;}
.hero-stat-num{
  font-family:var(--font-mono);
  font-size:26px;
  font-weight:600;
  color:var(--brass-light);
  display:block;
}
.hero-stat-label{
  font-size:12px;
  color:rgba(245,241,230,0.5);
  margin-top:2px;
}
.hero-visual{
  position:relative;
  aspect-ratio:3/2;
  width:100%;
}
.hero-visual svg{
  width:100%;height:100%;
  overflow:visible;
}
.plot-line{
  fill:none;
  stroke:var(--brass);
  stroke-width:1.4;
  opacity:0.85;
}
.plot-road{
  stroke:rgba(231,225,210,0.16);
  stroke-width:2;
  stroke-dasharray:2 10;
  stroke-linecap:round;
}
.scroll-cue{
  position:absolute;
  bottom:28px;left:50%;
  transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:10px;
  z-index:2;
}
.scroll-cue-label{
  font-family:var(--font-mono);
  font-size:10px;
  letter-spacing:0.2em;
  color:rgba(245,241,230,0.4);
  writing-mode:vertical-rl;
}
.scroll-cue-line{
  width:1px;height:46px;
  background:rgba(184,137,74,0.3);
  position:relative;
  overflow:hidden;
}
.scroll-cue-line::after{
  content:'';
  position:absolute;top:-40%;left:0;
  width:100%;height:40%;
  background:var(--brass-light);
  animation:cue-drop 2s ease-in-out infinite;
}
@keyframes cue-drop{0%{top:-40%;}100%{top:100%;}}

/* ============ SECTION SHELLS ============ */
.section{padding:120px 0;scroll-margin-top:100px;}
.section-linen{background:var(--paper);}
.section-mist{background:var(--mist);}
.section-ink{background:var(--ink);color:var(--linen);}

/* ============ ABOUT ============ */
.about-grid{
  display:grid;
  grid-template-columns:0.95fr 1.05fr;
  gap:70px;
  align-items:center;
}
.about-visual{
  position:relative;
  padding:24px 30px 30px 0;
}
.about-img-main{
  width:100%;
  aspect-ratio:4/5;
  object-fit:cover;
  clip-path:polygon(0 0, 100% 0, 100% 86%, 86% 100%, 0 100%);
  box-shadow:0 30px 60px -20px rgba(43,42,38,0.35);
}
.about-img-accent{
  position:absolute;
  bottom:-14px;right:-14px;
  width:52%;
  aspect-ratio:5/4;
  object-fit:cover;
  clip-path:polygon(14% 0, 100% 0, 100% 100%, 0 100%, 0 22%);
  border:6px solid var(--paper);
  box-shadow:0 24px 44px -16px rgba(43,42,38,0.4);
}
.about-badge{
  position:absolute;
  top:0;left:0;
  background:var(--ink);
  color:var(--linen);
  padding:16px 20px;
  display:flex;
  flex-direction:column;
  box-shadow:0 20px 40px -16px rgba(11,17,32,0.5);
}
.about-badge-num{
  font-family:var(--font-mono);
  font-size:24px;
  color:var(--brass-light);
  font-weight:600;
}
.about-badge-label{font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(245,241,230,0.6);margin-top:2px;}
.about-copy p{
  color:var(--graphite-soft);
  font-size:16px;
  line-height:1.75;
  margin-bottom:20px;
}
.about-checklist{margin-top:32px;display:flex;flex-direction:column;gap:16px;}
.about-check-item{display:flex;align-items:center;gap:14px;}
.about-check-mark{
  width:22px;height:22px;
  flex-shrink:0;
  border:1.5px solid var(--brass);
  transform:rotate(45deg);
  display:flex;align-items:center;justify-content:center;
  position:relative;
}
.about-check-mark::after{
  content:'';
  position:absolute;
  width:8px;height:8px;
  background:var(--brass);
}
.about-check-item span{font-weight:600;font-size:15px;color:var(--ink);}

/* ============ HIGHLIGHTS (services-style grid) ============ */
.services-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:2px;
  background:var(--line-soft);
  border:1px solid var(--line-soft);
}
.service-card{
  background:var(--paper);
  padding:44px 32px;
  clip-path:polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 0 100%);
  transition:background 0.4s ease, transform 0.4s ease;
  position:relative;
}
.service-card:hover{background:var(--linen);transform:translateY(-4px);}
.service-tag{
  font-family:var(--font-mono);
  font-size:11px;
  color:var(--brass-dark);
  letter-spacing:0.1em;
  margin-bottom:22px;
  display:block;
}
.service-icon{
  width:52px;height:52px;
  border-radius:50%;
  background:rgba(184,137,74,0.12);
  display:flex;align-items:center;justify-content:center;
  color:var(--brass-dark);
  margin-bottom:22px;
  transition:background 0.3s ease, transform 0.3s ease;
}
.service-card:hover .service-icon{background:var(--brass);color:var(--white);transform:scale(1.08) rotate(-6deg);}
.service-card h3{font-size:20px;color:var(--ink);margin-bottom:10px;}
.service-card p{font-size:14.5px;color:var(--graphite-soft);line-height:1.6;}

/* ============ LAYOUT MAP CTA (dark, signature block) ============ */
.map-cta{
  position:relative;
  display:grid;
  grid-template-columns:1.05fr 0.95fr;
  gap:0;
  border:1px solid rgba(184,137,74,0.28);
  overflow:hidden;
  background:var(--ink-soft);
}
.map-cta-copy{
  padding:64px 56px;
  display:flex;
  flex-direction:column;
  justify-content:center;
}
.map-cta-copy .eyebrow{color:var(--brass-light);}
.map-cta-copy h2{
  font-size:clamp(28px,3.4vw,42px);
  color:var(--linen);
  margin-bottom:18px;
}
.map-cta-copy h2 em{font-style:normal;color:var(--brass-light);}
.map-cta-copy p{
  font-size:16px;
  color:rgba(245,241,230,0.68);
  line-height:1.7;
  max-width:440px;
  margin-bottom:32px;
}
.map-cta-actions{display:flex;flex-wrap:wrap;gap:14px;}
.map-cta-visual{
  position:relative;
  min-height:360px;
  background:
    radial-gradient(ellipse 600px 400px at 70% 30%, rgba(184,137,74,0.14), transparent 65%),
    var(--ink);
  border-left:1px solid rgba(184,137,74,0.2);
  overflow:hidden;
}
.map-cta-visual::before{
  content:'';
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(184,137,74,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,137,74,0.06) 1px, transparent 1px);
  background-size:40px 40px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}
.map-cta-visual svg{position:absolute;inset:0;width:100%;height:100%;}
.mini-plot{
  fill:rgba(227,190,134,0.08);
  stroke:var(--brass);
  stroke-width:1;
  transition:fill 0.3s ease;
}
.mini-plot-label{
  font-family:var(--font-mono);
  font-size:11px;
  fill:var(--brass-light);
  text-anchor:middle;
  dominant-baseline:central;
}
.mini-park{fill:rgba(124,143,110,0.16);stroke:var(--moss-light);stroke-width:1;}
.mini-ca{fill:rgba(110,150,190,0.14);stroke:#6e96be;stroke-width:1;}

/* ============ WHY CHOOSE US (dark) ============ */
.why-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:2px;
  background:rgba(184,137,74,0.14);
}
.why-item{
  background:var(--ink);
  padding:36px 34px;
  display:flex;
  gap:18px;
  align-items:flex-start;
}
.why-icon{
  width:44px;height:44px;
  border:1px solid rgba(184,137,74,0.4);
  display:flex;align-items:center;justify-content:center;
  color:var(--brass-light);
  flex-shrink:0;
  transform:rotate(45deg);
}
.why-icon svg{transform:rotate(-45deg);}
.why-item h3{font-size:17px;color:var(--linen);margin-bottom:6px;}
.why-item p{font-size:14px;color:rgba(245,241,230,0.55);line-height:1.55;}

/* ============ LOCATION ADVANTAGES ============ */
.loc-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:56px;
  align-items:start;
}
.loc-list{display:flex;flex-direction:column;}
.loc-row{
  display:flex;
  align-items:center;
  gap:18px;
  padding:18px 0;
  border-bottom:1px solid rgba(184,137,74,0.15);
}
.loc-row:first-child{padding-top:0;}
.loc-dist{
  font-family:var(--font-mono);
  font-size:19px;
  font-weight:600;
  color:var(--brass-light);
  min-width:82px;
  flex-shrink:0;
}
.loc-place{font-size:15px;color:rgba(245,241,230,0.82);}
.loc-icon{
  width:42px;height:42px;
  border:1px solid rgba(184,137,74,0.35);
  display:flex;align-items:center;justify-content:center;
  color:var(--brass-light);
  flex-shrink:0;
  transform:rotate(45deg);
}
.loc-icon svg{transform:rotate(-45deg);}
.loc-map-card{
  border:1px solid rgba(184,137,74,0.28);
  background:var(--ink-soft);
  padding:30px;
  display:flex;
  flex-direction:column;
  gap:20px;
  position:sticky;
  top:100px;
}
.loc-map-card h3{font-size:22px;color:var(--linen);}
.loc-map-card p{font-size:14.5px;color:rgba(245,241,230,0.6);line-height:1.6;}
.loc-map-frame{
  border:1px solid rgba(184,137,74,0.25);
  height:240px;
  overflow:hidden;
  filter:grayscale(0.3) contrast(1.05);
}
.loc-map-frame iframe{width:100%;height:100%;border:0;display:block;}

/* ============ STATISTICS ============ */
.stats-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:2px;
  background:rgba(184,137,74,0.14);
}
.stat-card{
  background:var(--ink);
  padding:48px 28px;
  text-align:center;
  position:relative;
}
.stat-ring{width:76px;height:76px;margin:0 auto 22px;position:relative;}
.stat-ring svg{transform:rotate(-90deg);}
.stat-ring-bg{fill:none;stroke:rgba(184,137,74,0.15);stroke-width:4;}
.stat-ring-fg{
  fill:none;stroke:var(--brass-light);stroke-width:4;stroke-linecap:round;
}
.stat-num{
  font-family:var(--font-mono);
  font-size:clamp(30px,3vw,40px);
  font-weight:600;
  color:var(--linen);
}
.stat-num .plus{color:var(--brass-light);}
.stat-label{font-size:13px;color:rgba(245,241,230,0.5);margin-top:8px;letter-spacing:0.02em;}

/* ============ PLOT DETAILS TABLE ============ */
.plot-table-wrap{
  border:1px solid var(--line);
  overflow:hidden;
  border-radius:4px;
}
.plot-table{width:100%;border-collapse:collapse;}
.plot-table thead th{
  background:var(--ink);
  color:var(--brass-light);
  font-family:var(--font-mono);
  font-size:12px;
  letter-spacing:0.08em;
  text-transform:uppercase;
  padding:16px 18px;
  text-align:left;
  font-weight:500;
}
.plot-table tbody td{
  padding:15px 18px;
  font-size:14.5px;
  color:var(--graphite);
  border-top:1px solid var(--line-soft);
}
.plot-table tbody tr:nth-child(even){background:rgba(184,137,74,0.04);}
.plot-table tbody tr:hover{background:rgba(184,137,74,0.09);}
.plot-table td:first-child{font-family:var(--font-mono);font-weight:600;color:var(--brass-dark);}

/* ============ GALLERY ============ */
.gallery-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-auto-rows:130px;
  grid-auto-flow:dense;
  gap:14px;
}
.gallery-item{
  position:relative;
  overflow:hidden;
  cursor:pointer;
  clip-path:polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
}
.gallery-item img{
  width:100%;height:100%;object-fit:cover;
  transition:transform 0.7s cubic-bezier(.22,.98,.28,1);
}
.gallery-item:hover img{transform:scale(1.08);}
.gallery-item::after{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(0deg, rgba(11,17,32,0.85) 0%, rgba(11,17,32,0.1) 45%, transparent 70%);
  opacity:0;
  transition:opacity 0.4s ease;
}
.gallery-item:hover::after{opacity:1;}
.gallery-caption{
  position:absolute;left:20px;bottom:16px;right:16px;
  z-index:2;
  transform:translateY(10px);
  opacity:0;
  transition:transform 0.4s ease, opacity 0.4s ease;
}
.gallery-item:hover .gallery-caption{transform:translateY(0);opacity:1;}
.gallery-caption .g-tag{font-family:var(--font-mono);font-size:10px;color:var(--brass-light);letter-spacing:0.12em;text-transform:uppercase;}
.gallery-caption h4{color:var(--white);font-size:17px;font-family:var(--font-display);font-weight:600;margin-top:2px;}
.g-span-2c{grid-column:span 2;}
.g-span-2r{grid-row:span 2;}
.lightbox{
  position:fixed;inset:0;z-index:200;
  background:rgba(11,17,32,0.92);
  display:flex;align-items:center;justify-content:center;
  padding:40px;
}
.lightbox img{max-width:min(900px,90vw);max-height:80vh;object-fit:contain;box-shadow:0 40px 80px rgba(0,0,0,0.5);}
.lightbox-close{
  position:absolute;top:28px;right:32px;
  width:44px;height:44px;
  border:1px solid rgba(245,241,230,0.3);
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  color:var(--linen);
}
.lightbox-caption{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);text-align:center;color:var(--linen);font-family:var(--font-mono);font-size:13px;letter-spacing:0.06em;}

/* ============ CONTACT ============ */
.contact-grid{display:grid;grid-template-columns:0.9fr 1.1fr;gap:56px;}
.contact-card{
  display:flex;gap:18px;align-items:flex-start;
  padding:22px 0;
  border-bottom:1px solid rgba(184,137,74,0.15);
}
.contact-card:first-child{padding-top:0;}
.contact-icon{
  width:46px;height:46px;
  border:1px solid rgba(184,137,74,0.35);
  display:flex;align-items:center;justify-content:center;
  color:var(--brass-light);
  flex-shrink:0;
}
.contact-card h4{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(245,241,230,0.5);margin-bottom:6px;font-family:var(--font-mono);font-weight:500;}
.contact-card a, .contact-card p{color:var(--linen);font-size:16px;font-weight:600;}
.map-frame{
  margin-top:28px;
  border:1px solid rgba(184,137,74,0.25);
  height:220px;
  overflow:hidden;
  filter:grayscale(0.3) contrast(1.05);
  position:relative;
}
.map-frame iframe{width:100%;height:100%;border:0;display:block;}
.contact-form{display:flex;flex-direction:column;gap:22px;}
.field{position:relative;}
.field input, .field textarea{
  width:100%;
  background:rgba(245,241,230,0.04);
  border:1px solid rgba(245,241,230,0.18);
  border-radius:2px;
  padding:20px 18px 8px;
  font-family:var(--font-body);
  font-size:15px;
  color:var(--linen);
  transition:border-color 0.3s ease, background 0.3s ease;
}
.field textarea{resize:none;min-height:120px;padding-top:24px;}
.field input:focus, .field textarea:focus{outline:none;border-color:var(--brass);background:rgba(184,137,74,0.06);}
.field label{
  position:absolute;left:18px;top:19px;
  font-size:15px;color:rgba(245,241,230,0.45);
  pointer-events:none;
  transition:all 0.2s ease;
}
.field input:focus + label,
.field input:not(:placeholder-shown) + label,
.field textarea:focus + label,
.field textarea:not(:placeholder-shown) + label{
  top:7px;font-size:10.5px;letter-spacing:0.06em;color:var(--brass-light);text-transform:uppercase;font-family:var(--font-mono);
}
.form-success{
  padding:16px 20px;
  background:rgba(184,137,74,0.12);
  border:1px solid rgba(184,137,74,0.3);
  color:var(--brass-light);
  font-size:14px;
  display:flex;
  align-items:center;
  gap:10px;
}

/* ============ FOOTER ============ */
.footer{background:#080c18;padding:90px 0 32px;position:relative;}
.footer::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg, transparent, var(--brass), transparent);
}
.footer-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:50px;margin-bottom:60px;}
.footer-logo{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--linen);margin-bottom:16px;display:flex;align-items:center;gap:12px;}
.footer-logo-mark{width:28px;height:28px;flex-shrink:0;}
.footer-logo span{color:var(--brass-light);}
.footer p{color:rgba(245,241,230,0.5);font-size:14.5px;line-height:1.7;max-width:320px;}
.footer h5{font-family:var(--font-mono);font-size:11.5px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,241,230,0.4);margin-bottom:18px;}
.footer ul{display:flex;flex-direction:column;gap:12px;}
.footer ul a, .footer ul button{color:rgba(245,241,230,0.65);font-size:14.5px;transition:color 0.25s ease, padding-left 0.25s ease;text-align:left;}
.footer ul a:hover, .footer ul button:hover{color:var(--brass-light);padding-left:4px;}
.footer-bottom{border-top:1px solid rgba(245,241,230,0.1);padding-top:28px;text-align:center;color:rgba(245,241,230,0.35);font-size:13px;}

/* ============ FLOATING BUTTONS ============ */
.fab-group{position:fixed;bottom:26px;right:26px;z-index:90;display:flex;flex-direction:column;gap:14px;}
.fab{
  width:58px;height:58px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  color:var(--white);
  box-shadow:0 14px 30px -8px rgba(0,0,0,0.4);
  transition:transform 0.3s cubic-bezier(.22,.98,.28,1);
  position:relative;
}
.fab:hover{transform:scale(1.08);}
.fab-wa{background:#25D366;}
.fab-call{background:linear-gradient(135deg, var(--brass-light), var(--brass-dark));}
.fab-map{background:linear-gradient(135deg,#4285F4,#2b5fc4);}
.fab-tooltip{
  position:absolute;right:70px;top:50%;transform:translateY(-50%) translateX(6px);
  background:var(--ink);color:var(--linen);
  font-size:12.5px;font-weight:600;
  padding:8px 14px;border-radius:6px;white-space:nowrap;
  opacity:0;pointer-events:none;
  transition:opacity 0.25s ease, transform 0.25s ease;
}
.fab:hover .fab-tooltip{opacity:1;transform:translateY(-50%) translateX(0);}

/* ============ RESPONSIVE ============ */
@media (max-width: 980px){
  .hero-grid{grid-template-columns:1fr;}
  .hero-visual{max-width:440px;margin:0 auto;order:-1;}
  .about-grid{grid-template-columns:1fr;gap:60px;}
  .services-grid{grid-template-columns:repeat(2,1fr);}
  .why-grid{grid-template-columns:repeat(2,1fr);}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  .gallery-grid{grid-template-columns:repeat(2,1fr);}
  .g-span-2c{grid-column:span 2;}
  .contact-grid{grid-template-columns:1fr;gap:50px;}
  .loc-grid{grid-template-columns:1fr;gap:40px;}
  .loc-map-card{position:static;}
  .map-cta{grid-template-columns:1fr;}
  .map-cta-visual{min-height:280px;order:-1;}
  .map-cta-copy{padding:48px 36px;}
  .footer-grid{grid-template-columns:1fr;gap:40px;}
  .nav-links{display:none;}
  .nav-cta{display:none;}
  .nav-toggle{display:flex;}
}
@media (max-width: 640px){
  .section{padding:80px 0;}
  .container{padding:0 20px;}
  .services-grid{grid-template-columns:1fr;}
  .why-grid{grid-template-columns:1fr;}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  .gallery-grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:110px;}
  .hero-stats{gap:0;}
  .hero-stat{padding:0 16px;}
  .section-head{margin-bottom:44px;}
  .plot-table thead th, .plot-table tbody td{padding:12px 12px;font-size:13px;}
}

    `}</style>
    );
}

// ---------------------------------------------------------------------------
// Magnetic wrapper (same as company site) — supports href, route push, onClick
// ---------------------------------------------------------------------------
function Magnetic({
    children,
    className,
    href,
    target,
    rel,
    onClick,
    type = 'button',
    ariaLabel,
    style,
}: {
    children: React.ReactNode;
    className?: string;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (e: React.MouseEvent) => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    style?: React.CSSProperties;
}) {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setPos({ x: x * 0.18, y: y * 0.35 });
    };
    const reset = () => setPos({ x: 0, y: 0 });

    if (href) {
        return (
            <motion.a
                href={href}
                target={target}
                rel={rel}
                className={className}
                style={style}
                aria-label={ariaLabel}
                onMouseMove={handleMove}
                onMouseLeave={reset}
                animate={{ x: pos.x, y: pos.y }}
                transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.5 }}
                whileTap={{ scale: 0.96 }}
            >
                {children}
            </motion.a>
        );
    }
    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={className}
            style={style}
            aria-label={ariaLabel}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.5 }}
            whileTap={{ scale: 0.96 }}
        >
            {children}
        </motion.button>
    );
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
    { label: 'Overview', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Highlights', id: 'highlights' },
    { label: 'Layout', id: 'layout' },
    { label: 'Location', id: 'location' },
    { label: 'Contact', id: 'contact' },
];

function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
    };

    return (
        <>
            <nav className="nav-wrap">
                <div className={`nav-pill${isScrolled ? ' is-scrolled' : ''}`}>
                    <button
                        onClick={() => scrollToSection('home')}
                        className="nav-logo"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <svg className="nav-logo-mark" viewBox="0 0 24 24">
                            <rect x="2" y="16" width="20" height="2" fill="#B8894A" />
                            <rect x="3" y="8" width="4" height="8" fill="none" stroke="#B8894A" strokeWidth="1.2" />
                            <line x1="5" y1="8" x2="5" y2="16" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="3" y1="11" x2="7" y2="11" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="3" y1="14" x2="7" y2="14" stroke="#B8894A" strokeWidth="0.8" />
                            <rect x="13" y="5" width="4" height="11" fill="none" stroke="#B8894A" strokeWidth="1.2" />
                            <line x1="15" y1="5" x2="15" y2="16" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="13" y1="8" x2="17" y2="8" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="13" y1="11" x2="17" y2="11" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="13" y1="14" x2="17" y2="14" stroke="#B8894A" strokeWidth="0.8" />
                            <line x1="8" y1="14" x2="12" y2="14" stroke="#B8894A" strokeWidth="1" opacity="0.6" />
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1.15 }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brass-light)', letterSpacing: '0.04em' }}>Basava Ganguru</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--linen)' }}>Residential Layout</span>
                        </div>
                    </button>

                    <div className="nav-links">
                        {NAV_ITEMS.map((item) => (
                            <button key={item.id} onClick={() => scrollToSection(item.id)} className="nav-link">
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <Magnetic href={`tel:${PHONE}`} className="btn btn-primary nav-cta">
                        Call Now
                    </Magnetic>

                    <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Open menu">
                        {isOpen ? <X size={20} color="#F5F1E6" /> : <Menu size={22} color="#F5F1E6" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="nav-mobile"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                    >
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                style={{ textAlign: 'left', width: '100%' }}
                            >
                                {item.label}
                            </button>
                        ))}
                        <a href={`tel:${PHONE}`} style={{ color: 'var(--brass-light)' }}>
                            Call {PHONE_DISPLAY}
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ---------------------------------------------------------------------------
// Hero — site-plan line drawing mirrors the sanctioned SBUDA survey layout:
// two 12-plot columns, a 10-plot block, CA site and park, roads between.
// ---------------------------------------------------------------------------
const PLOTS: string[][] = [
    // top-left 1-6 block (CA sits to its left)
    ['300,60', '380,58', '380,140', '300,142'],
    ['380,58', '460,56', '460,138', '380,140'],
    ['460,56', '540,54', '540,136', '460,138'],
    ['300,142', '380,140', '380,222', '300,224'],
    ['380,140', '460,138', '460,220', '380,222'],
    ['460,138', '540,136', '540,218', '460,220'],
    // middle column 11-17 (left)
    ['600,60', '700,58', '700,556', '600,558'],
    // middle column 18-25 (center)
    ['720,58', '820,56', '820,554', '720,556'],
    // right column 26-32
    ['870,54', '970,52', '970,552', '870,554'],
];

function HeroSection({ onViewMap }: { onViewMap: () => void }) {
    return (
        <section id="home" className="hero">
            <div className="container hero-grid">
                <div className="hero-copy">
                    <motion.div
                        className="eyebrow"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Basava Ganguru &middot; Shivamogga
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        Build Your Dream Home
                        <span className="accent">in Shivamogga.</span>
                    </motion.h1>

                    <motion.p
                        className="hero-sub"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        A premium plotted development of 32 SBUDA-approved residential sites,
                        with wide roads, a landscaped park, civic amenity site and
                        ready-for-registration titles.
                    </motion.p>

                    <motion.div
                        className="hero-price"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                    >
                        <span className="amt">&#8377;2,300</span>
                        <span className="unit">PER SQ.FT &middot; STARTING</span>
                    </motion.div>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <Magnetic onClick={onViewMap} className="btn btn-primary">
                            <MapIcon size={18} />
                            View Layout Map
                        </Magnetic>
                        <Magnetic href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                            <MessageCircle size={18} />
                            WhatsApp
                        </Magnetic>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                    >
                        <div className="hero-stat">
                            <span className="hero-stat-num">32</span>
                            <span className="hero-stat-label">Residential Plots</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">40ft</span>
                            <span className="hero-stat-label">Main Road</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">7,219</span>
                            <span className="hero-stat-label">Sq.M Extent</span>
                        </div>
                    </motion.div>
                </div>

                <div className="hero-visual">
                    <svg viewBox="0 0 1000 620">
                        {/* roads mirroring the survey drawing */}
                        <motion.line className="plot-road" x1={280} y1={30} x2={280} y2={590}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />
                        <motion.line className="plot-road" x1={570} y1={30} x2={570} y2={590}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />
                        <motion.line className="plot-road" x1={840} y1={30} x2={840} y2={590}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />
                        <motion.line className="plot-road" x1={40} y1={40} x2={990} y2={40}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />

                        {/* CA site */}
                        <motion.polygon
                            points="150,60 270,58 270,224 150,226"
                            fill="rgba(110,150,190,0.14)" stroke="#6e96be" strokeWidth={1}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
                        />
                        <motion.text x={210} y={145} fill="#8fb4d6" fontSize={16} fontFamily="var(--font-mono)" textAnchor="middle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.6 }}>CA</motion.text>

                        {/* park */}
                        <motion.polygon
                            points="150,300 540,300 500,560 150,580"
                            fill="rgba(124,143,110,0.16)" stroke="#7c8f6e" strokeWidth={1}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.8 }}
                        />
                        <motion.text x={330} y={440} fill="#a7bd97" fontSize={16} fontFamily="var(--font-mono)" textAnchor="middle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1, duration: 0.6 }}>PARK</motion.text>

                        {/* plot outlines draw in */}
                        {PLOTS.map((pts, i) => (
                            <motion.polygon
                                key={i}
                                className="plot-line"
                                points={pts.join(' ')}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.85 }}
                                transition={{ duration: 1.1, delay: i * 0.13, ease: 'easeInOut' }}
                            />
                        ))}

                        {/* rotating compass */}
                        <motion.g
                            transform="translate(930,80)"
                            opacity={0.55}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: 'center' }}
                        >
                            <circle r={30} fill="none" stroke="#B8894A" strokeWidth={1} />
                            <line x1={0} y1={-30} x2={0} y2={-22} stroke="#B8894A" strokeWidth={1} />
                            <line x1={0} y1={30} x2={0} y2={22} stroke="#B8894A" strokeWidth={1} />
                            <line x1={-30} y1={0} x2={-22} y2={0} stroke="#B8894A" strokeWidth={1} />
                            <line x1={30} y1={0} x2={22} y2={0} stroke="#B8894A" strokeWidth={1} />
                            <polygon points="0,-16 5,0 0,16 -5,0" fill="#B8894A" />
                        </motion.g>
                    </svg>
                </div>
            </div>

            <div className="scroll-cue">
                <span className="scroll-cue-label">SCROLL</span>
                <span className="scroll-cue-line" />
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Reveal wrapper
// ---------------------------------------------------------------------------
function Reveal({
    children,
    delay = 0,
    className,
    style,
    y = 28,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
    y?: number;
}) {
    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.8, delay, ease: [0.22, 0.98, 0.28, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const ABOUT_CHECKLIST = [
    'SBUDA-approved residential layout',
    'Clear titles, ready for registration',
    'Wide 40ft & 30ft internal roads',
    'Green, peaceful & well-connected',
];

function AboutSection() {
    return (
        <section id="about" className="section section-linen">
            <div className="container about-grid">
                <Reveal className="about-visual">
                    <img
                        className="about-img-main"
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=75"
                        alt="Basava Ganguru Residential Layout"
                    />
                    <img
                        className="about-img-accent"
                        src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=700&q=75"
                        alt="Wide landscaped internal roads at the layout"
                    />
                    <div className="about-badge">
                        <span className="about-badge-num">32</span>
                        <span className="about-badge-label">Premium&nbsp;Plots</span>
                    </div>
                </Reveal>

                <div className="about-copy">
                    <div className="eyebrow">About The Project</div>
                    <Reveal>
                        <h2 className="section-title">
                            A Premium Plotted <em>Development</em> in Basava Ganguru
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p>
                            Basava Ganguru Residential Layout is a premium plotted development
                            designed to offer the perfect blend of comfort, convenience and
                            future growth. Thoughtfully planned with wide roads, modern
                            infrastructure and green open spaces.
                        </p>
                    </Reveal>
                    <Reveal delay={0.18}>
                        <p>
                            Developed by Vijayalaxmi C. Patil Developers &amp; Promoters on
                            Sy. No. 43/1 of Basava Ganguru village, Shivamogga Taluk &mdash;
                            a sanctioned SBUDA layout ideal for building your dream home or
                            making a smart investment.
                        </p>
                    </Reveal>

                    <div className="about-checklist">
                        {ABOUT_CHECKLIST.map((item, i) => (
                            <Reveal key={item} delay={0.1 + i * 0.08} className="about-check-item">
                                <span className="about-check-mark" />
                                <span>{item}</span>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Key Highlights (services-style grid)
// ---------------------------------------------------------------------------
const HIGHLIGHTS = [
    { icon: Route, tag: 'H · 01', title: 'Wide Roads', desc: 'Well-planned internal roads, 40ft & 30ft wide, for smooth movement and easy access.' },
    { icon: Droplets, tag: 'H · 02', title: 'Underground Drainage', desc: 'Modern underground drainage system ensuring a clean and healthy environment.' },
    { icon: Trees, tag: 'H · 03', title: 'Landscaped Park', desc: 'Beautifully designed park with green spaces for leisure and recreation.' },
    { icon: Building2, tag: 'H · 04', title: 'Civic Amenity Site', desc: 'Designated civic amenity space for community facilities and social infrastructure.' },
    { icon: Zap, tag: 'H · 05', title: '24×7 Electricity', desc: 'Uninterrupted power supply for a modern and comfortable lifestyle.' },
    { icon: Shield, tag: 'H · 06', title: 'Ready For Registration', desc: 'Clear titles and all approvals in place. Ready for immediate registration.' },
];

function HighlightsSection() {
    return (
        <section id="highlights" className="section section-mist">
            <div className="container">
                <div className="section-head">
                    <Reveal>
                        <div className="eyebrow">What You Get</div>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            Key <em>Highlights</em>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="section-lede">
                            Crafted with thoughtful planning and premium infrastructure for a
                            lifestyle of comfort, convenience and long-term value.
                        </p>
                    </Reveal>
                </div>

                <div className="services-grid">
                    {HIGHLIGHTS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <Reveal key={s.title} delay={(i % 3) * 0.1} className="service-card">
                                <span className="service-tag">{s.tag}</span>
                                <div className="service-icon">
                                    <Icon size={24} />
                                </div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Layout Map CTA — the signature block. Button routes to LayoutMap.tsx page.
// ---------------------------------------------------------------------------
function LayoutMapSection({ onViewMap }: { onViewMap: () => void }) {
    return (
        <section id="layout" className="section section-linen">
            <div className="container">
                <div className="map-cta">
                    <div className="map-cta-copy">
                        <div className="eyebrow">Master Layout Plan</div>
                        <h2>
                            Explore All 32 Plots on the <em>Interactive Map</em>
                        </h2>
                        <p>
                            Well planned. Well connected. Well designed. Browse every
                            residential site, the civic amenity block, landscaped park and STP
                            exactly as sanctioned &mdash; tap any plot to see its dimensions,
                            area and facing.
                        </p>
                        <div className="map-cta-actions">
                            <Magnetic onClick={onViewMap} className="btn btn-primary">
                                <MapIcon size={18} />
                                Open Interactive Layout
                            </Magnetic>
                            <Magnetic href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-ghost dark">
                                <NavigationIcon size={18} />
                                View Location
                            </Magnetic>
                        </div>
                    </div>

                    <div className="map-cta-visual">
                        <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet">
                            {/* CA */}
                            <rect className="mini-ca" x={40} y={40} width={90} height={80} />
                            <text className="mini-plot-label" x={85} y={82} style={{ fill: '#8fb4d6' }}>CA</text>
                            {/* 1-6 block */}
                            {[0, 1, 2].map((c) =>
                                [0, 1].map((r) => (
                                    <g key={`a${c}${r}`}>
                                        <rect className="mini-plot" x={140 + c * 34} y={40 + r * 40} width={32} height={38} />
                                        <text className="mini-plot-label" x={156 + c * 34} y={59 + r * 40}>{r * 3 + c + 1}</text>
                                    </g>
                                ))
                            )}
                            {/* park */}
                            <rect className="mini-park" x={40} y={200} width={200} height={120} rx={6} />
                            <text className="mini-plot-label" x={140} y={262} style={{ fill: '#a7bd97' }}>PARK</text>
                            {/* right columns 11-32 abbreviated */}
                            {[0, 1, 2].map((col) =>
                                [0, 1, 2, 3, 4, 5, 6].map((r) => (
                                    <rect key={`b${col}${r}`} className="mini-plot" x={270 + col * 66} y={40 + r * 44} width={58} height={40} />
                                ))
                            )}
                            <text className="mini-plot-label" x={299} y={62}>11</text>
                            <text className="mini-plot-label" x={365} y={62}>24</text>
                            <text className="mini-plot-label" x={431} y={62}>26</text>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Why Choose Us (dark)
// ---------------------------------------------------------------------------
const WHY_REASONS = [
    { icon: MapPin, title: 'Prime Location', desc: 'Excellent connectivity to institutions, hospitals and essentials' },
    { icon: Route, title: 'Well-Planned Roads', desc: '40ft & 30ft wide internal roads throughout' },
    { icon: Trees, title: 'Green Environment', desc: 'Dedicated park and open green spaces' },
    { icon: Check, title: 'All Approvals', desc: 'Sanctioned SBUDA layout with clear titles' },
    { icon: HomeIcon, title: 'Ready To Build', desc: 'Ready for registration and immediate construction' },
    { icon: TrendingUp, title: 'High Appreciation', desc: 'Fast-developing corridor with strong growth' },
];

function WhyChooseUsSection() {
    return (
        <section id="why-choose-us" className="section section-ink">
            <div className="container">
                <div className="section-head">
                    <Reveal>
                        <div className="eyebrow on-dark">The Difference</div>
                        <h2 className="section-title on-dark" style={{ marginBottom: 0 }}>
                            Why <em>Choose This Project</em>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="section-lede on-dark">
                            A perfect blend of comfort, connectivity and community living &mdash;
                            premium living, promising future.
                        </p>
                    </Reveal>
                </div>

                <div className="why-grid">
                    {WHY_REASONS.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <Reveal key={r.title} delay={(i % 3) * 0.1} className="why-item">
                                <div className="why-icon">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h3>{r.title}</h3>
                                    <p>{r.desc}</p>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------
function StatCard({
    icon: Icon,
    value,
    suffix,
    label,
    ringPercent,
    delay,
    decimals = 0,
}: {
    icon: React.ComponentType<any>;
    value: number;
    suffix?: string;
    label: string;
    ringPercent: number;
    delay: number;
    decimals?: number;
}) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const circumference = 2 * Math.PI * 35;

    const start = () => {
        if (started) return;
        setStarted(true);
        const duration = 1400;
        let startTime: number | null = null;
        const step = (ts: number) => {
            if (startTime === null) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * value);
            if (progress < 1) requestAnimationFrame(step);
            else setCount(value);
        };
        requestAnimationFrame(step);
    };

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.8, delay, ease: [0.22, 0.98, 0.28, 1] }}
            onViewportEnter={start}
        >
            <div className="stat-ring">
                <svg width={76} height={76}>
                    <circle className="stat-ring-bg" cx={38} cy={38} r={35} />
                    <motion.circle
                        className="stat-ring-fg"
                        cx={38} cy={38} r={35}
                        style={{ strokeDasharray: circumference }}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: circumference * (1 - ringPercent / 100) }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.6, delay: delay + 0.1, ease: [0.22, 0.98, 0.28, 1] }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon {...({ size: 24, color: 'var(--brass-light)' } as any)} />
                </div>
            </div>
            <div className="stat-num">
                {decimals ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
                {suffix ? <span className="plus">{suffix}</span> : null}
            </div>
            <div className="stat-label">{label}</div>
        </motion.div>
    );
}

function StatisticsSection() {
    const stats = [
        { icon: LandPlot, value: 32, suffix: '', label: 'Residential Plots', ring: 100, decimals: 0 },
        { icon: Ruler, value: 2300, suffix: '/sqft', label: 'Starting Price (₹)', ring: 60, decimals: 0 },
        { icon: Route, value: 40, suffix: 'ft', label: 'Main Road Width', ring: 80, decimals: 0 },
        { icon: Trees, value: 10, suffix: '%', label: 'Open / Park Space', ring: 45, decimals: 0 },
    ];
    return (
        <section id="statistics" className="section section-ink" style={{ paddingTop: 0 }}>
            <div className="container">
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <StatCard
                            key={s.label}
                            icon={s.icon}
                            value={s.value}
                            suffix={s.suffix}
                            label={s.label}
                            ringPercent={s.ring}
                            delay={i * 0.1}
                            decimals={s.decimals}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Plot Details table (from sanctioned site-details schedule)
// ---------------------------------------------------------------------------
const PLOT_ROWS = [
    { no: '1 – 6', dim: 'Varies (corner & mid sites)', facing: 'E / W', status: 'Available' },
    { no: '7 – 10', dim: '9.00 × 12.00 m', facing: 'N', status: 'Available' },
    { no: '11 – 17', dim: '9.00 × 15.00 m', facing: 'E', status: 'Available' },
    { no: '18 – 25', dim: '9.00 × 16.05 m', facing: 'W', status: 'Available' },
    { no: '26 – 32', dim: '9.00 × 15.00 m', facing: 'W', status: 'Available' },
];

function PlotDetailsSection({ onViewMap }: { onViewMap: () => void }) {
    return (
        <section id="plots" className="section section-mist">
            <div className="container">
                <div className="section-head">
                    <Reveal>
                        <div className="eyebrow">Site Schedule</div>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            Plot <em>Details</em>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="section-lede">
                            Dimensions follow the sanctioned SBUDA site-details schedule. Tap
                            the interactive map for the exact figures on any individual plot.
                        </p>
                    </Reveal>
                </div>

                <Reveal>
                    <div className="plot-table-wrap">
                        <table className="plot-table">
                            <thead>
                                <tr>
                                    <th>Plot No.</th>
                                    <th>Dimensions</th>
                                    <th>Facing</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PLOT_ROWS.map((r) => (
                                    <tr key={r.no}>
                                        <td>{r.no}</td>
                                        <td>{r.dim}</td>
                                        <td>{r.facing}</td>
                                        <td>{r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
                        <Magnetic onClick={onViewMap} className="btn btn-primary">
                            <MapIcon size={18} />
                            Open Interactive Layout Map
                        </Magnetic>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
const GALLERY_ITEMS = [
    { tag: 'Entrance', title: 'Grand Arch Gateway', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', span: 'g-span-2c g-span-2r' },
    { tag: 'Roads', title: 'Wide Internal Roads', img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6', span: '' },
    { tag: 'Park', title: 'Landscaped Park', img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f', span: 'g-span-2r' },
    { tag: 'Plots', title: 'Ready Residential Sites', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607', span: '' },
    { tag: 'Aerial', title: 'Layout Overview', img: 'https://images.unsplash.com/photo-1524813686514-a57563d77965', span: 'g-span-2c' },
    { tag: 'Amenity', title: 'Civic Amenity Site', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', span: '' },
];

function GallerySection() {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <section id="gallery" className="section section-linen">
            <div className="container">
                <div className="section-head">
                    <Reveal>
                        <div className="eyebrow">Project Views</div>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            Project <em>Gallery</em>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="section-lede">
                            A look across the layout &mdash; from the grand gateway to the
                            finished streets.
                        </p>
                    </Reveal>
                </div>

                <div className="gallery-grid">
                    {GALLERY_ITEMS.map((item, i) => (
                        <Reveal
                            key={item.title}
                            delay={(i % 3) * 0.1}
                            className={`gallery-item ${item.span}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <div onClick={() => setSelected(i)}>
                                <img src={`${item.img}?auto=format&fit=crop&w=900&q=75`} alt={item.title} />
                                <div className="gallery-caption">
                                    <span className="g-tag">{item.tag}</span>
                                    <h4>{item.title}</h4>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selected !== null && (
                    <motion.div
                        className="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <button className="lightbox-close" onClick={() => setSelected(null)}>
                            <X size={18} color="#F5F1E6" />
                        </button>
                        <motion.img
                            key={selected}
                            src={`${GALLERY_ITEMS[selected].img}?auto=format&fit=crop&w=1400&q=80`}
                            alt={GALLERY_ITEMS[selected].title}
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e: React.MouseEvent<HTMLImageElement>) => e.stopPropagation()}
                        />
                        <div className="lightbox-caption">
                            {GALLERY_ITEMS[selected].tag.toUpperCase()} &nbsp;&middot;&nbsp; {GALLERY_ITEMS[selected].title}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Location Advantages
// ---------------------------------------------------------------------------
const LOCATION_ROWS = [
    { icon: Route, dist: '200 m', place: 'From Existing 80ft Road' },
    { icon: Route, dist: '300 m', place: 'From Upcoming 200ft Ring Road' },
    { icon: GraduationCap, dist: '800 m', place: 'Keladi Shivappa Nayaka University' },
    { icon: Hospital, dist: '1 km', place: 'Bapuji Ayurvedic Medical College' },
    { icon: GraduationCap, dist: '1.3 km', place: 'JNNCE Engineering College' },
    { icon: Star, dist: '5 min', place: 'KSCA Cricket Stadium' },
    { icon: Hospital, dist: '10 min', place: 'Usha / Chandragiri Multispeciality Hospital' },
    { icon: Train, dist: '12 min', place: 'Shivamogga Railway Station' },
    { icon: Building2, dist: '13 min', place: 'DC Office' },
];

function LocationSection() {
    return (
        <section id="location" className="section section-ink">
            <div className="container">
                <div className="section-head">
                    <Reveal>
                        <div className="eyebrow on-dark">Where It Is</div>
                        <h2 className="section-title on-dark" style={{ marginBottom: 0 }}>
                            Location <em>Advantages</em>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="section-lede on-dark">
                            Strategically located in the fast-growing corridor of Shivamogga,
                            with unmatched connectivity to institutions, healthcare and
                            transport hubs.
                        </p>
                    </Reveal>
                </div>

                <div className="loc-grid">
                    <div className="loc-list">
                        {LOCATION_ROWS.map((r, i) => {
                            const Icon = r.icon;
                            return (
                                <Reveal key={r.place} delay={(i % 4) * 0.06} className="loc-row">
                                    <div className="loc-icon">
                                        <Icon size={18} />
                                    </div>
                                    <span className="loc-dist">{r.dist}</span>
                                    <span className="loc-place">{r.place}</span>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal delay={0.15}>
                        <div className="loc-map-card">
                            <h3>Prime Location. Excellent Connectivity.</h3>
                            <p>
                                Basava Ganguru village, Shivamogga Taluk, Karnataka &mdash;
                                well connected today, built for tomorrow.
                            </p>
                            <div className="loc-map-frame">
                                <iframe
                                    src="https://www.google.com/maps?q=Basava+Ganguru,Shivamogga,Karnataka,India&output=embed"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Basava Ganguru location map"
                                />
                            </div>
                            <Magnetic href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%' }}>
                                <NavigationIcon size={18} />
                                Open in Google Maps
                            </Magnetic>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
function ContactSection() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <section id="contact" className="section section-ink" style={{ paddingTop: 0 }}>
            <div className="container contact-grid">
                <Reveal>
                    <div className="eyebrow on-dark">Get In Touch</div>
                    <h2 className="section-title on-dark">
                        Book Your <em>Site Visit</em>
                    </h2>

                    <div style={{ marginTop: 12 }}>
                        <div className="contact-card">
                            <div className="contact-icon">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4>Phone</h4>
                                <a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>
                            </div>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4>Email</h4>
                                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                            </div>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4>Location</h4>
                                <p>Basava Ganguru, Shivamogga, Karnataka</p>
                            </div>
                        </div>
                    </div>

                    <div className="map-frame">
                        <iframe
                            src="https://www.google.com/maps?q=Basava+Ganguru,Shivamogga,Karnataka,India&output=embed"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Basava Ganguru map"
                        />
                    </div>
                </Reveal>

                <Reveal delay={0.15}>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="field">
                            <input
                                type="text"
                                placeholder=" "
                                required
                                id="fName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <label htmlFor="fName">Your Name</label>
                        </div>
                        <div className="field">
                            <input
                                type="email"
                                placeholder=" "
                                required
                                id="fEmail"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <label htmlFor="fEmail">Your Email</label>
                        </div>
                        <div className="field">
                            <input
                                type="tel"
                                placeholder=" "
                                required
                                id="fPhone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <label htmlFor="fPhone">Phone Number</label>
                        </div>
                        <div className="field">
                            <textarea
                                placeholder=" "
                                required
                                id="fMessage"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            <label htmlFor="fMessage">Which plot are you interested in?</label>
                        </div>
                        <Magnetic type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Send Enquiry <ArrowRight size={18} />
                        </Magnetic>

                        <AnimatePresence>
                            {submitted && (
                                <motion.div
                                    className="form-success"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    &#10003;&nbsp; Enquiry sent successfully! We&rsquo;ll get back to you soon.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </Reveal>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer({ onViewMap }: { onViewMap: () => void }) {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <Reveal>
                        <div className="footer-logo">
                            <svg className="footer-logo-mark" viewBox="0 0 24 24">
                                <rect x="2" y="16" width="20" height="2" fill="#B8894A" />
                                <rect x="3" y="8" width="4" height="8" fill="none" stroke="#B8894A" strokeWidth="1.2" />
                                <line x1="5" y1="8" x2="5" y2="16" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="3" y1="11" x2="7" y2="11" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="3" y1="14" x2="7" y2="14" stroke="#B8894A" strokeWidth="0.8" />
                                <rect x="13" y="5" width="4" height="11" fill="none" stroke="#B8894A" strokeWidth="1.2" />
                                <line x1="15" y1="5" x2="15" y2="16" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="13" y1="8" x2="17" y2="8" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="13" y1="11" x2="17" y2="11" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="13" y1="14" x2="17" y2="14" stroke="#B8894A" strokeWidth="0.8" />
                                <line x1="8" y1="14" x2="12" y2="14" stroke="#B8894A" strokeWidth="1" opacity="0.6" />
                            </svg>
                            Basava <span>Ganguru</span>
                        </div>
                        <p>A premium residential layout by Vijayalaxmi C. Patil Developers &amp; Promoters in Shivamogga, Karnataka.</p>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <h5>Explore</h5>
                        <ul>
                            <li><button onClick={() => scrollToSection('about')}>About</button></li>
                            <li><button onClick={() => scrollToSection('highlights')}>Highlights</button></li>
                            <li><button onClick={onViewMap}>Layout Map</button></li>
                            <li><button onClick={() => scrollToSection('location')}>Location</button></li>
                            <li><a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">Google Maps</a></li>
                        </ul>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <h5>Contact</h5>
                        <ul>
                            <li><a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a></li>
                            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                            <li style={{ color: 'rgba(245,241,230,0.65)' }}>Basava Ganguru, Shivamogga, Karnataka</li>
                        </ul>
                    </Reveal>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Vijayalaxmi C. Patil Developers &amp; Promoters. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// ---------------------------------------------------------------------------
// Floating action buttons — WhatsApp, Call, and Location
// ---------------------------------------------------------------------------
function FloatingButtons() {
    return (
        <div className="fab-group">
            <motion.a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="fab fab-map"
                aria-label="Open location in Google Maps"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="fab-tooltip">View Location</span>
                <NavigationIcon size={24} />
            </motion.a>
            <motion.a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="fab fab-wa"
                aria-label="WhatsApp us"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="fab-tooltip">Chat on WhatsApp</span>
                <MessageCircle size={26} />
            </motion.a>
            <motion.a
                href={`tel:${PHONE}`}
                className="fab fab-call"
                aria-label="Call us"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="fab-tooltip">Call {PHONE_DISPLAY}</span>
                <Phone size={24} />
            </motion.a>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Splash Screen (same as company site, retitled for the project)
// ---------------------------------------------------------------------------
function SplashScreen({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--ink)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(184,137,74,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(184,137,74,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />

            <motion.div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 32,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                    <motion.div
                        style={{ position: 'absolute', left: 10, top: 40, width: 30, height: 60, border: '2px solid #e3be86' }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4, height: '100%' }}>
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    style={{ background: 'rgba(184,137,74,0.3)', border: '1px solid #b8894a' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        style={{ position: 'absolute', right: 10, top: 20, width: 30, height: 80, border: '2px solid #e3be86' }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4, height: '100%' }}>
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    style={{ background: 'rgba(184,137,74,0.3)', border: '1px solid #b8894a' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.06 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#b8894a' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    />
                </div>

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <motion.h1
                        style={{ fontSize: 32, fontWeight: 700, color: 'var(--linen)', margin: 0, marginBottom: 8, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        Basava Ganguru
                    </motion.h1>
                    <motion.p
                        style={{ fontSize: 16, color: '#e3be86', margin: 0, letterSpacing: '0.05em', fontFamily: 'Manrope, sans-serif' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.4 }}
                    >
                        Residential Layout
                    </motion.p>
                </div>

                <motion.div
                    style={{ maxWidth: 320, textAlign: 'center', position: 'relative', zIndex: 2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                >
                    <p style={{ fontSize: 14, color: 'rgba(245,241,230,0.6)', margin: 0, lineHeight: 1.6, fontFamily: 'Manrope, sans-serif' }}>
                        Build Your Dream Home in Shivamogga.
                    </p>
                </motion.div>

                <motion.div
                    style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 2, marginTop: 16 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            style={{ width: 8, height: 8, borderRadius: '50%', background: '#b8894a' }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.8, delay: 2.2 + i * 0.15, repeat: Infinity }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BasavaGanguruProject() {
    const [showSplash, setShowSplash] = useState(true);
    const router = useRouter();

    const goToLayoutMap = () => {
        router.push(LAYOUT_MAP_ROUTE);
    };

    return (
        <main className={`${display.variable} ${body.variable} ${mono.variable}`}>
            <GlobalStyles />
            <AnimatePresence>
                {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            </AnimatePresence>
            {!showSplash && (
                <>
                    <Navigation />
                    <HeroSection onViewMap={goToLayoutMap} />
                    <AboutSection />
                    <HighlightsSection />
                    <LayoutMapSection onViewMap={goToLayoutMap} />
                    <WhyChooseUsSection />
                    <StatisticsSection />
                    <PlotDetailsSection onViewMap={goToLayoutMap} />
                    <GallerySection />
                    <LocationSection />
                    <ContactSection />
                    <Footer onViewMap={goToLayoutMap} />
                    <FloatingButtons />
                </>
            )}
        </main>
    );
}