'use client'

import { useState, useEffect } from 'react'
import { PayslipWithEmployee } from '@/lib/types'
import { calculatePayslip } from '@/lib/calculator'
import { formatCurrency } from '@/lib/formatter'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayslips } from '@/hooks/usePayslips'
import { downloadPayslipPdf } from './PayslipPDF'

export default function PayslipHistory() {
  const { employees, getEmployees } = useEmployees()
  const { payslips, loading, getPayslips } = usePayslips()
  const [filterYear, setFilterYear] = useState<number | ''>(new Date().getFullYear())
  const [filterMonth, setFilterMonth] = useState<number | ''>('')
  const [filterEmployee, setFilterEmployee] = useState<number | ''>('')

  useEffect(() => {
    getEmployees()
  }, [getEmployees])

  useEffect(() => {
    const filters: { year?: number; month?: number; employee_id?: number } = {}
    if (filterYear) filters.year = filterYear
    if (filterMonth) filters.month = filterMonth
    if (filterEmployee) filters.employee_id = filterEmployee
    getPayslips(filters)
  }, [filterYear, filterMonth, filterEmployee, getPayslips])

  async function handlePdfDownload(p: PayslipWithEmployee) {
    try {
      const calculation = calculatePayslip(p.sales_amount, p.product_amount)
      await downloadPayslipPdf({
        calculation,
        employeeName: p.employee_name,
        year: p.year,
        month: p.month,
      })
    } catch (err) {
      alert(`PDF 생성 중 오류가 발생했습니다.\n${err}`)
    }
  }

  // 합계 계산
  const totals = payslips.reduce(
    (acc, p) => ({
      sales: acc.sales + p.sales_amount,
      product: acc.product + p.product_amount,
      gross: acc.gross + p.gross_pay,
      tax: acc.tax + p.tax_amount,
      net: acc.net + p.net_pay,
    }),
    { sales: 0, product: 0, gross: 0, tax: 0, net: 0 },
  )

  const selectClass = 'border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent bg-white min-h-[44px]'

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-5 md:mb-6">
        <h2 className="text-xl font-bold text-navy-900">급여 이력</h2>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? '불러오는 중...' :
            payslips.length > 0
              ? `${payslips.length}건 조회됨`
              : '조건에 맞는 이력을 검색하세요'}
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 mb-4 md:mb-5 flex flex-wrap gap-2 md:gap-3 items-center">
        <span className="text-xs font-semibold text-navy-700 mr-1 hidden md:inline">필터</span>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : '')} className={`${selectClass} flex-1 md:flex-none`}>
          <option value="">전체 년도</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : '')} className={`${selectClass} flex-1 md:flex-none`}>
          <option value="">전체 월</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
        <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value ? Number(e.target.value) : '')} className={`${selectClass} flex-1 md:flex-none`}>
          <option value="">전체 직원</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* 모바일: 카드 리스트 */}
      <div className="md:hidden space-y-3">
        {payslips.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-navy-900">{p.employee_name}</p>
                <p className="text-xs text-slate-500">{p.year}.{String(p.month).padStart(2, '0')}</p>
              </div>
              <button
                onClick={() => handlePdfDownload(p)}
                className="text-navy-500 text-xs font-medium px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors min-h-[44px]"
              >
                PDF
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">시술매출</span>
                <span className="tabular-nums text-slate-600">{formatCurrency(p.sales_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">제품판매</span>
                <span className="tabular-nums text-slate-600">{formatCurrency(p.product_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">총급여</span>
                <span className="tabular-nums font-medium text-navy-800">{formatCurrency(p.gross_pay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">공제</span>
                <span className="tabular-nums text-red-500">-{formatCurrency(p.tax_amount)}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-navy-900">실수령액</span>
              <span className="text-base tabular-nums font-bold text-navy-700">{formatCurrency(p.net_pay)}원</span>
            </div>
          </div>
        ))}
        {payslips.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-base mb-1">급여 이력이 없습니다</p>
            <p className="text-xs">지급명세서를 작성하면 이곳에 표시됩니다</p>
          </div>
        )}
        {/* 모바일 합계 */}
        {payslips.length > 0 && (
          <div className="bg-navy-50 rounded-xl border border-navy-200 p-4">
            <p className="text-sm font-bold text-navy-800 mb-2">합계</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-600">총급여</span>
                <span className="tabular-nums font-semibold text-navy-700">{formatCurrency(totals.gross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-600">공제</span>
                <span className="tabular-nums font-semibold text-red-500">-{formatCurrency(totals.tax)}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-navy-200 flex justify-between">
              <span className="font-bold text-navy-900">실수령 합계</span>
              <span className="tabular-nums font-bold text-navy-800">{formatCurrency(totals.net)}원</span>
            </div>
          </div>
        )}
      </div>

      {/* 데스크톱: 테이블 */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-4 text-left font-semibold text-navy-700">년월</th>
              <th className="py-3 px-4 text-left font-semibold text-navy-700">직원</th>
              <th className="py-3 px-4 text-right font-semibold text-navy-700">시술매출</th>
              <th className="py-3 px-4 text-right font-semibold text-navy-700">제품판매</th>
              <th className="py-3 px-4 text-right font-semibold text-navy-700">총급여</th>
              <th className="py-3 px-4 text-right font-semibold text-navy-700">공제</th>
              <th className="py-3 px-4 text-right font-semibold text-navy-700">실수령액</th>
              <th className="py-3 px-4 text-center font-semibold text-navy-700 w-20">PDF</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 text-navy-800 font-medium">
                  {p.year}.{String(p.month).padStart(2, '0')}
                </td>
                <td className="py-2.5 px-4 text-navy-900">{p.employee_name}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-600">{formatCurrency(p.sales_amount)}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-600">{formatCurrency(p.product_amount)}</td>
                <td className="py-2.5 px-4 text-right tabular-nums font-medium text-navy-800">{formatCurrency(p.gross_pay)}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-red-500">-{formatCurrency(p.tax_amount)}</td>
                <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-navy-700">{formatCurrency(p.net_pay)}</td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    onClick={() => handlePdfDownload(p)}
                    className="text-navy-500 hover:text-navy-700 hover:bg-navy-50 text-xs font-medium px-2 py-1 rounded transition-colors"
                    title="PDF 다운로드"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
            {payslips.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="text-base mb-1">급여 이력이 없습니다</p>
                  <p className="text-xs">지급명세서를 작성하면 이곳에 표시됩니다</p>
                </td>
              </tr>
            )}
          </tbody>
          {payslips.length > 0 && (
            <tfoot>
              <tr className="bg-navy-50 border-t-2 border-navy-300">
                <td className="py-3 px-4 font-bold text-navy-800" colSpan={2}>합계</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold text-navy-700">{formatCurrency(totals.sales)}</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold text-navy-700">{formatCurrency(totals.product)}</td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-navy-800">{formatCurrency(totals.gross)}</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold text-red-500">-{formatCurrency(totals.tax)}</td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-navy-800">{formatCurrency(totals.net)}</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
