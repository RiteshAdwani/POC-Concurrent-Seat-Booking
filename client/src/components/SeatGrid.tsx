import { useMemo } from "react";
import {
  COLS,
  MAX_SEATS_PER_BOOKING,
  ROWS,
  buildSeatId,
} from "@/constants/seat.constants";
import { ErrorMessages } from "@/constants/messages.constants";
import { Seat } from "@/components/Seat";
import { useSeatSocket } from "@/state/useSeatSocket";
import { SeatStatus } from "@/types/seat";

/**
 * @description Renders the seat grid, combining real seat status, this client's own
 * hold-in-progress state, and its local selection — all read directly from the socket
 * context — to decide each seat's visual state, whether it's toggleable, and its
 * blocked-reason tooltip.
 */
export const SeatGrid = () => {
  const {
    seats,
    selectedSeatIds,
    activeHold,
    isHoldPending,
    isConnected,
    toggleSeat,
  } = useSeatSocket();
  const isAtCap = selectedSeatIds.size >= MAX_SEATS_PER_BOOKING;

  // Blocks new selection for the entire hold->confirm transaction, not just the
  // in-flight request — a confirmed hold still occupies the one allowed slot
  // until it's booked (or fails/expires), matching the backend's own contract.
  const isMidTransaction = isHoldPending || activeHold !== null;
  const myHeldSeatIds = useMemo(
    () => new Set(activeHold?.seatIds ?? []),
    [activeHold],
  );

  return (
    <div className="inline-flex flex-col gap-1.5 rounded-xl border bg-card p-4">
      <div className="flex gap-1.5 pl-9">
        {COLS.map((col) => (
          <div
            key={col}
            className="flex size-9 items-center justify-center text-xs text-muted-foreground"
          >
            {col}
          </div>
        ))}
      </div>
      {ROWS.map((row) => (
        <div key={row} className="flex items-center gap-1.5">
          <div className="flex size-9 items-center justify-center text-xs text-muted-foreground">
            {row}
          </div>
          {COLS.map((col) => {
            const seatId = buildSeatId(row, col);
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
              } else if (status !== SeatStatus.Available) {
                seatUnavailabilityReason = ErrorMessages.SeatUnavailable;
              } else if (isMidTransaction) {
                seatUnavailabilityReason =
                  ErrorMessages.HoldTransactionInProgress;
              } else {
                seatUnavailabilityReason =
                  ErrorMessages.SeatSelectionLimitReached;
              }
            }

            return (
              <Seat
                key={col}
                seatId={seatId}
                isMine={isMine}
                isSelected={isSelected}
                isToggleable={isToggleable}
                isExpiringSoon={isMine && (activeHold?.isExpiringSoon ?? false)}
                seatUnavailabilityReason={seatUnavailabilityReason}
                onToggle={toggleSeat}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
