import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => {
  return (
    <section className="my-10 px-4 sm:px-6 md:my-16 lg:my-20 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-shop_light_yellow/20 bg-white p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-24 items-center gap-3 rounded-xl border border-shop_light_yellow/20 bg-shop_light_bg p-2.5"
            >
              <Skeleton className="h-18 w-18 shrink-0 rounded-md sm:h-20 sm:w-20" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySkeleton;
