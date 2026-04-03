'use client'

import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import { PayslipCalculation } from '@/lib/types'

// ─── 타입 ────────────────────────────────────────────────

interface PayslipPDFProps {
  calculation: PayslipCalculation
  employeeName: string
  year: number
  month: number
}

export interface GeneratePdfParams {
  calculation: PayslipCalculation
  employeeName: string
  year: number
  month: number
}

// ─── 폰트 등록 ──────────────────────────────────────────

let fontsRegistered = false

function registerFonts() {
  if (fontsRegistered) return

  Font.register({
    family: 'NotoSansKR',
    fonts: [
      { src: '/fonts/NotoSansKR-Regular.ttf', fontWeight: 'normal' },
      { src: '/fonts/NotoSansKR-Bold.ttf', fontWeight: 'bold' },
    ],
  })

  Font.register({
    family: 'LeagueGothic',
    src: '/fonts/LeagueGothic-Regular.ttf',
  })

  fontsRegistered = true
}

// ─── PDF Blob 생성 → 다운로드 ───────────────────────────

export async function downloadPayslipPdf(params: GeneratePdfParams): Promise<void> {
  registerFonts()

  const doc = (
    <PayslipPDFDocument
      calculation={params.calculation}
      employeeName={params.employeeName}
      year={params.year}
      month={params.month}
    />
  )

  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)

  const monthStr = String(params.month).padStart(2, '0')
  const filename = `${params.year}_${monthStr}_${params.employeeName}_지급명세서.pdf`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── 유틸 ────────────────────────────────────────────────

function fmt(value: number): string {
  return Math.abs(value).toLocaleString('ko-KR')
}

function fmtSigned(value: number): string {
  if (value < 0) return `-${fmt(value)}`
  return fmt(value)
}

// ─── 스타일 (흑백 톤) ───────────────────────────────────

const BLACK = '#000000'
const DARK_GRAY = '#333333'
const MID_GRAY = '#666666'
const LIGHT_GRAY = '#F0F0F0'
const BORDER_COLOR = '#666666'
const BORDER_LIGHT = '#999999'

const s = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 9,
    paddingHorizontal: 90,
    paddingVertical: 40,
    color: BLACK,
  },

  // 헤더
  headerWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    height: 50,
    marginBottom: 10,
    objectFit: 'contain' as const,
  },
  title: {
    fontFamily: 'NotoSansKR',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 8,
    color: BLACK,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 11,
    color: MID_GRAY,
  },
  shopNameKr: {
    fontFamily: 'NotoSansKR',
    fontWeight: 'bold',
  },
  shopNameEn: {
    fontFamily: 'LeagueGothic',
    fontSize: 13,
    letterSpacing: 1,
  },

  // 수급자 정보
  infoSection: {
    borderTopWidth: 2,
    borderTopColor: BLACK,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row' as const,
    marginBottom: 3,
  },
  infoLabel: {
    width: 65,
    color: MID_GRAY,
    fontSize: 9,
  },
  infoValue: {
    fontWeight: 'bold',
    fontSize: 9,
    color: BLACK,
  },

  // 테이블
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: DARK_GRAY,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  colGroup: { width: '25%' },
  colLabel: { width: '40%' },
  colAmount: { width: '35%', textAlign: 'right' as const },

  row: {
    flexDirection: 'row' as const,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_LIGHT,
  },
  rowSeparator: {
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  rowHighlight: {
    backgroundColor: LIGHT_GRAY,
  },
  cellGroup: {
    width: '25%',
    fontSize: 8,
    color: MID_GRAY,
  },
  cellLabel: {
    width: '40%',
    fontSize: 9,
    color: BLACK,
  },
  cellAmount: {
    width: '35%',
    fontSize: 9,
    textAlign: 'right' as const,
    color: BLACK,
  },
  cellAmountBold: {
    width: '35%',
    fontSize: 9,
    textAlign: 'right' as const,
    fontWeight: 'bold',
    color: BLACK,
  },

  // 실수령액
  netPaySection: {
    flexDirection: 'row' as const,
    backgroundColor: LIGHT_GRAY,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 0,
    alignItems: 'center' as const,
    borderTopWidth: 2,
    borderTopColor: BLACK,
    borderBottomWidth: 2,
    borderBottomColor: BLACK,
  },
  netPayLabel: {
    width: '65%',
    fontWeight: 'bold',
    fontSize: 13,
    color: BLACK,
  },
  netPayValue: {
    width: '35%',
    fontWeight: 'bold',
    fontSize: 16,
    color: BLACK,
    textAlign: 'right' as const,
  },

  // 하단 서명
  footer: {
    marginTop: 30,
    alignItems: 'center' as const,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  footerText: {
    fontSize: 9,
    color: MID_GRAY,
    marginBottom: 3,
  },
  footerBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BLACK,
    marginTop: 5,
  },
  footerEn: {
    fontFamily: 'LeagueGothic',
    fontSize: 11,
    letterSpacing: 0.5,
  },
})

// ─── 테이블 행 컴포넌트 ─────────────────────────────────

function TableRow({ group, label, value, separator, highlight, bold }: {
  group?: string
  label: string
  value: number
  separator?: boolean
  highlight?: boolean
  bold?: boolean
}) {
  const amountStyle = bold ? s.cellAmountBold : s.cellAmount

  return (
    <View style={[
      s.row,
      separator ? s.rowSeparator : {},
      highlight ? s.rowHighlight : {},
    ]}>
      <Text style={s.cellGroup}>{group || ''}</Text>
      <Text style={s.cellLabel}>{label}</Text>
      <Text style={amountStyle}>{fmtSigned(value)}</Text>
    </View>
  )
}

// ─── 메인 PDF 문서 컴포넌트 ─────────────────────────────

function PayslipPDFDocument({ calculation, employeeName, year, month }: PayslipPDFProps) {
  const monthStr = String(month).padStart(2, '0')
  const today = new Date()
  const payDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* 헤더: 로고 + 타이틀 */}
        <View style={s.headerWrap}>
          <Image src="/logo.png" style={s.logo} />
          <Text style={s.title}>지 급 명 세 서</Text>
          <Text style={s.shopName}>
            <Text style={s.shopNameKr}>살롱앤티</Text>
            {'  '}
            <Text style={s.shopNameEn}>salon anty</Text>
          </Text>
        </View>

        {/* 수급자 정보 */}
        <View style={s.infoSection}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>지급년월</Text>
            <Text style={s.infoValue}>{year}년 {monthStr}월</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>성    명</Text>
            <Text style={s.infoValue}>{employeeName}</Text>
          </View>
        </View>

        {/* 테이블 헤더 */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colGroup]}>구분</Text>
          <Text style={[s.tableHeaderText, s.colLabel]}>항목</Text>
          <Text style={[s.tableHeaderText, s.colAmount]}>금액(원)</Text>
        </View>

        {/* 시술 매출 */}
        <TableRow group="시술 매출" label="매출액" value={calculation.salesAmount} />
        <TableRow label="부가세(10%)" value={-calculation.vatAmount} />
        <TableRow label="부가세차감매출" value={calculation.vatDeducted} />
        <TableRow label="시술수당(45%)" value={calculation.servicePay} bold />

        {/* 제품 판매 */}
        <TableRow group="제품 판매" label="판매액" value={calculation.productAmount} separator />
        <TableRow label="제품수당(50%)" value={calculation.productPay} bold />

        {/* 급여 합계 */}
        <TableRow group="급여 합계" label="총 급여액" value={calculation.grossPay} separator highlight bold />

        {/* 공제 내역 */}
        <TableRow group="공제 내역" label="소득세(3%)" value={-calculation.incomeTax} separator />
        <TableRow label="지방소득세(0.3%)" value={-calculation.localTax} />
        <TableRow label="공제합계(3.3%)" value={-calculation.taxAmount} highlight bold />

        {/* 실수령액 */}
        <View style={s.netPaySection}>
          <Text style={s.netPayLabel}>실수령액</Text>
          <Text style={s.netPayValue}>{fmt(calculation.netPay)}원</Text>
        </View>

        {/* 하단 서명 */}
        <View style={s.footer}>
          <Text style={s.footerText}>위 금액을 정히 지급합니다.</Text>
          <Text style={s.footerText}>지급일: {payDate}</Text>
          <Text style={s.footerBold}>
            사업장: 살롱앤티 (<Text style={s.footerEn}>salon anty</Text>)
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default PayslipPDFDocument
