import { User, MealPot } from '../types';

export const COMMON_ALLERGIES = [
  '갑각류 (새우·게)',
  '땅콩·견과류',
  '유제품 (우유·치즈)',
  '밀가루 (글루텐)',
  '계란·난류',
  '메밀',
  '생선·해산물',
  '대두 (콩)',
  '돼지고기',
  '복숭아',
];

export const POPULAR_FOODS = [
  '삼겹살',
  '초밥/스시',
  '파스타',
  '돈까스',
  '김치찌개',
  '피자',
  '햄버거',
  '쌀국수',
  '마라탕',
  '떡볶이',
  '치킨',
  '냉면',
  '텐동/덮밥',
  '샤브샤브',
  '보쌈/족발',
  '닭갈비',
  '카레',
  '중화요리/짜장',
  '순대국/국밥',
  '오이 요리',
  '가지 요리',
];

export const POPULAR_LOCATIONS = [
  '서울 강남역',
  '서울 홍대입구',
  '판교 유스페이스',
  '서울 여의도',
  '서울 성수동',
  '서울 건대입구',
  '서울 종로3가',
  '서울 신촌',
];

export function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_USERS: User[] = [];

export const INITIAL_POTS: MealPot[] = [];

