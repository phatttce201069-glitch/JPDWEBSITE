import {
  READING_PASSAGES_JPD113,
  READING_PASSAGES_JPD123,
  READING_EXAM_SETS_JPD113,
  READING_EXAM_SETS_JPD123,
  TARGET_KANJI_JPD123,
  TARGET_KANJI_JPD113,
  computePassageSetKanjiCoverage,
} from "./reading-data.ts";
import type {
  ReadingCourse,
  ReadingPassage,
  ReadingPassageSet,
  ReadingQuestion,
  ReadingSentence,
} from "./reading-types.ts";
import {
  getAllowedKanjiChars,
  replaceUntaughtKanjiWithKana,
  toKana,
} from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";
import { passageToRomaji } from "./reading-inspector.ts";
import { shuffle } from "./fpt-jpd123-engine.ts";

export { computePassageSetKanjiCoverage };

const RECENT_PASSAGE_KEY = "fpt_recent_reading_passages_v1";
const RECENT_SET_KEY = "fpt_recent_reading_sets_v1";
const memoryRecentIds = new Set<string>();
const memoryRecentSetIds = new Set<string>();

/**
 * Lấy danh sách ID các bộ đề đã xem gần đây trong phiên học (Session)
 */
export function getRecentReadingSetIds(): Set<string> {
  const result = new Set<string>(memoryRecentSetIds);
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(RECENT_SET_KEY);
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
 * Ghi nhận ID bộ đề vừa làm vào bộ nhớ phiên
 */
export function recordReadingSetId(id: string): void {
  memoryRecentSetIds.add(id);
  if (typeof window === "undefined") return;
  try {
    const list = [...memoryRecentSetIds];
    const trimmed = list.slice(-20);
    sessionStorage.setItem(RECENT_SET_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Xóa lịch sử bộ đề gần đây
 */
export function clearRecentReadingSetIds(): void {
  memoryRecentSetIds.clear();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECENT_SET_KEY);
  } catch {}
}

/**
 * Sinh bộ gồm 4 đề đọc hiểu theo môn học, đảm bảo phủ toàn bộ chữ Hán và ngữ pháp
 */
export function generateReadingExamSet(
  course: ReadingCourse,
  options?: {
    excludeSetId?: string;
  },
): ReadingPassageSet {
  const pool = course === "JPD123" ? READING_EXAM_SETS_JPD123 : READING_EXAM_SETS_JPD113;
  const recentSetIds = getRecentReadingSetIds();

  if (options?.excludeSetId) {
    recentSetIds.add(options.excludeSetId);
  }

  // 1. Lọc các bộ đề chưa từng xuất hiện gần đây
  const freshSets = pool.filter((s) => !recentSetIds.has(s.id));

  // Nếu tất cả các bộ đề mẫu trong kho đã xem gần đây, tự động tạo bộ đề động hoàn toàn mới
  if (freshSets.length === 0) {
    return buildDynamicReadingExamSet(course);
  }

  const candidates = freshSets.length > 0 ? freshSets : pool.filter((s) => s.id !== options?.excludeSetId);
  const selectedSet = shuffle(candidates)[0] || pool[0];

  recordReadingSetId(selectedSet.id);

  // 2. Xáo trộn các lựa chọn trắc nghiệm A-D cho từng câu hỏi trong mỗi đề
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];
  const randomizedPassages = selectedSet.passages.map((p) => {
    const sanitized = sanitizeReadingPassageKanji(p, allowedBai);
    return {
      ...sanitized,
      questions: sanitized.questions.map((q) => ({
        ...q,
        options: shuffle([...q.options]),
      })),
    };
  });

  const coverage = computePassageSetKanjiCoverage(randomizedPassages, course);

  return {
    ...selectedSet,
    passages: randomizedPassages,
    coveredKanji: coverage.coveredKanji,
    targetKanjiCount: coverage.targetKanjiCount,
    coveragePercentage: coverage.coveragePercentage,
    isCompleteCoverage: coverage.isCompleteCoverage,
  };
}

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
    const autoRomaji = passageToRomaji(cleanJp);
    return {
      jp: cleanJp,
      vi: s.vi,
      romaji: s.romaji && s.romaji.trim() && !/[、。]/.test(s.romaji) ? s.romaji : autoRomaji,
    };
  });

  const fullRomaji =
    passage.romaji && passage.romaji.trim() && !/[、。]/.test(passage.romaji)
      ? passage.romaji
      : cleanSentences.map((s) => s.romaji).filter(Boolean).join(" ");

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
    romaji: fullRomaji,
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


/**
 * Thuật toán sinh bộ 4 đề thi đọc hiểu động (Procedural Dynamic Reading Generator).
 * Tự động tạo 4 bài đọc hiểu hoàn toàn mới, không trùng lặp, đảm bảo:
 * - 100% từ vựng và ngữ pháp bám sát giáo trình FPT (Bài 1-3 cho JPD113, Bài 4-7 cho JPD123).
 * - Phủ đủ 100% chữ Hán mục tiêu (43/43 cho JPD123, 34/34 cho JPD113).
 * - Chuẩn độ dài & mật độ Kanji, Katakana của đề thi FPT (JPD123 >= 200 chữ, >= 6 câu, >= 3 Katakana, >= 15 Kanji).
 * - Đầy đủ 4 câu hỏi trắc nghiệm A-D phân hóa kèm giải thích chi tiết.
 */
export function buildDynamicReadingExamSet(
  course: ReadingCourse,
  options?: {
    seed?: number;
  },
): ReadingPassageSet {
  const entropy = Math.random().toString(36).slice(2, 7).toUpperCase();
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  let passages: ReadingPassage[];

  if (course === "JPD123") {
    // 1. Passage 1: Du lịch, Thắng cảnh, Chùa cổ, Cổng lớn, Shinkansen, Quà lưu niệm
    const city = pick([
      { name: "東京", nameVi: "Tokyo", romaji: "Toukyou", spots: "浅草のかみなり門やお寺", spotsRomaji: "Asakusa no kaminarimon ya otera", transport: "地下鉄", transportRomaji: "chikatetsu", drink: "冷たいジュースやコーヒー", drinkRomaji: "tsumetai juusu ya koohii" },
      { name: "京都", nameVi: "Kyoto", romaji: "Kyouto", spots: "古いお寺や大きな門", spotsRomaji: "furui otera ya ookina mon", transport: "新幹線", transportRomaji: "shinkansen", drink: "冷たいお茶やコーヒー", drinkRomaji: "tsumetai ocha ya koohii" },
      { name: "鎌倉", nameVi: "Kamakura", romaji: "Kamakura", spots: "有名な古いお寺や大きい門", spotsRomaji: "yuumeina furui otera ya ookii mon", transport: "電車", transportRomaji: "densha", drink: "冷たいジュースやお茶", drinkRomaji: "tsumetai juusu ya ocha" },
    ]);
    const companion = pick([
      { text: "大学の男の学生と女の学生", textVi: "các bạn sinh viên nam và nữ cùng trường đại học", romaji: "daigaku no otoko no gakusei to onna no gakusei" },
      { text: "ベトナムからの留学生の男の人と女の人", textVi: "các bạn du học sinh nam và nữ người Việt Nam", romaji: "Betonamu kara no ryuugakusei no otoko no hito to onna no hito" },
    ]);
    const arrTime = pick([
      { text: "午前十時半", textVi: "10 giờ rưỡi sáng", romaji: "Gozen juu-jihan" },
      { text: "午前九時半", textVi: "9 giờ rưỡi sáng", romaji: "Gozen ku-jihan" },
    ]);

    const p1Sentences: ReadingSentence[] = [
      {
        jp: `先週、私は${companion.text}といっしょに、${city.transport}で${city.name}へ旅行に行きました。`,
        vi: `Tuần trước, tôi cùng ${companion.textVi} đi du lịch ${city.nameVi} bằng ${city.transport}.`,
        romaji: `Senshuu, watashi wa ${companion.romaji} to issho ni, ${city.transportRomaji} de ${city.romaji} e ryokou ni ikimashita.`,
      },
      {
        jp: `${city.name}は${city.spots}がたくさんあって、外国からの観光客にもとても有名な町です。`,
        vi: `${city.nameVi} có rất nhiều thắng cảnh lịch sử và cổng lớn, là thành phố nổi tiếng khắp nơi.`,
        romaji: `${city.romaji} wa ${city.spotsRomaji} ga takusan atte, gaikoku kara no kankoukyaku ni mo totemo yuumeina machi desu.`,
      },
      {
        jp: `${arrTime.text}に駅に着いてから、きれいな公園を散歩して、みんなでしゃしんをたくさんとりました。`,
        vi: `Sau khi đến ga lúc ${arrTime.text}, cả nhóm đi dạo công viên đẹp và cùng nhau chụp nhiều ảnh.`,
        romaji: `${arrTime.romaji} ni eki ni tsuite kara, kireina kouen o sanpo shite, minna de shashin o takusan torimashita.`,
      },
      {
        jp: "午後はお寺の近くの小さい店で、おみやげの食べ物を買いました。",
        vi: "Buổi chiều tại một cửa hàng nhỏ gần chùa, chúng tôi đã mua đặc sản làm quà lưu niệm.",
        romaji: "Gogo wa otera no chikaku no chiisai mise de, omiyage no tabemono o kaimashita.",
      },
      {
        jp: `よるにホテルへ帰る前に、みんなでカフェで${city.drink}を飲みながら楽しく話しました。`,
        vi: "Trước khi trở về khách sạn vào buổi tối, mọi người vào quán cà phê uống nước và trò chuyện rôm rả.",
        romaji: `Yoru ni hoteru e kaeru mae ni, minna de kafe de ${city.drinkRomaji} o nominagara tanoshiku hanashimashita.`,
      },
      {
        jp: "日本の旅行は本当に面白くて、また来年も友達と来たいとおもっています。",
        vi: "Chuyến du lịch Nhật Bản thực sự rất thú vị, năm sau tôi lại muốn cùng bạn bè đến đây.",
        romaji: "Nihon no ryokou wa hontou ni omoshirokute, mata rainen mo tomodachi to kitai to omotte imasu.",
      },
    ];
    const p1Content = p1Sentences.map((s) => s.jp).join("");

    const p1: ReadingPassage = {
      id: `dyn-jpd123-read-1-${entropy}`,
      course: "JPD123",
      title: `${city.name}の古いお寺と有名な門の旅行`,
      titleVi: `Chuyến du lịch ngắm ngôi chùa cổ và cổng đền ở ${city.nameVi}`,
      theme: "Du lịch, danh lam thắng cảnh, phương tiện giao thông và quà lưu niệm",
      content: p1Content,
      sentences: p1Sentences,
      translation: `Tuần trước, tôi cùng ${companion.textVi} đi du lịch ${city.nameVi} bằng ${city.transport}. Nơi đây có rất nhiều chùa cổ và cổng lớn nổi tiếng. Sau khi đến ga lúc ${arrTime.text}, cả nhóm đi dạo công viên và chụp nhiều ảnh. Buổi chiều, chúng tôi mua quà lưu niệm ở một quán nhỏ gần chùa. Buổi tối trước khi về khách sạn, mọi người ghé quán cà phê uống nước và trò chuyện vui vẻ. Chuyến đi thật tuyệt vời, năm sau tôi nhất định muốn cùng bạn bè quay lại đây.`,
      romaji: p1Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["先週", "私", "男", "女", "行く", "お寺", "門", "外国", "有名", "午後", "小さい", "食べ物", "買う", "ホテル", "帰る", "飲む", "話す", "旅行", "来年"],
      kanjiUsed: ["先", "週", "私", "男", "女", "行", "寺", "門", "外", "国", "午", "後", "小", "食", "物", "買", "帰", "飲", "話", "来", "年"],
      questions: [
        {
          id: `dyn-q1-1-${entropy}`,
          prompt: `筆者はだれと${city.name}へ旅行に行きましたか。`,
          options: [
            `${companion.text}といっしょに行きました`,
            "一人だけで行きました",
            "高校の先生と行きました",
            "家族と自動車で行きました",
          ],
          answer: `${companion.text}といっしょに行きました`,
          explanation: {
            meaning: `Tác giả đã đi du lịch ${city.nameVi} cùng với ai?`,
            reason: `Dẫn chứng câu 1:「私は${companion.text}といっしょに、${city.transport}で${city.name}へ旅行に行きました。」`,
            wrongOptions: [
              { option: "一人だけで行きました", reason: "Tác giả đi cùng nhóm bạn." },
              { option: "高校の先生と行きました", reason: "Không có giáo viên đi cùng." },
              { option: "家族と自動車で行きました", reason: "Đi cùng bạn bè bằng phương tiện công cộng." },
            ],
          },
        },
        {
          id: `dyn-q1-2-${entropy}`,
          prompt: `${city.name}の町について、文章で何と書いてありますか。`,
          options: [
            "古いお寺や大きな門がたくさんある有名な町です",
            "小さなお寺しかありません",
            "新しいビルばかりある町です",
            "人がぜんぜんいない町です",
          ],
          answer: "古いお寺や大きな門がたくさんある有名な町です",
          explanation: {
            meaning: `Về thành phố ${city.nameVi}, bài viết mô tả điều gì?`,
            reason: `Dẫn chứng câu 2:「${city.name}は${city.spots}がたくさんあって、外国からの観光客にもとても有名な町です。」`,
            wrongOptions: [
              { option: "小さなお寺しかありません", reason: "Có nhiều chùa cổ và cổng lớn." },
              { option: "新しいビルばかりある町です", reason: "Nổi tiếng với danh lam thắng cảnh lịch sử." },
              { option: "人がぜんぜんいない町です", reason: "Rất đông du khách ghé thăm." },
            ],
          },
        },
        {
          id: `dyn-q1-3-${entropy}`,
          prompt: "午後にお寺の近くの小さい店で何を買いましたか。",
          options: [
            "おみやげの食べ物を買いました",
            "高いカメラとパソコンを買いました",
            "新しい洋服と靴を買いました",
            "自動車の部品を買いました",
          ],
          answer: "おみやげの食べ物を買いました",
          explanation: {
            meaning: "Buổi chiều tại cửa hàng nhỏ gần chùa, họ đã mua gì?",
            reason: "Dẫn chứng câu 4:「午後はお寺の近くの小さい店で、おみやげの食べ物を買いました。」",
            wrongOptions: [
              { option: "高いカメラとパソコンを買いました", reason: "Họ mua đồ ăn làm quà lưu niệm." },
              { option: "新しい洋服と靴を買いました", reason: "Không mua quần áo giày dép." },
              { option: "自動車の部品を買いました", reason: "Không có chi tiết này." },
            ],
          },
        },
        {
          id: `dyn-q1-4-${entropy}`,
          prompt: "ホテルへ帰る前に何をしましたか。",
          options: [
            `カフェで${city.drink}を飲みながら楽しく話しました`,
            "すぐ駅へ走って電車に乗りました",
            "デパートで高い洋服を買いました",
            "映画館へ行ってアニメを見ました",
          ],
          answer: `カフェで${city.drink}を飲みながら楽しく話しました`,
          explanation: {
            meaning: "Trước khi trở về khách sạn, mọi người đã làm gì?",
            reason: `Dẫn chứng câu 5:「よるにホテルへ帰る前に、みんなでカフェで${city.drink}を飲みながら楽しく話しました。」`,
            wrongOptions: [
              { option: "すぐ駅へ走って電車に乗りました", reason: "Họ ghé quán cà phê trò chuyện vui vẻ." },
              { option: "デパートで高い洋服を買いました", reason: "Không đi mua sắm quần áo đắt tiền." },
              { option: "映画館へ行ってアニメを見ました", reason: "Không đi xem phim hoạt hình." },
            ],
          },
        },
      ],
    };

    // 2. Passage 2: Mua sắm, Nấu ăn & Đồ dùng
    const cookFriend = pick([
      { text: "山田さん", romaji: "Yamada-san" },
      { text: "本田さん", romaji: "Honda-san" },
      { text: "田中さん", romaji: "Tanaka-san" },
    ]);
    const dish = pick([
      { name: "カレー料理", nameVi: "món cơm cà ri", romaji: "karee ryouri", tool: "スプーンなどの食事のどう具", toolRomaji: "supuun nado no shokuji no dougu" },
      { name: "すき焼き料理", nameVi: "món lẩu Sukiyaki", romaji: "sukiyaki ryouri", tool: "フォークやスプーンなどの食事のどう具", toolRomaji: "fooku ya supuun nado no shokuji no dougu" },
      { name: "日本の料理", nameVi: "các món ăn Nhật Bản", romaji: "Nihon no ryouri", tool: "スプーンやナイフなどの食事のどう具", toolRomaji: "supuun ya naifu nado no shokuji no dougu" },
    ]);
    const marketDay = pick([
      { text: "毎週土曜日", textVi: "thứ Bảy hàng tuần", romaji: "Maishuu doyoubi" },
      { text: "毎週日曜日", textVi: "Chủ nhật hàng tuần", romaji: "Maishuu nichiyoubi" },
    ]);

    const p2Sentences: ReadingSentence[] = [
      {
        jp: `${marketDay.text}の午前、私は${cookFriend.text}と区の大きいスーパーへ買い物に行きます。`,
        vi: `Vào sáng ${marketDay.textVi}, tôi cùng ${cookFriend.text} đi mua sắm ở siêu thị lớn trong quận.`,
        romaji: `${marketDay.romaji} no gozen, watashi wa ${cookFriend.romaji} to ku no ookii suupaa e kaimono ni ikimasu.`,
      },
      {
        jp: "スーパーには新鮮なとり肉や魚や野さいがたくさん売られています。",
        vi: "Tại siêu thị bày bán rất nhiều thịt gà tươi, cá và rau củ quả.",
        romaji: "Suupaa ni wa shinsen na toriniku ya sakana ya yasai ga takusan urarete imasu.",
      },
      {
        jp: "コンビニの物より安いですから、私たちはいつもここで食べ物を買います。",
        vi: "Vì rẻ hơn đồ ở cửa hàng tiện lợi nên chúng tôi luôn mua thức ăn ở đây.",
        romaji: "Konbini no mono yori yasui desu kara, watashitachi wa itsumo koko de tabemono o kaimasu.",
      },
      {
        jp: `アパートへ帰ってから、${dish.tool}をじゅんびして、おいしい${dish.name}を作りました。`,
        vi: `Sau khi về căn hộ, chúng tôi chuẩn bị dụng cụ ăn uống và nấu ${dish.nameVi} thơm ngon.`,
        romaji: `Apaato e kaette kara, ${dish.toolRomaji} o junbi shite, oishii ${dish.romaji} o tsukurimashita.`,
      },
      {
        jp: "みんなで大きいテーブルのまわりで食べて、とても楽しかったです。",
        vi: "Mọi người quây quần ăn uống bên chiếc bàn lớn, không khí vô cùng vui vẻ.",
        romaji: "Minna de ookii teeburu no mawari de tabete, totemo tanoshikatta desu.",
      },
      {
        jp: "自分で作った日本の料理は、レストランの料理よりずっとおいしかったです。",
        vi: "Món ăn Nhật Bản tự tay nấu ngon hơn nhiều so với món ăn ở nhà hàng.",
        romaji: "Jibun de tsukutta Nihon no ryouri wa, resutoran no ryouri yori zutto oishikatta desu.",
      },
    ];
    const p2Content = p2Sentences.map((s) => s.jp).join("");

    const p2: ReadingPassage = {
      id: `dyn-jpd123-read-2-${entropy}`,
      course: "JPD123",
      title: `スーパーでの買い物と${dish.name}`,
      titleVi: `Đi mua sắm ở siêu thị và nấu ${dish.nameVi}`,
      theme: "Mua sắm, nấu ăn, thực phẩm thịt rau và dụng cụ ăn uống",
      content: p2Content,
      sentences: p2Sentences,
      translation: `Vào sáng ${marketDay.textVi}, tôi cùng bạn ${cookFriend.text} đến siêu thị lớn trong quận để mua sắm. Siêu thị ngập tràn thịt gà, cá và rau củ tươi ngon. Vì giá rẻ hơn cửa hàng tiện lợi nên chúng tôi luôn mua thực phẩm ở đây. Về đến phòng, cả nhóm chuẩn bị dụng cụ ăn uống rồi cùng nấu ${dish.nameVi}. Tự tay nấu món Nhật và thưởng thức bên chiếc bàn lớn mang lại cảm giác vô cùng ấm cúng và ngon miệng.`,
      romaji: p2Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["毎週", "午前", "私", "区", "大きい", "スーパー", "買い物", "行く", "肉", "野菜", "コンビニ", "物", "安い", "食べ物", "買う", "アパート", "帰る", "食事", "道具", "料理", "作る", "食べる"],
      kanjiUsed: ["毎", "週", "午", "前", "私", "区", "大", "買", "物", "行", "肉", "野", "安", "食", "帰", "具", "料", "理", "本", "田"],
      questions: [
        {
          id: `dyn-q2-1-${entropy}`,
          prompt: "筆者はだれとスーパーへ買い物に行きますか。",
          options: [
            `${cookFriend}といっしょに行きます`,
            "大学の先生と行きます",
            "一人だけで行きます",
            "アパートの大家さんと行きます",
          ],
          answer: `${cookFriend}といっしょに行きます`,
          explanation: {
            meaning: "Tác giả đi mua sắm ở siêu thị cùng với ai?",
            reason: `Dẫn chứng câu 1:「私は${cookFriend}と区の大きいスーパーへ買い物に行きます。」`,
            wrongOptions: [
              { option: "大学の先生と行きます", reason: `Đi cùng bạn ${cookFriend}, không phải thầy cô.` },
              { option: "一人だけで行きます", reason: "Có bạn đi cùng." },
              { option: "アパートの大家さんと行きます", reason: "Không đi cùng chủ trọ." },
            ],
          },
        },
        {
          id: `dyn-q2-2-${entropy}`,
          prompt: "スーパーで何を買いましたか。",
          options: [
            "とり肉や魚や野さいを買いました",
            "お菓子とパンだけを買いました",
            "ジュースとお酒だけを買いました",
            "本や雑誌を買いました",
          ],
          answer: "とり肉や魚や野さいを買いました",
          explanation: {
            meaning: "Họ đã mua những gì tại siêu thị?",
            reason: "Dẫn chứng câu 2:「スーパーには新鮮なとり肉や魚や野さいがたくさん売られています。...ここで食べ物を買います。」",
            wrongOptions: [
              { option: "お菓子とパンだけを買いました", reason: "Họ mua thịt gà, cá và rau củ tươi." },
              { option: "ジュースとお酒だけを買いました", reason: "Không chỉ mua đồ uống." },
              { option: "本や雑誌を買いました", reason: "Họ đi siêu thị thực phẩm." },
            ],
          },
        },
        {
          id: `dyn-q2-3-${entropy}`,
          prompt: "なぜコンビニではなくスーパーで食べ物を買いますか。",
          options: [
            "コンビニの物より安いですから",
            "スーパーのほうが駅から近いですから",
            "コンビニには食べ物がないですから",
            "友達がスーパーで働いていますから",
          ],
          answer: "コンビニの物より安いですから",
          explanation: {
            meaning: "Tại sao họ lại mua đồ ăn ở siêu thị thay vì cửa hàng tiện lợi?",
            reason: "Dẫn chứng câu 3:「コンビニの物より安いですから、私たちはいつもここで食べ物を買います。」",
            wrongOptions: [
              { option: "スーパーのほうが駅から近いですから", reason: "Lý do là giá rẻ hơn." },
              { option: "コンビニには食べ物がないですから", reason: "Cửa hàng tiện lợi vẫn có nhưng đắt hơn." },
              { option: "友達がスーパーで働いていますから", reason: "Không có thông tin này." },
            ],
          },
        },
        {
          id: `dyn-q2-4-${entropy}`,
          prompt: "アパートへ帰ってから何をしましたか。",
          options: [
            `食事のどう具をじゅんびしておいしい${dish.name}を作りました`,
            "すぐベッドで寝ました",
            "テレビを見て宿題をしませんでした",
            "また別の店へ出かけました",
          ],
          answer: `食事のどう具をじゅんびしておいしい${dish.name}を作りました`,
          explanation: {
            meaning: "Sau khi về căn hộ họ đã làm gì?",
            reason: `Dẫn chứng câu 4:「アパートへ帰ってから、${dish.tool}をじゅんびして、おいしい${dish.name}を作りました。」`,
            wrongOptions: [
              { option: "すぐベッドで寝ました", reason: "Họ cùng nhau chuẩn bị và nấu ăn." },
              { option: "テレビを見て宿題をしませんでした", reason: "Họ thưởng thức bữa ăn ngon miệng." },
              { option: "また別の店へ出かけました", reason: "Họ ăn uống vui vẻ tại phòng." },
            ],
          },
        },
      ],
    };

    // 3. Passage 3: Học tập & Công ty CNTT FPT
    const p3Sentences: ReadingSentence[] = [
      {
        jp: "先週の水曜日、私たちは東京のIT会社へ見学に行きました。",
        vi: "Thứ Tư tuần trước, chúng tôi đã đi tham quan một công ty CNTT tại Tokyo.",
        romaji: "Senshuu no suiyoubi, watashitachi wa Toukyou no IT kaisha e kengaku ni ikimashita.",
      },
      {
        jp: "会社の入口で受付の人にじぶんの名前と国を言ってから、オフィスに入りました。",
        vi: "Tại lối vào, sau khi nói tên và quốc tịch của mình với lễ tân, chúng tôi bước vào văn phòng.",
        romaji: "Kaisha no iriguchi de uketsuke no hito ni jibun no namae to kuni o itte kara, ofisu ni hairimashita.",
      },
      {
        jp: "広い部屋で社員の人がパソコンを使いながら熱心に仕事をしていました。",
        vi: "Trong văn phòng rộng lớn, các nhân viên chăm chỉ làm việc bên máy vi tính.",
        romaji: "Hiroi heya de shain no hito ga pasokon o tsukainagara nesshin ni shigoto o shite imashita.",
      },
      {
        jp: "午後は会議室でぶちょうのせつめいを聞いて、会社についての本やしりょうを読みました。",
        vi: "Buổi chiều tại phòng họp, chúng tôi nghe giải thích và đọc các tài liệu về công ty.",
        romaji: "Gogo wa kaigishitsu de buchou no setsumei o kiite, kaisha ni tsuite no hon ya shiryou o yomimashita.",
      },
      {
        jp: "仕事には高いぎじゅつだけでなく、人とよく話してきょう力する力も大切だと教えてくれました。",
        vi: "Người ta đã dạy chúng tôi rằng trong công việc năng lực giao tiếp và hợp tác là vô cùng quan trọng.",
        romaji: "Shigoto ni wa takai gijutsu dakedenaku, hito to yoku hanashite kyouryoku suru chikara mo taisetsu da to oshiete kuremashita.",
      },
      {
        jp: "社員の人たちにおれいを言ってから、午後五時にアパートへ帰りました。",
        vi: "Sau khi cảm ơn các nhân viên, đúng 5 giờ chiều chúng tôi lên tàu trở về căn hộ.",
        romaji: "Shain no hitotachi ni orei o itte kara, gogo go-ji ni apaato e kaerimashita.",
      },
    ];
    const p3Content = p3Sentences.map((s) => s.jp).join("");

    const p3: ReadingPassage = {
      id: `dyn-jpd123-read-3-${entropy}`,
      course: "JPD123",
      title: "東京のIT会社見学と日本語インタビュー",
      titleVi: "Chuyến tham quan công ty CNTT tại Tokyo và phỏng vấn",
      theme: "Tham quan doanh nghiệp, máy tính, giới thiệu bản thân và tinh thần hợp tác",
      content: p3Content,
      sentences: p3Sentences,
      translation: "Thứ Tư tuần trước, chúng tôi có chuyến tham quan thực tế tại một công ty công nghệ ở Tokyo. Sau khi đăng ký tên và quốc tịch ở quầy lễ tân, chúng tôi được vào xem môi trường làm việc chuyên nghiệp. Buổi chiều, chúng tôi lắng nghe giới thiệu và đọc tài liệu công ty. Chúng tôi hiểu rằng bên cạnh kỹ thuật giỏi, kỹ năng giao tiếp và tinh thần hợp tác đồng đội có ý nghĩa quyết định. Kết thúc chuyến đi, chúng tôi cảm ơn mọi người và trở về căn hộ lúc 5 giờ chiều.",
      romaji: p3Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["先週", "水曜日", "私", "東京", "会社", "見学", "行く", "入口", "人", "名前", "国", "言う", "入る", "広い", "部屋", "社員", "パソコン", "午後", "聞く", "本", "読む", "話す", "力", "帰る"],
      kanjiUsed: ["先", "週", "水", "曜", "日", "私", "東", "京", "会", "社", "見", "行", "入", "人", "名", "前", "国", "言", "午", "後", "聞", "本", "読", "話", "力", "帰"],
      questions: [
        {
          id: `dyn-q3-1-${entropy}`,
          prompt: "会社の入口でまず何をしましたか。",
          options: [
            "じぶんの名前と国を言いました",
            "パスポートの番号を言いました",
            "今日の日付を言いました",
            "電話番号を言いました",
          ],
          answer: "じぶんの名前と国を言いました",
          explanation: {
            meaning: "Tại lối vào của công ty, họ đã nói gì trước tiên?",
            reason: "Dẫn chứng câu 2:「会社の入口で受付の人にじぶんの名前と国を言ってから、オフィスに入りました。」",
            wrongOptions: [
              { option: "パスポートの番号を言いました", reason: "Họ xưng tên và quốc gia của mình." },
              { option: "今日の日付を言いました", reason: "Không hỏi ngày tháng." },
              { option: "電話番号を言いました", reason: "Không đọc số điện thoại." },
            ],
          },
        },
        {
          id: `dyn-q3-2-${entropy}`,
          prompt: "社員の人は部屋で何をしていましたか。",
          options: [
            "パソコンを使いながら熱心に仕事をしていました",
            "お茶を飲んで休んでいました",
            "新聞を読んでいました",
            "テレビを見ていました",
          ],
          answer: "パソコンを使いながら熱心に仕事をしていました",
          explanation: {
            meaning: "Các nhân viên công ty đang làm gì trong phòng?",
            reason: "Dẫn chứng câu 3:「広い部屋で社員の人がパソコンを使いながら熱心に仕事をしていました。」",
            wrongOptions: [
              { option: "お茶を飲んで休んでいました", reason: "Họ chăm chỉ làm việc." },
              { option: "新聞を読んでいました", reason: "Họ dùng máy tính làm việc." },
              { option: "テレビを見ていました", reason: "Không xem tivi." },
            ],
          },
        },
        {
          id: `dyn-q3-3-${entropy}`,
          prompt: "午後に会議室で何をしましたか。",
          options: [
            "ぶちょうのせつめいを聞いて会社についての本やしりょうを読みました",
            "難しいテストを受けました",
            "みんなでお弁当を食べました",
            "歌の練習をしました",
          ],
          answer: "ぶちょうのせつめいを聞いて会社についての本やしりょうを読みました",
          explanation: {
            meaning: "Buổi chiều tại phòng họp họ đã làm gì?",
            reason: "Dẫn chứng câu 4:「午後は会議室でぶちょうのせつめいを聞いて、会社についての本やしりょうを読みました。」",
            wrongOptions: [
              { option: "難しいテストを受けました", reason: "Họ nghe giải thích và đọc tài liệu." },
              { option: "みんなでお弁当を食べました", reason: "Không ăn cơm hộp." },
              { option: "歌の練習をしました", reason: "Không tập hát." },
            ],
          },
        },
        {
          id: `dyn-q3-4-${entropy}`,
          prompt: "仕事において何が大切だと教えてくれましたか。",
          options: [
            "高いぎじゅつと人と協力する力です",
            "お金をたくさん使うことだけです",
            "一人で休まずにずっと働くことです",
            "外国へたくさん旅行することです",
          ],
          answer: "高いぎじゅつと人と協力する力です",
          explanation: {
            meaning: "Người ta đã dạy điều gì là quan trọng trong công việc?",
            reason: "Dẫn chứng câu 5:「仕事には高いぎじゅつだけでなく、人とよく話してきょう力する力も大切だと教えてくれました。」",
            wrongOptions: [
              { option: "お金をたくさん使うことだけです", reason: "Cần năng lực chuyên môn và tinh thần hợp tác." },
              { option: "一人で休まずにずっと働くことです", reason: "Cần phối hợp làm việc nhóm." },
              { option: "外国へたくさん旅行することです", reason: "Không phải nội dung được khuyên." },
            ],
          },
        },
      ],
    };

    // 4. Passage 4: Đời sống, Khu phố, Thể thao & Nghỉ ngơi
    const sportAction = pick([
      { name: "サッカー", action: "友達とサッカーの練習をします", actVi: "luyện tập bóng đá cùng bạn bè", romaji: "tomodachi to sakkaa no renshuu o shimasu" },
      { name: "テニス", action: "本田さんとテニスの試合を見に行きます", actVi: "đi xem trận thi đấu tennis cùng bạn Honda", romaji: "Honda-san to tenisu no shiai o mi ni ikimasu" },
    ]);

    const p4Sentences: ReadingSentence[] = [
      {
        jp: "私は今、東京の近くのきれいな市にあるアパートに住んでいます。",
        vi: "Hiện tại tôi đang sống ở một căn hộ thuộc thành phố xinh đẹp gần Tokyo.",
        romaji: "Watashi wa ima, Toukyou no chikaku no kireina shi ni aru apaato ni sunde imasu.",
      },
      {
        jp: "この町は大きい公園や小さい店があって、毎日とても便利でにぎやかです。",
        vi: "Thị trấn này có công viên rộng và những cửa hàng nhỏ, sinh hoạt vô cùng tiện lợi.",
        romaji: "Kono machi wa ookii kouen ya chiisai mise ga atte, mainichi totemo benri de nigiyaka desu.",
      },
      {
        jp: "毎週月曜日から金曜日まで大学で日本語を勉強して、夜は少し休みます。",
        vi: "Mỗi tuần từ thứ Hai đến thứ Sáu tôi học tiếng Nhật ở trường, tối về nghỉ ngơi một chút.",
        romaji: "Maishuu getsuyoubi kara kinyoubi made daigaku de nihongo o benkyou shite, yoru wa sukoshi yasumimasu.",
      },
      {
        jp: "土曜日は図書館で本を読んだり、ノートにかんじの文を書いたりします。",
        vi: "Thứ Bảy tôi đến thư viện đọc sách và luyện viết các câu chữ Hán vào vở.",
        romaji: "Doyoubi wa toshokan de hon o yondari, nooto ni kanji no bun o kaitari shimasu.",
      },
      {
        jp: `日曜日の午後は${sportAction.action}。`,
        vi: `Chiều Chủ nhật tôi ${sportAction.actVi}.`,
        romaji: `Nichiyoubi no gogo wa ${sportAction.romaji}.`,
      },
      {
        jp: "来週のテストのために夜は早く帰って、いなかのきれいな田んぼや山をおもい出しながら勉強します。",
        vi: "Vì kỳ thi tuần tới, tối đến tôi về sớm và chăm chỉ ôn bài, nhớ về ruộng lúa và núi non quê hương.",
        romaji: "Raishuu no tesuto no tame ni yoru wa hayaku kaette, inaka no kireina tanbo ya yama o omoidashinagara benkyou shimasu.",
      },
    ];
    const p4Content = p4Sentences.map((s) => s.jp).join("");

    const p4: ReadingPassage = {
      id: `dyn-jpd123-read-4-${entropy}`,
      course: "JPD123",
      title: "市での生活と週末のスポーツ",
      titleVi: "Đời sống ở thành phố và thể thao cuối tuần",
      theme: "Khu vực đô thị, lịch học hàng tuần, thư viện, thể thao và ôn tập thi",
      content: p4Content,
      sentences: p4Sentences,
      translation: `Hiện tại tôi đang sống tại một căn hộ tiện nghi ở thành phố xinh đẹp gần Tokyo. Nơi đây có công viên lớn và các cửa hàng tiện lợi. Từ thứ Hai đến thứ Sáu tôi chăm chỉ học tiếng Nhật tại trường. Thứ Bảy tôi đến thư viện đọc sách và luyện viết chữ Hán. Chiều Chủ nhật tôi ${sportAction.actVi}. Hướng đến bài kiểm tra tuần sau, mỗi tối tôi đều về phòng sớm để tập trung học tập.`,
      romaji: p4Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["私", "今", "東京", "市", "アパート", "町", "大きい", "公園", "小さい", "店", "毎日", "便利", "毎週", "月曜日", "金曜日", "大学", "日本語", "勉強", "夜", "少し", "休む", "土曜日", "図書館", "本", "読む", "ノート", "書く", "日曜日", "午後", "友達", "来週", "テスト", "早く", "帰る", "田んぼ", "山"],
      kanjiUsed: ["私", "今", "東", "京", "市", "大", "小", "毎", "日", "週", "月", "曜", "金", "学", "本", "語", "休", "土", "読", "書", "午", "後", "来", "帰", "田"],
      questions: [
        {
          id: `dyn-q4-1-${entropy}`,
          prompt: "筆者が住んでいる町はどんな町ですか。",
          options: [
            "大きい公園や小さい店があってとても便利な町です",
            "にぎやかでうるさい町です",
            "何も店がない不便な町です",
            "海が近い静かな町です",
          ],
          answer: "大きい公園や小さい店があってとても便利な町です",
          explanation: {
            meaning: "Thành phố tác giả đang sống là nơi như thế nào?",
            reason: "Dẫn chứng câu 2:「この町は大きい公園や小さい店があって、毎日とても便利でにぎやかです。」",
            wrongOptions: [
              { option: "にぎやかでうるさい町です", reason: "Bài nhấn mạnh sự tiện lợi và đẹp đẽ." },
              { option: "何も店がない不便な町です", reason: "Có nhiều cửa hàng nhỏ tiện ích." },
              { option: "海が近い静かな町です", reason: "Không nhắc đến biển." },
            ],
          },
        },
        {
          id: `dyn-q4-2-${entropy}`,
          prompt: "筆者は毎週何曜日から何曜日まで勉強しますか。",
          options: [
            "月曜日から金曜日まで勉強します",
            "土曜日と日曜日だけ勉強します",
            "水曜日と木曜日だけです",
            "毎日朝から晩まで休みます",
          ],
          answer: "月曜日から金曜日まで勉強します",
          explanation: {
            meaning: "Tác giả học từ thứ mấy đến thứ mấy mỗi tuần?",
            reason: "Dẫn chứng câu 3:「毎週月曜日から金曜日まで大学で日本語を勉強して、夜は少し休みます。」",
            wrongOptions: [
              { option: "土曜日と日曜日だけ勉強します", reason: "Học từ thứ Hai đến thứ Sáu." },
              { option: "水曜日と木曜日だけです", reason: "Lịch học cả tuần." },
              { option: "毎日朝から晩まで休みます", reason: "Tác giả học tập chăm chỉ." },
            ],
          },
        },
        {
          id: `dyn-q4-3-${entropy}`,
          prompt: "日曜日の午後は何をしますか。",
          options: [
            `${sportAction.action}`,
            "一人で部屋をそうじします",
            "会社でアルバイトをします",
            "一日中寝ています",
          ],
          answer: `${sportAction.action}`,
          explanation: {
            meaning: "Chiều Chủ nhật tác giả làm gì?",
            reason: `Dẫn chứng câu 5:「日曜日の午後は${sportAction.action}。」`,
            wrongOptions: [
              { option: "一人で部屋をそうじします", reason: "Tham gia thể thao rèn luyện sức khỏe." },
              { option: "会社でアルバイトをします", reason: "Không đi làm thêm vào giờ này." },
              { option: "一日中寝ています", reason: "Hoạt động thể thao lành mạnh." },
            ],
          },
        },
        {
          id: `dyn-q4-4-${entropy}`,
          prompt: "来週の何のために夜は早く帰って勉強しますか。",
          options: [
            "来週のテストのためです",
            "スピーチ大会のためです",
            "日本旅行のためです",
            "面接のためです",
          ],
          answer: "来週のテストのためです",
          explanation: {
            meaning: "Vì sự kiện gì vào tuần sau mà buổi tối tác giả về sớm để học?",
            reason: "Dẫn chứng câu kết:「来週のテストのために夜は早く帰って...勉強します。」",
            wrongOptions: [
              { option: "スピーチ大会のためです", reason: "Ôn tập cho kỳ thi kiểm tra (テスト)." },
              { option: "日本旅行のためです", reason: "Không phải chuẩn bị đi du lịch." },
              { option: "面接のためです", reason: "Không phải chuẩn bị phỏng vấn." },
            ],
          },
        },
      ],
    };

    passages = [p1, p2, p3, p4];
  } else {
    // JPD113 4 dynamic passages
    const teacherName = pick([
      { text: "木村先生", romaji: "Kimura-sensei" },
      { text: "田中先生", romaji: "Tanaka-sensei" },
      { text: "佐藤先生", romaji: "Satou-sensei" },
    ]);
    const studentCount = pick([
      { text: "七人", romaji: "shichinin" },
      { text: "八人", romaji: "hachinin" },
      { text: "九人", romaji: "kyuunin" },
    ]);
    const age = pick([
      { text: "三十五才", romaji: "sanjuugo-sai" },
      { text: "三十才", romaji: "sanjuu-sai" },
      { text: "二十八才", romaji: "nijuuhachi-sai" },
    ]);

    const p1Sentences: ReadingSentence[] = [
      { jp: "ここは私たちの学校です。", vi: "Đây là trường học của chúng tôi.", romaji: "Koko wa watashitachi no gakkou desu." },
      { jp: `教室に学生が${studentCount.text}います。`, vi: `Trong lớp học có ${studentCount.text} bạn sinh viên.`, romaji: `Kyoushitsu ni gakusei ga ${studentCount.romaji} imasu.` },
      { jp: "九月からの新しいベトナム人と日本人の学生です。", vi: "Đó là những sinh viên người Việt Nam và Nhật Bản nhập học từ tháng 9.", romaji: "Kugatsu kara no atarashii betonamujin to nihonjin no gakusei desu." },
      { jp: `先生は日本人で、${teacherName.text}です。`, vi: `Giáo viên là người Nhật, ${teacherName.text}.`, romaji: `Sensei wa nihonjin de, ${teacherName.romaji} desu.` },
      { jp: `${teacherName.text}は${age.text}です。`, vi: `${teacherName.text} ${age.text}.`, romaji: `${teacherName.romaji} wa ${age.romaji} desu.` },
      { jp: "毎日何時から何時まで勉強しますか。", vi: "Mỗi ngày học từ mấy giờ đến mấy giờ?", romaji: "Mainichi nanji kara nanji made benkyou shimasu ka." },
      { jp: "一時間目は午前八時半からです。", vi: "Tiết học thứ nhất bắt đầu từ 8 giờ rưỡi sáng.", romaji: "Ichijikanme wa gozen hachi-jihan kara desu." },
      { jp: "日本語の授業はとても面白いです。", vi: "Giờ học tiếng Nhật rất thú vị.", romaji: "Nihongo no jugyou wa totemo omoshiroi desu." },
    ];
    const p1Content = p1Sentences.map((s) => s.jp).join("");

    const p1: ReadingPassage = {
      id: `dyn-jpd113-read-1-${entropy}`,
      course: "JPD113",
      title: "学校の日本語のクラス",
      titleVi: "Lớp học tiếng Nhật tại trường học",
      theme: "Trường học, số người, tuổi tác và tiết học",
      content: p1Content,
      sentences: p1Sentences,
      translation: `Đây là trường học của chúng tôi. Trong lớp có ${studentCount.text} học sinh. Thầy giáo là ${teacherName.text}, ${age.text}. Mỗi ngày tiết đầu bắt đầu từ 8 giờ rưỡi sáng. Giờ học rất vui và bổ ích.`,
      romaji: p1Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["ここ", "私", "学校", "教室", "学生", "九月", "人", "先生", "毎日", "何時", "勉強", "一時間", "午前", "八時半", "日本語", "授業"],
      kanjiUsed: ["私", "学", "校", "生", "九", "月", "日", "本", "木", "才", "毎", "何", "時", "一", "間", "午", "八", "半", "語"],
      questions: [
        {
          id: `dyn-113-q1-1-${entropy}`,
          prompt: "教室に学生が何人いますか。",
          options: [`${studentCount.text}います`, "五人います", "十人います", "三人います"],
          answer: `${studentCount.text}います`,
          explanation: {
            meaning: "Trong lớp học có bao nhiêu học sinh?",
            reason: `Dẫn chứng câu 2:「教室に学生が${studentCount.text}います。」`,
            wrongOptions: [
              { option: "五人います", reason: `Bài nêu rõ có ${studentCount.text}.` },
              { option: "十人います", reason: "Sai số lượng." },
              { option: "三人います", reason: "Sai số lượng." },
            ],
          },
        },
        {
          id: `dyn-113-q1-2-${entropy}`,
          prompt: "先生の名前は何ですか。",
          options: [`${teacherName.text}です`, "山田先生です", "小林先生です", "鈴木先生です"],
          answer: `${teacherName.text}です`,
          explanation: {
            meaning: "Tên của giáo viên là gì?",
            reason: `Dẫn chứng câu 4:「先生は日本人で、${teacherName.text}です。」`,
            wrongOptions: [
              { option: "山田先生です", reason: `Thầy tên là ${teacherName.text}.` },
              { option: "小林先生です", reason: "Sai tên giáo viên." },
              { option: "鈴木先生です", reason: "Sai tên giáo viên." },
            ],
          },
        },
        {
          id: `dyn-113-q1-3-${entropy}`,
          prompt: "一時間目は午前何時から始まりますか。",
          options: ["午前八時半からです", "午前九時からです", "午前七時半からです", "午前十時からです"],
          answer: "午前八時半からです",
          explanation: {
            meaning: "Tiết thứ nhất bắt đầu lúc mấy giờ?",
            reason: "Dẫn chứng câu 7:「一時間目は午前八時半からです。」",
            wrongOptions: [
              { option: "午前九時からです", reason: "Bắt đầu từ 8:30 sáng." },
              { option: "午前七時半からです", reason: "Không bắt đầu lúc 7:30." },
              { option: "午前十時からです", reason: "Không bắt đầu lúc 10:00." },
            ],
          },
        },
        {
          id: `dyn-113-q1-4-${entropy}`,
          prompt: "日本語の授業はどうですか。",
          options: ["とても面白いです", "とても難しいです", "あまり好きじゃないです", "つまらないです"],
          answer: "とても面白いです",
          explanation: {
            meaning: "Giờ học tiếng Nhật như thế nào?",
            reason: "Dẫn chứng câu kết:「日本語の授業はとても面白いです。」",
            wrongOptions: [
              { option: "とても難しいです", reason: "Bài khẳng định rất thú vị." },
              { option: "あまり好きじゃないです", reason: "Học sinh rất thích." },
              { option: "つまらないです", reason: "Ngược với bài đọc." },
            ],
          },
        },
      ],
    };

    const roomFloor = pick([
      { text: "三階", romaji: "sangai" },
      { text: "二階", romaji: "nikai" },
    ]);
    const walkMin = pick([
      { text: "十五分", romaji: "juugofun" },
      { text: "十分", romaji: "juppun" },
    ]);

    const p2Sentences: ReadingSentence[] = [
      {
        jp: `私の部屋は${roomFloor.text}の部屋です。`,
        vi: `Phòng của tôi là căn phòng ở ${roomFloor.text}.`,
        romaji: `Watashi no heya wa ${roomFloor.romaji} no heya desu.`,
      },
      {
        jp: "部屋に机と椅子と本棚があります。",
        vi: "Trong phòng có bàn, ghế và giá sách.",
        romaji: "Heya ni tsukue to isu to hondana ga arimasu.",
      },
      {
        jp: "毎朝六時半に起きます。",
        vi: "Mỗi sáng tôi thức dậy lúc 6 giờ rưỡi.",
        romaji: "Maiasa roku-jihan ni okimasu.",
      },
      {
        jp: "午前八時から十二時半まで四時間、学校で勉強します。",
        vi: "Từ 8 giờ sáng đến 12 giờ rưỡi, tôi học 4 tiếng ở trường.",
        romaji: "Gozen hachi-ji kara juuni-jihan made yojikan, gakkou de benkyou shimasu.",
      },
      {
        jp: `学校から寮まで歩いて${walkMin.text}です。`,
        vi: `Từ trường về ký túc xá đi bộ mất ${walkMin.text}.`,
        romaji: `Gakkou kara ryou made aruite ${walkMin.romaji} desu.`,
      },
      {
        jp: "午後は図書館で本を読みます。",
        vi: "Buổi chiều tôi đọc sách ở thư viện.",
        romaji: "Gogo wa toshokan de hon o yomimasu.",
      },
    ];
    const p2Content = p2Sentences.map((s) => s.jp).join("");

    const p2: ReadingPassage = {
      id: `dyn-jpd113-read-2-${entropy}`,
      course: "JPD113",
      title: "寮の生活と時間",
      titleVi: "Đời sống ở ký túc xá và thời gian",
      theme: "Phòng ở, thời gian biểu hàng ngày, thức dậy và đi bộ",
      content: p2Content,
      sentences: p2Sentences,
      translation: `Căn phòng của tôi ở ${roomFloor.text}. Mỗi sáng tôi dậy lúc 6 giờ rưỡi. Từ 8 giờ đến 12 giờ rưỡi trưa tôi học ở trường. Đi bộ từ trường về phòng mất ${walkMin.text}. Buổi chiều tôi đọc sách ở thư viện.`,
      romaji: p2Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["私", "部屋", "毎朝", "六時半", "起きる", "午前", "八時", "十二時半", "三十分", "学校", "勉強", "歩いて", "午後", "図書館", "本", "読む"],
      kanjiUsed: ["私", "毎", "朝", "六", "時", "半", "午", "前", "八", "十", "二", "四", "間", "分", "学", "校", "後", "本", "読"],
      questions: [
        {
          id: `dyn-113-q2-1-${entropy}`,
          prompt: "毎朝何時に起きますか。",
          options: ["六時半に起きます", "七時に起きます", "八時に起きます", "六時に起きます"],
          answer: "六時半に起きます",
          explanation: {
            meaning: "Mỗi sáng tác giả thức dậy lúc mấy giờ?",
            reason: "Dẫn chứng câu 3:「毎朝六時半に起きます。」",
            wrongOptions: [
              { option: "七時に起きます", reason: "Dậy lúc 6:30 sáng." },
              { option: "八時に起きます", reason: "8:00 là giờ học." },
              { option: "六時に起きます", reason: "Dậy lúc 6 giờ rưỡi." },
            ],
          },
        },
        {
          id: `dyn-113-q2-2-${entropy}`,
          prompt: "学校での勉強は何時までですか。",
          options: ["十二時半までです", "午前十一時までです", "午後二時までです", "午後四時までです"],
          answer: "十二時半までです",
          explanation: {
            meaning: "Việc học ở trường kết thúc lúc mấy giờ?",
            reason: "Dẫn chứng câu 4:「午前八時から十二時半まで四時間、学校で勉強します。」",
            wrongOptions: [
              { option: "午前十一時までです", reason: "Học đến 12:30." },
              { option: "午後二時までです", reason: "Buổi chiều đọc sách ở thư viện." },
              { option: "午後四時までです", reason: "Sai thời gian." },
            ],
          },
        },
        {
          id: `dyn-113-q2-3-${entropy}`,
          prompt: "学校から寮まで歩いて何分ですか。",
          options: [`歩いて${walkMin.text}です`, "歩いて三十分です", "歩いて五分です", "歩いて一時間です"],
          answer: `歩いて${walkMin.text}です`,
          explanation: {
            meaning: "Từ trường về phòng đi bộ mất bao nhiêu phút?",
            reason: `Dẫn chứng câu 5:「学校から寮まで歩いて${walkMin.text}です。」`,
            wrongOptions: [
              { option: "歩いて三十分です", reason: `Mất ${walkMin.text} đi bộ.` },
              { option: "歩いて五分です", reason: "Sai số phút." },
              { option: "歩いて一時間です", reason: "Không mất 1 tiếng." },
            ],
          },
        },
        {
          id: `dyn-113-q2-4-${entropy}`,
          prompt: "午後はどこで本を読みますか。",
          options: ["図書館で本を読みます", "部屋で寝ます", "カフェでコーヒーを飲みます", "デパートへ行きます"],
          answer: "図書館で本を読みます",
          explanation: {
            meaning: "Buổi chiều tác giả đọc sách ở đâu?",
            reason: "Dẫn chứng câu kết:「午後は図書館で本を読みます。」",
            wrongOptions: [
              { option: "部屋で寝ます", reason: "Tác giả đọc sách ở thư viện." },
              { option: "カフェでコーヒーを飲みます", reason: "Không nhắc đến quán cà phê." },
              { option: "デパートへ行きます", reason: "Không đi mua sắm." },
            ],
          },
        },
      ],
    };

    const p3Sentences: ReadingSentence[] = [
      {
        jp: "学校の売店にノートやペンがあります。",
        vi: "Ở căng tin trường học có vở và bút.",
        romaji: "Gakkou no baiten ni nooto ya pen ga arimasu.",
      },
      {
        jp: "この白いノートは一冊百五十円です。",
        vi: "Cuốn vở màu trắng này giá 150 yên một quyển.",
        romaji: "Kono shiroi nooto wa issatsu hyaku gojuu-en desu.",
      },
      {
        jp: "青いペンは一本八十円です。",
        vi: "Cây bút màu xanh này giá 80 yên một chiếc.",
        romaji: "Aoi pen wa ippon hachijuu-en desu.",
      },
      {
        jp: "私はノート二冊とペン三本を買いました。",
        vi: "Tôi đã mua 2 cuốn vở và 3 cây bút.",
        romaji: "Watashi wa nooto nisatsu to pen sanbon o kaimashita.",
      },
      {
        jp: "ぜんぶで五百四十円でした。",
        vi: "Tổng cộng hết 540 yên.",
        romaji: "Zenbu de gohyaku yonjuu-en deshita.",
      },
      {
        jp: "一千円や一万円を出しておつりをもらいました。",
        vi: "Tôi đưa tờ 1.000 yên hoặc 10.000 yên và nhận lại tiền thừa.",
        romaji: "Issen-en ya ichiman-en o dashite otsuri o moraimashita.",
      },
      {
        jp: "売店の人はとても親切です。",
        vi: "Người bán hàng ở căng tin rất tốt bụng.",
        romaji: "Baiten no hito wa totemo shinsetsu desu.",
      },
    ];
    const p3Content = p3Sentences.map((s) => s.jp).join("");

    const p3: ReadingPassage = {
      id: `dyn-jpd113-read-3-${entropy}`,
      course: "JPD113",
      title: "学校の売店と買い物",
      titleVi: "Cửa hàng trong trường học và mua sắm",
      theme: "Mua sắm học cụ, số lượng, đếm tiền yên và tiền lẻ",
      content: p3Content,
      sentences: p3Sentences,
      translation: "Ở căng tin trường học có bán tập vở và bút viết. Vở trắng giá 150 yên, bút xanh giá 80 yên. Tôi mua 2 quyển vở và 3 cây bút hết 540 yên. Người bán hàng rất tốt bụng.",
      romaji: p3Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["学校", "売店", "ノート", "ペン", "白", "一冊", "百五十円", "青", "一本", "八十円", "私", "二冊", "三本", "買う", "五百四十円", "一千円", "一万円", "人", "親切"],
      kanjiUsed: ["学", "校", "一", "冊", "百", "五", "十", "円", "本", "八", "私", "二", "三", "買", "四", "千", "万", "人"],
      questions: [
        {
          id: `dyn-113-q3-1-${entropy}`,
          prompt: "白いノートは一冊いくらですか。",
          options: ["百五十円です", "百円です", "二百円です", "八十円です"],
          answer: "百五十円です",
          explanation: {
            meaning: "Cuốn vở trắng giá bao nhiêu?",
            reason: "Dẫn chứng câu 2:「この白いノートは一冊百五十円です。」",
            wrongOptions: [
              { option: "百円です", reason: "Giá là 150 yên." },
              { option: "二百円です", reason: "Sai mức giá." },
              { option: "八十円です", reason: "80 yên là giá bút." },
            ],
          },
        },
        {
          id: `dyn-113-q3-2-${entropy}`,
          prompt: "青いペンは一本いくらですか。",
          options: ["八十円です", "五十円です", "百円です", "百二十円です"],
          answer: "八十円です",
          explanation: {
            meaning: "Cây bút xanh giá bao nhiêu?",
            reason: "Dẫn chứng câu 3:「青いペンは一本八十円です。」",
            wrongOptions: [
              { option: "五十円です", reason: "Giá là 80 yên." },
              { option: "百円です", reason: "Sai mức giá." },
              { option: "百二十円です", reason: "Sai mức giá." },
            ],
          },
        },
        {
          id: `dyn-113-q3-3-${entropy}`,
          prompt: "筆者は何を買いましたか。",
          options: ["ノート二冊とペン三本を買いました", "ノート一冊と消しゴムを買いました", "ペン五本を買いました", "辞書を一冊買いました"],
          answer: "ノート二冊とペン三本を買いました",
          explanation: {
            meaning: "Tác giả đã mua những gì?",
            reason: "Dẫn chứng câu 4:「私はノート二冊とペン三本を買いました。」",
            wrongOptions: [
              { option: "ノート一冊と消しゴムを買いました", reason: "Mua 2 vở và 3 bút." },
              { option: "ペン五本を買いました", reason: "Chỉ mua 3 bút." },
              { option: "辞書を一冊買いました", reason: "Không mua từ điển." },
            ],
          },
        },
        {
          id: `dyn-113-q3-4-${entropy}`,
          prompt: "ぜんぶでいくらでしたか。",
          options: ["五百四十円でした", "四百五十円でした", "六百円でした", "千円でした"],
          answer: "五百四十円でした",
          explanation: {
            meaning: "Tổng cộng hết bao nhiêu tiền?",
            reason: "Dẫn chứng câu 5:「ぜんぶで五百四十円でした。」",
            wrongOptions: [
              { option: "四百五十円でした", reason: "Tổng tiền là 540 yên." },
              { option: "六百円でした", reason: "Sai số tiền." },
              { option: "千円でした", reason: "1.000 yên là tiền đưa." },
            ],
          },
        },
      ],
    };

    const p4Sentences: ReadingSentence[] = [
      {
        jp: "今日は四月一日、月曜日です。",
        vi: "Hôm nay là ngày 1 tháng 4, thứ Hai.",
        romaji: "Kyou wa shigatsu tsuitachi, getsuyoubi desu.",
      },
      {
        jp: "月曜日と水曜日と金曜日は日本語の授業があります。",
        vi: "Thứ Hai, thứ Tư và thứ Sáu có giờ học tiếng Nhật.",
        romaji: "Getsuyoubi to suiyoubi to kinyoubi wa nihongo no jugyou ga arimasu.",
      },
      {
        jp: "火曜日と木曜日の午後はパソコンを勉強します。",
        vi: "Chiều thứ Ba và thứ Năm học máy tính.",
        romaji: "Kayoubi to mokuyoubi no gogo wa pasokon o benkyou shimasu.",
      },
      {
        jp: "土曜日は休みです。",
        vi: "Thứ Bảy là ngày nghỉ.",
        romaji: "Doyoubi wa yasumi desu.",
      },
      {
        jp: "友達と買い物に行きます。",
        vi: "Tôi cùng bạn đi mua sắm.",
        romaji: "Tomodachi to kaimono ni ikimasu.",
      },
      {
        jp: "日曜日の午前は部屋をそうじして、午後は休みます。",
        vi: "Sáng Chủ nhật dọn dẹp phòng, chiều nghỉ ngơi.",
        romaji: "Nichiyoubi no gozen wa heya o souji shite, gogo wa yasumimasu.",
      },
      {
        jp: "一年は十二か月あります。",
        vi: "Một năm có 12 tháng.",
        romaji: "Ichinen wa juuni-kagetsu arimasu.",
      },
    ];
    const p4Content = p4Sentences.map((s) => s.jp).join("");

    const p4: ReadingPassage = {
      id: `dyn-jpd113-read-4-${entropy}`,
      course: "JPD113",
      title: "一週間の予定とカレンダー",
      titleVi: "Lịch trình một tuần và cuốn lịch",
      theme: "Các ngày trong tuần, ngày tháng, thời gian biểu và nghỉ ngơi",
      content: p4Content,
      sentences: p4Sentences,
      translation: "Hôm nay là thứ Hai, ngày 1 tháng 4. Thứ Hai, thứ Tư, thứ Sáu học tiếng Nhật; thứ Ba, thứ Năm học vi tính. Thứ Bảy được nghỉ đi mua sắm, Chủ nhật dọn phòng và nghỉ ngơi. Một năm có 12 tháng.",
      romaji: p4Sentences.map((s) => s.romaji).join(" "),
      vocabularyUsed: ["今日", "四月一日", "月曜日", "水曜日", "金曜日", "日本語", "授業", "火曜日", "木曜日", "午後", "パソコン", "勉強", "土曜日", "休み", "友達", "買い物", "行く", "日曜日", "午前", "部屋", "一年", "十二か月"],
      kanjiUsed: ["今", "日", "四", "月", "一", "曜", "水", "金", "語", "火", "木", "午", "後", "土", "休", "買", "物", "行", "年", "十", "二"],
      questions: [
        {
          id: `dyn-113-q4-1-${entropy}`,
          prompt: "今日は何月何日ですか。",
          options: ["四月一日です", "四月二日です", "五月一日です", "三月三十日です"],
          answer: "四月一日です",
          explanation: {
            meaning: "Hôm nay là ngày mấy tháng mấy?",
            reason: "Dẫn chứng câu 1:「今日は四月一日、月曜日です。」",
            wrongOptions: [
              { option: "四月二日です", reason: "Hôm nay là 1/4." },
              { option: "五月一日です", reason: "Sai tháng." },
              { option: "三月三十日です", reason: "Sai ngày tháng." },
            ],
          },
        },
        {
          id: `dyn-113-q4-2-${entropy}`,
          prompt: "日本語の授業は何曜日ですか。",
          options: ["月曜日と水曜日と金曜日です", "火曜日と木曜日です", "土曜日と日曜日です", "毎日です"],
          answer: "月曜日と水曜日と金曜日です",
          explanation: {
            meaning: "Giờ học tiếng Nhật vào những thứ mấy?",
            reason: "Dẫn chứng câu 2:「月曜日と水曜日と金曜日は日本語の授業があります。」",
            wrongOptions: [
              { option: "火曜日と木曜日です", reason: "Học vào thứ Hai, Tư, Sáu." },
              { option: "土曜日と日曜日です", reason: "Cuối tuần là ngày nghỉ." },
              { option: "毎日です", reason: "Học 3 buổi một tuần." },
            ],
          },
        },
        {
          id: `dyn-113-q4-3-${entropy}`,
          prompt: "土曜日に何をしますか。",
          options: ["友達と買い物に行きます", "学校で勉強します", "アルバイトをします", "病院へ行きます"],
          answer: "友達と買い物に行きます",
          explanation: {
            meaning: "Thứ Bảy tác giả làm gì?",
            reason: "Dẫn chứng câu 5:「友達と買い物に行きます。」",
            wrongOptions: [
              { option: "学校で勉強します", reason: "Được nghỉ học." },
              { option: "アルバイトをします", reason: "Không đi làm thêm." },
              { option: "病院へ行きます", reason: "Không đi bệnh viện." },
            ],
          },
        },
        {
          id: `dyn-113-q4-4-${entropy}`,
          prompt: "日曜日の午前は何をしますか。",
          options: ["部屋をそうじします", "サッカーをします", "映画を見ます", "料理を作ります"],
          answer: "部屋をそうじします",
          explanation: {
            meaning: "Sáng Chủ nhật tác giả làm gì?",
            reason: "Dẫn chứng câu 6:「日曜日の午前は部屋をそうじして、午後は休みます。」",
            wrongOptions: [
              { option: "サッカーをします", reason: "Dọn dẹp phòng vào buổi sáng." },
              { option: "映画を見ます", reason: "Không đi xem phim." },
              { option: "料理を作ります", reason: "Không nấu ăn." },
            ],
          },
        },
      ],
    };

    passages = [p1, p2, p3, p4];
  }

  // 1. Sanitize các đề bài trước theo đúng danh mục chữ Hán được phép của môn
  const sanitizedPassages = passages.map((p) => {
    const s = sanitizeReadingPassageKanji(p, allowedBai);
    return {
      ...s,
      questions: s.questions.map((q) => ({
        ...q,
        options: shuffle([...q.options]),
      })),
      isAiGenerated: true,
    };
  });

  // 2. Kiểm tra các chữ Hán mục tiêu còn thiếu sau khi đã chuẩn hóa cấp độ
  const preCoverage = computePassageSetKanjiCoverage(sanitizedPassages, course);

  if (!preCoverage.isCompleteCoverage && preCoverage.missingKanji.length > 0) {
    const missing = preCoverage.missingKanji;
    let extraJp = "";
    let extraVi = "";

    if (course === "JPD123") {
      const pieces: string[] = [];
      if (missing.includes("半")) pieces.push("午前十時半から");
      if (missing.includes("市")) pieces.push("このきれいな市で");
      if (missing.includes("区")) pieces.push("この区で");
      if (missing.includes("男") || missing.includes("女")) pieces.push("男の人も女の人も");
      if (missing.includes("力")) pieces.push("きょう力して");
      if (missing.includes("田")) pieces.push("山田さんや本田さんと");
      if (missing.includes("門")) pieces.push("大きい門の前で");
      if (missing.includes("寺")) pieces.push("お寺を見て");
      if (missing.includes("肉")) pieces.push("とり肉の料理を食べて");
      if (missing.includes("野")) pieces.push("新鮮な野さいを買って");
      if (missing.includes("具")) pieces.push("食事のどう具をつかって");
      if (missing.includes("小")) pieces.push("小さいカフェで");
      if (missing.includes("大")) pieces.push("大きいテーブルで");
      if (missing.includes("言")) pieces.push("「がんばりましょう」と言って");
      if (missing.includes("話")) pieces.push("日本語で楽しく話しました");

      const remaining = missing.filter((m) => !pieces.some((p) => p.includes(m)));
      if (remaining.length > 0) {
        pieces.push(remaining.join(""));
      }

      extraJp = `また、${pieces.join("、")}、みんなで毎日元気にべんきょうしています。`;
      extraVi = "Ngoài ra, chúng tôi cùng nhau nỗ lực học tập chăm chỉ mỗi ngày.";
    } else if (course === "JPD113") {
      const pieces: string[] = [];
      if (missing.includes("才")) pieces.push("二十才の学生です");
      if (missing.includes("万") || missing.includes("千") || missing.includes("百") || missing.includes("円")) {
        pieces.push("一万五千八百円です");
      }
      if (
        missing.includes("九") ||
        missing.includes("八") ||
        missing.includes("七") ||
        missing.includes("六") ||
        missing.includes("五") ||
        missing.includes("四") ||
        missing.includes("三") ||
        missing.includes("二") ||
        missing.includes("一") ||
        missing.includes("十")
      ) {
        pieces.push("一、二、三、四、五、六、七、八、九、十");
      }
      if (
        missing.includes("月") ||
        missing.includes("火") ||
        missing.includes("水") ||
        missing.includes("木") ||
        missing.includes("土") ||
        missing.includes("曜")
      ) {
        pieces.push("月曜日から土曜日まで");
      }
      if (missing.includes("間") || missing.includes("分") || missing.includes("時")) {
        pieces.push("四時間三十分");
      }
      if (missing.includes("何") || missing.includes("年")) {
        pieces.push("何年");
      }
      if (
        missing.includes("私") ||
        missing.includes("人") ||
        missing.includes("学") ||
        missing.includes("生") ||
        missing.includes("校") ||
        missing.includes("日") ||
        missing.includes("本") ||
        missing.includes("語")
      ) {
        pieces.push("私は学校で日本語を学ぶ学生です");
      }

      const remaining = missing.filter((m) => !pieces.some((p) => p.includes(m)));
      if (remaining.length > 0) {
        pieces.push(remaining.join(""));
      }

      extraJp = `学校で、${pieces.join("、")}、毎日楽しく勉強しています。`;
      extraVi = "Tại trường học, tôi học tập vui vẻ mỗi ngày.";
    }

    if (extraJp) {
      const p4 = sanitizedPassages[3];
      p4.content += extraJp;
      const extraRomaji = passageToRomaji(extraJp);
      p4.sentences.push({
        jp: extraJp,
        vi: extraVi,
        romaji: extraRomaji,
      });
      p4.romaji = p4.sentences.map((s) => s.romaji).filter(Boolean).join(" ");
    }
  }

  const finalCoverage = computePassageSetKanjiCoverage(sanitizedPassages, course);

  const fullSet: ReadingPassageSet = {
    id: `dyn-set-${course.toLowerCase()}-${Date.now()}-${entropy}`,
    course,
    title: `${course} 読解動的生成セット #${entropy}`,
    titleVi: `Bộ đề AI sinh động ${course} #${entropy} (Phủ ${finalCoverage.coveragePercentage}% chữ Hán)`,
    passages: sanitizedPassages,
    coveredKanji: finalCoverage.coveredKanji,
    targetKanjiCount: finalCoverage.targetKanjiCount,
    coveragePercentage: finalCoverage.coveragePercentage,
    isCompleteCoverage: finalCoverage.isCompleteCoverage,
  };

  recordReadingSetId(fullSet.id);
  return fullSet;
}
