# 🔍 Project Review: Car Dealership (Next.js 16 + Prisma 7)

A comprehensive audit of deprecated dependencies, project structure, security, performance, code quality, and missing features.

---

## 1. 📦 Deprecated / Problematic Dependencies

### `next-auth@5.0.0-beta.30` — Still in beta

This has been in beta for a very long time. The stable version has been released as **Auth.js v5** (`@auth/nextjs`). Migrate:

```jsonc
// Replace:
"next-auth": "^5.0.0-beta.30"
// With:
"@auth/nextjs": "^1.0.0"
```

### ~~`@prisma/adapter-neon` and `@prisma/adapter-pg` — Both included but only one is used~~

✅ **Done** — Both unused adapters removed.

### ~~`prisma` in `dependencies` — Should be in `devDependencies`~~

✅ **Done** — Moved `prisma` and `dotenv` to `devDependencies`.

### ~~`dotenv` — Likely unnecessary~~

✅ **Done** — Moved to `devDependencies` (still needed by `prisma.config.ts`).

### ~~`@neondatabase/serverless` — Unused?~~

✅ **Done** — Removed.

### ~~`cloudinary` (the Node SDK) — Unused~~

✅ **Done** — Removed (only `next-cloudinary` is kept). Also removed unused `pg` and `@types/pg`.

---

## 2. 🏗️ Project Structure Improvements

### a) `src/generated/prisma/` is committed to git

The generated Prisma client should be in `.gitignore` since it's regenerated on `prisma generate`. The `build` script already runs `prisma generate` before `next build`, which is correct, but the generated files shouldn't be version-tracked.

### b) Empty `src/app/api/cloudinary/` directory

This is an empty folder that should be removed, or populated with a signing route if server-side Cloudinary operations are planned.

### c) `DeleteItemButton.tsx` and `AdminHeader.tsx` live in `admin/` route folder

These are client components that would be better placed in `src/components/admin/` to follow the pattern established by other shared components.

### d) No `loading.tsx`, `error.tsx`, or `not-found.tsx` pages

Missing Next.js App Router conventions for loading states and error boundaries. Consider adding:

- `src/app/[locale]/loading.tsx` — Skeleton/spinner during page transitions
- `src/app/[locale]/error.tsx` — Graceful error handling
- `src/app/[locale]/not-found.tsx` — Custom 404 page

---

## 3. 🔒 Security Issues

### a) No input validation on API routes

`POST` and `PUT` routes in `src/app/api/cars/route.ts` and `src/app/api/cars/[id]/route.ts` blindly trust `body` data with no validation. Anyone can send malformed data. Use **Zod** for schema validation:

```typescript
import { z } from 'zod';

const carSchema = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2030),
  price: z.number().min(0),
  mileage: z.number().int().min(0),
  fuelType: z.enum([
    'Gasoline',
    'Diesel',
    'Electric',
    'Hybrid',
    'Plug-in Hybrid',
  ]),
  transmission: z.enum(['Automatic', 'Manual', 'CVT']),
  color: z.string(),
  description: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  featured: z.boolean().optional(),
});
```

### b) No admin role check — any authenticated Google user is an admin

The auth config only checks `isLoggedIn`, not whether the user is an authorized admin. **Anyone with a Google account can access the admin panel and CRUD cars.** An email allow-list is needed:

```typescript
// In lib/auth.ts callbacks:
authorized({ auth, request: { nextUrl } }) {
  const isLoggedIn = !!auth?.user;
  const isOnAdmin = /^\/[a-z]{2}\/admin/.test(nextUrl.pathname);
  if (isOnAdmin) {
    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    return isLoggedIn && allowedEmails.includes(auth?.user?.email || '');
  }
  return true;
},
```

### c) API routes also lack admin-only checks

The `POST`/`PUT`/`DELETE` handlers only check `session?.user`, not whether the user is actually an authorized admin. Same vulnerability as above.

### d) `alert()` used for error handling in `DeleteItemButton`

```typescript
// src/app/[locale]/admin/DeleteItemButton.tsx line 50
alert('Failed to delete item. Please try again.');
```

This is a hardcoded English string not going through i18n, and `alert()` is a poor UX pattern. Use a toast notification instead.

---

## 4. ⚡ Performance Issues

### a) `force-dynamic` everywhere

Every data page uses `export const dynamic = 'force-dynamic'`, which disables all caching. Consider:

- Using `revalidate` (ISR) instead: `export const revalidate = 60;` — revalidates every 60 seconds
- Or using `revalidateTag`/`revalidatePath` after mutations for on-demand revalidation

### b) Duplicate DB queries in pages with `generateMetadata`

In `src/app/[locale]/cars/[id]/page.tsx` and the edit page, the car is fetched **twice** — once in `generateMetadata` and once in the page component. Use `cache()` from React to deduplicate:

```typescript
import { cache } from 'react';

const getCar = cache(async (id: string) => {
  return prisma.car.findUnique({ where: { id } });
});
```

### c) No Prisma query optimization

All queries fetch all fields with `findMany({})`. For list pages, `description` and all `images` aren't needed. Use `select` to reduce payload:

```typescript
const cars = await prisma.car.findMany({
  select: {
    id: true,
    make: true,
    model: true,
    year: true,
    price: true,
    mileage: true,
    fuelType: true,
    images: true,
    featured: true,
    createdAt: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### d) Cars listing has no pagination

The cars page fetches ALL cars at once. As inventory grows, this will degrade. Add cursor-based or offset pagination.

---

## 5. 🧹 Code Quality

### a) Repeated car-card rendering logic

The mapping of `Car → ItemCard props` (with fuel type translation, icon assignment, etc.) is duplicated in both `src/app/[locale]/page.tsx` and `src/app/[locale]/cars/page.tsx`. Extract a helper:

```typescript
// lib/carHelpers.ts
export function carToCardProps(car: Car, locale: string, dict: Dictionary) { ... }
```

### b) `as Locale` casts everywhere

Every page does `locale as Locale` without validation. Use the `isValidLocale` function already defined in `src/i18n/config.ts`:

```typescript
if (!isValidLocale(locale)) notFound();
// now locale is typed as Locale — no cast needed
```

### c) Inconsistent use of `siteConfig.routes`

`siteConfig.routes` is defined with items, about, and admin paths, but they're never used. Instead, routes are hardcoded everywhere (e.g., `` `/${locale}/cars` ``). Either use the config consistently or remove the unused routes.

### d) Unused SVGs in `public/`

Files like `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are leftover Next.js boilerplate and should be cleaned up.

### e) Form year max is hardcoded to 2030

```typescript
// src/components/ItemForm.tsx line 203
max={2030}
```

This should be dynamic: `max={new Date().getFullYear() + 1}`.

### f) Hardcoded "Main" and "Drag" strings in ImageUpload

```typescript
// src/components/ImageUpload.tsx lines 119, 127
<span>Main</span>
<span>Drag</span>
```

These strings bypass the i18n system.

### g) Admin table has hardcoded `€` and `km`

```typescript
// src/app/[locale]/admin/page.tsx line 105
<TableCell>€{car.price.toLocaleString()}</TableCell>
```

`dict.common.currency` and `dict.common.distanceUnit` are not used in the admin table, unlike the public pages.

### h) `toLocaleString()` without locale parameter

```typescript
car.price.toLocaleString();
```

This uses the **server's** locale, not the user's. Pass the locale explicitly:

```typescript
car.price.toLocaleString(locale);
```

---

## 6. 🧩 Missing Features / Best Practices

| Missing                      | Recommendation                                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **No `.env.example`**        | Add one documenting required env vars (`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, etc.) |
| **No tests**                 | Add at least API route tests with Vitest and component tests with Testing Library                                                             |
| **No SEO files**             | Add `robots.ts`, `sitemap.ts`, and Open Graph images                                                                                          |
| **No dark mode toggle**      | Full dark mode CSS vars are defined but there's no way for users to switch themes                                                             |
| **No `Suspense` boundaries** | Wrap data-fetching sections for streaming SSR                                                                                                 |
| **No rate limiting**         | API routes have no rate limiting — vulnerable to abuse                                                                                        |
| **No image cleanup**         | When deleting a car, Cloudinary images are not removed — orphaned images accumulate                                                           |
| **No search/filter**         | The cars page has no way to filter by make, price range, fuel type, etc.                                                                      |

---

## 📋 Priority Summary

| Priority  | Issue                                                                                    |
| --------- | ---------------------------------------------------------------------------------------- |
| ✅ Done   | ~~No API input validation — arbitrary data can be written to DB~~                        |
| ✅ Done   | ~~Any Google user can access admin — DB-backed roles + seed admin~~                      |
| 🟠 High   | Migrate `next-auth` from beta to stable `@auth/nextjs`                                   |
| ✅ Done   | ~~Remove unused deps (`cloudinary`, `@neondatabase/serverless`, unused adapters, `pg`)~~ |
| ✅ Done   | ~~Move `prisma` (and `dotenv`) to devDependencies~~                                      |
| ✅ Done   | ~~Add `error.tsx`, `loading.tsx`, `not-found.tsx`~~                                      |
| 🟡 Medium | Deduplicate DB queries with `React.cache()`                                              |
| 🟡 Medium | Add pagination to cars listing                                                           |
| 🟢 Low    | Clean up boilerplate SVGs, hardcoded strings, unused `siteConfig.routes`                 |
