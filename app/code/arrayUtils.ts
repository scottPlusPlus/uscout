export function deepCopyArray<T>(array: T[]): T[] {
  return array.map((obj) => ({ ...obj }));
}
