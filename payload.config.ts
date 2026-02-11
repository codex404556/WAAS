import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig } from "payload";
import type { CollectionSlug, Where } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Banners } from "./collections/Banners";
import { Orders } from "./collections/Orders";
import { Notifications } from "./collections/Notifications";
import { Wishlists } from "./collections/Wishlists";
import { Addresses } from "./collections/Addresses";

import { Categories } from "./collections/Categories";
import Products from "./collections/Products";
import Brands from "./collections/Brands";
import Reviews from "./collections/Reviews";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  endpoints: [
    {
      path: "/stats",
      method: "get",
      handler: async (req) => {
        const collectionSlugs =
          req.payload.config.collections?.map((collection) => collection.slug) ??
          [];
        const hasCollection = (slug: CollectionSlug) =>
          collectionSlugs.includes(slug);

        const countCollection = async (slug: CollectionSlug, where?: Where) => {
          if (!hasCollection(slug)) {
            return 0;
          }

          const result = await req.payload.count({
            collection: slug as never,
            req,
            where,
          });

          return result.totalDocs ?? 0;
        };

        const [usersCount, productsCount, categoriesCount, brandsCount] =
          await Promise.all([
            countCollection("users"),
            countCollection("products"),
            countCollection("categories"),
            countCollection("brands"),
          ]);

        const ordersCount = await countCollection("orders");

        const roles = await Promise.all(
          ["admin", "user", "deliveryman"].map(async (role) => ({
            name: role,
            value: await countCollection("users", {
              role: {
                equals: role,
              },
            }),
          }))
        );

        let categories: { name: string; value: number }[] = [];
        if (hasCollection("categories")) {
          const categoryDocs = await req.payload.find({
            collection: "categories" as never,
            depth: 0,
            limit: 1000,
            req,
          });

          categories = await Promise.all(
            categoryDocs.docs.map(async (category) => {
              const categoryId =
                (category as { id?: string; _id?: string }).id ??
                (category as { _id?: string })._id;
              const value =
                categoryId && hasCollection("products")
                  ? await countCollection("products", {
                      category: {
                        equals: categoryId,
                      },
                    })
                  : 0;

              const categoryName =
                (category as { title?: string; name?: string }).title ??
                (category as { name?: string }).name ??
                "Unknown";

              return {
                name: categoryName,
                value,
              };
            })
          );
        }

        let brands: { name: string; value: number }[] = [];
        if (hasCollection("brands")) {
          const brandDocs = await req.payload.find({
            collection: "brands" as never,
            depth: 0,
            limit: 1000,
            req,
          });

          brands = await Promise.all(
            brandDocs.docs.map(async (brand) => {
              const brandId =
                (brand as { id?: string; _id?: string }).id ??
                (brand as { _id?: string })._id;
              const value =
                brandId && hasCollection("products")
                  ? await countCollection("products", {
                      brand: {
                        equals: brandId,
                      },
                    })
                  : 0;

              return {
                name: (brand as { name?: string }).name ?? "Unknown",
                value,
              };
            })
          );
        }

        let totalRevenue = 0;
        if (hasCollection("orders")) {
          let page = 1;
          const limit = 200;

          while (true) {
            const paidOrders = await req.payload.find({
              collection: "orders" as never,
              where: {
                paymentStatus: {
                  equals: "paid",
                },
              },
              depth: 0,
              limit,
              page,
              req,
            });

            for (const order of paidOrders.docs as Array<{
              totalAmount?: number;
              stripeAmountTotal?: number;
            }>) {
              const amount = Number(
                order.stripeAmountTotal ?? order.totalAmount ?? 0
              );
              if (Number.isFinite(amount) && amount > 0) {
                totalRevenue += amount;
              }
            }

            if (page >= (paidOrders.totalPages || 1)) {
              break;
            }
            page += 1;
          }
        }

        return Response.json({
          counts: {
            users: usersCount,
            products: productsCount,
            categories: categoriesCount,
            brands: brandsCount,
            orders: ordersCount,
            totalRevenue,
          },
          roles,
          categories,
          brands,
        });
      },
    },
  ],
  collections: [
    Users,
    Media,
    Products,
    Categories,
    Brands,
    Reviews,
    Banners,
    Orders,
    Addresses,
    Notifications,
    Wishlists,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      bucket: process.env.R2_BUCKET || "",
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: "auto",
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      },
      collections: {
        media: true,
      },
    }),
  ],
});
