import { useEffect, useState } from 'react'
import { Outlet, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { fetchSeatLayout } from '@/api/layout'
import { ConnectionBanner } from '@/components/ConnectionBanner'
import { LeaveCheckoutDialog } from '@/components/LeaveCheckoutDialog'
import { RecoveryDemoControls } from '@/components/RecoveryDemoControls'
import { navigationRoutes } from '@/constants/navigationRoutes.constants'
import { SeatLayoutContext } from '@/state/seatLayoutContext'
import { useSeatSocket } from '@/state/useSeatSocket'
import type { SeatLayout } from '@/types/seatLayout'

/**
 * @description Shared layout for every route: syncs the URL with activeHold, guards
 * against leaving /checkout mid-hold, and fetches the seat layout once for both pages
 * to read via context — this is the single top-level route element, so it never
 * unmounts while the app is open.
 */
export const AppLayout = () => {
  const { activeHold, isReleasePending, releaseHeldSeats } = useSeatSocket()
  const navigate = useNavigate()
  const location = useLocation()

  const [layout, setLayout] = useState<SeatLayout | null>(null)
  const [layoutError, setLayoutError] = useState<unknown | null>(null)

  /**
   * @description Fetches the static seat layout once, on mount — AppLayout never
   * unmounts while the app is open, so this never re-runs on navigation between
   * /seats and /checkout. Provided to both pages via SeatLayoutContext below.
   */
  useEffect(() => {
    const loadLayout = async () => {
      try {
        setLayout(await fetchSeatLayout())
      } catch (err) {
        setLayoutError(err)
      }
    }

    loadLayout()
  }, [])

  /**
   * @description Blocks navigation away from /checkout while a hold is active —
   * including the browser's back/forward buttons. LeaveCheckoutDialog below confirms:
   * accepting releases the hold and proceeds, cancelling resets it. Also stands down
   * once a release is already in flight, so it can't re-block the very navigation that
   * confirming "leave" just kicked off.
   *
   * Must be declared before the sync effect below — its own useEffect re-registers this
   * predicate with the router, and effects run in hook order. If the sync effect ran
   * first, its navigate() right after a confirm would still see last render's (stale,
   * non-null) activeHold and wrongly trigger the block.
   */
  const blocker = useBlocker(
    ({ currentLocation }) =>
      currentLocation.pathname === navigationRoutes.Checkout &&
      activeHold !== null &&
      !isReleasePending,
  )

  /**
   * @description Keeps the URL in sync with activeHold: forwards to /checkout once a
   * hold exists, back to /seats once it doesn't (release, expiry, or confirm) — also
   * self-heals a stray direct visit to /checkout with no active hold. Skips the
   * forward-to-checkout branch while a release is in flight — releaseHeldSeats() is
   * async, so activeHold is still non-null for the brief window between confirming
   * "leave checkout" and the server's response; without this guard, that stale
   * activeHold would yank the user straight back to /checkout mid-leave.
   */
  useEffect(() => {
    if (activeHold && !isReleasePending && location.pathname !== navigationRoutes.Checkout) {
      navigate(navigationRoutes.Checkout)
    }
    if (!activeHold && location.pathname !== navigationRoutes.Seats) {
      navigate(navigationRoutes.Seats)
    }
  }, [activeHold, isReleasePending, location.pathname, navigate])

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
    <SeatLayoutContext.Provider value={{ layout, error: layoutError }}>
      <ConnectionBanner />
      <Outlet />
      <RecoveryDemoControls />
      <LeaveCheckoutDialog
        open={blocker.state === 'blocked'}
        onConfirm={handleConfirmLeave}
        onCancel={() => blocker.reset?.()}
      />
    </SeatLayoutContext.Provider>
  )
}
