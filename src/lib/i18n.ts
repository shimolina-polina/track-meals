export function pluralizeMeals(n: number): string {
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'приемов';
  if (lastDigit === 1) return 'прием';
  if (lastDigit >= 2 && lastDigit <= 4) return 'приема';
  return 'приемов';
}
