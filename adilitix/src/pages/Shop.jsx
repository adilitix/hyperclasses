import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Send, CheckCircle2, X, Minus, Plus } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { BASE_URL } from '../lib/api';

const Shop = () => {
    const [inventory, setInventory] = useState([]);
    const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', requirements: '' });
    const [submitting, setSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetch(`${BASE_URL}/api/adilitix/inventory`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setInventory(Array.isArray(data) ? data : []);
                setLoadState('ready');
            })
            .catch(() => setLoadState('error'));
    }, []);

    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(''), 2200);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        if (!showCheckout) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setShowCheckout(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showCheckout]);

    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty >= item.count) {
            setToast(`Only ${item.count} units of ${item.name} are in stock.`);
            return;
        }

        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        setToast(`${item.name} added to your list.`);
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(cartItem => {
            if (cartItem.id !== id) return cartItem;
            const stockItem = inventory.find(i => i.id === id);
            const maxStock = stockItem ? stockItem.count : 999;
            return { ...cartItem, quantity: Math.max(1, Math.min(cartItem.quantity + delta, maxStock)) };
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setCheckoutError('');

        if (formData.phone.replace(/\D/g, '').length < 10) {
            setCheckoutError('Please enter a phone number with at least 10 digits.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${BASE_URL}/api/adilitix/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, items: cart })
            });
            const data = await response.json();
            if (data.success) {
                setOrderSuccess(true);
                setShowCheckout(false);
                setCart([]);
            } else {
                setCheckoutError(data.message || 'We could not place your order. Please try again.');
            }
        } catch {
            setCheckoutError('Could not reach the server. Please try again, or call +91 80753 55024.');
        } finally {
            setSubmitting(false);
        }
    };

    const cartButton = (
        <button type="button" onClick={() => setShowCheckout(true)} className="nav-cart-btn" aria-label={`Open order list, ${cartCount} items`}>
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
    );

    return (
        <div className="shop-page">
            <SiteHeader actions={orderSuccess ? null : cartButton} />

            <main className="container" style={{ paddingBottom: 96 }}>
                {orderSuccess ? (
                    <div className="registration-form-card" style={{ margin: '72px auto' }} role="status">
                        <div className="icon-tile" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                            <CheckCircle2 size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Order request received</h1>
                        <p className="muted" style={{ margin: '10px 0 24px' }}>
                            Thanks, {formData.name}. We will check availability and call you on {formData.phone} to confirm pricing and delivery.
                        </p>
                        <div className="cta-group">
                            <button type="button" className="btn btn-secondary" onClick={() => setOrderSuccess(false)}>Keep browsing</button>
                            <Link to="/" className="btn btn-primary">Back to home</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="page-header">
                            <span className="eyebrow">Store</span>
                            <h1>Robotics components</h1>
                            <p>
                                Microcontrollers, sensors, actuators and prototyping modules in stock at our Kollam lab. Add what you need and
                                send the list. We confirm price and availability by phone before anything is charged.
                            </p>
                        </header>

                        {loadState === 'loading' && (
                            <div className="db-grid" aria-busy="true">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="db-card" style={{ height: 150, opacity: 0.5 }} />
                                ))}
                            </div>
                        )}

                        {loadState === 'error' && (
                            <div className="notice notice-error">
                                We could not load the catalogue right now. Please refresh, or call +91 80753 55024 for stock.
                            </div>
                        )}

                        {loadState === 'ready' && inventory.length === 0 && (
                            <div className="notice">
                                No items are listed at the moment. Call +91 80753 55024 and we will source what you need.
                            </div>
                        )}

                        {loadState === 'ready' && inventory.length > 0 && (
                            <div className="db-grid">
                                {inventory.map(item => {
                                    const inCart = cart.find(c => c.id === item.id);
                                    return (
                                        <div key={item.id} className="db-card" style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
                                            <div>
                                                <span className="inv-cat">{item.category || 'Hardware'}</span>
                                                <h3 style={{ margin: '6px 0 4px', fontSize: '1.05rem', fontWeight: 600 }}>{item.name}</h3>
                                                <p className="muted" style={{ fontSize: '0.875rem' }}>
                                                    {item.count > 0 ? `${item.count} in stock` : 'Out of stock'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addToCart(item)}
                                                className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                                                disabled={item.count <= 0}
                                            >
                                                {inCart ? `Added (${inCart.quantity}) · add another` : 'Add to list'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            <SiteFooter />

            <AnimatePresence>
                {showCheckout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="checkout-overlay"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCheckout(false); }}
                    >
                        <motion.div
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 16, opacity: 0 }}
                            className="checkout-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="checkout-title"
                        >
                            <div className="modal-header">
                                <h2 id="checkout-title" style={{ fontSize: '1.15rem', fontWeight: 600 }}>Your order list</h2>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {cart.length > 0 && (
                                        <button type="button" onClick={() => setCart([])} className="btn btn-ghost btn-sm">Clear</button>
                                    )}
                                    <button type="button" onClick={() => setShowCheckout(false)} className="close-btn" aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>

                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <p className="muted">Your list is empty.</p>
                                    <button type="button" onClick={() => setShowCheckout(false)} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
                                        Browse components
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</div>
                                                <div className="subtle" style={{ fontSize: '0.8rem' }}>{item.category}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="qty-btn" aria-label={`Fewer ${item.name}`}><Minus size={14} /></button>
                                                <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="qty-btn" aria-label={`More ${item.name}`}><Plus size={14} /></button>
                                                <button type="button" onClick={() => removeFromCart(item.id)} className="qty-btn" aria-label={`Remove ${item.name}`} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}

                                    <form onSubmit={handleCheckout} style={{ marginTop: 20 }}>
                                        <div className="form-group">
                                            <label htmlFor="co-name">Full name</label>
                                            <input id="co-name" type="text" autoComplete="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="co-phone">Phone / WhatsApp</label>
                                            <input id="co-phone" type="tel" autoComplete="tel" inputMode="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="co-notes">Notes <span className="subtle">(optional)</span></label>
                                            <textarea id="co-notes" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="Specifications, quantities or delivery address" rows="3" />
                                        </div>
                                        {checkoutError && <p role="alert" className="form-error">{checkoutError}</p>}
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                                            {submitting ? 'Sending…' : <>Send order request <Send size={16} /></>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        role="status"
                        initial={{ opacity: 0, y: 12, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 12, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            left: '50%',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            zIndex: 2500,
                            maxWidth: 'calc(100vw - 32px)'
                        }}
                    >
                        <CheckCircle2 size={16} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shop;
