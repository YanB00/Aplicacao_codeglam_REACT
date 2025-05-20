import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const UserIdContext = createContext(null);

export const UserIdProvider = ({ children }) => {
  const location = useLocation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialUserId = searchParams.get('userId');
    if (initialUserId) {
      setUserId(initialUserId);
    }
  }, [location.search]);

  return (
    <UserIdContext.Provider value={userId}>
      {children}
    </UserIdContext.Provider>
  );
};

export const useUserId = () => {
  return useContext(UserIdContext);
};