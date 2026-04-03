// ─── DB 엔티티 (Supabase salon 스키마) ─────────────────

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Payslip {
  id: number;
  employee_id: number;
  year: number;
  month: number;
  sales_amount: number;
  product_amount: number;
  vat_deducted: number;
  service_pay: number;
  product_pay: number;
  gross_pay: number;
  tax_amount: number;
  income_tax: number;
  local_tax: number;
  net_pay: number;
  created_at: string;
}

export interface PayslipWithEmployee extends Payslip {
  employee_name: string;
}

// ─── 급여 계산 (순수 함수용) ────────────────────────────

export interface PayslipCalculation {
  salesAmount: number;      // 시술 매출액 (입력값)
  productAmount: number;    // 제품 판매액 (입력값)
  vatAmount: number;        // 부가세 금액
  vatDeducted: number;      // 부가세 차감 후 매출
  servicePay: number;       // 시술 수당 (45%)
  productPay: number;       // 제품 수당 (50%)
  grossPay: number;         // 총 급여
  incomeTax: number;        // 소득세 (3%)
  localTax: number;         // 지방소득세 (0.3%)
  taxAmount: number;        // 원천징수 합계 (3.3%)
  netPay: number;           // 실수령액
}

// ─── 입력 타입 ──────────────────────────────────────────

export interface PayslipSaveInput {
  employee_id: number;
  year: number;
  month: number;
  sales_amount: number;
  product_amount: number;
  vat_deducted: number;
  service_pay: number;
  product_pay: number;
  gross_pay: number;
  tax_amount: number;
  income_tax: number;
  local_tax: number;
  net_pay: number;
}

export interface PayslipFilter {
  year?: number;
  month?: number;
  employee_id?: number;
}

// ─── Supabase Database 타입 ─────────────────────────────

export type Database = {
  salon: {
    Tables: {
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at'>;
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>;
      };
      payslips: {
        Row: Payslip;
        Insert: Omit<Payslip, 'id' | 'created_at'>;
        Update: Partial<Omit<Payslip, 'id' | 'created_at'>>;
      };
    };
  };
};
