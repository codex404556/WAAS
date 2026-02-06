const CheckoutSkeleton = () => {
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                    <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="h-6 w-44 bg-gray-200 animate-pulse rounded mb-6" />
            <div className="space-y-4">
              <div className="h-14 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
              <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
