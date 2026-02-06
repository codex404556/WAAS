import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="border border-dark_blue/10 shadow-md rounded-md bg-white overflow-hidden"
          >
            <div className="p-5">
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
            <div className="p-3 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((__, starIndex) => (
                  <Skeleton key={starIndex} className="h-3 w-3 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySkeleton;
