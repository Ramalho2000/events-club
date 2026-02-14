'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  uploadLabel?: string;
  mainLabel?: string;
  dragLabel?: string;
  moveLeftLabel?: string;
  moveRightLabel?: string;
  /** Cloudinary folder path to upload images into */
  folder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  uploadLabel = 'Upload Images',
  mainLabel = 'Main',
  dragLabel = 'Drag',
  moveLeftLabel = 'Move left',
  moveRightLabel = 'Move right',
  folder,
}: ImageUploadProps) {
  // Use a ref to always have the latest value inside the onSuccess callback
  // This avoids stale closures when multiple files are uploaded at once
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const onUpload = (results: CloudinaryUploadWidgetResults) => {
    if (
      results.info &&
      typeof results.info === 'object' &&
      'secure_url' in results.info
    ) {
      const updated = [...valueRef.current, results.info.secure_url];
      valueRef.current = updated;
      onChange(updated);
    }
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= value.length) return;
      const updated = [...value];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      onChange(updated);
    },
    [value, onChange],
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      moveImage(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative w-[200px] h-[200px] rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
              dragIndex === index
                ? 'opacity-50 border-primary scale-95'
                : dragOverIndex === index
                  ? 'border-primary border-dashed scale-105'
                  : 'border-border'
            }`}
          >
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-2 right-2 z-10 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Main badge */}
            {index === 0 && (
              <span className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
                {mainLabel}
              </span>
            )}

            {/* Drag handle indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white opacity-0 hover:opacity-100 transition-opacity">
              <GripVertical className="h-3 w-3" />
              <span className="text-[10px] font-medium">{dragLabel}</span>
            </div>

            {/* Move left/right buttons */}
            {value.length > 1 && (
              <>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 p-1 text-white shadow-sm hover:bg-black/80 transition-colors"
                    title={moveLeftLabel}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                )}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    className="absolute bottom-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white shadow-sm hover:bg-black/80 transition-colors"
                    title={moveRightLabel}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}

            <Image
              fill
              className="object-cover pointer-events-none"
              alt={`Image ${index + 1}`}
              src={url}
              sizes="200px"
            />
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset={
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'car_dealership'
        }
        onSuccess={onUpload}
        options={{
          multiple: true,
          maxFiles: 10,
          sources: ['local', 'url', 'camera'],
          ...(folder ? { folder } : {}),
        }}
      >
        {({ open }) => (
          <Button type="button" variant="secondary" onClick={() => open()}>
            <ImagePlus className="mr-2 h-4 w-4" />
            {uploadLabel}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
