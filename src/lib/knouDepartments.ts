/**
 * 한국방송통신대학교 단과대학, 학과별 코드 및 학번(앞 8자리: YYYYDD-G) 파싱 유틸리티
 * 
 * 학번 구조 (8자리 예시: 202134-3):
 * - 앞 4자리 (2021): 입학연도
 * - 5~6번째 자리 (34): 학과코드 (34 = 컴퓨터과학과)
 * - 7번째 자리 (-): 구분자(하이픈)
 * - 8번째 자리 (3): 입학학년 (1=1학년 신입학, 2=2학년 편입, 3=3학년 편입 등)
 */

export interface KnouDepartment {
  college: string;
  name: string;
  code: string;
}

/**
 * 방송대 단과대학별 학과 코드 매핑 (출처: Docs/방송대학과별코드.csv)
 */
export const KNOU_DEPARTMENTS: Record<string, KnouDepartment> = {
  // 인문과학대학
  '10': { college: '인문과학대학', name: '국어국문학과', code: '10' },
  '11': { college: '인문과학대학', name: '영어영문학과', code: '11' },
  '12': { college: '인문과학대학', name: '중어중문학과', code: '12' },
  '13': { college: '인문과학대학', name: '프랑스언어문화학과', code: '13' },
  '14': { college: '인문과학대학', name: '일본학과', code: '14' },

  // 사회과학대학
  '21': { college: '사회과학대학', name: '법학과', code: '21' },
  '22': { college: '사회과학대학', name: '행정학과', code: '22' },
  '23': { college: '사회과학대학', name: '경제학과', code: '23' },
  '24': { college: '사회과학대학', name: '경영학과', code: '24' },
  '25': { college: '사회과학대학', name: '무역학과', code: '25' },
  '26': { college: '사회과학대학', name: '미디어영상학과', code: '26' },
  '27': { college: '사회과학대학', name: '도시콘텐츠·관광학과', code: '27' },
  '28': { college: '사회과학대학', name: '사회복지학과', code: '28' },

  // 자연과학대학
  '31': { college: '자연과학대학', name: '농학과', code: '31' },
  '33': { college: '자연과학대학', name: '생활과학부', code: '33' },
  '34': { college: '자연과학대학', name: '컴퓨터과학과', code: '34' },
  '35': { college: '자연과학대학', name: '통계·데이터과학과', code: '35' },
  '36': { college: '자연과학대학', name: '보건환경안전학과', code: '36' },
  '37': { college: '자연과학대학', name: '간호학과', code: '37' },

  // 교육과학대학
  '42': { college: '교육과학대학', name: '유아교육과', code: '42' },
  '43': { college: '교육과학대학', name: '문화교양학과', code: '43' },
  '44': { college: '교육과학대학', name: '교육학과', code: '44' },
  '45': { college: '교육과학대학', name: '청소년교육복지상담학과', code: '45' },
  '46': { college: '교육과학대학', name: '생활체육지도과', code: '46' },

  // 하위 호환성 별칭 매핑
  '01': { college: '인문과학대학', name: '국어국문학과', code: '10' },
  '02': { college: '인문과학대학', name: '영어영문학과', code: '11' },
  '03': { college: '인문과학대학', name: '중어중문학과', code: '12' },
  '04': { college: '인문과학대학', name: '프랑스언어문화학과', code: '13' },
  '05': { college: '인문과학대학', name: '일본학과', code: '14' },
  '32': { college: '자연과학대학', name: '생활과학부', code: '33' },
};

export const KNOU_DEPARTMENT_LIST: KnouDepartment[] = Object.values(KNOU_DEPARTMENTS).filter(
  (v, idx, arr) => arr.findIndex((x) => x.code === v.code) === idx
);

export const KNOU_COLLEGES = ['인문과학대학', '사회과학대학', '자연과학대학', '교육과학대학'] as const;

export interface ParsedStudentNo {
  isValid: boolean;
  formatted: string;           // 예: "202134-3"
  admissionYear?: number;      // 입학연도 (예: 2021)
  deptCode?: string;           // 학과코드 (예: "34")
  admissionGrade?: number;     // 입학학년 (예: 3)
  collegeName?: string;        // 단과대학명 (예: "자연과학대학")
  departmentName?: string;     // 학과명 (예: "컴퓨터과학과")
  isCS?: boolean;              // 컴퓨터과학과 여부
}

/**
 * 학번(앞 8자리 또는 레거시 12자리)을 파싱하여 입학연도, 학과코드, 단과대학, 학과명, 입학학년 정보를 추출합니다.
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
    const dept = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match8[1]}${deptCode}-${grade}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      collegeName: dept?.college,
      departmentName: dept?.name,
      isCS: deptCode === '34' || (dept ? dept.name.includes('컴퓨터과학') : false),
    };
  }

  // 하이픈 없는 7자리 포맷 (2021343)
  const match7 = cleaned.match(/^(\d{4})(\d{2})([1-9])$/);
  if (match7) {
    const year = parseInt(match7[1], 10);
    const deptCode = match7[2];
    const grade = parseInt(match7[3], 10);
    const dept = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match7[1]}${deptCode}-${grade}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      collegeName: dept?.college,
      departmentName: dept?.name,
      isCS: deptCode === '34' || (dept ? dept.name.includes('컴퓨터과학') : false),
    };
  }

  // 레거시 12자리 학번 지원 (202134123453 등)
  const match12 = cleaned.match(/^(\d{4})(\d{2})\d{5}(\d)$/);
  if (match12) {
    const year = parseInt(match12[1], 10);
    const deptCode = match12[2];
    const grade = parseInt(match12[3], 10);
    const dept = KNOU_DEPARTMENTS[deptCode];
    return {
      isValid: true,
      formatted: `${match12[1]}${deptCode}-${grade || 1}`,
      admissionYear: year,
      deptCode,
      admissionGrade: grade,
      collegeName: dept?.college,
      departmentName: dept?.name,
      isCS: deptCode === '34' || (dept ? dept.name.includes('컴퓨터과학') : false),
    };
  }

  return { isValid: false, formatted: cleaned };
}

/**
 * 학번 입력 시 자동 하이픈 및 8글자(YYYYDD-G) 포맷팅
 * 입력 예: "2021343" -> "202134-3"
 */
export function formatStudentNoInput(val: string): string {
  const digits = val.replace(/[^0-9]/g, '');
  if (digits.length <= 6) {
    return digits;
  }
  return `${digits.slice(0, 6)}-${digits.slice(6, 7)}`;
}
