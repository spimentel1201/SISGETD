import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import "./index.css"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: { fontSize: "13px", borderRadius: "8px", maxWidth: "360px" },
        success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
      }}
    />
  </StrictMode>
)
