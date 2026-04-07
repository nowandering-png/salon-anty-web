'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PayslipWithEmployee } from '@/lib/types'
import { calculatePayslip } from '@/lib/calculator'
import { downloadPayslipImage, payslipImageFilename } from '@/lib/exportImage'
import PayslipPreview from './PayslipPreview'

interface Props {
  payslip: PayslipWithEmployee
  onClose: () => void
}

export default function PayslipDetailModal({ payslip, onClose }: Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 모달 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const calculation = calculatePayslip(payslip.sales_amount, payslip.product_amount)

  async function handleImageDownload() {
    if (!previewRef.current) return
    setSaving(true)
    try {
      await downloadPayslipImage(
        previewRef.current,
        payslipImageFilename(payslip.year, payslip.month, payslip.employee_name),
      )
    } catch (err) {
      alert(`이미지 생성 중 오류가 발생했습니다.\n${err}`)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  const modal = (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start md:items-center justify-center p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 rounded-2xl shadow-xl max-w-2xl w-full my-4 mb-24 md:mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-navy-900">
            {payslip.employee_name} · {payslip.year}.{String(payslip.month).padStart(2, '0')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 미리보기 */}
        <div className="p-4 md:p-5">
          <div ref={previewRef}>
            <PayslipPreview
              calculation={calculation}
              employeeName={payslip.employee_name}
              year={payslip.year}
              month={payslip.month}
            />
          </div>
        </div>

        {/* 액션 */}
        <div className="px-5 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white text-navy-700 border border-slate-300 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold min-h-[44px]"
          >
            닫기
          </button>
          <button
            onClick={handleImageDownload}
            disabled={saving}
            className="flex-1 bg-navy-700 text-white py-3 px-4 rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors text-sm font-semibold min-h-[44px]"
          >
            {saving ? '저장 중...' : '이미지 저장'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
