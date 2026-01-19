export type Slug = {
  current: string;
};

export type ImageAsset = {
  url?: string;
};

export type Image = {
  _key?: string;
  _type?: string;
  url?: string;
  asset?: ImageAsset;
};

export type Brand = {
  _id: string;
  title?: string;
  brandName?: string;
  slug?: Slug;
  image?: Image;
};

export type Category = {
  _id: string;
  title?: string;
  slug?: Slug;
  image?: Image;
  productCount?: number;
};

export type Product = {
  _id: string;
  name?: string;
  slug?: Slug;
  price?: number;
  discount?: number;
  stock?: number;
  status?: string;
  variant?: string;
  description?: string;
  images?: Image[];
  categories?: (Category | string | null)[];
  brand?: Brand;
};

export type Address = {
  _id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  defaulte?: boolean;
};

export type Author = {
  name?: string;
  image?: Image;
};

export type Blog = {
  _id: string;
  title?: string;
  slug?: Slug;
  mainImage?: Image;
  publishedAt?: string;
  author?: Author;
};

export type BRANDS_QUERYResult = Brand[];
export type LATEST_BLOG_QUERYResult = Blog[];
