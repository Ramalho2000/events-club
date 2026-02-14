import Logo from '@/components/Logo';
import { createElement } from 'react';
import type { ReactNode } from 'react';

/**
 * Central site configuration.
 *
 * When forking this project for a new club, update the values below.
 * Everything that is business-specific lives here — components stay generic.
 */
export interface SiteConfig {
  /** Display name shown in the Navbar, Footer, and metadata */
  brandName: string;
  /** React node used as the brand icon (Navbar + Footer) */
  brandIcon: ReactNode;
  /** Contact details shown in the Footer and About page */
  contact: {
    address: string;
    email: string;
    phone: string;
    mapsUrl: string;
    mapsEmbedUrl: string;
  };
  /** Base API path for event CRUD */
  apiBasePath: string;
  /** Base API path for gallery CRUD */
  galleryApiBasePath: string;
  /** Public routes (locale prefix is prepended automatically) */
  routes: {
    events: string;
    gallery: string;
    about: string;
    admin: string;
    adminNewEvent: string;
    adminGallery: string;
    adminNewAlbum: string;
  };
  /** Placeholder image path */
  placeholderImage: string;
}

export const siteConfig: SiteConfig = {
  brandName: 'Nordeste Automóvel Clube',
  brandIcon: createElement(Logo),
  contact: {
    address: 'Avenida Abade de Baçal 4, 5300-068 Bragança',
    email: 'nordesteautomovelclube@hotmail.com',
    phone: '(+351) 928 161 087',
    mapsUrl: 'https://maps.app.goo.gl/braganca-nac',
    mapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2965.123456!2d-6.7574!3d41.8058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3a4a5db4e1c5ed%3A0x0!2sAv.+Abade+de+Ba%C3%A7al+4%2C+5300-068+Bragan%C3%A7a!5e0!3m2!1spt!2spt',
  },
  apiBasePath: '/api/events',
  galleryApiBasePath: '/api/gallery',
  routes: {
    events: '/events',
    gallery: '/gallery',
    about: '/about',
    admin: '/admin',
    adminNewEvent: '/admin/events/new',
    adminGallery: '/admin/gallery',
    adminNewAlbum: '/admin/gallery/new',
  },
  placeholderImage: '/placeholder-image.svg',
};
