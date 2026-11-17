import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { AuthUser, LoginDTO, RegisterDTO } from "../types";
import { authService } from "../services/auth";
import { AppApiError } from "../services/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginDTO) => Promise<AuthUser>;
  register: (data: RegisterDTO) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      setError(null);
    } catch {
      // 401 or network error - user is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const expired = () => {
      setUser(null);
      setError(null);
    };
    window.addEventListener("teamflow:unauthorized", expired);
    return () => window.removeEventListener("teamflow:unauthorized", expired);
  }, []);

  const login = async (data: LoginDTO): Promise<AuthUser> => {
    setError(null);
    try {
      const loggedUser = await authService.login(data);
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      const msg = err.message || "Kirishda xatolik yuz berdi";
      setError(msg);
      throw err;
    }
  };

  const register = async (data: RegisterDTO): Promise<AuthUser> => {
    setError(null);
    try {
      const registeredUser = await authService.register(data);
      setUser(registeredUser);
      return registeredUser;
    } catch (err: any) {
      const msg = err.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi";
      setError(msg);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      if (err instanceof AppApiError && err.status === 401) {
        setUser(null);
        setError(null);
        return;
      }
      setError(
        err instanceof Error ? err.message : "Chiqishda xatolik yuz berdi",
      );
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
