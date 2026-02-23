<div align="center">
  <img src="./images/logo.svg" alt="E-Store Logo" width="120" />
  <h1>E-Store: Modern Full-Stack E-Commerce Platform</h1>
  <p>Production-ready e-commerce application built with Next.js App Router, Payload CMS, and Stripe.</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Payload_CMS-3-111827?style=for-the-badge&logo=payloadcms&logoColor=white" alt="Payload CMS" />
    <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
    <img src="https://img.shields.io/badge/Clerk-Auth-3B82F6?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

This project includes a customer storefront, authenticated user dashboard, and admin management area.

## Highlights

- Modern storefront with category, brand, and deal-based browsing
- Product detail pages with media gallery and structured product data
- Shopping cart, favorites, checkout, and order tracking flows
- Auth-enabled user dashboard (profile, orders, notifications, analytics)
- Admin dashboard for products, categories, brands, users, orders, reviews, and banners
- CMS integration using Payload collections for core commerce entities
- Stripe checkout and webhook integration

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Payload CMS 3
- Stripe
- Clerk (authentication)
- Tailwind CSS 4 + Radix UI
- Zustand (client state)

## Core Modules

- `app/` - route groups for storefront, user dashboard, admin, and APIs
- `collections/` - Payload CMS schema definitions
- `components/` - reusable UI and feature components
- `lib/` - service clients, API helpers, validation, and utilities
- `store/` + `store.ts` - client state stores
- `performance/` - smoke/load testing scripts and summaries

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL instance (for Payload CMS)
- Stripe account (for checkout/webhook)
- Clerk app (if authentication is enabled)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file and define required variables for:

- Database connection
- Payload secret/config
- Stripe keys + webhook secret
- Clerk keys
- Public site URL values used by Next.js

Use `.env.example` if available in your workflow, or mirror the variable names referenced in `payload.config.ts` and API routes under `app/api/`.

### Run in Development

```bash
npm run dev
```

Application runs at `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - start production server
- `npm run lint` - run ESLint checks

## Deployment Notes

- Configure environment variables in your hosting provider before deployment.
- Register Stripe webhook endpoint to `app/api/stripe/webhook`.
- Ensure Payload database access is available from the deployed environment.

## Status

This repository is structured for professional delivery and extension.  
It can be used as:

- A freelance portfolio-grade project base
- A client starter for custom e-commerce development
- A reference architecture for Next.js + Payload + Stripe commerce apps
