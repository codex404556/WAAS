import type {
  Address,
  Brand,
  Category,
  Image,
  Product,
} from "@/types/cms";

type PayloadListResponse<T> = {
  docs: T[];
  totalDocs?: number;
  hasNextPage?: boolean;
  nextPage?: number | null;
};

type PayloadMedia = {
  id: string;
  url?: string | null;
};

type PayloadCategory = {
  id: string;
  title?: string;
  slug?: string;
  image?: PayloadMedia | string | null;
};

type PayloadBrand = {
  id: string;
  title?: string;
  brandName?: string;
  slug?: string;
  image?: PayloadMedia | string | null;
};

type PayloadAddress = {
  id: string;
  user?: { id?: string } | string | null;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  defaulte?: boolean;
};

type PayloadProduct = {
  id: string;
  name?: string;
  slug?: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  stock?: number;
  status?: string;
  variant?: string;
  description?: string;
  additionalInformation?: string;
  keyFeatures?: Array<{ title?: string }>;
  specifications?: Array<{ name?: string; title?: string }>;
  images?: (PayloadMedia | string | null)[];
  category?: PayloadCategory | string | null;
  brand?: PayloadBrand | string | null;
  reviews?: ProductReview[];
};

const getPayloadBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "";

const DEFAULT_REVALIDATE_SECONDS = 300;

type FetchFromPayloadOptions = {
  cache?: RequestCache;
  revalidate?: number;
  signal?: AbortSignal;
};

const fetchFromPayload = async <T>(
  path: string,
  options: FetchFromPayloadOptions = {}
): Promise<T> => {
  const {
    cache = "force-cache",
    revalidate = DEFAULT_REVALIDATE_SECONDS,
    signal,
  } = options;

  const requestInit: RequestInit = { cache, signal };
  if (cache !== "no-store") {
    (
      requestInit as RequestInit & {
        next?: { revalidate: number };
      }
    ).next = { revalidate };
  }

  const res = await fetch(`${getPayloadBaseUrl()}${path}`, requestInit);

  if (!res.ok) {
    throw new Error(`Payload request failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
};

const mapImage = (
  image: PayloadMedia | string | null | undefined
): Image | null => {
  if (!image) return null;
  if (typeof image === "string") return { url: image };
  return { url: image.url ?? undefined };
};

const mapCategory = (
  category: PayloadCategory,
  productCount?: number
): Category => ({
  _id: category.id,
  title: category.title,
  slug: category.slug ? { current: category.slug } : undefined,
  image: category.image ? mapImage(category.image) ?? undefined : undefined,
  productCount,
});

const mapBrand = (brand: PayloadBrand): Brand => ({
  _id: brand.id,
  title: brand.title,
  brandName: brand.brandName,
  slug: brand.slug ? { current: brand.slug } : undefined,
  image: brand.image ? mapImage(brand.image) ?? undefined : undefined,
});

const mapAddress = (address: PayloadAddress): Address => ({
  _id: address.id,
  user: typeof address.user === "string" ? address.user : address.user?.id,
  name: address.name,
  address: address.address,
  city: address.city,
  state: address.state,
  zip: address.zip,
  defaulte: address.defaulte,
});

const mapProduct = (product: PayloadProduct): Product => ({
  _id: product.id,
  name: product.name,
  slug: product.slug ? { current: product.slug } : undefined,
  price: product.price,
  oldPrice: product.oldPrice,
  discount: product.discount,
  stock: product.stock,
  status: product.status,
  variant: product.variant,
  description: product.description,
  additionalInformation: product.additionalInformation,
  keyFeatures:
    product.keyFeatures?.map((item) => ({ title: item.title })) ?? [],
  specifications:
    product.specifications?.map((item) => ({
      name: item.name,
      title: item.title,
    })) ?? [],
  images:
    product.images
      ?.map(mapImage)
      .filter((image): image is Image => Boolean(image)) ?? [],
  categories: product.category
    ? [
        typeof product.category === "string"
          ? product.category
          : mapCategory(product.category),
      ]
    : [],
  brand:
    product.brand && typeof product.brand !== "string"
      ? mapBrand(product.brand)
      : undefined,
  reviews: product.reviews ?? [],
});

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
  const limit = quantity ?? 100;
  const data = await fetchFromPayload<PayloadListResponse<PayloadCategory>>(
    `/api/categories?limit=${limit}`
  );

  const productCountByCategory = new Map<string, number>();
  let page = 1;

  while (true) {
    const productsData = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
      `/api/products?depth=0&limit=200&page=${page}`
    );

    for (const product of productsData.docs) {
      const categoryId =
        typeof product.category === "string"
          ? product.category
          : product.category?.id;

      if (!categoryId) continue;
      productCountByCategory.set(
        categoryId,
        (productCountByCategory.get(categoryId) ?? 0) + 1
      );
    }

    if (!productsData.hasNextPage) {
      break;
    }

    page = productsData.nextPage ?? page + 1;
  }

  return data.docs.map((category) =>
    mapCategory(category, productCountByCategory.get(category.id) ?? 0)
  );
};

export const getAllBrands = async (): Promise<Brand[]> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadBrand>>(
    `/api/brands?limit=100`
  );
  return data.docs.map(mapBrand);
};

export const getDealProducts = async (): Promise<Product[]> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[status][equals]=hot&depth=2&limit=100`
  );
  return data.docs.map(mapProduct);
};

export const getProductBySlug = async (
  _slug: string
): Promise<Product | null> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[slug][equals]=${encodeURIComponent(
      _slug
    )}&depth=2&limit=1`
  );
  const product = data.docs?.[0];
  return product ? mapProduct(product) : null;
};

export const getBrand = async (_slug: string): Promise<string | null> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[slug][equals]=${encodeURIComponent(
      _slug
    )}&depth=2&limit=1`
  );
  const product = data.docs?.[0];
  if (!product || !product.brand || typeof product.brand === "string") {
    return null;
  }
  return product.brand.title ?? product.brand.brandName ?? null;
};

export const getProductInfo = async (
  _slug: string
): Promise<ProductInfo | null> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[slug][equals]=${encodeURIComponent(
      _slug
    )}&depth=1&limit=1`
  );
  const product = data.docs?.[0];
  if (!product) return null;
  return {
    description: product.description ?? "",
    additionalInformation: product.additionalInformation ?? "",
  };
};

export const getProductReview = async (
  _slug: string
): Promise<ProductReview[]> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[slug][equals]=${encodeURIComponent(
      _slug
    )}&depth=1&limit=1`
  );
  const product = data.docs?.[0];
  return product?.reviews ?? [];
};

export const searchProducts = async (
  _term: string,
  signal?: AbortSignal
): Promise<SearchItem[]> => {
  const trimmed = _term.trim();
  if (!trimmed) return [];
  const normalized = trimmed.replace(/\*/g, "%");
  const term = normalized.includes("%") ? normalized : `%${normalized}%`;

  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[name][like]=${encodeURIComponent(
      term
    )}&depth=2&limit=20`,
    { cache: "no-store", signal }
  );

  return data.docs.map((product) => ({
    _id: product.id,
    name: product.name ?? "",
    slug: product.slug ?? "",
    price: product.price ?? 0,
    image: mapImage(product.images?.[0])?.url ?? "",
    brand:
      product.brand && typeof product.brand !== "string"
        ? product.brand.title ?? product.brand.brandName ?? ""
        : "",
    categories: product.category
      ? [
          typeof product.category === "string"
            ? product.category
            : product.category.title ?? product.category.slug ?? "",
        ].filter((value) => value.length > 0)
      : [],
  }));
};

export const listProductsByFilters = async (_filters: {
  selectedCategory?: string | null;
  selectedBrand?: string | null;
  minPrice: number;
  maxPrice: number;
  searchTerm: string;
}): Promise<Product[]> => {
  const params = new URLSearchParams();
  let index = 0;
  const addFilter = (field: string, operator: string, value: string) => {
    params.set(`where[and][${index}][${field}][${operator}]`, value);
    index += 1;
  };

  if (_filters.searchTerm?.trim()) {
    const normalized = _filters.searchTerm.replace(/\*/g, "%");
    const term = normalized.includes("%") ? normalized : `%${normalized}%`;
    addFilter("name", "like", term);
  }

  if (_filters.minPrice >= 0) {
    addFilter("price", "greater_than_equal", String(_filters.minPrice));
  }

  if (_filters.maxPrice > 0) {
    addFilter("price", "less_than_equal", String(_filters.maxPrice));
  }

  const [categoryData, brandData] = await Promise.all([
    _filters.selectedCategory
      ? fetchFromPayload<PayloadListResponse<PayloadCategory>>(
          `/api/categories?where[slug][equals]=${encodeURIComponent(
            _filters.selectedCategory
          )}&limit=1`
        )
      : Promise.resolve(null),
    _filters.selectedBrand
      ? fetchFromPayload<PayloadListResponse<PayloadBrand>>(
          `/api/brands?where[slug][equals]=${encodeURIComponent(
            _filters.selectedBrand
          )}&limit=1`
        )
      : Promise.resolve(null),
  ]);

  const categoryId = categoryData?.docs?.[0]?.id;
  if (categoryId) {
    addFilter("category", "equals", categoryId);
  }

  const brandId = brandData?.docs?.[0]?.id;
  if (brandId) {
    addFilter("brand", "equals", brandId);
  }

  const query = params.toString();
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?depth=2&limit=100${query ? `&${query}` : ""}`
  );
  return data.docs.map(mapProduct);
};

export const listProductsByVariant = async (
  _variant: string
): Promise<Product[]> => {
  const data = await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
    `/api/products?where[variant][equals]=${encodeURIComponent(
      _variant
    )}&depth=2&limit=100`
  );
  return data.docs.map(mapProduct);
};

export const listProductsByCategory = async (
  _categorySlug: string
): Promise<Product[]> => {
  const categoryResult =
    await fetchFromPayload<PayloadListResponse<PayloadCategory>>(
      `/api/categories?where[slug][equals]=${encodeURIComponent(
        _categorySlug
      )}&limit=1`
    );

  const categoryId = categoryResult.docs?.[0]?.id;
  if (!categoryId) return [];

  const productsResult =
    await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
      `/api/products?where[category][equals]=${encodeURIComponent(
        categoryId
      )}&depth=2`
    );

  return productsResult.docs.map(mapProduct);
};

export const listRelatedProductsByCategory = async (
  _categorySlug: string,
  _currentProductId?: string,
  _limit = 4
): Promise<Product[]> => {
  if (!_categorySlug) return [];

  const categoryResult =
    await fetchFromPayload<PayloadListResponse<PayloadCategory>>(
      `/api/categories?where[slug][equals]=${encodeURIComponent(
        _categorySlug
      )}&limit=1`,
      { revalidate: 300 }
    );

  const categoryId = categoryResult.docs?.[0]?.id;
  if (!categoryId) return [];

  const params = new URLSearchParams();
  params.set("depth", "1");
  params.set("limit", String(_limit));
  params.set("where[and][0][category][equals]", categoryId);
  if (_currentProductId) {
    params.set("where[and][1][id][not_equals]", _currentProductId);
  }

  const productsResult =
    await fetchFromPayload<PayloadListResponse<PayloadProduct>>(
      `/api/products?${params.toString()}`,
      { revalidate: 300 }
    );

  return productsResult.docs.map(mapProduct).slice(0, _limit);
};

export const listAddresses = async (): Promise<Address[]> => {
  const res = await fetch("/api/customer-addresses/me", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Address request failed: ${res.status}`);
  }
  const data = (await res.json()) as PayloadListResponse<PayloadAddress>;
  return data.docs.map(mapAddress);
};
