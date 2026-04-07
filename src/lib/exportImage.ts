'use client'

import { toBlob } from 'html-to-image'

export async function downloadPayslipImage(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const name = filename.endsWith('.png') ? filename : `${filename}.png`

  // 고해상도 캡처 → Blob
  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  })
  if (!blob) throw new Error('이미지 생성 실패')

  // iOS/모바일: Web Share API로 공유 시트 → "이미지 저장"으로 사진첩 직행
  const file = new File([blob], name, { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
  }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (err) {
      // 사용자가 공유 시트를 취소한 경우엔 다운로드 fallback도 거치지 않음
      if (err instanceof Error && err.name === 'AbortError') return
      // 그 외 에러는 다운로드 fallback
    }
  }

  // 데스크톱/미지원 환경: 일반 다운로드
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function payslipImageFilename(year: number, month: number, name: string): string {
  const monthStr = String(month).padStart(2, '0')
  return `${year}_${monthStr}_${name}_지급명세서.png`
}
