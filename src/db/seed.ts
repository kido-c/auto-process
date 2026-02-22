import { db } from "./schema";

interface ExerciseSeed {
  name: string;
  category: string;
  subcategory: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  가슴: "#93c5fd",
  등: "#86efac",
  어깨: "#fdba74",
  하체: "#c4b5fd",
  팔: "#f9a8d4",
  코어: "#fde047",
};

const ALL_EXERCISES: ExerciseSeed[] = [
  // 가슴
  { name: "바벨 벤치프레스", category: "가슴", subcategory: "복합 운동" },
  { name: "인클라인 벤치프레스", category: "가슴", subcategory: "복합 운동" },
  { name: "덤벨 벤치프레스", category: "가슴", subcategory: "복합 운동" },
  { name: "체스트 프레스 머신", category: "가슴", subcategory: "복합 운동" },
  { name: "딥스", category: "가슴", subcategory: "복합 운동" },
  { name: "덤벨 플라이", category: "가슴", subcategory: "고립 운동" },
  { name: "케이블 플라이", category: "가슴", subcategory: "고립 운동" },
  { name: "펙덱 머신", category: "가슴", subcategory: "고립 운동" },
  { name: "푸쉬업", category: "가슴", subcategory: "고립 운동" },

  // 등
  { name: "풀업", category: "등", subcategory: "수직 당기기" },
  { name: "친업", category: "등", subcategory: "수직 당기기" },
  { name: "랫풀다운", category: "등", subcategory: "수직 당기기" },
  { name: "어시스트 풀업", category: "등", subcategory: "수직 당기기" },
  { name: "바벨 로우", category: "등", subcategory: "수평 당기기" },
  { name: "덤벨 로우", category: "등", subcategory: "수평 당기기" },
  { name: "시티드 케이블 로우", category: "등", subcategory: "수평 당기기" },
  { name: "T바 로우", category: "등", subcategory: "수평 당기기" },
  { name: "데드리프트", category: "등", subcategory: "후면/기립근" },
  { name: "루마니안 데드리프트", category: "등", subcategory: "후면/기립근" },
  { name: "백 익스텐션", category: "등", subcategory: "후면/기립근" },

  // 어깨
  { name: "덤벨 숄더 프레스", category: "어깨", subcategory: "전면" },
  { name: "바벨 숄더 프레스", category: "어깨", subcategory: "전면" },
  { name: "아놀드 프레스", category: "어깨", subcategory: "전면" },
  { name: "머신 숄더 프레스", category: "어깨", subcategory: "전면" },
  { name: "사이드 레터럴 레이즈", category: "어깨", subcategory: "측면" },
  { name: "케이블 레터럴 레이즈", category: "어깨", subcategory: "측면" },
  { name: "리어 델트 플라이", category: "어깨", subcategory: "후면" },
  { name: "페이스풀", category: "어깨", subcategory: "후면" },
  { name: "벤트오버 레터럴 레이즈", category: "어깨", subcategory: "후면" },

  // 하체
  { name: "스쿼트", category: "하체", subcategory: "대퇴사두" },
  { name: "프론트 스쿼트", category: "하체", subcategory: "대퇴사두" },
  { name: "레그 프레스", category: "하체", subcategory: "대퇴사두" },
  { name: "레그 익스텐션", category: "하체", subcategory: "대퇴사두" },
  { name: "루마니안 데드리프트 (하체)", category: "하체", subcategory: "햄스트링" },
  { name: "레그 컬", category: "하체", subcategory: "햄스트링" },
  { name: "굿모닝", category: "하체", subcategory: "햄스트링" },
  { name: "힙 쓰러스트", category: "하체", subcategory: "둔근" },
  { name: "런지", category: "하체", subcategory: "둔근" },
  { name: "불가리안 스플릿 스쿼트", category: "하체", subcategory: "둔근" },
  { name: "스탠딩 카프 레이즈", category: "하체", subcategory: "종아리" },
  { name: "시티드 카프 레이즈", category: "하체", subcategory: "종아리" },

  // 팔
  { name: "바벨 컬", category: "팔", subcategory: "이두" },
  { name: "덤벨 컬", category: "팔", subcategory: "이두" },
  { name: "해머 컬", category: "팔", subcategory: "이두" },
  { name: "케이블 컬", category: "팔", subcategory: "이두" },
  { name: "프리처 컬", category: "팔", subcategory: "이두" },
  { name: "케이블 푸쉬다운", category: "팔", subcategory: "삼두" },
  { name: "스컬 크러셔", category: "팔", subcategory: "삼두" },
  { name: "오버헤드 익스텐션", category: "팔", subcategory: "삼두" },
  { name: "딥스 (삼두)", category: "팔", subcategory: "삼두" },

  // 코어
  { name: "플랭크", category: "코어", subcategory: "코어" },
  { name: "사이드 플랭크", category: "코어", subcategory: "코어" },
  { name: "행잉 레그레이즈", category: "코어", subcategory: "코어" },
  { name: "레그레이즈", category: "코어", subcategory: "코어" },
  { name: "케이블 크런치", category: "코어", subcategory: "코어" },
  { name: "AB 롤아웃", category: "코어", subcategory: "코어" },
  { name: "러시안 트위스트", category: "코어", subcategory: "코어" },
];

export const CATEGORIES = ["가슴", "등", "어깨", "하체", "팔", "코어"] as const;
export type Category = (typeof CATEGORIES)[number];

export async function seedExercisesIfEmpty(): Promise<void> {
  const count = await db.exercises.count();
  if (count > 0) return;

  const now = Date.now();
  await db.exercises.bulkAdd(
    ALL_EXERCISES.map((e, i) => ({
      id: `seed-${i}`,
      name: e.name,
      type: "strength" as const,
      category: e.category,
      subcategory: e.subcategory,
      createdAt: now + i,
      iconColor: CATEGORY_COLORS[e.category],
    }))
  );
}

export async function migrateExercises(): Promise<void> {
  const existing = await db.exercises.toArray();
  const existingNames = new Set(existing.map((e) => e.name));

  const toAdd = ALL_EXERCISES.filter((e) => !existingNames.has(e.name));
  if (toAdd.length === 0) {
    await backfillCategories(existing);
    return;
  }

  const now = Date.now();
  await db.exercises.bulkAdd(
    toAdd.map((e, i) => ({
      id: `seed-v2-${now}-${i}`,
      name: e.name,
      type: "strength" as const,
      category: e.category,
      subcategory: e.subcategory,
      createdAt: now + i,
      iconColor: CATEGORY_COLORS[e.category],
    }))
  );

  await backfillCategories(existing);
}

async function backfillCategories(existing: { id: string; name: string; category?: string }[]) {
  const lookup = new Map(ALL_EXERCISES.map((e) => [e.name, e]));
  const updates: Promise<number>[] = [];

  for (const ex of existing) {
    if (ex.category) continue;
    const match = lookup.get(ex.name);
    if (match) {
      updates.push(
        db.exercises.update(ex.id, {
          category: match.category,
          subcategory: match.subcategory,
          iconColor: CATEGORY_COLORS[match.category],
        })
      );
    }
  }

  await Promise.all(updates);
}
