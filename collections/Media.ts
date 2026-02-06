import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    update: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
    delete: ({ req }) =>
      Boolean(req.user && "role" in req.user && req.user.role === "admin"),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    disableLocalStorage: true,
  },
}
