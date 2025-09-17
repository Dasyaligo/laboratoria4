import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.flight_id === action.payload.flight_id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.flight_id === action.payload.flight_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.flight_id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.flight_id === action.payload.flightId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    // Load cart from server if user is logged in
    const loadCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const cartData = await response.json();
            dispatch({ type: 'LOAD_CART', payload: cartData });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    };

    loadCart();
  }, []);



// СТАЛО:
const addToCart = async (flight) => {
    dispatch({ type: 'ADD_TO_CART', payload: flight });
    
    // Sync with server if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3001/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    flight_id: flight.flight_id,
                    passengers_count: 1
                })
            });
            
            if (!response.ok) {
                throw new Error('Ошибка синхронизации корзины');
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }
};

  const removeFromCart = (flightId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: flightId });
  };

  const updateQuantity = (flightId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { flightId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalAmount = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items: cartState.items,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return React.createElement(
    CartContext.Provider,
    { value: value },
    children
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};