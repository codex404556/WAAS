import type { CollectionConfig } from "payload";

const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    delete: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
  },
  admin: {
    useAsTitle: "comment",
    defaultColumns: ["product", "rating", "source", "status", "createdAt"],
  },
  timestamps: true,
  fields: [
    {
      name: "product",
      label: "Product",
      type: "relationship",
      relationTo: "products",
      required: true,
    },
    {
      name: "user",
      label: "User",
      type: "relationship",
      relationTo: "users",
      required: false,
    },
    {
      name: "order",
      label: "Order",
      type: "relationship",
      relationTo: "orders",
      required: false,
    },
    {
      name: "rating",
      label: "Rating",
      type: "number",
      min: 1,
      max: 5,
      required: true,
    },
    {
      name: "comment",
      label: "Comment",
      type: "textarea",
      required: true,
    },
    {
      name: "source",
      label: "Source",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "User", value: "user" },
        { label: "Admin Seed", value: "admin_seed" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    {
      name: "verified",
      label: "Verified Purchase",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};

export default Reviews;
