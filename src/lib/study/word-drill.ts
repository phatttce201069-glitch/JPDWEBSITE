import { vocabulary, shuffle } from "./content.ts";
import { kanaReading, romajiOf, sameMeaning, sameReading, speakable } from "./romaji.ts";
import { getOptionReading, hasKanji } from "./kana-reading.ts";
import type { Word } from "./types.ts";

export type WordQuizFormId = "meaning" | "word" | "listen" | "reading" | "write" | "match" | "mix";

export const WORD_QUIZ_FORMS: { id: WordQuizFormId; title: string; note: string }[] = [
  { id: "meaning", title: "Chọn nghĩa", note: "Nhìn từ hoặc câu ngữ cảnh, chọn nghĩa tiếng Việt." },
  { id: "word", title: "Chọn từ", note: "Nhìn nghĩa, chữ Hán hoặc câu ví dụ, chọn từ tiếng Nhật." },
  { id: "listen", title: "Nghe rồi chọn", note: "Nghe phát âm, chọn từ hoặc nghĩa đúng." },
  { id: "reading", title: "Gõ cách đọc", note: "Gõ hiragana hoặc romaji của từ." },
  { id: "write", title: "Gõ nghĩa", note: "Nhớ và gõ nghĩa tiếng Việt của từ." },
  { id: "match", title: "Ghép cặp", note: "Nối từng từ với nghĩa của nó theo từng lượt." },
  { id: "mix", title: "Hỗn hợp", note: "Xen kẽ các dạng câu hỏi đa dạng trong một lượt." },
];

export const DRILL_KINDS: Exclude<WordQuizFormId, "match" | "mix">[] = [
  "meaning",
  "word",
  "listen",
  "reading",
  "write",
];

export type ChoiceOption = {
  text: string;
  reading?: string;
};

export type ChoiceQ = {
  id: string;
  wordId: number;
  kind: "choice";
  form: WordQuizFormId;
  label: string;
  subLabel?: string;
  prompt: string;
  promptJp: boolean;
  reading?: string;
  speak?: string;
  autoSpeak?: boolean;
  answer: string;
  options: ChoiceOption[];
  optionJp: boolean;
  explanation?: string;
};

export type TypeQ = {
  id: string;
  wordId: number;
  kind: "type";
  form: WordQuizFormId;
  label: string;
  subLabel?: string;
  prompt: string;
  promptJp: boolean;
  reading?: string;
  speak?: string;
  placeholder: string;
  reveal: string;
  explanation?: string;
  accept: (value: string) => boolean;
};

export type WordQuizQuestion = ChoiceQ | TypeQ;

/**
 * Trả về cách đọc Hiragana để hiển thị nếu từ có chữ Hán
 */
export function shownReading(word: Word): string | undefined {
  const kana = kanaReading(word);
  if (!kana) return undefined;
  const surface = word.word.replace(/\s+/g, "");
  if (kana.replace(/\s+/g, "") === surface) return undefined;
  return kana;
}

/**
 * Tìm câu ví dụ thích hợp cho từ để tạo câu hỏi điền từ vào ngữ cảnh
 */
function getExampleQuestion(
  word: Word,
): { prompt: string; subLabel: string; blankSentence: string } | null {
  if (!word.example || word.example.trim().length === 0) return null;

  const rawEx = word.example.trim();
  const surface = word.word.replace(/[（(][^）)]*[）)]/g, "").trim();

  // Tách câu tiếng Nhật và phần dịch nếu có dấu mũi tên "→" hoặc "➝"
  let jpPart = rawEx;
  let viPart = "";
  if (rawEx.includes("→")) {
    const parts = rawEx.split("→");
    jpPart = parts[0]?.trim() ?? rawEx;
    viPart = parts[1]?.trim() ?? "";
  } else if (rawEx.includes("➝")) {
    const parts = rawEx.split("➝");
    jpPart = parts[0]?.trim() ?? rawEx;
    viPart = parts[1]?.trim() ?? "";
  }

  if (!jpPart.includes(surface)) {
    // Thử tìm theo reading nếu câu viết bằng hiragana
    const kana = kanaReading(word);
    if (kana && jpPart.includes(kana)) {
      const blankSentence = jpPart.replace(kana, "（　　）");
      return {
        prompt: `Điền từ thích hợp vào chỗ trống trong câu:\n${blankSentence}`,
        subLabel: viPart ? `Ý nghĩa: ${viPart}` : `Nghĩa từ cần điền: ${word.meaning}`,
        blankSentence,
      };
    }
    return null;
  }

  const blankSentence = jpPart.replace(surface, "（　　）");
  return {
    prompt: `Điền từ thích hợp vào chỗ trống trong câu:\n${blankSentence}`,
    subLabel: viPart ? `Ý nghĩa: ${viPart}` : `Nghĩa từ cần điền: ${word.meaning}`,
    blankSentence,
  };
}

/**
 * Lấy danh sách 4 phương án lựa chọn độc lập, đảm bảo không trùng lặp
 */
export function optionsFor(
  answer: ChoiceOption,
  distractorCandidates: ChoiceOption[],
  fallbackPool?: ChoiceOption[],
): ChoiceOption[] {
  const unique: ChoiceOption[] = [];
  const seen = new Set<string>([answer.text.trim().toLowerCase()]);

  for (const item of shuffle(distractorCandidates)) {
    const norm = item.text.trim().toLowerCase();
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    unique.push(item);
    if (unique.length === 3) break;
  }

  // Nếu chưa đủ 3 đáp án nhiễu, lấy thêm từ fallbackPool
  if (unique.length < 3 && fallbackPool) {
    for (const item of shuffle(fallbackPool)) {
      const norm = item.text.trim().toLowerCase();
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      unique.push(item);
      if (unique.length === 3) break;
    }
  }

  return shuffle([answer, ...unique]);
}

/**
 * Tạo câu hỏi cho 1 từ đơn lẻ theo dạng bài tương ứng
 */
export function questionForWord(
  word: Word,
  allWords: Word[],
  kind: Exclude<WordQuizFormId, "match" | "mix">,
  variantIndex = 0,
  broadPool?: Word[],
): WordQuizQuestion {
  const formMeta = WORD_QUIZ_FORMS.find((item) => item.id === kind);
  const label = formMeta?.title ?? "Kiểm tra";
  const surface = word.word;
  const voice = speakable(word);
  const reading = shownReading(word);
  const pool = broadPool && broadPool.length > allWords.length ? broadPool : allWords;

  // DẠNG 1: Gõ cách đọc (reading)
  if (kind === "reading") {
    const kana = kanaReading(word);
    const romaji = romajiOf(word);
    return {
      id: `${word.id}-reading-${variantIndex}`,
      wordId: word.id,
      kind: "type",
      form: "reading",
      label: "Gõ cách đọc",
      subLabel: `Nghĩa của từ: ${word.meaning}`,
      prompt: surface,
      promptJp: true,
      speak: voice,
      placeholder: "Gõ hiragana hoặc romaji",
      reveal: [kana, romaji].filter(Boolean).join(" · "),
      explanation: `Từ 「${surface}」 đọc là 「${kana}」 (${romaji}), nghĩa là "${word.meaning}".`,
      accept: (value) => sameReading(value, word.reading, surface, kana, romaji),
    };
  }

  // DẠNG 2: Gõ nghĩa tiếng Việt (write)
  if (kind === "write") {
    return {
      id: `${word.id}-write-${variantIndex}`,
      wordId: word.id,
      kind: "type",
      form: "write",
      label: "Gõ nghĩa tiếng Việt",
      subLabel: reading ? `Cách đọc: ${reading}` : undefined,
      prompt: surface,
      promptJp: true,
      reading,
      speak: voice,
      placeholder: "Gõ nghĩa tiếng Việt",
      reveal: word.meaning,
      explanation: `「${surface}」 có nghĩa tiếng Việt là: "${word.meaning}".`,
      accept: (value) => sameMeaning(value, word.meaning),
    };
  }

  // DẠNG 3: Nghe rồi chọn (listen)
  if (kind === "listen") {
    const isListenMeaning = variantIndex % 2 === 1;

    if (isListenMeaning) {
      // Nghe -> Chọn nghĩa tiếng Việt
      const candidates = allWords
        .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
        .map((w) => ({ text: w.meaning }));
      const fallbacks = pool
        .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
        .map((w) => ({ text: w.meaning }));
      const options = optionsFor({ text: word.meaning }, candidates, fallbacks);

      return {
        id: `${word.id}-listen-mean-${variantIndex}`,
        wordId: word.id,
        kind: "choice",
        form: "listen",
        label: "Nghe rồi chọn nghĩa",
        subLabel: "Nghe phát âm và chọn nghĩa tiếng Việt chính xác của từ:",
        prompt: "🔊 Nghe và chọn nghĩa",
        promptJp: false,
        speak: voice,
        autoSpeak: true,
        answer: word.meaning,
        options,
        optionJp: false,
        explanation: `Từ vừa phát âm là 「${surface}」 (${reading || word.reading}) mang nghĩa "${word.meaning}".`,
      };
    }

    // Nghe -> Chọn từ tiếng Nhật
    const candidates = allWords
      .filter((w) => w.id !== word.id && w.word !== surface)
      .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
    const fallbacks = pool
      .filter((w) => w.id !== word.id && w.word !== surface)
      .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
    const options = optionsFor(
      { text: surface, reading: reading || getOptionReading(surface) || undefined },
      candidates,
      fallbacks,
    );

    return {
      id: `${word.id}-listen-word-${variantIndex}`,
      wordId: word.id,
      kind: "choice",
      form: "listen",
      label: "Nghe rồi chọn từ",
      subLabel: "Nghe phát âm và chọn từ tiếng Nhật tương ứng:",
      prompt: "🔊 Nghe và chọn từ",
      promptJp: false,
      speak: voice,
      autoSpeak: true,
      answer: surface,
      options,
      optionJp: true,
      explanation: `Từ vừa nghe là 「${surface}」 - nghĩa là: "${word.meaning}".`,
    };
  }

  // DẠNG 4: Chọn từ (word)
  if (kind === "word") {
    // Biến thể A: Điền từ vào câu ví dụ ngữ cảnh (nếu có ví dụ)
    const exQ = getExampleQuestion(word);
    if (exQ && variantIndex % 3 === 1) {
      const candidates = allWords
        .filter((w) => w.id !== word.id && w.word !== surface)
        .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
      const fallbacks = pool
        .filter((w) => w.id !== word.id && w.word !== surface)
        .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
      const options = optionsFor(
        { text: surface, reading: reading || getOptionReading(surface) || undefined },
        candidates,
        fallbacks,
      );

      return {
        id: `${word.id}-word-ctx-${variantIndex}`,
        wordId: word.id,
        kind: "choice",
        form: "word",
        label: "Điền từ vào câu",
        subLabel: exQ.subLabel,
        prompt: exQ.prompt,
        promptJp: true,
        answer: surface,
        options,
        optionJp: true,
        explanation: `Đáp án đúng là 「${surface}」. ${exQ.subLabel}`,
      };
    }

    // Biến thể B: Hỏi Hán tự (Kanji) nếu từ có Kanji và biến thể % 3 === 2
    if (hasKanji(surface) && variantIndex % 3 === 2 && word.reading) {
      const candidates = allWords
        .filter((w) => w.id !== word.id && w.word !== surface && hasKanji(w.word))
        .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
      const fallbacks = pool
        .filter((w) => w.id !== word.id && w.word !== surface && hasKanji(w.word))
        .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
      const options = optionsFor(
        { text: surface, reading: reading || getOptionReading(surface) || undefined },
        candidates,
        fallbacks,
      );

      return {
        id: `${word.id}-word-kanji-${variantIndex}`,
        wordId: word.id,
        kind: "choice",
        form: "word",
        label: "Chọn chữ Hán (Kanji)",
        subLabel: `Nghĩa: "${word.meaning}"`,
        prompt: `Từ「${word.reading}」được viết bằng Hán tự (Kanji) nào?`,
        promptJp: true,
        answer: surface,
        options,
        optionJp: true,
        explanation: `「${word.reading}」 viết bằng Hán tự là 「${surface}」, nghĩa là "${word.meaning}".`,
      };
    }

    // Biến thể C: Cho nghĩa -> Chọn từ tiếng Nhật
    const candidates = allWords
      .filter((w) => w.id !== word.id && w.word !== surface)
      .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
    const fallbacks = pool
      .filter((w) => w.id !== word.id && w.word !== surface)
      .map((w) => ({ text: w.word, reading: shownReading(w) || getOptionReading(w.word) || undefined }));
    const options = optionsFor(
      { text: surface, reading: reading || getOptionReading(surface) || undefined },
      candidates,
      fallbacks,
    );

    return {
      id: `${word.id}-word-standard-${variantIndex}`,
      wordId: word.id,
      kind: "choice",
      form: "word",
      label: "Chọn từ tiếng Nhật",
      subLabel: "Chọn từ tiếng Nhật tương ứng với nghĩa tiếng Việt:",
      prompt: word.meaning,
      promptJp: false,
      speak: voice,
      answer: surface,
      options,
      optionJp: true,
      explanation: `"${word.meaning}" trong tiếng Nhật là 「${surface}」 (${reading || word.reading}).`,
    };
  }

  // DẠNG 5: Chọn nghĩa (meaning)
  // Biến thể A: Câu ví dụ ngữ cảnh (nếu có)
  const exQ = getExampleQuestion(word);
  if (exQ && variantIndex % 2 === 1) {
    const candidates = allWords
      .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
      .map((w) => ({ text: w.meaning }));
    const fallbacks = pool
      .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
      .map((w) => ({ text: w.meaning }));
    const options = optionsFor({ text: word.meaning }, candidates, fallbacks);

    return {
      id: `${word.id}-mean-ctx-${variantIndex}`,
      wordId: word.id,
      kind: "choice",
      form: "meaning",
      label: "Nghĩa trong câu",
      subLabel: `Trong câu「${word.example}」`,
      prompt: `Từ「${surface}」trong câu trên có nghĩa là gì?`,
      promptJp: true,
      reading,
      speak: voice,
      answer: word.meaning,
      options,
      optionJp: false,
      explanation: `Từ 「${surface}」 (${reading || word.reading}) có nghĩa là "${word.meaning}".`,
    };
  }

  // Biến thể B: Nhìn từ -> chọn nghĩa tiếng Việt chuẩn
  const candidates = allWords
    .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
    .map((w) => ({ text: w.meaning }));
  const fallbacks = pool
    .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
    .map((w) => ({ text: w.meaning }));
  const options = optionsFor({ text: word.meaning }, candidates, fallbacks);

  return {
    id: `${word.id}-mean-standard-${variantIndex}`,
    wordId: word.id,
    kind: "choice",
    form: "meaning",
    label: "Chọn nghĩa tiếng Việt",
    subLabel: reading ? `Cách đọc: ${reading}` : undefined,
    prompt: surface,
    promptJp: true,
    reading,
    speak: voice,
    answer: word.meaning,
    options,
    optionJp: false,
    explanation: `Từ 「${surface}」 (${reading || word.reading}) có nghĩa tiếng Việt là: "${word.meaning}".`,
  };
}

/**
 * Xây dựng bộ câu hỏi động không lặp lại:
 * - Ưu tiên các từ chưa luyện tập trong phiên (chưa có trong usedIds)
 * - Đảm bảo mỗi lần bấm "Đề mới" / "Làm lại" đều sinh ra các câu hỏi mới phong phú
 */
export function buildWordQuizQuestions(
  words: Word[],
  form: Exclude<WordQuizFormId, "match">,
  options?: {
    count?: number;
    usedIds?: number[];
    broadPool?: Word[];
    seed?: number;
  },
): {
  questions: WordQuizQuestion[];
  updatedUsedIds: number[];
  totalAvailable: number;
  hasUnseenWords: boolean;
} {
  if (!words || words.length === 0) {
    return { questions: [], updatedUsedIds: [], totalAvailable: 0, hasUnseenWords: false };
  }

  const requestedCount = options?.count ?? Math.min(10, words.length);
  const targetCount = Math.max(1, Math.min(requestedCount, words.length));
  const usedSet = new Set(options?.usedIds ?? []);
  const broadPool = options?.broadPool && options.broadPool.length > 0 ? options.broadPool : vocabulary;

  // Lọc ra các từ chưa luyện tập trong phiên này
  const unusedWords = words.filter((w) => !usedSet.has(w.id));
  const hasUnseenWords = unusedWords.length > 0;

  let selectedWords: Word[] = [];
  let updatedUsedIds: number[] = [...(options?.usedIds ?? [])];

  if (unusedWords.length >= targetCount) {
    // Có đủ từ mới chưa làm: chọn ngẫu nhiên từ nhóm chưa làm
    selectedWords = shuffle(unusedWords).slice(0, targetCount);
    for (const w of selectedWords) {
      updatedUsedIds.push(w.id);
    }
  } else if (unusedWords.length > 0) {
    // Còn một số từ mới chưa làm: lấy hết số từ mới này
    selectedWords = shuffle(unusedWords);
    // Bổ sung thêm các từ khác trong bài đã xáo trộn để đủ targetCount
    const alreadyUsed = words.filter((w) => usedSet.has(w.id));
    const extra = shuffle(alreadyUsed).slice(0, targetCount - selectedWords.length);
    selectedWords = [...selectedWords, ...extra];
    // Đã dùng hết toàn bộ từ của bài: reset danh sách đã làm cho vòng lặp tiếp theo
    updatedUsedIds = selectedWords.map((w) => w.id);
  } else {
    // Đã luyện qua hết từ trong bài: bắt đầu vòng mới với các từ xáo trộn ngẫu nhiên
    selectedWords = shuffle(words).slice(0, targetCount);
    updatedUsedIds = selectedWords.map((w) => w.id);
  }

  const questions = selectedWords.map((word, index) => {
    const kind = form === "mix" ? DRILL_KINDS[index % DRILL_KINDS.length]! : form;
    return questionForWord(word, words, kind, index, broadPool);
  });

  return {
    questions,
    updatedUsedIds,
    totalAvailable: words.length,
    hasUnseenWords,
  };
}

/**
 * Xây dựng các lượt ghép cặp (match) không lặp lại:
 * Mỗi lượt lấy các nhóm 4-5 từ chưa ghép, xáo trộn cả 2 cột.
 */
export function buildMatchRounds(
  words: Word[],
  usedIds?: number[],
): {
  rounds: Word[][];
  updatedUsedIds: number[];
} {
  if (!words || words.length < 2) {
    return { rounds: [], updatedUsedIds: usedIds ?? [] };
  }

  const usedSet = new Set(usedIds ?? []);
  const unusedWords = words.filter((w) => !usedSet.has(w.id));
  const pool = unusedWords.length >= 4 ? unusedWords : words;
  const shuffled = shuffle(pool);

  const rounds: Word[][] = [];
  const newlyUsed = new Set<number>();
  const groupSize = Math.min(5, Math.max(3, Math.floor(pool.length / 2)));

  for (let i = 0; i < shuffled.length; i += groupSize) {
    const slice = shuffled.slice(i, i + groupSize);
    if (slice.length >= 2) {
      rounds.push(slice);
      slice.forEach((w) => newlyUsed.add(w.id));
    }
    if (rounds.length >= 3) break;
  }

  // Nếu chỉ tạo được ít hơn 1 round, lấy nhóm đầu tiên
  if (rounds.length === 0 && words.length >= 2) {
    const slice = shuffle(words).slice(0, Math.min(5, words.length));
    rounds.push(slice);
    slice.forEach((w) => newlyUsed.add(w.id));
  }

  const updatedUsedIds = Array.from(new Set([...(usedIds ?? []), ...newlyUsed]));

  return {
    rounds,
    updatedUsedIds: updatedUsedIds.length >= words.length ? Array.from(newlyUsed) : updatedUsedIds,
  };
}
