import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Fetch paginated image URLs from a Cloudinary folder.
 */
export async function getCloudinaryImagesByFolder(
  folderPath: string,
  { limit = 30, cursor }: { limit?: number; cursor?: string } = {},
): Promise<{
  images: string[];
  nextCursor: string | null;
  totalCount: number;
}> {
  try {
    let query = cloudinary.search
      .expression(`folder:"${folderPath}"`)
      .sort_by('public_id', 'asc')
      .max_results(limit);

    if (cursor) {
      query = query.next_cursor(cursor);
    }

    const result = await query.execute();

    return {
      images: result.resources.map(
        (r: { secure_url: string }) => r.secure_url,
      ),
      nextCursor: result.next_cursor ?? null,
      totalCount: result.total_count ?? 0,
    };
  } catch (error) {
    console.error(
      `Failed to fetch images from folder: ${folderPath}`,
      error,
    );
    return { images: [], nextCursor: null, totalCount: 0 };
  }
}

export default cloudinary;
