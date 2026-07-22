import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Send, CheckCircle, X, Cpu } from 'lucide-react';
import Logo from '../components/Logo';

const Shop = () => {
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', requirements: '' });
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    useEffect(() => {
        fetch(`${BASE_URL}/api/adilitix/inventory`)
            .then(res => res.json())
            .then(data => {
                setInventory(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty >= item.count) {
            alert(`Sorry, only ${item.count} units available!`);
            return;
        }

        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }

        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(cartItem => {
            if (cartItem.id === id) {
                const stockItem = inventory.find(i => i.id === id);
                const maxStock = stockItem ? stockItem.count : 999;
                const newQty = Math.max(1, Math.min(cartItem.quantity + delta, maxStock));

                if (newQty === maxStock && delta > 0 && cartItem.quantity === maxStock) {
                    alert(`Max available stock reached for ${cartItem.name}`);
                }

                return { ...cartItem, quantity: newQty };
            }
            return cartItem;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (formData.phone.length < 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/adilitix/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items: cart
                })
            });
            const data = await response.json();
            if (data.success) {
                setOrderSuccess(true);
                setCart([]);
            }
        } catch (err) {
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="registration-container">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="registration-form-card" style={{ textAlign: 'center' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={48} />
                    </div>
                    <h2>Order Requirement Received!</h2>
                    <p style={{ color: 'var(--ad-text-dim)', margin: '16px 0 24px' }}>
                        Thank you <b>{formData.name}</b>. Adilitix Robotics team will review your order requirements and contact you back on <b>{formData.phone}</b>.
                    </p>
                    <Link to="/" className="cta-primary" style={{ justifyContent: 'center' }}>Back to Home</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="shop-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Back to Main
                </Link>
                <Logo size="small" showText={true} textSub="STORE" />
                <button onClick={() => setShowCheckout(true)} className="nav-cart-btn">
                    <ShoppingCart size={20} color="var(--ad-orange)" />
                    {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                </button>
            </nav>

            <div className="shop-container" style={{ padding: '40px 6%' }}>
                <header className="shop-header" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Cpu size={28} color="var(--ad-orange)" />
                        <h1 style={{ fontSize: '2.4rem', color: '#fff' }}>Robotics Component Store</h1>
                    </div>
                    <p style={{ color: 'var(--ad-text-dim)' }}>
                        Official hardware components, sensors, microcontrollers, and prototyping modules by <b>Adilitix Robotics</b>.
                    </p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--ad-orange)' }}>Loading Component Catalog...</div>
                ) : (
                    <div className="db-grid">
                        {inventory.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textFillColor: 'var(--ad-text-dim)', textAlign: 'center', padding: '40px' }}>
                                No items currently listed. Please check back soon or contact support at +91 8075355024.
                            </div>
                        ) : (
                            inventory.map(item => (
                                <div key={item.id} className="db-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    <div className="card-info" style={{ width: '100%' }}>
                                        <span className="inv-cat">{item.category || 'Hardware'}</span>
                                        <h3 style={{ margin: '10px 0 6px', color: '#fff', fontSize: '1.2rem' }}>{item.name}</h3>
                                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Available Stock: <b>{item.count} units</b></p>
                                    </div>
                                    <button onClick={() => addToCart(item)} className="cta-primary" style={{ width: '100%', padding: '12px', fontSize: '0.85rem', justifyContent: 'center' }}>
                                        <ShoppingCart size={16} /> ADD TO CART
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCheckout && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="checkout-overlay">
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="checkout-modal">
                            <div className="modal-header">
                                <h2 style={{ color: '#fff' }}>Your Requirements Cart</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {cart.length > 0 && (
                                        <button onClick={() => setCart([])} className="nav-btn-subtle" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                            <Trash2 size={14} /> Clear
                                        </button>
                                    )}
                                    <button onClick={() => setShowCheckout(false)} className="close-btn"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ad-text-dim)' }}>
                                        <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                        <p>Your cart is empty.</p>
                                        <button onClick={() => setShowCheckout(false)} className="cta-primary" style={{ marginTop: '16px', margin: '16px auto 0' }}>Start Browsing</button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div>
                                                <h4 style={{ color: '#fff', fontSize: '0.95rem' }}>{item.name}</h4>
                                                <small style={{ color: 'var(--ad-orange)' }}>{item.category}</small>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <form onSubmit={handleCheckout} className="checkout-form" style={{ marginTop: '20px' }}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Aadil S P" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number (10 Digits)</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required placeholder="+91 8075355024" />
                                    </div>
                                    <div className="form-group">
                                        <label>Additional Notes / Project Requirements</label>
                                        <textarea value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="Mention special specifications or quantities..." rows="3" />
                                    </div>
                                    <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                                        CONFIRM ORDER INQUIRY <Send size={18} />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            left: '50%',
                            translateX: '-50%',
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            boxShadow: '0 10px 30px var(--ad-orange-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '700',
                            zIndex: 2500
                        }}
                    >
                        <CheckCircle size={20} /> Item Added to Cart!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shop;
