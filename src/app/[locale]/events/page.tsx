import ItemCard from '@/components/ItemCard';
import AnimateIn from '@/components/AnimateIn';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getAllEvents } from '@/lib/queries/events';
import { CalendarDays, MapPin, Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface EventsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: EventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.eventsTitle,
    description: dict.metadata.eventsDescription,
  };
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  let events: Awaited<ReturnType<typeof getAllEvents>> = [];
  try {
    events = await getAllEvents();
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-14">
      {/* Header */}
      <AnimateIn className="text-center mb-12 space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">{dict.events.title}</h1>
        <p className="text-muted-foreground text-lg">{dict.events.subtitle}</p>
      </AnimateIn>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <AnimateIn key={event.id} delay={index * 80}>
              <ItemCard
                href={`/${locale}/events/${event.id}`}
                image={event.images.length > 0 ? event.images[0] : ''}
                placeholderImage={siteConfig.placeholderImage}
                alt={event.title}
                title={event.title}
                subtitle={formatDate(event.date)}
                badge={event.featured ? dict.events.featured : undefined}
                details={[
                  {
                    icon: <CalendarDays className="h-4 w-4" />,
                    label: formatDate(event.date),
                  },
                  {
                    icon: <MapPin className="h-4 w-4" />,
                    label: event.location,
                  },
                  {
                    icon: <Tag className="h-4 w-4" />,
                    label:
                      dict.admin.categories[
                        event.category as keyof typeof dict.admin.categories
                      ] || event.category,
                  },
                ]}
                actionLabel={dict.events.viewDetails}
              />
            </AnimateIn>
          ))}
        </div>
      ) : (
        <AnimateIn className="text-center py-20 text-muted-foreground">
          <p className="text-lg">{dict.events.noEvents}</p>
          <p className="text-sm mt-1">{dict.events.noEventsHint}</p>
        </AnimateIn>
      )}
    </div>
  );
}
