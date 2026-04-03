'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Payslip, PayslipFilter, PayslipSaveInput, PayslipWithEmployee } from '@/lib/types'

export function usePayslips() {
  const [payslips, setPayslips] = useState<PayslipWithEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getPayslipByEmployeeMonth = useCallback(
    async (employeeId: number, year: number, month: number): Promise<Payslip | null> => {
      const { data, error: err } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()
      if (err) {
        setError(err.message)
        return null
      }
      return data as Payslip | null
    },
    []
  )

  const savePayslip = useCallback(
    async (data: PayslipSaveInput): Promise<{ id: number; updated: boolean } | null> => {
      setError(null)

      // 기존 데이터 확인
      const existing = await getPayslipByEmployeeMonth(data.employee_id, data.year, data.month)
      const updated = !!existing

      const { data: result, error: err } = await supabase
        .from('payslips')
        .upsert(data, { onConflict: 'employee_id,year,month' })
        .select()
        .single()

      if (err) {
        setError(err.message)
        return null
      }

      return { id: (result as Payslip).id, updated }
    },
    [getPayslipByEmployeeMonth]
  )

  const getPayslips = useCallback(async (filters?: PayslipFilter) => {
    setLoading(true)
    setError(null)

    // employees 조인으로 직원명 가져오기
    let query = supabase
      .from('payslips')
      .select('*, employees!inner(name)')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (filters?.year) query = query.eq('year', filters.year)
    if (filters?.month) query = query.eq('month', filters.month)
    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
      setLoading(false)
      return null
    }

    // employees 조인 결과를 flat하게 변환
    const mapped: PayslipWithEmployee[] = (data ?? []).map((row: Record<string, unknown>) => {
      const { employees, ...payslip } = row
      return {
        ...payslip,
        employee_name: (employees as { name: string }).name,
      } as PayslipWithEmployee
    })

    setPayslips(mapped)
    setLoading(false)
    return mapped
  }, [])

  return {
    payslips,
    loading,
    error,
    savePayslip,
    getPayslips,
    getPayslipByEmployeeMonth,
  }
}
