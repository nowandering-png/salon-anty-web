'use client'

import { toPng } from 'html-to-image'

export async function downloadPayslipImage(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  // 고해상도 캡처
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  })

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function payslipImageFilename(year: number, month: number, name: string): string {
  const monthStr = String(month).padStart(2, '0')
  return `${year}_${monthStr}_${name}_지급명세서.png`
}
