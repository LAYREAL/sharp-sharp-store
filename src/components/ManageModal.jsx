import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { printInvoice } from '../utils/invoiceGenerator';
import { generateCustomerInvoiceWhatsAppLink } from '../utils/whatsappFormatter';
import {
  X,
  Settings,
  Package,
  Plus,
  Trash2,
  Save,
  Lock,
  Receipt,
  FileText,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Edit,
  Check,
  MessageSquare,
  Sparkles,
  Rocket
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

  React.useEffect(() => {
    if (isManageOpen) {
      setEditSettings({ ...storeSettings });
      setEditProducts([...products]);
      setEditOrders([...orders]);
    }
  }, [isManageOpen, storeSettings, products, orders]);

  // Add new product form draft state
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
    sizesRaw: 'S, M, L, XL'
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [mediaError, setMediaError] = useState('');

  if (!isManageOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === (storeSettings.adminPin || '1234')) {
      setIsOwnerAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default PIN is 1234.');
    }
  };

  const handlePublish = () => {
    saveAndPublishStore(editSettings, editProducts, editOrders);
    setIsManageOpen(false);
  };

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

  const handleMediaFileUpload = (e, isEditingMode = false) => {
    setMediaError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');

    if (isVideo && file.size > 5 * 1024 * 1024) {
      setMediaError(`Video file "${file.name}" exceeds the 5MB limit! (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please pick a clip under 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const mediaItem = {
        type: isVideo ? 'video' : 'image',
        url: reader.result
      };

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
      sizesRaw: 'S, M, L, XL'
    });
    setShowAddForm(false);
  };

  const startEditingProduct = (product) => {
    setEditingProduct({
      ...product,
      sizesRaw: product.sizes ? product.sizes.join(', ') : 'Standard',
      customCategory: ''
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

  const handleStatusChange = (orderId, newStatus) => {
    setEditOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateOrderStatus(orderId, newStatus);
  };

  const handleSendInvoiceWhatsApp = (order) => {
    const waUrl = generateCustomerInvoiceWhatsAppLink(order, editSettings);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsManageOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Settings size={20} color="var(--primary)" />
            <span>SHARP SHARP - Admin Control Panel</span>
          </h2>
          <button className="btn-close" onClick={() => setIsManageOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {!isOwnerAuthenticated ? (
          <form onSubmit={handlePinSubmit} style={{ padding: '1rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <Lock size={40} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Owner Authentication</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Enter your owner PIN to manage SHARP SHARP store settings, orders & stock. (Default: 1234)
              </p>
            </div>

            {pinError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.85rem' }}>
                {pinError}
              </div>
            )}

            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="Enter 4-digit PIN (1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="btn-publish" style={{ marginTop: '0.5rem' }}>
              <Lock size={16} />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        ) : (
          <>
            <div className="manage-tabs">
              <button
                className={`manage-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Receipt size={16} />
                <span>Orders ({editOrders.length})</span>
              </button>

              <button
                className={`manage-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package size={16} />
                <span>Catalog & Media ({editProducts.length})</span>
              </button>

              <button
                className={`manage-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} />
                <span>Store Settings</span>
              </button>
            </div>

            {/* TAB 1: ORDERS & SALES TRACKING */}
            {activeTab === 'orders' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Customer Sales & Order History</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Orders: {editOrders.length}</span>
                </h4>

                {editOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                      <Receipt size={40} color="var(--text-dim)" />
                    </div>
                    <p style={{ fontWeight: 700 }}>No orders recorded yet</p>
                    <p style={{ fontSize: '0.85rem' }}>When customers order on WhatsApp, their records will automatically log here.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {editOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{ord.id}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                              {new Date(ord.date).toLocaleDateString()} {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                              style={{
                                background: ord.status === 'Paid' ? 'rgba(34, 197, 94, 0.15)' : ord.status === 'Fulfilled' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: ord.status === 'Paid' ? '#4ade80' : ord.status === 'Fulfilled' ? '#a5b4fc' : '#fbbf24',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.25rem 0.5rem',
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
                              title="Generate Printable Invoice"
                            >
                              <FileText size={14} />
                              <span style={{ fontSize: '0.75rem' }}>Print</span>
                            </button>

                            <button
                              type="button"
                              className="btn-icon"
                              style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'var(--accent-whatsapp)', color: '#fff', padding: '0.3rem 0.6rem' }}
                              onClick={() => handleSendInvoiceWhatsApp(ord)}
                              title="Send confirmed invoice directly to customer on WhatsApp"
                            >
                              <MessageSquare size={14} color="#4ade80" />
                              <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>WhatsApp</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          👤 <strong>{ord.customerName}</strong> ({ord.customerPhone}) • 📍 {ord.customerAddress}
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                          {ord.items.map((it, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.2rem 0' }}>
                              <span>
                                • {it.quantity}x {it.name} {it.selectedSize ? `[Size: ${it.selectedSize}]` : ''}
                              </span>
                              <strong style={{ color: 'var(--text-muted)' }}>
                                {editSettings.currency} {(it.price * it.quantity).toLocaleString()}
                              </strong>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.35rem', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fff' }}>
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

            {/* TAB 2: PRODUCTS CATALOG & MEDIA */}
            {activeTab === 'products' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Catalog & Media Manager</h4>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setEditingProduct(null);
                    }}
                    style={{ background: 'var(--primary)', borderColor: 'transparent', color: '#fff' }}
                  >
                    <Plus size={16} />
                    <span>{showAddForm ? 'Cancel' : 'Add New Item'}</span>
                  </button>
                </div>

                {mediaError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '0.85rem', fontWeight: 600 }}>
                    {mediaError}
                  </div>
                )}

                {/* EDIT PRODUCT FORM */}
                {editingProduct && (
                  <form onSubmit={handleSaveProductEdit} style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Edit size={16} color="var(--primary)" />
                        <span>Edit Product: "{editingProduct.name}"</span>
                      </h5>
                      <button type="button" className="btn-close" style={{ width: '26px', height: '26px' }} onClick={() => setEditingProduct(null)}>
                        <X size={14} />
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">
                        <ImageIcon size={14} />
                        <span>Update Photos & Videos (Videos max 5MB)</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <label
                          style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px dashed var(--primary)',
                            borderRadius: '8px',
                            padding: '0.65rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Upload size={14} />
                          <span>Add Photo / Video</span>
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={(e) => handleMediaFileUpload(e, true)}
                            style={{ display: 'none' }}
                          />
                        </label>

                        <input
                          type="url"
                          className="form-input"
                          placeholder="Or paste https:// media link..."
                          value={editingProduct.image || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        />
                      </div>

                      {editingProduct.media && editingProduct.media.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {editingProduct.media.map((med, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                              {med.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1b4b', color: '#fff' }}>
                                  <Play size={20} />
                                </div>
                              ) : (
                                <img src={med.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(idx, true)}
                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem' }}
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

                    <div className="form-group">
                      <label className="form-label">Full Item Description</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Available Sizes / Variants (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProduct.sizesRaw || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sizesRaw: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      >
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="NEW_CATEGORY">+ Create New Category</option>
                      </select>
                    </div>

                    {editingProduct.category === 'NEW_CATEGORY' && (
                      <div className="form-group">
                        <label className="form-label">New Category Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Watches"
                          value={editingProduct.customCategory || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, customCategory: e.target.value })}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button type="submit" className="btn-publish" style={{ flex: 1, margin: 0 }}>
                        <Check size={16} />
                        <span>Update Product Changes</span>
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
                    <h5 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Add New Product</h5>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">
                        <ImageIcon size={14} />
                        <span>Add Photos & Videos (Videos max 5MB)</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <label
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px dashed var(--primary)',
                            borderRadius: '8px',
                            padding: '0.65rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Upload size={14} />
                          <span>Upload Photo / Video</span>
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={(e) => handleMediaFileUpload(e, false)}
                            style={{ display: 'none' }}
                          />
                        </label>

                        <input
                          type="url"
                          className="form-input"
                          placeholder="Or paste media https:// link..."
                          value={newItem.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewItem(prev => ({
                              ...prev,
                              image: val,
                              media: val ? [...(prev.media || []), { type: 'image', url: val }] : prev.media
                            }));
                          }}
                        />
                      </div>

                      {newItem.media && newItem.media.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {newItem.media.map((med, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                              {med.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1b4b', color: '#fff' }}>
                                  <Play size={20} />
                                </div>
                              ) : (
                                <img src={med.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(idx, false)}
                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem' }}
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
                        placeholder="e.g. Sharp Leather Boots"
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

                    <div className="form-group">
                      <label className="form-label">Full Item Description</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Detailed specifications, fabric, features..."
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Available Sizes / Variants (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. EU 40, EU 41, EU 42, EU 43"
                        value={newItem.sizesRaw}
                        onChange={(e) => setNewItem({ ...newItem, sizesRaw: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
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
                      <div className="form-group">
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

                    <button type="submit" className="btn-add-cart" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <Plus size={16} />
                      <span>Save Item to Catalog</span>
                    </button>
                  </form>
                )}

                {/* PRODUCT LIST TABLE */}
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {editProducts.map((p) => (
                    <div key={p.id} className="manage-item-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={24} color="var(--primary)" />
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            {editSettings.currency} {p.price.toLocaleString()} • Category: <strong>{p.category}</strong>
                          </div>
                          {p.sizes && p.sizes.length > 0 && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--primary)' }}>
                              Sizes: {p.sizes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        className="btn-icon"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem', background: 'rgba(99, 102, 241, 0.2)', borderColor: 'var(--primary)', color: '#fff' }}
                        onClick={() => startEditingProduct(p)}
                        title="Edit published item details"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.2rem', marginRight: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock:</span>
                        <div className="qty-controls" style={{ padding: '0.1rem 0.4rem' }}>
                          <button type="button" className="qty-btn" onClick={() => handleStockChange(p.id, -1)}>-</button>
                          <span className="qty-val" style={{ fontSize: '0.825rem' }}>{p.stock}</span>
                          <button type="button" className="qty-btn" onClick={() => handleStockChange(p.id, 1)}>+</button>
                        </div>
                      </div>

                      <button
                        className="btn-close"
                        onClick={() => handleDeleteProduct(p.id)}
                        title="Delete product"
                      >
                        <Trash2 size={15} color="#f87171" />
                      </button>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
              </div>
            )}

            <button className="btn-publish" onClick={handlePublish}>
              <Save size={18} />
              <span>Save & Publish to Store</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
