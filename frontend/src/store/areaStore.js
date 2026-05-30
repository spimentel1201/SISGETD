import { create } from "zustand"
import api from "@/lib/api"

export const useAreaStore = create((set, get) => ({
  areas: [],
  loading: false,

  fetchAreas: async (soloActivas = false) => {
    set({ loading: true })
    try {
      const { data } = await api.get("/areas", { params: { activas: soloActivas ? "true" : "false" } })
      set({ areas: data })
    } finally {
      set({ loading: false })
    }
  },

  createArea: async (payload) => {
    const { data } = await api.post("/areas", payload)
    set((s) => ({ areas: [...s.areas, data.area] }))
    return data.area
  },

  updateArea: async (id, payload) => {
    const { data } = await api.put(`/areas/${id}`, payload)
    set((s) => ({ areas: s.areas.map((a) => (a.id === id ? data.area : a)) }))
    return data.area
  },

  deleteArea: async (id) => {
    await api.delete(`/areas/${id}`)
    set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, es_activo: false } : a)) }))
  },
}))
