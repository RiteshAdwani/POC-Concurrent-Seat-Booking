import { useCallback, useMemo } from "react";
import { ScreenIndicator } from "@/components/ScreenIndicator";
import { Seat } from "@/components/Seat";
import { cn } from "@/lib/utils";
import { getSeatUnavailabilityReason } from "@/lib/seatAvailability";
import { formatPrice } from "@/lib/seatPricing";
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
 * blocked-reason tooltip. Categories/cols/maxSeatsPerBooking come from the
 * backend-driven layout, passed down from SeatSelectionPage — categories are mapped
 * over directly (each with its own price header and rows), no client-side regrouping.
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
  const { categories, cols, maxSeatsPerBooking } = layout;
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

  return (
    <div className="inline-flex flex-col items-center gap-4 rounded-xl border bg-card p-4">
      <ScreenIndicator />
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 pl-9">
          {cols.map((col) => (
            <div
              key={col}
              className="flex size-9 items-center justify-center text-xs text-muted-foreground"
            >
              {col}
            </div>
          ))}
        </div>
        {categories.map((category, categoryIndex) => (
          <div
            key={category.name}
            className={cn(categoryIndex > 0 && "mt-3 border-t pt-3")}
          >
            <p className="mb-1.5 text-center text-xs font-medium tracking-wide text-muted-foreground">
              {formatPrice(category.price)} · {category.name.toUpperCase()}
            </p>
            {category.rows.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <div className="flex size-9 items-center justify-center text-xs text-muted-foreground">
                  {row.label}
                </div>
                {row.seatIds.map((seatId, index) => {
                  // No seat exists at this position at all (an aisle/walkway within
                  // the row) — render a same-sized spacer so columns still line up,
                  // but nothing interactive and nothing to look up in `seats`.
                  if (seatId === null) {
                    return <div key={`gap-${row.label}-${index}`} className="size-9" />;
                  }

                  const status = seats[seatId]?.status ?? SeatStatus.Available;
                  const isMine = myHeldSeatIds.has(seatId);
                  const isSelected = selectedSeatIds.has(seatId);
                  const isToggleable =
                    isConnected &&
                    !isMine &&
                    !isMidTransaction &&
                    (isSelected || (status === SeatStatus.Available && !isAtCap));

                  const seatUnavailabilityReason =
                    !isToggleable && !isMine
                      ? getSeatUnavailabilityReason(
                          status,
                          isConnected,
                          isMidTransaction,
                          maxSeatsPerBooking,
                        )
                      : null;

                  return (
                    <div key={seatId}>
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
        ))}
      </div>
    </div>
  );
};
