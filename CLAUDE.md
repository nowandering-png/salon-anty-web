# 살롱앤티 (salon anty) 지급명세서 — 웹 앱

## 프로젝트 개요
미용실 "살롱앤티(salon anty)" 프리랜서 직원의 지급명세서를 자동 계산·생성·PDF 다운로드하는 웹 앱.
맥북과 아이폰 모두 브라우저로 접속하여 동일하게 사용.

## 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **백엔드/DB**: Supabase (기존 levelup 프로젝트의 salon 스키마)
- **인증**: Supabase Auth (이메일/비밀번호 — 대인님 단독 사용)
- **PDF 생성**: @react-pdf/renderer (클라이언트 사이드)
- **배포**: Vercel (무료 Hobby 플랜)
- **폰트**: Noto Sans KR (본문), LeagueGothic (영문 상호)

## Supabase 연결 정보
- 프로젝트: levelup (nowandering team, FREE)
- URL: https://jlvptxeixigflyowvgrb.supabase.co
- 스키마: salon
- 리전: Northeast Asia (Seoul)
- 테이블: salon.employees, salon.payslips (이미 생성 완료)

## 핵심 비즈니스 로직

### 급여 계산 공식
```
[시술 수당]
매출액 입력 → 부가세(10%) 차감 = 매출액 × 0.9
부가세 차감 후 금액 × 45% = 시술 수당

[제품 판매 수당]
제품 판매액 × 50% = 제품 수당

[총 급여]
시술 수당 + 제품 수당 = 총 급여액

[실수령액]
총 급여액 × (1 - 3.3%) = 실수령액
프리랜서 원천징수 3.3% = 소득세 3% + 지방소득세 0.3%
```

### 계산 예시
- 매출액: 5,000,000원
  - 부가세(10%): 500,000원
  - 부가세차감매출: 4,500,000원
  - 시술 수당: 4,500,000 × 0.45 = 2,025,000원
- 제품 판매액: 50,000원
  - 제품 수당: 50,000 × 0.50 = 25,000원
- 총 급여: 2,050,000원  (수정: 2,025,000 + 25,000)
- 3.3% 세금: 67,650원 (소득세 61,500 + 지방소득세 6,150)
- 실수령액: 1,982,350원

## 데이터베이스 (Supabase — salon 스키마, 이미 생성됨)

### salon.employees
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | 자동 증가 |
| name | TEXT NOT NULL | 직원명 |
| phone | TEXT | 연락처 |
| created_at | TIMESTAMPTZ | 생성일 |
| is_active | BOOLEAN | 활성 여부 |

### salon.payslips
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | 자동 증가 |
| employee_id | INTEGER FK | 직원 참조 |
| year | INTEGER | 년도 |
| month | INTEGER | 월 |
| sales_amount | INTEGER | 시술 매출액 |
| product_amount | INTEGER | 제품 판매액 |
| vat_deducted | INTEGER | 부가세 차감 후 매출 |
| service_pay | INTEGER | 시술 수당 |
| product_pay | INTEGER | 제품 수당 |
| gross_pay | INTEGER | 총 급여 |
| tax_amount | INTEGER | 3.3% 원천징수액 |
| income_tax | INTEGER | 소득세 3% |
| local_tax | INTEGER | 지방소득세 0.3% |
| net_pay | INTEGER | 실수령액 |
| created_at | TIMESTAMPTZ | 생성일 |
| UNIQUE | (employee_id, year, month) | 중복 방지 |

### RLS 정책
- 인증된 사용자만 CRUD 가능 (이미 설정됨)

## 인증
- Supabase Auth 이메일/비밀번호 방식
- 대인님 계정 하나만 등록
- 로그인 페이지 → 메인 앱 진입
- 세션 유지 (자동 로그인)

## 파일 구조
```
salon-anty-web/
├── CLAUDE.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                    # Supabase URL + anon key
├── public/
│   ├── fonts/
│   │   ├── NotoSansKR-Regular.ttf
│   │   ├── NotoSansKR-Bold.ttf
│   │   └── LeagueGothic-Regular.ttf
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 루트 레이아웃 (Pretendard 폰트)
│   │   ├── page.tsx              # 로그인 페이지 (미인증 시)
│   │   └── dashboard/
│   │       ├── layout.tsx        # 대시보드 레이아웃 (인증 가드)
│   │       ├── page.tsx          # 지급명세서 작성 (메인)
│   │       ├── employees/
│   │       │   └── page.tsx      # 직원 관리
│   │       └── history/
│   │           └── page.tsx      # 이력 조회
│   ├── lib/
│   │   ├── calculator.ts         # 급여 계산 (순수 함수)
│   │   ├── formatter.ts          # 숫자/날짜 포맷
│   │   ├── types.ts              # 타입 정의
│   │   └── supabase/
│   │       ├── client.ts         # Supabase 브라우저 클라이언트
│   │       ├── server.ts         # Supabase 서버 클라이언트 (SSR)
│   │       └── middleware.ts     # 인증 미들웨어
│   ├── components/
│   │   ├── Layout.tsx            # 반응형 네비게이션
│   │   ├── PayslipForm.tsx       # 지급명세서 작성 폼
│   │   ├── PayslipPreview.tsx    # 실시간 계산 미리보기
│   │   ├── PayslipPDF.tsx        # PDF 문서 정의 (@react-pdf/renderer)
│   │   ├── EmployeeManager.tsx   # 직원 관리
│   │   ├── PayslipHistory.tsx    # 이력 조회
│   │   └── AuthGuard.tsx         # 인증 상태 확인 래퍼
│   └── hooks/
│       ├── useAuth.ts            # 인증 상태 관리
│       ├── useEmployees.ts       # 직원 CRUD
│       └── usePayslips.ts        # 지급명세서 CRUD
└── middleware.ts                  # Next.js 미들웨어 (인증 리다이렉트)
```

## Supabase 클라이언트 설정

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://jlvptxeixigflyowvgrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key
```

### Supabase 쿼리 예시 (salon 스키마 접근)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { schema: 'salon' }  // ← salon 스키마 지정
  }
);

// 직원 목록 조회
const { data } = await supabase
  .from('employees')
  .select('*')
  .eq('is_active', true)
  .order('name');

// 지급명세서 저장 (UPSERT)
const { data } = await supabase
  .from('payslips')
  .upsert(payslipData, {
    onConflict: 'employee_id,year,month'
  });
```

## PDF 생성 (클라이언트 사이드)
```typescript
import { pdf } from '@react-pdf/renderer';
import { PayslipDocument } from '@/components/PayslipPDF';

// PDF Blob 생성 → 다운로드
const blob = await pdf(<PayslipDocument data={payslipData} />).toBlob();
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `${year}_${month}_${name}_지급명세서.pdf`;
link.click();
URL.revokeObjectURL(url);
```

### PDF 폰트 로딩
```typescript
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: '/fonts/NotoSansKR-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansKR-Bold.ttf', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'LeagueGothic',
  src: '/fonts/LeagueGothic-Regular.ttf',
});
```

## PDF 지급명세서 레이아웃
- 흑백 컬러
- 콘텐츠 폭: 페이지의 약 70%
- 상단: logo.png + "지 급 명 세 서" + "살롱앤티 salon anty"
- "salon anty" 영문은 LeagueGothic 폰트, 모두 소문자
- "살롱앤티" 한글은 NotoSansKR-Bold
- 항목: 시술매출 → 제품판매 → 급여합계 → 공제내역 → 실수령액
- 하단: "위 금액을 정히 지급합니다." + 지급일 + 사업장명

## UI 디자인
- 반응형:
  - 데스크톱 (md 이상): 좌측 사이드바 + 우측 메인
  - 모바일 (md 미만): 하단 탭바 + 풀스크린
- 컬러: 깔끔한 흑백/그레이 기조
- 폰트: Pretendard (Google Fonts CDN)
- 숫자: 한국식 콤마, 입력 시 자동 포맷
- 모바일: 숫자 입력 시 inputMode="numeric" (숫자 키패드)
- 터치 친화적 버튼 (최소 44px)

## 배포 (Vercel)
1. GitHub 레포 생성 후 push
2. Vercel에서 Import → 환경변수 설정 (.env.local 값)
3. 자동 배포 완료
4. URL: salon-anty.vercel.app (또는 커스텀 도메인)

## 주의사항
- 모든 금액은 원 단위 정수 (Math.round)
- Supabase 클라이언트 생성 시 schema: 'salon' 반드시 지정
- @react-pdf/renderer는 클라이언트 사이드 전용 — 'use client' 필수
- Noto Sans KR 폰트 파일이 10MB+로 큼 — 초기 PDF 생성 시 로딩 시간 있음
- 직원 삭제 대신 is_active = false (비활성화)
- 같은 직원·같은 월 중복 시 UPSERT (덮어쓰기 확인 다이얼로그)
- RLS가 걸려있으므로 반드시 인증 후 DB 접근
