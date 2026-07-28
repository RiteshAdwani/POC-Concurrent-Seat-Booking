import { Header } from '@/components/Header'
import { SeatGrid } from '@/components/SeatGrid'
import { SeatLegend } from '@/components/SeatLegend'
import { SelectionBar } from '@/components/SelectionBar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useSeatLayout } from '@/state/useSeatLayout'

/**
 * @description The /seats route: seat grid + selection controls. Reads the
 * backend-driven seat layout (fetched once by AppLayout, unrelated to the live socket
 * state) via useSeatLayout() and passes it down to SeatGrid/SelectionBar as a prop —
 * both are direct children, so threading it through their own context here would be
 * more machinery than the tree depth needs.
 */
export const SeatSelectionPage = () => {
  const { layout, error } = useSeatLayout()

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">Couldn't load the seat map</p>
        <p className="text-sm text-muted-foreground">Refresh the page to try again.</p>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">Loading seat map…</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col items-center gap-8 py-10">
        <div className="flex flex-col items-center gap-3">
          <Header />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-medium">Concurrent Seat Booking</h1>
            <p className="text-sm text-muted-foreground">
              Select up to {layout.maxSeatsPerBooking} seats
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <SeatGrid layout={layout} />
          <SeatLegend />
          <SelectionBar layout={layout} />
        </div>
      </div>
    </TooltipProvider>
  )
}
