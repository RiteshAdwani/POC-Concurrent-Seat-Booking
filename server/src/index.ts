import "dotenv/config";
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
import { apiRoute, SEAT_LAYOUT, CONNECTION_RECOVERY_WINDOW_MS } from "./constants";

const PORT = process.env.PORT ?? 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
  connectionStateRecovery: {
    maxDisconnectionDuration: CONNECTION_RECOVERY_WINDOW_MS,
  },
});

// ─── REST ─────────────────────────────────────────────────────────────────────

app.get(apiRoute.seats, (_req, res) => {
  res.status(StatusCodes.OK).json(store.getSnapshot());
});

app.get(apiRoute.layout, (_req, res) => {
  res.status(StatusCodes.OK).json(SEAT_LAYOUT);
});

app.get(apiRoute.health, (_req, res) => {
  res.status(StatusCodes.OK).json({ ok: true });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

// Sockets that disconnect are given a grace period — matching the Connection State
// Recovery window above — before their held seats are actually released. If the same
// socket id reconnects (recovered) within that window, the pending release below is
// cancelled and the hold survives untouched.
const pendingDisconnectReleases = new Map<string, NodeJS.Timeout>();

io.on("connection", (socket) => {
  const pendingRelease = pendingDisconnectReleases.get(socket.id);
  if (socket.recovered && pendingRelease) {
    clearTimeout(pendingRelease);
    pendingDisconnectReleases.delete(socket.id);
  }

  socket.emit(ServerEvent.SeatFullSync, store.getSnapshot());
  io.emit(ServerEvent.PresenceUpdate, { count: io.sockets.sockets.size });

  registerSeatHandlers(io, socket);

  socket.on("disconnect", () => {
    io.emit(ServerEvent.PresenceUpdate, { count: io.sockets.sockets.size });

    const releaseTimer = setTimeout(() => {
      pendingDisconnectReleases.delete(socket.id);

      const releasedIds = store.releaseAllHeldBy(socket.id);
      if (releasedIds.length) {
        io.emit(ServerEvent.SeatsStateChanged, {
          seats: releasedIds.map((id) => ({ seatId: id, status: SeatStatus.Available })),
        });
      }
    }, CONNECTION_RECOVERY_WINDOW_MS);

    pendingDisconnectReleases.set(socket.id, releaseTimer);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
