// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';

// interface User {
//   id: string;
//   name: string;
//   email: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   checkAuth: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const response = await fetch('/api/auth/me');
//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     const response = await fetch('/api/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Login failed');
//     }

//     await checkAuth();
//     router.push('/dashboard');
//   };

//   const signup = async (name: string, email: string, password: string) => {
//     const response = await fetch('/api/auth/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, password }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Signup failed');
//     }

//     await checkAuth();
//     router.push('/dashboard');
//   };

//   const logout = async () => {
//     await fetch('/api/auth/logout', { method: 'POST' });
//     setUser(null);
//     router.push('/login');
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         logout,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // ← ADD THIS
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setToken: (token: string | null) => void; // ← ADD THIS (optional but useful)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null); // ← ADD THIS STATE
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize token from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setTokenState(savedToken);
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: token ? {
          'Authorization': `Bearer ${token}` // ← USE THE TOKEN
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        setTokenState(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setTokenState(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // ✅ CRITICAL: Save the token
    const authToken = data.token || data.access_token;
    setTokenState(authToken);
    localStorage.setItem('auth_token', authToken);
    
    await checkAuth();
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    
    // ✅ Save token on signup too
    const authToken = data.token || data.access_token;
    setTokenState(authToken);
    localStorage.setItem('auth_token', authToken);
    
    await checkAuth();
    router.push('/dashboard');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    setUser(null);
    setTokenState(null); // ← Clear token
    localStorage.removeItem('auth_token'); // ← Clear from storage
    router.push('/login');
  };

  // Helper function to update token
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // ← NOW INCLUDED IN CONTEXT
        loading,
        login,
        signup,
        logout,
        checkAuth,
        setToken, // Optional but useful
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}