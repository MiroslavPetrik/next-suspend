# next-suspend

The `suspend` utility runs your [query through `React.cache`](https://nextjs.org/docs/app/getting-started/fetching-data#reusing-data-with-reactcache) using your Next.js page `params` as the cache keys.
It returns an enhanced [`<Suspense>` component, which awaits the `params` ](https://nextjs.org/docs/app/getting-started/caching#maximizing-the-static-shell) and renders the resolved value through a children prop.

```
npm i next-suspend
```

## Motivation

The `suspend` utility makes it easy to build layouts where it appears that individual values are suspended, but in practice only one entity is awaited:

![motivation](./motivation.png)

## Usage

```tsx
import { suspend } from "next-suspend";

// 1. Setup your data query:
export const { Suspend: Product } = suspend(
  async ({ productId }: { productId: string }) => {
    const product = await db.select.productById({ productId });
    if (!product) {
      notFound();
    }
    return product;
  },
);

// 2. Pass the params & render values suspensefully:
export default function Page({ params }: PageProps<"/market/[productId]">) {
  return (
    <>
      <Property icon={<TbGardenCart />}>
        <PropertyTitle>Product</PropertyTitle>
        <PropertyValue>
          <Product params={params} fallback={<SkeletonLine />}>
            {({ name }) => <span>{name}</span>}
          </Product>
        </PropertyValue>
      </Property>
      <Property icon={<TbFileDescription />}>
        <PropertyTitle>Description</PropertyTitle>
        <PropertyValue>
          <Product params={params} fallback={<SkeletonLine />}>
            {({ description }) => <span>{description}</span>}
          </Product>
        </PropertyValue>
      </Property>
    </>
  );
}
```

Your query will run once per params. The page can now render the titles (Product & Description) into a static shell for an instant navigation:

![demo](./demo.gif)

## Usage w/ client components

Your suspend query [can be streamed to the client](https://nextjs.org/docs/app/guides/single-page-applications#using-reacts-use-within-a-context-provider) with the `useSuspend()` hook consuming a promise from a context provider:

```tsx
// app/market/[productId]/product.ts
import { suspend } from "next-suspend";

const { queryCache, Provider } = suspend(
  async ({ productId }: { productId: string }) => {
    // query the product
  },
);

// 1. export the Provider and the result type:
export const ProductProvider = Provider;
export type Product = Awaited<ReturnType<typeof queryCache>>;
```

```tsx
// app/market/[productId]/layout.tsx
import { ProductProvider } from "./product";

// 2. Use the Provider in the layout:
export default function ProductLayout({
  params,
  children,
}: LayoutProps<"/market/[productId]">) {
  return <ProductProvider params={params}>{children}</ProductProvider>;
}
```

```tsx
// app/market/[productId]/components.tsx
import { useSuspend } from "next-suspend/client";
import type { Product } from "./product";

// 3. Type the context value:
export function useProduct() {
  return useSuspend() as Product;
}
```

```tsx
// app/market/[productId]/components.tsx
"use client";

// 4. Consume the hook in your client components:
function Name() {
  const product = useProduct();
  return <span>{product.name}</span>;
}

export function ProductName() {
  return (
    <Suspense fallback={<SkeletonLine />}>
      <Name />
    </Suspense>
  );
}
```

```tsx
// app/market/[productId]/page.tsx
import { ProductName } from "./components";
import { ProductDescription } from "./components";

// 5. Finally render the components on a page:
export default function ProductPage() {
  return (
    <>
      <Property icon={<TbGardenCart />}>
        <PropertyTitle>Product</PropertyTitle>
        <PropertyValue>
          <ProductName />
        </PropertyValue>
      </Property>
      <Property icon={<TbFileDescription />}>
        <PropertyTitle>Description</PropertyTitle>
        <PropertyValue>
          <ProductDescription />
        </PropertyValue>
      </Property>
    </>
  );
}
```

## Helper types

Simplify the data resolvers, so their params are typed by your routes:

```ts
// 1. Define a global helper type
import type { AppRoutes } from "@/../.next/types/routes";

declare global {
  type SuspendParams<Route extends AppRoutes> = Awaited<
    PageProps<Route>["params"]
  >;
}

// 2. Get params by a route:
const { Suspend: Product } = suspend(
  async ({ productId }: SuspendParams<"/market/[productId]">) => {
    // ...
  },
);
```

## Troubleshooting

### My query still runs twice

The `queryCache` uses the `params` promise as the key, so you are using two different params. This can happen if you use both layout & page params, which are different promises.

If you use the `<Provider>` in the layout, then stream the data to client with the `useSuspend()` and don't use the `<Suspend>` in your page.

Note that both the `<Provider>` and the `<Suspend>` server components can be used in both page & layout, so if you are static shell maxxing your page with the `<Suspend>`, also render the `<Provider>` in your page (if needed) so they share the same `params`.
