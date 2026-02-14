import { z } from 'zod';

export const galleryAlbumSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .default([]),
  videos: z
    .array(z.string().url('Each video URL must be valid'))
    .default([]),
  folder: z.string().max(300).nullable().optional(),
  cloudinaryPath: z.string().max(500).nullable().optional(),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
