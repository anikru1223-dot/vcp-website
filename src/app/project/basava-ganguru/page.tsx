'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from 'next/font/google';
import { MapPin, ArrowRight, ArrowLeft, LandPlot, Compass, Layers } from 'lucide-react';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

type Project = {
    id: string;
    name: string;
    sub: string;
    location: string;
    plots: number;
    area: string;
    live: boolean;
    image: string;
    href: string;
};

const PROJECTS: Project[] = [
    {
        id: 'basava-ganguru',
        name: 'Basava Ganguru',
        sub: 'Residential Layout',
        location: 'Shivamogga, Karnataka',
        plots: 32,
        area: 'SBUDA Approved',
        live: true,
        image: '/basava-ganguru-layout.png',
        href: '/layout-map',
    },
    // Next project goes here when ready:
    // { id: 'project-two', name: 'Project Two', sub: 'Residential Layout', location: '…', plots: 0, area: '—', live: false, image: '…', href: '#' },
];

export default function ProjectsPage() {
    const router = useRouter();

    return (
        <main className={`${display.variable} ${body.variable} ${mono.variable} projects-root`}>
            <GlobalStyles />

            {/* Ambient survey-grid backdrop */}
            <div className="pj-grid-bg" aria-hidden="true" />

            <div className="pj-container">
                {/* Back to site */}
                <button className="pj-back" onClick={() => router.push('/')}>
                    <ArrowLeft size={16} /> Back to site
                </button>

                {/* Header */}
                <header className="pj-head">
                    <div className="eyebrow">Vijayalaxmi C Patil · Shivamogga</div>
                    <h1 className="pj-title">
                        Our <em>Projects</em>
                    </h1>
                    <p className="pj-lede">
                        Explore our residential layouts plot by plot. Tap a project to open its
                        live interactive site plan, check availability, and enquire on the spot.
                    </p>
                </header>

                {/* Project cards */}
                <div className="pj-list">
                    {PROJECTS.map((p) => (
                        <article
                            key={p.id}
                            className={`pj-card ${p.live ? '' : 'is-soon'}`}
                            onClick={() => p.live && router.push(p.href)}
                            role={p.live ? 'button' : undefined}
                            tabIndex={p.live ? 0 : undefined}
                            onKeyDown={(e) => p.live && (e.key === 'Enter' || e.key === ' ') && router.push(p.href)}
                        >
                            <div className="pj-card-media">
                                <img src={p.image} alt={`${p.name} residential layout`} />
                                <span className={`pj-status ${p.live ? 'live' : 'soon'}`}>
                                    {p.live ? 'Live now' : 'Coming soon'}
                                </span>
                            </div>

                            <div className="pj-card-body">
                                <div className="pj-card-top">
                                    <h2>{p.name}</h2>
                                    <p className="pj-card-sub">{p.sub}</p>
                                </div>

                                <div className="pj-meta">
                                    <span><MapPin size={14} /> {p.location}</span>
                                    <span><LandPlot size={14} /> {p.plots} plots</span>
                                    <span><Layers size={14} /> {p.area}</span>
                                </div>

                                {p.live && (
                                    <div className="pj-open">
                                        <Compass size={17} />
                                        <span>Open interactive layout</span>
                                        <ArrowRight size={18} className="pj-open-arrow" />
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                <footer className="pj-foot">
                    Built by Train IQ · trainiq.in
                </footer>
            </div>
        </main>
    );
}

function GlobalStyles() {
    return (
        <style jsx global>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.projects-root{
  --ink:#0b1120; --ink-soft:#131b30;
  --linen:#f5f1e6; --paper:#faf7ef;
  --brass:#b8894a; --brass-light:#e3be86; --brass-dark:#8f6a38;
  --graphite:#2b2a26; --graphite-soft:#57544c;
  --line:rgba(184,137,74,0.28);
  --font-display:'Bricolage Grotesque',sans-serif;
  --font-body:'Manrope',sans-serif;
  --font-mono:'IBM Plex Mono',monospace;
  position:relative;
  min-height:100vh;
  background:
    radial-gradient(ellipse 900px 600px at 12% 0%, rgba(184,137,74,0.14), transparent 60%),
    radial-gradient(ellipse 800px 700px at 92% 100%, rgba(19,27,48,0.9), transparent 55%),
    var(--ink);
  color:var(--linen);
  font-family:var(--font-body);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
.projects-root img{max-width:100%;display:block;}
.projects-root h1,.projects-root h2{font-family:var(--font-display);letter-spacing:-0.02em;line-height:1.05;}
.projects-root :focus-visible{outline:2px solid var(--brass);outline-offset:3px;}

.pj-grid-bg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(184,137,74,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,137,74,0.05) 1px, transparent 1px);
  background-size:56px 56px;
  mask-image:radial-gradient(ellipse 70% 55% at 50% 25%, black, transparent);
}

.pj-container{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:40px 24px 80px;}

.pj-back{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em;
  color:rgba(245,241,230,0.6);background:none;border:none;cursor:pointer;
  padding:8px 0;margin-bottom:36px;transition:color 0.25s ease;
}
.pj-back:hover{color:var(--brass-light);}

.eyebrow{
  font-family:var(--font-mono);font-size:12px;letter-spacing:0.16em;text-transform:uppercase;
  color:var(--brass-light);display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;
}
.eyebrow::before{content:'';width:7px;height:7px;background:var(--brass);transform:rotate(45deg);flex-shrink:0;}

.pj-head{margin-bottom:52px;max-width:620px;}
.pj-title{font-size:clamp(38px,6vw,60px);color:var(--linen);margin-bottom:18px;}
.pj-title em{font-style:normal;color:var(--brass-light);}
.pj-lede{font-size:16.5px;line-height:1.7;color:rgba(245,241,230,0.68);}

.pj-list{display:flex;flex-direction:column;gap:26px;}

.pj-card{
  display:grid;grid-template-columns:300px 1fr;
  background:rgba(19,27,48,0.55);
  border:1px solid var(--line);
  border-radius:20px;overflow:hidden;
  cursor:pointer;
  transition:transform 0.4s cubic-bezier(.22,.98,.28,1), border-color 0.3s ease, box-shadow 0.4s ease;
}
.pj-card:hover{
  transform:translateY(-4px);
  border-color:rgba(184,137,74,0.55);
  box-shadow:0 30px 60px -28px rgba(0,0,0,0.7);
}
.pj-card.is-soon{cursor:not-allowed;opacity:0.55;}
.pj-card.is-soon:hover{transform:none;border-color:var(--line);box-shadow:none;}

.pj-card-media{position:relative;min-height:230px;overflow:hidden;background:var(--ink-soft);}
.pj-card-media img{
  width:100%;height:100%;object-fit:cover;position:absolute;inset:0;
  transition:transform 0.7s cubic-bezier(.22,.98,.28,1);
}
.pj-card:hover .pj-card-media img{transform:scale(1.06);}
.pj-card-media::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(105deg, transparent 55%, rgba(19,27,48,0.65) 100%),
             linear-gradient(0deg, rgba(11,17,32,0.5), transparent 60%);
}
.pj-status{
  position:absolute;top:14px;left:14px;z-index:2;
  font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;
  padding:6px 12px;border-radius:999px;backdrop-filter:blur(6px);
}
.pj-status.live{background:rgba(75,160,90,0.2);color:#8fe0a0;border:1px solid rgba(120,220,140,0.4);}
.pj-status.soon{background:rgba(120,120,120,0.2);color:#c8c8c8;border:1px solid rgba(180,180,180,0.3);}

.pj-card-body{padding:30px 32px;display:flex;flex-direction:column;gap:20px;}
.pj-card-top h2{font-size:26px;color:var(--linen);margin-bottom:4px;}
.pj-card-sub{font-size:13.5px;color:var(--brass-light);font-family:var(--font-mono);letter-spacing:0.04em;}

.pj-meta{display:flex;flex-wrap:wrap;gap:10px 22px;padding-top:2px;}
.pj-meta span{
  display:inline-flex;align-items:center;gap:7px;
  font-size:13px;color:rgba(245,241,230,0.62);
}
.pj-meta svg{color:var(--brass);flex-shrink:0;}

.pj-open{
  margin-top:auto;display:inline-flex;align-items:center;gap:10px;
  font-weight:700;font-size:14.5px;color:var(--brass-light);
  padding-top:8px;
}
.pj-open-arrow{transition:transform 0.3s cubic-bezier(.22,.98,.28,1);}
.pj-card:hover .pj-open-arrow{transform:translateX(5px);}

.pj-foot{
  margin-top:60px;text-align:center;
  font-family:var(--font-mono);font-size:11.5px;letter-spacing:0.1em;
  color:rgba(245,241,230,0.32);
}

@media (max-width:720px){
  .pj-card{grid-template-columns:1fr;}
  .pj-card-media{min-height:200px;height:200px;}
  .pj-card-media::after{background:linear-gradient(0deg, rgba(19,27,48,0.7), transparent 55%);}
  .pj-card-body{padding:24px;}
}
        `}</style>
    );
}