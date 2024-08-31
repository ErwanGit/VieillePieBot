export function truncateString(str: String, length: number) {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}