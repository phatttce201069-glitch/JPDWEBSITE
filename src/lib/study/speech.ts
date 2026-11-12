export interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Dừng toàn bộ âm thanh phát âm tiếng Nhật đang phát.
 */
export function stopJapaneseSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * Phát âm câu hoặc từ vựng tiếng Nhật bằng Web Speech API trên trình duyệt.
 * Tự động hủy âm thanh đang phát trước đó để tránh xung đột tiếng.
 *
 * @param text Văn bản tiếng Nhật cần đọc (Kanji, Kana)
 * @param options Tùy chọn tốc độ đọc và callback khi đọc xong
 */
export function speakJapanese(text: string, options?: SpeakOptions) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options?.onError?.();
    return;
  }

  const cleaned = text
    .replace(/[（(]\s*[）)]/g, "、")
    .replace(/_{2,}/g, "、")
    .trim();

  if (!cleaned) {
    options?.onError?.();
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = "ja-JP";
  utterance.rate = options?.rate ?? 0.92;

  const voices = synth.getVoices();
  const jaVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja"));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  if (options?.onEnd) {
    utterance.onend = options.onEnd;
  }
  utterance.onerror = () => {
    options?.onError?.();
  };

  if (synth.paused) {
    synth.resume();
  }
  synth.speak(utterance);
}
