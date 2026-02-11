import Container from "@/components/common/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-babyshopLightBg px-4 py-8 sm:px-6 lg:px-8">
      <Container className="max-w-7xl space-y-6">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <Skeleton className="h-11 w-full" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-52" />
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePageSkeleton;
