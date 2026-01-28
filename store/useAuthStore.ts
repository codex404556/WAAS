import { create } from "zustand";
import { persist } from "zustand/middleware";
import { payloadFetch } from "@/lib/payload-client";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "deliveryman";
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  checkIsAdmin: () => boolean;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        try {
          const response = await payloadFetch<{
            user?: User;
          }>("/api/users/login", {
            method: "POST",
            body: credentials,
          });

          if (response?.user) {
            set({
              user: response.user,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },

      register: async (userData) => {
        try {
          await payloadFetch("/api/users", {
            method: "POST",
            body: userData,
          });

          // if (response.data.token) {
          //   set({
          //     user: response.data,
          //     token: response.data.token,
          //     isAuthenticated: true
          //   });
          // }
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        }
      },

      logout: () => {
        payloadFetch("/api/users/logout", { method: "POST" }).catch(
          (error) => {
            console.error("Logout error:", error);
          }
        );
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      checkIsAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
