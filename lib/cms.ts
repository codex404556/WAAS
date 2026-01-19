import type {
  Address,
  Blog,
  Brand,
  Category,
  Product,
} from "@/types/cms";

export type SearchItem = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  brand: string;
  categories: string[];
};

export type ProductInfo = {
  description: string;
  additionalInformation: string;
};

export type ProductReview = {
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage?: { url?: string; asset?: { url?: string } };
};

export const getCategories = async (quantity?: number): Promise<Category[]> => {
  if (quantity === undefined) {
    return [];
  }
  return [];
};

export const getAllBrands = async (): Promise<Brand[]> => {
  return [];
};

export const getLatestBlog = async (): Promise<Blog[]> => {
  return [];
};

export const getDealProducts = async (): Promise<Product[]> => {
  return [];
};

export const getProductBySlug = async (
  _slug: string
): Promise<Product | null> => {
  return null;
};

export const getBrand = async (_slug: string): Promise<string | null> => {
  return null;
};

export const getProductInfo = async (
  _slug: string
): Promise<ProductInfo | null> => {
  return {
    description: "",
    additionalInformation: "",
  };
};

export const getProductReview = async (
  _slug: string
): Promise<ProductReview[]> => {
  return [];
};

export const searchProducts = async (
  _term: string
): Promise<SearchItem[]> => {
  return [];
};

export const listProductsByFilters = async (_filters: {
  selectedCategory?: string | null;
  selectedBrand?: string | null;
  minPrice: number;
  maxPrice: number;
  searchTerm: string;
}): Promise<Product[]> => {
  return [];
};

export const listProductsByVariant = async (
  _variant: string
): Promise<Product[]> => {
  return [];
};

export const listProductsByCategory = async (
  _categorySlug: string
): Promise<Product[]> => {
  return [];
};

export const listAddresses = async (): Promise<Address[]> => {
  return [];
};
