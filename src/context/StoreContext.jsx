import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_STORE_SETTINGS, DEFAULT_PRODUCTS } from '../utils/defaultData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchSettings, saveSettings,
  fetchProducts, saveProducts, updateProductStock,
  addOrderToDb
} from '../lib/db';

const StoreContext = createContext();

const SETTINGS_KEY = 'sharp_sharp_settings_v3';
const PRODUCTS_KEY = 'sharp_sharp_products_v3';
const CART_KEY = 'sharp_sharp_cart_v3';
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

  const [clientOrders, setClientOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENT_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });

  const [isTutorialOpen, rawSetIsTutorialOpen] = useState(() => {
    try { return !localStorage.getItem(TUTORIAL_SEEN_KEY); } catch { return true; }
  });

  // ── UI Modal States ───────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, rawSetIsCartOpen] = useState(false);
  const [isCheckoutOpen, rawSetIsCheckoutOpen] = useState(false);
  const [isCustomerOrdersOpen, rawSetIsCustomerOrdersOpen] = useState(false);
  const [selectedProductForView, rawSetSelectedProductForView] = useState(null);
  const [activeLightboxMedia, rawSetActiveLightboxMedia] = useState(null);
  const [isSidebarOpen, rawSetIsSidebarOpen] = useState(false);
  const [publishNotification, setPublishNotification] = useState(null);
  const [isDbLoading, setIsDbLoading] = useState(isSupabaseConfigured);

  // ── Browser & Mobile Back-Button Management ──────────────────────────────
  const modalHistoryRef = useRef([]);

  const pushModalHistory = (name) => {
    modalHistoryRef.current.push(name);
    try {
      window.history.pushState({ modal: name, depth: modalHistoryRef.current.length }, '');
    } catch (e) {}
  };

  const popModalHistory = (name) => {
    const idx = modalHistoryRef.current.lastIndexOf(name);
    if (idx !== -1) {
      modalHistoryRef.current.splice(idx, 1);
    }
  };

  // Synchronized setter wrappers
  const setIsCartOpen = (val) => {
    if (val && !isCartOpen) {
      pushModalHistory('cart');
      rawSetIsCartOpen(true);
    } else if (!val && isCartOpen) {
      popModalHistory('cart');
      rawSetIsCartOpen(false);
    } else {
      rawSetIsCartOpen(val);
    }
  };

  const setIsCheckoutOpen = (val) => {
    if (val && !isCheckoutOpen) {
      pushModalHistory('checkout');
      rawSetIsCheckoutOpen(true);
    } else if (!val && isCheckoutOpen) {
      popModalHistory('checkout');
      rawSetIsCheckoutOpen(false);
    } else {
      rawSetIsCheckoutOpen(val);
    }
  };

  const setIsCustomerOrdersOpen = (val) => {
    if (val && !isCustomerOrdersOpen) {
      pushModalHistory('orders');
      rawSetIsCustomerOrdersOpen(true);
    } else if (!val && isCustomerOrdersOpen) {
      popModalHistory('orders');
      rawSetIsCustomerOrdersOpen(false);
    } else {
      rawSetIsCustomerOrdersOpen(val);
    }
  };

  const setSelectedProductForView = (product) => {
    if (product && !selectedProductForView) {
      pushModalHistory('product');
      rawSetSelectedProductForView(product);
    } else if (!product && selectedProductForView) {
      popModalHistory('product');
      rawSetSelectedProductForView(null);
    } else {
      rawSetSelectedProductForView(product);
    }
  };

  const setActiveLightboxMedia = (media) => {
    if (media && !activeLightboxMedia) {
      pushModalHistory('lightbox');
      rawSetActiveLightboxMedia(media);
    } else if (!media && activeLightboxMedia) {
      popModalHistory('lightbox');
      rawSetActiveLightboxMedia(null);
    } else {
      rawSetActiveLightboxMedia(media);
    }
  };

  const setIsSidebarOpen = (val) => {
    if (val && !isSidebarOpen) {
      pushModalHistory('sidebar');
      rawSetIsSidebarOpen(true);
    } else if (!val && isSidebarOpen) {
      popModalHistory('sidebar');
      rawSetIsSidebarOpen(false);
    } else {
      rawSetIsSidebarOpen(val);
    }
  };

  const setIsTutorialOpen = (val) => {
    if (val && !isTutorialOpen) {
      pushModalHistory('tutorial');
      rawSetIsTutorialOpen(true);
    } else if (!val && isTutorialOpen) {
      popModalHistory('tutorial');
      rawSetIsTutorialOpen(false);
    } else {
      rawSetIsTutorialOpen(val);
    }
  };

  // Listen to popstate event (fired when mobile device back button / swipe is used)
  useEffect(() => {
    const handlePopState = (event) => {
      // Topmost overlay closes first
      if (activeLightboxMedia) {
        rawSetActiveLightboxMedia(null);
        popModalHistory('lightbox');
        return;
      }
      if (selectedProductForView) {
        rawSetSelectedProductForView(null);
        popModalHistory('product');
        return;
      }
      if (isCheckoutOpen) {
        rawSetIsCheckoutOpen(false);
        popModalHistory('checkout');
        return;
      }
      if (isCartOpen) {
        rawSetIsCartOpen(false);
        popModalHistory('cart');
        return;
      }
      if (isCustomerOrdersOpen) {
        rawSetIsCustomerOrdersOpen(false);
        popModalHistory('orders');
        return;
      }
      if (isSidebarOpen) {
        rawSetIsSidebarOpen(false);
        popModalHistory('sidebar');
        return;
      }
      if (isTutorialOpen) {
        rawSetIsTutorialOpen(false);
        popModalHistory('tutorial');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    activeLightboxMedia,
    selectedProductForView,
    isCheckoutOpen,
    isCartOpen,
    isCustomerOrdersOpen,
    isSidebarOpen,
    isTutorialOpen
  ]);

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
        const [dbSettings, dbProducts] = await Promise.all([
          fetchSettings(),
          fetchProducts()
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
            const { settings, products: newProducts } = event.data.payload;
            if (settings) { setStoreSettings(settings); localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
            if (newProducts) { setProducts(newProducts); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts)); }
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

  // ── Save & Publish (kept for potential future customer-side settings use;
  // product/settings edits are now normally made from the separate admin app) ──
  const saveAndPublishStore = async (updatedSettings, updatedProducts) => {
    setStoreSettings(updatedSettings);
    setProducts(updatedProducts);

    // Save to localStorage immediately
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch (e) {}

    // Broadcast to other open tabs
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sharp_sharp_live_sync');
        channel.postMessage({
          type: 'STORE_PUBLISHED',
          payload: { settings: updatedSettings, products: updatedProducts }
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
    isCustomerOrdersOpen,
    setIsCustomerOrdersOpen,
    selectedProductForView,
    setSelectedProductForView,
    activeLightboxMedia,
    setActiveLightboxMedia,
    isSidebarOpen,
    setIsSidebarOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    totalCartItems,
    totalCartPrice,
    addOrder,
    reorderItems,
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
