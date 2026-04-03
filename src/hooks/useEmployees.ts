'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Employee } from '@/lib/types'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (err) {
      setError(err.message)
    } else {
      setEmployees(data as Employee[])
    }
    setLoading(false)
    return data as Employee[] | null
  }, [])

  const addEmployee = useCallback(async (name: string, phone?: string) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('employees')
      .insert({ name, phone: phone || null, is_active: true })
      .select()
      .single()
    if (err) {
      setError(err.message)
      return null
    }
    setEmployees((prev) => [...prev, data as Employee].sort((a, b) => a.name.localeCompare(b.name)))
    return data as Employee
  }, [])

  const updateEmployee = useCallback(async (id: number, updates: { name: string; phone?: string }) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('employees')
      .update({ name: updates.name, phone: updates.phone || null })
      .eq('id', id)
      .select()
      .single()
    if (err) {
      setError(err.message)
      return null
    }
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? (data as Employee) : e)).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data as Employee
  }, [])

  const deactivateEmployee = useCallback(async (id: number) => {
    setError(null)
    const { error: err } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    return true
  }, [])

  return {
    employees,
    loading,
    error,
    getEmployees,
    addEmployee,
    updateEmployee,
    deactivateEmployee,
  }
}
