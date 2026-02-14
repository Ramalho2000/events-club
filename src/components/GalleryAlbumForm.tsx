'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import type { GalleryAlbum } from '@/generated/prisma/client';
import { Loader2, Plus, X } from 'lucide-react';

interface GalleryAlbumFormProps {
  initialData?: GalleryAlbum | null;
  locale: string;
  apiBasePath?: string;
  redirectPath?: string;
  translations: {
    albumTitle: string;
    albumTitlePlaceholder: string;
    albumDescription: string;
    albumDescriptionPlaceholder: string;
    albumImages: string;
    albumVideos: string;
    videoUrlPlaceholder: string;
    addVideo: string;
    removeVideo: string;
    updateAlbum: string;
    addAlbumButton: string;
    cancelButton: string;
    uploadImages: string;
    saveFailed: string;
    mainImage: string;
    drag: string;
    moveLeft: string;
    moveRight: string;
    optional: string;
  };
}

export default function GalleryAlbumForm({
  initialData,
  locale,
  apiBasePath = '/api/gallery',
  redirectPath,
  translations: t,
}: GalleryAlbumFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    images: string[];
    videos: string[];
  }>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    images: initialData?.images || [],
    videos: initialData?.videos || [],
  });

  const isEditing = !!initialData;
  const defaultRedirectPath = redirectPath || `/${locale}/admin/gallery`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `${apiBasePath}/${initialData.id}` : apiBasePath;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...form,
        description: form.description.trim() || null,
        coverImage: form.images.length > 0 ? form.images[0] : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      router.push(defaultRedirectPath);
      router.refresh();
    } catch (err) {
      console.error('Error saving album:', err);
      setError(t.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  const addVideo = () => {
    setForm({ ...form, videos: [...form.videos, ''] });
  };

  const updateVideo = (index: number, value: string) => {
    const updated = [...form.videos];
    updated[index] = value;
    setForm({ ...form, videos: updated });
  };

  const removeVideo = (index: number) => {
    setForm({ ...form, videos: form.videos.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t.albumTitle}</Label>
        <Input
          id="title"
          placeholder={t.albumTitlePlaceholder}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>{t.albumImages}</Label>
        <ImageUpload
          value={form.images}
          onChange={(urls) => setForm({ ...form, images: urls })}
          uploadLabel={t.uploadImages}
          mainLabel={t.mainImage}
          dragLabel={t.drag}
          moveLeftLabel={t.moveLeft}
          moveRightLabel={t.moveRight}
          folder={
            form.title.trim()
              ? `nordesteAutomovelClube/gallery/${form.title.trim().replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').replace(/\s+/g, '_')}`
              : undefined
          }
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          {t.albumDescription}{' '}
          <span className="text-muted-foreground font-normal text-xs">
            ({t.optional})
          </span>
        </Label>
        <Textarea
          id="description"
          placeholder={t.albumDescriptionPlaceholder}
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* Videos */}
      <div className="space-y-3">
        <Label>{t.albumVideos}</Label>
        {form.videos.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={t.videoUrlPlaceholder}
              value={url}
              onChange={(e) => updateVideo(i, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeVideo(i)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addVideo}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addVideo}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t.updateAlbum : t.addAlbumButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(defaultRedirectPath)}
        >
          {t.cancelButton}
        </Button>
      </div>
    </form>
  );
}
