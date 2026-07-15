import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Shows the live connection status and connected-client count, both driven
 * entirely by the socket's own connect/disconnect events and the server's presence:update
 * broadcast — nothing here is inferred, it just renders what SeatSocketProvider already tracks.
 */
export const Header = () => {
  const { isConnected, presenceCount } = useSeatSocket()

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={cn(
          'gap-1.5',
          isConnected
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-red-700 dark:text-red-400',
        )}
      >
        <span
          className={cn('size-1.5 rounded-full', isConnected ? 'bg-emerald-500' : 'bg-red-500')}
        />
        {isConnected ? 'Live' : 'Disconnected'}
      </Badge>
      <Badge variant="secondary">
        {presenceCount} {presenceCount === 1 ? 'user' : 'users'} online
      </Badge>
    </div>
  )
}
