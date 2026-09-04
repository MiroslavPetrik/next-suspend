# next-suspend

The `suspend` utility runs your data resolver function through `React.cache` using your Next.js page `params` as the cache keys.
It returns an enhanced `<Suspense>` component, which awaits the `params` and renders the resolved value through a children prop.

```
npm i next-suspend
```

## Motivation

The `suspend` utility makes it easy to build layouts where it appears that individual values are suspended, but in practice only one entity is awaited:

![motivation](./motivation.png)

## Getting started

```tsx
import { suspend } from "next-suspend";

// 1. Setup your data resolver:
export const SuspendedProduct = suspend(
  async ({ productId }: { productId: string }) => {
    const product = await db.select.productById({ productId });
    if (!product) {
      notFound();
    }
    return product;
  },
);

// 2. Pass the params & render values suspensefully:
export default function Page({ params }: PageProps<"/inventory/[productId]">) {
  return (
    <div>
      <Property icon={<TbGardenCart />}>
        <PropertyTitle>Product</PropertyTitle>
        <PropertyValue>
          <SuspendedProduct params={params} fallback={<SkeletonLine />}>
            {({ name }) => <span>{name}</span>}
          </SuspendedProduct>
        </PropertyValue>
      </Property>
      <Property icon={<TbGardenCart />}>
        <PropertyTitle>Description</PropertyTitle>
        <PropertyValue>
          <SuspendedProduct params={params} fallback={<SkeletonLine />}>
            {({ description }) => <span>{description}</span>}
          </SuspendedProduct>
        </PropertyValue>
      </Property>
    </div>
  );
}
```

Your resolver will run once per params. The page can now render the titles (Product & Description) into a static shell for an instant navigation:

![demo](./demo.gif)

## Helper types

Simplify the data resolvers, so their params are typed by your routes:

```ts
// 1. Define a global helper type
import type { AppRoutes } from "@/../.next/types/routes";

declare global {
  type Suspended<Route extends AppRoutes> = Awaited<PageProps<Route>["params"]>;
}

// 2. Get params by Page
const SuspendedProduct = suspend(
  async ({ productId }: Suspended<"/inventory/[productId]">) => {
    // ...
  },
);
```
