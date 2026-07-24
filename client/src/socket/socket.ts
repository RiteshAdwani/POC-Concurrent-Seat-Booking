import { io, type Socket } from 'socket.io-client'
import { SERVER_URL } from '@/constants/serverUrl.constants'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socketEvents'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
})
