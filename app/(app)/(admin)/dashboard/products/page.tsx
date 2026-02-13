"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import { payloadFetch } from "@/lib/payload-client";
import { Button } from "@/components/ui/button";
import { productType } from "@/constants/data";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import ProductSkeleton from "@/app/(app)/(admin)/skeleton/ProductSkeleton";
import Image from "next/image";

type Product = {
  id?: number;
  _id?: string;
  name: string;
  description: string;
  additionalInformation?: string;
  keyFeatures?: Array<{ title: string }>;
  specifications?: Array<{ name: string; title: string }>;
  price: number;
  oldPrice?: number;
  stock: number;
  averageRating: number;
  status?: "new" | "hot" | "sale" | null;
  variant?: string;
  image?: string;
  imageId?: number | string;
  imageUrl?: string;
  imageIds?: Array<number | string>;
  imageUrls?: string[];
  images?: Array<
    { id?: number; _id?: string; url?: string } | number | string
  >;
  category: {
    id?: number;
    _id?: string;
    name?: string;
    title?: string;
  };
  brand: {
    id?: number;
    _id?: string;
    name: string;
  };
  createdAt: string;
};

type Category = {
  id?: number;
  _id?: string;
  name?: string;
  title?: string;
};

type Brand = {
  id?: number;
  _id?: string;
  name?: string;
  title?: string;
};

type FormData = z.input<typeof productSchema>;

const getDocId = (doc?: { id?: number | string; _id?: string }) =>
  doc?.id ?? doc?._id;

const getDocIdString = (doc?: { id?: number | string; _id?: string }) => {
  const id = getDocId(doc);
  return id === undefined || id === null ? "" : String(id);
};

const parseRelationId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const asNumber = Number(trimmed);
  return Number.isNaN(asNumber) ? trimmed : asNumber;
};

const normalizeVariant = (value?: string) =>
  value && value !== "none" ? value : undefined;

const normalizeKeyFeatures = (features?: Array<{ title: string }>) =>
  (features || [])
    .map((feature) => feature.title.trim())
    .filter((title) => title.length > 0)
    .map((title) => ({ title }));

const normalizeSpecifications = (
  specifications?: Array<{ name: string; title: string }>
) =>
  (specifications || [])
    .map((item) => ({
      name: item.name.trim(),
      title: item.title.trim(),
    }))
    .filter((item) => item.name.length > 0 && item.title.length > 0);

const getBrandLabel = (brand: Brand) => brand.title ?? brand.name ?? "";

const getCategoryLabel = (category: Category) =>
  category.title ?? category.name ?? "";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

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

const uploadProductImage = async (dataUrl: string, name: string) => {
  const formData = new FormData();
  const safeName = toSlug(name) || "product";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const file = dataUrlToFile(dataUrl, `${safeName}-${uniqueSuffix}.png`);
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

const buildProductsQuery = (
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showOldPriceAdd, setShowOldPriceAdd] = useState(false);
  const [showOldPriceEdit, setShowOldPriceEdit] = useState(false);
  const [showDealAdd, setShowDealAdd] = useState(false);
  const [showDealEdit, setShowDealEdit] = useState(false);
  const [selectedProductImageIds, setSelectedProductImageIds] = useState<
    Array<number | string>
  >([]);

  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      additionalInformation: "",
      price: 0,
      oldPrice: 0,
      stock: 10,
      category: "",
      brand: "",
      variant: "",
      keyFeatures: [],
      specifications: [],
      images: [],
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      additionalInformation: "",
      price: 0,
      oldPrice: 0,
      stock: 0,
      category: "",
      brand: "",
      variant: "",
      keyFeatures: [],
      specifications: [],
      images: [],
    },
  });

  const {
    fields: addKeyFeatureFields,
    append: appendAddKeyFeature,
    remove: removeAddKeyFeature,
  } = useFieldArray({
    control: formAdd.control,
    name: "keyFeatures",
  });

  const {
    fields: editKeyFeatureFields,
    append: appendEditKeyFeature,
    remove: removeEditKeyFeature,
  } = useFieldArray({
    control: formEdit.control,
    name: "keyFeatures",
  });

  const {
    fields: addSpecificationFields,
    append: appendAddSpecification,
    remove: removeAddSpecification,
  } = useFieldArray({
    control: formAdd.control,
    name: "specifications",
  });

  const {
    fields: editSpecificationFields,
    append: appendEditSpecification,
    remove: removeEditSpecification,
  } = useFieldArray({
    control: formEdit.control,
    name: "specifications",
  });

  const fetchProducts = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const query = buildProductsQuery(currentPage, perPage, sortOrder);
      const response = await payloadFetch<{
        docs?: Product[];
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/products?${query}`);
      const docs = response.docs || [];
      const normalized = docs.map((doc) => {
        const images = Array.isArray(doc.images) ? doc.images : [];
        const imageIds = images
          .map((image) =>
            typeof image === "object" && image
              ? getDocId(image)
              : image
          )
          .filter((id): id is number | string => id !== undefined);
        const imageUrls = images
          .map((image) =>
            typeof image === "object" && image ? image.url : undefined
          )
          .filter((url): url is string => Boolean(url));
        const firstImage = images[0];
        const imageId =
          typeof firstImage === "object" && firstImage
            ? getDocId(firstImage)
            : typeof firstImage === "string" || typeof firstImage === "number"
              ? firstImage
              : undefined;
        const imageUrl =
          typeof firstImage === "object" && firstImage
            ? firstImage.url
            : undefined;

        return {
          ...doc,
          imageId,
          imageUrl,
          imageIds,
          imageUrls,
        };
      });
      setProducts(normalized);
      setTotal(response.totalDocs || 0);
      setTotalPages(
        response.totalPages || Math.ceil((response.totalDocs || 0) / perPage)
      );

      // Debug logging
      console.log("Pagination Debug:", {
        total: response.totalDocs,
        totalPages: response.totalPages,
        calculatedPages: Math.ceil((response.totalDocs || 0) / perPage),
        currentPage: currentPage,
        perPage,
      });

      // If we reset the page, update the page state
      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.log("Failed to load products", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const query = buildProductsQuery(page, perPage, sortOrder);
      const response = await payloadFetch<{
        docs?: Product[];
        totalDocs?: number;
        totalPages?: number;
      }>(`/api/products?${query}`);
      setProducts(response.docs || []);
      setTotal(response.totalDocs || 0);
      setTotalPages(response.totalPages || 1);
      toast.success("Products refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh products", error);
      toast.error("Failed to refresh products");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await payloadFetch<{ docs?: Category[] }>(
        "/api/categories?limit=100&sort=title&depth=0"
      );
      const docs = response.docs || [];
      const normalized = docs.map((category) => ({
        ...category,
        name: getCategoryLabel(category),
      }));
      setCategories(normalized);
    } catch (error) {
      console.log("Failed to load categories", error);
      toast.error("Failed to load categories");
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await payloadFetch<{ docs?: Brand[] }>(
        "/api/brands?limit=100&sort=title&depth=0"
      );
      const docs = response.docs || [];
      const normalized = docs.map((brand) => ({
        ...brand,
        name: getBrandLabel(brand),
      }));
      setBrands(normalized);
    } catch (error) {
      console.log("Failed to load brands", error);
      toast.error("Failed to load brands");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setSelectedProductImageIds(product.imageIds ?? []);
    formEdit.reset({
      name: product.name,
      description: product.description,
      additionalInformation: product.additionalInformation ?? "",
      price: product.price,
      oldPrice: product.oldPrice ?? 0,
      stock: product.stock,
      category: getDocIdString(product.category),
      brand: getDocIdString(product.brand),
      variant: product.variant ?? "",
      keyFeatures: normalizeKeyFeatures(product.keyFeatures),
      specifications: normalizeSpecifications(product.specifications),
      images: product.imageUrls ?? [],
    });
    const hasOldPrice = Number(product.oldPrice) > 0;
    setShowOldPriceEdit(hasOldPrice);
    setShowDealEdit(hasOldPrice && product.status === "hot");
    if (!hasOldPrice) {
      formEdit.setValue("oldPrice", 0);
      setShowDealEdit(false);
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = async (data: FormData) => {
    setFormLoading(true);
    try {
      const imageIds = await Promise.all(
        (data.images || []).map((image) =>
          image.startsWith("data:")
            ? uploadProductImage(image, data.name)
            : Promise.resolve(parseRelationId(image))
        )
      );

      const nextStatus =
        showOldPriceAdd && showDealAdd ? "hot" : undefined;

      await payloadFetch("/api/products", {
        method: "POST",
        body: {
        ...data,
        price: Number(data.price),
        oldPrice: showOldPriceAdd ? Number(data.oldPrice) : 0,
        stock: Number(data.stock),
        category: parseRelationId(data.category),
        brand: parseRelationId(data.brand),
        status: nextStatus,
        variant: normalizeVariant(data.variant),
        keyFeatures: normalizeKeyFeatures(data.keyFeatures),
        specifications: normalizeSpecifications(data.specifications),
        images: imageIds.length ? imageIds : undefined,
        },
      });
      toast.success("Product created successfully");
      formAdd.reset();
      setShowOldPriceAdd(false);
      setShowDealAdd(false);
      setIsAddModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error: unknown) {
      console.log("Failed to create product", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create product";
      if (errorMessage.toLowerCase().includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: FormData) => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      const productId = getDocId(selectedProduct);
      if (!productId) {
        toast.error("Missing product id");
        return;
      }

      let images: Array<number | string> | null | undefined;
      if (!data.images || data.images.length === 0) {
        images = [];
      } else {
        const urlToId = new Map<string, number | string>();
        (selectedProduct.imageUrls || []).forEach((url, index) => {
          const id = selectedProductImageIds[index];
          if (url && id !== undefined) {
            urlToId.set(url, id);
          }
        });

        images = await Promise.all(
          data.images.map((image) => {
            if (image.startsWith("data:")) {
              return uploadProductImage(image, data.name);
            }
            return Promise.resolve(urlToId.get(image) ?? parseRelationId(image));
          })
        );
      }

      const nextStatus =
        showOldPriceEdit && showDealEdit
          ? "hot"
          : selectedProduct.status === "hot"
            ? null
            : selectedProduct.status;

      await payloadFetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: {
        ...data,
        price: Number(data.price),
        oldPrice: showOldPriceEdit ? Number(data.oldPrice) : 0,
        stock: Number(data.stock),
        category: parseRelationId(data.category),
        brand: parseRelationId(data.brand),
        status: nextStatus,
        variant: normalizeVariant(data.variant),
        keyFeatures: normalizeKeyFeatures(data.keyFeatures),
        specifications: normalizeSpecifications(data.specifications),
        images,
        },
      });
      toast.success("Product updated successfully");
      setIsEditModalOpen(false);
      setShowOldPriceEdit(false);
      setShowDealEdit(false);
      fetchProducts();
    } catch (error: unknown) {
      console.log("Failed to update product", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update product";
      if (errorMessage.toLowerCase().includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const productId = getDocId(selectedProduct);
      if (!productId) {
        toast.error("Missing product id");
        return;
      }

      await payloadFetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error) {
      console.log("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && page * perPage < total) {
      setPage(page + 1);
    }
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1); // Reset to page 1 when sort order changes
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 shadow-sm"
        >
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger
              className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
              aria-label="Sort order"
            >
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
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
            <Button
              onClick={() => {
                setShowOldPriceAdd(false);
                setShowDealAdd(false);
                formAdd.setValue("oldPrice", 0);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </motion.div>
      </motion.div>

      {loading ? (
        <ProductSkeleton isAdmin={isAdmin} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border/50 shadow-sm bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30">
                    <TableHead className="w-20font-semibold">Image</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Old Price</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Brand</TableHead>
                    {isAdmin && (
                      <TableHead className="text-right font-semibold min-w-[100px]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={getDocId(product) ?? product.name}
                      className={`border-b border-border/30 transition-colors hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <TableCell className="py-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shadow-sm border shrink-0">
                          <Image
                            src={
                              product?.imageUrl ??
                              product?.image ??
                              "/placeholder-image.jpg"
                            }
                            alt={product?.name ?? "Product image"}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div
                          className="max-w-[200px] truncate"
                          title={product?.name}
                        >
                          {product?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {Number(product.oldPrice) > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 whitespace-nowrap">
                            ${Number(product.oldPrice).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">
                            {Number.isFinite(product.averageRating)
                              ? product.averageRating.toFixed(1)
                              : "0.0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 whitespace-nowrap max-w-[100px] truncate">
                          {product?.category?.title ?? product?.category?.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 whitespace-nowrap max-w-[100px] truncate">
                          {product?.brand ? getBrandLabel(product.brand) : ""}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 shrink-0"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 shrink-0"
                              title="Delete product"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 9 : 8}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm">
                              Start by adding your first product
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Pagination Controls */}
          {total > perPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card rounded-lg border border-border/50 px-4 py-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * perPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * perPage, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> products
                </div>
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages || page * perPage >= total}
                  className="disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Simple pagination for single page */}
          {total > 0 && total <= perPage && (
            <div className="text-center text-sm text-muted-foreground bg-card rounded-lg border border-border/50 px-4 py-3">
              Showing all <span className="font-medium">{total}</span> products
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddProduct)}
              className="space-y-2"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="additionalInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="m-0">Key Features</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAddKeyFeature({ title: "" })}
                    disabled={formLoading}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                {addKeyFeatureFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Click Add Feature to add product highlights.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {addKeyFeatureFields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <FormField
                          control={formAdd.control}
                          name={`keyFeatures.${index}.title` as const}
                          render={({ field: titleField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...titleField}
                                  placeholder="Feature title"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeAddKeyFeature(index)}
                          disabled={formLoading}
                          aria-label="Remove feature"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="m-0">Specifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendAddSpecification({ name: "", title: "" })
                    }
                    disabled={formLoading}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
                {addSpecificationFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Click Add Specification to add name and title pairs.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {addSpecificationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2"
                      >
                        <FormField
                          control={formAdd.control}
                          name={`specifications.${index}.name` as const}
                          render={({ field: nameField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...nameField}
                                  placeholder="Specification name"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formAdd.control}
                          name={`specifications.${index}.title` as const}
                          render={({ field: titleField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...titleField}
                                  placeholder="Title"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeAddSpecification(index)}
                          disabled={formLoading}
                          aria-label="Remove specification"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="flex items-center gap-3 space-y-0 pt-7">
                  <FormControl>
                    <Switch
                      checked={showOldPriceAdd}
                      onCheckedChange={(checked) => {
                        const next = Boolean(checked);
                        setShowOldPriceAdd(next);
                        if (!next) {
                          formAdd.setValue("oldPrice", 0);
                          setShowDealAdd(false);
                        }
                      }}
                      disabled={formLoading}
                    />
                  </FormControl>
                  <FormLabel className="leading-none">Old price</FormLabel>
                </FormItem>
              </div>
              {showOldPriceAdd && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={formAdd.control}
                    name="oldPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="flex items-center gap-3 space-y-0 pt-7">
                    <FormControl>
                      <Switch
                        checked={showDealAdd}
                        onCheckedChange={(checked) =>
                          setShowDealAdd(Boolean(checked))
                        }
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormLabel className="leading-none">
                      Add to deals page
                    </FormLabel>
                  </FormItem>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={
                                getDocId(category) ?? getCategoryLabel(category)
                              }
                              value={getDocIdString(category)}
                            >
                              {getCategoryLabel(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={getDocId(brand) ?? getBrandLabel(brand)}
                              value={getDocIdString(brand)}
                            >
                              {getBrandLabel(brand)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="variant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {productType.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formAdd.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MultiImageUpload
                        value={field.value ?? []}
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
                    "Create Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateProduct)}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="additionalInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="m-0">Key Features</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendEditKeyFeature({ title: "" })}
                    disabled={formLoading}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                {editKeyFeatureFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Click Add Feature to add product highlights.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editKeyFeatureFields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <FormField
                          control={formEdit.control}
                          name={`keyFeatures.${index}.title` as const}
                          render={({ field: titleField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...titleField}
                                  placeholder="Feature title"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeEditKeyFeature(index)}
                          disabled={formLoading}
                          aria-label="Remove feature"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="m-0">Specifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendEditSpecification({ name: "", title: "" })
                    }
                    disabled={formLoading}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
                {editSpecificationFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Click Add Specification to add name and title pairs.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editSpecificationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2"
                      >
                        <FormField
                          control={formEdit.control}
                          name={`specifications.${index}.name` as const}
                          render={({ field: nameField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...nameField}
                                  placeholder="Specification name"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formEdit.control}
                          name={`specifications.${index}.title` as const}
                          render={({ field: titleField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...titleField}
                                  placeholder="Title"
                                  disabled={formLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeEditSpecification(index)}
                          disabled={formLoading}
                          aria-label="Remove specification"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="flex items-center gap-3 space-y-0 pt-7">
                  <FormControl>
                    <Switch
                      checked={showOldPriceEdit}
                      onCheckedChange={(checked) => {
                        const next = Boolean(checked);
                        setShowOldPriceEdit(next);
                        if (!next) {
                          formEdit.setValue("oldPrice", 0);
                          setShowDealEdit(false);
                        }
                      }}
                      disabled={formLoading}
                    />
                  </FormControl>
                  <FormLabel className="leading-none">Old price</FormLabel>
                </FormItem>
              </div>
              {showOldPriceEdit && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={formEdit.control}
                    name="oldPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="flex items-center gap-3 space-y-0 pt-7">
                    <FormControl>
                      <Switch
                        checked={showDealEdit}
                        onCheckedChange={(checked) =>
                          setShowDealEdit(Boolean(checked))
                        }
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormLabel className="leading-none">
                      Add to deals page
                    </FormLabel>
                  </FormItem>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEdit.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={
                                getDocId(category) ?? getCategoryLabel(category)
                              }
                              value={getDocIdString(category)}
                            >
                              {getCategoryLabel(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={getDocId(brand) ?? getBrandLabel(brand)}
                              value={getDocIdString(brand)}
                            >
                              {getBrandLabel(brand)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEdit.control}
                  name="variant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {productType.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formEdit.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MultiImageUpload
                        value={field.value ?? []}
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
                    "Update Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product{" "}
              <span className="font-semibold">{selectedProduct?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
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
