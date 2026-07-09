import { useEffect, useReducer, type ReactNode } from "react";
import { socket } from "@/socket/socket";
import { ServerEvent, type SeatsStateChangedEvent } from "@/types/socketEvents";
import type { SeatsSnapshot } from "@/types/seat";
import {
  initialSeatSocketState,
  seatSocketReducer,
  SeatSocketActionType,
} from "@/state/seatReducer";
import { SeatSocketContext } from "@/state/seatSocketContext";

/**
 * @description Owns the seat-state reducer and subscribes to seat:full:sync / seats:state:changed
 * for the lifetime of the app, exposing the resulting state to descendants via SeatSocketContext.
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

    socket.on(ServerEvent.SeatFullSync, handleFullSync);
    socket.on(ServerEvent.SeatsStateChanged, handleStateChanged);

    return () => {
      socket.off(ServerEvent.SeatFullSync, handleFullSync);
      socket.off(ServerEvent.SeatsStateChanged, handleStateChanged);
    };
  }, []);

  return (
    <SeatSocketContext.Provider value={state}>
      {children}
    </SeatSocketContext.Provider>
  );
}
