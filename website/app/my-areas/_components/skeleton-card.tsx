import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactElement } from "react";

export function SkeletonCard(): ReactElement {
  return (
    <Card className="relative cursor-pointer transition-all hover:shadow-lg">
      <div className="absolute left-6 top-6 flex gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <CardHeader className="pt-14">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardFooter className="flex justify-end">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}
