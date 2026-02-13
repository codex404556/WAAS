import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "user", "deliveryman"], {
    message: "Please select a valid role",
  }),
});

export const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  role: z.enum(["admin", "user", "deliveryman"], {
    message: "Please select a valid role",
  }),
  avatar: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  categoryType: z.enum(["Featured", "Hot Categories", "Top Categories"], {
    message: "Category type is required",
  }),
});

export const brandSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  image: z.string().optional(),
});

export const productSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" }),
    additionalInformation: z.string().optional(),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    oldPrice: z.number().min(0).optional(),
    stock: z.number().min(0),
    category: z.string().min(1, { message: "Please select a category" }),
    brand: z.string().min(1, { message: "Please select a brand" }),
    variant: z.string().optional(),
    keyFeatures: z
      .array(
        z.object({
          title: z.string().min(1, { message: "Feature title is required" }),
        })
      )
      .default([]),
    specifications: z
      .array(
        z.object({
          name: z.string().min(1, { message: "Specification name is required" }),
          title: z.string().min(1, { message: "Title is required" }),
        })
      )
      .default([]),
    images: z
      .array(z.string())
      .min(1, { message: "Please upload at least one image" }),
  })
  .superRefine(({ price, oldPrice }, ctx) => {
    if (oldPrice !== undefined && oldPrice > 0 && oldPrice <= price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Old price must be greater than price",
        path: ["oldPrice"],
      });
    }
  });

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

export const reviewSchema = z.object({
  product: z.string().min(1, { message: "Please select a product" }),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, { message: "Comment is required" }),
  source: z.enum(["user", "admin_seed"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  verified: z.boolean().optional(),
});
