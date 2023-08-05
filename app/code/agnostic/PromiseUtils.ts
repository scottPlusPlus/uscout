export function createPromiseWithResolver(): {
  promise: Promise<void>;
  resolver: () => void;
} {
  let resolver: () => void;
  const promise = new Promise<void>((resolve) => {
    resolver = resolve;
  });

  return { promise, resolver: resolver! };
}
