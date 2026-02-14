import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getEventById = cache(async (id: string) => {
  return prisma.event.findUnique({ where: { id } });
});

export const getAllEvents = cache(async () => {
  return prisma.event.findMany({ orderBy: { date: 'desc' } });
});

export const getFeaturedEvents = cache(async () => {
  return prisma.event.findMany({
    where: { featured: true },
    orderBy: { date: 'desc' },
    take: 6,
  });
});

export const getUpcomingEvents = cache(async () => {
  return prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take: 6,
  });
});

export const getLatestEvents = cache(async () => {
  return prisma.event.findMany({
    orderBy: { date: 'desc' },
    take: 6,
  });
});
