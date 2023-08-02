export function fillEmptyFields<T extends Record<string, any>>(
  objTo: T,
  objFrom: T
): void {
  for (const key in objFrom) {
    if (
      objFrom.hasOwnProperty(key) &&
      (objTo[key] === null || objTo[key] === undefined)
    ) {
      objTo[key] = objFrom[key];
    }
  }
}
