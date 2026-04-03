'use client'

import { useState, useEffect } from 'react'
import { useEmployees } from '@/hooks/useEmployees'

export default function EmployeeManager() {
  const {
    employees, loading, getEmployees,
    addEmployee, updateEmployee, deactivateEmployee,
  } = useEmployees()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    getEmployees()
  }, [getEmployees])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      await updateEmployee(editingId, { name, phone: phone || undefined })
    } else {
      await addEmployee(name, phone || undefined)
    }
    resetForm()
  }

  async function handleDeactivate(id: number, empName: string) {
    const confirmed = confirm(
      `"${empName}" 직원을 비활성화하시겠습니까?\n\n급여 이력은 보존됩니다.`,
    )
    if (!confirmed) return
    await deactivateEmployee(id)
  }

  function handleEdit(emp: { id: number; name: string; phone: string | null }) {
    setEditingId(emp.id)
    setName(emp.name)
    setPhone(emp.phone || '')
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setPhone('')
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-5 md:mb-6">
        <h2 className="text-xl font-bold text-navy-900">직원 관리</h2>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? '불러오는 중...' : `활성 ${employees.length}명`}
        </p>
      </div>

      <div className="max-w-3xl space-y-4 md:space-y-5">
        {/* 추가/수정 폼 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-3">
            {editingId ? '직원 정보 수정' : '새 직원 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">연락처</label>
              <input
                type="text"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="submit"
                className="bg-navy-700 text-white px-5 py-2.5 rounded-lg hover:bg-navy-800 transition-colors text-sm font-semibold min-h-[44px]"
              >
                {editingId ? '수정' : '등록'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors text-sm min-h-[44px]"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 직원 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 모바일: 카드 리스트 */}
          <div className="md:hidden divide-y divide-slate-100">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-navy-900">{emp.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.phone || '연락처 없음'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="text-navy-500 text-xs font-medium px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors min-h-[44px]"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeactivate(emp.id, emp.name)}
                    className="text-red-400 text-xs font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors min-h-[44px]"
                  >
                    비활성화
                  </button>
                </div>
              </div>
            ))}
            {employees.length === 0 && !loading && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-base mb-1">등록된 직원이 없습니다</p>
                <p className="text-xs">위 폼에서 새 직원을 등록해주세요</p>
              </div>
            )}
          </div>

          {/* 데스크톱: 테이블 */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-5 text-left font-semibold text-navy-700">이름</th>
                <th className="py-3 px-5 text-left font-semibold text-navy-700">연락처</th>
                <th className="py-3 px-5 text-center font-semibold text-navy-700 w-36">관리</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-5 font-medium text-navy-900">{emp.name}</td>
                  <td className="py-3 px-5 text-slate-500">{emp.phone || '-'}</td>
                  <td className="py-3 px-5 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-navy-500 hover:text-navy-700 text-xs font-medium px-2 py-1 rounded hover:bg-navy-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeactivate(emp.id, emp.name)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        비활성화
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <p className="text-base mb-1">등록된 직원이 없습니다</p>
                    <p className="text-xs">위 폼에서 새 직원을 등록해주세요</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
