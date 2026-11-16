import {
  SPEAKING_EXAMS_JPD113,
  SPEAKING_EXAMS_JPD123,
} from "./speaking-data.ts";
import type {
  SpeakingCourse,
  SpeakingExam,
  SpeakingQuestion,
  SpeakingScene,
} from "./speaking-types.ts";
import { saveSpeakingExam } from "./speaking-storage.ts";
import { shuffle } from "./fpt-jpd123-engine.ts";

const RECENT_SPEAKING_EXAM_KEY = "fpt_recent_speaking_exams_v1";
const memoryRecentSpeakingIds = new Set<string>();

export function getRecentSpeakingExamIds(): Set<string> {
  if (typeof window === "undefined") {
    return memoryRecentSpeakingIds;
  }
  try {
    const raw = sessionStorage.getItem(RECENT_SPEAKING_EXAM_KEY);
    if (!raw) return memoryRecentSpeakingIds;
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return memoryRecentSpeakingIds;
  }
}

export function recordSpeakingExamId(id: string): void {
  memoryRecentSpeakingIds.add(id);
  if (typeof window === "undefined") return;
  try {
    const current = Array.from(getRecentSpeakingExamIds());
    const updated = [id, ...current.filter((x) => x !== id)].slice(0, 20);
    sessionStorage.setItem(RECENT_SPEAKING_EXAM_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentSpeakingExamIds(): void {
  memoryRecentSpeakingIds.clear();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECENT_SPEAKING_EXAM_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Sinh đề thi nói ngẫu nhiên từ kho đề hoặc tạo động, không bao giờ trùng lặp
 */
export function generateSpeakingExam(
  course: SpeakingCourse,
  options?: {
    excludeId?: string;
  },
): SpeakingExam {
  const pool = course === "JPD113" ? SPEAKING_EXAMS_JPD113 : SPEAKING_EXAMS_JPD123;
  const recentIds = getRecentSpeakingExamIds();

  // 1. Lọc các đề trong kho chưa từng xem gần đây
  const freshExams = pool.filter((e) => !recentIds.has(e.id) && e.id !== options?.excludeId);

  let selectedExam: SpeakingExam;
  if (freshExams.length > 0) {
    selectedExam = shuffle(freshExams)[0];
  } else {
    // Nếu kho đề mẫu đã xem hết, tự động sinh đề động hoàn toàn mới
    selectedExam = buildDynamicSpeakingExam(course);
  }

  recordSpeakingExamId(selectedExam.id);
  // Tự động lưu đề vào danh sách lưu trữ cho người dùng
  saveSpeakingExam(selectedExam);

  return selectedExam;
}

/**
 * Thuật toán sinh đề thi nói động (Procedural Dynamic Speaking Generator)
 * Luôn tạo ra một đề thi nói mới mẻ, chuẩn cấu trúc 4-5 câu trong tranh + 2 câu ngoài tranh.
 */
export function buildDynamicSpeakingExam(course: SpeakingCourse): SpeakingExam {
  const entropy = Math.random().toString(36).slice(2, 7).toUpperCase();

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (course === "JPD113") {
    // Kịch bản JPD113 động: Phòng học / Thư viện / Ga tàu
    const theme = pick([
      {
        type: "classroom" as const,
        location: "FPT大学の2階教室",
        locationRomaji: "Efu-pii-tii daigaku no ni-kai kyoushitsu",
        title: "大学の午前の教室",
        titleVi: "Lớp học Đại học FPT buổi sáng",
        teacher: "スミス先生（英語の先生）",
        teacherRomaji: "Sumisu-sensei (eigo no sensei)",
        timeJp: "午前十時二十分",
        timeRomaji: "Gozen juu-ji ni-jippun",
        timeVi: "10 giờ 20 phút sáng",
        itemJp: "辞書と ノートと 赤いペン",
        itemRomaji: "Jisho to nooto to akai pen",
        itemVi: "Từ điển, vở ghi và bút đỏ",
      },
      {
        type: "station" as const,
        location: "駅の切符売り場",
        locationRomaji: "Eki no kippu uriba",
        title: "にぎやかな駅の朝",
        titleVi: "Buổi sáng nhộn nhịp tại ga tàu điện",
        teacher: "駅員さん（男の人）",
        teacherRomaji: "Ekiin-san (otoko no hito)",
        timeJp: "午前七時四十五分",
        timeRomaji: "Gozen shichi-ji yon-juu-go-fun",
        timeVi: "7 giờ 45 phút sáng",
        itemJp: "切符と 地下鉄の地図",
        itemRomaji: "Kippu to chikatetsu no chizu",
        itemVi: "Vé tàu và bản đồ tàu điện ngầm",
      },
      {
        type: "cafeteria" as const,
        location: "大学の学生食堂",
        locationRomaji: "Daigaku no gakusei shokudou",
        title: "学生食堂の昼休み",
        titleVi: "Giờ nghỉ trưa tại nhà ăn sinh viên",
        teacher: "食堂のスタッフ（女の人）",
        teacherRomaji: "Shokudou no sutaffu (onna no hito)",
        timeJp: "午後十二時半",
        timeRomaji: "Gogo juu-ni-ji-han",
        timeVi: "12 giờ rưỡi trưa",
        itemJp: "お弁当と お茶と 果物",
        itemRomaji: "Obentou to ocha to kudamono",
        itemVi: "Cơm hộp bento, trà và hoa quả",
      },
    ]);

    const scene: SpeakingScene = {
      id: `scene-dyn-113-${entropy}`,
      type: theme.type,
      title: theme.title,
      titleVi: theme.titleVi,
      location: theme.location,
      description: `Khung cảnh ${theme.titleVi} tại ${theme.location}. Thời gian hiển thị là ${theme.timeVi}. Có ${theme.teacher} đang làm việc. Trên bàn có ${theme.itemVi}. Sinh viên các khoa đang có mặt rất đông vui.`,
      descriptionJp: `${theme.location}の風景です。時間は${theme.timeJp}です。${theme.teacher}がいます。${theme.itemJp}があります。`,
      hotspots: [
        { id: "hs-1", labelJp: theme.teacher, labelVi: "Nhân vật chính", xPercent: 32, yPercent: 42 },
        { id: "hs-2", labelJp: `時計（${theme.timeJp}）`, labelVi: theme.timeVi, xPercent: 78, yPercent: 25 },
        { id: "hs-3", labelJp: theme.itemJp, labelVi: theme.itemVi, xPercent: 55, yPercent: 68 },
        { id: "hs-4", labelJp: "学生たち", labelVi: "Các bạn sinh viên", xPercent: 20, yPercent: 75 },
      ],
      imageUrl: `/images/scenes/${theme.type}.jpg`,
    };

    const pictureQuestions: SpeakingQuestion[] = [
      {
        id: `q-dyn-113-1-${entropy}`,
        type: "in_picture",
        order: 1,
        questionJp: "ここは どこですか。",
        questionRomaji: "Koko wa doko desu ka.",
        questionVi: "Đây là nơi nào?",
        grammarPoint: "Chỉ định từ địa điểm ここ・そこ・あそこ (Bài 2)",
        sampleAnswerJp: `${theme.location}です。`,
        sampleAnswerRomaji: `${theme.locationRomaji} desu.`,
        sampleAnswerVi: `Là ${theme.titleVi}.`,
        shortAnswerJp: `${theme.location}です。`,
        shortAnswerRomaji: `${theme.locationRomaji} desu.`,
        shortAnswerVi: `Là ${theme.titleVi}.`,
        answerGuide: "Chỉ rõ địa điểm theo tranh.",
      },
      {
        id: `q-dyn-113-2-${entropy}`,
        type: "in_picture",
        order: 2,
        questionJp: "いま 何時ですか。",
        questionRomaji: "Ima nan-ji desu ka.",
        questionVi: "Bây giờ là mấy giờ?",
        grammarPoint: "Giờ phút: 〜時〜分 (Bài 3)",
        sampleAnswerJp: `${theme.timeJp}です。`,
        sampleAnswerRomaji: `${theme.timeRomaji} desu.`,
        sampleAnswerVi: `Bây giờ là ${theme.timeVi}.`,
        shortAnswerJp: `${theme.timeJp}です。`,
        shortAnswerRomaji: `${theme.timeRomaji} desu.`,
        shortAnswerVi: `${theme.timeVi}.`,
        answerGuide: "Đọc rõ ràng cả giờ và phút.",
      },
      {
        id: `q-dyn-113-3-${entropy}`,
        type: "in_picture",
        order: 3,
        questionJp: "机の上に 何が ありますか。",
        questionRomaji: "Tsukue no ue ni nani ga arimasu ka.",
        questionVi: "Trên bàn có những đồ vật gì?",
        grammarPoint: "Liệt kê N1 と N2 (Bài 1 & 2)",
        sampleAnswerJp: `${theme.itemJp}が あります。`,
        sampleAnswerRomaji: `${theme.itemRomaji} ga arimasu.`,
        sampleAnswerVi: `Có ${theme.itemVi}.`,
        shortAnswerJp: `${theme.itemJp}が あります。`,
        shortAnswerRomaji: `${theme.itemRomaji} ga arimasu.`,
        shortAnswerVi: `Có ${theme.itemVi}.`,
        answerGuide: "Dùng trợ từ『と』khi liệt kê đồ vật.",
      },
      {
        id: `q-dyn-113-4-${entropy}`,
        type: "in_picture",
        order: 4,
        questionJp: "あの 人は だれですか。",
        questionRomaji: "Ano hito wa dare desu ka.",
        questionVi: "Người đằng kia là ai?",
        grammarPoint: "Chỉ từ & Danh từ は Danh từ です (Bài 1)",
        sampleAnswerJp: `${theme.teacher}です。`,
        sampleAnswerRomaji: `${theme.teacherRomaji} desu.`,
        sampleAnswerVi: `Đó là ${theme.teacher}.`,
        shortAnswerJp: `${theme.teacher}です。`,
        shortAnswerRomaji: `${theme.teacherRomaji} desu.`,
        shortAnswerVi: `Là ${theme.teacher}.`,
        answerGuide: "Nêu tên và vai trò của nhân vật trong tranh.",
      },
    ];

    const extensionQuestions: SpeakingQuestion[] = [
      {
        id: `q-dyn-113-ext1-${entropy}`,
        type: "extension",
        order: 5,
        questionJp: "毎朝、何時に 起きますか。",
        questionRomaji: "Maiasa, nan-ji ni okimasu ka.",
        questionVi: "Mỗi sáng bạn thức dậy lúc mấy giờ?",
        grammarPoint: "Thời điểm に Động từ (Bài 3)",
        sampleAnswerJp: "午前六時半に 起きます。",
        sampleAnswerRomaji: "Gozen roku-ji-han ni okimasu.",
        sampleAnswerVi: "Tôi thức dậy lúc 6 giờ rưỡi sáng.",
        shortAnswerJp: "六時半に 起きます。",
        shortAnswerRomaji: "Roku-ji-han ni okimasu.",
        shortAnswerVi: "Tôi dậy lúc 6 giờ rưỡi.",
        answerGuide: "Nhớ dùng trợ từ『に』chỉ mốc thời gian cụ thể.",
      },
      {
        id: `q-dyn-113-ext2-${entropy}`,
        type: "extension",
        order: 6,
        questionJp: "今日は 何曜日ですか。",
        questionRomaji: "Kyou wa nan-youbi desu ka.",
        questionVi: "Hôm nay là thứ mấy?",
        grammarPoint: "Thứ trong tuần (Bài 3)",
        sampleAnswerJp: "日曜日です。",
        sampleAnswerRomaji: "Nichi-youbi desu.",
        sampleAnswerVi: "Hôm nay là Chủ nhật.",
        shortAnswerJp: "日曜日です。",
        shortAnswerRomaji: "Nichi-youbi desu.",
        shortAnswerVi: "Là Chủ nhật.",
        answerGuide: "Nêu thứ trong tuần: 月・火・水・木・金・土・日曜日.",
      },
    ];

    const exam: SpeakingExam = {
      id: `dyn-sp-jpd113-${Date.now()}-${entropy}`,
      course: "JPD113",
      title: `JPD113 口頭試験 #${entropy}`,
      titleVi: `Đề thi nói JPD113 #${entropy} · ${theme.titleVi}`,
      createdAt: new Date().toISOString(),
      scene,
      pictureQuestions,
      extensionQuestions,
      isAiGenerated: true,
      provider: "Sumi FPT Speaking Dynamic Engine",
    };

    return exam;
  }

  // JPD123 (Bài 4–7): Quán cà phê / Ký túc xá / Phố cổ Asakusa
  const scenario = pick([
    {
      type: "cafe" as const,
      location: "FPT大学のオープンカフェ",
      title: "カフェで楽しむ午後",
      titleVi: "Buổi chiều thư giãn tại quán cà phê FPT",
      actionManJp: "冷たい コーヒーを 飲んで、本を 読んでいます",
      actionManRomaji: "Tsumetai kouhii o nonde, hon o yonde imasu",
      actionManVi: "Đang uống cà phê mát lạnh và đọc sách",
      shortActionManJp: "本を 読んでいます",
      shortActionManRomaji: "Hon o yonde imasu",
      shortActionManVi: "Đang đọc sách",
      actionWomanJp: "パソコンで 日本語を 勉強しています",
      actionWomanRomaji: "Pasokon de nihongo o benkyou shite imasu",
      actionWomanVi: "Đang học tiếng Nhật bằng máy tính",
      shortActionWomanJp: "勉強しています",
      shortActionWomanRomaji: "Benkyou shite imasu",
      shortActionWomanVi: "Đang học bài",
      compareItem1: "コーヒー（三百五十円）",
      compareItem2: "ジュース（四百円）",
      compareQuestionJp: "コーヒーと ジュースと どちらが 高いですか。",
      compareQuestionRomaji: "Kouhii to juusu to dochira ga takai desu ka.",
      compareQuestionVi: "Cà phê và nước ép, món nào đắt hơn?",
      compareAnswerJp: "ジュースの ほうが 高いです。四百円ですから",
      compareAnswerRomaji: "Juusu no hou ga takai desu. Yonhyaku-en desu kara",
      compareAnswerVi: "Nước ép đắt hơn. Vì có giá 400 yên (cà phê 350 yên)",
      shortCompareAnswerJp: "ジュースの ほうが 高いです",
      shortCompareAnswerRomaji: "Juusu no hou ga takai desu",
      shortCompareAnswerVi: "Nước ép đắt hơn",
      atmosphereQuestionJp: "このカフェは 静かですか。",
      atmosphereQuestionRomaji: "Kono kafe wa shizuka desu ka.",
      atmosphereQuestionVi: "Quán cà phê này có yên tĩnh không?",
      atmosphere: "はい、とても 静かです",
      atmosphereRomaji: "Hai, totemo shizuka desu",
      atmosphereVi: "Vâng, rất yên tĩnh",
      shortAtmosphereJp: "静かです",
      shortAtmosphereRomaji: "Shizuka desu",
      shortAtmosphereVi: "Yên tĩnh",
    },
    {
      type: "dormitory" as const,
      location: "FPT大学の学生寮の部屋",
      title: "学生寮の楽しい休日",
      titleVi: "Ngày nghỉ vui vẻ tại ký túc xá FPT",
      actionManJp: "とり肉の 料理を 作っています",
      actionManRomaji: "Toriniku no ryouri o tsukutte imasu",
      actionManVi: "Đang nấu món thịt gà",
      shortActionManJp: "料理を 作っています",
      shortActionManRomaji: "Ryouri o tsukutte imasu",
      shortActionManVi: "Đang nấu ăn",
      actionWomanJp: "部屋で テレビを 見ています",
      actionWomanRomaji: "Heya de terebi o mite imasu",
      actionWomanVi: "Đang xem tivi trong phòng",
      shortActionWomanJp: "テレビを 見ています",
      shortActionWomanRomaji: "Terebi o mite imasu",
      shortActionWomanVi: "Đang xem tivi",
      compareItem1: "新しい 机",
      compareItem2: "古い 机",
      compareQuestionJp: "新しい 机と 古い 机と どちらが きれいですか。",
      compareQuestionRomaji: "Atarashii tsukue to furui tsukue to dochira ga kirei desu ka.",
      compareQuestionVi: "Bàn mới và bàn cũ, cái nào đẹp hơn?",
      compareAnswerJp: "新しい 机の ほうが きれいです",
      compareAnswerRomaji: "Atarashii tsukue no hou ga kirei desu",
      compareAnswerVi: "Bàn học mới đẹp hơn bàn học cũ",
      shortCompareAnswerJp: "新しい 机の ほうが きれいです",
      shortCompareAnswerRomaji: "Atarashii tsukue no hou ga kirei desu",
      shortCompareAnswerVi: "Bàn mới đẹp hơn",
      atmosphereQuestionJp: "この部屋は 暖かいですか。",
      atmosphereQuestionRomaji: "Kono heya wa atatakai desu ka.",
      atmosphereQuestionVi: "Căn phòng này có ấm áp không?",
      atmosphere: "はい、とても 暖かいです",
      atmosphereRomaji: "Hai, totemo atatakai desu",
      atmosphereVi: "Vâng, rất ấm áp",
      shortAtmosphereJp: "暖かいです",
      shortAtmosphereRomaji: "Atatakai desu",
      shortAtmosphereVi: "Ấm áp",
    },
    {
      type: "asakusa" as const,
      location: "東京・浅草寺の雷門の前",
      title: "東京浅草の観光",
      titleVi: "Du lịch thắng cảnh Asakusa Tokyo",
      actionManJp: "大きい 門の前で 写真を 撮っています",
      actionManRomaji: "Ookii mon no mae de shashin o totte imasu",
      actionManVi: "Đang chụp ảnh kỷ niệm trước cổng lớn Kaminarimon",
      shortActionManJp: "写真を 撮っています",
      shortActionManRomaji: "Shashin o totte imasu",
      shortActionManVi: "Đang chụp ảnh",
      actionWomanJp: "店で かわいい 人形を 買っています",
      actionWomanRomaji: "Mise de kawaii ningyou o katte imasu",
      actionWomanVi: "Đang mua búp bê truyền thống dễ thương tại cửa hàng",
      shortActionWomanJp: "人形を 買っています",
      shortActionWomanRomaji: "Ningyou o katte imasu",
      shortActionWomanVi: "Đang mua búp bê",
      compareItem1: "新幹線",
      compareItem2: "バス",
      compareQuestionJp: "新幹線と バスと どちらが 速いですか。",
      compareQuestionRomaji: "Shinkansen to basu to dochira ga hayai desu ka.",
      compareQuestionVi: "Tàu shinkansen và xe buýt, phương tiện nào nhanh hơn?",
      compareAnswerJp: "新幹線の ほうが 速いです",
      compareAnswerRomaji: "Shinkansen no hou ga hayai desu",
      compareAnswerVi: "Tàu shinkansen nhanh hơn so với xe buýt",
      shortCompareAnswerJp: "新幹線の ほうが 速いです",
      shortCompareAnswerRomaji: "Shinkansen no hou ga hayai desu",
      shortCompareAnswerVi: "Tàu shinkansen nhanh hơn",
      atmosphereQuestionJp: "浅草は にぎやかですか。",
      atmosphereQuestionRomaji: "Asakusa wa nigiyaka desu ka.",
      atmosphereQuestionVi: "Asakusa có nhộn nhịp không?",
      atmosphere: "はい、とても にぎやかです",
      atmosphereRomaji: "Hai, totemo nigiyaka desu",
      atmosphereVi: "Vâng, rất nhộn nhịp",
      shortAtmosphereJp: "にぎやかです",
      shortAtmosphereRomaji: "Nigiyaka desu",
      shortAtmosphereVi: "Nhộn nhịp",
    },
  ]);

  const scene: SpeakingScene = {
    id: `scene-dyn-123-${entropy}`,
    type: scenario.type,
    title: scenario.title,
    titleVi: scenario.titleVi,
    location: scenario.location,
    description: `Khung cảnh ${scenario.titleVi} tại ${scenario.location}. Không khí ${scenario.atmosphereVi}. Người nam ${scenario.actionManVi}. Người nữ ${scenario.actionWomanVi}. Xung quanh có các chi tiết về đồ ăn, phương tiện và đồ dùng sinh hoạt.`,
    descriptionJp: `${scenario.location}の風景です。男性は${scenario.actionManJp}。女性は${scenario.actionWomanJp}。とても ${scenario.shortAtmosphereJp}。`,
    hotspots: [
      { id: "hs-1", labelJp: "男性の行動", labelVi: scenario.actionManVi, xPercent: 28, yPercent: 45 },
      { id: "hs-2", labelJp: "女性の行動", labelVi: scenario.actionWomanVi, xPercent: 70, yPercent: 48 },
      { id: "hs-3", labelJp: scenario.compareItem1, labelVi: "Vật thể 1", xPercent: 45, yPercent: 68 },
      { id: "hs-4", labelJp: "様子", labelVi: scenario.atmosphereVi, xPercent: 82, yPercent: 22 },
    ],
    imageUrl: `/images/scenes/${scenario.type}.jpg`,
  };

  const pictureQuestions: SpeakingQuestion[] = [
    {
      id: `q-dyn-123-1-${entropy}`,
      type: "in_picture",
      order: 1,
      questionJp: "男の人は いま 何を していますか。",
      questionRomaji: "Otoko no hito wa ima nani o shite imasu ka.",
      questionVi: "Người đàn ông bây giờ đang làm gì?",
      grammarPoint: "Hiện tại tiếp diễn thể て: Vています (Bài 7)",
      sampleAnswerJp: `${scenario.actionManJp}。`,
      sampleAnswerRomaji: `${scenario.actionManRomaji}.`,
      sampleAnswerVi: `Anh ấy ${scenario.actionManVi}.`,
      shortAnswerJp: `${scenario.shortActionManJp}。`,
      shortAnswerRomaji: `${scenario.shortActionManRomaji}.`,
      shortAnswerVi: `${scenario.shortActionManVi}.`,
      answerGuide: "Dùng thể tiếp diễn『〜ています』để miêu tả hành động trong tranh.",
    },
    {
      id: `q-dyn-123-2-${entropy}`,
      type: "in_picture",
      order: 2,
      questionJp: "女の人は いま 何を していますか。",
      questionRomaji: "Onna no hito wa ima nani o shite imasu ka.",
      questionVi: "Người phụ nữ bây giờ đang làm gì?",
      grammarPoint: "Vています (Bài 7)",
      sampleAnswerJp: `${scenario.actionWomanJp}。`,
      sampleAnswerRomaji: `${scenario.actionWomanRomaji}.`,
      sampleAnswerVi: `Cô ấy ${scenario.actionWomanVi}.`,
      shortAnswerJp: `${scenario.shortActionWomanJp}。`,
      shortAnswerRomaji: `${scenario.shortActionWomanRomaji}.`,
      shortAnswerVi: `${scenario.shortActionWomanVi}.`,
      answerGuide: "Miêu tả chính xác hành động của nhân vật nữ.",
    },
    {
      id: `q-dyn-123-3-${entropy}`,
      type: "in_picture",
      order: 3,
      questionJp: scenario.compareQuestionJp,
      questionRomaji: scenario.compareQuestionRomaji,
      questionVi: scenario.compareQuestionVi,
      grammarPoint: "So sánh lựa chọn: A と B と どちらが (Bài 6)",
      sampleAnswerJp: `${scenario.compareAnswerJp}。`,
      sampleAnswerRomaji: `${scenario.compareAnswerRomaji}.`,
      sampleAnswerVi: `${scenario.compareAnswerVi}.`,
      shortAnswerJp: `${scenario.shortCompareAnswerJp}。`,
      shortAnswerRomaji: `${scenario.shortCompareAnswerRomaji}.`,
      shortAnswerVi: `${scenario.shortCompareAnswerVi}.`,
      answerGuide: "Cấu trúc trả lời so sánh:『[A] の ほうが 〜 です』.",
    },
    {
      id: `q-dyn-123-4-${entropy}`,
      type: "in_picture",
      order: 4,
      questionJp: scenario.atmosphereQuestionJp,
      questionRomaji: scenario.atmosphereQuestionRomaji,
      questionVi: scenario.atmosphereQuestionVi,
      grammarPoint: "Tính từ miêu tả: な và い (Bài 4)",
      sampleAnswerJp: `${scenario.atmosphere}。`,
      sampleAnswerRomaji: `${scenario.atmosphereRomaji}.`,
      sampleAnswerVi: `${scenario.atmosphereVi}.`,
      shortAnswerJp: `${scenario.shortAtmosphereJp}。`,
      shortAnswerRomaji: `${scenario.shortAtmosphereRomaji}.`,
      shortAnswerVi: `${scenario.shortAtmosphereVi}.`,
      answerGuide: "Trả lời xác nhận bằng tính từ:『はい、〜です』hoặc『いいえ、〜ではありません』.",
    },
    {
      id: `q-dyn-123-5-${entropy}`,
      type: "in_picture",
      order: 5,
      questionJp: "テーブルの上に 何が ありますか。",
      questionRomaji: "Teeburu no ue ni nani ga arimasu ka.",
      questionVi: "Trên bàn có những món đồ gì?",
      grammarPoint: "Vị trí & Danh từ (Bài 4 & 7)",
      sampleAnswerJp: "飲み物の コップや パソコン、本が あります。",
      sampleAnswerRomaji: "Nomimono no koppu ya pasokon, hon ga arimasu.",
      sampleAnswerVi: "Có cốc đồ uống, máy tính xách tay và sách.",
      shortAnswerJp: "パソコンが あります。",
      shortAnswerRomaji: "Pasokon ga arimasu.",
      shortAnswerVi: "Có máy tính.",
      answerGuide: "Quan sát kỹ các chi tiết nhỏ trên mặt bàn.",
    },
  ];

  const extensionQuestions: SpeakingQuestion[] = [
    {
      id: `q-dyn-123-ext1-${entropy}`,
      type: "extension",
      order: 6,
      questionJp: "休みの日に 何を しますか。",
      questionRomaji: "Yasumi no hi ni nani o shimasu ka.",
      questionVi: "Vào ngày nghỉ bạn làm gì?",
      grammarPoint: "Mục đích di chuyển & Hành động cuối tuần (Bài 5)",
      sampleAnswerJp: "友達と 買い物に 行きます。",
      sampleAnswerRomaji: "Tomodachi to kaimono ni ikimasu.",
      sampleAnswerVi: "Tôi cùng bạn bè đi mua sắm.",
      shortAnswerJp: "買い物に 行きます。",
      shortAnswerRomaji: "Kaimono ni ikimasu.",
      shortAnswerVi: "Đi mua sắm.",
      answerGuide: "Nêu địa điểm di chuyển Bài 5『〜へ 行きます』hoặc hành động『〜を します』.",
    },
    {
      id: `q-dyn-123-ext2-${entropy}`,
      type: "extension",
      order: 7,
      questionJp: "いま、何が いちばん 欲しいですか。",
      questionRomaji: "Ima, nani ga ichiban hoshii desu ka.",
      questionVi: "Bây giờ bạn muốn có thứ gì nhất?",
      grammarPoint: "Mong muốn: N が ほしいです (Bài 5)",
      sampleAnswerJp: "新しい パソコンが 欲しいです。",
      sampleAnswerRomaji: "Atarashii pasokon ga hoshii desu.",
      sampleAnswerVi: "Tôi muốn có một chiếc máy tính mới.",
      shortAnswerJp: "パソコンが 欲しいです。",
      shortAnswerRomaji: "Pasokon ga hoshii desu.",
      shortAnswerVi: "Muốn có máy tính.",
      answerGuide: "Cấu trúc:『[Danh từ] が 欲しいです』.",
    },
  ];

  const exam: SpeakingExam = {
    id: `dyn-sp-jpd123-${Date.now()}-${entropy}`,
    course: "JPD123",
    title: `JPD123 口頭試験 #${entropy}`,
    titleVi: `Đề thi nói JPD123 #${entropy} · ${scenario.titleVi}`,
    createdAt: new Date().toISOString(),
    scene,
    pictureQuestions,
    extensionQuestions,
    isAiGenerated: true,
    provider: "Sumi FPT Speaking Dynamic Engine",
  };

  return exam;
}
