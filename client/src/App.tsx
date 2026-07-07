import { useState } from "react";
import { SeatGrid } from "@/components/SeatGrid";
import { SelectionBar } from "@/components/SelectionBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MAX_SEATS_PER_BOOKING } from "@/constants/seat";
import type { SeatId } from "@/types/seat";

function App() {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<SeatId>>(
    new Set(),
  );

  const toggleSeat = (seatId: SeatId) => {
    console.log("INside")
    setSelectedSeatIds((prev) => {
      console.log(prev)
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < MAX_SEATS_PER_BOOKING) {
        next.add(seatId);
      }
      console.log(next)
      return next;
    });
  };

  return (
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
  );
}

export default App;
