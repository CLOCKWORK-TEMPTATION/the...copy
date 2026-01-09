'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  available: boolean;
  vendor?: {
    name: string;
  };
}

interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export default function CrewMenuPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchVendors();
    fetchMyOrders();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vendors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchMenu = async (vendorId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/vendors/${vendorId}/menu`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMenuItems(response.data);
      setSelectedVendor(vendorId);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMyOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = (menuItemId: string) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItemId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { menuItemId, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.menuItemId !== menuItemId));
    }
  };

  const submitOrder = async () => {
    if (!sessionId || cart.length === 0) {
      alert('Please enter session ID and add items to cart');
      return;
    }

    setLoading(true);
    try {
      // Get user hash from localStorage or generate one
      let userHash = localStorage.getItem('userHash');
      if (!userHash) {
        userHash = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userHash', userHash);
      }

      await axios.post(
        `${apiUrl}/orders`,
        {
          sessionId,
          userHash,
          items: cart,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Order submitted successfully!');
      setCart([]);
      fetchMyOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantityInCart = (menuItemId: string) => {
    const item = cart.find((i) => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Menu</h1>
          <p className="text-gray-600">Select items from available vendors</p>
        </div>

        {/* Session ID Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session ID (from Director)
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vendors List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => fetchMenu(vendor.id)}
                className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow ${
                  selectedVendor === vendor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {vendor.is_mobile ? 'Mobile' : 'Fixed Location'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {menuItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getItemQuantityInCart(item.id) > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {getItemQuantityInCart(item.id)}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(item.id)}
                      disabled={!item.available}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {getItemQuantityInCart(item.id) === 0 ? 'Add' : '+'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Order ({cart.length} items)</h2>
            <div className="space-y-2 mb-4">
              {cart.map((item) => {
                const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                return (
                  <div key={item.menuItemId} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {menuItem?.name || 'Unknown Item'}
                    </span>
                    <span className="font-semibold">x{item.quantity}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        )}

        {/* My Orders */}
        {myOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {order.items.length} item(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
