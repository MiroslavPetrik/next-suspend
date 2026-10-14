import type { FunctionComponent, ReactNode } from "react";

export type PageSuspend<T extends (props: any) => ReactNode> = {
  Suspend: (props: {
    fallback?: ReactNode;
    children: Parameters<T>[0]["children"];
  }) => ReactNode;
};

export function withSuspend<In, Out>(config: {
  Suspend: FunctionComponent<{
    params: Promise<In>;
    children: (data: Out) => ReactNode;
  }>;
}) {
  return (
    PageComponent: (props: {
      Suspend: (props: { children: (data: Out) => ReactNode }) => ReactNode;
    }) => ReactNode,
  ) => {
    return async function PageWithSuspend({
      params,
      searchParams,
    }: {
      params: Promise<Record<string, any>>;
      searchParams: Promise<Record<string, any>>;
    }) {
      const merged = params.then((p) =>
        searchParams.then((s) => ({ ...p, ...s }) as In),
      );
      return (
        <PageComponent
          Suspend={(props: {
            fallback?: ReactNode;
            children: (data: Out) => ReactNode;
          }) => <config.Suspend {...props} params={merged} />}
        />
      );
    };
  };
}
