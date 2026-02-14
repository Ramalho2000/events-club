import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, CalendarDays, ImageIcon, AlertCircle } from 'lucide-react';
import DeleteItemButton from './DeleteItemButton';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';
import type { Event } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.admin;

  let events: Event[] = [];
  let dbAvailable = true;

  try {
    events = await prisma.event.findMany({ orderBy: { date: 'desc' } });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    dbAvailable = false;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {t.manageEvents}
            </h2>
            <p className="text-muted-foreground text-sm">
              {events.length} {t.eventsCount}
            </p>
          </div>
          <Button asChild>
            <Link href={`/${locale}${siteConfig.routes.adminNewEvent}`}>
              <Plus className="mr-2 h-4 w-4" />
              {t.addEvent}
            </Link>
          </Button>
        </div>

        {!dbAvailable ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold">{t.dbUnavailable}</h3>
            <p className="text-sm text-muted-foreground">{t.dbUnavailableHint}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t.noEvents}</p>
            <p className="text-sm text-muted-foreground mb-4">{t.noEventsHint}</p>
            <Button asChild>
              <Link href={`/${locale}${siteConfig.routes.adminNewEvent}`}>
                <Plus className="mr-2 h-4 w-4" />
                {t.addFirst}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">{t.image}</TableHead>
                  <TableHead>{t.eventName}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead>{t.location}</TableHead>
                  <TableHead>{t.category}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted">
                        {event.images.length > 0 ? (
                          <Image
                            src={event.images[0]}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      {t.categories[event.category as keyof typeof t.categories] ||
                        event.category}
                    </TableCell>
                    <TableCell>
                      {event.featured && (
                        <Badge variant="secondary">{t.featured}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/${locale}/admin/events/${event.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteItemButton
                          itemId={event.id}
                          itemName={event.title}
                          apiBasePath={siteConfig.apiBasePath}
                          translations={t}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Gallery Section Link */}
      <div className="flex items-center justify-between border-t pt-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t.manageGallery}
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}${siteConfig.routes.adminGallery}`}>
            {t.manageGallery}
          </Link>
        </Button>
      </div>
    </div>
  );
}
