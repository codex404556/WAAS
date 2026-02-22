import Container from "@/components/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import ProductsCard from "@/components/ProductsCard";
import { Button } from "@/components/ui/button";
import { getDealProducts } from "@/lib/cms";
import { Product } from "@/types/cms";
import {
  GitCompareArrows,
  Headset,
  Search,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

type DealPageSearchParams = {
  q?: string;
  limit?: string;
};

const DEFAULT_VISIBLE_PRODUCTS = 15;
const PRODUCTS_PAGE_STEP = 10;
const SHOW_ONLY_IN_STOCK = true;

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

const parseLimit = (value?: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_VISIBLE_PRODUCTS;
  return Math.max(DEFAULT_VISIBLE_PRODUCTS, parsed);
};

const buildDealUrl = (params: { q?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.limit && params.limit > DEFAULT_VISIBLE_PRODUCTS) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `/deal?${query}` : "/deal";
};

const getDiscountPercent = (product: Product): number => {
  const price = product.price;
  const oldPrice = product.oldPrice;

  if (
    typeof price !== "number" ||
    typeof oldPrice !== "number" ||
    oldPrice <= 0 ||
    oldPrice <= price
  ) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const isDealProduct = (product: Product): boolean => {
  const hasValidDiscount =
    typeof product.price === "number" &&
    typeof product.oldPrice === "number" &&
    product.oldPrice > product.price;

  return product.status === "hot" && hasValidDiscount;
};

const isSearchMatch = (product: Product, query: string): boolean => {
  const normalized = query.toLowerCase();
  const name = product.name?.toLowerCase() ?? "";
  const brand = product.brand?.title?.toLowerCase() ?? product.brand?.brandName?.toLowerCase() ?? "";
  return name.includes(normalized) || brand.includes(normalized);
};

const sortDealProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const discountDiff = getDiscountPercent(b) - getDiscountPercent(a);
    if (discountDiff !== 0) return discountDiff;
    return (b.price ?? 0) - (a.price ?? 0);
  });
};

const DealPage = async ({
  searchParams,
}: {
  searchParams: Promise<DealPageSearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const requestedLimit = parseLimit(resolvedSearchParams.limit);

  const products = await getDealProducts();

  const eligibleDeals = sortDealProducts(
    products
      .filter(isDealProduct)
      .filter((product) =>
        SHOW_ONLY_IN_STOCK ? (product.stock ?? 0) > 0 : true
      )
  );

  const filteredDeals = query
    ? eligibleDeals.filter((product) => isSearchMatch(product, query))
    : eligibleDeals;

  const visibleDeals = filteredDeals.slice(0, requestedLimit);
  const hasMore = visibleDeals.length < filteredDeals.length;

  return (
    <div className="min-h-screen bg-neutral-50 mt-10">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="h-6 w-6" />
              <span className="text-sm uppercase tracking-wide opacity-90">
                Special Offers
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Amazing Deals & Offers
            </h1>
            <p className="text-lg opacity-90">
              Products shown here are the ones marked as deal products in admin.
            </p>
          </div>
        </Container>
      </div>

      <div className="border-b border-border bg-white">
        <Container className="py-4">
          <PageBreadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Deals" }]}
            currentPage="Deals"
          />
          <div className="mt-2 flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Active Deals: </span>
              <span className="font-semibold text-amber-600">
                {filteredDeals.length}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="text-muted-foreground">Products on Sale: </span>
              <span className="font-semibold text-amber-600">
                {eligibleDeals.length}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <div className="border-b border-border bg-white">
        <Container className="py-4">
          <form method="GET" action="/deal" className="flex items-center gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search deal products..."
                className="w-full rounded-lg border border-border bg-input-background py-2 pl-10 pr-4 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <Button type="submit">Search</Button>
            {query ? (
              <Button type="button" variant="outline" asChild>
                <Link href="/deal">Clear</Link>
              </Button>
            ) : null}
          </form>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        {visibleDeals.length === 0 ? (
          <div className="py-16 text-center md:py-24">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">No deal products found</h2>
            <p className="mb-6 text-muted-foreground">
              We could not find any deal product matching &quot;{query}&quot;
            </p>
            <Button asChild>
              <Link href="/deal">Clear search</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white p-4 md:p-6">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
              {visibleDeals.map((product) => (
                <ProductsCard key={product._id} product={product} />
              ))}
            </div>

            {hasMore ? (
              <div className="border-t border-border p-8 text-center">
                <Button asChild>
                  <Link
                    href={buildDealUrl({
                      q: query,
                      limit: requestedLimit + PRODUCTS_PAGE_STEP,
                    })}
                  >
                    See More Deals
                  </Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  Showing {visibleDeals.length} of {filteredDeals.length} deal products
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Container>

      <div className="border-t border-border bg-white">
        <Container className="py-8 md:py-12">
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
        </Container>
      </div>
    </div>
  );
};

export default DealPage;
