import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';

export function revalidateEventPages(eventId?: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/events`);
    revalidatePath(`/${locale}/admin`);
    if (eventId) {
      revalidatePath(`/${locale}/events/${eventId}`);
    }
  }
}

export function revalidateGalleryPages(albumId?: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/gallery`);
    revalidatePath(`/${locale}/admin/gallery`);
    if (albumId) {
      revalidatePath(`/${locale}/gallery/${albumId}`);
    }
  }
}

export function revalidateUserPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/users`);
  }
}
