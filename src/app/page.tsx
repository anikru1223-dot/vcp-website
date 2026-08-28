'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
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
  Compass,
  Layers,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Fonts
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
// Global styles
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

/* ============ REVEAL ANIMATION ============ */
.reveal{
  opacity:0;
  transform:translateY(28px);
  transition:opacity 0.8s cubic-bezier(.22,.98,.28,1), transform 0.8s cubic-bezier(.22,.98,.28,1);
}
.reveal.is-visible{opacity:1;transform:translateY(0);}
.reveal-delay-1{transition-delay:0.08s;}
.reveal-delay-2{transition-delay:0.16s;}
.reveal-delay-3{transition-delay:0.24s;}
.reveal-delay-4{transition-delay:0.32s;}
.reveal-delay-5{transition-delay:0.4s;}

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
.btn-ripple{
  position:absolute;
  border-radius:50%;
  background:rgba(255,255,255,0.5);
  transform:scale(0);
  animation:ripple 0.6s ease-out;
  pointer-events:none;
}
@keyframes ripple{to{transform:scale(3);opacity:0;}}

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
  opacity:0;
  transform:translateY(-12px);
  pointer-events:none;
  transition:opacity 0.3s ease, transform 0.3s ease;
}
.nav-mobile.is-open{opacity:1;transform:translateY(0);pointer-events:auto;}
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
  margin-bottom:40px;
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
  stroke-dasharray:1400;
  stroke-dashoffset:1400;
  animation:draw-plot 2.2s cubic-bezier(.22,.98,.28,1) forwards;
}
.plot-road{
  stroke:rgba(231,225,210,0.16);
  stroke-width:2;
  stroke-dasharray:2 10;
  stroke-linecap:round;
}
@keyframes draw-plot{to{stroke-dashoffset:0;}}
.plot-fill-fade{
  opacity:0;
  animation:fade-plot 1s ease forwards;
}
@keyframes fade-plot{to{opacity:1;}}
.plot-compass{
  transform-origin:center;
  animation:spin-slow 40s linear infinite;
}
@keyframes spin-slow{to{transform:rotate(360deg);}}
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

/* ============ SERVICES ============ */
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

/* ============ PROJECTS SHOWCASE ============ */
.projects-showcase{
  display:grid;
  grid-template-columns:1.05fr 0.95fr;
  gap:56px;
  align-items:stretch;
}
.projects-feature{
  position:relative;
  border-radius:22px;
  overflow:hidden;
  min-height:440px;
  background:#0a0f1c;
  border:1px solid rgba(184,137,74,0.28);
  box-shadow:0 30px 70px -30px rgba(11,17,32,0.6);
  cursor:pointer;
  transition:transform 0.45s cubic-bezier(.22,.98,.28,1), box-shadow 0.45s ease;
}
.projects-feature:hover{transform:translateY(-5px);box-shadow:0 40px 90px -30px rgba(11,17,32,0.7);}
.projects-feature img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;
  transition:transform 0.8s cubic-bezier(.22,.98,.28,1);
}
.projects-feature:hover img{transform:scale(1.06);}
.projects-feature::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(0deg, rgba(11,17,32,0.92) 0%, rgba(11,17,32,0.4) 45%, rgba(11,17,32,0.15) 100%);
}
.pf-inner{
  position:absolute;left:0;right:0;bottom:0;z-index:2;
  padding:34px 34px 32px;
  display:flex;flex-direction:column;gap:14px;
}
.pf-badge{
  align-self:flex-start;
  font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;
  color:#8fe0a0;background:rgba(75,160,90,0.18);border:1px solid rgba(120,220,140,0.4);
  padding:6px 13px;border-radius:999px;backdrop-filter:blur(6px);
}
.pf-name{font-size:30px;color:var(--linen);}
.pf-meta{display:flex;flex-wrap:wrap;gap:8px 20px;}
.pf-meta span{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:rgba(245,241,230,0.72);}
.pf-meta svg{color:var(--brass-light);flex-shrink:0;}
.pf-open{
  margin-top:6px;display:inline-flex;align-items:center;gap:9px;
  font-weight:700;font-size:14.5px;color:var(--brass-light);
}
.pf-open svg:last-child{transition:transform 0.3s cubic-bezier(.22,.98,.28,1);}
.projects-feature:hover .pf-open svg:last-child{transform:translateX(5px);}

.projects-copy{display:flex;flex-direction:column;justify-content:center;}
.projects-copy .eyebrow{margin-bottom:20px;}
.projects-copy p{color:var(--graphite-soft);font-size:16px;line-height:1.75;margin-bottom:20px;max-width:440px;}
.projects-points{display:flex;flex-direction:column;gap:16px;margin:8px 0 34px;}
.projects-point{display:flex;align-items:flex-start;gap:14px;}
.projects-point-mark{
  width:20px;height:20px;flex-shrink:0;margin-top:2px;
  border:1.5px solid var(--brass);transform:rotate(45deg);
  display:flex;align-items:center;justify-content:center;position:relative;
}
.projects-point-mark::after{content:'';position:absolute;width:7px;height:7px;background:var(--brass);}
.projects-point span{font-size:14.5px;font-weight:600;color:var(--ink);}

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
  stroke-dasharray:220;stroke-dashoffset:220;
  transition:stroke-dashoffset 1.6s cubic-bezier(.22,.98,.28,1);
}
.stat-num{
  font-family:var(--font-mono);
  font-size:clamp(30px,3vw,40px);
  font-weight:600;
  color:var(--linen);
}
.stat-num .plus{color:var(--brass-light);}
.stat-label{font-size:13px;color:rgba(245,241,230,0.5);margin-top:8px;letter-spacing:0.02em;}

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
  opacity:0;pointer-events:none;
  transition:opacity 0.3s ease;
}
.lightbox.is-open{opacity:1;pointer-events:auto;}
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

/* ============ LEADERSHIP ============ */
.leadership-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
.leader-card{
  background:var(--paper);
  border:1px solid var(--line-soft);
  padding:44px;
  position:relative;
  overflow:hidden;
}
.leader-card::before{
  content:'';
  position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg, var(--brass), transparent 70%);
}
.leader-top{display:flex;gap:22px;align-items:center;margin-bottom:26px;}
.leader-avatar{
  width:84px;height:84px;
  border-radius:50%;
  background:linear-gradient(135deg, var(--ink), var(--brass-dark));
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);
  font-size:26px;font-weight:700;
  color:var(--brass-light);
  flex-shrink:0;
  position:relative;
}
.leader-avatar::after{
  content:'';
  position:absolute;inset:-5px;
  border:1px solid rgba(184,137,74,0.35);
  border-radius:50%;
}
.leader-badge{
  display:inline-block;
  font-family:var(--font-mono);
  font-size:10.5px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--brass-dark);
  background:rgba(184,137,74,0.1);
  padding:5px 12px;
  margin-bottom:8px;
}
.leader-card h3{font-size:22px;color:var(--ink);}
.leader-card p{font-size:14.5px;color:var(--graphite-soft);line-height:1.7;}

/* ============ TESTIMONIALS ============ */
.testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.testimonial-card{
  background:var(--white);
  border:1px solid var(--line-soft);
  padding:36px 32px;
  position:relative;
  transition:transform 0.35s ease, box-shadow 0.35s ease;
}
.testimonial-card:hover{transform:translateY(-6px);box-shadow:0 26px 50px -20px rgba(43,42,38,0.2);}
.quote-mark{
  font-family:var(--font-display);
  font-size:52px;
  color:var(--brass);
  opacity:0.35;
  line-height:1;
  margin-bottom:6px;
}
.stars{display:flex;gap:3px;margin-bottom:16px;}
.testimonial-card p{font-size:15px;color:var(--graphite-soft);line-height:1.7;margin-bottom:22px;font-style:italic;}
.testimonial-name{display:flex;align-items:center;gap:12px;}
.t-initial{
  width:36px;height:36px;border-radius:50%;
  background:var(--mist);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--brass-dark);
}
.testimonial-name span{font-weight:700;font-size:14.5px;color:var(--ink);}

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
  display:none;
  align-items:center;
  gap:10px;
}
.form-success.is-visible{display:flex;}

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
.footer ul a{color:rgba(245,241,230,0.65);font-size:14.5px;transition:color 0.25s ease, padding-left 0.25s ease;}
.footer ul a:hover{color:var(--brass-light);padding-left:4px;}
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
  .projects-showcase{grid-template-columns:1fr;gap:44px;}
  .projects-feature{min-height:380px;}
  .why-grid{grid-template-columns:repeat(2,1fr);}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  .gallery-grid{grid-template-columns:repeat(2,1fr);}
  .g-span-2c{grid-column:span 2;}
  .leadership-grid{grid-template-columns:1fr;}
  .testimonials-grid{grid-template-columns:1fr;}
  .contact-grid{grid-template-columns:1fr;gap:50px;}
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
  .projects-feature{min-height:340px;}
  .pf-inner{padding:26px 24px 24px;}
  .pf-name{font-size:25px;}
}

    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Magnetic
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
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Services', id: 'services' },
  { label: 'Why Choose Us', id: 'why-choose-us' },
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
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brass-light)', letterSpacing: '0.04em' }}>Vijayalaxmi C Patil</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--linen)' }}>Developers & Promoters</span>
            </div>
          </button>

          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="nav-link">
                {item.label}
              </button>
            ))}
          </div>

          <Magnetic href="tel:+919980061727" className="btn btn-primary nav-cta">
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
            className="nav-mobile is-open"
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
            <a href="tel:+919980061727" style={{ color: 'var(--brass-light)' }}>
              Call +91 99800 61727
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const PLOTS: string[][] = [
  ['32,34', '272,22', '286,188', '28,198'],
  ['272,22', '498,44', '492,190', '286,188'],
  ['498,44', '752,28', '762,168', '492,190'],
  ['28,198', '286,188', '272,364', '22,378'],
  ['286,188', '492,190', '476,368', '272,364'],
  ['492,190', '762,168', '772,350', '476,368'],
  ['22,378', '272,364', '256,556', '14,562'],
  ['272,364', '476,368', '462,558', '256,556'],
  ['476,368', '772,350', '782,556', '462,558'],
];

function HeroSection() {
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
            Shivamogga &middot; Karnataka
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Building Dreams.
            <span className="accent">Creating Communities.</span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Premium Residential Layout Development, Plot Sales, Home Loans &amp;
            Complete House Construction Services in Shivamogga
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Magnetic href="tel:+919980061727" className="btn btn-primary">
              <Phone size={18} />
              Call Now
            </Magnetic>
            <Magnetic href="https://wa.me/919980061727" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
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
              <span className="hero-stat-num">28+</span>
              <span className="hero-stat-label">Years Experience</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">22+</span>
              <span className="hero-stat-label">Projects Done</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">2.8k+</span>
              <span className="hero-stat-label">Happy Families</span>
            </div>
          </motion.div>
        </div>

        <div className="hero-visual">
          <svg viewBox="0 0 900 600">
            <defs>
              <clipPath id="clipPlot5">
                <polygon points="286,188 492,190 476,368 272,364" />
              </clipPath>
              <clipPath id="clipPlot9">
                <polygon points="476,368 772,350 782,556 462,558" />
              </clipPath>
            </defs>

            <motion.line
              className="plot-road"
              x1={279} y1={10} x2={279} y2={590}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}
            />
            <motion.line
              className="plot-road"
              x1={485} y1={10} x2={485} y2={590}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}
            />
            <motion.line
              className="plot-road"
              x1={10} y1={193} x2={890} y2={193}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}
            />
            <motion.line
              className="plot-road"
              x1={10} y1={371} x2={890} y2={371}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}
            />

            <motion.image
              href="https://images.unsplash.com/photo-1563873414958-cd82f797b03a?auto=format&fit=crop&w=500&q=70"
              x={272} y={184} width={224} height={188}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clipPlot5)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
            />
            <motion.image
              href="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=70"
              x={460} y={348} width={326} height={212}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clipPlot9)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9, duration: 1 }}
            />

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

            <motion.g
              transform="translate(820,68)"
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
// Reveal
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
  'Transparency in every transaction',
  'Quality construction standards',
  'Complete legal documentation',
  'Customer-centric approach',
];

function AboutSection() {
  return (
    <section id="about" className="section section-linen">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <img
            className="about-img-main"
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=75"
            alt="Modern residential development by VCP Developers"
          />
          <img
            className="about-img-accent"
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=700&q=75"
            alt="Construction team building a VCP Developers layout"
          />
          <div className="about-badge">
            <span className="about-badge-num">28+</span>
            <span className="about-badge-label">Years&nbsp;Trusted</span>
          </div>
        </Reveal>

        <div className="about-copy">
          <div className="eyebrow">Our Story</div>
          <Reveal>
            <h2 className="section-title">
              Trusted Real Estate <em>Excellence</em> in Shivamogga
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Vijayalaxmi C. Patil Developers &amp; Promoters is a trusted real
              estate developer specializing in developing premium residential
              layouts, converting large land parcels into well-planned
              residential sites, and delivering complete key-in-hand solutions.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p>
              Our mission is to make home ownership simple by offering
              everything from purchasing a plot to delivering a fully
              completed dream home.
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
// Projects showcase — links out to the /projects page & live layout map
// ---------------------------------------------------------------------------
const PROJECT_POINTS = [
  'Walk the sanctioned site plan plot by plot',
  'See live availability — available, reserved, sold',
  'Enquire on any plot by WhatsApp or call, instantly',
];

function ProjectsSection() {
  const router = useRouter();
  return (
    <section id="projects" className="section section-linen">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">Live Inventory</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Our <em>Projects</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-lede">
              Every layout, mapped and interactive. Open a project to explore its
              plots in real time.
            </p>
          </Reveal>
        </div>

        <div className="projects-showcase">
          <Reveal>
            <div
              className="projects-feature"
              onClick={() => router.push('/project/basava-ganguru')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/project/basava-ganguru')}
            >
              <img
                src="/basava-ganguru-layout.png"
                alt="Basava Ganguru residential layout master plan"
              />
              <div className="pf-inner">
                <span className="pf-badge">Live now</span>
                <h3 className="pf-name">Basava Ganguru</h3>
                <div className="pf-meta">
                  <span><MapPin size={14} /> Shivamogga, Karnataka</span>
                  <span><LandPlot size={14} /> 32 plots</span>
                  <span><Layers size={14} /> SBUDA Approved</span>
                </div>
                <span className="pf-open">
                  <Compass size={17} /> Explore layout <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </Reveal>

          <div className="projects-copy">
            <Reveal>
              <div className="eyebrow">Interactive Site Plans</div>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                No more static PDFs. Our projects come alive as interactive maps
                drawn straight from the sanctioned survey &mdash; pan, zoom, and tap
                any plot to see its size, facing, and current status.
              </p>
            </Reveal>

            <div className="projects-points">
              {PROJECT_POINTS.map((point, i) => (
                <Reveal key={point} delay={0.1 + i * 0.08} className="projects-point">
                  <span className="projects-point-mark" />
                  <span>{point}</span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Magnetic onClick={() => router.push('/project/basava-ganguru')} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                View All Projects <ArrowRight size={18} />
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
const SERVICES = [
  { icon: LandPlot, tag: 'SVC · 01', title: 'Residential Layout Development', desc: 'Premium residential layouts with modern infrastructure and planning' },
  { icon: HomeIcon, tag: 'SVC · 02', title: 'Residential Site Sales', desc: 'Prime residential plots in well-planned communities' },
  { icon: Hammer, tag: 'SVC · 03', title: 'House Construction', desc: 'Complete construction from foundation to finish' },
  { icon: DollarSign, tag: 'SVC · 04', title: 'Housing Loan Assistance', desc: 'Expert guidance for housing loan approvals' },
  { icon: FileText, tag: 'SVC · 05', title: 'Legal Documentation', desc: 'Complete documentation and compliance support' },
  { icon: KeyIcon, tag: 'SVC · 06', title: 'End-to-End Key Handover', desc: 'From plot purchase to key handover solutions' },
];

function ServicesSection() {
  return (
    <section id="services" className="section section-mist">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">What We Do</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Our <em>Services</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-lede">
              From the first survey line to the final key in hand &mdash; every
              step of the journey, handled in-house.
            </p>
          </Reveal>
        </div>

        <div className="services-grid">
          {SERVICES.map((s, i) => {
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
// Why Choose Us
// ---------------------------------------------------------------------------
const WHY_REASONS = [
  { icon: Shield, title: 'Trusted Developers', desc: 'Proven track record in real estate' },
  { icon: Briefcase, title: 'Transparent Process', desc: 'Clear and honest dealing always' },
  { icon: Zap, title: 'Complete Solutions', desc: 'End-to-end services from plot to home' },
  { icon: Users, title: 'Customer Focus', desc: 'Your satisfaction is our priority' },
  { icon: HomeIcon, title: 'Premium Quality', desc: 'Superior construction standards' },
  { icon: Check, title: 'Full Documentation', desc: 'Legal compliance and clarity' },
];

function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="section section-ink">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow on-dark">The Difference</div>
            <h2 className="section-title on-dark" style={{ marginBottom: 0 }}>
              Why <em>Choose Us</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-lede on-dark">
              Twenty-eight years of the same promise: clear terms, solid
              construction, and a team that answers the phone.
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
  label,
  ringPercent,
  delay,
}: {
  icon: React.ComponentType<any>;
  value: number;
  label: string;
  ringPercent: number;
  delay: number;
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
      setCount(Math.floor(eased * value));
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
          <Icon {...({ size: 24, color: "var(--brass-light)" } as any)} />
        </div>
      </div>
      <div className="stat-num">
        {count.toLocaleString()}
        <span className="plus">+</span>
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

function StatisticsSection() {
  const stats = [
    { icon: Briefcase, value: 28, label: 'Years of Experience', ring: 72 },
    { icon: Building2, value: 22, label: 'Projects Completed', ring: 60 },
    { icon: Users, value: 2800, label: 'Happy Families', ring: 95 },
    { icon: LandPlot, value: 1200, label: 'Residential Sites Sold', ring: 85 },
  ];
  return (
    <section id="statistics" className="section section-ink">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} ringPercent={s.ring} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
const GALLERY_ITEMS = [
  { tag: 'Layout', title: 'Residential Layouts', img: 'https://images.unsplash.com/photo-1499631507243-7290571550ed', span: 'g-span-2c g-span-2r' },
  { tag: 'Construction', title: 'Construction Phase', img: 'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea', span: '' },
  { tag: 'Infrastructure', title: 'Modern Infrastructure', img: 'https://images.unsplash.com/photo-1499310392581-322cec0355a6', span: 'g-span-2r' },
  { tag: 'Completed', title: 'Completed Homes', img: 'https://images.unsplash.com/photo-1721815693498-cc28507c0ba2', span: '' },
  { tag: 'Drone', title: 'Aerial View', img: 'https://images.unsplash.com/photo-1524813686514-a57563d77965', span: 'g-span-2c' },
  { tag: 'Community', title: 'Community Spaces', img: 'https://images.unsplash.com/photo-1780732658907-33c2e90a902c', span: '' },
];

function GallerySection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="gallery" className="section section-mist">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">Field Notes</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Project <em>Gallery</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-lede">
              A look across our layouts &mdash; from first survey to finished
              street.
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
            className="lightbox is-open"
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
// Leadership
// ---------------------------------------------------------------------------
const LEADERS = [
  {
    initials: 'VP',
    name: 'Vijayalaxmi C. Patil',
    title: 'Founder',
    desc: 'Leading the company with a vision of developing trusted residential communities and delivering quality real estate solutions with integrity.',
  },
  {
    initials: 'AP',
    name: 'Anil Kumar C. Patil',
    title: 'Co-Founder',
    desc: 'Committed to providing transparent property solutions, guiding customers through every step from plot purchase to complete home construction.',
  },
];

function LeadershipSection() {
  return (
    <section id="leadership" className="section section-linen">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">Meet The Team</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Our <em>Leadership</em>
            </h2>
          </Reveal>
        </div>
        <div className="leadership-grid">
          {LEADERS.map((leader, i) => (
            <Reveal key={leader.name} delay={i * 0.12} className="leader-card">
              <div className="leader-top">
                <div className="leader-avatar">{leader.initials}</div>
                <div>
                  <span className="leader-badge">{leader.title}</span>
                  <h3>{leader.name}</h3>
                </div>
              </div>
              <p>{leader.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
const TESTIMONIALS = [
  { initials: 'RK', name: 'Rajesh Kumar', rating: 5, review: 'Excellent service from start to finish. The team was transparent and professional throughout the entire process.' },
  { initials: 'PS', name: 'Priya Sharma', rating: 5, review: 'Built my dream home with VCP Developers. Their attention to detail and quality construction is outstanding.' },
  { initials: 'AP', name: 'Amit Patel', rating: 5, review: 'Highly satisfied with the plot location, documentation support, and loan assistance provided. Highly recommended!' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section section-mist">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">Client Words</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              What Our Customers <em>Say</em>
            </h2>
          </Reveal>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="testimonial-card">
              <div className="quote-mark">&ldquo;</div>
              <div className="stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={15} color="var(--brass)" fill="var(--brass)" />
                ))}
              </div>
              <p>{t.review}</p>
              <div className="testimonial-name">
                <div className="t-initial">{t.initials}</div>
                <span>{t.name}</span>
              </div>
            </Reveal>
          ))}
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
    <section id="contact" className="section section-ink">
      <div className="container contact-grid">
        <Reveal>
          <div className="eyebrow on-dark">Get In Touch</div>
          <h2 className="section-title on-dark">
            Let&rsquo;s Talk <em>Plots &amp; Plans</em>
          </h2>

          <div style={{ marginTop: 12 }}>
            <div className="contact-card">
              <div className="contact-icon">
                <Phone size={20} />
              </div>
              <div>
                <h4>Phone</h4>
                <a href="tel:+919980061727">+91 9980061727</a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <Mail size={20} />
              </div>
              <div>
                <h4>Email</h4>
                <a href="mailto:anilkrui223@gmail.com">anilkrui223@gmail.com</a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h4>Location</h4>
                <p>Shivamogga, Karnataka, India</p>
              </div>
            </div>
          </div>

          <div className="map-frame">
            <iframe
              src="https://www.google.com/maps?q=Shivamogga,Karnataka,India&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shivamogga, Karnataka map"
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
              <label htmlFor="fMessage">Your Message</label>
            </div>
            <Magnetic type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Message <ArrowRight size={18} />
            </Magnetic>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  className="form-success is-visible"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  &#10003;&nbsp; Message sent successfully! We&rsquo;ll get back to you soon.
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
function Footer() {
  const router = useRouter();
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
              VCP <span>Developers</span>
            </div>
            <p>Premium residential layouts and complete home construction solutions in Shivamogga.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h5>Explore</h5>
            <ul>
              <li><button onClick={() => scrollToSection('home')} style={{ textTransform: 'capitalize' }}>Home</button></li>
              <li><button onClick={() => scrollToSection('about')} style={{ textTransform: 'capitalize' }}>About</button></li>
              <li><button onClick={() => router.push('/projects')}>Projects</button></li>
              <li><button onClick={() => scrollToSection('services')} style={{ textTransform: 'capitalize' }}>Services</button></li>
              <li><button onClick={() => scrollToSection('contact')} style={{ textTransform: 'capitalize' }}>Contact</button></li>
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <h5>Contact</h5>
            <ul>
              <li><a href="tel:+919980061727">+91 9980061727</a></li>
              <li><a href="mailto:anilkrui223@gmail.com">anilkrui223@gmail.com</a></li>
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
// Floating action buttons
// ---------------------------------------------------------------------------
function FloatingButtons() {
  return (
    <div className="fab-group">
      <motion.a
        href="https://wa.me/919980061727"
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
        href="tel:+919980061727"
        className="fab fab-call"
        aria-label="Call us"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="fab-tooltip">Call +91 99800 61727</span>
        <Phone size={24} />
      </motion.a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Splash Screen
// ---------------------------------------------------------------------------
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);
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
            style={{
              position: 'absolute',
              left: 10,
              top: 40,
              width: 30,
              height: 60,
              border: '2px solid #e3be86',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 4,
                padding: 4,
                height: '100%',
              }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    background: 'rgba(184,137,74,0.3)',
                    border: '1px solid #b8894a',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{
              position: 'absolute',
              right: 10,
              top: 20,
              width: 30,
              height: 80,
              border: '2px solid #e3be86',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 4,
                padding: 4,
                height: '100%',
              }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    background: 'rgba(184,137,74,0.3)',
                    border: '1px solid #b8894a',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: '#b8894a',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <motion.h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--linen)',
              margin: 0,
              marginBottom: 8,
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Vijayalaxmi C Patil
          </motion.h1>
          <motion.p
            style={{
              fontSize: 16,
              color: '#e3be86',
              margin: 0,
              letterSpacing: '0.05em',
              fontFamily: 'Manrope, sans-serif',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            Developers & Promoters
          </motion.p>
        </div>

        <motion.div
          style={{
            maxWidth: 300,
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'rgba(245,241,230,0.6)',
              margin: 0,
              lineHeight: 1.6,
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            Building Dreams. Creating Communities.
          </p>
        </motion.div>

        <motion.div
          style={{
            display: 'flex',
            gap: 8,
            position: 'relative',
            zIndex: 2,
            marginTop: 16,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#b8894a',
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.8,
                delay: 2.2 + i * 0.15,
                repeat: Infinity,
              }}
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
export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <GlobalStyles />
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && (
        <>
          <Navigation />
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <ServicesSection />
          <WhyChooseUsSection />
          <StatisticsSection />
          <GallerySection />
          <LeadershipSection />
          <TestimonialsSection />
          <ContactSection />
          <Footer />
          <FloatingButtons />
        </>
      )}
    </main>
  );
}