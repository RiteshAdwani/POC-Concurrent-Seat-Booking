import { Button } from '@/components/ui/button'
import { socket } from '@/socket/socket'

/**
 * @description Dev-only helper that simulates a real network drop by force-closing the
 * underlying transport, then reconnecting after exactly durationMs. Deliberately doesn't
 * use socket.disconnect() — Socket.IO treats that as an intentional close and excludes it
 * from Connection State Recovery, which would make this demo always show "not recovered."
 * Auto-reconnect is disabled for the duration so the timing stays deterministic for a demo.
 */
const simulateDisconnect = (durationMs: number) => {
  if (!socket.connected) return

  socket.io.reconnection(false)
  socket.io.engine?.close()

  setTimeout(() => {
    socket.io.reconnection(true)
    socket.connect()
  }, durationMs)
}

/**
 * @description Dev-only controls for demoing Socket.IO's Connection State Recovery: a
 * quick blip reconnects inside the server's recovery window (the hold survives), a long
 * drop exceeds it (the hold is released) — same underlying mechanism, different outcome.
 * Never rendered in a production build.
 */
export const RecoveryDemoControls = () => {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">🧪 Simulate disconnect</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => simulateDisconnect(3000)}>
          Quick blip (3s)
        </Button>
        <Button size="sm" variant="outline" onClick={() => simulateDisconnect(12000)}>
          Long drop (12s)
        </Button>
      </div>
    </div>
  )
}
