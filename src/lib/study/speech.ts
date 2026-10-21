/**
 * Phát âm câu hoặc từ vựng tiếng Nhật bằng Web Speech API trên trình duyệt.
 * Tự động hủy âm thanh đang phát trước đó để tránh xung đột tiếng.
 *
 * @param text Văn bản tiếng Nhật cần đọc (Kanji, Kana)
 */
export function speakJapanese(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}
