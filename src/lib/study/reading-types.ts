export type ReadingCourse = "JPD113" | "JPD123";

export type ReadingQuestion = {
  id: string;
  promptJp?: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: {
    meaning: string;
    reason: string;
    tips?: string;
    wrongOptions?: { option: string; reason: string }[];
  };
};

export type ReadingSentence = {
  jp: string;
  vi: string;
  romaji?: string;
};

export type ReadingPassage = {
  id: string;
  course: ReadingCourse;
  title: string;
  titleVi: string;
  theme: string;
  content: string;
  sentences: ReadingSentence[];
  translation: string;
  romaji: string;
  vocabularyUsed: string[];
  kanjiUsed: string[];
  questions: ReadingQuestion[];
  isAiGenerated?: boolean;
};

export type ReadingPassageSet = {
  id: string;
  course: ReadingCourse;
  title: string;
  titleVi: string;
  passages: ReadingPassage[];
  coveredKanji: string[];
  targetKanjiCount: number;
  coveragePercentage: number;
  isCompleteCoverage: boolean;
};

export type WordInspection = {
  text: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  hanviet?: string;
  isKanji: boolean;
  lesson?: string;
};
