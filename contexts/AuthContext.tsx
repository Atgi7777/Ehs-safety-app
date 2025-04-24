import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'safety-engineer' | 'employee';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
        setLoading(true);
        try {
          const id = await AsyncStorage.getItem('userId');
          const name = await AsyncStorage.getItem('username');
          const email = await AsyncStorage.getItem('userEmail');
          const role = await AsyncStorage.getItem('userRole');
      
          if (id && name && email && role) {
            setUser({
              id,
              name,
              email,
              role: role as 'safety-engineer' | 'employee',
            });
          }
        } catch (err) {
          console.error('Storage-оос хэрэглэгч ачааллахад алдаа:', err);
        }
        setLoading(false);
      };
      

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);

    const loggedInUser: User = {
        id: '123',
        name: username === 'engineer' ? 'Инженер Бат' : 'Ажилтан Отгоо',
        email: username === 'engineer' ? 'engineer@ehs.com' : 'employee@ehs.com', // ✨
        role: username === 'engineer' ? 'safety-engineer' : 'employee',
      };
      

    await AsyncStorage.setItem('userId', loggedInUser.id);
    await AsyncStorage.setItem('username', loggedInUser.name); // 👈
    await AsyncStorage.setItem('userRole', loggedInUser.role);
    await AsyncStorage.setItem('userEmail', loggedInUser.email);

    setUser(loggedInUser);
    setLoading(false);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
