/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reviewSchema } from "@/lib/validation";
import { payloadFetch } from "@/lib/payload-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash,
} from "lucide-react";
import ReviewsSkeleton from "@/app/(app)/(admin)/skeleton/ReviewsSkeleton";

type Review = {
  id?: number;
  _id?: string;
  rating: number;
  comment: string;
  source?: "user" | "admin_seed";
  status?: "pending" | "approved" | "rejected";
  verified?: boolean;
  createdAt: string;
  product?: {
    id?: number;
    _id?: string;
    name?: string;
    title?: string;
  };
  user?: {
    id?: number;
    _id?: string;
    name?: string;
    email?: string;
  };
};

type ProductOption = {
  id?: number;
  _id?: string;
  name?: string;
  title?: string;
};

type FormData = z.infer<typeof reviewSchema>;

const getDocId = (doc?: { id?: number | string; _id?: string }) =>
  doc?.id ?? doc?._id;

const getProductLabel = (product?: ProductOption) =>
  product?.name ?? product?.title ?? "";

const parseRelationId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const asNumber = Number(trimmed);
  return Number.isNaN(asNumber) ? trimmed : asNumber;
};

const buildReviewsQuery = (page: number, perPage: number) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(perPage),
    sort: "-createdAt",
    depth: "1",
  });

  return searchParams.toString();
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formLoading, setFormLoading] = useState(false);

  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product: "",
      rating: 5,
      comment: "",
      source: "admin_seed",
      status: "approved",
      verified: false,
    },
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const query = buildReviewsQuery(page, perPage);
      const response = await payloadFetch<{
        docs?: Review[];
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/reviews?${query}`);
      setReviews(response.docs || []);
      setTotal(response.totalDocs || 0);
      setTotalPages(
        response.totalPages || Math.ceil((response.totalDocs || 0) / perPage)
      );
    } catch (error) {
      console.log("Failed to load reviews", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await payloadFetch<{ docs?: ProductOption[] }>(
        "/api/products?limit=100&sort=name&depth=0"
      );
      setProducts(response.docs || []);
    } catch (error) {
      console.log("Failed to load products", error);
      toast.error("Failed to load products");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const query = buildReviewsQuery(page, perPage);
      const response = await payloadFetch<{
        docs?: Review[];
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/reviews?${query}`);
      setReviews(response.docs || []);
      setTotal(response.totalDocs || 0);
      setTotalPages(response.totalPages || 1);
      toast.success("Reviews refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh reviews", error);
      toast.error("Failed to refresh reviews");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddReview = async (data: FormData) => {
    setFormLoading(true);
    try {
      await payloadFetch("/api/reviews", {
        method: "POST",
        body: {
          product: parseRelationId(data.product),
          rating: Number(data.rating),
          comment: data.comment,
          source: data.source ?? "admin_seed",
          status: data.status ?? "approved",
          verified: Boolean(data.verified),
        },
      });
      toast.success("Review created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchReviews();
    } catch (error) {
      console.log("Failed to create review", error);
      toast.error("Failed to create review");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    try {
      const reviewId = getDocId(selectedReview);
      if (!reviewId) {
        toast.error("Missing review id");
        return;
      }
      await payloadFetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      toast.success("Review deleted successfully");
      setIsDeleteModalOpen(false);
      fetchReviews();
    } catch (error) {
      console.log("Failed to delete review", error);
      toast.error("Failed to delete review");
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Review
            </Button>
          )}
        </motion.div>
      </motion.div>

      {loading ? (
        <ReviewsSkeleton isAdmin={isAdmin} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-md border"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Created At</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={getDocId(review) ?? review.comment}>
                    <TableCell className="font-medium">
                      {getProductLabel(review.product) || "Unknown Product"}
                    </TableCell>
                    <TableCell>{review.rating}</TableCell>
                    <TableCell className="capitalize">
                      {review.source?.replace("_", " ") ?? "user"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {review.status ?? "pending"}
                    </TableCell>
                    <TableCell>{review.verified ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(review)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {reviews.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 6}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No reviews found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>

          {total > perPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, total)} of {total} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Add Review Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>Create a review for a product.</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddReview)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products
                          .filter((product) => Boolean(getDocId(product)))
                          .map((product) => (
                            <SelectItem
                              key={
                                getDocId(product) ?? getProductLabel(product)
                              }
                              value={String(getDocId(product))}
                            >
                              {getProductLabel(product)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="5"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formAdd.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin_seed">Admin Seed</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="verified"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <FormLabel className="leading-none">
                      Verified purchase
                    </FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Review"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
