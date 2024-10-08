import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactElement } from "react";

export function SkeletonCard(): ReactElement {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="mb-2 h-8 w-3/6" />
        <div className="flex flex-col">
          <div>
            <Skeleton className="mb-2 h-4 w-2/5" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-2/5" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
          </div>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
