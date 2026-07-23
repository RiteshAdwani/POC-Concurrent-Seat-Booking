import { useEffect } from 'react'
import { Outlet, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { LeaveCheckoutDialog } from '@/components/LeaveCheckoutDialog'
import { navigationRoutes } from '@/constants/navigationRoutes.constants'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Shared layout for every route: syncs the URL with activeHold and guards
 * against leaving /checkout mid-hold.
 */
export const AppLayout = () => {
  const { activeHold, releaseHeldSeats } = useSeatSocket()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * @description Blocks navigation away from /checkout while a hold is active —
   * including the browser's back/forward buttons. LeaveCheckoutDialog below confirms:
   * accepting releases the hold and proceeds, cancelling resets it.
   *
   * Must be declared before the sync effect below — its own useEffect re-registers this
   * predicate with the router, and effects run in hook order. If the sync effect ran
   * first, its navigate() right after a confirm would still see last render's (stale,
   * non-null) activeHold and wrongly trigger the block.
   */
  const blocker = useBlocker(
    ({ currentLocation }) =>
      currentLocation.pathname === navigationRoutes.Checkout && activeHold !== null,
  )

  /**
   * @description Keeps the URL in sync with activeHold: forwards to /checkout once a
   * hold exists, back to /seats once it doesn't (release, expiry, or confirm) —
   * also self-heals a stray direct visit to /checkout with no active hold.
   */
  useEffect(() => {
    if (activeHold && location.pathname !== navigationRoutes.Checkout) {
      navigate(navigationRoutes.Checkout)
    }
    if (!activeHold && location.pathname !== navigationRoutes.Seats) {
      navigate(navigationRoutes.Seats)
    }
  }, [activeHold, location.pathname, navigate])

  /**
   * @description Releases the held seats and lets the blocked navigation proceed.
   */
  const handleConfirmLeave = () => {
    if (activeHold) {
      releaseHeldSeats(activeHold.seatIds)
    }
    blocker.proceed?.()
  }

  return (
    <>
      <Outlet />
      <LeaveCheckoutDialog
        open={blocker.state === 'blocked'}
        onConfirm={handleConfirmLeave}
        onCancel={() => blocker.reset?.()}
      />
    </>
  )
}
