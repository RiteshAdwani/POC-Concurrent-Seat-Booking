import { useEffect } from 'react'
import { Outlet, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { LeaveCheckoutDialog } from '@/components/LeaveCheckoutDialog'
import { navigationRoutes } from '@/constants/navigationRoutes.constants'
import { useSeatSocket } from '@/state/useSeatSocket'

/**
 * @description Shared layout for every route. Keeps the URL and activeHold in sync, and
 * guards against leaving /checkout while a hold is still active.
 */
export const AppLayout = () => {
  const { activeHold, releaseHeldSeats } = useSeatSocket()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * @description Forces the URL to always match activeHold: forwards to /checkout the
   * instant a hold exists, and back to /seats the instant it doesn't (release,
   * hard-expiry, or a successful confirm) — including self-healing a direct/refreshed
   * visit to /checkout with no active hold.
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
   * @description Pauses any navigation away from /checkout while a hold is active —
   * including the browser's real back/forward buttons, since data-router blockers cover
   * POP navigations, not just navigate() calls. Paired with LeaveCheckoutDialog below:
   * confirming releases the hold and lets the navigation proceed, cancelling resets it.
   */
  const blocker = useBlocker(
    ({ currentLocation }) =>
      currentLocation.pathname === navigationRoutes.Checkout && activeHold !== null,
  )

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
