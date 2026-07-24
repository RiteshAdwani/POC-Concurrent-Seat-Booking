import { Armchair } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SeatStatus, type SeatId } from "@/types/seat";

interface SeatProps {
  seatId: SeatId;
  status: SeatStatus;
  isMine: boolean;
  isSelected: boolean;
  isToggleable: boolean;
  isExpiringSoon: boolean;
  seatUnavailabilityReason: string | null;
  onToggle: (seatId: SeatId) => void;
}

/**
 * @description Renders one seat glyph, colored by state: available, selected, mine
 * (+ expiring-soon), held by someone else, or booked. seatUnavailabilityReason is
 * computed by the caller and just shown here as a tooltip.
 *
 * Memoized so unrelated context changes (e.g. a presence-count tick) don't re-render
 * all ~100 seats — safe since every prop here is a primitive or a stable callback.
 */
export const Seat = memo(function Seat({
  seatId,
  status,
  isMine,
  isSelected,
  isToggleable,
  isExpiringSoon,
  seatUnavailabilityReason,
  onToggle,
}: SeatProps) {
  /**
   * @description No-ops if the seat isn't toggleable; otherwise reports the click up.
   */
  const handleSeatButtonClick = () => {
    if (isToggleable) {
      onToggle(seatId);
    }
  };

  // Only dim available-but-blocked seats (at cap, mid-transaction, disconnected) —
  // held-by-other/booked already have their own unmistakable color (see index.css's
  // .seat-* classes below; isMine never actually renders here in practice, since
  // holding navigates straight to /checkout, but is kept for correctness).
  const isDimmed = !isToggleable && !isMine && status === SeatStatus.Available;

  const button = (
    <Button
      variant="ghost"
      size="sm"
      aria-disabled={!isToggleable}
      aria-label={seatId}
      className={cn(
        "size-9 rounded-t-lg rounded-b-sm border p-0",
        isMine && isExpiringSoon && "seat-mine-expiring",
        isMine && !isExpiringSoon && "seat-mine",
        !isMine && isSelected && "seat-selected",
        !isMine && !isSelected && status === SeatStatus.Booked && "seat-booked",
        !isMine && !isSelected && status === SeatStatus.Held && "seat-held-other",
        !isMine && !isSelected && status === SeatStatus.Available && "seat-available",
        isDimmed && "cursor-not-allowed opacity-60",
      )}
      onClick={handleSeatButtonClick}
    >
      <Armchair className="size-4" />
    </Button>
  );

  // No Tooltip wrapper at all when there's no reason to show one
  if (!seatUnavailabilityReason) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{seatUnavailabilityReason}</TooltipContent>
    </Tooltip>
  );
});
