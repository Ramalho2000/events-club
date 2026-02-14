import { Card, CardContent } from '@/components/ui/card';
import AnimateIn from '@/components/AnimateIn';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { MapPin, Phone, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.aboutTitle,
    description: dict.metadata.aboutDescription,
  };
}

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.about;
  const contact = siteConfig.contact;

  return (
    <div className="container mx-auto px-4 py-14">
      {/* Header */}
      <AnimateIn className="text-center mb-14 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
        <p className="text-lg text-muted-foreground">{t.subtitle}</p>
      </AnimateIn>

      {/* Story Section */}
      <section className="mb-16">
        <AnimateIn>
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">{t.storyTitle}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.story1}</p>
            <p className="text-muted-foreground leading-relaxed">{t.story2}</p>
            <p className="text-muted-foreground leading-relaxed">{t.story3}</p>
          </div>
        </AnimateIn>
      </section>

      {/* Contact Info Section */}
      <section className="mb-16">
        <AnimateIn>
          <h2 className="text-2xl font-bold text-center mb-8">
            {t.contactTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{t.address}</h3>
                <p className="text-sm text-muted-foreground">
                  {contact.address}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{t.phone}</h3>
                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contact.phone}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{t.email}</h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contact.email}
                </a>
              </CardContent>
            </Card>
          </div>
        </AnimateIn>
      </section>

      {/* Map Section */}
      <section>
        <AnimateIn>
          <h2 className="text-2xl font-bold text-center mb-4">{t.findUs}</h2>
          <p className="text-center text-muted-foreground mb-6">
            {t.findUsHint}
          </p>
          <div className="rounded-xl overflow-hidden border h-[400px]">
            <iframe
              src={contact.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.mapTitle}
            />
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}
