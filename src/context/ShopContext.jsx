import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { socket } from '../api/socketClient';

const ShopContext = createContext();

export const CATEGORIES = ['All', 'Electronics', 'Workspace', 'Fashion', 'Accessories'];

const CART_STORAGE_KEY = 'vortex_cart_v1';
const WISHLIST_STORAGE_KEY = 'vortex_wishlist_v1';

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [toasts, setToasts] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const pushToast = useCallback((title, message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/products', {
        params: { category: selectedCategory, search: searchQuery }
      });
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to load products:', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const registerUserRoom = () => {
      setSocketConnected(true);
      if (user?.id) {
        socket.emit('register_session', { userId: user.id, role: user.role });
      }
    };

    if (socket.connected) {
      registerUserRoom();
    }

    const handleDisconnect = () => setSocketConnected(false);

    const handleInventoryUpdated = (updatedItems) => {
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const match = updatedItems.find((u) => u._id === prod._id);
          return match ? { ...prod, stock: match.stock } : prod;
        })
      );
    };

    const handleProductCreated = (newProduct) => {
      setProducts((prevProducts) => {
        if (prevProducts.some((p) => p._id === newProduct._id)) return prevProducts;
        return [newProduct, ...prevProducts];
      });
    };

    const handleOrderCreated = (newOrder) => {
      if (user?.role === 'seller') {
        pushToast(
          'New Paid Order Received!',
          `${newOrder.customer.fullName} paid ₦${Number(newOrder.totalAmount).toLocaleString()} (${newOrder.orderReference})`,
          'success'
        );
      }
    };

    const handleOrderStatusUpdated = (updatedOrder) => {
      if (user && updatedOrder.buyer === user.id) {
        pushToast(
          'Order Status Updated!',
          `Order ${updatedOrder.orderReference} is now "${updatedOrder.deliveryStatus}"`,
          'info'
        );
      }
    };

    socket.on('connect', registerUserRoom);
    socket.on('disconnect', handleDisconnect);
    socket.on('inventory:updated', handleInventoryUpdated);
    socket.on('product:created', handleProductCreated);
    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleOrderStatusUpdated);

    return () => {
      socket.off('connect', registerUserRoom);
      socket.off('disconnect', handleDisconnect);
      socket.off('inventory:updated', handleInventoryUpdated);
      socket.off('product:created', handleProductCreated);
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleOrderStatusUpdated);
    };
  }, [user, pushToast]);

  const handleLogout = () => {
    localStorage.removeItem('vortex_token');
    localStorage.removeItem('vortex_user');
    setUser(null);
  };

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 5000 : 0;
  const totalAmount = subtotal + shippingFee;
  const formatPrice = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  return (
    <ShopContext.Provider
      value={{
        products,
        setProducts,
        loading,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        user,
        setUser,
        handleLogout,
        fetchProducts,
        subtotal,
        shippingFee,
        totalAmount,
        formatPrice,
        activeModal,
        setActiveModal,
        completedOrder,
        setCompletedOrder,
        socketConnected,
        toasts,
        pushToast,
        dismissToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);