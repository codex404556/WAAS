import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "orderId",
  },
  fields: [
    {
      name: "orderId",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
        },
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: "totalAmount",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        {
          name: "street",
          type: "text",
        },
        {
          name: "city",
          type: "text",
        },
        {
          name: "state",
          type: "text",
        },
        {
          name: "zipCode",
          type: "text",
        },
        {
          name: "country",
          type: "text",
        },
      ],
    },
  ],
};
