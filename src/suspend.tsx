import { cache, type ReactNode, Suspense, type SuspenseProps } from "react";

export function suspend<Params extends Record<string, string>, Result>(
  resolve: (params: Params) => Promise<Result>,
) {
  const resolveFromCache = cache(async (params: Promise<Params>) => {
    return resolve(await params);
  });

  type Props = Omit<SuspenseProps, "children"> & {
    params: Promise<Params>;
    children: (props: Result) => ReactNode;
  };

  return async function Suspended({ params, children, ...props }: Props) {
    return (
      <Suspense {...props}>
        {resolveFromCache(params).then((value) => children(value))}
      </Suspense>
    );
  };
}
