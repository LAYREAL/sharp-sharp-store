import React from 'react';
import { useStore } from '../context/StoreContext';
import { printInvoice } from '../utils/invoiceGenerator';
import { X, Receipt, FileText, RefreshCw, Download, CheckCircle, Clock, MapPin, Package } from 'lucide-react';

export default function CustomerOrdersModal() {
  const {
    isCustomerOrdersOpen,
    setIsCustomerOrdersOpen,
    clientOrders,
    storeSettings,
    reorderItems
  } = useStore();

  if (!isCustomerOrdersOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCustomerOrdersOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Receipt size={20} color="var(--primary)" />
            <span>My Past Orders & Download Receipts</span>
          </h2>
          <button className="btn-close" onClick={() => setIsCustomerOrdersOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {clientOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
              <Receipt size={48} color="var(--text-dim)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No orders placed yet</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              When you order on WhatsApp, your order history and downloadable receipts will save here automatically.
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clientOrders.map((ord) => {
              const isPaid = ord.status === 'Paid' || ord.status === 'Fulfilled';

              return (
                <div
                  key={ord.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{ord.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        {new Date(ord.date).toLocaleDateString()} {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span
                      style={{
                        background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isPaid ? '#4ade80' : '#fbbf24',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                      <span>{ord.status || 'Pending Payment'}</span>
                    </span>
                  </div>

                  {/* Delivery details */}
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>Delivery Address: <strong style={{ color: '#fff' }}>{ord.customerAddress}</strong></span>
                  </div>

                  {/* Items list */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.825rem' }}>
                    {ord.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0' }}>
                        <span>
                          • {it.quantity}x {it.name} {it.selectedSize ? `[Size: ${it.selectedSize}]` : ''}
                        </span>
                        <strong style={{ color: 'var(--text-muted)' }}>
                          {storeSettings.currency} {(it.price * it.quantity).toLocaleString()}
                        </strong>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                      <span>Total Amount:</span>
                      <span>{storeSettings.currency} {ord.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        background: 'var(--primary-gradient)',
                        borderColor: 'transparent',
                        color: '#fff',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                      onClick={() => printInvoice(ord, storeSettings)}
                    >
                      <Download size={15} />
                      <span>Download Official Invoice</span>
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      style={{ justifyContent: 'center' }}
                      onClick={() => reorderItems(ord)}
                      title="Add these items back to cart"
                    >
                      <RefreshCw size={14} />
                      <span>Re-Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
