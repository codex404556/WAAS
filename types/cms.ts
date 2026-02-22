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
  oldPrice?: number;
  discount?: number;
  stock?: number;
  status?: string;
  variant?: string;
  description?: string;
  additionalInformation?: string;
  keyFeatures?: Array<{ title?: string }>;
  specifications?: Array<{ name?: string; title?: string }>;
  images?: Image[];
  categories?: (Category | string | null)[];
  brand?: Brand;
  reviews?: Array<{
    userName: string;
    rating: number;
    comment: string;
    date: string;
    userImage?: Image;
  }>;
};

export type Address = {
  _id: string;
  user?: string;
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


export type BRANDS_QUERYResult = Brand[];
