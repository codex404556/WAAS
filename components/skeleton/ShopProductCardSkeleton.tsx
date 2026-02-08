import { Skeleton } from "@/components/ui/skeleton";

const ShopProductCardSkeleton = () => {
  return (
    <div className="text-sm border border-dark_blue/10 shadow-md rounded-md bg-white overflow-hidden">
      <div className="p-5">
        <Skeleton className="aspect-square w-full rounded-md" />
      </div>
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-3 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ShopProductCardSkeleton;
