export function formatCount(count: number): string {
  if (count < 10) return `${count}+`; // small numbers, no rounding
  if (count < 100) {
    const rounded = Math.floor(count / 10) * 10; // round down to nearest 10
    return `${rounded}+`;
  }
  if (count < 1000) {
    const rounded = Math.floor(count / 100) * 100; // round down to nearest 100
    return `${rounded}+`;
  }
  // for very large numbers
  const rounded = Math.floor(count / 1000) * 1000;
  return `${(rounded / 1000).toFixed(0)}k+`;
}
