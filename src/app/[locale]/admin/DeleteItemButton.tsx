'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteItemButtonProps {
  itemId: string;
  itemName: string;
  /** API endpoint for deletion (e.g. "/api/events") */
  apiBasePath?: string;
  translations: {
    deleteTitle: string;
    deleteDescription: string;
    deleteConfirm: string;
    cancel: string;
    delete: string;
    deleteFailed: string;
  };
}

export default function DeleteItemButton({
  itemId,
  itemName,
  apiBasePath = '/api/events',
  translations: t,
}: DeleteItemButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(t.deleteFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.deleteTitle}</DialogTitle>
          <DialogDescription>
            {t.deleteDescription} <strong>{itemName}</strong>? {t.deleteConfirm}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
