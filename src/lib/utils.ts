let counter = 0;

export function generateId(prefix = "item"): string {
  counter += 1;
  const rand = Math.floor(Math.random() * 1000000);
  return `${prefix}-${counter}-${rand}`;
}

export function getTimestamp(): number {
  return typeof performance !== "undefined" ? Math.round(performance.now()) : 0;
}
