import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import type { ReactNode } from 'react';

interface FooterLink {
  href: string;
  label: string;
}

interface FooterProps {
  locale: string;
  brandName: string;
  brandIcon?: ReactNode;
  contactInfo?: {
    address?: string;
    email?: string;
    phone?: string;
  };
  links?: FooterLink[];
  translations: {
    description: string;
    quickLinks: string;
    home: string;
    browseEvents: string;
    gallery: string;
    aboutContact: string;
    contactUs: string;
    rights: string;
    emailLabel: string;
    phoneLabel: string;
  };
}

export default function Footer({
  locale,
  brandName,
  brandIcon,
  contactInfo,
  links: customLinks,
  translations: t,
}: FooterProps) {
  const footerLinks = customLinks || [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/events`, label: t.browseEvents },
    { href: `/${locale}/gallery`, label: t.gallery },
    { href: `/${locale}/about`, label: t.aboutContact },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              {brandIcon || (
                <span className="font-bold text-lg">{brandName}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t.quickLinks}</h3>
            <nav className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t.contactUs}</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {contactInfo?.address && <p>{contactInfo.address}</p>}
              {contactInfo?.email && (
                <p>
                  {t.emailLabel}:{' '}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </p>
              )}
              {contactInfo?.phone && (
                <p>
                  {t.phoneLabel}:{' '}
                  <a
                    href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {brandName}. {t.rights}
        </p>
      </div>
    </footer>
  );
}
