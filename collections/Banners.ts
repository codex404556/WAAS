import type { CollectionConfig } from "payload";

export const Banners: CollectionConfig = {
  slug: "banners",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "startFrom",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "bannerType",
      type: "text",
      required: true,
    },
  ],
};
