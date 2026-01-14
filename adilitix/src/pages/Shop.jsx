import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Send, CheckCircle, X } from 'lucide-react';

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
                setInventory(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
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
            <div className="registration-success-view">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="success-card">
                    <div className="success-icon"><CheckCircle size={60} color="#10b981" /></div>
                    <h2>Order Placed Successfully!</h2>
                    <p>Thank you <b>{formData.name}</b>. We have received your requirement. We will contact you back shortly on <b>{formData.phone}</b>.</p>
                    <Link to="/" className="cta-primary" style={{ marginTop: '20px' }}>Back to Home</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="shop-page">
            <nav className="navbar" style={{ position: 'sticky', top: 0, background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(10px)' }}>
                <Link to="/" className="back-link"><ArrowLeft size={20} /> Back</Link>
                <div className="logo">ADILITIX SHOP</div>
                <button onClick={() => setShowCheckout(true)} className="nav-cart-btn">
                    <ShoppingCart size={20} />
                    {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                </button>
            </nav>

            <div className="shop-container" style={{ padding: '40px 6%' }}>
                <header className="shop-header" style={{ marginBottom: '40px' }}>
                    <h1>Robotics Components</h1>
                    <p style={{ opacity: 0.6 }}>High-quality parts for your next project.</p>
                </header>

                {loading ? (
                    <div className="db-loader">Loading Parts...</div>
                ) : (
                    <div className="db-grid">
                        {inventory.map(item => (
                            <div key={item.id} className="db-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
                                <div className="card-info" style={{ width: '100%' }}>
                                    <span className="inv-cat" style={{ fontSize: '0.6rem' }}>{item.category}</span>
                                    <h3 style={{ margin: '5px 0' }}>{item.name}</h3>
                                    <p style={{ opacity: 0.8 }}>Available: {item.count} units</p>
                                </div>
                                <button onClick={() => addToCart(item)} className="cta-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}>
                                    ADD TO CART
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCheckout && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="checkout-overlay">
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="checkout-modal">
                            <div className="modal-header">
                                <h2>Your Cart</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {cart.length > 0 && (
                                        <button onClick={() => setCart([])} className="nav-btn-subtle" style={{ padding: '8px 12px' }}>
                                            <Trash2 size={16} /> Clear
                                        </button>
                                    )}
                                    <button onClick={() => setShowCheckout(false)} className="close-btn"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div className="empty-cart-state">
                                        <ShoppingCart size={40} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                        <p style={{ opacity: 0.5 }}>Your cart is currently empty.</p>
                                        <button onClick={() => setShowCheckout(false)} className="cta-primary-sm" style={{ marginTop: '20px' }}>Start Shopping</button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="cart-item-info">
                                                <h4>{item.name}</h4>
                                                <small style={{ opacity: 0.6 }}>{item.category}</small>
                                            </div>
                                            <div className="cart-actions-right">
                                                <div className="cart-controls">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                                                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="remove-item-btn"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <form onSubmit={handleCheckout} className="checkout-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required placeholder="Enter phone" />
                                    </div>
                                    <div className="form-group">
                                        <label>Additional Requirements</label>
                                        <textarea value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="Any special requests?" rows="3" />
                                    </div>
                                    <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                                        CONFIRM ORDER <Send size={18} />
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
                            background: '#10b981',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '600',
                            zIndex: 2000
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
