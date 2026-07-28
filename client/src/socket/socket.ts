import { io, type Socket } from 'socket.io-client'
import { SERVER_URL } from '@/constants/serverUrl.constants'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socketEvents'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
})

/**
 * @description Dev-only helper that simulates a real network drop by force-closing the
 * underlying transport, then reconnecting after exactly durationMs. Deliberately doesn't
 * use socket.disconnect() — Socket.IO treats that as an intentional close and excludes it
 * from Connection State Recovery, which would make this demo always show "not recovered."
 * Auto-reconnect is disabled for the duration so the timing stays deterministic for a demo.
 */
export const simulateDisconnect = (durationMs: number) => {
  if (!socket.connected) return

  socket.io.reconnection(false)
  socket.io.engine?.close()

  setTimeout(() => {
    socket.io.reconnection(true)
    socket.connect()
  }, durationMs)
}
