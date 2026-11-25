export function nextHeaderScrolled(y: number, scrolled: boolean): boolean {
  if (scrolled) return y > 2;
  return y > 12;
}
