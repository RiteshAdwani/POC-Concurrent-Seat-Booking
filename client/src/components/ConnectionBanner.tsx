import { ErrorMessages } from '@/constants/messages.constants'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Persistent banner shown whenever the socket is disconnected, so a dropped
 * connection is obvious on every route — the Header's status badge only renders on the
 * seat-selection page, and a disconnect happening on /checkout is exactly the moment
 * that matters most.
 */
export const ConnectionBanner = () => {
  const { isConnected } = useSeatSocket()

  if (isConnected) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm text-white">
      <span className="size-1.5 animate-pulse rounded-full bg-white" />
      {ErrorMessages.ConnectionLost}
    </div>
  )
}
