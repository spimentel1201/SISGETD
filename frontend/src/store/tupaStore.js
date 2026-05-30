import { create } from "zustand"
import api from "@/lib/api"

export const useTupaStore = create((set) => ({
  tupas: [],
  loading: false,

  fetchTupas: async (soloActivos = false) => {
    set({ loading: true })
    try {
      // El endpoint del backend es /api/tupa
      const { data } = await api.get("/tupa", { params: { activos: soloActivos ? "true" : "false" } })
      set({ tupas: data })
    } finally {
      set({ loading: false })
    }
  },

  createTupa: async (payload) => {
    const { data } = await api.post("/tupa", payload)
    set((s) => ({ tupas: [...s.tupas, data.tupa] }))
    return data.tupa
  },

  updateTupa: async (id, payload) => {
    const { data } = await api.put(`/tupa/${id}`, payload)
    set((s) => ({ tupas: s.tupas.map((t) => (t.id === id ? data.tupa : t)) }))
    return data.tupa
  },

  deleteTupa: async (id) => {
    await api.delete(`/tupa/${id}`)
    set((s) => ({ tupas: s.tupas.map((t) => (t.id === id ? { ...t, es_activo: false } : t)) }))
  },
}))
