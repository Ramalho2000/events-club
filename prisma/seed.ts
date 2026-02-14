import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GalleryEntry {
  folder: string;
  title: string;
  cloudinaryId: string | null;
  cloudinaryPath: string | null;
  csvRow?: number;
  createdDate: string | null;
  updatedDate: string | null;
}

/**
 * Parse a date string, returning null if it's invalid or not a real ISO date.
 */
function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  // Check it's a valid date (not NaN) and looks like an ISO timestamp
  if (isNaN(d.getTime())) return null;
  // Filter out corrupted values like "title:IMG_2502.JPG"
  if (!value.match(/^\d{4}-\d{2}-\d{2}/)) return null;
  return d;
}

async function getImageCount(folderPath: string): Promise<number> {
  try {
    const result = await cloudinary.search
      .expression(`folder:"${folderPath}"`)
      .max_results(0)
      .execute();
    return result.total_count ?? 0;
  } catch (error) {
    console.error(`  ⚠ Failed to count images for ${folderPath}:`, error);
    return 0;
  }
}

async function main() {
  const jsonPath = resolve(__dirname, '../public/galleries-with-ids.json');
  const raw = readFileSync(jsonPath, 'utf-8');
  const galleries: GalleryEntry[] = JSON.parse(raw);

  // Filter valid entries: must have a cloudinaryPath and a clean title
  const validGalleries = galleries.filter(
    (g): g is GalleryEntry & { cloudinaryPath: string } =>
      g.cloudinaryPath !== null &&
      !g.title.includes(',') &&
      g.title.length < 200,
  );

  console.log(
    `Seeding ${validGalleries.length} albums (skipped ${galleries.length - validGalleries.length} invalid entries)...\n`,
  );

  let created = 0;
  let updated = 0;

  for (const gallery of validGalleries) {
    const imageCount = await getImageCount(gallery.cloudinaryPath);
    const albumCreatedAt = parseDate(gallery.createdDate);
    const albumUpdatedAt = parseDate(gallery.updatedDate);

    const data = {
      title: gallery.title.trim(),
      folder: gallery.folder,
      cloudinaryId: gallery.cloudinaryId,
      imageCount,
      albumCreatedAt,
      albumUpdatedAt,
    };

    const existing = await prisma.galleryAlbum.findUnique({
      where: { cloudinaryPath: gallery.cloudinaryPath },
    });

    if (existing) {
      await prisma.galleryAlbum.update({
        where: { cloudinaryPath: gallery.cloudinaryPath },
        data,
      });
      updated++;
      console.log(
        `  ↻ Updated: ${gallery.title.trim()} (${imageCount} imgs, created: ${albumCreatedAt?.toISOString() ?? 'null'})`,
      );
    } else {
      await prisma.galleryAlbum.create({
        data: {
          ...data,
          cloudinaryPath: gallery.cloudinaryPath,
          images: [],
          videos: [],
        },
      });
      created++;
      console.log(
        `  ✓ Created: ${gallery.title.trim()} (${imageCount} imgs, created: ${albumCreatedAt?.toISOString() ?? 'null'})`,
      );
    }
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
