'use client'

import { PayslipCalculation } from '@/lib/types'
import { formatCurrency, formatMonth } from '@/lib/formatter'

interface PayslipPreviewProps {
  calculation: PayslipCalculation
  employeeName: string
  year: number
  month: number
}

interface Row {
  group?: string
  label: string
  value: number
  highlight?: boolean
  bold?: boolean
  separator?: boolean
}

export default function PayslipPreview({ calculation, employeeName, year, month }: PayslipPreviewProps) {
  const rows: Row[] = [
    { group: '시술 매출', label: '매출액',          value: calculation.salesAmount },
    {                     label: '부가세(10%)',      value: -calculation.vatAmount },
    {                     label: '부가세차감매출',    value: calculation.vatDeducted },
    {                     label: '시술수당(45%)',     value: calculation.servicePay, highlight: true },
    { group: '제품 판매', label: '판매액',           value: calculation.productAmount, separator: true },
    {                     label: '제품수당(50%)',     value: calculation.productPay, highlight: true },
    { group: '급여 합계', label: '총 급여액',        value: calculation.grossPay, bold: true, separator: true },
    { group: '공제 내역', label: '소득세(3%)',       value: -calculation.incomeTax, separator: true },
    {                     label: '지방소득세(0.3%)',  value: -calculation.localTax },
    {                     label: '공제합계(3.3%)',    value: -calculation.taxAmount, bold: true },
  ]

  const hasData = calculation.salesAmount > 0 || calculation.productAmount > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 md:sticky md:top-6">
      {/* 헤더 */}
      <div className="text-center pb-4 border-b-2 border-navy-800">
        <h2 className="text-lg md:text-xl font-bold text-navy-900 tracking-widest">급 여 명 세 서</h2>
        <p className="text-sm text-navy-500 mt-1 font-medium">살롱앤티 (Salon Anty)</p>
      </div>

      {/* 수급자 정보 */}
      <div className="grid grid-cols-2 gap-x-4 py-3 border-b border-slate-200 text-sm">
        <div className="flex">
          <span className="text-slate-500 w-16 shrink-0">지급년월</span>
          <span className="font-medium text-navy-900">{formatMonth(year, month)}</span>
        </div>
        <div className="flex">
          <span className="text-slate-500 w-12 shrink-0">성 명</span>
          <span className="font-medium text-navy-900">{employeeName || '-'}</span>
        </div>
      </div>

      {/* 명세 테이블 */}
      <table className="w-full text-sm mt-1">
        <thead>
          <tr className="border-b-2 border-navy-800 text-navy-700">
            <th className="py-2.5 px-2 text-left font-semibold w-20 md:w-24">구분</th>
            <th className="py-2.5 px-2 text-left font-semibold">항목</th>
            <th className="py-2.5 px-2 text-right font-semibold w-28 md:w-32">금액(원)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`${row.separator ? 'border-t border-slate-200' : ''} ${row.bold ? 'bg-slate-50' : ''}`}
            >
              <td className="py-2 px-2 text-slate-400 text-xs">{row.group || ''}</td>
              <td className="py-2 px-2 text-navy-800">{row.label}</td>
              <td className={`py-2 px-2 text-right tabular-nums ${
                row.highlight ? 'text-navy-600 font-semibold' :
                row.bold ? 'font-bold text-navy-900' :
                row.value < 0 ? 'text-red-500' :
                'text-navy-700'
              }`}>
                {formatValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 실수령액 */}
      <div className={`mt-1 border-t-2 border-navy-800 pt-3 flex justify-between items-center ${
        hasData ? 'bg-navy-50 -mx-5 px-7 -mb-5 pb-4 rounded-b-xl md:-mx-6 md:px-8 md:-mb-6 md:pb-5' : ''
      }`}>
        <span className="text-base font-bold text-navy-900">실수령액</span>
        <span className={`tabular-nums font-bold ${hasData ? 'text-xl md:text-2xl text-navy-700' : 'text-lg md:text-xl text-navy-400'}`}>
          {formatCurrency(calculation.netPay)}<span className="text-sm ml-0.5">원</span>
        </span>
      </div>

      {/* 하단 서명 */}
      {hasData && (
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center space-y-0.5">
          <p>위 금액을 정히 지급합니다.</p>
          <p>사업장: 살롱앤티 (Salon Anty)</p>
        </div>
      )}
    </div>
  )
}

function formatValue(value: number): string {
  if (value === 0) return '0'
  if (value < 0) return `-${formatCurrency(Math.abs(value))}`
  return formatCurrency(value)
}
