import Hero from '@/components/Hero';
import ItemCard from '@/components/ItemCard';
import AnimateIn from '@/components/AnimateIn';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, MapPin, Tag } from 'lucide-react';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getUpcomingEvents, getFeaturedEvents } from '@/lib/queries/events';

export const revalidate = 3600;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  let upcomingEvents: Awaited<ReturnType<typeof getUpcomingEvents>> = [];
  let featuredEvents: Awaited<ReturnType<typeof getFeaturedEvents>> = [];

  try {
    upcomingEvents = await getUpcomingEvents();
    featuredEvents = await getFeaturedEvents();
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero locale={locale} translations={dict.hero} />

      {/* Memorable / Gallery Teaser Section */}
      <section className="container mx-auto px-4 py-20">
        <AnimateIn className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {dict.home.memorableTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {dict.home.memorableSubtitle}
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}/gallery`}>
              {dict.home.viewGallery}{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimateIn>
      </section>

      {/* About Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <AnimateIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/hero-bg.png"
                alt="NAC"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                {dict.home.aboutTitle}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {dict.home.aboutText}
              </p>
              <Button asChild variant="outline">
                <Link href={`/${locale}/about`}>
                  {dict.home.learnMore}{' '}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="container mx-auto px-4 py-20">
        <AnimateIn className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {dict.home.upcomingTitle}
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              {dict.home.upcomingSubtitle}
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={`/${locale}/events`}>
              {dict.home.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimateIn>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <AnimateIn key={event.id} delay={index * 100}>
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
          <AnimateIn className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{dict.home.noEvents}</p>
            <p className="text-sm mt-1">{dict.home.noEventsHint}</p>
          </AnimateIn>
        )}

        {/* Mobile view-all button */}
        <div className="sm:hidden mt-6 text-center">
          <Button asChild variant="outline">
            <Link href={`/${locale}/events`}>
              {dict.home.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <AnimateIn className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {dict.home.featuredTitle}
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  {dict.home.featuredSubtitle}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                <Link href={`/${locale}/events`}>
                  {dict.home.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimateIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <AnimateIn key={event.id} delay={index * 100}>
                  <ItemCard
                    href={`/${locale}/events/${event.id}`}
                    image={event.images.length > 0 ? event.images[0] : ''}
                    placeholderImage={siteConfig.placeholderImage}
                    alt={event.title}
                    title={event.title}
                    subtitle={formatDate(event.date)}
                    badge={dict.events.featured}
                    details={[
                      {
                        icon: <CalendarDays className="h-4 w-4" />,
                        label: formatDate(event.date),
                      },
                      {
                        icon: <MapPin className="h-4 w-4" />,
                        label: event.location,
                      },
                    ]}
                    actionLabel={dict.events.viewDetails}
                  />
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Merch CTA Section */}
      <section className="relative overflow-hidden py-20">
        <AnimateIn className="container mx-auto px-4 text-center space-y-6">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {dict.home.supportNac}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            {dict.home.merchTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {dict.home.merchSubtitle}
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link href={`/${locale}/about`}>{dict.home.merchCta}</Link>
            </Button>
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}
