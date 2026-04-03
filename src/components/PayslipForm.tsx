'use client'

import { useState, useEffect } from 'react'
import { Employee } from '@/lib/types'
import { calculatePayslip } from '@/lib/calculator'
import { formatCurrency, parseCurrencyInput } from '@/lib/formatter'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayslips } from '@/hooks/usePayslips'
import { downloadPayslipPdf } from './PayslipPDF'
import PayslipPreview from './PayslipPreview'

export default function PayslipForm() {
  const { employees, getEmployees } = useEmployees()
  const { savePayslip, getPayslipByEmployeeMonth } = usePayslips()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [salesInput, setSalesInput] = useState('')
  const [productInput, setProductInput] = useState('')
  const [saving, setSaving] = useState(false)

  const salesAmount = parseCurrencyInput(salesInput)
  const productAmount = parseCurrencyInput(productInput)
  const calculation = calculatePayslip(salesAmount, productAmount)

  useEffect(() => {
    getEmployees()
  }, [getEmployees])

  function handleCurrencyInput(
    value: string,
    setter: (v: string) => void,
  ) {
    const num = parseCurrencyInput(value)
    setter(num ? formatCurrency(num) : '')
  }

  async function handleSave() {
    if (!selectedEmployeeId) {
      alert('직원을 선택해주세요.')
      return
    }
    if (salesAmount === 0 && productAmount === 0) {
      alert('매출액 또는 판매액을 입력해주세요.')
      return
    }

    const existing = await getPayslipByEmployeeMonth(selectedEmployeeId, year, month)
    if (existing) {
      const confirmed = confirm(
        `${year}년 ${month}월 지급명세서가 이미 존재합니다.\n덮어쓰시겠습니까?`,
      )
      if (!confirmed) return
    }

    setSaving(true)
    try {
      await savePayslip({
        employee_id: selectedEmployeeId,
        year,
        month,
        sales_amount: salesAmount,
        product_amount: productAmount,
        vat_deducted: calculation.vatDeducted,
        service_pay: calculation.servicePay,
        product_pay: calculation.productPay,
        gross_pay: calculation.grossPay,
        tax_amount: calculation.taxAmount,
        income_tax: calculation.incomeTax,
        local_tax: calculation.localTax,
        net_pay: calculation.netPay,
      })
      alert('저장되었습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePdfDownload() {
    if (!selectedEmployeeId) {
      alert('직원을 선택해주세요.')
      return
    }
    if (salesAmount === 0 && productAmount === 0) {
      alert('매출액 또는 판매액을 입력해주세요.')
      return
    }
    const empName = selectedEmployee?.name || ''

    setSaving(true)
    try {
      await downloadPayslipPdf({
        calculation,
        employeeName: empName,
        year,
        month,
      })
    } catch (err) {
      alert(`PDF 생성 중 오류가 발생했습니다.\n${err}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-5 md:mb-6">
        <h2 className="text-xl font-bold text-navy-900">지급명세서 작성</h2>
        <p className="text-sm text-slate-500 mt-1">매출 정보를 입력하면 급여가 자동 계산됩니다</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-5 gap-5 md:gap-6">
        {/* ── 좌측: 입력 폼 ── */}
        <div className="md:col-span-2 space-y-4 md:space-y-5">
          {/* 기간 선택 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">지급 기간</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">년도</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">월</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 직원 + 매출 입력 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold text-navy-800 mb-1">매출 정보</h3>

            {/* 직원 선택 */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">직원 선택</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* 시술 매출액 */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">시술 매출액</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={salesInput}
                  onChange={(e) => handleCurrencyInput(e.target.value, setSalesInput)}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
              </div>
            </div>

            {/* 제품 판매액 */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">제품 판매액</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={productInput}
                  onChange={(e) => handleCurrencyInput(e.target.value, setProductInput)}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
              </div>
            </div>
          </div>

          {/* 실시간 계산 요약 */}
          <div className="bg-navy-50 rounded-xl border border-navy-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">계산 요약</h3>
            <div className="space-y-2 text-sm">
              <SummaryRow label="부가세 차감 매출" value={calculation.vatDeducted} />
              <SummaryRow label="시술 수당 (45%)" value={calculation.servicePay} accent />
              <SummaryRow label="제품 수당 (50%)" value={calculation.productPay} accent />
              <div className="border-t border-navy-200 pt-2 mt-2">
                <SummaryRow label="총 급여" value={calculation.grossPay} bold />
              </div>
              <SummaryRow label="공제 (3.3%)" value={-calculation.taxAmount} />
              <div className="border-t border-navy-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900">실수령액</span>
                  <span className="font-bold text-lg text-navy-700">
                    {formatCurrency(calculation.netPay)}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-navy-700 text-white py-3 px-4 rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors text-sm font-semibold min-h-[44px]"
            >
              {saving ? '저장 중...' : 'DB 저장'}
            </button>
            <button
              onClick={handlePdfDownload}
              className="flex-1 bg-white text-navy-700 border-2 border-navy-700 py-3 px-4 rounded-lg hover:bg-navy-50 transition-colors text-sm font-semibold min-h-[44px]"
            >
              PDF 다운로드
            </button>
          </div>
        </div>

        {/* ── 우측: 미리보기 ── */}
        <div className="md:col-span-3">
          <PayslipPreview
            calculation={calculation}
            employeeName={selectedEmployee?.name || ''}
            year={year}
            month={month}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, bold, accent }: {
  label: string
  value: number
  bold?: boolean
  accent?: boolean
}) {
  const isNeg = value < 0
  const display = isNeg
    ? `-${formatCurrency(Math.abs(value))}`
    : formatCurrency(value)

  return (
    <div className="flex justify-between">
      <span className={`${bold ? 'font-semibold text-navy-900' : 'text-navy-600'}`}>{label}</span>
      <span className={`tabular-nums ${
        bold ? 'font-semibold text-navy-900' :
        accent ? 'font-medium text-navy-700' :
        isNeg ? 'text-red-500' : 'text-navy-600'
      }`}>
        {display}
      </span>
    </div>
  )
}
