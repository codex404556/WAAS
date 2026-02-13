import Container from "@/components/Container";
import ProductsCard from "@/components/ProductsCard";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/text";
import { getAllBrands, listProductsByFilters } from "@/lib/cms";
import { urlFor } from "@/lib/image";
import { Brand, Product } from "@/types/cms";
import {
  ChevronRight,
  GitCompareArrows,
  Headset,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type BrandPageSearchParams = {
  q?: string;
  sort?: "az" | "za";
  limit?: string;
};

type NormalizedBrand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

type BrandSection = {
  brand: NormalizedBrand;
  products: Product[];
};

const PAGE_STEP = 6;
const DEFAULT_LIMIT = 6;
const PRODUCTS_PER_BRAND = 3;
const SHOW_ONLY_IN_STOCK = true;

type SectionProductSort = "featured" | "price-low" | "price-high" | "name-az";
const SECTION_PRODUCT_SORT: SectionProductSort = "featured";

const TRUST_BADGES = [
  {
    title: "Free Delivery",
    description: "Free shipping over $100",
    icon: Truck,
  },
  {
    title: "Free Return",
    description: "Free return over $100",
    icon: GitCompareArrows,
  },
  {
    title: "Customer Support",
    description: "Friendly 7/24 customer support",
    icon: Headset,
  },
  {
    title: "Money Back",
    description: "Quality checked by our team",
    icon: ShieldCheck,
  },
];

const normalizeBrand = (brand: Brand): NormalizedBrand | null => {
  const slug = brand.slug?.current?.trim();
  const name = (brand.title ?? brand.brandName ?? "").trim();

  if (!slug || !name) return null;

  return {
    id: brand._id,
    name,
    slug,
    imageUrl: urlFor(brand.image).url(),
  };
};

const parseLimit = (value?: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.max(DEFAULT_LIMIT, parsed);
};

const sortSectionProducts = (
  products: Product[],
  sort: SectionProductSort
): Product[] => {
  const copied = [...products];

  switch (sort) {
    case "price-low":
      return copied.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    case "price-high":
      return copied.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "name-az":
      return copied.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "featured":
    default:
      return copied.sort((a, b) => {
        const aInStock = (a.stock ?? 0) > 0 ? 1 : 0;
        const bInStock = (b.stock ?? 0) > 0 ? 1 : 0;
        if (aInStock !== bInStock) return bInStock - aInStock;
        return (b.discount ?? 0) - (a.discount ?? 0);
      });
  }
};

const getSectionProducts = (products: Product[]): Product[] => {
  const filtered = SHOW_ONLY_IN_STOCK
    ? products.filter((product) => (product.stock ?? 0) > 0)
    : products;

  return sortSectionProducts(filtered, SECTION_PRODUCT_SORT);
};

const sortBrandSections = (
  sections: BrandSection[],
  sort: BrandPageSearchParams["sort"]
): BrandSection[] => {
  const copied = [...sections];
  copied.sort((a, b) => a.brand.name.localeCompare(b.brand.name));
  if (sort === "za") copied.reverse();
  return copied;
};

const buildBrandUrl = (params: {
  q?: string;
  sort?: "az" | "za";
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.sort && params.sort !== "az") searchParams.set("sort", params.sort);
  if (params.limit && params.limit > DEFAULT_LIMIT) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `/brand?${query}` : "/brand";
};

const BrandPage = async ({
  searchParams,
}: {
  searchParams: Promise<BrandPageSearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const sort = resolvedSearchParams.sort === "za" ? "za" : "az";
  const requestedLimit = parseLimit(resolvedSearchParams.limit);

  const [allBrands, allProducts] = await Promise.all([
    getAllBrands(),
    listProductsByFilters({
      selectedCategory: null,
      selectedBrand: null,
      minPrice: 0,
      maxPrice: 999999,
      searchTerm: "",
    }),
  ]);

  const brandBySlug = new Map<string, NormalizedBrand>();
  for (const brand of allBrands) {
    const normalized = normalizeBrand(brand);
    if (normalized) {
      brandBySlug.set(normalized.slug.toLowerCase(), normalized);
    }
  }

  const productsByBrandSlug = new Map<string, Product[]>();

  for (const product of allProducts) {
    const brandSlug = product.brand?.slug?.current?.trim().toLowerCase();
    if (!brandSlug || !brandBySlug.has(brandSlug)) continue;

    const current = productsByBrandSlug.get(brandSlug) ?? [];
    current.push(product);
    productsByBrandSlug.set(brandSlug, current);
  }

  const sections: BrandSection[] = [];
  for (const [slug, brand] of brandBySlug.entries()) {
    const products = getSectionProducts(productsByBrandSlug.get(slug) ?? []);
    if (products.length === 0) continue;

    sections.push({
      brand,
      products,
    });
  }

  const filteredSections = sortBrandSections(
    sections.filter((section) =>
      section.brand.name.toLowerCase().includes(query.toLowerCase())
    ),
    sort
  );

  const visibleSections = filteredSections.slice(0, requestedLimit);
  const hasMore = visibleSections.length < filteredSections.length;
  const nextLimit = requestedLimit + PAGE_STEP;

  return (
    <div className="min-h-screen bg-neutral-50 pb-14 pt-16">
      <Container>
        <PageBreadcrumb items={[{ label: "Brand" }]} currentPage="All Brands" />

        <div className="mb-6 rounded-2xl border border-shop_light_yellow/30 bg-white p-4 shadow-sm sm:p-6">
          <Title className="text-darkColor">Shop By Brands</Title>
          <p className="mt-2 text-sm text-lightColor">
            Discover and shop from your favorite brands.
          </p>
        </div>

        <form
          method="GET"
          action="/brand"
          className="mb-6 rounded-2xl border border-shop_light_yellow/30 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-lightColor">
              {filteredSections.length} {filteredSections.length === 1 ? "brand" : "brands"}
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor/70" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search brand..."
                  className="h-10 w-full rounded-lg border border-shop_light_yellow/40 bg-white pl-10 pr-3 text-sm text-darkColor outline-none ring-0 transition focus:border-shop_dark_yellow"
                />
              </div>

              <select
                name="sort"
                defaultValue={sort}
                className="h-10 rounded-lg border border-shop_light_yellow/40 bg-white px-3 text-sm text-darkColor outline-none transition focus:border-shop_dark_yellow"
              >
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
              </select>

              <Button type="submit" className="h-10">
                Apply
              </Button>

              {query ? (
                <Button type="button" variant="outline" asChild className="h-10">
                  <Link href={buildBrandUrl({ sort })}>Clear</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </form>

        {visibleSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-shop_light_yellow/40 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-shop_light_bg">
              <Search className="h-6 w-6 text-shop_dark_yellow" />
            </div>
            <h2 className="text-xl font-semibold text-darkColor">No brands found</h2>
            <p className="mt-2 text-sm text-lightColor">
              We could not find any brand matching &quot;{query}&quot;.
            </p>
            <Button asChild className="mt-6">
              <Link href="/brand">Clear search</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <section
                key={section.brand.id}
                className="rounded-2xl border border-shop_light_yellow/30 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-shop_light_yellow/30 bg-shop_light_bg p-2">
                      {section.brand.imageUrl !== "/placeholder.svg" ? (
                        <Image
                          src={section.brand.imageUrl}
                          alt={section.brand.name}
                          width={56}
                          height={56}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <Package className="h-7 w-7 text-lightColor/60" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-darkColor">
                        {section.brand.name}
                      </h2>
                      <p className="text-base text-lightColor">
                        {section.products.length} {section.products.length === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" asChild className="h-11 px-6 text-base">
                    <Link href={{ pathname: "/shop", query: { brand: section.brand.slug } }}>
                      View All <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.products.slice(0, PRODUCTS_PER_BRAND).map((product) => (
                    <ProductsCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            ))}

            {hasMore ? (
              <div className="rounded-2xl border border-shop_light_yellow/30 bg-white p-5 text-center shadow-sm">
                <Button asChild>
                  <Link
                    href={buildBrandUrl({
                      q: query,
                      sort,
                      limit: nextLimit,
                    })}
                  >
                    See More Brands
                  </Link>
                </Button>
                <p className="mt-2 text-sm text-lightColor">
                  Showing {visibleSections.length} of {filteredSections.length} brands
                </p>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-shop_light_yellow/30 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon;

              return (
                <div
                  key={badge.title}
                  className="flex items-center gap-3 rounded-lg border border-shop_light_yellow/20 bg-shop_light_bg p-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-shop_dark_yellow">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-darkColor">{badge.title}</p>
                    <p className="text-xs text-lightColor">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BrandPage;
