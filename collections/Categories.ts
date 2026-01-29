import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
    create: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    update: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    delete: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            const source = (data?.title ?? "") as string;
            const input = (value ?? data?.slug) as string | undefined;

            const toSlug = (str: string) =>
              str
                .toLowerCase()
                .trim()
                .replace(/[\s_]+/g, "-")
                .replace(/[^\w-]+/g, "")
                .replace(/--+/g, "-");

            if (input && input.length > 0) return toSlug(input);
            if (source.length > 0) return toSlug(source);

            return value;
          },
        ],
      },
    },
    {
      name: "categoryType",
      type: "select",
      required: true,
      options: [
        { label: "Featured", value: "Featured" },
        { label: "Hot Categories", value: "Hot Categories" },
        { label: "Top Categories", value: "Top Categories" },
      ],
    },
    {
      name: "image",
      type: "relationship",
      relationTo: "media",
    },
  ],
};
