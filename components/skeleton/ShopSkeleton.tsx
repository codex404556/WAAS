import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

const ShopSkeleton = () => {
  return (
    <div className="border-t">
      <Container>
        <div className="sticky top-0 z-10 mb-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-5 border-t border-t-shop_dark_yellow">
          <div className="md:sticky md:top-20 md:self-start md:h-[calc(100vh-160px)] md:overflow-y-auto md:min-w-64 pb-5 md:border-r border-r-shop_light_yellow scrollbar-hide space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-40" />
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-28" />
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-36" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-56 w-full rounded-md" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ShopSkeleton;
