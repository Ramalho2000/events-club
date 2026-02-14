'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import type { Event } from '@/generated/prisma/client';
import { Loader2 } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/constants/event';
import type { EventCategory } from '@/types/event';

interface ItemFormProps {
  initialData?: Event | null;
  locale: string;
  /** API base path for CRUD operations (e.g. "/api/events") */
  apiBasePath?: string;
  /** Redirect path after save (e.g. "/en/admin") */
  redirectPath?: string;
  translations: {
    eventImages: string;
    titleLabel: string;
    titlePlaceholder: string;
    dateLabel: string;
    endDateLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    categoryLabel: string;
    descriptionLabel: string;
    featuredOnHomepage: string;
    updateEvent: string;
    addEventButton: string;
    cancelButton: string;
    uploadImages: string;
    describePlaceholder: string;
    saveFailed: string;
    saveSuccess: string;
    mainImage: string;
    drag: string;
    moveLeft: string;
    moveRight: string;
    optional: string;
    categories: Record<string, string>;
  };
}

export default function ItemForm({
  initialData,
  locale,
  apiBasePath = '/api/events',
  redirectPath,
  translations: t,
}: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    date: string;
    endDate: string;
    location: string;
    category: EventCategory;
    description: string;
    images: string[];
    featured: boolean;
  }>({
    title: initialData?.title || '',
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 16)
      : '',
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 16)
      : '',
    location: initialData?.location || '',
    category: (initialData?.category as EventCategory) || EVENT_CATEGORIES[0],
    description: initialData?.description || '',
    images: initialData?.images || [],
    featured: initialData?.featured || false,
  });

  const isEditing = !!initialData;
  const defaultRedirectPath = redirectPath || `/${locale}/admin`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `${apiBasePath}/${initialData.id}` : apiBasePath;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.date ? new Date(form.date).toISOString() : null,
          endDate: form.endDate
            ? new Date(form.endDate).toISOString()
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      router.push(defaultRedirectPath);
      router.refresh();
    } catch (err) {
      console.error('Error saving item:', err);
      setError(t.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Images */}
      <div className="space-y-2">
        <Label>{t.eventImages}</Label>
        <ImageUpload
          value={form.images}
          onChange={(urls) => setForm({ ...form, images: urls })}
          uploadLabel={t.uploadImages}
          mainLabel={t.mainImage}
          dragLabel={t.drag}
          moveLeftLabel={t.moveLeft}
          moveRightLabel={t.moveRight}
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t.titleLabel}</Label>
        <Input
          id="title"
          placeholder={t.titlePlaceholder}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      {/* Date & End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t.dateLabel}</Label>
          <Input
            id="date"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">
            {t.endDateLabel}{' '}
            <span className="text-muted-foreground font-normal text-xs">
              ({t.optional})
            </span>
          </Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Location & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">{t.locationLabel}</Label>
          <Input
            id="location"
            placeholder={t.locationPlaceholder}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t.categoryLabel}</Label>
          <Select
            value={form.category}
            onValueChange={(value) =>
              setForm({ ...form, category: value as EventCategory })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t.categoryLabel} />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t.categories[cat] ?? cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t.descriptionLabel}</Label>
        <Textarea
          id="description"
          placeholder={t.describePlaceholder}
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="featured"
          checked={form.featured}
          onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
        />
        <Label htmlFor="featured">{t.featuredOnHomepage}</Label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t.updateEvent : t.addEventButton}
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
