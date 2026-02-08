import React, { createContext, useContext, useReducer } from 'react';

const UIContext = createContext();

// UI reducer
const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODAL':
      return {
        ...state,
        modalOpen: action.payload.open,
        modalType: action.payload.type || state.modalType,
      };
    case 'SET_CART_OPEN':
      return {
        ...state,
        isCartOpen: action.payload,
      };
    case 'SET_REGISTRATION_OPEN':
      return {
        ...state,
        isRegistrationOpen: action.payload,
      };
    case 'SET_CHECKOUT_OPEN':
      return {
        ...state,
        isCheckoutOpen: action.payload,
      };
    case 'SET_MOBILE_MENU_OPEN':
      return {
        ...state,
        isMobileMenuOpen: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  modalOpen: false,
  modalType: null,
  isCartOpen: false,
  isRegistrationOpen: false,
  isCheckoutOpen: false,
  isMobileMenuOpen: false,
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setModal = (open, type) => {
    dispatch({ type: 'SET_MODAL', payload: { open, type } });
  };

  const setIsCartOpen = (open) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const setIsRegistrationOpen = (open) => {
    dispatch({ type: 'SET_REGISTRATION_OPEN', payload: open });
  };

  const setIsCheckoutOpen = (open) => {
    dispatch({ type: 'SET_CHECKOUT_OPEN', payload: open });
  };

  const setIsMobileMenuOpen = (open) => {
    dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: open });
  };

  const value = {
    ...state,
    setModal,
    setIsCartOpen,
    setIsRegistrationOpen,
    setIsCheckoutOpen,
    setIsMobileMenuOpen,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;
