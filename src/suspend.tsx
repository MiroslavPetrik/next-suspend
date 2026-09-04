import { cache, type ReactNode, Suspense, type SuspenseProps } from "react";

/**
 * A rendering utility.
 * @param resolve The function to cache by the page params promise.
 * @returns A component to render the cached result suspense-fully.
 */
export function suspend<Params extends Record<string, string>, Result>(
  resolve: (params: Params) => Promise<Result>,
) {
  const resolveFromCache = cache(async (params: Promise<Params>) => {
    return resolve(await params);
  });

  type Props = Prettify<
    Omit<SuspenseProps, "children"> & {
      /**
       * The params promise from your PageProps.
       */
      params: Promise<Params>;
      /**
       * A render prop to display your data once the resolver has finished loading.
       * @param data the resolved data from your resolver function.
       * @returns ReactNode
       */
      children: (data: Result) => ReactNode;
    }
  >;

  return async function Suspended({ params, children, ...props }: Props) {
    return (
      <Suspense {...props}>
        {resolveFromCache(params).then((value) => children(value))}
      </Suspense>
    );
  };
}

export type Prettify<T> = Identity<{ [K in keyof T]: T[K] }>;
type Identity<T> = T;
