import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Printer, Download, FileText } from "lucide-react"

/**
 * Normaliza cualquier forma de archivo_url al path /uploads/<filename>
 * que el proxy de Vite redirige a http://localhost:5000/uploads/<filename>
 *
 * Casos que maneja:
 *  - Ruta absoluta Windows:  C:\Users\...\uploads\archivo.pdf
 *  - Ruta absoluta Linux:    /home/.../uploads/archivo.pdf
 *  - Ruta relativa:          uploads/archivo.pdf
 *  - Ya normalizada:         /uploads/archivo.pdf
 *  - URL absoluta:           http://...
 */
export function buildFileUrl(archivoUrl) {
  if (!archivoUrl) return null
  if (archivoUrl.startsWith("http://") || archivoUrl.startsWith("https://")) return archivoUrl

  // Normalizar separadores a /
  const normalized = archivoUrl.replace(/\\/g, "/")

  // Extraer solo el nombre del archivo (lo que viene después de "uploads/")
  const uploadsIdx = normalized.toLowerCase().lastIndexOf("uploads/")
  if (uploadsIdx !== -1) {
    const filename = normalized.slice(uploadsIdx + "uploads/".length)
    return `/uploads/${filename}`
  }

  // Si no tiene "uploads/" en la ruta, asumir que es solo el nombre
  const filename = normalized.split("/").pop()
  return `/uploads/${filename}`
}

export function getFilename(archivoUrl) {
  if (!archivoUrl) return "documento"
  return archivoUrl.replace(/\\/g, "/").split("/").pop()
}

export default function PdfViewer({ archivoUrl }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(100)

  const fileUrl = buildFileUrl(archivoUrl)
  const filename = getFilename(archivoUrl)
  const isPdf = filename?.toLowerCase().endsWith(".pdf")

  useEffect(() => {
    if (!fileUrl) return
    setLoading(true)
    setError(false)

    // Revocar blob anterior
    let currentBlob = null

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        currentBlob = URL.createObjectURL(blob)
        setBlobUrl(currentBlob)
      })
      .catch((err) => {
        console.error("PdfViewer fetch error:", fileUrl, err.message)
        setError(true)
      })
      .finally(() => setLoading(false))

    return () => {
      if (currentBlob) URL.revokeObjectURL(currentBlob)
    }
  }, [fileUrl])

  if (!archivoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
        <FileText className="h-12 w-12 opacity-30" />
        <p className="text-sm">Sin documento adjunto</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
        <span className="text-xs font-medium truncate max-w-[220px] text-muted-foreground">{filename}</span>
        <div className="flex items-center gap-1">
          {isPdf && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
          </Button>
          {blobUrl && (
            <a href={blobUrl} download={filename}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
          {/* Fallback: abrir directo si blob falla */}
          {error && fileUrl && (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto bg-muted/10 flex items-start justify-center p-2">
        {loading && (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground text-sm">
            Cargando documento...
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground gap-3">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm">No se pudo cargar el documento.</p>
            <p className="text-xs opacity-60">{fileUrl}</p>
            <a href={fileUrl} target="_blank" rel="noreferrer"
              className="text-xs text-primary hover:underline border border-primary/30 rounded px-3 py-1.5">
              Abrir en nueva pestaña
            </a>
          </div>
        )}
        {!loading && !error && blobUrl && (
          isPdf ? (
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full rounded border"
              style={{ height: "100%", minHeight: "500px" }}
            >
              <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                <p className="text-sm">Tu navegador no puede mostrar el PDF inline.</p>
                <a href={blobUrl} download={filename} className="text-xs text-primary hover:underline">
                  Descargar PDF
                </a>
              </div>
            </object>
          ) : (
            <img
              src={blobUrl}
              alt="Documento adjunto"
              style={{ maxWidth: `${zoom}%`, transition: "max-width 0.2s" }}
              className="rounded shadow"
            />
          )
        )}
      </div>
    </div>
  )
}
