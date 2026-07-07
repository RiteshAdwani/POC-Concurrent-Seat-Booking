// Mirrors the wire shapes from server/src/types.ts — keep in sync manually,
// the two workspaces don't share a build.

export type SeatId = string

// A real `enum` isn't erasable (tsconfig.app.json has erasableSyntaxOnly),
// so this is the standard const-object replacement — SeatStatus.Available
// works the same as an enum member, both as a value and as a type.
export const SeatStatus = {
  Available: 'available',
  Held: 'held',
  Booked: 'booked',
} as const

export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus]
