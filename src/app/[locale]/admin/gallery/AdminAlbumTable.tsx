'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Camera, Search } from 'lucide-react';
import DeleteItemButton from '../DeleteItemButton';

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  images: string[];
  videos: string[];
}

interface AdminAlbumTableTranslations {
  searchPlaceholder: string;
  image: string;
  albumTitle: string;
  photos: string;
  videos: string;
  actions: string;
  deleteAlbumTitle: string;
  deleteDescription: string;
  deleteConfirm: string;
  cancel: string;
  delete: string;
  albumDeleteFailed: string;
}

interface AdminAlbumTableProps {
  albums: Album[];
  locale: string;
  galleryApiBasePath: string;
  translations: AdminAlbumTableTranslations;
}

export default function AdminAlbumTable({
  albums,
  locale,
  galleryApiBasePath,
  translations: t,
}: AdminAlbumTableProps) {
  const [search, setSearch] = useState('');

  const filteredAlbums = useMemo(() => {
    if (!search.trim()) return albums;
    const query = search.toLowerCase().trim();
    return albums.filter(
      (album) =>
        album.title.toLowerCase().includes(query) ||
        (album.description && album.description.toLowerCase().includes(query)),
    );
  }, [albums, search]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">{t.image}</TableHead>
              <TableHead>{t.albumTitle}</TableHead>
              <TableHead>{t.photos}</TableHead>
              <TableHead>{t.videos}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlbums.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {search.trim()
                    ? `No albums matching "${search}"`
                    : 'No albums'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAlbums.map((album) => (
                <TableRow key={album.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted">
                      {album.coverImage || album.images.length > 0 ? (
                        <Image
                          src={album.coverImage || album.images[0]}
                          alt={album.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{album.title}</TableCell>
                  <TableCell>{album.images.length}</TableCell>
                  <TableCell>{album.videos.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/${locale}/admin/gallery/${album.id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteItemButton
                        itemId={album.id}
                        itemName={album.title}
                        apiBasePath={galleryApiBasePath}
                        translations={{
                          deleteTitle: t.deleteAlbumTitle,
                          deleteDescription: t.deleteDescription,
                          deleteConfirm: t.deleteConfirm,
                          cancel: t.cancel,
                          delete: t.delete,
                          deleteFailed: t.albumDeleteFailed,
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
