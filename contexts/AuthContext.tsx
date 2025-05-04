//context/AuthContext.tsx

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type user = {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'safety-engineer';
};

type AuthContextType = {
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  logout: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const id = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('username');
        const email = await AsyncStorage.getItem('userEmail');
        const role = await AsyncStorage.getItem('userRole');

        // Хэрэглэгчийн мэдээлэл хэрвээ байгаа бол
        if (id && name && email && role) {
          setUser({ id, name, email, role: role as 'employee' | 'safety-engineer' });
        }
      } catch (err) {
        console.error('Storage load error:', err);
      }
      setLoading(false);
    };

    loadUser();
  }, []); // loadUser зөв ажиллахын тулд, анхны load-ийг хийх

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
