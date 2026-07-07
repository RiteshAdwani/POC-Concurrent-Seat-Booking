import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MAX_SEATS_PER_BOOKING } from "@/constants/seat";
import type { SeatId } from "@/types/seat";

interface SeatProps {
  seatId: SeatId;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: (seatId: SeatId) => void;
}

export function Seat({
  seatId,
  isSelected,
  isSelectable,
  onToggle,
}: SeatProps) {
  const handleSeatButtonClick = () => {
    if (isSelectable) {
      onToggle(seatId);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          aria-disabled={!isSelectable}
          className={cn("size-9 p-0 text-xs", !isSelectable && "opacity-40")}
          onClick={handleSeatButtonClick}
        >
          {seatId}
        </Button>
      </TooltipTrigger>
      {!isSelectable && (
        <TooltipContent>Max {MAX_SEATS_PER_BOOKING} seats per booking</TooltipContent>
      )}
    </Tooltip>
  );
}
