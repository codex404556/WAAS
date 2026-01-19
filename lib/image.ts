type ImageLike =
  | string
  | {
      url?: string;
      asset?: { url?: string };
    }
  | null
  | undefined;

const resolveImageUrl = (source: ImageLike): string => {
  if (!source) return "/placeholder.svg";
  if (typeof source === "string") return source;
  if (source.url) return source.url;
  if (source.asset?.url) return source.asset.url;
  return "/placeholder.svg";
};

class ImageUrlBuilder {
  private source: ImageLike;

  constructor(source: ImageLike) {
    this.source = source;
  }

  width(_value: number): ImageUrlBuilder {
    return this;
  }

  height(_value: number): ImageUrlBuilder {
    return this;
  }

  url(): string {
    return resolveImageUrl(this.source);
  }
}

export const urlFor = (source: ImageLike): ImageUrlBuilder =>
  new ImageUrlBuilder(source);
