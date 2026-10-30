import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    ArrowLeft, ArrowRight, Award, Cpu, ShieldCheck, CheckCircle2, 
    Download, Play, Search, Layers, Zap, BookOpen, Folder, FolderOpen, 
    ChevronRight, ArrowUp, ExternalLink, Grid, List, Sparkles, Terminal 
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { projectsData, projectsHierarchy } from '../data/projectsData';

const Projects = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Folder navigation state synced with URL query (?folder=...)
    const initialFolder = searchParams.get('folder') || '';
    const [currentPath, setCurrentPath] = useState(initialFolder);
    const [viewMode, setViewMode] = useState('folder'); // 'folder' | 'grid'
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Follow the ?folder= query param (back/forward navigation) without an effect
    const folderParam = searchParams.get('folder');
    const [lastFolderParam, setLastFolderParam] = useState(folderParam);
    if (folderParam !== lastFolderParam) {
        setLastFolderParam(folderParam);
        if (folderParam !== null && folderParam !== currentPath) setCurrentPath(folderParam);
    }

    const navigateToFolder = (path) => {
        setCurrentPath(path);
        if (path) {
            setSearchParams({ folder: path });
        } else {
            setSearchParams({});
        }
    };

    const navigateUp = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        navigateToFolder(parts.join('/'));
    };

    // Breadcrumb segments
    const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

    const projectsList = Object.values(projectsData).filter((p, idx, arr) => 
        // De-duplicate any aliases sharing same id
        arr.findIndex(item => item.id === p.id) === idx
    );

    const categories = ['All', 'IoT & Climate Tech', 'Robotics & Autonomous AI', 'Applied Bio-Electronics & Wearables', 'Assistive Healthcare Tech', 'Robotics & Industrial Automation'];

    const filteredProjects = projectsList.filter(proj => {
        const matchCategory = selectedCategory === 'All' || proj.category === selectedCategory;
        const matchSearch = !searchQuery.trim() ||
            proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="shop-page" style={{ minHeight: '100vh', background: 'var(--bg)', color: '#f8fafc' }}>
            <SiteHeader />

            {/* Hero Header */}
            <header style={{ padding: '56px var(--gutter) 28px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
                <span className="eyebrow">Projects</span>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', color: 'var(--text)', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                    Engineering projects and live test benches
                </h1>
                <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', maxWidth: '780px', margin: '0 auto', lineHeight: '1.6' }}>
                    Browse the projects we have built with schools and colleges. Each one includes the circuit, pinout, firmware, build steps and, where available, a simulator you can try in the browser.
                </p>

                {/* Explorer Toolbar: Breadcrumbs, Search & View Switcher */}
                <div style={{
                    margin: '32px auto 0',
                    maxWidth: '1000px',
                    background: 'var(--surface)',
                    border: '1px solid var(--ad-border-navy)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                                        display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                }}>
                    {/* Top Row: Path Breadcrumbs and View Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        
                        {/* Interactive Breadcrumb Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            {pathParts.length > 0 && (
                                <button
                                    onClick={navigateUp}
                                    title="Up one folder"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '5px 10px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '8px',
                                        color: 'var(--ad-orange)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ArrowUp size={13} /> Up
                                </button>
                            )}

                            <button
                                onClick={() => navigateToFolder('')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 10px',
                                    background: currentPath === '' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                                    border: currentPath === '' ? '1px solid var(--ad-orange)' : '1px solid transparent',
                                    borderRadius: '8px',
                                    color: currentPath === '' ? 'var(--ad-orange)' : '#94a3b8',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                <Folder size={15} /> projects
                            </button>

                            {pathParts.map((part, index) => {
                                const subPath = pathParts.slice(0, index + 1).join('/');
                                const isLast = index === pathParts.length - 1;
                                return (
                                    <React.Fragment key={subPath}>
                                        <ChevronRight size={14} color="#64748b" />
                                        <button
                                            onClick={() => navigateToFolder(subPath)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '5px 10px',
                                                background: isLast ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                                                border: isLast ? '1px solid var(--ad-orange)' : '1px solid transparent',
                                                borderRadius: '8px',
                                                color: isLast ? '#fff' : '#94a3b8',
                                                fontWeight: isLast ? 800 : 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isLast ? <FolderOpen size={15} color="var(--ad-orange)" /> : <Folder size={15} />}
                                            {part}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* View Switcher: Folder Manager vs All Grid */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <button
                                onClick={() => setViewMode('folder')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: viewMode === 'folder' ? 'var(--ad-orange)' : 'transparent',
                                    color: viewMode === 'folder' ? '#fff' : 'var(--ad-text-dim)',
                                    border: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Folder size={14} /> Folder View
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: viewMode === 'grid' ? 'var(--ad-orange)' : 'transparent',
                                    color: viewMode === 'grid' ? '#fff' : 'var(--ad-text-dim)',
                                    border: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Grid size={14} /> All Projects Grid
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Search Box */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ad-text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Filter files, folders, hardware boards, or test sensors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px 12px 40px',
                                background: 'var(--bg)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                color: 'var(--text)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ padding: '0 var(--gutter) 80px', maxWidth: '1240px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {viewMode === 'folder' ? (
                        <motion.div
                            key={`folder-${currentPath}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* --- 1. ROOT DIRECTORY VIEW --- */}
                            {currentPath === '' && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FolderOpen size={20} color="var(--ad-orange)" /> Root Folders ({projectsHierarchy.root.folders.length})
                                        </h2>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--ad-text-dim)' }}>Click a folder to browse contents</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
                                        {projectsHierarchy.root.folders.map(folder => (
                                            <motion.div
                                                key={folder.id}
                                                whileHover={{ y: -5, borderColor: folder.badgeColor }}
                                                onClick={() => navigateToFolder(folder.id)}
                                                style={{
                                                    background: 'var(--surface)',
                                                    border: '1px solid var(--ad-border-navy)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    padding: '24px',
                                                    cursor: 'pointer',
                                                    backdropFilter: 'blur(10px)',
                                                    transition: 'all 0.25s ease',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: folder.badgeColor }} />
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className="icon-tile" style={{ margin: 0 }}><Folder size={18} /></span>
                                                        <div>
                                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--ad-orange)', fontWeight: 700 }}>
                                                                {folder.name}/
                                                            </div>
                                                            <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, margin: '2px 0 0' }}>
                                                                {folder.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        background: `${folder.badgeColor}20`,
                                                        color: folder.badgeColor,
                                                        border: `1px solid ${folder.badgeColor}40`
                                                    }}>
                                                        {folder.badge}
                                                    </span>
                                                </div>

                                                <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                    {folder.subtitle}
                                                </p>

                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingTop: '16px',
                                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                                                }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                                                        {folder.itemCount} project items inside
                                                    </span>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--ad-orange)',
                                                        fontWeight: 700
                                                    }}>
                                                        Explore Folder <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- 2. SHAKTHIKULANGARA SCHOOL FOLDER VIEW --- */}
                            {currentPath === 'shakthikulangara' && (
                                <div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)',
                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '24px 28px',
                                        marginBottom: '28px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                                                <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: 700 }}>
                                                    Shakthikulangara School STEM Lab
                                                </h2>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}>
                                                    Active Lab
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem', maxWidth: '640px' }}>
                                                Official projects developed for Shakthikulangara school students. Includes the autonomous robotics rover with live remote test console, and the NodeMCU dual-display IoT telemetry station.
                                            </p>
                                        </div>

                                        <a
                                            href="/simulators/shakthikulangara_robotics/index.html"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 20px',
                                                borderRadius: '12px',
                                                background: 'var(--ad-orange)',
                                                color: 'var(--text)',
                                                fontWeight: 700,
                                                fontSize: '0.88rem',
                                                textDecoration: 'none',
                                                boxShadow: '0 4px 18px rgba(249, 115, 22, 0.4)'
                                            }}
                                        >
                                            <Play size={16} /> Launch Robotics Test Website
                                        </a>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
                                        {/* Shakthikulangara Robotics Subfolder */}
                                        <motion.div
                                            whileHover={{ y: -5, borderColor: '#f97316' }}
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1px solid rgba(249, 115, 22, 0.4)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: '24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                position: 'relative'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                    <span className="icon-tile" style={{ margin: 0 }}><Cpu size={18} /></span>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        background: 'rgba(249, 115, 22, 0.2)',
                                                        color: '#f97316',
                                                        border: '1px solid rgba(249, 115, 22, 0.4)'
                                                    }}>
                                                        Live Test Website Available
                                                    </span>
                                                </div>

                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#f97316', fontWeight: 700 }}>
                                                    shakthikulangara/robotics/
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, margin: '6px 0 10px' }}>
                                                    Robotics: Autonomous Rover & Test Console
                                                </h3>
                                                <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                    Dual H-Bridge motor driven rover with 180° ultrasonic radar and live interactive remote testing website over NodeMCU Wi-Fi.
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <a
                                                    href="/simulators/shakthikulangara_robotics/index.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        background: 'var(--ad-orange)',
                                                        color: 'var(--text)',
                                                        fontWeight: 700,
                                                        fontSize: '0.82rem',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <Play size={14} /> Open Test Website
                                                </a>

                                                <Link
                                                    to="/projects/shakthikulangara-robotics"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                        color: 'var(--text)',
                                                        fontWeight: 700,
                                                        fontSize: '0.82rem',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <BookOpen size={14} /> Blueprint & Code
                                                </Link>
                                            </div>
                                        </motion.div>

                                        {/* Shakthikulangara IoT Subfolder */}
                                        <motion.div
                                            whileHover={{ y: -5, borderColor: '#38bdf8' }}
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: '24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                    <span className="icon-tile" style={{ margin: 0 }}><Cpu size={18} /></span>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        background: 'rgba(56, 189, 248, 0.2)',
                                                        color: '#38bdf8',
                                                        border: '1px solid rgba(56, 189, 248, 0.4)'
                                                    }}>
                                                        Hardware Verified
                                                    </span>
                                                </div>

                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                                                    shakthikulangara/iot/
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, margin: '6px 0 10px' }}>
                                                    IoT: NodeMCU Dual Display Telemetry Node
                                                </h3>
                                                <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                    Synchronized 0.96" I2C OLED (SSD1306) HUD and TM1637 4-digit 7-segment display with 200ms pulse sync.
                                                </p>
                                            </div>

                                            <Link
                                                to="/projects/shakthikulangara-iot"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(56, 189, 248, 0.15)',
                                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                                    color: '#38bdf8',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <BookOpen size={14} /> View Wiring & Flashed Code
                                            </Link>
                                        </motion.div>

                                        {/* Shakthikulangara Electronics Subfolder */}
                                        <motion.div
                                            whileHover={{ y: -5, borderColor: '#a855f7' }}
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: '24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                    <span className="icon-tile" style={{ margin: 0 }}><Cpu size={18} /></span>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        background: 'rgba(168, 85, 247, 0.2)',
                                                        color: '#c084fc',
                                                        border: '1px solid rgba(168, 85, 247, 0.4)'
                                                    }}>
                                                        Curriculum Ready
                                                    </span>
                                                </div>

                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>
                                                    shakthikulangara/electronics/
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, margin: '6px 0 10px' }}>
                                                    Electronics: Sensor Prototyping & Power Lab
                                                </h3>
                                                <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                    Core electronic components, voltage regulators, relay drivers, and discrete analog-to-digital sensor signal conditioning.
                                                </p>
                                            </div>

                                            <Link
                                                to="/projects/electronics"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(168, 85, 247, 0.15)',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    color: '#c084fc',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <BookOpen size={14} /> View Electronics Blueprint
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {/* --- 3. SHAKTHIKULANGARA ROBOTICS DEDICATED SUBFOLDER --- */}
                            {(currentPath === 'shakthikulangara/robotics' || currentPath === 'robotics') && (
                                <div>
                                    <div style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--ad-orange)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '32px',
                                        marginBottom: '28px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                                            <div>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(249, 115, 22, 0.15)', border: '1px solid var(--ad-orange)', color: 'var(--ad-orange)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
                                                    <Sparkles size={14} /> LIVE TEST WEBSITE & REMOTE TELEMETRY
                                                </div>
                                                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)', fontWeight: 700 }}>
                                                    Shakthikulangara Robotics Remote Testbed
                                                </h2>
                                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.95rem', maxWidth: '700px', marginTop: '6px', lineHeight: '1.6' }}>
                                                    Full-featured live test website designed for Antigravity remote testing and smartphone teleoperation. Test DC motors, ultrasonic radar distance arcs, emergency brakes, and live telemetry.
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                <a
                                                    href="/simulators/shakthikulangara_robotics/index.html"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '12px 24px',
                                                        borderRadius: '12px',
                                                        background: 'var(--ad-orange)',
                                                        color: 'var(--text)',
                                                        fontWeight: 700,
                                                        fontSize: '0.95rem',
                                                        textDecoration: 'none',
                                                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)'
                                                    }}
                                                >
                                                    <Play size={16} /> Open Test Website in Fullscreen
                                                </a>
                                                <Link
                                                    to="/projects/shakthikulangara-robotics"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '12px 20px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                        color: 'var(--text)',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <BookOpen size={16} /> Full Circuit & Code
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Embedded Testbed iFrame for Instant On-Page Testing */}
                                        <div style={{ width: '100%', height: '640px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                                            <iframe
                                                src="/simulators/shakthikulangara_robotics/index.html"
                                                title="Shakthikulangara Robotics Remote Testbed"
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 4. STATE SASTHROLSAVAM FOLDER VIEW --- */}
                            {currentPath === 'state-sasthrolsavam' && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FolderOpen size={20} color="var(--ad-orange)" /> State Sasthrolsavam Entries ({projectsHierarchy.root.folders[1].subfolders.length})
                                        </h2>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--ad-text-dim)' }}>Select any project to view complete blueprint</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
                                        {projectsHierarchy.root.folders[1].subfolders.map(item => {
                                            const proj = projectsData[item.projectId];
                                            if (!proj) return null;
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -5, borderColor: item.badgeColor }}
                                                    style={{
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--ad-border-navy)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        padding: '24px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: item.badgeColor }} />

                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                            <span className="icon-tile" style={{ margin: 0 }}><Cpu size={18} /></span>
                                                            <span style={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                padding: '4px 10px',
                                                                borderRadius: '999px',
                                                                background: `${item.badgeColor}20`,
                                                                color: item.badgeColor,
                                                                border: `1px solid ${item.badgeColor}40`
                                                            }}>
                                                                {item.badge}
                                                            </span>
                                                        </div>

                                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: item.badgeColor, fontWeight: 700 }}>
                                                            {item.id}
                                                        </div>
                                                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', fontWeight: 700, margin: '6px 0 10px' }}>
                                                            {proj.title}
                                                        </h3>
                                                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                            {proj.tagline}
                                                        </p>
                                                    </div>

                                                    <Link
                                                        to={`/projects/${item.projectId}`}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            padding: '10px 16px',
                                                            borderRadius: '10px',
                                                            background: 'rgba(255, 255, 255, 0.08)',
                                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                                            color: 'var(--text)',
                                                            fontWeight: 700,
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        Open Project Blueprint <ArrowRight size={14} />
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* --- 5. CLASSIC ALL PROJECTS GRID VIEW --- */
                        <motion.div
                            key="all-grid"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Category Filter Pills */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 'var(--radius-lg)',
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: selectedCategory === cat ? '1px solid var(--ad-orange)' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: selectedCategory === cat ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                            color: selectedCategory === cat ? 'var(--ad-orange)' : 'var(--ad-text-dim)'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '28px' }}>
                                {filteredProjects.map((project, idx) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        style={{
                                            background: 'var(--surface)',
                                            border: '1px solid var(--ad-border-navy)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: '28px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.3s ease',
                                                                                        position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        whileHover={{ y: -6, borderColor: 'var(--ad-orange)' }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: project.accentColor || 'var(--ad-orange)' }} />

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                                <span className="icon-tile" style={{ margin: 0 }}><Cpu size={18} /></span>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.6px',
                                                    padding: '4px 12px',
                                                    borderRadius: '999px',
                                                    background: `${project.badgeColor}20`,
                                                    color: project.badgeColor,
                                                    border: `1px solid ${project.badgeColor}40`
                                                }}>
                                                    {project.badge}
                                                </span>
                                            </div>

                                            <h2 style={{ fontSize: '1.35rem', color: 'var(--text)', fontWeight: 700, lineHeight: '1.3', marginBottom: '8px' }}>
                                                {project.title}
                                            </h2>
                                            <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                                {project.tagline}
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                                                {project.metrics.slice(0, 4).map((m, mIdx) => (
                                                    <div key={mIdx} style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--ad-text-dim)', fontWeight: 700 }}>{m.label}</div>
                                                        <div style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 700, marginTop: '2px' }}>{m.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {project.simulatorUrl && (
                                                <a
                                                    href={project.simulatorUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(249, 115, 22, 0.15)',
                                                        border: '1px solid var(--ad-orange)',
                                                        color: 'var(--ad-orange)',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <Play size={14} /> Test
                                                </a>
                                            )}
                                            <Link
                                                to={`/projects/${project.id}`}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 18px',
                                                    borderRadius: '12px',
                                                    background: 'var(--ad-orange)',
                                                    color: 'var(--text)',
                                                    fontWeight: 700,
                                                    fontSize: '0.88rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    textDecoration: 'none',
                                                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)'
                                                }}
                                            >
                                                Blueprint & Guide <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <SiteFooter />
        </div>
    );
};

export default Projects;
