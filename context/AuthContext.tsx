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
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load token from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      console.log('📱 Token loaded from localStorage:', savedToken.substring(0, 20) + '...');
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const tokenToUse = token || localStorage.getItem('auth_token');
      
      if (!tokenToUse) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log('✅ Auth check passed, user:', data.user.email);
      } else {
        console.log('❌ Auth check failed, clearing token');
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  // const login = async (email: string, password: string) => {
  //   console.log('🔐 Login attempt for:', email);
    
  //   const response = await fetch('/api/auth/login', {
  //     method: 'POST',
  //     headers: { 
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || 'Login failed');
  //   }

  //   const data = await response.json();
  //   console.log('📦 Login API response:', data);
    
  //   // ⭐⭐⭐ CRITICAL: Save token from API response ⭐⭐⭐
  //   if (data.token) {
  //     setToken(data.token);
  //     localStorage.setItem('auth_token', data.token);
  //     console.log('✅ Token saved to localStorage:', data.token.substring(0, 30) + '...');
  //   } else {
  //     console.error('❌ FATAL: No token in API response:', data);
  //     throw new Error('Authentication failed - no token received from server');
  //   }
    
  //   // ⭐⭐⭐ CRITICAL: Update user state ⭐⭐⭐
  //   if (data.user) {
  //     setUser(data.user);
  //     console.log('✅ User state updated:', data.user.email);
  //   }
    
  //   // ⭐⭐⭐ Redirect happens here, NOT in LoginPage ⭐⭐⭐
  //   console.log('🚀 Redirecting to /dashboard...');
  //   router.push('/dashboard');
  //   router.refresh(); // Force refresh to update server components
  // };
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
  
  // ⭐⭐⭐ ADD THIS ONE LINE ⭐⭐⭐
  localStorage.setItem('auth_token', data.token);
  // ⭐⭐⭐ THAT'S IT! ⭐⭐⭐
  
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
  
  // ⭐⭐⭐ ADD THIS - Save token from signup response ⭐⭐⭐
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  // ⭐⭐⭐ END OF ADDITION ⭐⭐⭐
  
  setUser(data.user);
  router.push('/dashboard');
};
  const logout = async () => {
    console.log('👋 Logging out...');
    
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('Logout API error (continuing anyway):', error);
    }
    
    // Clear everything locally
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    console.log('✅ Cleared all auth data');
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        checkAuth,
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