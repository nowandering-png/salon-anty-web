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
  const incomeTax = Math.round(grossPay * 0.03);
  const localTax = Math.round(grossPay * 0.003);
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
