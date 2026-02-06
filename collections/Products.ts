import type { CollectionConfig } from "payload";

// If you already have a slug field elsewhere, you can reuse it.
// This keeps it explicit and close to your Sanity schema.
const Products: CollectionConfig = {
  slug: "products",
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
    singular: "Product",
    plural: "Products",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: [
      "name",
      "price",
      "status",
      "variant",
      "stock",
      "updated At",
    ],
  },
  fields: [
    // Product Name
    {
      name: "name",
      label: "Product Name",
      type: "text",
      required: true,
    },

    // Slug (similar to Sanity: type: "slug", source: "name", required)
    // In Payload: use `hooks` to auto-generate from name.
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Auto-generated from Product Name (you can edit it).",
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            // Keep existing slug if user already typed one
            const input = (value ?? data?.slug) as string | undefined;

            // Generate from name if missing
            const source = (data?.name ?? "") as string;

            const toSlug = (str: string) =>
              str
                .toLowerCase()
                .trim()
                .replace(/[\s\_]+/g, "-")
                .replace(/[^\w\-]+/g, "")
                .replace(/\-\-+/g, "-")
                .slice(0, 96);

            if (input && input.trim().length > 0) return toSlug(input);
            if (source && source.trim().length > 0) return toSlug(source);

            // If both are empty, let required validation handle it
            return input;
          },
        ],
      },
    },

    // Product Images (Sanity: array of image with hotspot)
    // Payload: upload field shows thumbnails for media selection
    {
      name: "images",
      label: "Product Images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },

    // Description
    {
      name: "description",
      label: "Description",
      type: "textarea",
    },

    // Additional Information
    {
      name: "additionalInformation",
      label: "Additional Information",
      type: "textarea",
      required: false,
    },

    // Price (required, min 0)
    {
      name: "price",
      label: "Price",
      type: "number",
      required: true,
      min: 0,
    },

    // Old Price (optional, stored as-is)
    {
      name: "oldPrice",
      label: "Old Price",
      type: "number",
      required: false,
      min: 0,
      defaultValue: 0,
    },

    // Category (single reference)
    {
      name: "category",
      label: "Category",
      type: "relationship",
      relationTo: "categories",
    },

    // Stock (required, min 0)
    {
      name: "stock",
      label: "Stock",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
    },

    // Brand
    {
      name: "brand",
      label: "Brand",
      type: "relationship",
      relationTo: "brands",
    },

    // Reviews (Sanity: array of objects)
    {
      name: "reviews",
      label: "Reviews",
      type: "array",
      fields: [
        {
          name: "userName",
          label: "User Name",
          type: "text",
          required: true,
        },
        // userImage (Sanity: image)
        // Payload: use Media relationship
        {
          name: "userImage",
          label: "User Image",
          type: "relationship",
          relationTo: "media",
        },
        {
          name: "rating",
          label: "Star Rating",
          type: "number",
          required: true,
          min: 1,
          max: 5,
        },
        {
          name: "comment",
          label: "Review Comment",
          type: "textarea",
          required: true,
        },
        {
          name: "date",
          label: "Review Date",
          type: "date",
          required: true,
        },
      ],
    },

    // Product Status (Sanity list)
    {
      name: "status",
      label: "Product Status",
      type: "select",
      options: [
        { label: "New", value: "new" },
        { label: "Hot", value: "hot" },
        { label: "Sale", value: "sale" },
      ],
    },

    // Product Type / Collection (Sanity list)
    {
      name: "variant",
      label: "Collection",
      type: "select",
      options: [
        { label: "Best Sellers", value: "best-sellers" },
        { label: "Big Deals", value: "big-deals" },
        { label: "Lowest Price", value: "lowest-price" },
        { label: "Top", value: "top" },
      ],
    },
  ],
};

export default Products;
