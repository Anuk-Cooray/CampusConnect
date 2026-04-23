import { createContext, useContext, useState } from "react";

// 1. Define type
type AuthContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

// 2. Give type to context
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Handle null safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};