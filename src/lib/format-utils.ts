/**
 * 格式化销量数字
 */
export function formatSales(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}
