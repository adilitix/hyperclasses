import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Box, GraduationCap, Check, MapPin, Phone, Mail, Clock } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const asset = (file) => `${import.meta.env.BASE_URL}${file}`;

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
};

const STATS = [
    { value: '7+ years', label: 'Engineering and training' },
    { value: '200+', label: 'Workshops and events delivered' },
    { value: 'Kerala-wide', label: 'On-site delivery and support' },
    { value: 'MSME', label: 'Udyam registered enterprise' },
];

const SERVICES = [
    {
        icon: Bot,
        title: 'Robot dog event rentals',
        body: 'A Unitree Go2 Pro with a trained operator for exhibitions, launches, summits and weddings.',
        href: '#event-rentals',
        cta: 'Rental details',
    },
    {
        icon: Box,
        title: '3D printing and prototyping',
        body: 'Multi-material prints and CAD design for enclosures, brackets, student projects and product prototypes.',
        href: '#prototyping',
        cta: 'Printing services',
    },
    {
        icon: GraduationCap,
        title: 'Workshops for colleges',
        body: 'Three-day, hands-on bootcamps in IoT, computer vision, 3D engineering and robotics.',
        to: '/programs',
        cta: 'View the brochure',
    },
];

const PRINTERS = [
    {
        img: 'bambulab_p1s.webp',
        name: 'Bambu Lab P1S Combo',
        kind: 'Enclosed CoreXY with AMS',
        body: 'Multi-colour engineering parts in PLA, PETG and carbon-fibre PLA. Suited to durable enclosures and functional prototypes.',
    },
    {
        img: 'bambulab_a1_mini.webp',
        name: 'Bambu Lab A1 Mini',
        kind: 'High-speed desktop with AMS Lite',
        body: 'Fast turnaround for small components, brackets, fit tests and mechanical joint iterations.',
    },
];

const Landing = () => {
    return (
        <div className="adilitix-container">
            <SiteHeader />

            <main>
                {/* Hero */}
                <section className="hero">
                    <div className="container grid-2">
                        <div>
                            <motion.span {...fadeUp} className="tag" style={{ marginBottom: 24 }}>
                                MSME registered · Kollam, Kerala
                            </motion.span>
                            <motion.h1 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
                                Robot rentals, rapid prototyping and <span className="accent">hands-on robotics training.</span>
                            </motion.h1>
                            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="hero-lead">
                                Adilitix Robotics brings the Unitree Go2 Pro to your event, prints and designs your hardware on
                                Bambu Lab machines, and runs practical engineering workshops for colleges across Kerala.
                            </motion.p>
                            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="cta-group">
                                <Link to="/inquiry" className="btn btn-primary">
                                    Book the robot dog <ArrowRight size={16} />
                                </Link>
                                <a href="#prototyping" className="btn btn-secondary">3D printing services</a>
                            </motion.div>
                        </div>

                        <motion.div
                            className="hero-visual"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <div className="product-frame">
                                <img
                                    src={asset('unitree_go2_pro.webp')}
                                    alt="Unitree Go2 Pro quadruped robot"
                                    width="806"
                                    height="816"
                                    fetchpriority="high"
                                />
                            </div>
                            <div className="hero-caption">
                                <span style={{ fontWeight: 600 }}>Unitree Go2 Pro</span>
                                <span className="muted">Available across Kerala</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats */}
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

                {/* Services overview */}
                <section className="section">
                    <div className="container">
                        <span className="eyebrow">What we do</span>
                        <h2 className="section-title">Three services, one engineering team.</h2>
                        <div className="grid-3" style={{ marginTop: 40 }}>
                            {SERVICES.map(({ icon, title, body, href, to, cta }) => {
                                const Icon = icon;
                                const inner = (
                                    <>
                                        <div className="icon-tile"><Icon size={20} /></div>
                                        <h3>{title}</h3>
                                        <p>{body}</p>
                                        <span className="text-link">{cta} <ArrowRight size={15} /></span>
                                    </>
                                );
                                return to ? (
                                    <Link key={title} to={to} className="card card-link service-tile">{inner}</Link>
                                ) : (
                                    <a key={title} href={href} className="card card-link service-tile">{inner}</a>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Event rentals */}
                <section id="event-rentals" className="section section-alt">
                    <div className="container grid-2">
                        <div>
                            <span className="eyebrow">Event rentals</span>
                            <h2 className="section-title">Bring the Unitree Go2 Pro to your event.</h2>
                            <p className="section-lead">
                                A live quadruped robot draws a crowd and gives people something to share. We deliver it on site with our own
                                operators, plan the routine with you, and manage safety from setup to pack-down.
                            </p>
                            <ul className="check-list" style={{ margin: '28px 0 32px' }}>
                                <li><Check size={16} /><span><strong>Exhibitions and trade expos</strong> as a live technology demonstration</span></li>
                                <li><Check size={16} /><span><strong>Weddings and grand entrances</strong> including ring and gift presentation</span></li>
                                <li><Check size={16} /><span><strong>Brand launches</strong> with routines choreographed to your brief</span></li>
                                <li><Check size={16} /><span><strong>Turnkey delivery</strong> with trained operators and on-site safety management</span></li>
                            </ul>
                            <Link to="/inquiry" className="btn btn-primary">
                                Check availability <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="product-frame" style={{ aspectRatio: '4 / 3', padding: 32 }}>
                            <img src={asset('unitree_go2_pro.webp')} alt="Unitree Go2 Pro robot dog" width="806" height="816" loading="lazy" />
                        </div>
                    </div>
                </section>

                {/* Prototyping */}
                <section id="prototyping" className="section">
                    <div className="container">
                        <span className="eyebrow">Fabrication and prototyping</span>
                        <h2 className="section-title">Custom 3D printing and CAD design.</h2>
                        <p className="section-lead">
                            Send us an STL, STEP or OBJ file, or just the problem you are solving. We model, print and deliver parts for
                            startups, students and industrial clients.
                        </p>

                        <div className="grid-3" style={{ marginTop: 40 }}>
                            {PRINTERS.map(p => (
                                <div key={p.name} className="card printer-card">
                                    <div className="product-frame">
                                        <img src={asset(p.img)} alt={`${p.name} 3D printer`} loading="lazy" />
                                    </div>
                                    <span className="subtle" style={{ fontSize: '0.82rem' }}>{p.kind}</span>
                                    <h3>{p.name}</h3>
                                    <p>{p.body}</p>
                                </div>
                            ))}

                            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="icon-tile"><Box size={20} /></div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Request a quote</h3>
                                <p className="muted" style={{ fontSize: '0.95rem', marginBottom: 20 }}>
                                    Tell us the part, material and quantity. We usually reply within one working day.
                                </p>
                                <ul className="check-list" style={{ marginBottom: 28 }}>
                                    <li><Check size={16} />PLA, PETG and carbon-fibre PLA</li>
                                    <li><Check size={16} />Parametric enclosure design</li>
                                    <li><Check size={16} />Delivery anywhere in Kerala</li>
                                </ul>
                                <Link to="/inquiry" className="btn btn-secondary" style={{ marginTop: 'auto' }}>
                                    Start a printing request
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workshops */}
                <section className="section" style={{ paddingTop: 0 }}>
                    <div className="container">
                        <div className="cta-band">
                            <div>
                                <span className="eyebrow">For colleges and institutions</span>
                                <h2 className="section-title" style={{ maxWidth: 'none' }}>Workshops your students will remember.</h2>
                                <p className="section-lead">
                                    Three-day bootcamps in IoT, AI and computer vision, 3D engineering, robotic arms and autonomous rovers, with
                                    day-by-day syllabi and a proposal you can share with your HOD or principal.
                                </p>
                            </div>
                            <Link to="/programs" className="btn btn-primary">
                                Explore the brochure <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="section section-alt">
                    <div className="container grid-2" style={{ alignItems: 'start' }}>
                        <div>
                            <span className="eyebrow">Contact</span>
                            <h2 className="section-title">Talk to the team.</h2>
                            <p className="section-lead">
                                Founded by Aadil S P. Tell us about your event, part or workshop and we will come back with a plan and a quote.
                            </p>
                            <div className="cta-group" style={{ marginTop: 28 }}>
                                <Link to="/inquiry" className="btn btn-primary">Send an inquiry</Link>
                                <a href="tel:+918075355024" className="btn btn-secondary">Call +91 80753 55024</a>
                            </div>
                        </div>
                        <div className="card contact-list">
                            <div><MapPin size={18} /><span>1st Floor, Aswathy Building, Main Road, Kollam, Kerala 691001</span></div>
                            <div><Phone size={18} /><a href="tel:+918075355024">+91 80753 55024</a></div>
                            <div><Mail size={18} /><a href="mailto:contact@adilitix.com">contact@adilitix.com</a></div>
                            <div><Clock size={18} /><span>Monday to Saturday, 9:00 am to 7:00 pm</span></div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
};

export default Landing;
