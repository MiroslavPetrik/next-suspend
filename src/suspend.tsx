import {
  cache,
  PropsWithChildren,
  type ReactNode,
  Suspense,
  type SuspenseProps,
} from "react";

import { SuspendContext } from "./client";

/**
 * A rendering utility.
 * @param query - The function to cache by the page params promise.
 * @returns A component to render the cached result suspense-fully.
 */
export function suspend<Query extends (params: any) => Promise<any>>(
  query: Query,
) {
  type Params = Parameters<Query>[0];
  type Result = Awaited<ReturnType<Query>>;

  /**
   * The queryFn cached by the page params, called without arguments when no params are given.
   */
  const queryCache = cache(async (params?: Promise<Params>) =>
    params
      ? query(await params)
      : (query as unknown as () => Promise<Result>)(),
  );

  /**
   * The params promise from your PageProps, required only when your resolver takes params.
   */
  type ParamsProps = Parameters<Query>["length"] extends 0
    ? { params?: never }
    : { params: Promise<Params> };

  type Props = Prettify<
    Omit<SuspenseProps, "children"> &
      ParamsProps & {
        /**
         * A render prop to display your data once the resolver has finished loading.
         * @param data the resolved data from your resolver function.
         * @returns ReactNode
         */
        children: (data: Result) => ReactNode;
      }
  >;

  /**
   * The context provider to stream the result to client components via the useSuspend() hook.
   */
  function Provider({ params, children }: PropsWithChildren<ParamsProps>) {
    return (
      <SuspendContext value={params ? queryCache(params) : queryCache()}>
        {children}
      </SuspendContext>
    );
  }

  /**
   * A Suspense component to render the cached results by page params.
   */
  function Suspend({ params, children, ...props }: Props) {
    return (
      <Suspense {...props}>
        {(params ? queryCache(params) : queryCache()).then(children)}
      </Suspense>
    );
  }

  return { queryCache, Suspend, Provider };
}

export type Prettify<T> = Identity<{ [K in keyof T]: T[K] }>;
type Identity<T> = T;
