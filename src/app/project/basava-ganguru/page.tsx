'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from 'next/font/google';
import {
    MapPin, Phone, MessageCircle, Compass, ArrowRight,
    Route, Trees, Landmark, Droplets, Zap, ShieldCheck, Waves,
    GraduationCap, Cross, Train, Building2, TrendingUp,
    Home as HomeIcon, Sparkles, Layers,
} from 'lucide-react';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

const PHONE = '+919980061727';
const PHONE_DISPLAY = '+91 99800 61727';

function waUrl(message: string) {
    return `https://wa.me/919980061727?text=${encodeURIComponent(message)}`;
}

/* ============ PROJECTS ============ */
type Project = {
    id: string;
    name: string;
    tagline: string;
    location: string;
    mapsUrl: string;
    plots: number;
    approval: string;
    roads: string;
    accent: 'brass' | 'emerald';
    icon: React.ElementType;
    layoutRoute: string;
    waMessage: string;
};

const PROJECTS: Project[] = [
    {
        id: 'koushik-enclave',
        name: 'Koushik Enclave',
        tagline: 'A premium gated layout for a modern lifestyle.',
        location: 'Shivamogga, Karnataka',
        mapsUrl: 'https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw',
        plots: 32,
        approval: 'SBUDA',
        roads: '40/30 ft',
        accent: 'brass',
        icon: Building2,
        // Real interactive layout map lives at /layout-map (KoushikEnclaveMap)
        layoutRoute: '/layout-map',
        waMessage: "Hi, I'm interested in the Koushik Enclave Residential Layout. Please share details.",
    },
    {
        id: 'basava-ganguru',
        name: 'Basava Ganguru',
        tagline: 'Wide roads, green spaces, and a growing corridor.',
        location: 'Shivamogga, Karnataka',
        mapsUrl: 'https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw',
        plots: 103,
        approval: 'SBUDA',
        roads: '40/30 ft',
        accent: 'emerald',
        icon: Trees,
        layoutRoute: '/basava-ganguru-map',
        waMessage: "Hi, I'm interested in the Basava Ganguru Residential Layout. Please share details.",
    },
];

const HIGHLIGHTS = [
    { icon: Route, title: 'Wide Roads', desc: 'Well-planned 40ft & 30ft internal roads for smooth movement and easy access.' },
    { icon: Droplets, title: 'Underground Drainage', desc: 'Modern underground drainage for a clean, hygienic and healthy environment.' },
    { icon: Trees, title: 'Dedicated Park', desc: 'Landscaped green park for leisure, relaxation and healthy living.' },
    { icon: Landmark, title: 'Civic Amenity Site', desc: 'Designated civic amenity space for community facilities and social infrastructure.' },
    { icon: Zap, title: '24x7 Electricity', desc: 'Uninterrupted power supply for a modern and comfortable lifestyle.' },
    { icon: Waves, title: 'Water Supply', desc: 'Reliable water connection for every plot ensuring daily convenience.' },
    { icon: Building2, title: 'STP Provision', desc: 'Sewage Treatment Plant provision for sustainable, eco-friendly living.' },
    { icon: ShieldCheck, title: 'Ready for Registration', desc: 'Clear titles and all approvals in place. Ready for immediate registration.' },
];

const LOCATIONS = [
    { icon: Route, dist: '200 m', place: 'From Existing 80ft Road' },
    { icon: Compass, dist: '300 m', place: 'From Upcoming 200ft Ring Road' },
    { icon: GraduationCap, dist: '800 m', place: 'Keladi Shivappa Nayaka University' },
    { icon: Cross, dist: '1 km', place: 'From Bapuji Ayurvedic Medical College' },
    { icon: GraduationCap, dist: '1.3 km', place: 'From JNNCE Engineering College' },
    { icon: GraduationCap, dist: '1.3 km', place: 'From Akshara PU College' },
    { icon: MapPin, dist: '5 min', place: 'To KSCA Cricket Stadium' },
    { icon: Cross, dist: '10 min', place: 'To Usha Multispeciality Hospital' },
    { icon: Cross, dist: '10 min', place: 'To Chandragiri Hospital' },
    { icon: Train, dist: '12 min', place: 'To Railway Station' },
    { icon: Landmark, dist: '13 min', place: 'To DC Office' },
];

const INVEST_REASONS = [
    { icon: TrendingUp, title: 'High Growth Potential', desc: 'A fast-developing corridor with rapid infrastructure growth.' },
    { icon: MapPin, title: 'Prime Location', desc: 'Excellent connectivity to institutions, hospitals and daily essentials.' },
    { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Clear titles, legal approvals and a well-planned layout.' },
    { icon: HomeIcon, title: 'End Use & Rental', desc: 'Perfect for building your dream home or earning rental income.' },
];

const APPRECIATION = [
    { year: '2024', value: 1800 },
    { year: '2025', value: 2800 },
    { year: '2026', value: 3300 },
    { year: '2027', value: 4100 },
    { year: '2028', value: 4800 },
];

function Reveal({ children, delay = 0, className, style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref) return;
        const ob = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        ob.observe(ref);
        return () => ob.disconnect();
    }, [ref]);
    return (
        <div
            ref={setRef}
            className={className}
            style={{
                ...style,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(22px)',
                transition: `opacity .6s cubic-bezier(.22,.98,.28,1) ${delay}s, transform .6s cubic-bezier(.22,.98,.28,1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* A CSS-only "site plan" motif used in place of a photo — unique per project via its accent + icon. */
function ProjectGraphic({ project }: { project: Project }) {
    const Icon = project.icon;
    return (
        <div className={`pc-graphic pc-graphic-${project.accent}`}>
            <div className="pc-graphic-plots" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} />
                ))}
            </div>
            <Icon className="pc-graphic-icon" aria-hidden="true" />
        </div>
    );
}

export default function ProjectsPage() {
    const router = useRouter();
    const maxVal = Math.max(...APPRECIATION.map((a) => a.value));
    const totalPlots = PROJECTS.reduce((sum, p) => sum + p.plots, 0);
    const generalWa = waUrl("Hi, I'm interested in your residential layouts in Shivamogga. Please share details.");

    return (
        <main className={`${display.variable} ${body.variable} ${mono.variable} bg-root`}>
            <Styles />

            {/* ============ HERO (dark ink) ============ */}
            <section className="bg-hero">
                <div className="bg-hero-glow" aria-hidden="true" />
                <div className="bg-hero-topbar">
                    <div className="bg-brand">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <rect x="2" y="16" width="20" height="2" fill="#e3be86" />
                            <rect x="3" y="8" width="4" height="8" fill="none" stroke="#e3be86" strokeWidth="1.3" />
                            <rect x="13" y="5" width="4" height="11" fill="none" stroke="#e3be86" strokeWidth="1.3" />
                        </svg>
                        <span>Vijayalaxmi C Patil</span>
                    </div>
                    <nav className="bg-nav">
                        <button onClick={() => scrollToId('projects')}>Projects</button>
                        <button onClick={() => scrollToId('location')}>Location</button>
                        <button onClick={() => scrollToId('invest')}>Invest</button>
                        <button onClick={() => scrollToId('contact')}>Contact</button>
                    </nav>
                </div>

                <Reveal className="bg-hero-inner">
                    <div className="bg-eyebrow on-dark">Developers &amp; Promoters · Shivamogga</div>
                    <h1 className="bg-hero-title">Shivamogga&rsquo;s Most<br />Trusted Address</h1>
                    <p className="bg-hero-lede">
                        From Koushik Enclave to Basava Ganguru, every layout we build carries the same
                        promise — SBUDA-approved titles, wide roads and landscaped parks, in the heart
                        of Shivamogga&rsquo;s fastest-growing corridor.
                    </p>

                    <div className="bg-cta-row">
                        <button className="bg-btn bg-btn-primary" onClick={() => scrollToId('projects')}>
                            <Layers size={17} /> View Projects
                        </button>
                        <a className="bg-btn bg-btn-wa" href={generalWa} target="_blank" rel="noopener noreferrer">
                            <MessageCircle size={17} /> WhatsApp
                        </a>
                        <a className="bg-btn bg-btn-call" href={`tel:${PHONE}`}>
                            <Phone size={17} /> Call
                        </a>
                    </div>

                    <div className="bg-hero-stats">
                        <div><b>2</b><span>Projects</span></div>
                        <div><b>{totalPlots}+</b><span>Plots</span></div>
                        <div><b>SBUDA</b><span>Approved</span></div>
                        <div><b>40/30 ft</b><span>Roads</span></div>
                    </div>
                </Reveal>
            </section>

            {/* ============ PROJECTS (light paper) ============ */}
            <section className="bg-sec bg-sec-paper" id="projects">
                <div className="bg-wrap">
                    <Reveal>
                        <div className="bg-eyebrow">Our Projects</div>
                        <h2 className="bg-h2">Choose Your Plot</h2>
                        <p className="bg-lede">
                            Two thoughtfully planned layouts, each SBUDA-approved and ready for registration.
                            Explore the interactive map for either project below.
                        </p>
                    </Reveal>

                    <div className="pc-grid">
                        {PROJECTS.map((p, i) => (
                            <Reveal key={p.id} delay={i * 0.08} className="pc-card">
                                <button
                                    className="pc-media"
                                    onClick={() => router.push(p.layoutRoute)}
                                    aria-label={`Open interactive layout map for ${p.name}`}
                                >
                                    <ProjectGraphic project={p} />
                                    <span className="pc-media-badge"><MapPin size={12} /> {p.location}</span>
                                    <span className="pc-media-hint"><Compass size={14} /> Tap to explore</span>
                                </button>

                                <div className="pc-body">
                                    <h3 className="pc-name">{p.name}</h3>
                                    <p className="pc-tagline">{p.tagline}</p>

                                    <div className="pc-stats">
                                        <div><b>{p.plots}</b><span>Plots</span></div>
                                        <div><b>{p.approval}</b><span>Approved</span></div>
                                        <div><b>{p.roads}</b><span>Roads</span></div>
                                    </div>

                                    <div className="pc-actions">
                                        <button className="bg-btn bg-btn-primary bg-btn-sm" onClick={() => router.push(p.layoutRoute)}>
                                            <Compass size={15} /> View Map
                                        </button>
                                        <a className="bg-btn bg-btn-wa bg-btn-sm" href={waUrl(p.waMessage)} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle size={15} /> WhatsApp
                                        </a>
                                        <a className="bg-btn bg-btn-call bg-btn-sm" href={`tel:${PHONE}`}>
                                            <Phone size={15} /> Call
                                        </a>
                                    </div>

                                    <a className="pc-directions" href={p.mapsUrl} target="_blank" rel="noopener noreferrer">
                                        <MapPin size={13} /> Get directions on Google Maps <ArrowRight size={13} />
                                    </a>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ KEY HIGHLIGHTS (dark ink) ============ */}
            <section className="bg-sec bg-sec-ink">
                <div className="bg-wrap">
                    <Reveal>
                        <div className="bg-eyebrow on-dark center">Key Highlights</div>
                        <h2 className="bg-h2 on-dark center">Crafted for a Better Lifestyle</h2>
                        <p className="bg-lede center on-dark">Every layout — Koushik Enclave and Basava Ganguru alike — is built to the same high standard.</p>
                    </Reveal>
                    <div className="bg-grid">
                        {HIGHLIGHTS.map((h, i) => {
                            const Icon = h.icon;
                            return (
                                <Reveal key={h.title} delay={(i % 2) * 0.06} className="bg-card">
                                    <div className="bg-card-icon"><Icon size={20} /></div>
                                    <h3>{h.title}</h3>
                                    <p>{h.desc}</p>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============ LOCATION (light mist) ============ */}
            <section className="bg-sec bg-sec-mist" id="location">
                <div className="bg-wrap">
                    <Reveal>
                        <div className="bg-eyebrow">Location Advantages</div>
                        <h2 className="bg-h2">Everything, minutes away</h2>
                        <p className="bg-lede">
                            Both layouts sit in the fast-growing corridor of Shivamogga, with
                            unmatched connectivity to universities, hospitals and transport hubs.
                        </p>
                    </Reveal>

                    <div className="bg-loc-list">
                        {LOCATIONS.map((l, i) => {
                            const Icon = l.icon;
                            return (
                                <Reveal key={l.place} delay={(i % 4) * 0.04} className="bg-loc-item">
                                    <div className="bg-loc-icon"><Icon size={16} /></div>
                                    <div className="bg-loc-text">
                                        <b>{l.dist}</b>
                                        <span>{l.place}</span>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal delay={0.1} className="bg-maps-row">
                        {PROJECTS.map((p) => (
                            <a key={p.id} className="bg-btn bg-btn-primary bg-maps-btn" href={p.mapsUrl} target="_blank" rel="noopener noreferrer">
                                <MapPin size={16} /> {p.name} on Google Maps
                            </a>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ============ INVESTMENT (dark ink) ============ */}
            <section className="bg-sec bg-sec-ink" id="invest">
                <div className="bg-wrap">
                    <Reveal>
                        <div className="bg-eyebrow on-dark center">Invest Today, Profit Tomorrow</div>
                        <h2 className="bg-h2 on-dark center">A City on the Rise</h2>
                    </Reveal>

                    <div className="bg-grid bg-grid-invest">
                        {INVEST_REASONS.map((r, i) => {
                            const Icon = r.icon;
                            return (
                                <Reveal key={r.title} delay={(i % 2) * 0.06} className="bg-card">
                                    <div className="bg-card-icon"><Icon size={20} /></div>
                                    <h3>{r.title}</h3>
                                    <p>{r.desc}</p>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal className="bg-appr">
                        <div className="bg-appr-head">
                            <div className="bg-eyebrow on-dark">Value Appreciation</div>
                            <span className="bg-appr-note">Indicative &#8377; / sq.ft</span>
                        </div>
                        <div className="bg-appr-chart">
                            {APPRECIATION.map((a) => (
                                <div key={a.year} className="bg-appr-col">
                                    <span className="bg-appr-val">{(a.value / 1000).toFixed(1)}k{a.year === '2028' ? '+' : ''}</span>
                                    <div className="bg-appr-bar" style={{ height: `${(a.value / maxVal) * 100}%` }} />
                                    <span className="bg-appr-year">{a.year}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ============ CONTACT (light paper) ============ */}
            <section className="bg-sec bg-sec-paper bg-contact" id="contact">
                <div className="bg-wrap">
                    <Reveal className="bg-contact-inner">
                        <Sparkles size={24} className="bg-contact-spark" />
                        <h2 className="bg-h2 center">Your Dream Home Awaits</h2>
                        <p className="bg-lede center">
                            Walk in, explore either layout, and reserve your plot. We&rsquo;re here to
                            help you build your future.
                        </p>
                        <div className="bg-cta-row bg-cta-center">
                            <button className="bg-btn bg-btn-primary" onClick={() => scrollToId('projects')}>
                                <Layers size={17} /> View Projects
                            </button>
                            <a className="bg-btn bg-btn-wa" href={generalWa} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={17} /> WhatsApp
                            </a>
                            <a className="bg-btn bg-btn-call" href={`tel:${PHONE}`}>
                                <Phone size={17} /> Call
                            </a>
                        </div>
                        <div className="bg-contact-num">{PHONE_DISPLAY}</div>
                    </Reveal>
                </div>
            </section>

            <footer className="bg-foot">
                <div>Vijayalaxmi C Patil · Developers &amp; Promoters · Shivamogga</div>
                <div className="bg-foot-sub">Built by Train IQ · trainiq.in</div>
            </footer>

            {/* Floating quick actions */}
            <div className="bg-fab">
                <a className="bg-fab-btn bg-fab-wa" href={generalWa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <MessageCircle size={22} />
                </a>
                <a className="bg-fab-btn bg-fab-call" href={`tel:${PHONE}`} aria-label="Call">
                    <Phone size={20} />
                </a>
            </div>
        </main>
    );
}

function Styles() {
    return (
        <style jsx global>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.bg-root{
  --ink:#0b1120; --ink-soft:#131b30;
  --paper:#faf7ef; --mist:#e7e1d2; --linen:#f5f1e6;
  --brass:#b8894a; --brass-light:#e3be86; --brass-dark:#8f6a38;
  --emerald:#2d8c6e; --emerald-light:#7fd9b6; --emerald-dark:#1f6650;
  --graphite:#2b2a26; --graphite-soft:#57544c;
  --line-dark:rgba(184,137,74,0.28);
  --line-light:rgba(43,42,38,0.12);
  --muted-dark:rgba(245,241,230,0.66);
  --wa:#25D366; --call:#3d8bf0;
  --font-display:'Bricolage Grotesque',serif;
  --font-body:'Manrope',sans-serif;
  --font-mono:'IBM Plex Mono',monospace;
  font-family:var(--font-body);color:var(--graphite);-webkit-font-smoothing:antialiased;overflow-x:hidden;
  background:var(--paper);
}
.bg-root img{max-width:100%;display:block;}
.bg-root h1,.bg-root h2,.bg-root h3{font-family:var(--font-display);font-weight:700;letter-spacing:-0.01em;line-height:1.08;}
.bg-root :focus-visible{outline:2px solid var(--brass);outline-offset:3px;}
.bg-root button{font-family:inherit;}

/* eyebrow / headings */
.bg-eyebrow{font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
  color:var(--brass-dark);display:inline-flex;align-items:center;gap:9px;margin-bottom:14px;}
.bg-eyebrow::before{content:'';width:7px;height:7px;background:var(--brass);transform:rotate(45deg);flex-shrink:0;}
.bg-eyebrow.on-dark{color:var(--brass-light);}
.bg-eyebrow.center{justify-content:center;}
.bg-h2{font-size:clamp(24px,6vw,38px);color:var(--ink);margin-bottom:16px;}
.bg-h2.on-dark{color:var(--linen);}
.bg-h2.center{text-align:center;margin-left:auto;margin-right:auto;max-width:640px;}
.bg-lede{font-size:15.5px;line-height:1.68;color:var(--graphite-soft);max-width:560px;}
.bg-lede.center{text-align:center;margin:0 auto;color:var(--graphite-soft);}
.bg-lede.on-dark{color:var(--muted-dark);}
.bg-h2.center + .bg-lede,.bg-eyebrow.center{margin-bottom:16px;}

/* sections — mobile first: generous vertical padding, tight sides */
.bg-sec{padding:56px 0;}
.bg-wrap{max-width:1100px;margin:0 auto;padding:0 20px;}
.bg-sec-paper{background:var(--paper);}
.bg-sec-mist{background:var(--mist);}
.bg-sec-ink{background:
  radial-gradient(ellipse 700px 400px at 80% 0%, rgba(184,137,74,0.14), transparent 60%),
  var(--ink);color:var(--linen);}
.bg-sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:24px;}

/* HERO */
.bg-hero{position:relative;padding:0 0 52px;overflow:hidden;
  background:
    radial-gradient(ellipse 700px 500px at 85% -10%, rgba(184,137,74,0.2), transparent 55%),
    radial-gradient(ellipse 600px 500px at 0% 100%, rgba(19,27,48,0.9), transparent 55%),
    var(--ink);
  color:var(--linen);}
.bg-hero-glow{position:absolute;top:-60px;right:-100px;width:420px;height:420px;
  background:radial-gradient(circle,rgba(184,137,74,0.16),transparent 65%);pointer-events:none;}
.bg-hero-topbar{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;
  padding:18px 20px;max-width:1100px;margin:0 auto;}
.bg-brand{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:var(--brass-light);font-family:var(--font-display);}
.bg-nav{display:none;}
.bg-nav button{background:none;border:none;cursor:pointer;color:var(--muted-dark);font-size:13px;font-weight:600;
  letter-spacing:0.01em;transition:color .2s;}
.bg-nav button:hover{color:var(--brass-light);}
.bg-hero-inner{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:14px 20px 0;}
.bg-hero-title{font-size:clamp(34px,10vw,60px);line-height:1.05;margin-bottom:14px;
  background:linear-gradient(180deg,#fbf3dd,#e3be86 55%,#b8894a);
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.bg-hero-lede{font-size:15.5px;line-height:1.7;color:var(--muted-dark);max-width:560px;margin-bottom:24px;}
.bg-hero-stats{display:flex;gap:0;margin-top:28px;flex-wrap:wrap;row-gap:14px;}
.bg-hero-stats > div{padding:0 18px;border-left:1px solid var(--line-dark);display:flex;flex-direction:column;gap:2px;}
.bg-hero-stats > div:first-child{padding-left:0;border-left:none;}
.bg-hero-stats b{font-family:var(--font-mono);font-size:19px;font-weight:600;color:var(--brass-light);}
.bg-hero-stats span{font-size:11.5px;color:var(--muted-dark);}

/* buttons */
.bg-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;
  font-family:var(--font-body);font-weight:700;font-size:14px;padding:13px 20px;border-radius:999px;border:none;
  transition:transform .26s cubic-bezier(.22,.98,.28,1), box-shadow .26s, filter .2s;text-decoration:none;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bg-btn svg{flex-shrink:0;}
.bg-btn:active{transform:scale(.97);}
.bg-btn-sm{padding:10px 16px;font-size:12.5px;}
.bg-btn-primary{background:linear-gradient(135deg,var(--brass-light),var(--brass) 55%,var(--brass-dark));color:#1a1305;
  box-shadow:0 10px 26px -10px rgba(184,137,74,0.6);}
.bg-btn-wa{background:var(--wa);color:#fff;box-shadow:0 10px 26px -12px rgba(37,211,102,0.55);}
.bg-btn-call{background:var(--call);color:#fff;box-shadow:0 10px 26px -12px rgba(61,139,240,0.5);}
.bg-cta-row{display:flex;flex-wrap:wrap;gap:10px;}
.bg-cta-row .bg-btn{flex:1 1 0;min-width:0;padding-left:12px;padding-right:12px;}
.bg-cta-center{justify-content:center;}

/* card grid (highlights / invest) — mobile: 2 cols compact */
.bg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:26px;}
.bg-card{background:rgba(19,27,48,0.5);border:1px solid var(--line-dark);border-radius:14px;padding:20px 16px;
  transition:transform .3s cubic-bezier(.22,.98,.28,1), border-color .3s, background .3s;}
.bg-card:hover{transform:translateY(-3px);border-color:rgba(184,137,74,0.5);background:rgba(19,27,48,0.75);}
.bg-card-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  background:rgba(184,137,74,0.14);color:var(--brass-light);margin-bottom:14px;transition:background .3s,transform .3s;}
.bg-card:hover .bg-card-icon{background:var(--brass);color:#1a1305;transform:scale(1.06);}
.bg-card h3{font-size:15px;color:var(--linen);margin-bottom:6px;}
.bg-card p{font-size:12.5px;line-height:1.55;color:var(--muted-dark);}

/* PROJECT CARDS */
.pc-grid{display:grid;grid-template-columns:1fr;gap:22px;margin-top:30px;}
.pc-card{background:#fff;border:1px solid var(--line-light);border-radius:20px;overflow:hidden;
  box-shadow:0 20px 50px -30px rgba(43,42,38,0.4);transition:transform .3s cubic-bezier(.22,.98,.28,1), box-shadow .3s;}
.pc-card:hover{transform:translateY(-4px);box-shadow:0 26px 60px -28px rgba(43,42,38,0.5);}
.pc-media{position:relative;display:block;width:100%;aspect-ratio:16/9;border:none;padding:0;cursor:pointer;overflow:hidden;}

/* unique decorative graphic per project, in place of a photo */
.pc-graphic{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.pc-graphic-brass{background:
    linear-gradient(160deg, rgba(184,137,74,0.55), rgba(11,17,32,0.96) 70%),
    var(--ink);}
.pc-graphic-emerald{background:
    linear-gradient(160deg, rgba(45,140,110,0.55), rgba(11,17,32,0.96) 70%),
    var(--ink);}
.pc-graphic-plots{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(2,1fr);
  gap:8px;padding:18px;opacity:0.5;}
.pc-graphic-plots span{border-radius:4px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.18);}
.pc-graphic-brass .pc-graphic-plots span{background:rgba(227,190,134,0.16);border-color:rgba(227,190,134,0.22);}
.pc-graphic-emerald .pc-graphic-plots span{background:rgba(127,217,182,0.16);border-color:rgba(127,217,182,0.22);}
.pc-graphic-icon{position:relative;z-index:2;width:56px;height:56px;color:rgba(255,255,255,0.85);}
.pc-graphic-brass .pc-graphic-icon{color:var(--brass-light);}
.pc-graphic-emerald .pc-graphic-icon{color:var(--emerald-light);}
.pc-media-badge{position:absolute;top:12px;left:12px;z-index:3;display:inline-flex;align-items:center;gap:5px;
  background:rgba(10,16,36,0.72);backdrop-filter:blur(4px);color:var(--brass-light);font-size:11px;font-weight:600;
  padding:6px 11px;border-radius:999px;}
.pc-graphic-emerald ~ .pc-media-badge, .pc-media .pc-graphic-emerald + .pc-media-badge{color:var(--emerald-light);}
.pc-media-hint{position:absolute;bottom:12px;left:12px;z-index:3;display:inline-flex;align-items:center;gap:6px;
  background:rgba(10,16,36,0.72);backdrop-filter:blur(4px);color:var(--linen);font-size:11.5px;font-weight:600;
  padding:6px 12px;border-radius:999px;transition:gap .25s;}
.pc-media:hover .pc-media-hint{gap:9px;}
.pc-body{padding:22px 20px 24px;}
.pc-name{font-size:22px;color:var(--ink);margin-bottom:4px;}
.pc-tagline{font-size:13px;color:var(--graphite-soft);line-height:1.5;margin-bottom:18px;}
.pc-stats{display:flex;gap:0;margin-bottom:20px;}
.pc-stats > div{padding:0 16px;border-left:1px solid var(--line-light);display:flex;flex-direction:column;gap:2px;}
.pc-stats > div:first-child{padding-left:0;border-left:none;}
.pc-stats b{font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--brass-dark);}
.pc-stats span{font-size:10.5px;color:var(--graphite-soft);text-transform:uppercase;letter-spacing:0.04em;}
.pc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.pc-actions .bg-btn{flex:1 1 0;min-width:0;}
.pc-directions{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--brass-dark);
  text-decoration:none;transition:gap .2s;}
.pc-directions:hover{gap:9px;}

/* LOCATION */
.bg-loc-list{display:flex;flex-direction:column;gap:10px;margin:24px 0;}
.bg-loc-item{display:flex;gap:12px;align-items:center;padding:13px 15px;border:1px solid var(--line-light);border-radius:12px;
  background:#fff;transition:border-color .3s,box-shadow .3s;}
.bg-loc-item:hover{border-color:rgba(184,137,74,0.45);box-shadow:0 8px 20px -14px rgba(43,42,38,0.4);}
.bg-loc-icon{width:36px;height:36px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;
  background:rgba(184,137,74,0.12);color:var(--brass-dark);}
.bg-loc-text{display:flex;flex-direction:column;gap:2px;min-width:0;}
.bg-loc-text b{font-family:var(--font-mono);font-size:14.5px;color:var(--brass-dark);font-weight:600;}
.bg-loc-text span{font-size:12.5px;line-height:1.35;color:var(--graphite-soft);}
.bg-maps-row{display:flex;flex-direction:column;gap:10px;}
.bg-maps-btn{width:100%;}

/* INVESTMENT chart */
.bg-grid-invest{margin-bottom:34px;}
.bg-appr{border:1px solid var(--line-dark);border-radius:16px;padding:22px 18px;background:rgba(19,27,48,0.5);}
.bg-appr-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;}
.bg-appr-head .bg-eyebrow{margin-bottom:0;}
.bg-appr-note{font-family:var(--font-mono);font-size:10px;color:var(--muted-dark);}
.bg-appr-chart{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;height:170px;}
.bg-appr-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;height:100%;}
.bg-appr-val{font-family:var(--font-mono);font-size:11.5px;font-weight:600;color:var(--brass-light);}
.bg-appr-bar{width:100%;max-width:56px;border-radius:7px 7px 0 0;
  background:linear-gradient(180deg,var(--brass-light),var(--brass-dark));
  box-shadow:0 -5px 16px -6px rgba(184,137,74,0.5);animation:barGrow .9s cubic-bezier(.22,.98,.28,1);}
@keyframes barGrow{from{height:0 !important;opacity:0;}to{opacity:1;}}
.bg-appr-year{font-size:12px;font-weight:600;color:var(--muted-dark);}

/* CONTACT */
.bg-contact-inner{display:flex;flex-direction:column;align-items:center;text-align:center;
  border:1px solid var(--line-light);border-radius:20px;padding:38px 22px;
  background:radial-gradient(ellipse 80% 120% at 50% 0%, rgba(184,137,74,0.1), transparent 60%),#fff;
  box-shadow:0 24px 50px -30px rgba(43,42,38,0.4);}
.bg-contact-spark{color:var(--brass);margin-bottom:14px;}
.bg-contact-inner .bg-cta-row{margin:26px 0 16px;width:100%;}
.bg-contact-num{margin-top:6px;font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--ink);letter-spacing:0.01em;}

/* footer */
.bg-foot{text-align:center;padding:34px 20px;background:#080c18;color:var(--muted-dark);font-size:12.5px;line-height:1.6;}
.bg-foot-sub{font-family:var(--font-mono);font-size:10.5px;color:rgba(245,241,230,0.4);letter-spacing:0.1em;margin-top:6px;}

/* floating quick actions */
.bg-fab{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;gap:11px;}
.bg-fab-btn{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 12px 24px -8px rgba(0,0,0,0.4);transition:transform .26s cubic-bezier(.22,.98,.28,1);}
.bg-fab-btn:active{transform:scale(.92);}
.bg-fab-wa{background:var(--wa);}
.bg-fab-call{background:var(--call);}

/* ============ TABLET / DESKTOP ============ */
@media (min-width:680px){
  .bg-sec{padding:80px 0;}
  .bg-wrap{padding:0 32px;}
  .bg-hero{padding-bottom:70px;}
  .bg-hero-inner{padding:20px 32px 0;}
  .bg-hero-topbar{padding:20px 32px;}
  .bg-nav{display:flex;gap:26px;}
  .bg-hero-lede,.bg-hero-title{max-width:640px;}
  .bg-cta-row .bg-btn{flex:0 0 auto;}
  .bg-grid{grid-template-columns:repeat(4,1fr);gap:16px;}
  .pc-grid{grid-template-columns:1fr 1fr;gap:24px;}
  .bg-loc-list{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .bg-maps-row{flex-direction:row;}
  .bg-maps-btn{width:auto;flex:1 1 0;}
  .bg-appr-chart{height:210px;gap:14px;}
  .bg-appr-val{font-size:13px;}
  .bg-appr-bar{max-width:70px;}
  .bg-contact-inner{padding:52px 40px;}
  .bg-contact-inner .bg-cta-row{width:auto;}
  .bg-contact-inner .bg-cta-row .bg-btn{flex:0 0 auto;}
  .bg-fab{right:24px;bottom:24px;}
  .bg-hero-stats b{font-size:22px;}
}
@media (min-width:980px){
  .bg-hero-title{font-size:64px;}
  .bg-loc-list{grid-template-columns:1fr 1fr 1fr;}
}
@media (prefers-reduced-motion:reduce){
  .bg-appr-bar{animation:none;}
  .bg-btn,.bg-card,.pc-card,.bg-fab-btn,.pc-media-hint{transition:none;}
}
    `}</style>
    );
}