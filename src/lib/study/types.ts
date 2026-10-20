/** Hệ chữ viết tiếng Nhật hỗ trợ trong ứng dụng */
export type Script = "hiragana" | "katakana" | "kanji";

/** Tham số tìm kiếm / điều hướng trang Bảng chữ cái */
export type KanaSearch = {
  script: Script;
  row: string;
  mode: "chart" | "study" | "quiz";
  at: number;
};

/** Tham số tìm kiếm / điều hướng trang Từ vựng */
export type WordsSearch = {
  lesson: string;
  mode: "list" | "study" | "sheet";
  at: number;
};

/** Tham số tìm kiếm / điều hướng trang Ngữ pháp */
export type GrammarSearch = {
  lesson: string;
  point: string;
  drill: boolean;
};

/** Tham số tìm kiếm / cấu hình bài thi */
export type ExamSearch = {
  course: "" | "JPD113" | "JPD123" | "starred";
  bai: string;
  ai?: boolean;
};

/** Thông tin vị trí học tập gần nhất của người dùng */
export type LastPlace =
  | { to: "/kana"; label: string; search: KanaSearch }
  | { to: "/words"; label: string; search: WordsSearch }
  | { to: "/grammar"; label: string; search: GrammarSearch }
  | { to: "/exam"; label: string; search: ExamSearch };

/** Cấu trúc một ký tự Kana hoặc Kanji */
export type Glyph = {
  char: string;
  row: string;
  type: Script;
  example?: string;
  romaji?: string;
  onyomi?: string;
  kunyomi?: string;
};

/** Cấu trúc một từ vựng tiếng Nhật */
export type Word = {
  id: number;
  lesson: string;
  course?: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
};

/** Ví dụ minh họa mẫu câu ngữ pháp */
export type GrammarExample = {
  jp: string;
  reading: string;
  romaji: string;
  vi: string;
};

/** Chi tiết một điểm ngữ pháp */
export type GrammarPoint = {
  id: string;
  structure_jp: string;
  structure_vi: string;
  chips: string[];
  formula: string;
  explanation: string;
  usage: string;
  note: string;
  color: string;
  examples: GrammarExample[];
};

/** Cấu trúc một bài học ngữ pháp */
export type GrammarLesson = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  points: GrammarPoint[];
};
