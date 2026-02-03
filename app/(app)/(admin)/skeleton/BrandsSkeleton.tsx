import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BrandsSkeleton = ({ isAdmin }: { isAdmin: boolean }) => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24" />
        {isAdmin && <Skeleton className="h-9 w-32" />}
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/50 bg-muted/30">
            <TableHead className="w-[80px]">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            {isAdmin && (
              <TableHead className="text-right">
                <Skeleton className="h-4 w-16" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="border-b border-border/30">
              <TableCell>
                <Skeleton className="h-12 w-12 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Pagination Skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export default BrandsSkeleton;
