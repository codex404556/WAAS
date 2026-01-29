/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { categorySchema } from "@/lib/validation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id?: number;
  _id?: string;
  name: string;
  title?: string;
  imageId?: number | string;
  imageUrl?: string;
  categoryType: "Featured" | "Hot Categories" | "Top Categories";
  createdAt: string;
};

type FormData = z.infer<typeof categorySchema>;

const getDocId = (doc?: { id?: number | string; _id?: string }) =>
  doc?.id ?? doc?._id;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const buildCategoryPayload = (
  name: string,
  categoryType: Category["categoryType"],
  imageId?: number | string | null
) => {
  const payload: {
    title: string;
    slug: string;
    categoryType: Category["categoryType"];
    image?: number | string | null;
  } = {
    title: name,
    slug: toSlug(name),
    categoryType,
  };

  if (imageId !== undefined) {
    payload.image = imageId;
  }

  return payload;
};

const dataUrlToFile = (dataUrl: string, filename: string) => {
  const [meta, base64] = dataUrl.split(",");
  const match = meta.match(/data:(.*);base64/);
  const mime = match ? match[1] : "application/octet-stream";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new File([buffer], filename, { type: mime });
};

const uploadCategoryImage = async (dataUrl: string, name: string) => {
  const formData = new FormData();
  const safeName = toSlug(name) || "category";
  const file = dataUrlToFile(dataUrl, `${safeName}.png`);
  formData.append("file", file);
  formData.append("alt", name);

  const res = await fetch("/api/media", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    const suffix = text ? ` - ${text}` : "";
    throw new Error(
      `Media upload failed: ${res.status} ${res.statusText}${suffix}`
    );
  }

  const data = (await res.json()) as { doc?: { id?: number; _id?: string } };
  const mediaId = data?.doc?.id ?? data?.doc?._id;
  if (!mediaId) {
    throw new Error("Media upload failed: missing media id");
  }

  return mediaId;
};
const buildCategoriesQuery = (
  page: number,
  perPage: number,
  sortOrder: "asc" | "desc"
) => {
  const sort = sortOrder === "asc" ? "createdAt" : "-createdAt";
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(perPage),
    sort,
    depth: "1",
  });

  return searchParams.toString();
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage] = useState(10); // Default perPage = 10
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default to ascending
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCategoryImageId, setSelectedCategoryImageId] = useState<
    number | string | null
  >(null);

  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const query = buildCategoriesQuery(page, perPage, sortOrder);
      const response = await payloadFetch<{
        docs?: Array<
          Category & {
            title?: string;
            image?: { id?: number; _id?: string; url?: string } | string | null;
          }
        >;
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/categories?${query}`);
      const docs = response.docs || [];
      const normalized = docs.map((doc) => ({
        ...doc,
        name: doc.title ?? doc.name,
        imageId:
          typeof doc.image === "object" && doc.image
            ? getDocId(doc.image)
            : typeof doc.image === "string"
              ? doc.image
              : undefined,
        imageUrl:
          typeof doc.image === "object" && doc.image ? doc.image.url : undefined,
      }));
      setCategories(normalized);
      setTotal(response.totalDocs || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.log("Failed to load categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const query = buildCategoriesQuery(page, perPage, sortOrder);
      const response = await payloadFetch<{
        docs?: Array<
          Category & {
            title?: string;
            image?: { id?: number; _id?: string; url?: string } | string | null;
          }
        >;
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/categories?${query}`);
      const docs = response.docs || [];
      const normalized = docs.map((doc) => ({
        ...doc,
        name: doc.title ?? doc.name,
        imageId:
          typeof doc.image === "object" && doc.image
            ? getDocId(doc.image)
            : typeof doc.image === "string"
              ? doc.image
              : undefined,
        imageUrl:
          typeof doc.image === "object" && doc.image ? doc.image.url : undefined,
      }));
      setCategories(normalized);
      setTotal(response.totalDocs || 0);
      setTotalPages(response.totalPages || 1);
      toast.success("Categories refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh categories", error);
      toast.error("Failed to refresh categories");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, sortOrder]); // Re-fetch when page or sortOrder changes

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setSelectedCategoryImageId(category.imageId ?? null);
    formEdit.reset({
      name: category.name,
      image: category.imageUrl || "",
      categoryType: category.categoryType,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleAddCategory = async (data: FormData) => {
    setFormLoading(true);
    try {
      let imageId: number | string | null | undefined;
      if (data.image?.startsWith("data:")) {
        imageId = await uploadCategoryImage(data.image, data.name);
      }

      const payload = buildCategoryPayload(
        data.name,
        data.categoryType,
        imageId
      );
      await payloadFetch("/api/categories", {
        method: "POST",
        body: payload,
      });
      toast.success("Category created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1); // Reset to page 1 after adding
      fetchCategories();
    } catch (error: unknown) {
      console.log("Failed to create category", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      if (errorMessage.toLowerCase().includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (data: FormData) => {
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      const categoryId = getDocId(selectedCategory);
      if (!categoryId) {
        toast.error("Missing category id");
        return;
      }

      let imageId: number | string | null | undefined;
      if (!data.image) {
        imageId = null;
      } else if (data.image.startsWith("data:")) {
        imageId = await uploadCategoryImage(data.image, data.name);
      } else if (selectedCategoryImageId) {
        imageId = selectedCategoryImageId;
      }

      const payload = buildCategoryPayload(
        data.name,
        data.categoryType,
        imageId
      );
      await payloadFetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        body: payload,
      });
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error: unknown) {
      console.log("Failed to update category", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      if (errorMessage.toLowerCase().includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      const categoryId = getDocId(selectedCategory);
      if (!categoryId) {
        toast.error("Missing category id");
        return;
      }

      await payloadFetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setPage(1); // Reset to page 1 after deleting
      fetchCategories();
    } catch (error) {
      console.log("Failed to delete category", error);
      toast.error("Failed to delete category");
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

  const handleSortChange = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    setPage(1); // Reset to page 1 when sort order changes
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="asc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Ascending
                </span>
              </SelectItem>
              <SelectItem value="desc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Descending
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={getDocId(category) ?? category.name}>
                    <TableCell>
                      {category.imageUrl ? (
                        <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.categoryType}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, total)} of {total} categories
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
            </div>
          )}
        </>
      )}

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddCategory)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
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
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateCategory)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category{" "}
              <span className="font-semibold">{selectedCategory?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
