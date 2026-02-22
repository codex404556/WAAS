import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

const ProductLoadingPage = () => {
  return (
    <div className="mt-22 sm:mt-24">
      <Container className="px-3 sm:px-4 lg:px-6">
        <Skeleton className="mb-6 h-5 w-56" />
      </Container>

      <Container className="flex flex-col gap-8 px-3 sm:px-4 lg:flex-row lg:gap-10 lg:px-6 xl:gap-12">
        <div className="w-full lg:w-1/2">
          <Skeleton className="h-[500px] w-full rounded-md" />
          <div className="mt-5 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`thumb-skeleton-${index}`} className="h-24 w-full rounded-md" />
            ))}
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-10 w-11/12" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-16 w-3/4" />

          <div className="flex items-center gap-3">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />

          <div className="space-y-2 pt-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </Container>

      <Container className="px-3 sm:px-4 lg:px-6">
        <div className="mt-10 w-full rounded-b-md border border-gray-200 bg-white p-4 sm:p-6">
          <Skeleton className="mb-4 h-6 w-44" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </Container>

      <Container className="px-3 sm:px-4 lg:px-6">
        <section className="pb-10 pt-8 sm:pt-10">
          <Skeleton className="mb-5 h-6 w-44" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`related-skeleton-${index}`} className="aspect-[3/4] w-full rounded-md" />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default ProductLoadingPage;
