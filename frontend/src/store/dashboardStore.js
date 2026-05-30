import { create } from "zustand"
import api from "@/lib/api"

export const useDashboardStore = create((set) => ({
  kpis: null,
  criticos: [],
  loading: false,

  fetchKpis: async (params = {}) => {
    set({ loading: true })
    try {
      const [kpisRes, criticosRes] = await Promise.all([
        api.get("/dashboard/kpis", { params }),
        api.get("/dashboard/expedientes-criticos"),
      ])
      set({ kpis: kpisRes.data, criticos: criticosRes.data })
    } catch {
      // Si falla (ej. sin auth) dejamos los datos vacíos
    } finally {
      set({ loading: false })
    }
  },
}))
