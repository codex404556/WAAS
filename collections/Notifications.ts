import type { CollectionConfig } from "payload";

export const Notifications: CollectionConfig = {
  slug: "notifications",
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "isRead", "createdAt"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "Order Placed", value: "order_placed" },
        { label: "Order Confirmed", value: "order_confirmed" },
        { label: "Order Shipped", value: "order_shipped" },
        { label: "Order Delivered", value: "order_delivered" },
        { label: "Order Cancelled", value: "order_cancelled" },
        { label: "Payment Success", value: "payment_success" },
        { label: "Payment Failed", value: "payment_failed" },
        { label: "Refund Processed", value: "refund_processed" },
        { label: "General", value: "general" },
        { label: "Offer", value: "offer" },
        { label: "Deal", value: "deal" },
        { label: "Announcement", value: "announcement" },
        { label: "Promotion", value: "promotion" },
        { label: "Alert", value: "alert" },
        { label: "Admin Message", value: "admin_message" },
      ],
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "isRead",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "relatedOrderId",
      type: "text",
    },
    {
      name: "image",
      type: "text",
    },
    {
      name: "actionUrl",
      type: "text",
    },
    {
      name: "actionText",
      type: "text",
    },
    {
      name: "external",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "priority",
      type: "select",
      defaultValue: "normal",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
    },
    {
      name: "metadata",
      type: "json",
    },
  ],
};
