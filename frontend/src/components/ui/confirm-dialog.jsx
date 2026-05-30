import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./dialog"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"

/**
 * Modal de confirmación reutilizable.
 * Props:
 *   open, onClose, onConfirm, title, description, confirmLabel, variant ("destructive"|"default")
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "¿Confirmar acción?",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Confirmar",
  variant = "destructive",
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
              <AlertTriangle className={`h-5 w-5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          <DialogDescription className="pl-12">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
