import { COLS, MAX_SEATS_PER_BOOKING, ROWS, buildSeatId } from '@/constants/seat.constants'
import { Seat } from '@/components/Seat'
import { useSeatSocket } from '@/state/useSeatSocket'
import { SeatStatus, type SeatId } from '@/types/seat'

interface SeatGridProps {
  selectedSeatIds: Set<SeatId>
  onToggleSeat: (seatId: SeatId) => void
}

/**
 * @description Renders the 10x10 seat grid, combining real seat status from the socket context
 * with the caller's local selection state to decide each seat's selectability.
 */
export const SeatGrid = ({ selectedSeatIds, onToggleSeat }: SeatGridProps) => {
  const { seats } = useSeatSocket()
  const isAtCap = selectedSeatIds.size >= MAX_SEATS_PER_BOOKING

  return (
    <div className="inline-flex flex-col gap-1.5 rounded-xl border bg-card p-4">
      <div className="flex gap-1.5 pl-9">
        {COLS.map((col) => (
          <div key={col} className="flex size-9 items-center justify-center text-xs text-muted-foreground">
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
            const seatId = buildSeatId(row, col)
            const status = seats[seatId]?.status ?? SeatStatus.Available
            const isSelected = selectedSeatIds.has(seatId)
            const isSelectable = isSelected || (status === SeatStatus.Available && !isAtCap)
            return (
              <Seat
                key={col}
                seatId={seatId}
                status={status}
                isSelected={isSelected}
                isSelectable={isSelectable}
                onToggle={onToggleSeat}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
