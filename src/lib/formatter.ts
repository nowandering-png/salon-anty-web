/**
 * 한국식 콤마 구분 포맷 (예: 1,000,000)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

/**
 * "2026년 04월" 형식
 */
export function formatMonth(year: number, month: number): string {
  return `${year}년 ${String(month).padStart(2, '0')}월`;
}

/**
 * 콤마/비숫자 제거 후 정수 변환. 빈 문자열이면 0.
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
