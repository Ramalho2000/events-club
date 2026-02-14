import { z } from 'zod';
import { EVENT_CATEGORIES } from '@/constants/event';

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  date: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  location: z.string().min(1, 'Location is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .default([]),
  featured: z.boolean().default(false),
  category: z.enum(EVENT_CATEGORIES).default('Encontro'),
});

export type EventInput = z.infer<typeof eventSchema>;
