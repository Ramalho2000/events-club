'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in';
  delay?: number;
  /** Trigger animation on mount instead of on scroll into view */
  immediate?: boolean;
}

export default function AnimateIn({
  children,
  className,
  animation = 'fade-in-up',
  delay = 0,
  immediate = false,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <div
      ref={ref}
      className={cn(className, visible ? `animate-${animation}` : 'opacity-0')}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
