import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type LeaveCheckoutDialogProps = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * @description Confirmation prompt shown when the user tries to leave /checkout with an
 * active hold — via the browser's real back/forward buttons or the in-page Back button.
 * Leaving forfeits the held seats, so this stops that from happening on a single
 * accidental back-tap.
 */
export const LeaveCheckoutDialog = ({ open, onConfirm, onCancel }: LeaveCheckoutDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave checkout?</AlertDialogTitle>
          <AlertDialogDescription>
            Going back will release your held seats and they'll become available to
            everyone else. You'll need to select seats again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Stay on this page</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Release seats</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
