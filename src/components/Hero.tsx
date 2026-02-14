import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera } from 'lucide-react';

interface HeroProps {
  locale: string;
  translations: {
    welcome: string;
    clubName: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

export default function Hero({ locale, translations: t }: HeroProps) {
  return (
    <section className="relative min-h-[520px] md:min-h-[680px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/70 to-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-14 md:py-28">
        <div className="max-w-2xl flex flex-col gap-5 md:gap-6">
          {/* Welcome text */}
          <p className="text-white/70 text-lg md:text-xl font-medium animate-fade-in-down">
            {t.welcome}
          </p>

          {/* Club Name */}
          <h1 className="text-[2.125rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-white drop-shadow-lg animate-fade-in-up">
            {t.clubName}
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] leading-relaxed sm:text-lg md:text-xl text-white/75 max-w-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] animate-fade-in-up stagger-2">
            {t.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1 animate-fade-in-up stagger-3">
            <Button
              asChild
              size="lg"
              className="group bg-white text-gray-900 font-semibold text-[15px] h-12 px-7 rounded-lg shadow-xl shadow-black/25 hover:bg-gray-50 hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98] focus-visible:ring-white/40 transition-all duration-200"
            >
              <Link href={`/${locale}/events`}>
                {t.primaryCta}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              className="text-[15px] h-12 px-7 rounded-lg border border-white/25 text-white/90 bg-white/7 backdrop-blur-sm hover:bg-white/15 hover:text-white hover:border-white/40 active:scale-[0.98] focus-visible:ring-white/30 transition-all duration-200"
            >
              <Link href={`/${locale}/gallery`}>
                <Camera className="mr-2 h-5 w-5" />
                {t.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
