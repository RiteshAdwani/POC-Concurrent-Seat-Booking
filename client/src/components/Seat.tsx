import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SeatId } from "@/types/seat";

interface SeatProps {
  seatId: SeatId;
  isMine: boolean;
  isSelected: boolean;
  isToggleable: boolean;
  isExpiringSoon: boolean;
  seatUnavailabilityReason: string | null;
  onToggle: (seatId: SeatId) => void;
}

/**
 * @description Renders a single seat button, deriving its visual state
 * (default/selected/held-mine/dimmed) from whether this client holds it, is
 * selecting it, and whether it's currently toggleable. seatUnavailabilityReason
 * (if any) is computed by the caller, which has the full context to explain it,
 * and is only shown as a tooltip here.
 */
export const Seat = ({
  seatId,
  isMine,
  isSelected,
  isToggleable,
  isExpiringSoon,
  seatUnavailabilityReason,
  onToggle,
}: SeatProps) => {
  /**
   * @description No-ops when the seat isn't toggleable (cap reached, held-mine,
   * mid-transaction, or already held/booked by someone else); otherwise reports
   * the click up to the parent's toggle handler.
   */
  const handleSeatButtonClick = () => {
    if (isToggleable) {
      onToggle(seatId);
    }
  };

  const buttonVariant = isSelected ? "default" : "outline";

  // Held-mine seats aren't selectable either, but they shouldn't look "dimmed
  // and unavailable" like a stranger's held/booked seat — it's an active state,
  // called out with a bold, unmistakable color rather than a subtle variant swap.
  const isDimmed = !isToggleable && !isMine;

  const button = (
    <Button
      variant={buttonVariant}
      size="sm"
      aria-disabled={!isToggleable}
      className={cn(
        "size-9 p-0 text-xs",
        isMine &&
          "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600",
        isMine &&
          isExpiringSoon &&
          "border-amber-500 bg-amber-500 hover:bg-amber-500",
        isDimmed && "opacity-40",
      )}
      onClick={handleSeatButtonClick}
    >
      {seatId}
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
};
