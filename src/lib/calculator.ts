import { PayslipCalculation } from '@/lib/types';

export function calculatePayslip(salesAmount: number, productAmount: number): PayslipCalculation {
  // 부가세(10%) 단순 차감: 매출액 × 0.9
  const vatDeducted = Math.round(salesAmount * 0.9);
  const vatAmount = salesAmount - vatDeducted;

  // 시술 수당: 부가세 차감 후 × 45%
  const servicePay = Math.round(vatDeducted * 0.45);

  // 제품 수당: 제품 판매액 × 50%
  const productPay = Math.round(productAmount * 0.5);

  // 총 급여
  const grossPay = servicePay + productPay;

  // 원천징수 3.3% (소득세 3% + 지방소득세 0.3%)
  // 세법 기준: 10원 미만 절사. 소득세를 먼저 구해 10원 미만 버리고,
  // 지방소득세는 (소득세 × 10%) 후 다시 10원 미만 버림.
  const incomeTax = Math.floor((grossPay * 0.03) / 10) * 10;
  const localTax = Math.floor((incomeTax * 0.1) / 10) * 10;
  const taxAmount = incomeTax + localTax;

  // 실수령액
  const netPay = grossPay - taxAmount;

  return {
    salesAmount,
    productAmount,
    vatDeducted,
    vatAmount,
    servicePay,
    productPay,
    grossPay,
    incomeTax,
    localTax,
    taxAmount,
    netPay,
  };
}
