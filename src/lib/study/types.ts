export type Script = "hiragana" | "katakana" | "kanji";

export type KanaSearch = {
  script: Script;
  row: string;
  mode: "chart" | "study" | "quiz";
  at: number;
};

export type WordsSearch = {
  lesson: string;
  mode: "list" | "study" | "sheet";
  at: number;
};

export type GrammarSearch = {
  lesson: string;
  point: string;
  drill: boolean;
};

export type ExamSearch = {
  course: "" | "JPD113" | "JPD123" | "starred";
  bai: string;
};

export type LastPlace =
  | { to: "/kana"; label: string; search: KanaSearch }
  | { to: "/words"; label: string; search: WordsSearch }
  | { to: "/grammar"; label: string; search: GrammarSearch }
  | { to: "/exam"; label: string; search: ExamSearch };

export type Glyph = {
  char: string;
  row: string;
  type: Script;
  example?: string;
  romaji?: string;
  onyomi?: string;
  kunyomi?: string;
};

export type Word = {
  id: number;
  lesson: string;
  course?: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
};

export type GrammarExample = {
  jp: string;
  reading: string;
  romaji: string;
  vi: string;
};

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

export type GrammarLesson = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  points: GrammarPoint[];
};
