import {
  READING_PASSAGES_JPD113,
  READING_PASSAGES_JPD123,
} from "./reading-data.ts";
import type {
  ReadingCourse,
  ReadingPassage,
  ReadingQuestion,
  ReadingSentence,
} from "./reading-types.ts";
import {
  getAllowedKanjiChars,
  replaceUntaughtKanjiWithKana,
  toKana,
} from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";
import { shuffle } from "./fpt-jpd123-engine.ts";

const RECENT_PASSAGE_KEY = "fpt_recent_reading_passages_v1";
const memoryRecentIds = new Set<string>();

/**
 * Lấy danh sách ID các bài đọc đã xem gần đây trong phiên học (Session)
 */
export function getRecentReadingIds(): Set<string> {
  const result = new Set<string>(memoryRecentIds);
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(RECENT_PASSAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((id) => result.add(id));
        }
      }
    } catch {}
  }
  return result;
}

/**
 * Ghi nhận ID bài đọc vừa làm vào bộ nhớ phiên để chống lặp bài đọc
 */
export function recordReadingId(id: string): void {
  memoryRecentIds.add(id);
  if (typeof window === "undefined") return;
  try {
    const list = [...memoryRecentIds];
    // Giữ tối đa 50 ID gần nhất
    const trimmed = list.slice(-50);
    sessionStorage.setItem(RECENT_PASSAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Xóa lịch sử bài đọc gần đây để làm lại từ đầu
 */
export function clearRecentReadingIds(): void {
  memoryRecentIds.clear();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECENT_PASSAGE_KEY);
  } catch {}
}

/**
 * Tự động chuyển đổi các chữ Hán chưa được học trong bài đọc sang Hiragana/Katakana
 */
export function sanitizeReadingPassageKanji(
  passage: ReadingPassage,
  allowedBai: number[],
): ReadingPassage {
  const allowedChars = getAllowedKanjiChars(allowedBai);

  const cleanContent = replaceUntaughtKanjiWithKana(passage.content, allowedChars);
  const cleanSentences: ReadingSentence[] = passage.sentences.map((s) => {
    const cleanJp = replaceUntaughtKanjiWithKana(s.jp, allowedChars);
    const kanaReading = toKana(cleanJp);
    const autoRomaji = toRomaji(kanaReading);
    return {
      jp: cleanJp,
      vi: s.vi,
      romaji: s.romaji || autoRomaji,
    };
  });

  const fullKana = toKana(cleanContent);
  const fullRomaji = toRomaji(fullKana);

  const cleanQuestions: ReadingQuestion[] = passage.questions.map((q) => {
    const cleanPrompt = replaceUntaughtKanjiWithKana(q.prompt, allowedChars);
    const cleanOptions = q.options.map((opt) => replaceUntaughtKanjiWithKana(opt, allowedChars));
    const cleanAnswer = replaceUntaughtKanjiWithKana(q.answer, allowedChars);
    return {
      ...q,
      prompt: cleanPrompt,
      options: cleanOptions,
      answer: cleanAnswer,
    };
  });

  return {
    ...passage,
    content: cleanContent,
    sentences: cleanSentences,
    romaji: passage.romaji || fullRomaji,
    questions: cleanQuestions,
  };
}

/**
 * Sinh bài đọc hiểu theo môn (JPD113 hoặc JPD123) áp dụng thuật toán chống trùng lặp.
 */
export function generateReadingPassage(
  course: ReadingCourse,
  options?: {
    excludeId?: string;
    targetBai?: string[];
  },
): ReadingPassage {
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];
  const pool = course === "JPD113" ? READING_PASSAGES_JPD113 : READING_PASSAGES_JPD123;

  const recentIds = getRecentReadingIds();
  if (options?.excludeId) {
    recentIds.add(options.excludeId);
  }

  // 1. Lọc các bài đọc chưa từng xuất hiện gần đây (Fresh pool)
  const freshPassages = pool.filter((p) => !recentIds.has(p.id));

  // 2. Nếu đã xem hết tất cả các bài đọc trong kho, tái sử dụng toàn bộ pool nhưng loại trừ bài hiện tại
  const candidates =
    freshPassages.length > 0
      ? freshPassages
      : pool.filter((p) => p.id !== options?.excludeId);

  // 3. Xáo trộn ngẫu nhiên và chọn 1 bài đọc
  const selected = shuffle(candidates)[0] || pool[0];

  // 4. Ghi nhận bài đọc vừa chọn vào bộ nhớ phiên
  recordReadingId(selected.id);

  // 5. Chuẩn hóa chữ Hán: Bất kỳ chữ Hán nào chưa được học chính thức đều hiển thị bằng Hiragana
  const sanitized = sanitizeReadingPassageKanji(selected, allowedBai);

  // 6. Xáo trộn thứ tự các lựa chọn trong từng câu hỏi trắc nghiệm A-D
  const randomizedQuestions = sanitized.questions.map((q) => {
    const shuffledOptions = shuffle([...q.options]);
    return {
      ...q,
      options: shuffledOptions,
    };
  });

  return {
    ...sanitized,
    questions: randomizedQuestions,
  };
}
