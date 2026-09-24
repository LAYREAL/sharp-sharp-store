import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_STORE_SETTINGS, DEFAULT_PRODUCTS, DEFAULT_ORDERS } from '../utils/defaultData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchSettings, saveSettings,
  fetchProducts, saveProducts, updateProductStock,
  fetchOrders, addOrderToDb, updateOrderStatusInDb
} from '../lib/db';

const StoreContext = createContext();

const SETTINGS_KEY = 'sharp_sharp_settings_v3';
const PRODUCTS_KEY = 'sharp_sharp_products_v3';
const CART_KEY = 'sharp_sharp_cart_v3';
const ORDERS_KEY = 'sharp_sharp_orders_v3';
const CLIENT_ORDERS_KEY = 'sharp_sharp_client_orders_v3';
const THEME_KEY = 'sharp_sharp_theme';
const TUTORIAL_SEEN_KEY = 'sharp_sharp_seen_tutorial';

export function StoreProvider({ children }) {
  // ── Persisted State (localStorage first, then Supabase) ──────────────────
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch { return DEFAULT_STORE_SETTINGS; }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch { return DEFAULT_PRODUCTS; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
    } catch { return DEFAULT_ORDERS; }
  });

  const [clientOrders, setClientOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENT_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });

  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    try { return !localStorage.getItem(TUTORIAL_SEEN_KEY); } catch { return true; }
  });

  // ── UI State ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [activeLightboxMedia, setActiveLightboxMedia] = useState(null);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [publishNotification, setPublishNotification] = useState(null);
  const [isDbLoading, setIsDbLoading] = useState(isSupabaseConfigured);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  // ── Tutorial seen ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTutorialOpen) {
      try { localStorage.setItem(TUTORIAL_SEEN_KEY, 'true'); } catch (e) {}
    }
  }, [isTutorialOpen]);

  // ── Load from Supabase on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    (async () => {
      try {
        const [dbSettings, dbProducts, dbOrders] = await Promise.all([
          fetchSettings(),
          fetchProducts(),
          fetchOrders()
        ]);

        if (cancelled) return;

        if (dbSettings) {
          setStoreSettings(dbSettings);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(dbSettings));
        }
        if (dbProducts) {
          setProducts(dbProducts);
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(dbProducts));
        }
        if (dbOrders) {
          setOrders(dbOrders);
          localStorage.setItem(ORDERS_KEY, JSON.stringify(dbOrders));
        }
      } catch (e) {
        console.warn('Supabase load error, using localStorage fallback:', e);
      } finally {
        if (!cancelled) setIsDbLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Persist cart to localStorage ──────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  // ── Persist orders to localStorage ───────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch (e) {}
  }, [orders]);

  // ── Persist client orders to localStorage ─────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(CLIENT_ORDERS_KEY, JSON.stringify(clientOrders)); } catch (e) {}
  }, [clientOrders]);

  // ── BroadcastChannel cross-tab sync ──────────────────────────────────────
  useEffect(() => {
    let channel;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('sharp_sharp_live_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'STORE_PUBLISHED') {
            const { settings, products: newProducts, orders: newOrders } = event.data.payload;
            if (settings) { setStoreSettings(settings); localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
            if (newProducts) { setProducts(newProducts); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts)); }
            if (newOrders) { setOrders(newOrders); localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders)); }
            showNotification('Store updated live!');
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
    return () => { if (channel) channel.close(); };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showNotification = (msg) => {
    setPublishNotification(msg);
    setTimeout(() => setPublishNotification(null), 4000);
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // ── Cart Operations ───────────────────────────────────────────────────────
  const addToCart = (product, selectedSize) => {
    setCart(prevCart => {
      const sizeToUse = selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : 'Standard');
      const cartItemId = `${product.id}_${sizeToUse}`;
      const existing = prevCart.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, cartItemId, selectedSize: sizeToUse, quantity: 1 }];
    });
  };

  const updateCartQuantity = (cartItemId, delta) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.cartItemId === cartItemId || item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Orders ────────────────────────────────────────────────────────────────
  const addOrder = (orderData) => {
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerName: orderData.name,
      customerPhone: orderData.phone,
      customerAddress: orderData.address,
      notes: orderData.notes || '',
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize || 'Standard'
      })),
      totalAmount: totalCartPrice,
      status: 'Pending Payment',
      date: new Date().toISOString()
    };

    // Deduct stock locally and update Supabase
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        const itemInCart = cart.find(ci => ci.id === p.id);
        if (itemInCart && p.isStockTracked) {
          const newStock = Math.max(0, p.stock - itemInCart.quantity);
          updateProductStock(p.id, newStock); // async, fire-and-forget
          return { ...p, stock: newStock };
        }
        return p;
      });
      try { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setOrders(prev => [newOrder, ...prev]);
    setClientOrders(prev => [newOrder, ...prev]);
    addOrderToDb(newOrder); // async, fire-and-forget

    return newOrder;
  };

  const reorderItems = (pastOrder) => {
    if (pastOrder?.items) {
      pastOrder.items.forEach(item => {
        const matchingProduct = products.find(p => p.id === item.id) || {
          id: item.id, name: item.name, price: item.price
        };
        addToCart(matchingProduct, item.selectedSize || 'Standard');
      });
      setIsCustomerOrdersOpen(false);
      setIsCartOpen(true);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setClientOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateOrderStatusInDb(orderId, newStatus); // async, fire-and-forget
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // ── Save & Publish ────────────────────────────────────────────────────────
  const saveAndPublishStore = async (updatedSettings, updatedProducts, updatedOrders = orders) => {
    setStoreSettings(updatedSettings);
    setProducts(updatedProducts);
    setOrders(updatedOrders);

    // Save to localStorage immediately
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    } catch (e) {}

    // Broadcast to other open tabs
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sharp_sharp_live_sync');
        channel.postMessage({
          type: 'STORE_PUBLISHED',
          payload: { settings: updatedSettings, products: updatedProducts, orders: updatedOrders }
        });
        channel.close();
      }
    } catch (e) {}

    // Save to Supabase (async)
    try {
      await Promise.all([
        saveSettings(updatedSettings),
        saveProducts(updatedProducts)
      ]);
    } catch (e) {
      console.warn('Supabase save error:', e);
    }

    showNotification('SHARP SHARP published! Changes saved.');
  };

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = {
    storeSettings,
    products,
    categories,
    cart,
    orders,
    clientOrders,
    theme,
    toggleTheme,
    isTutorialOpen,
    setIsTutorialOpen,
    isDbLoading,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isManageOpen,
    setIsManageOpen,
    isCustomerOrdersOpen,
    setIsCustomerOrdersOpen,
    selectedProductForView,
    setSelectedProductForView,
    activeLightboxMedia,
    setActiveLightboxMedia,
    isOwnerAuthenticated,
    setIsOwnerAuthenticated,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    totalCartItems,
    totalCartPrice,
    addOrder,
    reorderItems,
    updateOrderStatus,
    deleteOrder,
    saveAndPublishStore,
    publishNotification
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
