import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  const showError = useCallback((msg, is401 = false) => {
    setErrorMessage(msg);
    setIsErrorOpen(true);
    setShouldRedirectToLogin(is401);
  }, []);

  const closeError = useCallback(() => {
    setIsErrorOpen(false);
    if (shouldRedirectToLogin) {
      window.location.href = '/login';
    }
  }, [shouldRedirectToLogin]);

  return (
    <ErrorContext.Provider value={{ showError, closeError, errorMessage, isErrorOpen }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
