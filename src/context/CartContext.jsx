import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', { product, quantity });
    
    // Check if item already exists in cart
    const existingItem = state.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      console.log('Updating existing item:', existingItem);
      dispatch({ type: 'UPDATE_ITEM', payload: { id: existingItem.id, quantity: existingItem.quantity + quantity } });
      return existingItem;
    }
    
    // Create new cart item
    const cartItem = {
      id: Date.now(),
      product: {
        id: product.id,
        title: product.title || product.name, // Support both title and name
        price: product.price,
        image: product.images?.[0] || product.image_url || '/placeholder-product.jpg'
      },
      quantity: quantity,
    };
    
    console.log('Created cart item:', cartItem);
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    return cartItem;
  };

  const updateCartItem = (itemId, quantity) => {
    // Mock implementation - update local state only
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    }
  };

  const removeFromCart = (itemId) => {
    // Mock implementation - remove from local state only
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    updateQuantity: updateCartItem, // Alias for compatibility
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
