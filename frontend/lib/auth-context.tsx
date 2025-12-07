"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "farmer" | "buyer" | "admin" | "guest";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("harvestledger_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: "1",
        name: "Demo User",
        email,
        role: "farmer",
      };
      
      setUser(mockUser);
      localStorage.setItem("harvestledger_user", JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("harvestledger_user");
  };

  const connectWallet = async () => {
    // Simulate wallet connection
    if (user) {
      const updatedUser = {
        ...user,
        walletAddress: "0x" + Math.random().toString(16).slice(2, 42),
      };
      setUser(updatedUser);
      localStorage.setItem("harvestledger_user", JSON.stringify(updatedUser));
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("harvestledger_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        connectWallet,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
