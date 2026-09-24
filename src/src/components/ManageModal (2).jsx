import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { printInvoice } from '../utils/invoiceGenerator';
import { generateCustomerInvoiceWhatsAppLink } from '../utils/whatsappFormatter';
import {
  X,
  ArrowLeft,
  Settings,
  Package,
  Plus,
  Trash2,
  Save,
  Lock,
  KeyRound,
  Receipt,
  FileText,
  Upload,
  Image as ImageIcon,
  Play,
  Edit,
  Check,
  MessageSquare,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';

export default function ManageModal() {
  const {
    isManageOpen,
    setIsManageOpen,
    storeSettings,
    products,
    categories,
    orders,
    updateOrderStatus,
    deleteOrder,
    saveAndPublishStore,
    isOwnerAuthenticated,
    setIsOwnerAuthenticated
  } = useStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Draft states
  const [editSettings, setEditSettings] = useState({ ...storeSettings });
  const [editProducts, setEditProducts] = useState([...products]);
  const [editOrders, setEditOrders] = useState([...orders]);

  // PIN Change draft state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // Subview states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [mediaError, setMediaError] = useState('');

  // Sync draft states when modal opens
  useEffect(() => {
    if (isManageOpen) {
      setEditSettings({ ...storeSettings });
      setEditProducts([...products]);
      setEditOrders([...orders]);
      setPinChangeError('');
      setPinChangeSuccess('');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
    }
  }, [isManageOpen, storeSettings, products, orders]);

  // Listen to popstate for subviews (editing or adding product)
  useEffect(() => {
    const handlePop = () => {
      if (editingProduct) {
        setEditingProduct(null);
      } else if (showAddForm) {
        setShowAddForm(false);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [editingProduct, showAddForm]);

  if (!isManageOpen) return null;

  // ── Navigation Back Button Handler ─────────────────────────────────────────
  const handleBackNavigation = () => {
    if (editingProduct || showAddForm) {
      setEditingProduct(null);
      setShowAddForm(false);
      if (window.history.state?.modal === 'manage-subview') {
        window.history.back();
      }
    } else {
      setIsManageOpen(false);
    }
  };

  // ── Authentication ────────────────────────────────────────────────────────
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === (storeSettings.adminPin || '1234')) {
      setIsOwnerAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default PIN is 1234.');
    }
  };

  // ── Save & Publish ────────────────────────────────────────────────────────
  const handlePublish = () => {
    saveAndPublishStore(editSettings, editProducts, editOrders);
    setIsManageOpen(false);
  };

  // ── PIN Change Handler ────────────────────────────────────────────────────
  const handleUpdatePin = () => {
    setPinChangeError('');
    setPinChangeSuccess('');

    const existingPin = editSettings.adminPin || storeSettings.adminPin || '1234';

    if (!currentPinInput) {
      setPinChangeError('Please enter your existing PIN to confirm your identity.');
      return;
    }
    if (currentPinInput !== existingPin) {
      setPinChangeError('Existing PIN is incorrect. Please enter the current PIN.');
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      setPinChangeError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setPinChangeError('New PIN and Confirm PIN do not match.');
      return;
    }

    setEditSettings(prev => ({ ...prev, adminPin: newPinInput }));
    setPinChangeSuccess('New PIN set! Click "Save & Publish" below to permanently save.');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmNewPinInput('');
  };

  // ── Catalog Management ────────────────────────────────────────────────────
  const handleDeleteProduct = (productId) => {
    setEditProducts(prev => prev.filter(p => p.id !== productId));
    if (editingProduct && editingProduct.id === productId) {
      setEditingProduct(null);
    }
  };

  const handleStockChange = (productId, delta) => {
    setEditProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const startEditingProduct = (product) => {
    setEditingProduct({
      ...product,
      sizesRaw: product.sizes ? product.sizes.join(', ') : 'Standard',
      customCategory: ''
    });
    setShowAddForm(false);
    try {
      window.history.pushState({ modal: 'manage-subview' }, '');
    } catch (e) {}
  };

  const startAddingProduct = () => {
    setShowAddForm(true);
    setEditingProduct(null);
    try {
      window.history.pushState({ modal: 'manage-subview' }, '');
    } catch (e) {}
  };

  const handleMediaFileUpload = (e, isEditingMode = false) => {
    setMediaError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    if (isVideo && file.size > 5 * 1024 * 1024) {
      setMediaError(`Video exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller clip.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const mediaItem = { type: isVideo ? 'video' : 'image', url: reader.result };
      if (isEditingMode && editingProduct) {
        setEditingProduct(prev => {
          const updatedMedia = [...(prev.media || []), mediaItem];
          return {
            ...prev,
            image: prev.image || (mediaItem.type === 'image' ? mediaItem.url : prev.image),
            media: updatedMedia
          };
        });
      } else {
        setNewItem(prev => {
          const updatedMedia = [...(prev.media || []), mediaItem];
          return {
            ...prev,
            image: prev.image || (mediaItem.type === 'image' ? mediaItem.url : prev.image),
            media: updatedMedia
          };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMediaItem = (idx, isEditingMode = false) => {
    if (isEditingMode && editingProduct) {
      setEditingProduct(prev => {
        const updatedMedia = (prev.media || []).filter((_, i) => i !== idx);
        const firstImg = updatedMedia.find(m => m.type === 'image');
        return {
          ...prev,
          media: updatedMedia,
          image: firstImg ? firstImg.url : (updatedMedia[0]?.url || '')
        };
      });
    } else {
      setNewItem(prev => {
        const updatedMedia = (prev.media || []).filter((_, i) => i !== idx);
        const firstImg = updatedMedia.find(m => m.type === 'image');
        return {
          ...prev,
          media: updatedMedia,
          image: firstImg ? firstImg.url : (updatedMedia[0]?.url || '')
        };
      });
    }
  };

  // Add Item Draft State
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    customCategory: '',
    image: '',
    media: [],
    description: '',
    stock: 10,
    isStockTracked: true,
    sizesRaw: 'Standard'
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const finalCategory = newItem.category === 'NEW_CATEGORY' || !newItem.category
      ? (newItem.customCategory.trim() || 'General')
      : newItem.category;

    const parsedSizes = newItem.sizesRaw
      ? newItem.sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
      : ['Standard'];

    const productToAdd = {
      id: 'p_' + Date.now(),
      name: newItem.name.trim(),
      price: Number(newItem.price) || 0,
      category: finalCategory,
      image: newItem.image || (newItem.media && newItem.media[0]?.url) || '',
      media: newItem.media || [],
      description: newItem.description.trim(),
      stock: Number(newItem.stock) || 0,
      isStockTracked: Boolean(newItem.isStockTracked),
      sizes: parsedSizes
    };

    setEditProducts(prev => [productToAdd, ...prev]);
    setNewItem({
      name: '',
      price: '',
      category: '',
      customCategory: '',
      image: '',
      media: [],
      description: '',
      stock: 10,
      isStockTracked: true,
      sizesRaw: 'Standard'
    });
    setShowAddForm(false);
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalCategory = editingProduct.category === 'NEW_CATEGORY'
      ? (editingProduct.customCategory.trim() || 'General')
      : editingProduct.category;

    const parsedSizes = editingProduct.sizesRaw
      ? editingProduct.sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
      : ['Standard'];

    const updatedProduct = {
      ...editingProduct,
      category: finalCategory,
      sizes: parsedSizes,
      price: Number(editingProduct.price) || 0,
      stock: Number(editingProduct.stock) || 0,
      image: editingProduct.image || (editingProduct.media && editingProduct.media[0]?.url) || ''
    };

    setEditProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  // ── Orders Management ─────────────────────────────────────────────────────
  const handleStatusChange = (orderId, newStatus) => {
    setEditOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateOrderStatus(orderId, newStatus);
  };

  const handleSendInvoiceWhatsApp = (order) => {
    const waUrl = generateCustomerInvoiceWhatsAppLink(order, editSettings);
    window.open(waUrl, '_blank');
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setEditOrders(prev => prev.filter(o => o.id !== orderId));
      deleteOrder(orderId);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsManageOpen(false)}>
      <div
        className="modal-content manage-modal-container"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Dynamic Back Button */}
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={handleBackNavigation}
            title="Go back"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {editingProduct || showAddForm ? 'Catalog' : 'Store'}
            </span>
          </button>

          <h2 className="modal-title" style={{ fontSize: '1.05rem', margin: '0 0.5rem', textAlign: 'center', flex: 1 }}>
            <Settings size={18} color="var(--primary)" />
            <span>Admin Control Panel</span>
          </h2>

          <button
            className="btn-close"
            onClick={() => setIsManageOpen(false)}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* PIN Screen */}
        {!isOwnerAuthenticated ? (
          <form onSubmit={handlePinSubmit} style={{ padding: '1.5rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
                border: '1px solid var(--border-active)'
              }}>
                <Lock size={32} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Owner Authentication</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Enter your owner PIN to manage SHARP SHARP store settings, orders & stock. (Default: 1234)
              </p>
            </div>

            {pinError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                {pinError}
              </div>
            )}

            <div className="form-group" style={{ maxWidth: 320, margin: '0 auto 1.25rem' }}>
              <input
                type="password"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', padding: '0.75rem' }}
                placeholder="PIN"
                maxLength={10}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-publish"
              style={{ maxWidth: 320, margin: '0 auto', display: 'flex', justifyContent: 'center' }}
            >
              <Lock size={16} />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="manage-tabs" style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              <button
                className={`manage-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('orders'); setEditingProduct(null); setShowAddForm(false); }}
              >
                <Receipt size={16} />
                <span>Orders ({editOrders.length})</span>
              </button>

              <button
                className={`manage-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => { setActiveTab('products'); }}
              >
                <Package size={16} />
                <span>Catalog ({editProducts.length})</span>
              </button>

              <button
                className={`manage-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setEditingProduct(null); setShowAddForm(false); }}
              >
                <Settings size={16} />
                <span>Store Settings</span>
              </button>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Customer Orders History</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total: {editOrders.length}</span>
                </div>

                {editOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                      <Receipt size={32} color="var(--text-dim)" />
                    </div>
                    <p style={{ fontWeight: 700 }}>No orders recorded yet</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>When customers order, their records will automatically log here.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {editOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{ord.id}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                              {new Date(ord.date).toLocaleDateString()} {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                              style={{
                                background: ord.status === 'Paid' ? 'rgba(34, 197, 94, 0.15)' : ord.status === 'Fulfilled' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: ord.status === 'Paid' ? '#4ade80' : ord.status === 'Fulfilled' ? '#a5b4fc' : '#fbbf24',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.775rem',
                                fontWeight: 700
                              }}
                            >
                              <option value="Pending Payment">Pending Payment</option>
                              <option value="Paid">Paid & Verified</option>
                              <option value="Fulfilled">Fulfilled / Shipped</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                              type="button"
                              className="btn-icon"
                              style={{ background: 'rgba(99, 102, 241, 0.2)', borderColor: 'var(--primary)', color: '#fff', padding: '0.3rem 0.6rem' }}
                              onClick={() => printInvoice(ord, editSettings)}
                              title="Print Invoice"
                            >
                              <FileText size={13} />
                              <span style={{ fontSize: '0.75rem' }}>Print</span>
                            </button>

                            <button
                              type="button"
                              className="btn-icon"
                              style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'var(--accent-whatsapp)', color: '#4ade80', padding: '0.3rem 0.6rem' }}
                              onClick={() => handleSendInvoiceWhatsApp(ord)}
                              title="Send WhatsApp confirmation"
                            >
                              <MessageSquare size={13} />
                              <span style={{ fontSize: '0.75rem' }}>WhatsApp</span>
                            </button>

                            <button
                              type="button"
                              className="btn-close"
                              style={{ width: 28, height: 28 }}
                              onClick={() => handleDeleteOrder(ord.id)}
                              title="Delete Order"
                            >
                              <Trash2 size={13} color="#f87171" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info (Zero Emojis, clean icons) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={13} color="var(--primary)" />
                            <strong>{ord.customerName}</strong>
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>({ord.customerPhone})</span>
                          {ord.customerAddress && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                              <MapPin size={13} color="var(--accent-momo)" />
                              {ord.customerAddress}
                            </span>
                          )}
                        </div>

                        {/* Items breakdown */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                          {ord.items.map((it, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.2rem 0' }}>
                              <span>• {it.quantity}x {it.name} {it.selectedSize ? `[${it.selectedSize}]` : ''}</span>
                              <strong style={{ color: 'var(--text-muted)' }}>
                                {editSettings.currency} {(it.price * it.quantity).toLocaleString()}
                              </strong>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.35rem', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fff' }}>
                            <span>Total Amount:</span>
                            <span>{editSettings.currency} {ord.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CATALOG & MEDIA */}
            {activeTab === 'products' && (
              <div>
                {/* Top action bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {editingProduct ? 'Edit Product' : showAddForm ? 'Add New Product' : 'Catalog Manager'}
                  </h4>

                  {!editingProduct && !showAddForm && (
                    <button
                      type="button"
                      className="btn-add-cart"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={startAddingProduct}
                    >
                      <Plus size={15} />
                      <span>Add Product</span>
                    </button>
                  )}
                </div>

                {/* EDIT PRODUCT FORM */}
                {editingProduct && (
                  <form onSubmit={handleSaveProductEdit} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-active)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>Editing: {editingProduct.name}</span>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </button>
                    </div>

                    {mediaError && (
                      <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {mediaError}
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label">
                        <ImageIcon size={14} />
                        <span>Photos & Videos (Video limit 5MB)</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        <label style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px dashed var(--primary)', borderRadius: '8px', padding: '0.65rem', textAlign: 'center', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <Upload size={14} />
                          <span>Upload Photo / Video</span>
                          <input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => handleMediaFileUpload(e, true)} style={{ display: 'none' }} />
                        </label>
                      </div>

                      {editingProduct.media && editingProduct.media.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {editingProduct.media.map((med, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                              {med.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1b4b', color: '#fff' }}>
                                  <Play size={18} />
                                </div>
                              ) : (
                                <img src={med.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(idx, true)}
                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Price ({editSettings.currency}) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Stock Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Sizes / Variants (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProduct.sizesRaw || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sizesRaw: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn-publish" style={{ flex: 1, margin: 0 }}>
                        <Check size={16} />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* ADD NEW PRODUCT FORM */}
                {showAddForm && !editingProduct && (
                  <form onSubmit={handleAddProduct} style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--primary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800 }}>Create New Product</h5>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label">
                        <ImageIcon size={14} />
                        <span>Add Photos & Videos (Video limit 5MB)</span>
                      </label>
                      <label style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px dashed var(--primary)', borderRadius: '8px', padding: '0.65rem', textAlign: 'center', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Upload size={14} />
                        <span>Upload Photo / Video</span>
                        <input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => handleMediaFileUpload(e, false)} style={{ display: 'none' }} />
                      </label>

                      {newItem.media && newItem.media.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {newItem.media.map((med, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                              {med.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1b4b', color: '#fff' }}>
                                  <Play size={18} />
                                </div>
                              ) : (
                                <img src={med.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(idx, false)}
                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. Sharp Chronograph Watch"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Price ({editSettings.currency}) *</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          placeholder="250"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Stock Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newItem.stock}
                          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        <option value="">Select Category...</option>
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="NEW_CATEGORY">+ Create New Category</option>
                      </select>
                    </div>

                    {(newItem.category === 'NEW_CATEGORY' || newItem.category === '') && (
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">New Category Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Perfumes"
                          value={newItem.customCategory}
                          onChange={(e) => setNewItem({ ...newItem, customCategory: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Sizes / Variants (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. EU 40, EU 41, EU 42"
                        value={newItem.sizesRaw}
                        onChange={(e) => setNewItem({ ...newItem, sizesRaw: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-add-cart" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <Plus size={16} />
                      <span>Add to Catalog</span>
                    </button>
                  </form>
                )}

                {/* PRODUCT LIST (Mobile-First Responsive Layout) */}
                <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {editProducts.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      {/* Product Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={24} color="var(--primary)" />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            {editSettings.currency} {p.price.toLocaleString()} • <span style={{ color: 'var(--primary)' }}>{p.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Product Controls Row (Stock, Edit, Delete) */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock:</span>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, -1)}
                              style={{ background: 'none', border: 'none', color: '#fff', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 800 }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0 0.35rem' }}>{p.stock}</span>
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, 1)}
                              style={{ background: 'none', border: 'none', color: '#fff', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 800 }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', background: 'rgba(99, 102, 241, 0.2)', borderColor: 'var(--primary)', color: '#fff' }}
                            onClick={() => startEditingProduct(p)}
                            title="Edit product"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn-close"
                            style={{ width: 30, height: 30 }}
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete product"
                          >
                            <Trash2 size={14} color="#f87171" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editSettings.storeName}
                    onChange={(e) => setEditSettings({ ...editSettings, storeName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editSettings.tagline}
                    onChange={(e) => setEditSettings({ ...editSettings, tagline: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editSettings.whatsappNumber}
                      onChange={(e) => setEditSettings({ ...editSettings, whatsappNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Currency Symbol</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editSettings.currency}
                      onChange={(e) => setEditSettings({ ...editSettings, currency: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">MoMo Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editSettings.momoNumber}
                      onChange={(e) => setEditSettings({ ...editSettings, momoNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">MoMo Account Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editSettings.momoName}
                      onChange={(e) => setEditSettings({ ...editSettings, momoName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MoMo Network / Provider</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MTN Mobile Money"
                    value={editSettings.momoNetwork}
                    onChange={(e) => setEditSettings({ ...editSettings, momoNetwork: e.target.value })}
                  />
                </div>

                {/* SECURITY: CHANGE ADMIN PIN SECTION */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid var(--border-active)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <KeyRound size={18} color="var(--primary)" />
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Change Owner PIN</h5>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    To protect your store, confirm your existing PIN before setting a new one.
                  </p>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Existing (Old) PIN *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter current PIN"
                      maxLength={10}
                      value={currentPinInput}
                      onChange={(e) => { setCurrentPinInput(e.target.value); setPinChangeError(''); setPinChangeSuccess(''); }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">New PIN (4+ digits) *</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="New PIN"
                        maxLength={10}
                        value={newPinInput}
                        onChange={(e) => { setNewPinInput(e.target.value); setPinChangeError(''); setPinChangeSuccess(''); }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New PIN *</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Confirm new PIN"
                        maxLength={10}
                        value={confirmNewPinInput}
                        onChange={(e) => { setConfirmNewPinInput(e.target.value); setPinChangeError(''); setPinChangeSuccess(''); }}
                      />
                    </div>
                  </div>

                  {pinChangeError && (
                    <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                      <AlertCircle size={14} />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  {pinChangeSuccess && (
                    <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                      <Check size={14} />
                      <span>{pinChangeSuccess}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-icon"
                    style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.65rem'
                    }}
                    onClick={handleUpdatePin}
                  >
                    <KeyRound size={15} />
                    <span>Verify & Set New PIN</span>
                  </button>
                </div>
              </div>
            )}

            {/* Save & Publish to Store Button */}
            <button className="btn-publish" onClick={handlePublish} style={{ marginTop: '1rem' }}>
              <Save size={18} />
              <span>Save & Publish to Store</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
