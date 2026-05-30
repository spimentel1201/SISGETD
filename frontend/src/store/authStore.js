import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/api"

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password })
        localStorage.setItem("token", data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data.user
      },

      register: async (payload) => {
        const { data } = await api.post("/auth/register", payload)
        localStorage.setItem("token", data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data.user
      },

      logout: () => {
        localStorage.removeItem("token")
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: "auth-storage", partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)
