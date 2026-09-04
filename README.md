# next-suspend

```
npm i next-suspend
```

## Getting started

```tsx
import { suspend } from "next-suspend";

// 1. Setup your data resolver
export const SuspendedProduct = suspend(
  async ({ productId }: { productId: string }) => {
    const product = await db.select.productById({ productId });
    if (!product) {
      notFound();
    }
    return product;
  },
);

// 2. Pass the params & render values suspensfully
export default async function Page({
  params,
}: PageProps<"/inventory/[productId]">) {
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

Your resolver will run once per params. The page can now the titles (Product & Description) into a static shell.

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
