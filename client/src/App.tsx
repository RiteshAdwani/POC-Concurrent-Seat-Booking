import { Header } from "@/components/Header";
import { SeatGrid } from "@/components/SeatGrid";
import { SelectionBar } from "@/components/SelectionBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MAX_SEATS_PER_BOOKING } from "@/constants/seat.constants";

/**
 * @description Root component. Composes the tooltip provider, seat grid, and selection bar.
 * SeatGrid/SelectionBar each read what they need straight from useSeatSocket() themselves,
 * so this component doesn't touch the socket context at all. Assumes it's rendered inside
 * SeatSocketProvider.
 */
const App = () => {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col items-center gap-8 py-10">
        <div className="flex flex-col items-center gap-3">
          <Header />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-medium">Concurrent Seat Booking</h1>
            <p className="text-sm text-muted-foreground">
              Select up to {MAX_SEATS_PER_BOOKING} seats
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <SeatGrid />
          <SelectionBar />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
