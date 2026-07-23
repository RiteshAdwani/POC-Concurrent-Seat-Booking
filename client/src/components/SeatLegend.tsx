import { LEGEND_ITEMS } from '@/constants/seatLegend.constants'
import { cn } from '@/lib/utils'

/**
 * @description Explains what each seat color means — there's no other way to learn
 * this today besides hovering an unavailable seat's tooltip.
 */
export const SeatLegend = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {LEGEND_ITEMS.map(({ label, swatchClassName }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={cn('size-3 rounded-sm border', swatchClassName)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
