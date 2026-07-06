import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { store } from "./store";
import { registerSeatHandlers } from "./registerSeatHandlers";
import {
  ServerEvent,
  SeatStatus,
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types";
import { apiRoute } from "./constants";

const PORT = process.env.PORT ?? 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

// ─── REST ─────────────────────────────────────────────────────────────────────

app.get(apiRoute.seats, (_req, res) => {
  res.status(StatusCodes.OK).json(store.getSnapshot());
});

app.get(apiRoute.health, (_req, res) => {
  res.status(StatusCodes.OK).json({ ok: true });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  socket.emit(ServerEvent.SeatFullSync, store.getSnapshot());
  io.emit(ServerEvent.PresenceUpdate, { count: io.sockets.sockets.size });

  registerSeatHandlers(io, socket);

  socket.on("disconnect", () => {
    const releasedIds = store.releaseAllHeldBy(socket.id);

    if (releasedIds.length) {
      io.emit(ServerEvent.SeatsStateChanged, {
        seats: releasedIds.map((id) => ({ seatId: id, status: SeatStatus.Available })),
      });
    }

    io.emit(ServerEvent.PresenceUpdate, { count: io.sockets.sockets.size });
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
