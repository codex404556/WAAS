import type { CollectionConfig } from "payload";

const Brands: CollectionConfig = {
  slug: "brands",
  access: {
    read: () => true,
    create: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    update: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    delete: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
  },

  labels: {
    singular: "Brand",
    plural: "Brands",
  },

  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },

  fields: [
    // Brand Title
    {
      name: "title",
      label: "Brand Title",
      type: "text",
      required: true,
    },

    // Slug (auto-generated from title)
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Auto-generated from Brand Title",
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            const source = (data?.title ?? "") as string;
            const input = (value ?? data?.slug) as string | undefined;

            const toSlug = (str: string) =>
              str
                .toLowerCase()
                .trim()
                .replace(/[\s\_]+/g, "-")
                .replace(/[^\w\-]+/g, "")
                .replace(/\-\-+/g, "-");

            if (input && input.length > 0) return toSlug(input);
            if (source.length > 0) return toSlug(source);

            return value;
          },
        ],
      },
    },

    // Description
    {
      name: "description",
      label: "Description",
      type: "textarea",
    },

    // Brand Image (uses Media collection)
    {
      name: "image",
      label: "Brand Image",
      type: "relationship",
      relationTo: "media",
    },
  ],
};

export default Brands;
