import { useCallback, useMemo } from "react";
import { ErrorMessages } from "@/constants/messages.constants";
import { ScreenIndicator } from "@/components/ScreenIndicator";
import { Seat } from "@/components/Seat";
import { cn } from "@/lib/utils";
import { useSeatSocket } from "@/state/useSeatSocket";
import { SeatStatus, type SeatId } from "@/types/seat";
import type { SeatLayout } from "@/types/seatLayout";

interface SeatGridProps {
  layout: SeatLayout;
}

/**
 * @description Renders the seat grid, combining real seat status, this client's own
 * hold-in-progress state, and its local selection — all read directly from the socket
 * context — to decide each seat's visual state, whether it's toggleable, and its
 * blocked-reason tooltip. Rows/cols/maxSeatsPerBooking come from the backend-driven
 * layout, passed down from SeatSelectionPage.
 */
export const SeatGrid = ({ layout }: SeatGridProps) => {
  const {
    seats,
    selectedSeatIds,
    activeHold,
    isHoldPending,
    isConnected,
    toggleSeat,
  } = useSeatSocket();
  const { rows, cols, maxSeatsPerBooking } = layout;
  const isAtCap = selectedSeatIds.size >= maxSeatsPerBooking;

  const handleToggle = useCallback(
    (seatId: SeatId) => toggleSeat(seatId, maxSeatsPerBooking),
    [toggleSeat, maxSeatsPerBooking],
  );

  // Blocks new selection for the entire hold->confirm transaction, not just the
  // in-flight request — a confirmed hold still occupies the one allowed slot
  // until it's booked (or fails/expires), matching the backend's own contract.
  const isMidTransaction = isHoldPending || activeHold !== null;
  const myHeldSeatIds = useMemo(
    () => new Set(activeHold?.seatIds ?? []),
    [activeHold],
  );

  // Purely presentational — splits the grid into two blocks like a real theater's
  // center aisle. Derived from cols.length rather than hardcoded, so it stays
  // correct if the backend-driven layout's column count ever changes.
  const aisleStartIndex = Math.floor(cols.length / 2);

  return (
    <div className="inline-flex flex-col items-center gap-4 rounded-xl border bg-card p-4">
      <ScreenIndicator />
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 pl-9">
          {cols.map((col, index) => (
            <div
              key={col}
              className={cn(
                "flex size-9 items-center justify-center text-xs text-muted-foreground",
                index === aisleStartIndex && "ml-3",
              )}
            >
              {col}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-1.5">
            <div className="flex size-9 items-center justify-center text-xs text-muted-foreground">
              {row.label}
            </div>
            {row.seatIds.map((seatId, index) => {
              const status = seats[seatId]?.status ?? SeatStatus.Available;
              const isMine = myHeldSeatIds.has(seatId);
              const isSelected = selectedSeatIds.has(seatId);
              const isToggleable =
                isConnected &&
                !isMine &&
                !isMidTransaction &&
                (isSelected || (status === SeatStatus.Available && !isAtCap));

              let seatUnavailabilityReason: string | null = null;
              if (!isToggleable && !isMine) {
                if (!isConnected) {
                  seatUnavailabilityReason = ErrorMessages.ConnectionLost;
                } else if (status === SeatStatus.Booked) {
                  seatUnavailabilityReason = ErrorMessages.SeatBooked;
                } else if (status === SeatStatus.Held) {
                  seatUnavailabilityReason = ErrorMessages.SeatHeldByOther;
                } else if (isMidTransaction) {
                  seatUnavailabilityReason =
                    ErrorMessages.HoldTransactionInProgress;
                } else {
                  seatUnavailabilityReason =
                    ErrorMessages.SeatSelectionLimitReached(maxSeatsPerBooking);
                }
              }

              return (
                <div key={seatId} className={cn(index === aisleStartIndex && "ml-3")}>
                  <Seat
                    seatId={seatId}
                    status={status}
                    isMine={isMine}
                    isSelected={isSelected}
                    isToggleable={isToggleable}
                    isExpiringSoon={isMine && (activeHold?.isExpiringSoon ?? false)}
                    seatUnavailabilityReason={seatUnavailabilityReason}
                    onToggle={handleToggle}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
