'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Film, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AnimateIn from '@/components/AnimateIn';

interface AlbumSummary {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  imageCount: number;
  videoCount: number;
}

interface GalleryTranslations {
  selectAlbum: string;
  photos: string;
  videos: string;
  noPhotosInAlbum: string;
  noAlbums: string;
  noAlbumsHint: string;
  loadMore: string;
}

interface GalleryAlbumViewerProps {
  albums: AlbumSummary[];
  defaultAlbumId?: string | null;
  translations: GalleryTranslations;
}

export default function GalleryAlbumViewer({
  albums,
  defaultAlbumId,
  translations: t,
}: GalleryAlbumViewerProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>(
    undefined,
  );
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  const fetchImages = useCallback(
    async (albumId: string, cursor?: string) => {
      const isLoadMore = !!cursor;
      isLoadMore ? setLoadingMore(true) : setLoading(true);

      try {
        const url = cursor
          ? `/api/gallery/${albumId}/images?cursor=${cursor}`
          : `/api/gallery/${albumId}/images`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (isLoadMore) {
          setImages((prev) => [...prev, ...data.images]);
        } else {
          setImages(data.images);
          setVideos(data.videos || []);
          setTotalCount(data.totalCount);
        }
        setNextCursor(data.nextCursor);
      } catch (error) {
        console.error('Error fetching album images:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const handleAlbumChange = useCallback(
    (albumId: string) => {
      setSelectedAlbumId(albumId);
      setImages([]);
      setVideos([]);
      setNextCursor(null);
      setTotalCount(0);
      fetchImages(albumId);
    },
    [fetchImages],
  );

  // Auto-select the default album on mount
  useEffect(() => {
    if (defaultAlbumId && albums.some((a) => a.id === defaultAlbumId)) {
      handleAlbumChange(defaultAlbumId);
    }
  }, [defaultAlbumId, albums, handleAlbumChange]);

  if (albums.length === 0) {
    return (
      <AnimateIn className="text-center py-20 text-muted-foreground">
        <p className="text-lg">{t.noAlbums}</p>
        <p className="text-sm mt-1">{t.noAlbumsHint}</p>
      </AnimateIn>
    );
  }

  return (
    <div className="space-y-8">
      {/* Album Selector */}
      <div className="flex justify-center">
        <Select value={selectedAlbumId} onValueChange={handleAlbumChange}>
          <SelectTrigger className="w-full max-w-md text-base">
            <SelectValue placeholder={t.selectAlbum} />
          </SelectTrigger>
          <SelectContent>
            {albums.map((album) => (
              <SelectItem key={album.id} value={album.id}>
                <span className="flex items-center gap-2">
                  {album.title}
                  {album.imageCount > 0 && (
                    <span className="text-muted-foreground text-xs">
                      ({album.imageCount} {t.photos})
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Selected Album Content */}
      {selectedAlbum && !loading && (
        <AnimateIn key={selectedAlbum.id} immediate className="space-y-8">
          {/* Album Info */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">
              {selectedAlbum.title}
            </h2>
            {selectedAlbum.description && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {selectedAlbum.description}
              </p>
            )}
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              {totalCount > 0 && (
                <span className="flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" />
                  {totalCount} {t.photos}
                </span>
              )}
              {videos.length > 0 && (
                <span className="flex items-center gap-1">
                  <Film className="h-3.5 w-3.5" />
                  {videos.length} {t.videos}
                </span>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          {images.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <AnimateIn key={img} delay={Math.min(i, 6) * 50}>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={img}
                        alt={`${selectedAlbum.title} - ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </AnimateIn>
                ))}
              </div>

              {/* Load More */}
              {nextCursor && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetchImages(selectedAlbum.id, nextCursor)
                    }
                    disabled={loadingMore}
                  >
                    {loadingMore && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t.loadMore} ({images.length}/{totalCount})
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>{t.noPhotosInAlbum}</p>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">{t.videos}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-xl overflow-hidden border"
                  >
                    <iframe
                      src={url}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimateIn>
      )}
    </div>
  );
}
