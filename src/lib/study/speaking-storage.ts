import type { SpeakingExam } from "./speaking-types.ts";

const STORAGE_KEY = "sumi_saved_speaking_exams_v1";
const memoryStorage: Record<string, string> = {};

function getRawStorage(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] ?? null;
}

function setRawStorage(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(key, value);
  }
  memoryStorage[key] = value;
}

function removeRawStorage(key: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(key);
  }
  delete memoryStorage[key];
}

/**
 * Lấy toàn bộ danh sách đề thi nói đã được lưu từ localStorage (hoặc memory)
 */
export function getSavedSpeakingExams(): SpeakingExam[] {
  try {
    const raw = getRawStorage(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn("[SpeakingStorage] Failed to read saved exams:", err);
    return [];
  }
}

/**
 * Lưu một đề thi nói vào danh sách đề đã tạo (chống trùng lặp id, đưa đề mới lên đầu)
 */
export function saveSpeakingExam(exam: SpeakingExam): boolean {
  try {
    const list = getSavedSpeakingExams();
    const filtered = list.filter((item) => item.id !== exam.id);
    const updated = [exam, ...filtered];
    // Giới hạn lưu tối đa 50 đề gần nhất để tiết kiệm bộ nhớ
    const trimmed = updated.slice(0, 50);
    setRawStorage(STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch (err) {
    console.warn("[SpeakingStorage] Failed to save exam:", err);
    return false;
  }
}

/**
 * Xóa một đề thi nói khỏi danh sách lưu trữ theo ID
 */
export function deleteSpeakingExam(examId: string): boolean {
  try {
    const list = getSavedSpeakingExams();
    const updated = list.filter((item) => item.id !== examId);
    setRawStorage(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn("[SpeakingStorage] Failed to delete exam:", err);
    return false;
  }
}

/**
 * Kiểm tra xem một đề thi nói đã được lưu hay chưa
 */
export function isSpeakingExamSaved(examId: string): boolean {
  const list = getSavedSpeakingExams();
  return list.some((item) => item.id === examId);
}

/**
 * Xóa toàn bộ danh sách đề đã lưu
 */
export function clearAllSavedSpeakingExams(): boolean {
  try {
    removeRawStorage(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
