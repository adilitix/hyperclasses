import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Cpu, MapPin, ShieldCheck, Target } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const STATS = [
    { value: '7+ years', label: 'Trainer experience' },
    { value: '200+', label: 'Workshops conducted' },
    { value: '200+', label: 'Students trained' },
    { value: '100%', label: 'Practical, project-based' },
];

const REASONS = [
    {
        icon: Target,
        title: 'Practical from day one',
        body: 'No filler theory. Every student builds, wires, programs and operates a working prototype.',
    },
    {
        icon: Cpu,
        title: 'An industry-standard stack',
        body: 'ESP32 and FreeRTOS, OpenCV, MediaPipe, PySerial and bare-metal C/C++, the same tools used in industry.',
    },
    {
        icon: ShieldCheck,
        title: 'Experienced, registered team',
        body: '200+ workshops delivered by trainers with 7+ years of experience, under a government-registered MSME.',
    },
];

const About = () => {
    return (
        <div className="shop-page">
            <SiteHeader />

            <main>
                <section className="container page-header">
                    <span className="eyebrow">About</span>
                    <h1>About Adilitix Robotics</h1>
                    <p>
                        A robotics company in Kollam, Kerala. We train students, develop projects and prototypes for clients, and
                        rent out the Unitree Go2 Pro quadruped robot for events.
                    </p>
                </section>

                <div className="container">
                    <div className="stats">
                        {STATS.map(s => (
                            <div key={s.label} className="stat">
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <section className="section">
                    <div className="container grid-2" style={{ alignItems: 'stretch' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                                    A
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Aadil S P</h2>
                                    <p className="muted" style={{ fontSize: '0.9rem' }}>Founder and CEO</p>
                                </div>
                            </div>
                            <p className="muted">
                                Aadil founded Adilitix Robotics to deliver industry-grade robotics training, internships and project
                                development. More than 200 workshops and 200 trained students across Kerala later, the approach is unchanged:
                                learn by building real hardware.
                            </p>
                        </div>

                        <div className="card">
                            <div className="icon-tile"><ShieldCheck size={20} /></div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>Registered MSME</h2>
                            <p className="muted" style={{ marginBottom: 16 }}>
                                A sole proprietorship registered with the Ministry of Micro, Small and Medium Enterprises.
                            </p>
                            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: '0.9rem' }}>
                                <dt className="subtle">Udyam no.</dt>
                                <dd style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>UDYAM-KL-06-0070364</dd>
                                <dt className="subtle">Registered</dt>
                                <dd>10 December 2025</dd>
                            </dl>
                        </div>
                    </div>
                </section>

                <section className="section section-alt">
                    <div className="container">
                        <span className="eyebrow">Why institutions choose us</span>
                        <h2 className="section-title">Training that students actually use.</h2>
                        <div className="grid-3" style={{ marginTop: 40 }}>
                            {REASONS.map(({ icon: ReasonIcon, title, body }) => (
                                <div key={title} className="card">
                                    <div className="icon-tile">{React.createElement(ReasonIcon, { size: 20 })}</div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                                    <p className="muted" style={{ fontSize: '0.95rem' }}>{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container grid-2" style={{ alignItems: 'start' }}>
                        <div>
                            <span className="eyebrow">Headquarters and lab</span>
                            <h2 className="section-title">R&amp;D, prototyping and custom projects.</h2>
                            <p className="section-lead">
                                Our lab in Kollam handles 3D printed prototypes, custom PCB and mechanical design, embedded firmware, and
                                hardware-software integration for clients across Kerala.
                            </p>
                            <ul className="check-list" style={{ margin: '24px 0 32px' }}>
                                <li><Check size={16} />Mechanical structures and 3D printed enclosures</li>
                                <li><Check size={16} />Embedded firmware and electronics</li>
                                <li><Check size={16} />Edge AI and computer vision systems</li>
                            </ul>
                            <Link to="/inquiry" className="btn btn-primary">
                                Request a proposal <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="card contact-list">
                            <div><MapPin size={18} /><span>1st Floor, Aswathy Building, Main Road, Kollam, Kerala 691001</span></div>
                            <p className="subtle" style={{ fontSize: '0.85rem' }}>
                                Adilitix Robotics (adilitix.com) is an Indian robotics and engineering company. It is not affiliated with
                                Adltix, Dubai.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
};

export default About;
