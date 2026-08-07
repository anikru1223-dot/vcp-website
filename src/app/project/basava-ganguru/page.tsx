'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from 'next/font/google';
import {
    MapPin, Phone, MessageCircle, ArrowLeft, Compass, ArrowRight,
    Route, Trees, Landmark, Droplets, Zap, ShieldCheck, Waves,
    GraduationCap, Cross, Train, Building2, TrendingUp, CheckCircle2,
    Home as HomeIcon, Users, Sparkles,
} from 'lucide-react';

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

const PHONE = '+919980061727';
const PHONE_DISPLAY = '+91 99800 61727';
const MAPS_URL = 'https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw';
const WA_URL = `https://wa.me/919980061727?text=${encodeURIComponent("Hi, I'm interested in the Basava Ganguru Residential Layout. Please share details.")}`;

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
    { icon: GraduationCap, dist: '800 m', place: 'Keladi Shivappa Nayaka University of Agri. & Horticultural Sciences' },
    { icon: Cross, dist: '1 km', place: 'From Bapuji Ayurvedic Medical College' },
    { icon: GraduationCap, dist: '1.3 km', place: 'From JNNCE Engineering College' },
    { icon: GraduationCap, dist: '1.3 km', place: 'From Akshara PU College' },
    { icon: MapPin, dist: '5 min', place: 'To KSCA Cricket Stadium' },
    { icon: Cross, dist: '10 min', place: 'To Usha Multispeciality Hospital' },
    { icon: Cross, dist: '10 min', place: 'To Chandragiri Multispeciality Hospital' },
    { icon: Train, dist: '12 min', place: 'To Railway Station' },
    { icon: Landmark, dist: '13 min', place: 'To DC Office' },
];

const INVEST_REASONS = [
    { icon: TrendingUp, title: 'High Growth Potential', desc: 'Located in a fast-developing corridor with rapid infrastructure growth.' },
    { icon: MapPin, title: 'Prime Location', desc: 'Excellent connectivity to educational institutions, hospitals and daily essentials.' },
    { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Clear titles, legal approvals and a well-planned layout for complete peace of mind.' },
    { icon: HomeIcon, title: 'End Use & Rental', desc: 'Perfect for building your dream home or earning rental income.' },
];

const APPRECIATION = [
    { year: '2024', value: 2300 },
    { year: '2025', value: 2600 },
    { year: '2026', value: 2300 },
    { year: '2027', value: 3300 },
    { year: '2028', value: 4000 },
];

function Reveal({ children, delay = 0, className, style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref) return;
        const ob = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } },
            { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
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
                transform: visible ? 'none' : 'translateY(26px)',
                transition: `opacity .7s cubic-bezier(.22,.98,.28,1) ${delay}s, transform .7s cubic-bezier(.22,.98,.28,1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

export default function BasavaGanguruPage() {
    const router = useRouter();
    const maxVal = Math.max(...APPRECIATION.map((a) => a.value));

    return (
        <main className={`${display.variable} ${body.variable} ${mono.variable} bg-root`}>
            <Styles />

            {/* Top bar */}
            <div className="bg-topbar">
                <button className="bg-back" onClick={() => router.push('/')}>
                    <ArrowLeft size={16} /> Back to site
                </button>
                <div className="bg-brand">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <rect x="2" y="16" width="20" height="2" fill="#e3be86" />
                        <rect x="3" y="8" width="4" height="8" fill="none" stroke="#e3be86" strokeWidth="1.2" />
                        <rect x="13" y="5" width="4" height="11" fill="none" stroke="#e3be86" strokeWidth="1.2" />
                    </svg>
                    <span>Vijayalaxmi C Patil</span>
                </div>
            </div>

            {/* HERO */}
            <section className="bg-hero">
                <div className="bg-hero-glow" aria-hidden="true" />
                <Reveal className="bg-hero-inner">
                    <div className="bg-eyebrow">Premium Residential Layout</div>
                    <h1 className="bg-hero-title">Basava Ganguru</h1>
                    <div className="bg-hero-loc">
                        <MapPin size={16} /> Shivamogga, Karnataka
                    </div>
                    <p className="bg-hero-lede">
                        Build your dream home in Shivamogga. A well-planned, SBUDA-approved gated
                        community of 32 premium plots — wide roads, landscaped park, underground
                        drainage, and every approval in place.
                    </p>

                    <div className="bg-price">
                        <span className="bg-price-label">Plots starting from</span>
                        <span className="bg-price-val">&#8377;2,300 <em>per sq.ft</em></span>
                    </div>

                    <div className="bg-hero-cta">
                        <button className="bg-btn bg-btn-primary" onClick={() => router.push('/layout-map')}>
                            <Compass size={18} /> View Interactive Map
                        </button>
                        <a className="bg-btn bg-btn-wa" href={WA_URL} target="_blank" rel="noopener noreferrer">
                            <MessageCircle size={18} /> WhatsApp
                        </a>
                        <a className="bg-btn bg-btn-call" href={`tel:${PHONE}`}>
                            <Phone size={18} /> Call
                        </a>
                    </div>

                    <div className="bg-hero-stats">
                        <div><b>32</b><span>Residential Plots</span></div>
                        <div><b>SBUDA</b><span>Approved</span></div>
                        <div><b>40 & 30 ft</b><span>Wide Roads</span></div>
                    </div>
                </Reveal>
            </section>

            {/* LAYOUT IMAGE + map link */}
            <section className="bg-section">
                <Reveal className="bg-plan">
                    <div className="bg-plan-head">
                        <div>
                            <div className="bg-eyebrow">Master Layout Plan</div>
                            <h2 className="bg-h2">Well planned. Well connected.</h2>
                        </div>
                        <button className="bg-btn bg-btn-primary bg-btn-sm" onClick={() => router.push('/layout-map')}>
                            <Compass size={17} /> Open Interactive Layout
                        </button>
                    </div>
                    <button className="bg-plan-img" onClick={() => router.push('/layout-map')} aria-label="Open interactive layout map">
                        <img src="/basava-ganguru-layout.png" alt="Basava Ganguru master layout plan with 32 plots" />
                        <span className="bg-plan-hint"><Compass size={16} /> Tap to explore plot by plot</span>
                    </button>
                </Reveal>
            </section>

            {/* KEY HIGHLIGHTS */}
            <section className="bg-section bg-section-alt">
                <Reveal>
                    <div className="bg-eyebrow center">Key Highlights</div>
                    <h2 className="bg-h2 center">Crafted for a Better Lifestyle</h2>
                </Reveal>
                <div className="bg-grid bg-grid-4">
                    {HIGHLIGHTS.map((h, i) => {
                        const Icon = h.icon;
                        return (
                            <Reveal key={h.title} delay={(i % 4) * 0.06} className="bg-card">
                                <div className="bg-card-icon"><Icon size={22} /></div>
                                <h3>{h.title}</h3>
                                <p>{h.desc}</p>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* LOCATION ADVANTAGES */}
            <section className="bg-section">
                <div className="bg-loc-grid">
                    <div>
                        <Reveal>
                            <div className="bg-eyebrow">Location Advantages</div>
                            <h2 className="bg-h2">Everything, minutes away</h2>
                            <p className="bg-lede">
                                Strategically located in the fast-growing corridor of Shivamogga, with
                                unmatched connectivity to universities, hospitals, transport hubs and
                                daily conveniences.
                            </p>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <a className="bg-btn bg-btn-primary bg-btn-sm bg-maps-btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                                <MapPin size={17} /> Open Location in Google Maps
                            </a>
                        </Reveal>
                    </div>

                    <div className="bg-loc-list">
                        {LOCATIONS.map((l, i) => {
                            const Icon = l.icon;
                            return (
                                <Reveal key={l.place} delay={(i % 6) * 0.04} className="bg-loc-item">
                                    <div className="bg-loc-icon"><Icon size={17} /></div>
                                    <div className="bg-loc-text">
                                        <b>{l.dist}</b>
                                        <span>{l.place}</span>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* INVESTMENT */}
            <section className="bg-section bg-section-alt">
                <Reveal>
                    <div className="bg-eyebrow center">Invest Today, Profit Tomorrow</div>
                    <h2 className="bg-h2 center">A Smart Investment in a City on the Rise</h2>
                </Reveal>

                <div className="bg-grid bg-grid-4 bg-invest-reasons">
                    {INVEST_REASONS.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <Reveal key={r.title} delay={(i % 4) * 0.06} className="bg-card">
                                <div className="bg-card-icon"><Icon size={22} /></div>
                                <h3>{r.title}</h3>
                                <p>{r.desc}</p>
                            </Reveal>
                        );
                    })}
                </div>

                <Reveal className="bg-appr">
                    <div className="bg-appr-head">
                        <div className="bg-eyebrow">Property Value Appreciation</div>
                        <span className="bg-appr-note">Indicative &#8377; per sq.ft · based on current market trends</span>
                    </div>
                    <div className="bg-appr-chart">
                        {APPRECIATION.map((a) => (
                            <div key={a.year} className="bg-appr-col">
                                <span className="bg-appr-val">&#8377;{a.value.toLocaleString()}{a.year === '2028' ? '+' : ''}</span>
                                <div className="bg-appr-bar" style={{ height: `${(a.value / maxVal) * 100}%` }} />
                                <span className="bg-appr-year">{a.year}</span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </section>

            {/* CONTACT / CTA */}
            <section className="bg-section bg-contact">
                <Reveal className="bg-contact-inner">
                    <Sparkles size={26} className="bg-contact-spark" />
                    <h2 className="bg-h2 center">Your Dream Home Awaits</h2>
                    <p className="bg-lede center">
                        Walk in, explore, and reserve your plot at Basava Ganguru. We&rsquo;re here to
                        help you find the perfect plot and build your future.
                    </p>
                    <div className="bg-contact-cta">
                        <button className="bg-btn bg-btn-primary" onClick={() => router.push('/layout-map')}>
                            <Compass size={18} /> View Interactive Map
                        </button>
                        <a className="bg-btn bg-btn-wa" href={WA_URL} target="_blank" rel="noopener noreferrer">
                            <MessageCircle size={18} /> WhatsApp Us
                        </a>
                        <a className="bg-btn bg-btn-call" href={`tel:${PHONE}`}>
                            <Phone size={18} /> {PHONE_DISPLAY}
                        </a>
                    </div>
                    <a className="bg-contact-maps" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                        <MapPin size={15} /> Get directions on Google Maps
                    </a>
                </Reveal>
            </section>

            <footer className="bg-foot">
                <div>Vijayalaxmi C Patil · Developers &amp; Promoters · Shivamogga, Karnataka</div>
                <div className="bg-foot-sub">Built by Train IQ · trainiq.in</div>
            </footer>

            {/* Floating quick actions */}
            <div className="bg-fab">
                <a className="bg-fab-btn bg-fab-wa" href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <MessageCircle size={24} />
                </a>
                <a className="bg-fab-btn bg-fab-call" href={`tel:${PHONE}`} aria-label="Call">
                    <Phone size={22} />
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
  --ink:#0a1024; --ink-2:#0d1530; --ink-3:#111c3d;
  --gold:#c99b4e; --gold-light:#e6c98a; --gold-deep:#a8783a;
  --linen:#f3efe4; --muted:rgba(243,239,228,0.66); --muted-2:rgba(243,239,228,0.45);
  --line:rgba(201,155,78,0.26);
  --wa:#25D366; --call:#3d8bf0;
  --font-display:'Bricolage Grotesque',serif;
  --font-body:'Manrope',sans-serif;
  --font-mono:'IBM Plex Mono',monospace;
  position:relative;min-height:100vh;
  background:
    radial-gradient(ellipse 1100px 700px at 78% -5%, rgba(201,155,78,0.16), transparent 55%),
    radial-gradient(ellipse 900px 800px at 10% 100%, rgba(17,28,61,0.9), transparent 55%),
    var(--ink);
  color:var(--linen);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.bg-root img{max-width:100%;display:block;}
.bg-root h1,.bg-root h2,.bg-root h3{font-family:var(--font-display);font-weight:700;letter-spacing:-0.01em;line-height:1.06;}
.bg-root :focus-visible{outline:2px solid var(--gold);outline-offset:3px;}

/* eyebrow / headings */
.bg-eyebrow{
  font-family:var(--font-mono);font-size:11.5px;letter-spacing:0.22em;text-transform:uppercase;
  color:var(--gold-light);display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;
}
.bg-eyebrow::before{content:'';width:22px;height:1px;background:linear-gradient(90deg,var(--gold),transparent);}
.bg-eyebrow.center{justify-content:center;}
.bg-eyebrow.center::before{width:16px;}
.bg-eyebrow.center::after{content:'';width:16px;height:1px;background:linear-gradient(90deg,transparent,var(--gold));}
.bg-h2{font-size:clamp(26px,3.6vw,40px);color:var(--linen);margin-bottom:18px;}
.bg-h2.center{text-align:center;margin-left:auto;margin-right:auto;margin-bottom:40px;max-width:760px;}
.bg-lede{font-size:16px;line-height:1.7;color:var(--muted);max-width:520px;}
.bg-lede.center{text-align:center;margin:0 auto;}

/* top bar */
.bg-topbar{
  position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;
  padding:20px 26px;max-width:1180px;margin:0 auto;
}
.bg-back{
  display:inline-flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;
  font-family:var(--font-mono);font-size:12px;letter-spacing:0.06em;color:var(--muted);transition:color .25s;
}
.bg-back:hover{color:var(--gold-light);}
.bg-brand{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:var(--gold-light);font-family:var(--font-display);}

/* hero */
.bg-hero{position:relative;padding:40px 26px 70px;max-width:1180px;margin:0 auto;}
.bg-hero-glow{position:absolute;top:-40px;right:-120px;width:520px;height:520px;
  background:radial-gradient(circle,rgba(201,155,78,0.18),transparent 65%);pointer-events:none;}
.bg-hero-inner{position:relative;z-index:2;max-width:660px;}
.bg-hero-title{font-size:clamp(44px,8vw,88px);line-height:0.98;margin-bottom:14px;
  background:linear-gradient(180deg,#fbf3dd,#e6c98a 55%,#c99b4e);
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.bg-hero-loc{display:inline-flex;align-items:center;gap:8px;color:var(--gold-light);font-size:14px;font-weight:600;margin-bottom:22px;}
.bg-hero-lede{font-size:17px;line-height:1.72;color:var(--muted);max-width:560px;margin-bottom:30px;}
.bg-price{display:inline-flex;flex-direction:column;gap:2px;padding:16px 26px;margin-bottom:30px;
  border:1px solid var(--line);border-radius:16px;background:rgba(13,21,48,0.6);backdrop-filter:blur(8px);}
.bg-price-label{font-family:var(--font-mono);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted-2);}
.bg-price-val{font-family:var(--font-display);font-size:32px;font-weight:800;color:var(--gold-light);}
.bg-price-val em{font-style:normal;font-size:15px;font-weight:600;color:var(--muted);}
.bg-hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:40px;}
.bg-hero-stats{display:flex;flex-wrap:wrap;gap:0;}
.bg-hero-stats > div{padding:0 26px;border-left:1px solid var(--line);display:flex;flex-direction:column;gap:3px;}
.bg-hero-stats > div:first-child{padding-left:0;border-left:none;}
.bg-hero-stats b{font-family:var(--font-mono);font-size:22px;font-weight:600;color:var(--gold-light);}
.bg-hero-stats span{font-size:12px;color:var(--muted-2);}

/* buttons */
.bg-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;
  font-family:var(--font-body);font-weight:700;font-size:14.5px;padding:14px 24px;border-radius:999px;border:none;
  transition:transform .28s cubic-bezier(.22,.98,.28,1), box-shadow .28s, filter .2s;text-decoration:none;white-space:nowrap;
}
.bg-btn:hover{transform:translateY(-2px);}
.bg-btn:active{transform:translateY(0);}
.bg-btn-sm{padding:11px 20px;font-size:13.5px;}
.bg-btn-primary{background:linear-gradient(135deg,var(--gold-light),var(--gold) 55%,var(--gold-deep));color:#1a1305;
  box-shadow:0 12px 30px -10px rgba(201,155,78,0.6);}
.bg-btn-primary:hover{box-shadow:0 18px 40px -10px rgba(201,155,78,0.75);}
.bg-btn-wa{background:var(--wa);color:#fff;box-shadow:0 12px 30px -12px rgba(37,211,102,0.6);}
.bg-btn-call{background:var(--call);color:#fff;box-shadow:0 12px 30px -12px rgba(61,139,240,0.55);}

/* sections */
.bg-section{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:70px 26px;}
.bg-section-alt{max-width:none;background:linear-gradient(180deg,rgba(13,21,48,0.5),rgba(10,16,36,0));border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.bg-section-alt > *{max-width:1180px;margin-left:auto;margin-right:auto;}

/* master plan */
.bg-plan-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:26px;}
.bg-plan-img{position:relative;display:block;width:100%;border:1px solid var(--line);border-radius:20px;overflow:hidden;
  cursor:pointer;background:#060a16;padding:0;box-shadow:0 30px 70px -34px rgba(0,0,0,0.8);transition:border-color .3s;}
.bg-plan-img:hover{border-color:rgba(201,155,78,0.5);}
.bg-plan-img img{width:100%;height:auto;display:block;}
.bg-plan-hint{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;
  background:rgba(10,16,36,0.82);border:1px solid var(--line);color:var(--gold-light);font-size:13px;font-weight:600;
  padding:9px 18px;border-radius:999px;backdrop-filter:blur(8px);white-space:nowrap;}

/* card grids */
.bg-grid{display:grid;gap:16px;}
.bg-grid-4{grid-template-columns:repeat(4,1fr);}
.bg-card{background:rgba(13,21,48,0.55);border:1px solid var(--line);border-radius:16px;padding:26px 22px;
  transition:transform .3s cubic-bezier(.22,.98,.28,1), border-color .3s, background .3s;}
.bg-card:hover{transform:translateY(-4px);border-color:rgba(201,155,78,0.5);background:rgba(17,28,61,0.7);}
.bg-card-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  background:rgba(201,155,78,0.12);color:var(--gold-light);margin-bottom:18px;transition:background .3s,transform .3s;}
.bg-card:hover .bg-card-icon{background:var(--gold);color:#1a1305;transform:scale(1.06);}
.bg-card h3{font-size:16.5px;color:var(--linen);margin-bottom:8px;}
.bg-card p{font-size:13.5px;line-height:1.6;color:var(--muted);}

/* location */
.bg-loc-grid{display:grid;grid-template-columns:0.85fr 1.15fr;gap:56px;align-items:start;}
.bg-maps-btn{margin-top:26px;}
.bg-loc-list{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.bg-loc-item{display:flex;gap:13px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:13px;
  background:rgba(13,21,48,0.4);transition:border-color .3s,background .3s;}
.bg-loc-item:hover{border-color:rgba(201,155,78,0.45);background:rgba(17,28,61,0.6);}
.bg-loc-icon{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;
  background:rgba(201,155,78,0.12);color:var(--gold-light);}
.bg-loc-text{display:flex;flex-direction:column;gap:2px;min-width:0;}
.bg-loc-text b{font-family:var(--font-mono);font-size:15px;color:var(--gold-light);font-weight:600;}
.bg-loc-text span{font-size:12.5px;line-height:1.4;color:var(--muted);}

/* investment */
.bg-invest-reasons{margin-bottom:44px;}
.bg-appr{border:1px solid var(--line);border-radius:20px;padding:30px 28px;background:rgba(13,21,48,0.5);}
.bg-appr-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:30px;}
.bg-appr-note{font-family:var(--font-mono);font-size:11px;color:var(--muted-2);letter-spacing:0.04em;}
.bg-appr-chart{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;height:220px;}
.bg-appr-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px;height:100%;}
.bg-appr-val{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--gold-light);}
.bg-appr-bar{width:100%;max-width:74px;border-radius:8px 8px 0 0;
  background:linear-gradient(180deg,var(--gold-light),var(--gold-deep));
  box-shadow:0 -6px 20px -6px rgba(201,155,78,0.5);animation:barGrow 1s cubic-bezier(.22,.98,.28,1);}
@keyframes barGrow{from{height:0 !important;opacity:0;}to{opacity:1;}}
.bg-appr-year{font-size:13px;font-weight:600;color:var(--muted);}

/* contact */
.bg-contact{text-align:center;}
.bg-contact-inner{max-width:640px;margin:0 auto;display:flex;flex-direction:column;align-items:center;
  border:1px solid var(--line);border-radius:24px;padding:52px 32px;
  background:radial-gradient(ellipse 80% 120% at 50% 0%, rgba(201,155,78,0.12), transparent 60%),rgba(13,21,48,0.55);}
.bg-contact-spark{color:var(--gold-light);margin-bottom:16px;}
.bg-contact-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:30px 0 18px;}
.bg-contact-maps{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:13.5px;font-weight:600;
  text-decoration:none;transition:color .25s;}
.bg-contact-maps:hover{color:var(--gold-light);}

/* footer */
.bg-foot{position:relative;z-index:2;text-align:center;padding:40px 26px;border-top:1px solid var(--line);
  font-size:13px;color:var(--muted);}
.bg-foot-sub{font-family:var(--font-mono);font-size:11px;color:var(--muted-2);letter-spacing:0.1em;margin-top:8px;}

/* floating quick actions */
.bg-fab{position:fixed;right:20px;bottom:20px;z-index:60;display:flex;flex-direction:column;gap:12px;}
.bg-fab-btn{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 12px 26px -8px rgba(0,0,0,0.5);transition:transform .28s cubic-bezier(.22,.98,.28,1);}
.bg-fab-btn:hover{transform:scale(1.08);}
.bg-fab-wa{background:var(--wa);}
.bg-fab-call{background:var(--call);}

/* responsive */
@media (max-width:920px){
  .bg-grid-4{grid-template-columns:repeat(2,1fr);}
  .bg-loc-grid{grid-template-columns:1fr;gap:34px;}
}
@media (max-width:560px){
  .bg-hero-stats > div{padding:0 16px;}
  .bg-loc-list{grid-template-columns:1fr;}
  .bg-appr-chart{height:180px;gap:8px;}
  .bg-appr-val{font-size:11px;}
  .bg-plan-head{flex-direction:column;align-items:flex-start;}
  .bg-hero-cta .bg-btn, .bg-contact-cta .bg-btn{flex:1;min-width:44%;}
}
@media (prefers-reduced-motion:reduce){
  .bg-appr-bar{animation:none;}
  .bg-btn:hover,.bg-card:hover,.bg-fab-btn:hover{transform:none;}
}
    `}</style>
    );
}