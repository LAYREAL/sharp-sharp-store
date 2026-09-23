import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_STORE_SETTINGS, DEFAULT_PRODUCTS, DEFAULT_ORDERS } from '../utils/defaultData';

const StoreContext = createContext();

const SETTINGS_KEY = 'sharp_sharp_settings_v3';
const PRODUCTS_KEY = 'sharp_sharp_products_v3';
const CART_KEY = 'sharp_sharp_cart_v3';
const ORDERS_KEY = 'sharp_sharp_orders_v3';
const CLIENT_ORDERS_KEY = 'sharp_sharp_client_orders_v3';

export function StoreProvider({ children }) {
  // Load Store Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Load Products Catalog
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  // Load Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load Admin Orders History
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });

  // Load Client Personal Orders History
  const [clientOrders, setClientOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENT_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [activeLightboxMedia, setActiveLightboxMedia] = useState(null);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [publishNotification, setPublishNotification] = useState(null);

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  // Save Admin Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  }, [orders]);

  // Save Client Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLIENT_ORDERS_KEY, JSON.stringify(clientOrders));
    } catch (e) {
      console.error("Failed to save client orders", e);
    }
  }, [clientOrders]);

  // BroadcastChannel for Real-Time Cross-Tab Sync
  useEffect(() => {
    let channel;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('sharp_sharp_live_sync');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'STORE_PUBLISHED') {
            const { settings, products: newProducts, orders: newOrders } = event.data.payload;
            if (settings) {
              setStoreSettings(settings);
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            }
            if (newProducts) {
              setProducts(newProducts);
              localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
            }
            if (newOrders) {
              setOrders(newOrders);
              localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
            }
            showNotification("Store catalog & live orders updated!");
          }
        };
      }
    } catch (err) {
      console.warn("BroadcastChannel error:", err);
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  const showNotification = (msg) => {
    setPublishNotification(msg);
    setTimeout(() => {
      setPublishNotification(null);
    }, 4000);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Cart Operations
  const addToCart = (product, selectedSize) => {
    setCart(prevCart => {
      const sizeToUse = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
      const cartItemId = `${product.id}_${sizeToUse}`;
      
      const existing = prevCart.find(item => item.cartItemId === cartItemId || (item.id === product.id && item.selectedSize === sizeToUse));
      if (existing) {
        return prevCart.map(item =>
          (item.cartItemId === cartItemId || (item.id === product.id && item.selectedSize === sizeToUse))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          cartItemId,
          selectedSize: sizeToUse,
          quantity: 1
        }
      ];
    });
  };

  const updateCartQuantity = (cartItemId, delta) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.cartItemId === cartItemId || item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Orders Management & Automatic Stock Deduction
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

    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        const itemInCart = cart.find(ci => ci.id === p.id);
        if (itemInCart && p.isStockTracked) {
          const newStock = Math.max(0, p.stock - itemInCart.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
      try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setOrders(prev => [newOrder, ...prev]);
    setClientOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const reorderItems = (pastOrder) => {
    if (pastOrder && pastOrder.items) {
      pastOrder.items.forEach(item => {
        const matchingProduct = products.find(p => p.id === item.id) || {
          id: item.id,
          name: item.name,
          price: item.price
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
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const saveAndPublishStore = (updatedSettings, updatedProducts, updatedOrders = orders) => {
    setStoreSettings(updatedSettings);
    setProducts(updatedProducts);
    setOrders(updatedOrders);

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sharp_sharp_live_sync');
        channel.postMessage({
          type: 'STORE_PUBLISHED',
          payload: {
            settings: updatedSettings,
            products: updatedProducts,
            orders: updatedOrders
          }
        });
        channel.close();
      }
    } catch (e) {
      console.error("Save & publish error", e);
    }

    showNotification("SHARP SHARP published! Live updates sent to all open tabs.");
  };

  const value = {
    storeSettings,
    products,
    categories,
    cart,
    orders,
    clientOrders,
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
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
