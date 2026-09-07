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
export function suspend<Params extends Record<string, string>, Result>(
  query: (params: Params) => Promise<Result>,
) {
  /**
   * The queryFn cached by the page params.
   */
  const queryCache = cache(async (params: Promise<Params>) =>
    query(await params),
  );

  type ParamsProps = {
    /**
     * The params promise from your PageProps.
     */
    params: Promise<Params>;
  };

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
      <SuspendContext value={queryCache(params)}>{children}</SuspendContext>
    );
  }

  /**
   * A Suspense component to render the cached results by page params.
   */
  function Suspend({ params, children, ...props }: Props) {
    return <Suspense {...props}>{queryCache(params).then(children)}</Suspense>;
  }

  return { queryCache, Suspend, Provider };
}

export type Prettify<T> = Identity<{ [K in keyof T]: T[K] }>;
type Identity<T> = T;
