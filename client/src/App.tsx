import { useState } from "react";
import { SeatGrid } from "@/components/SeatGrid";
import { SelectionBar } from "@/components/SelectionBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MAX_SEATS_PER_BOOKING } from "@/constants/seat.constants";
import { SeatSocketProvider } from "@/state/SeatSocketProvider";
import type { SeatId } from "@/types/seat";

/**
 * @description Root component. Owns local seat-selection state and composes the socket
 * provider, tooltip provider, seat grid, and selection counter.
 */
const App = () => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<SeatId>>(
    new Set(),
  );

  /**
   * @description Toggles a seat in/out of the local selection set, enforcing the
   * max-seats-per-booking cap on new additions (deselecting is always allowed).
   */
  const toggleSeat = (seatId: SeatId) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < MAX_SEATS_PER_BOOKING) {
        next.add(seatId);
      }
      return next;
    });
  };

  return (
    <SeatSocketProvider>
      <TooltipProvider>
        <div className="flex min-h-svh flex-col items-center gap-8 py-10">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-medium">Concurrent Seat Booking</h1>
            <p className="text-sm text-muted-foreground">
              Select up to {MAX_SEATS_PER_BOOKING} seats
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <SeatGrid selectedSeatIds={selectedSeatIds} onToggleSeat={toggleSeat} />
            <SelectionBar selectedCount={selectedSeatIds.size} />
          </div>
        </div>
      </TooltipProvider>
    </SeatSocketProvider>
  );
}

export default App;
