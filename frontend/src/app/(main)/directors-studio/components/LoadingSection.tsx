"use client";

import { Skeleton } from "@/components DONT USE THIS FLODER EVER/ui/skeleton";

export function LoadingSection() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
