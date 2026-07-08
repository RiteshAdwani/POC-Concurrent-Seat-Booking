import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "@/constants/messages.constants";
import { SeatStatus, type SeatId } from "@/types/seat";

interface SeatProps {
  seatId: SeatId;
  status: SeatStatus;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: (seatId: SeatId) => void;
}

/**
 * @description Renders a single seat button, deriving its visual state (default/selected/dimmed)
 * and tooltip reason from its server status and current selectability.
 */
export const Seat = ({
  seatId,
  status,
  isSelected,
  isSelectable,
  onToggle,
}: SeatProps) => {
  /**
   * @description No-ops when the seat isn't selectable (cap reached or already
   * held/booked); otherwise reports the click up to the parent's toggle handler.
   */
  const handleSeatButtonClick = () => {
    if (isSelectable) {
      onToggle(seatId);
    }
  };

  const unavailableReason =
    status !== SeatStatus.Available
      ? ErrorMessages.SeatUnavailable
      : ErrorMessages.SeatSelectionLimitReached;

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
      {!isSelectable && <TooltipContent>{unavailableReason}</TooltipContent>}
    </Tooltip>
  );
}
