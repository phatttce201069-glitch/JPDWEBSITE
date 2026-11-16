export type SpeakingCourse = "JPD113" | "JPD123";

export type SpeakingSceneType =
  | "classroom"
  | "station"
  | "cafeteria"
  | "convenience_store"
  | "fpt_campus"
  | "restaurant"
  | "dormitory"
  | "park"
  | "asakusa"
  | "supermarket"
  | "cafe";

export interface SceneHotspot {
  id: string;
  labelJp: string;
  labelVi: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
}

export interface SpeakingScene {
  id: string;
  type: SpeakingSceneType;
  title: string;
  titleVi: string;
  location: string;
  description: string;
  descriptionJp: string;
  hotspots: SceneHotspot[];
  imageUrl?: string;
}

export type SpeakingQuestionType = "in_picture" | "extension";

export interface SpeakingQuestion {
  id: string;
  type: SpeakingQuestionType;
  order: number;
  questionJp: string;
  questionRomaji: string;
  questionVi: string;
  grammarPoint?: string;
  sampleAnswerJp: string;
  sampleAnswerRomaji: string;
  sampleAnswerVi: string;
  shortAnswerJp?: string;
  shortAnswerRomaji?: string;
  shortAnswerVi?: string;
  answerGuide?: string;
}

export interface SpeakingExam {
  id: string;
  course: SpeakingCourse;
  title: string;
  titleVi: string;
  createdAt: string;
  scene: SpeakingScene;
  pictureQuestions: SpeakingQuestion[]; // 4 to 5 questions
  extensionQuestions: SpeakingQuestion[]; // 2 questions
  isAiGenerated?: boolean;
  provider?: string;
}

export interface SavedSpeakingExamItem {
  id: string;
  exam: SpeakingExam;
  savedAt: string;
}
