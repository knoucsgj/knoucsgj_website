/**
 * 한국방송통신대학교 학과 코드 및 학번(앞 8자리: YYYYDD-G) 파싱 유틸리티
 * 
 * 학번 구조 (8자리 예시: 202134-3):
 * - 앞 4자리 (2021): 입학연도
 * - 5~6번째 자리 (34): 학과코드 (34 = 컴퓨터과학과)
 * - 7번째 자리 (-): 구분자(하이픈)
 * - 8번째 자리 (3): 입학학년 (1=1학년 신입학, 2=2학년 편입, 3=3학년 편입 등)
 */

export const KNOU_DEPARTMENTS: Record<string, string> = {
  // 자연과학대학
  '34': '컴퓨터과학과',
  '31': '농학과',
  '32': '생활과학부',
  '35': '통계·데이터과학과',
  '36': '보건환경학과',
  '38': '간호학과',

  // 인문과학대학
  '01': '국어국문학과',
  '02': '영어영문학과',
  '03': '중어중문학과',
  '04': '프랑스언어문화학과',
  '05': '일본학과',

  // 사회과학대학
  '11': '법학과',
  '12': '행정학과',
  '13': '경제학과',
  '14': '경영학과',
  '15': '무역학과',
  '16': '미디어영상학과',
  '17': '관광학과',
  '18': '사회복지학과',

  // 교육과학대학
  '21': '교육학과',
  '22': '청소년교육과',
  '23': '유아교육과',
  '24': '문화교양학과',
  '25': '생활체육지도과',
};

export interface ParsedStudentNo {
  isValid: boolean;
  formatted: string;           // 예: "202134-3"
  admissionYear?: number;      // 입학연도 (예: 2021)
  deptCode?: string;           // 학과코드 (예: "34")
  admissionGrade?: number;     // 입학학년 (예: 3)
  departmentName?: string;     // 학과명 (예: "컴퓨터과학과")
  isCS?: boolean;              // 컴퓨터과학과 여부
}

/**
 * 학번(앞 8자리 또는 레거시 12자리)을 파싱하여 입학연도, 학과코드, 입학학년 정보를 추출합니다.
 */
export function parseStudentNo(rawInput: string | null | undefined): ParsedStudentNo {
  if (!rawInput) return { isValid: false, formatted: '' };

  const cleaned = rawInput.trim();

  // 8자리 포맷 (202134-3)
  const match8 = cleaned.match(/^(\d{4})(\d{2})-([1-9])$/);
  if (match8) {
    const year = parseInt(match8[1], 10);
    const deptCode = match8[2];
    const grade = parseInt(match8[3], 10);
    const deptName = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match8[1]}${deptCode}-${grade}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      departmentName: deptName,
      isCS: deptCode === '34' || (deptName ? deptName.includes('컴퓨터과학') : false),
    };
  }

  // 하이픈 없는 7자리 포맷 (2021343)
  const match7 = cleaned.match(/^(\d{4})(\d{2})([1-9])$/);
  if (match7) {
    const year = parseInt(match7[1], 10);
    const deptCode = match7[2];
    const grade = parseInt(match7[3], 10);
    const deptName = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match7[1]}${deptCode}-${grade}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      departmentName: deptName,
      isCS: deptCode === '34' || (deptName ? deptName.includes('컴퓨터과학') : false),
    };
  }

  // 레거시 12자리 학번 지원 (202134123453 등)
  const match12 = cleaned.match(/^(\d{4})(\d{2})\d{5}(\d)$/);
  if (match12) {
    const year = parseInt(match12[1], 10);
    const deptCode = match12[2];
    const grade = parseInt(match12[3], 10);
    const deptName = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match12[1]}${deptCode}-${grade || 1}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      departmentName: deptName,
      isCS: deptCode === '34' || (deptName ? deptName.includes('컴퓨터과학') : false),
    };
  }

  return { isValid: false, formatted: cleaned };
}

/**
 * 학번 입력 시 자동 하이픈 및 8글자(YYYYDD-G) 포맷팅
 * 입력 예: "2021343" -> "202134-3"
 */
export function formatStudentNoInput(val: string): string {
  // 숫자만 추출
  const digits = val.replace(/[^0-9]/g, '');
  if (digits.length <= 6) {
    return digits;
  }
  // 6자리 초과 시 7번째 숫자 앞에 하이픈 자동 삽입 (최대 7자리 숫자 = 8글자)
  return `${digits.slice(0, 6)}-${digits.slice(6, 7)}`;
}
