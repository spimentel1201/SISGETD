import { create } from "zustand"
import api from "@/lib/api"

export const useExpedienteStore = create((set) => ({
  expedientes: [],
  expediente: null,
  loading: false,
  total: 0,

  fetchExpedientes: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await api.get("/expedientes", { params })
      // El backend devuelve array directo
      set({ expedientes: Array.isArray(data) ? data : (data.expedientes || []), total: data.total || (Array.isArray(data) ? data.length : 0) })
    } finally {
      set({ loading: false })
    }
  },

  fetchExpediente: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/expedientes/${id}`)
      set({ expediente: data })
      return data
    } finally {
      set({ loading: false })
    }
  },

  createExpediente: async (formData) => {
    const { data } = await api.post("/expedientes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  // El backend usa PUT /:id/estado
  updateExpedienteEstado: async (id, payload) => {
    const { data } = await api.put(`/expedientes/${id}/estado`, payload)
    set((s) => ({
      expedientes: s.expedientes.map((e) => (e.id === id ? data.expediente : e)),
      expediente: data.expediente,
    }))
    return data.expediente
  },

  trackExpediente: async (numero, dni) => {
    const { data } = await api.get(`/expedientes/${numero}/estado`, { params: { dni } })
    return data
  },
}))
