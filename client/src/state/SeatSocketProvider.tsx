import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { toast } from "sonner";
import { socket } from "@/socket/socket";
import {
  ClientEvent,
  ServerEvent,
  type PresenceEvent,
  type SeatConfirmFailedEvent,
  type SeatConfirmSuccessEvent,
  type SeatHoldConfirmedEvent,
  type SeatHoldExpiringSoonEvent,
  type SeatHoldRejectedEvent,
  type SeatReleaseFailedEvent,
  type SeatReleaseSuccessEvent,
  type SeatsStateChangedEvent,
} from "@/types/socketEvents";
import type { SeatId, SeatsSnapshot } from "@/types/seat";
import {
  initialSeatSocketState,
  seatSocketReducer,
  SeatSocketActionType,
} from "@/state/seatReducer";
import { SeatSocketContext, type SeatSocketContextValue } from "@/state/seatSocketContext";

/**
 * @description Owns the seat-state reducer and subscribes to seat:full:sync / seats:state:changed /
 * seat:hold:confirmed / seat:hold:rejected / seat:hold:expiring-soon / seat:confirm:success /
 * seat:confirm:failed / seat:release:success / seat:release:failed / presence:update / connect /
 * disconnect for the lifetime of the app, exposing the resulting state plus
 * toggleSeat()/holdSeats()/confirmBooking()/releaseHeldSeats() actions to descendants via
 * SeatSocketContext.
 */
export const SeatSocketProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    seatSocketReducer,
    initialSeatSocketState,
  );

  useEffect(() => {
    /**
     * @description Replaces the entire seats map with the fresh snapshot the server
     * sends on every connect/reconnect.
     */
    const handleFullSync = (snapshot: SeatsSnapshot) => {
      dispatch({ type: SeatSocketActionType.FullSync, snapshot });
    };

    /**
     * @description Patches only the seatIds included in the broadcast, leaving the
     * rest of the seats map untouched.
     */
    const handleStateChanged = (event: SeatsStateChangedEvent) => {
      dispatch({ type: SeatSocketActionType.StateChanged, seats: event.seats });
    };

    /**
     * @description Records this client's own confirmed hold and surfaces a success toast.
     */
    const handleHoldConfirmed = (event: SeatHoldConfirmedEvent) => {
      dispatch({
        type: SeatSocketActionType.HoldConfirmed,
        hold: {
          seatIds: event.seatIds,
          expiresAt: event.expiresAt,
          softExpiresAt: event.softExpiresAt,
        },
      });
      toast.success(event.message);
    };

    /**
     * @description Clears the pending flag and surfaces an error toast — nothing was
     * ever held, so there's no local state to roll back.
     */
    const handleHoldRejected = (event: SeatHoldRejectedEvent) => {
      dispatch({ type: SeatSocketActionType.HoldRejected });
      toast.error(event.message);
    };

    /**
     * @description Flags the active hold as expiring soon (amber countdown) and
     * surfaces a warning toast — the hold itself is still active, this is a heads-up.
     */
    const handleHoldExpiringSoon = (event: SeatHoldExpiringSoonEvent) => {
      dispatch({ type: SeatSocketActionType.HoldExpiringSoon });
      toast.warning(event.message);
    };

    /**
     * @description Ends the transaction on this client — the booking succeeded, so the
     * hold and the selection it came from are both done being tracked locally. The seats
     * themselves flip to Booked via the accompanying seats:state:changed broadcast, not here.
     */
    const handleConfirmSuccess = (event: SeatConfirmSuccessEvent) => {
      dispatch({ type: SeatSocketActionType.ConfirmSucceeded });
      toast.success(event.message);
    };

    /**
     * @description Clears the pending flag and surfaces an error toast. The hold itself
     * stays active — the backend's own contract keeps a failed confirm's seats held.
     */
    const handleConfirmFailed = (event: SeatConfirmFailedEvent) => {
      dispatch({ type: SeatSocketActionType.ConfirmFailed });
      toast.error(event.message);
    };

    /**
     * @description Ends the transaction on this client — the hold was voluntarily
     * released, so both it and the selection that led to it are done being tracked
     * locally. The seats themselves flip back to Available via the accompanying
     * seats:state:changed broadcast, not here.
     */
    const handleReleaseSuccess = (event: SeatReleaseSuccessEvent) => {
      dispatch({ type: SeatSocketActionType.ReleaseSucceeded });
      toast.success(event.message);
    };

    /**
     * @description Clears the pending flag and surfaces an error toast. If this failed
     * because the hold already hard-expired, StateChanged's own reconciliation will
     * have already cleared activeHold independently.
     */
    const handleReleaseFailed = (event: SeatReleaseFailedEvent) => {
      dispatch({ type: SeatSocketActionType.ReleaseFailed });
      toast.error(event.message);
    };

    /**
     * @description Flags the socket as connected. seat:full:sync (handled separately)
     * is what actually repopulates seat/hold state — this only drives the UI's
     * connected/disconnected indicator and interaction gate.
     */
    const handleConnect = () => {
      dispatch({ type: SeatSocketActionType.Connected });
    };

    /**
     * @description Flags the socket as disconnected, gating seat interaction until a
     * reconnect brings a fresh seat:full:sync.
     */
    const handleDisconnect = () => {
      dispatch({ type: SeatSocketActionType.Disconnected });
    };

    /**
     * @description Updates the live count of connected clients shown in the header.
     */
    const handlePresenceUpdate = (event: PresenceEvent) => {
      dispatch({ type: SeatSocketActionType.ActiveUsersCountUpdated, count: event.count });
    };

    socket.on(ServerEvent.SeatFullSync, handleFullSync);
    socket.on(ServerEvent.SeatsStateChanged, handleStateChanged);
    socket.on(ServerEvent.SeatHoldConfirmed, handleHoldConfirmed);
    socket.on(ServerEvent.SeatHoldRejected, handleHoldRejected);
    socket.on(ServerEvent.SeatHoldExpiringSoon, handleHoldExpiringSoon);
    socket.on(ServerEvent.SeatConfirmSuccess, handleConfirmSuccess);
    socket.on(ServerEvent.SeatConfirmFailed, handleConfirmFailed);
    socket.on(ServerEvent.SeatReleaseSuccess, handleReleaseSuccess);
    socket.on(ServerEvent.SeatReleaseFailed, handleReleaseFailed);
    socket.on(ServerEvent.PresenceUpdate, handlePresenceUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off(ServerEvent.SeatFullSync, handleFullSync);
      socket.off(ServerEvent.SeatsStateChanged, handleStateChanged);
      socket.off(ServerEvent.SeatHoldConfirmed, handleHoldConfirmed);
      socket.off(ServerEvent.SeatHoldRejected, handleHoldRejected);
      socket.off(ServerEvent.SeatHoldExpiringSoon, handleHoldExpiringSoon);
      socket.off(ServerEvent.SeatConfirmSuccess, handleConfirmSuccess);
      socket.off(ServerEvent.SeatConfirmFailed, handleConfirmFailed);
      socket.off(ServerEvent.SeatReleaseSuccess, handleReleaseSuccess);
      socket.off(ServerEvent.SeatReleaseFailed, handleReleaseFailed);
      socket.off(ServerEvent.PresenceUpdate, handlePresenceUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  /**
   * @description Toggles a seat in/out of local selection, enforcing the
   * max-seats-per-booking cap on new additions (deselecting is always allowed).
   */
  const toggleSeat = useCallback((seatId: SeatId, maxSeatsPerBooking: number) => {
    dispatch({ type: SeatSocketActionType.SeatToggled, seatId, maxSeatsPerBooking });
  }, []);

  /**
   * @description Emits seat:hold for the given seatIds and marks the request as pending
   * until the server responds with seat:hold:confirmed or seat:hold:rejected.
   */
  const holdSeats = useCallback((seatIds: SeatId[]) => {
    dispatch({ type: SeatSocketActionType.HoldRequested });
    socket.emit(ClientEvent.SeatHold, { seatIds });
  }, []);

  /**
   * @description Emits seat:confirm for the given seatIds and marks the request as pending
   * until the server responds with seat:confirm:success or seat:confirm:failed.
   */
  const confirmBooking = useCallback((seatIds: SeatId[]) => {
    dispatch({ type: SeatSocketActionType.ConfirmRequested });
    socket.emit(ClientEvent.SeatConfirm, { seatIds });
  }, []);

  /**
   * @description Emits seat:release for the given seatIds and marks the request as pending
   * until the server responds with seat:release:success or seat:release:failed.
   */
  const releaseHeldSeats = useCallback((seatIds: SeatId[]) => {
    dispatch({ type: SeatSocketActionType.ReleaseRequested });
    socket.emit(ClientEvent.SeatRelease, { seatIds });
  }, []);

  const contextValue: SeatSocketContextValue = useMemo(
    () => ({ ...state, toggleSeat, holdSeats, confirmBooking, releaseHeldSeats }),
    [state, toggleSeat, holdSeats, confirmBooking, releaseHeldSeats],
  );

  return (
    <SeatSocketContext.Provider value={contextValue}>
      {children}
    </SeatSocketContext.Provider>
  );
}
