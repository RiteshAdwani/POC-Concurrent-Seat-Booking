import { Server, Socket } from "socket.io";
import { store } from "./store";
import {
  ClientEvent,
  ServerEvent,
  SeatStatus,
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types";
import { Messages, HARD_LOCK_MS } from "./constants";
import { SeatIdsPayloadSchema } from "./utils/validators";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

/**
 * @description Registers seat:hold and seat:confirm Socket.IO handlers for a single connected socket.
 * Each handler validates the payload with Zod, delegates to the store, and emits the appropriate
 * success or failure event back to the requesting client. State-change broadcasts go to all clients.
 */
export function registerSeatHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(ClientEvent.SeatHold, (payload: unknown) => {
    const parsed = SeatIdsPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      socket.emit(ServerEvent.SeatHoldRejected, {
        seatIds: [],
        message: parsed.error.issues[0]?.message ?? Messages.InvalidPayload,
      });
      return;
    }

    const { seatIds } = parsed.data;

    const result = store.requestSeatsHold(
      seatIds,
      socket.id,
      (expiredSeatIds) => {
        socket.emit(ServerEvent.SeatHoldExpiringSoon, {
          seatIds: expiredSeatIds,
          message: Messages.SeatExpiringSoon,
        });
      },
      (expiredSeatIds) => {
        io.emit(ServerEvent.SeatsStateChanged, {
          seats: expiredSeatIds.map((id) => ({ seatId: id, status: SeatStatus.Available })),
        });
      },
    );

    if (!result.ok) {
      socket.emit(ServerEvent.SeatHoldRejected, { seatIds, message: result.reason });
      return;
    }

    socket.emit(ServerEvent.SeatHoldConfirmed, {
      seatIds: result.seatIds,
      expiresAt: result.expiresAt,
      softExpiresAt: result.softExpiresAt,
      ttlMs: HARD_LOCK_MS,
      message: Messages.SeatHoldConfirmed,
    });

    io.emit(ServerEvent.SeatsStateChanged, {
      seats: seatIds.map((id) => ({ seatId: id, status: SeatStatus.Held })),
    });
  });

  socket.on(ClientEvent.SeatConfirm, (payload: unknown) => {
    const parsed = SeatIdsPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      socket.emit(ServerEvent.SeatConfirmFailed, {
        seatIds: [],
        message: parsed.error.issues[0]?.message ?? Messages.InvalidPayload,
      });
      return;
    }

    const { seatIds } = parsed.data;

    const result = store.confirmBookings(seatIds, socket.id);

    if (!result.ok) {
      socket.emit(ServerEvent.SeatConfirmFailed, { seatIds, message: result.reason });
      return;
    }

    socket.emit(ServerEvent.SeatConfirmSuccess, {
      seatIds,
      message: Messages.SeatBookingSuccess,
    });

    io.emit(ServerEvent.SeatsStateChanged, {
      seats: seatIds.map((id) => ({ seatId: id, status: SeatStatus.Booked })),
    });
  });
}
