import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ItemCardProps {
  href: string;
  image: string;
  placeholderImage?: string;
  alt: string;
  title: string;
  subtitle?: string;
  badge?: string;
  details: { icon: ReactNode; label: string }[];
  actionLabel: string;
}

export default function ItemCard({
  href,
  image,
  placeholderImage = '/placeholder-image.svg',
  alt,
  title,
  subtitle,
  badge,
  details,
  actionLabel,
}: ItemCardProps) {
  const mainImage = image || placeholderImage;

  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={mainImage}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {badge && (
            <Badge className="absolute top-3 left-3 shadow-md">{badge}</Badge>
          )}
        </div>
        <CardContent className="pt-5 space-y-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {details.map((detail, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1"
              >
                {detail.icon}
                {detail.label}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <span className="inline-flex items-center justify-center w-full h-9 px-4 rounded-md border text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
