import { z } from 'zod';
import { SeatId } from '../types';
import { Messages, MAX_SEATS_PER_BOOKING, VALID_SEAT_IDS } from '../constants';

export const SeatIdsPayloadSchema = z.object({
  seatIds: z
    .array(
      z.string()
        .refine(id => VALID_SEAT_IDS.has(id), Messages.SeatNotFound)
        .transform(id => id as SeatId),
    )
    .min(1, Messages.SeatsEmpty)
    .max(MAX_SEATS_PER_BOOKING, Messages.SeatsExceedLimit)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      Messages.SeatsDuplicate,
    ),
});

export type SeatIdsPayload = z.infer<typeof SeatIdsPayloadSchema>;
