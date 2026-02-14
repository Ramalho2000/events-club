import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
      </div>
      <div className="space-y-3 w-full max-w-sm px-4">
        <div className="h-3 bg-muted rounded-full animate-pulse" />
        <div className="h-3 bg-muted rounded-full animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
}
