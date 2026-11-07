import { getQuestionExplanation } from "./explanation.ts";
import { vocabulary } from "../../data/vocabulary.ts";
import { alphabet } from "../../data/alphabet.ts";

export type ExamSection = "Kanji" | "Từ vựng" | "Ngữ pháp";

export type ExamQuestion = {
  id: string;
  section: ExamSection;
  promptJp: string;
  prompt: string;
  sentence: string;
  reading?: string;
  options: string[];
  answer: string;
  explanation?: {
    meaning: string;
    grammar?: string;
    lesson?: string;
    tips?: string;
    reason: string;
  };
};

/**
 * Thuật toán xáo trộn mảng ngẫu nhiên Fisher-Yates không làm biến đổi mảng gốc.
 * @param items Mảng đầu vào cần xáo trộn
 * @returns Mảng mới đã được hoán vị ngẫu nhiên
 */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * FPT University JPD123 (Japanese 2 - Minna no Nihongo / Marugoto Bài 4, 5, 6, 7)
 * Cấu trúc chuẩn đề thi kết thúc môn (Final Exam) / Progress Test:
 * - Tổng số câu: 30 câu trắc nghiệm
 * - Thời gian làm bài: 30 phút
 * - Phân bổ ma trận đề thi:
 *   + 10 câu Chữ Hán (Kanji): Cách đọc, chữ Hán tương ứng, âm Hán Việt, cấu tạo chữ.
 *   + 10 câu Từ vựng (Vocabulary): Điền từ ngữ cảnh, từ trái nghĩa/đồng nghĩa, phó từ mức độ, hội thoại giao tiếp.
 *   + 10 câu Ngữ pháp (Grammar): Mẫu câu Bài 4-7 (tính từ, so sánh, mong muốn/mục đích, thể て, trợ từ).
 */

const HEADERS = {
  YOMI: {
    promptJp: "（　　）の漢字の正しい読み方を選びなさい。",
    prompt: "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  },
  KAKI: {
    promptJp: "下線のひらがなの正しい漢字を選びなさい。",
    prompt: "Chọn chữ Hán tự đúng của chữ Hiragana trong（　　）.",
  },
  HAN: {
    promptJp: "下線の漢字の音読みまたは意味・漢字音を選びなさい。",
    prompt: "Chọn âm Hán Việt hoặc ý nghĩa đúng của chữ Hán.",
  },
  VOCAB_FILL: {
    promptJp: "文の意味に最も合う言葉を一つ選びなさい。",
    prompt: "Chọn từ thích hợp nhất điền vào chỗ trống（　　）.",
  },
  VOCAB_OPP: {
    promptJp: "下線の言葉と反対の意味の言葉を選びなさい。",
    prompt: "Chọn từ trái nghĩa với từ được gạch chân.",
  },
  VOCAB_TALK: {
    promptJp: "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
    prompt: "Đọc hội thoại ngắn và chọn câu phản hồi phù hợp nhất.",
  },
  GRAM_FILL: {
    promptJp: "文法的に正しい言葉・助詞を一つ選びなさい。",
    prompt: "Chọn đáp án hoặc trợ từ thích hợp điền vào chỗ trống（　　）.",
  },
  GRAM_FORM: {
    promptJp: "動詞・形容詞の正しい形を選びなさい。",
    prompt: "Chọn dạng chia đúng của động từ hoặc tính từ.",
  },
  GRAM_ORDER: {
    promptJp: "文法的に正しい文を一つ選びなさい。",
    prompt: "Chọn câu có cấu trúc ngữ pháp đúng nhất.",
  },
};

export type QuestionSeed = {
  section: ExamSection;
  promptJp: string;
  prompt: string;
  sentence: string;
  answer: string;
  wrongs: string[];
  bai: number; // 4, 5, 6, 7
  explanation?: {
    meaning: string;
    grammar?: string;
    lesson?: string;
    tips?: string;
    reason: string;
  };
};

// =========================================================================
// 1. KANJI BANK (Chữ Hán Bài 4 - 7: JPD123 FPT)
// =========================================================================
export const KANJI_SEEDS: QuestionSeed[] = [
  // ==================== BÀI 1 KANJI ====================
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（私）はFPT大学の学生です。",
    answer: "わたし",
    wrongs: ["わたくし", "ぼく", "おれ"],
    bai: 1,
    explanation: {
      meaning: "Tôi là sinh viên trường Đại học FPT.",
      grammar: "Chữ Hán: 私 (TƯ - tôi)",
      lesson: "JPD113 - Bài 1",
      tips: "Chữ 私 âm Kunyomi đọc là わたし (watashi).",
      reason: "私 trong câu xưng hô cơ bản đọc là わたし. Các lựa chọn khác không phải âm đọc thông dụng trong bài 1."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あの方は日本語の（先生）です。",
    answer: "せんせい",
    wrongs: ["せいせん", "がくせい", "いしゃ"],
    bai: 1,
    explanation: {
      meaning: "Vị kia là giáo viên tiếng Nhật.",
      grammar: "Chữ Hán: 先生 (TIÊN SINH - giáo viên)",
      lesson: "JPD113 - Bài 1",
      tips: "先生 đọc là せんせい (sensei).",
      reason: "先生 gồm chữ 先 (tiên) và 生 (sinh), đọc là せんせい."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "田中さんは東京（大学）の学生です。",
    answer: "だいがく",
    wrongs: ["こうこう", "ちゅうがく", "たいがく"],
    bai: 1,
    explanation: {
      meaning: "Anh Tanaka là sinh viên trường đại học Tokyo.",
      grammar: "Chữ Hán: 大学 (ĐẠI HỌC)",
      lesson: "JPD113 - Bài 1",
      tips: "大 (đại) + 学 (học) = だいがく (daigaku).",
      reason: "大学 đọc là だいがく."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "アンさんは（学生）じゃありません。",
    answer: "がくせい",
    wrongs: ["がくせ", "かっせい", "がくせん"],
    bai: 1,
    explanation: {
      meaning: "Bạn An không phải là học sinh, sinh viên.",
      grammar: "Chữ Hán: 学生 (HỌC SINH)",
      lesson: "JPD113 - Bài 1",
      tips: "学生 đọc là がくせい (gakusei).",
      reason: "学 (học - がく) ghép với 生 (sinh - せい) tạo thành がくせい."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "さとうさんは（日本人）です。",
    answer: "にほんじん",
    wrongs: ["にっぽんひと", "にほんひと", "にっぽんじん"],
    bai: 1,
    explanation: {
      meaning: "Anh Sato là người Nhật.",
      grammar: "Chữ Hán: 日本人 (NHẬT BẢN NHÂN - người Nhật)",
      lesson: "JPD113 - Bài 1",
      tips: "Quốc gia + 人 (じん) = người nước đó.",
      reason: "日本人 đọc là にほんじん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "リーさんは（中国人）ですか。",
    answer: "ちゅうごくじん",
    wrongs: ["ちゅうごくひと", "ちゅごくじん", "ちゅうこくじん"],
    bai: 1,
    explanation: {
      meaning: "Bạn Lee có phải là người Trung Quốc không?",
      grammar: "Chữ Hán: 中国人 (TRUNG QUỐC NHÂN)",
      lesson: "JPD113 - Bài 1",
      tips: "中国 đọc là ちゅうごく, thêm 人 đọc là ちゅうごくじん.",
      reason: "中国人 đọc chuẩn là ちゅうごくじん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "教室に日本語の（本）があります。",
    answer: "ほん",
    wrongs: ["ぼん", "ぽん", "ほんご"],
    bai: 1,
    explanation: {
      meaning: "Trong lớp có sách tiếng Nhật.",
      grammar: "Chữ Hán: 本 (BẢN - sách)",
      lesson: "JPD113 - Bài 1",
      tips: "本 khi đứng một mình đọc là ほん (hon).",
      reason: "本 (sách) đọc là ほん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "私の妹は今年（二十歳）になります。",
    answer: "はたち",
    wrongs: ["にじゅっさい", "にじゅうさい", "はたさい"],
    bai: 1,
    explanation: {
      meaning: "Em gái tôi năm nay 20 tuổi.",
      grammar: "Chữ Hán đặc biệt: 二十歳 (NHỊ THẬP TUẾ - 20 tuổi)",
      lesson: "JPD113 - Bài 1",
      tips: "20 tuổi có cách đọc đặc biệt là はたち (hatachi).",
      reason: "二十歳 là trường hợp biến âm đặc biệt chỉ tuổi 20, đọc là はたち."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あなたの（誕生日）は何月ですか。",
    answer: "たんじょうび",
    wrongs: ["たんじょうひ", "だんじょうび", "たんじょび"],
    bai: 1,
    explanation: {
      meaning: "Sinh nhật của bạn là tháng mấy?",
      grammar: "Chữ Hán: 誕生日 (ĐẢN SINH NHẬT - ngày sinh nhật)",
      lesson: "JPD113 - Bài 1",
      tips: "誕生 (たんじょう) + 日 (び) = たんじょうび.",
      reason: "誕生日 đọc là たんじょうび."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "アンさんの弟は（何歳）ですか。",
    answer: "なんさい",
    wrongs: ["なにさい", "なんざい", "なにざい"],
    bai: 1,
    explanation: {
      meaning: "Em trai bạn An bao nhiêu tuổi?",
      grammar: "Chữ Hán: 何歳 (HÀ TUẾ - mấy tuổi)",
      lesson: "JPD113 - Bài 1",
      tips: "何 đứng trước hàng s (歳 - さい) đọc là なん.",
      reason: "何歳 đọc là なんさい."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "田中さんの（専門）はコンピューターです。",
    answer: "せんもん",
    wrongs: ["ぜんもん", "せんぶん", "ぜんぶん"],
    bai: 1,
    explanation: {
      meaning: "Chuyên môn của anh Tanaka là máy tính.",
      grammar: "Chữ Hán: 専門 (CHUYÊN MÔN)",
      lesson: "JPD113 - Bài 1",
      tips: "専 (せん) + 門 (もん) = せんもん.",
      reason: "専門 đọc là せんもん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "父の（名前）は山田です。",
    answer: "なまえ",
    wrongs: ["なばえ", "めいぜん", "なまえん"],
    bai: 1,
    explanation: {
      meaning: "Tên của bố tôi là Yamada.",
      grammar: "Chữ Hán: 名前 (DANH TIỀN - tên)",
      lesson: "JPD113 - Bài 1",
      tips: "名 (な) + 前 (まえ) = なまえ.",
      reason: "名前 đọc là なまえ."
    }
  },

  // ==================== BÀI 2 KANJI ====================
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "この日本語の本は（千円）です。",
    answer: "せんえん",
    wrongs: ["ぜんえん", "せんまる", "ちえん"],
    bai: 2,
    explanation: {
      meaning: "Quyển sách tiếng Nhật này có giá 1.000 yên.",
      grammar: "Chữ Hán: 千円 (THIÊN VIÊN - 1000 yên)",
      lesson: "JPD113 - Bài 2",
      tips: "千 (せん) + 円 (えん) = せんえん.",
      reason: "千円 đọc là せんえん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "スーパーで（牛肉）を買いました。",
    answer: "ぎゅうにく",
    wrongs: ["うしにく", "ぎゅにく", "ぎゅうじく"],
    bai: 2,
    explanation: {
      meaning: "Tôi đã mua thịt bò ở siêu thị.",
      grammar: "Chữ Hán: 牛肉 (NGƯU NHỤC - thịt bò)",
      lesson: "JPD113 - Bài 2",
      tips: "牛 (ぎゅう) + 肉 (にく) = ぎゅうにく.",
      reason: "牛肉 đọc là ぎゅうにく."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "日本の（魚）はとても新鮮でおいしいです。",
    answer: "さかな",
    wrongs: ["うお", "さかなん", "さな"],
    bai: 2,
    explanation: {
      meaning: "Cá của Nhật Bản rất tươi và ngon.",
      grammar: "Chữ Hán: 魚 (NGƯ - con cá)",
      lesson: "JPD113 - Bài 2",
      tips: "Chữ 魚 đứng một mình đọc là さかな (sakana).",
      reason: "魚 đọc là さかな."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "朝ごはんに（卵）を食べました。",
    answer: "たまご",
    wrongs: ["らん", "たまごん", "たばご"],
    bai: 2,
    explanation: {
      meaning: "Tôi đã ăn trứng vào bữa sáng.",
      grammar: "Chữ Hán: 卵 (NOÃN - quả trứng)",
      lesson: "JPD113 - Bài 2",
      tips: "卵 đọc là たまご (tamago).",
      reason: "卵 đọc là たまご."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "コップに冷たい（水）を入れます。",
    answer: "みず",
    wrongs: ["すい", "みづ", "みずい"],
    bai: 2,
    explanation: {
      meaning: "Rót nước lạnh vào cốc.",
      grammar: "Chữ Hán: 水 (THỦY - nước)",
      lesson: "JPD113 - Bài 2",
      tips: "Chữ 水 đứng một mình đọc là みず (mizu).",
      reason: "水 đọc là みず."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "このTシャツは（百）円ショップで買いました。",
    answer: "ひゃく",
    wrongs: ["びゃく", "ぴゃく", "はく"],
    bai: 2,
    explanation: {
      meaning: "Tôi đã mua chiếc áo thun này ở cửa hàng 100 yên.",
      grammar: "Chữ Hán: 百 (BÁCH - một trăm)",
      lesson: "JPD113 - Bài 2",
      tips: "百 đọc là ひゃく (hyaku).",
      reason: "百 đọc là ひゃく."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "このパソコンは（十万円）でした。",
    answer: "じゅうまんえん",
    wrongs: ["じゅうまん", "じゅまねん", "じゅうまんまる"],
    bai: 2,
    explanation: {
      meaning: "Chiếc máy tính này có giá 100.000 yên (10 vạn yên).",
      grammar: "Chữ Hán: 十万円 (THẬP VẠN VIÊN)",
      lesson: "JPD113 - Bài 2",
      tips: "十万 (じゅうまん) + 円 (えん) = じゅうまんえん.",
      reason: "十万円 đọc là じゅうまんえん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "レストランの売り場は（何階）ですか。",
    answer: "なんがい",
    wrongs: ["なんかい", "なにがい", "なにかい"],
    bai: 2,
    explanation: {
      meaning: "Khu vực nhà hàng ở tầng mấy?",
      grammar: "Chữ Hán: 何階 (HÀ GIAI - tầng mấy)",
      lesson: "JPD113 - Bài 2",
      tips: "何階 biến âm đọc là なんがい (nangai).",
      reason: "何階 đọc có biến âm đục: なんがい."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あの赤い（車）は誰のですか。",
    answer: "くるま",
    wrongs: ["しゃ", "くるば", "じどう"],
    bai: 2,
    explanation: {
      meaning: "Chiếc xe ô tô màu đỏ kia là của ai?",
      grammar: "Chữ Hán: 車 (XA - xe ô tô)",
      lesson: "JPD113 - Bài 2",
      tips: "車 đứng một mình đọc là くるま (kuruma).",
      reason: "車 đọc là くるま."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "駅の前に大きい（店）があります。",
    answer: "みせ",
    wrongs: ["てん", "みせん", "みぜ"],
    bai: 2,
    explanation: {
      meaning: "Trước nhà ga có một cửa hàng lớn.",
      grammar: "Chữ Hán: 店 (ĐIẾM - cửa hàng)",
      lesson: "JPD113 - Bài 2",
      tips: "店 đứng riêng đọc là みせ (mise).",
      reason: "店 đọc là みせ."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "このスイカはとても（大）きいです。",
    answer: "おお",
    wrongs: ["だい", "お", "たい"],
    bai: 2,
    explanation: {
      meaning: "Quả dưa hấu này rất to.",
      grammar: "Chữ Hán: 大きい (ĐẠI - to lớn)",
      lesson: "JPD113 - Bài 2",
      tips: "大きい đọc là おおきい, chữ 大 đọc là おお.",
      reason: "大 trong 大きい đọc là おお."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "そのかばんは（小）さいですね。",
    answer: "ちい",
    wrongs: ["しょう", "すこ", "ち"],
    bai: 2,
    explanation: {
      meaning: "Chiếc cặp đó nhỏ nhỉ.",
      grammar: "Chữ Hán: 小さい (TIỂU - nhỏ bé)",
      lesson: "JPD113 - Bài 2",
      tips: "小さい đọc là ちいさい, chữ 小 đọc là ちい.",
      reason: "小 trong 小さい đọc là ちい."
    }
  },

  // ==================== BÀI 3 KANJI ====================
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "毎朝7（時）に起きて、学校へ行きます。",
    answer: "じ",
    wrongs: ["とき", "ぶん", "はん"],
    bai: 3,
    explanation: {
      meaning: "Mỗi sáng tôi thức dậy lúc 7 giờ rồi đi học.",
      grammar: "Chữ Hán: 時 (THỜI - giờ)",
      lesson: "JPD113 - Bài 3",
      tips: "Số đếm + 時 đọc là じ (ji).",
      reason: "時 chỉ giờ đọc là じ."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "いま4時30（分）です。",
    answer: "ぷん",
    wrongs: ["ふん", "はん", "ぶん"],
    bai: 3,
    explanation: {
      meaning: "Bây giờ là 4 giờ 30 phút.",
      grammar: "Chữ Hán: 分 (PHÂN - phút)",
      lesson: "JPD113 - Bài 3",
      tips: "30分 biến âm đọc là さんじゅっぷん / さんじっぷん.",
      reason: "30分 đọc là さんじゅっぷん (đuôi ぷん)."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "午後1時（半）に友達と会います。",
    answer: "はん",
    wrongs: ["なか", "ばち", "ふん"],
    bai: 3,
    explanation: {
      meaning: "Tôi gặp bạn vào lúc 1 giờ rưỡi chiều.",
      grammar: "Chữ Hán: 半 (BÁN - nửa, rưỡi)",
      lesson: "JPD113 - Bài 3",
      tips: "1時半 = 1 giờ rưỡi, 半 đọc là はん.",
      reason: "半 đọc là はん."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（今）何時ですか。",
    answer: "いま",
    wrongs: ["こん", "きょう", "あした"],
    bai: 3,
    explanation: {
      meaning: "Bây giờ là mấy giờ?",
      grammar: "Chữ Hán: 今 (KIM - bây giờ)",
      lesson: "JPD113 - Bài 3",
      tips: "今 đứng độc lập đọc là いま (ima).",
      reason: "今 đọc là いま."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（朝）ご飯を食べます。",
    answer: "あさ",
    wrongs: ["ひる", "よる", "あした"],
    bai: 3,
    explanation: {
      meaning: "Tôi ăn cơm sáng.",
      grammar: "Chữ Hán: 朝 (TRIÊU - buổi sáng)",
      lesson: "JPD113 - Bài 3",
      tips: "朝 đọc là あさ (asa).",
      reason: "朝 đọc là あさ."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（昼）休みに公園を散歩します。",
    answer: "ひる",
    wrongs: ["あさ", "よる", "ばん"],
    bai: 3,
    explanation: {
      meaning: "Giờ nghỉ trưa tôi đi dạo ở công viên.",
      grammar: "Chữ Hán: 昼 (TRÚ - buổi trưa)",
      lesson: "JPD113 - Bài 3",
      tips: "昼 đọc là ひる (hiru).",
      reason: "昼 đọc là ひる."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（夜）11時に寝ます。",
    answer: "よる",
    wrongs: ["ばん", "あさ", "ひる"],
    bai: 3,
    explanation: {
      meaning: "Tôi đi ngủ lúc 11 giờ đêm.",
      grammar: "Chữ Hán: 夜 (DẠ - buổi tối, ban đêm)",
      lesson: "JPD113 - Bài 3",
      tips: "夜 đọc là よる (yoru).",
      reason: "夜 đọc là よる."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "明日、図書館へ（行）きます。",
    answer: "い",
    wrongs: ["き", "かえ", "み"],
    bai: 3,
    explanation: {
      meaning: "Ngày mai tôi đi đến thư viện.",
      grammar: "Chữ Hán: 行きます (HÀNH - đi)",
      lesson: "JPD113 - Bài 3",
      tips: "行きます đọc là いきます.",
      reason: "行 trong 行きます đọc là い."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "友達がうちに（来）ます。",
    answer: "き",
    wrongs: ["い", "かえ", "み"],
    bai: 3,
    explanation: {
      meaning: "Bạn tôi đến nhà chơi.",
      grammar: "Chữ Hán: 来ます (LAI - đến)",
      lesson: "JPD113 - Bài 3",
      tips: "来ます đọc là きます.",
      reason: "来 trong 来ます đọc là き."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "毎日くだものを（食）べます。",
    answer: "た",
    wrongs: ["の", "み", "き"],
    bai: 3,
    explanation: {
      meaning: "Mỗi ngày tôi đều ăn trái cây.",
      grammar: "Chữ Hán: 食べます (THỰC - ăn)",
      lesson: "JPD113 - Bài 3",
      tips: "食べます đọc là たべます.",
      reason: "食 trong 食べます đọc là た."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "冷たい水を（飲）みます。",
    answer: "の",
    wrongs: ["た", "き", "み"],
    bai: 3,
    explanation: {
      meaning: "Tôi uống nước lạnh.",
      grammar: "Chữ Hán: 飲みます (ẨM - uống)",
      lesson: "JPD113 - Bài 3",
      tips: "飲みます đọc là のみます.",
      reason: "飲 trong 飲みます đọc là の."
    }
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "毎朝、新聞を（読）みます。",
    answer: "よ",
    wrongs: ["か", "き", "み"],
    bai: 3,
    explanation: {
      meaning: "Mỗi sáng tôi đều đọc báo.",
      grammar: "Chữ Hán: 読みます (ĐỘC - đọc)",
      lesson: "JPD113 - Bài 3",
      tips: "読みます đọc là よみます.",
      reason: "読 trong 読みます đọc là よ."
    }
  },

  // --- BÀI 4 KANJI ---
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "この（料理）はとてもおいしいです。",
    answer: "りょうり",
    wrongs: ["りょり", "りょうりん", "りょおり"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "週末に友達と（映画）を見に行きます。",
    answer: "えいが",
    wrongs: ["えいか", "えが", "えいご"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "きょうは天気が良くて、（暑い）ですね。",
    answer: "あつい",
    wrongs: ["さむい", "あたたかい", "すずしい"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "きのう、デパートで（新しい）靴を買いました。",
    answer: "あたらしい",
    wrongs: ["あたらし", "ふるい", "あたらしき"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "私の部屋はあまり（広くない）です。",
    answer: "ひろくない",
    wrongs: ["せまくない", "おおくない", "ちいさくない"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "東京の（東）のほうにきれいな川があります。",
    answer: "ひがし",
    wrongs: ["にし", "みなみ", "きた"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "日本の首都は（東京）です。",
    answer: "とうきょう",
    wrongs: ["とうきょ", "とっきょう", "とうきょうと"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "テストの用紙に自分の（名前）を書きます。",
    answer: "なまえ",
    wrongs: ["なまお", "みょうじ", "なまい"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "駅の（前）で友達と待ち合わせをします。",
    answer: "まえ",
    wrongs: ["うしろ", "となり", "あいだ"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "アンさんの（国）はどちらですか。",
    answer: "くに",
    wrongs: ["まち", "むら", "いえ"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あそこにいる（男）の人は誰ですか。",
    answer: "おとこ",
    wrongs: ["おんな", "ひと", "こども"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あそこにいる（女）の人は日本語の先生です。",
    answer: "おんな",
    wrongs: ["おとこ", "かた", "はは"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "冬の北海道はとても（寒い）です。",
    answer: "さむい",
    wrongs: ["あつい", "すずしい", "あたたかい"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "きのう、スーパーでりんごを（かいました）。",
    answer: "買いました",
    wrongs: ["貝いました", "売いました", "借いました"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "きょうのテストはあまり（むずかしくない）です。",
    answer: "難しくない",
    wrongs: ["易しくない", "悲しくない", "忙しくない"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "あした、駅の（まえ）で会いましょう。",
    answer: "前",
    wrongs: ["後", "先", "外"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "私の（くに）はベトナムです。",
    answer: "国",
    wrongs: ["市", "区", "町"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "受付で（なまえ）を呼ばれました。",
    answer: "名前",
    wrongs: ["名先", "字前", "名後"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「料」trong từ「料理 (りょうり)」có âm Hán Việt là gì?",
    sentence: "〔料〕理",
    answer: "LIỆU",
    wrongs: ["LÝ", "KHOA", "TIỆM"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「新」trong「新しい (あたらしい)」mang ý nghĩa gì?",
    sentence: "〔新〕しい",
    answer: "Tân (Mới)",
    wrongs: ["Cổ (Cũ)", "Bạch (Trắng)", "Thân (Gần gũi)"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「東」trong「東京 (とうきょう)」có âm Hán Việt là gì?",
    sentence: "〔東〕京",
    answer: "ĐÔNG",
    wrongs: ["TÂY", "NAM", "BẮC"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「国」trong「外国 (がいこく)」có âm Hán Việt là gì?",
    sentence: "外〔国〕",
    answer: "QUỐC",
    wrongs: ["VIÊN", "ĐỊA", "THÀNH"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「男」trong「男の人 (おとこのひと)」có âm Hán Việt là gì?",
    sentence: "〔男〕の人",
    answer: "NAM",
    wrongs: ["NỮ", "NHÂN", "TỬ"],
    bai: 4,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「女」trong「女の人 (おんなのひと)」có âm Hán Việt là gì?",
    sentence: "〔女〕の人",
    answer: "NỮ",
    wrongs: ["NAM", "MẪU", "TỬ"],
    bai: 4,
  },

  // --- BÀI 5 KANJI ---
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "きのうは雨でしたから、（家）にいました。",
    answer: "うち",
    wrongs: ["いえ", "へや", "まち"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "図書館で日本の歴史の（本）を読みました。",
    answer: "ほん",
    wrongs: ["ぼん", "ぽん", "こん"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "のどがかわきましたから、（水）を飲みたいです。",
    answer: "みず",
    wrongs: ["すい", "おちゃ", "ゆ"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（先週）の土曜日に映画を見に行きました。",
    answer: "せんしゅう",
    wrongs: ["こんしゅう", "らいしゅう", "まいしゅう"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（毎日）日本語の単語を練習します。",
    answer: "まいにち",
    wrongs: ["まいあさ", "まいばん", "まいとし"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "明日の（午後）に友達が遊びに来ます。",
    answer: "ごご",
    wrongs: ["ごぜん", "ひる", "よる"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "今朝、（午前）8時に家を出ました。",
    answer: "ごぜん",
    wrongs: ["ごご", "あさ", "よる"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "仕事の（後）で、ビールを飲みに行きます。",
    answer: "あと",
    wrongs: ["まえ", "あいだ", "うしろ"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "日曜日に動物園でパンダを（見ました）。",
    answer: "みました",
    wrongs: ["ききました", "いきました", "たべました"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "昨日の晩、友達と日本料理を（食べました）。",
    answer: "たべました",
    wrongs: ["のみました", "かいました", "みました"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "冷たいお茶を（飲みました）。",
    answer: "のみました",
    wrongs: ["たべました", "かいました", "みました"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "おいしい（食べ物）をたくさん買いました。",
    answer: "たべもの",
    wrongs: ["のみもの", "かいもの", "くだもの"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "明日は会社の（休み）の日です。",
    answer: "やすみ",
    wrongs: ["しごと", "じゅぎょう", "きゅうじつ"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "来週、東京へ（いきたい）です。",
    answer: "行きたい",
    wrongs: ["来きたい", "帰きたい", "待きたい"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "母とデパートへ（かいもの）に行きました。",
    answer: "買い物",
    wrongs: ["買い者", "買い所", "買い方"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "毎朝、（みず）を一杯飲みます。",
    answer: "水",
    wrongs: ["氷", "木", "火"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "週末に家族と（りょこう）に行きます。",
    answer: "旅行",
    wrongs: ["旅光", "遊行", "旅行く"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "（せんしゅう）の試験はどうでしたか。",
    answer: "先週",
    wrongs: ["今週", "来週", "前週"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "（ごご）3時に郵便局へ行きます。",
    answer: "午後",
    wrongs: ["午前", "後午", "昼後"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「映」trong từ「映画 (えいが)」có âm Hán Việt là gì?",
    sentence: "〔映〕画",
    answer: "ÁNH",
    wrongs: ["HOẠ", "ẢNH", "ẢO"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「先」trong「先生 (せんせい)」có âm Hán Việt là gì?",
    sentence: "〔先〕生",
    answer: "TIÊN",
    wrongs: ["HẬU", "SINH", "SƯ"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「週」trong「今週 (こんしゅう)」có âm Hán Việt là gì?",
    sentence: "今〔週〕",
    answer: "CHU",
    wrongs: ["NGUYỆT", "NIÊN", "NHẬT"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「休」trong「休み (やすみ)」có âm Hán Việt là gì?",
    sentence: "〔休〕み",
    answer: "HƯU",
    wrongs: ["THỂ", "BẢN", "SINH"],
    bai: 5,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「物」trong「買い物 (かいもの)」có âm Hán Việt là gì?",
    sentence: "買い〔物〕",
    answer: "VẬT",
    wrongs: ["NHÂN", "SỰ", "ĐỊA"],
    bai: 5,
  },

  // --- BÀI 6 KANJI ---
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "ハノイの夏はダナンより（雨）が多いです。",
    answer: "あめ",
    wrongs: ["ゆき", "かぜ", "くも"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "FPT大学のキャンパスは駅から（近い）です。",
    answer: "ちかい",
    wrongs: ["とおい", "はやい", "たかい"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "私の（町）には古いお寺がたくさんあります。",
    answer: "まち",
    wrongs: ["むら", "みち", "くに"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "１年の中で（春）がいちばん好きです。",
    answer: "はる",
    wrongs: ["なつ", "あき", "ふゆ"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（今日）はきのうよりずっと暖かいです。",
    answer: "きょう",
    wrongs: ["あした", "きのう", "いま"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "午後5時に（会社）を出ます。",
    answer: "かいしゃ",
    wrongs: ["がっこう", "ぎんこう", "えき"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "毎朝、駅で（新聞）を買って読みます。",
    answer: "しんぶん",
    wrongs: ["ほん", "ざっし", "てがみ"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "このアパートは家賃が（やすい）です。",
    answer: "安い",
    wrongs: ["高い", "安心", "安心い"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "この池には（さかな）がたくさん泳いでいます。",
    answer: "魚",
    wrongs: ["角", "鳥", "肉"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "喫茶店で友達と（あいました）。",
    answer: "会いました",
    wrongs: ["話いました", "聞いました", "合いました"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "午後6時に家へ（かえります）。",
    answer: "帰ります",
    wrongs: ["来ります", "行ります", "買ります"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「社」trong「会社 (かいしゃ)」có âm Hán Việt là gì?",
    sentence: "会〔社〕",
    answer: "XÃ",
    wrongs: ["HỘI", "VIỆN", "ĐƯỜNG"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「聞」trong「新聞 (しんぶん)」có âm Hán Việt là gì?",
    sentence: "新〔聞〕",
    answer: "VĂN",
    wrongs: ["VẤN", "GIẢI", "TÂN"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「話」trong「会話 (かいわ)」có âm Hán Việt là gì?",
    sentence: "会〔話〕",
    answer: "THOẠI",
    wrongs: ["NGÔN", "NGỮ", "KẾ"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「書」trong「辞書 (じしょ)」có âm Hán Việt là gì?",
    sentence: "辞〔書〕",
    answer: "THƯ",
    wrongs: ["TRÚ", "HỌA", "KÝ"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "日曜日、家族と（海）へ行きました。",
    answer: "うみ",
    wrongs: ["やま", "かわ", "まち"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "休みの日に高い（山）に登りました。",
    answer: "やま",
    wrongs: ["かわ", "うみ", "もり"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "この（川）で魚をつりましょう。",
    answer: "かわ",
    wrongs: ["うみ", "やま", "いけ"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "あしたはいい（天気）になるといいですね。",
    answer: "てんき",
    wrongs: ["きせつ", "きおん", "くうき"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "成田（空港）まで電車で行きます。",
    answer: "くうこう",
    wrongs: ["みなと", "えき", "こうえん"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "きょうは（風）が強くて、寒いです。",
    answer: "かぜ",
    wrongs: ["あめ", "ゆき", "くも"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "スーパーで新鮮な（野菜）を買いました。",
    answer: "やさい",
    wrongs: ["くだもの", "さかな", "にく"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "毎日、牛肉や豚（肉）を食べます。",
    answer: "にく",
    wrongs: ["さかな", "やさい", "たまご"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "冬の北海道は（雪）がたくさん降ります。",
    answer: "ゆき",
    wrongs: ["あめ", "かぜ", "くも"],
    bai: 6,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "夏休みに友達と（旅行）に行きます。",
    answer: "りょこう",
    wrongs: ["かいもの", "さんぽ", "しょくじ"],
    bai: 6,
  },

  // --- BÀI 7 KANJI ---
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "先生、この言葉の（意味）を教えてください。",
    answer: "いみ",
    wrongs: ["いめ", "いき", "ちみ"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "紙に黒いペンで名前を（書いて）ください。",
    answer: "かいて",
    wrongs: ["きいて", "おいて", "はなして"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "田中さんは今、教室で宿題を（して）います。",
    answer: "して",
    wrongs: ["みて", "きて", "いて"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "熱がありますから、（病院）へ行かなければなりません。",
    answer: "びょういん",
    wrongs: ["びょうき", "びょいん", "ぼよういん"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "朝ごはんのあとで、薬を（飲んで）ください。",
    answer: "のんで",
    wrongs: ["たべて", "すんで", "よんで"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.YOMI.promptJp,
    prompt: HEADERS.YOMI.prompt,
    sentence: "（電気）を消して、部屋を出ます。",
    answer: "でんき",
    wrongs: ["でんしゃ", "てんき", "でんわ"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "すみません、その窓を（あけて）ください。",
    answer: "開けて",
    wrongs: ["閉けて", "門けて", "問けて"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "漢字の（よみかた）がまだ分かりません。",
    answer: "読み方",
    wrongs: ["書き方", "話し方", "見み方"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "暑いですから、ドアを（しめて）クーラーをつけてください。",
    answer: "閉めて",
    wrongs: ["開めて", "止めて", "間めて"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "すき焼きに牛肉と（やさい）を入れます。",
    answer: "野菜",
    wrongs: ["野草", "野菜い", "野果"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.KAKI.promptJp,
    prompt: HEADERS.KAKI.prompt,
    sentence: "豚（にく）と鶏肉を半分ずつ買いました。",
    answer: "肉",
    wrongs: ["内", "魚", "角"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「病」trong từ「病院 (びょういん)」có âm Hán Việt là gì?",
    sentence: "〔病〕院",
    answer: "BỆNH",
    wrongs: ["VIỆN", "THỐNG", "THƯƠNG"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「電」trong「電気 (でんき)」「電車 (でんしゃ)」có âm Hán Việt là gì?",
    sentence: "〔電〕気",
    answer: "ĐIỆN",
    wrongs: ["KHÍ", "XA", "VÂN"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「肉」trong「牛肉 (ぎゅうにく)」có âm Hán Việt là gì?",
    sentence: "牛〔肉〕",
    answer: "NHỤC",
    wrongs: ["NGƯU", "HỦY", "GIÁP"],
    bai: 7,
  },
  {
    section: "Kanji",
    promptJp: HEADERS.HAN.promptJp,
    prompt: "Chữ Hán「半」trong「半分 (はんぶん)」có âm Hán Việt là gì?",
    sentence: "〔半〕分",
    answer: "BÁN",
    wrongs: ["PHÂN", "NGỌ", "HOÀN"],
    bai: 7,
  },
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "スーパーで豚の（肉）を買いました。",
  "answer": "にく",
  "wrongs": [
    "とり",
    "さかな",
    "ぎゅう"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "きのう、新鮮な（野菜）を食べました。",
  "answer": "やさい",
  "wrongs": [
    "やせい",
    "のさい",
    "やざい"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "気分が悪いので、（病院）へ行きます。",
  "answer": "びょういん",
  "wrongs": [
    "びょうかん",
    "びよういん",
    "びょうえん"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "暑いですね。部屋の（電気）をつけてください。",
  "answer": "でんき",
  "wrongs": [
    "でんしゃ",
    "でんわ",
    "てんき"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "窓を（開けて）ください。",
  "answer": "あけて",
  "wrongs": [
    "しめて",
    "つけて",
    "けして"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "（　　）の漢字の正しい読み方を選びなさい。",
  "prompt": "Chọn cách đọc Hiragana đúng của chữ Hán trong（　　）.",
  "sentence": "寒いですから、ドアを（閉めて）ください。",
  "answer": "しめて",
  "wrongs": [
    "あけて",
    "たてて",
    "けして"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線のひらがなの正しい漢字を選びなさい。",
  "prompt": "Chọn chữ Hán tự đúng của chữ Hiragana trong（　　）.",
  "sentence": "すしの（つくりかた）を習いました。",
  "answer": "作り方",
  "wrongs": [
    "作リ方",
    "創り方",
    "作り芳"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線のひらがなの正しい漢字を選びなさい。",
  "prompt": "Chọn chữ Hán tự đúng của chữ Hiragana trong（　　）.",
  "sentence": "あそこで少し（まって）ください。",
  "answer": "待って",
  "wrongs": [
    "持って",
    "特って",
    "侍って"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線のひらがなの正しい漢字を選びなさい。",
  "prompt": "Chọn chữ Hán tự đúng của chữ Hiragana trong（　　）.",
  "sentence": "ここに住所と名前を（かいて）ください。",
  "answer": "書いて",
  "wrongs": [
    "描いて",
    "着いて",
    "聞いて"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線の漢字の音読みまたは意味・漢字音を選びなさい。",
  "prompt": "Chữ Hán「病」trong「病院 (びょういん)」có âm Hán Việt là gì?",
  "sentence": "〔病〕院",
  "answer": "BỆNH",
  "wrongs": [
    "VIỆN",
    "ĐIỆN",
    "KHÍ"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線の漢字の音読みまたは意味・漢字音を選びなさい。",
  "prompt": "Chữ Hán「開」trong「開けてください」mang ý nghĩa gì?",
  "sentence": "〔開〕けてください",
  "answer": "Khai (Mở)",
  "wrongs": [
    "Bế (Đóng)",
    "Khởi (Thức dậy)",
    "Văn (Nghe)"
  ],
  "bai": 7
},
{
  "section": "Kanji",
  "promptJp": "下線の漢字の音読みまたは意味・漢字音を選びなさい。",
  "prompt": "Chữ Hán「閉」trong「閉めてください」mang ý nghĩa gì?",
  "sentence": "〔閉〕めてください",
  "answer": "Bế (Đóng)",
  "wrongs": [
    "Khai (Mở)",
    "Diệt (Tắt)",
    "Chỉ (Dừng)"
  ],
  "bai": 7
}
];

// =========================================================================
// 2. VOCABULARY BANK (Từ vựng Bài 4 - 7: JPD123 FPT)
// =========================================================================
export const VOCAB_SEEDS: QuestionSeed[] = [
  // ==================== BÀI 1 VOCAB ====================
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "初対面の人に会った時、「（　　）、田中です」と挨拶します。",
    answer: "はじめまして",
    wrongs: ["さようなら", "こんばんは", "おやすみなさい"],
    bai: 1,
    explanation: {
      meaning: "Lần đầu gặp mặt: 'Rất vui được gặp bạn, tôi là Tanaka'.",
      grammar: "Chào hỏi lần đầu: はじめまして",
      lesson: "JPD113 - Bài 1",
      tips: "Lần đầu gặp nhau luôn mở đầu bằng はじめまして.",
      reason: "はじめまして dùng khi lần đầu tiên gặp một người."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「田中さん、どうぞ（　　）おねがいします。」",
    answer: "よろしく",
    wrongs: ["ありがたく", "おねがい", "おなじく"],
    bai: 1,
    explanation: {
      meaning: "Anh Tanaka, rất mong được anh giúp đỡ.",
      grammar: "Cụm giao tiếp: どうぞよろしくお願いします",
      lesson: "JPD113 - Bài 1",
      tips: "Cụm cố định: どうぞよろしく.",
      reason: "どうぞよろしく là cách chào mong được giúp đỡ khi làm quen."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "マリアさんは病院で働いています。（　　）です。",
    answer: "いしゃ",
    wrongs: ["ぎんこういん", "かしゅ", "うんてんしゅ"],
    bai: 1,
    explanation: {
      meaning: "Chị Maria làm việc ở bệnh viện. Chị ấy là bác sĩ.",
      grammar: "Nghề nghiệp: 医者 (いしゃ - bác sĩ)",
      lesson: "JPD113 - Bài 1",
      tips: "Bệnh viện (病院) thì làm nghề bác sĩ (いしゃ).",
      reason: "Làm việc tại bệnh viện là bác sĩ (いしゃ)."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "マイさんはIT企業で働いています。（　　）です。",
    answer: "かいしゃいん",
    wrongs: ["せんせい", "がくせい", "きょうし"],
    bai: 1,
    explanation: {
      meaning: "Mai làm việc ở công ty IT. Bạn ấy là nhân viên công ty.",
      grammar: "Nghề nghiệp: 会社員 (かいしゃいん - nhân viên công ty)",
      lesson: "JPD113 - Bài 1",
      tips: "Làm việc ở công ty là かいしゃいん.",
      reason: "Người làm ở công ty gọi là かいしゃいん."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "私の（　　）は映画と音楽です。",
    answer: "しゅみ",
    wrongs: ["しごと", "なまえ", "せんもん"],
    bai: 1,
    explanation: {
      meaning: "Sở thích của tôi là phim ảnh và âm nhạc.",
      grammar: "Danh từ: 趣味 (しゅみ - sở thích)",
      lesson: "JPD113 - Bài 1",
      tips: "Phim ảnh (映画) và âm nhạc (音楽) là sở thích (しゅみ).",
      reason: "しゅみ nghĩa là sở thích."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「お（　　）はどちらですか。」「ベトナムです。」",
    answer: "くに",
    wrongs: ["うち", "へや", "まち"],
    bai: 1,
    explanation: {
      meaning: "Quý quốc của bạn là ở đâu? - Là Việt Nam.",
      grammar: "Hỏi quốc tịch lịch sự: お国 (おくに)",
      lesson: "JPD113 - Bài 1",
      tips: "Hỏi xuất thân quốc gia dùng おくにはどちらですか.",
      reason: "ベトナム là tên nước nên câu hỏi là おくに."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「アンさんは何歳ですか。」「（　　）です。」",
    answer: "はたち",
    wrongs: ["にじゅう", "はたちさい", "はつか"],
    bai: 1,
    explanation: {
      meaning: "Bạn An bao nhiêu tuổi? - 20 tuổi.",
      grammar: "Tuổi tác đặc biệt: 20 tuổi = はたち",
      lesson: "JPD113 - Bài 1",
      tips: "20 tuổi không thêm さい, gọi là はたち.",
      reason: "はたち là 20 tuổi (không nói はたちさい)."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「あなたの（　　）は何番ですか。」「090-1234-5678です。」",
    answer: "でんわばんごう",
    wrongs: ["たんじょうび", "なまえ", "じゅうしょ"],
    bai: 1,
    explanation: {
      meaning: "Số điện thoại của bạn là số mấy? - Là 090-1234-5678.",
      grammar: "Từ vựng: 電話番号 (でんわばんごう - số điện thoại)",
      lesson: "JPD113 - Bài 1",
      tips: "Dãy số có gạch nối là số điện thoại (でんわばんごう).",
      reason: "Câu trả lời là dãy số điện thoại nên chọn でんわばんごう."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "鈴木さんはIT企業の（　　）です。",
    answer: "エンジニア",
    wrongs: ["アルバイト", "カメラ", "パソコン"],
    bai: 1,
    explanation: {
      meaning: "Anh Suzuki là kỹ sư của doanh nghiệp IT.",
      grammar: "Nghề nghiệp: エンジニア (kỹ sư)",
      lesson: "JPD113 - Bài 1",
      tips: "IT企業 thì làm エンジニア (engineer).",
      reason: "エンジニア là kỹ sư công nghệ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ミラーさんはアメリカ（　　）です。",
    answer: "じん",
    wrongs: ["ご", "ほん", "ひと"],
    bai: 1,
    explanation: {
      meaning: "Anh Miller là người Mỹ.",
      grammar: "Hậu tố chỉ người: 〜人 (〜じん)",
      lesson: "JPD113 - Bài 1",
      tips: "Tên nước + じん = người nước đó.",
      reason: "アメリカじん là người Mỹ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "山田さんの奥さんは（　　）です。家で家事をしています。",
    answer: "しゅふ",
    wrongs: ["きょうし", "いしゃ", "しゃいん"],
    bai: 1,
    explanation: {
      meaning: "Vợ anh Yamada là nội trợ. Ở nhà làm việc nhà.",
      grammar: "Nghề nghiệp: 主婦 (しゅふ - nội trợ)",
      lesson: "JPD113 - Bài 1",
      tips: "Làm việc nhà chăm lo gia đình là nội trợ (しゅふ).",
      reason: "しゅふ nghĩa là người nội trợ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「お（　　）は何ですか。」「アンです。」",
    answer: "なまえ",
    wrongs: ["とし", "しゅみ", "くに"],
    bai: 1,
    explanation: {
      meaning: "Tên bạn là gì? - Là An.",
      grammar: "Hỏi tên: お名前 (おなまえ)",
      lesson: "JPD113 - Bài 1",
      tips: "Trả lời là tên riêng nên câu hỏi là おなまえ.",
      reason: "おなまえ nghĩa là tên."
    }
  },

  // ==================== BÀI 2 VOCAB ====================
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "お金を（　　）に入れて、出かけます。",
    answer: "さいふ",
    wrongs: ["とけい", "くつ", "ズボン"],
    bai: 2,
    explanation: {
      meaning: "Bỏ tiền vào ví rồi đi ra ngoài.",
      grammar: "Đồ vật: 財布 (さいふ - cái ví)",
      lesson: "JPD113 - Bài 2",
      tips: "Đựng tiền (お金) thì dùng ví (さいふ).",
      reason: "さいふ nghĩa là ví đựng tiền."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "旅行で綺麗な写真を撮るために（　　）を買いました。",
    answer: "カメラ",
    wrongs: ["テレビ", "CD", "ペン"],
    bai: 2,
    explanation: {
      meaning: "Tôi đã mua máy ảnh để chụp ảnh đẹp khi đi du lịch.",
      grammar: "Đồ vật: カメラ (máy ảnh)",
      lesson: "JPD113 - Bài 2",
      tips: "Chụp ảnh (写真) thì dùng máy ảnh (カメラ).",
      reason: "カメラ nghĩa là máy ảnh."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "レポートを書くために（　　）を使います。",
    answer: "パソコン",
    wrongs: ["カメラ", "ズボン", "さいふ"],
    bai: 2,
    explanation: {
      meaning: "Tôi sử dụng máy tính xách tay để viết báo cáo.",
      grammar: "Thiết bị: パソコン (máy tính PC/laptop)",
      lesson: "JPD113 - Bài 2",
      tips: "Viết báo cáo, gõ văn bản dùng パソコン.",
      reason: "パソコン là máy vi tính."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "いま何時か知りたいですから、（　　）を見ます。",
    answer: "とけい",
    wrongs: ["めがね", "さいふ", "かばん"],
    bai: 2,
    explanation: {
      meaning: "Vì muốn biết mấy giờ rồi nên tôi xem đồng hồ.",
      grammar: "Đồ vật: 時計 (とけい - đồng hồ)",
      lesson: "JPD113 - Bài 2",
      tips: "Xem giờ thì nhìn đồng hồ (とけい).",
      reason: "とけい nghĩa là đồng hồ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "毎朝、朝ごはんに（　　）とたまごを食べます。",
    answer: "パン",
    wrongs: ["くつ", "カメラ", "さいふ"],
    bai: 2,
    explanation: {
      meaning: "Mỗi sáng tôi ăn bánh mì và trứng.",
      grammar: "Món ăn: パン (bánh mì)",
      lesson: "JPD113 - Bài 2",
      tips: "Món ăn cùng với trứng vào bữa sáng là bánh mì (パン).",
      reason: "パン nghĩa là bánh mì."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "喫茶店で温かい（　　）を飲みました。",
    answer: "コーヒー",
    wrongs: ["ごはん", "パン", "さかな"],
    bai: 2,
    explanation: {
      meaning: "Tôi đã uống cà phê nóng ở quán giải khát.",
      grammar: "Đồ uống: コーヒー (cà phê)",
      lesson: "JPD113 - Bài 2",
      tips: "Đồ uống ở quán cà phê là コーヒー.",
      reason: "コーヒー là đồ uống (cà phê)."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「すみません、（　　）はどこですか。」「あちらです。」",
    answer: "トイレ",
    wrongs: ["ペン", "さいふ", "とけい"],
    bai: 2,
    explanation: {
      meaning: "Xin lỗi, nhà vệ sinh ở đâu vậy? - Ở đằng kia ạ.",
      grammar: "Địa điểm: トイレ (nhà vệ sinh)",
      lesson: "JPD113 - Bài 2",
      tips: "Hỏi địa điểm trong toà nhà thường là トイレ.",
      reason: "トイレ là nhà vệ sinh."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "（　　）で野菜や新鮮な果物を買います。",
    answer: "スーパー",
    wrongs: ["きっさてん", "エレベーター", "レジ"],
    bai: 2,
    explanation: {
      meaning: "Tôi mua rau và trái cây tươi ở siêu thị.",
      grammar: "Địa điểm mua sắm: スーパー (siêu thị)",
      lesson: "JPD113 - Bài 2",
      tips: "Mua rau quả đồ ăn ở スーパー (supermarket).",
      reason: "スーパー nghĩa là siêu thị."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「この傘は（　　）ですか。」「500円です。」",
    answer: "いくら",
    wrongs: ["どこ", "だれ", "なん"],
    bai: 2,
    explanation: {
      meaning: "Chiếc ô này bao nhiêu tiền? - Là 500 yên.",
      grammar: "Từ để hỏi giá: いくら (bao nhiêu tiền)",
      lesson: "JPD113 - Bài 2",
      tips: "Trả lời có số tiền (500円) thì câu hỏi phải là いくら.",
      reason: "いくら dùng để hỏi giá tiền."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "買い物をして、（　　）でお金を払います。",
    answer: "レジ",
    wrongs: ["トイレ", "エレベーター", "メニュー"],
    bai: 2,
    explanation: {
      meaning: "Mua sắm xong, thanh toán tiền tại quầy thu ngân.",
      grammar: "Từ vựng: レジ (quầy thu ngân / quầy tính tiền)",
      lesson: "JPD113 - Bài 2",
      tips: "Nơi trả tiền trong siêu thị là レジ (cash register).",
      reason: "レジ nghĩa là quầy thu ngân."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "レストランで（　　）を見て、食べたい料理を選びます。",
    answer: "メニュー",
    wrongs: ["レジ", "スーパー", "とけい"],
    bai: 2,
    explanation: {
      meaning: "Xem thực đơn ở nhà hàng để chọn món muốn ăn.",
      grammar: "Từ vựng: メニュー (thực đơn)",
      lesson: "JPD113 - Bài 2",
      tips: "Chọn món ăn ở nhà hàng xem メニュー (menu).",
      reason: "メニュー nghĩa là thực đơn."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "デパートの2階へ行くために（　　）に乗ります。",
    answer: "エスカレーター",
    wrongs: ["レジ", "メニュー", "テーブル"],
    bai: 2,
    explanation: {
      meaning: "Tôi đi thang cuốn để lên tầng 2 của trung tâm thương mại.",
      grammar: "Từ vựng: エスカレーター (thang cuốn)",
      lesson: "JPD113 - Bài 2",
      tips: "Phương tiện di chuyển giữa các tầng là エスカレーター.",
      reason: "エスカレーター là thang cuốn."
    }
  },

  // ==================== BÀI 3 VOCAB ====================
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "（　　）7時に起きて、学校へ行きます。",
    answer: "毎朝",
    wrongs: ["毎晩", "昨日", "先週"],
    bai: 3,
    explanation: {
      meaning: "Mỗi sáng tôi thức dậy lúc 7 giờ rồi đi học.",
      grammar: "Thời gian lặp lại: 毎朝 (まいあさ - mỗi sáng)",
      lesson: "JPD113 - Bài 3",
      tips: "Thức dậy lúc 7 giờ sáng thì dùng 毎朝.",
      reason: "毎朝 là mỗi buổi sáng."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "（　　）はお金を預けたり、おろしたりするところです。",
    answer: "銀行",
    wrongs: ["病院", "図書館", "郵便局"],
    bai: 3,
    explanation: {
      meaning: "Ngân hàng là nơi gửi và rút tiền.",
      grammar: "Địa điểm: 銀行 (ぎんこう - ngân hàng)",
      lesson: "JPD113 - Bài 3",
      tips: "Liên quan đến tiền bạc (お金) là ngân hàng (銀行).",
      reason: "銀行 là ngân hàng."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "静かな部屋で本を借りるために（　　）へ行きます。",
    answer: "図書館",
    wrongs: ["銀行", "病院", "公園"],
    bai: 3,
    explanation: {
      meaning: "Tôi đến thư viện để mượn sách ở phòng yên tĩnh.",
      grammar: "Địa điểm: 図書館 (としょかん - thư viện)",
      lesson: "JPD113 - Bài 3",
      tips: "Đọc sách, mượn sách (本) thì đến 図書館.",
      reason: "図書館 là thư viện."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "頭が痛いですから、（　　）へ行って薬をもらいます。",
    answer: "病院",
    wrongs: ["銀行", "図書館", "郵便局"],
    bai: 3,
    explanation: {
      meaning: "Vì đau đầu nên tôi đi bệnh viện để lấy thuốc.",
      grammar: "Địa điểm: 病院 (びょういん - bệnh viện)",
      lesson: "JPD113 - Bài 3",
      tips: "Đau ốm khám bệnh uống thuốc thì đến 病院.",
      reason: "病院 là bệnh viện."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "国へ手紙を出すために（　　）へ行きます。",
    answer: "郵便局",
    wrongs: ["銀行", "病院", "公園"],
    bai: 3,
    explanation: {
      meaning: "Tôi đến bưu điện để gửi thư về nước.",
      grammar: "Địa điểm: 郵便局 (ゆうびんきょく - bưu điện)",
      lesson: "JPD113 - Bài 3",
      tips: "Gửi thư (手紙を出す) thì đến 郵便局.",
      reason: "郵便局 là bưu điện."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "「今日は何（　　）ですか。」「金曜日です。」",
    answer: "曜日",
    wrongs: ["日", "月", "年"],
    bai: 3,
    explanation: {
      meaning: "Hôm nay là thứ mấy? - Là thứ Sáu.",
      grammar: "Hỏi thứ: 何曜日 (なんようび)",
      lesson: "JPD113 - Bài 3",
      tips: "Câu trả lời có 金曜日 thì câu hỏi là 何曜日.",
      reason: "曜日 chỉ các thứ trong tuần."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "夜11時に（　　）。おやすみなさい。",
    answer: "寝ます",
    wrongs: ["起きます", "行きます", "働きます"],
    bai: 3,
    explanation: {
      meaning: "Tôi đi ngủ lúc 11 giờ đêm. Chúc ngủ ngon.",
      grammar: "Động từ: 寝ます (ねます - đi ngủ)",
      lesson: "JPD113 - Bài 3",
      tips: "11 giờ đêm + chúc ngủ ngon = đi ngủ (寝ます).",
      reason: "寝ます nghĩa là đi ngủ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "朝6時に（　　）。おはようございます。",
    answer: "起きます",
    wrongs: ["寝ます", "行きます", "帰ります"],
    bai: 3,
    explanation: {
      meaning: "Tôi thức dậy lúc 6 giờ sáng. Xin chào buổi sáng.",
      grammar: "Động từ: 起きます (おきます - thức dậy)",
      lesson: "JPD113 - Bài 3",
      tips: "6 giờ sáng + chào buổi sáng = thức dậy (起きます).",
      reason: "起きます nghĩa là thức dậy."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "父は月曜日から金曜日まで会社で（　　）。",
    answer: "働きます",
    wrongs: ["寝ます", "起きます", "休みます"],
    bai: 3,
    explanation: {
      meaning: "Bố tôi làm việc ở công ty từ thứ Hai đến thứ Sáu.",
      grammar: "Động từ: 働きます (はたらきます - làm việc)",
      lesson: "JPD113 - Bài 3",
      tips: "Ở công ty (会社で) thì làm việc (働きます).",
      reason: "働きます nghĩa là làm việc."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "土曜日と日曜日は学校が（　　）です。",
    answer: "休み",
    wrongs: ["行き", "働き", "起き"],
    bai: 3,
    explanation: {
      meaning: "Thứ Bảy và Chủ Nhật trường học được nghỉ.",
      grammar: "Danh từ: 休み (やすみ - ngày nghỉ)",
      lesson: "JPD113 - Bài 3",
      tips: "Cuối tuần thì trường học được nghỉ (休み).",
      reason: "休み là ngày nghỉ."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "毎日、日本語センターで熱心に（　　）。",
    answer: "勉強します",
    wrongs: ["寝ます", "起きます", "歩きます"],
    bai: 3,
    explanation: {
      meaning: "Mỗi ngày tôi đều chăm chỉ học tiếng Nhật ở trung tâm.",
      grammar: "Động từ: 勉強します (べんきょうします - học tập)",
      lesson: "JPD113 - Bài 3",
      tips: "Học tiếng Nhật thì dùng 勉強します.",
      reason: "勉強します nghĩa là học tập."
    }
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "授業が終わったら、まっすぐうちへ（　　）。",
    answer: "帰ります",
    wrongs: ["寝ます", "起きます", "読みます"],
    bai: 3,
    explanation: {
      meaning: "Học xong là tôi về thẳng nhà.",
      grammar: "Động từ di chuyển: 帰ります (かえります - về)",
      lesson: "JPD113 - Bài 3",
      tips: "Đi về nhà thì dùng うちへ帰ります.",
      reason: "帰ります dùng cho việc về nơi chốn thân thuộc như nhà, quê hương."
    }
  },

  // --- BÀI 4 VOCAB ---
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "このパソコンは性能がとてもいいですが、値段が（　　）です。",
    answer: "たかい",
    wrongs: ["やすい", "ひくい", "かるい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ダナンは海が青くて、空気が（　　）町です。",
    answer: "きれいな",
    wrongs: ["きれいく", "きれいだの", "きれい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ハノイからホーチミンまで飛行機で（　　）かかりますか。",
    answer: "どのくらい",
    wrongs: ["いくら", "なんじ", "どこ"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: "Chọn phó từ đi với câu phủ định mang nghĩa 'hoàn toàn không':",
    sentence: "きのうの夜は（　　）勉強しませんでした。",
    answer: "ぜんぜん",
    wrongs: ["とても", "すこし", "たくさん"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: "Chọn phó từ đi với câu phủ định mang nghĩa 'không... lắm':",
    sentence: "この店のラーメンは（　　）おいしくないです。",
    answer: "あまり",
    wrongs: ["とても", "ずいぶん", "ちょうど"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "このアパートの家賃はとても〔高い〕です。",
    answer: "やすい",
    wrongs: ["ひくい", "ふるい", "ちいさい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "私の大学の図書館は〔広い〕です。",
    answer: "せまい",
    wrongs: ["ちいさい", "とおい", "みじかい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "きょうの教室は〔暑い〕ですね。",
    answer: "さむい",
    wrongs: ["つめたい", "すずしい", "ぬるい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "日本の（北）にある北海道は、冬に雪がたくさん降ります。",
    answer: "きた",
    wrongs: ["みなみ", "ひがし", "にし"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ハノイはベトナムの北にあります。ホーチミンは（　　）にあります。",
    answer: "みなみ",
    wrongs: ["ひがし", "にし", "きた"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "富士山は日本でとても（　　）山です。",
    answer: "ゆうめいな",
    wrongs: ["ゆうめいく", "ゆうめいだ", "ゆうめい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "休みの日のショッピングモールは人が多くて、とても（　　）です。",
    answer: "にぎやか",
    wrongs: ["しずか", "ひま", "べんり"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "夜の図書館は人が少なくて、とても（　　）です。",
    answer: "しずか",
    wrongs: ["にぎやか", "うるさい", "あぶない"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "山へ行って温かい（　　）に入りました。とても気持ちよかったです。",
    answer: "おんせん",
    wrongs: ["かわ", "うみ", "プール"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "この町にはきれいな（　　）が流れていて、魚がたくさんいます。",
    answer: "かわ",
    wrongs: ["やま", "みち", "はし"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "京都には古い（　　）や神社がたくさんあります。",
    answer: "おてら",
    wrongs: ["きょうかい", "ぎんこう", "びょういん"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "東京から大阪まで（　　）で約2時間半です。",
    answer: "しんかんせん",
    wrongs: ["じてんしゃ", "ふね", "あるいて"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "うちから駅まで遠くないですから、（　　）行きます。",
    answer: "あるいて",
    wrongs: ["ひこうきで", "しんかんせんで", "ふねで"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "この本は〔新しい〕です。",
    answer: "ふるい",
    wrongs: ["やすい", "おもい", "ひくい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "部屋の中はとても〔静か〕です。",
    answer: "にぎやか",
    wrongs: ["きれい", "べんり", "ゆうめい"],
    bai: 4,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：ダナンはどうですか。\nB：物価が安くて、とても（　　）町ですよ。",
    answer: "いい",
    wrongs: ["わるい", "まずい", "さむい"],
    bai: 4,
  },

  // --- BÀI 5 VOCAB ---
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "おなかがすきましたから、何か（　　）を食べたいです。",
    answer: "おいしいもの",
    wrongs: ["おいしくもの", "おいしさ", "おいしいこと"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "家族に手紙を書きましたから、郵便局へ（　　）を買いに行きます。",
    answer: "きって",
    wrongs: ["きっぷ", "はがき", "ふうとう"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：昨日の試験はどうでしたか。\nB：（　　）。",
    answer: "とても難しかったです",
    wrongs: ["難しくないでした", "難しかったですない", "難しかったじゃありません"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "先週、新しい（　　）を買いました。レポートを書くときに使います。",
    answer: "パソコン",
    wrongs: ["カメラ", "じてんしゃ", "とけい"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "休みの日、天気がよかったですから、公園へ（　　）に行きました。",
    answer: "さんぽ",
    wrongs: ["かいもの", "べんきょう", "しごと"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "きのう、デパートへ行って（　　）をしました。",
    answer: "かいもの",
    wrongs: ["べんきょう", "そうじ", "せんたく"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "誕生日に友達からすてきな（　　）をもらいました。",
    answer: "プレゼント",
    wrongs: ["にもつ", "きって", "てがみ"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "国にいる両親に（　　）を書きました。",
    answer: "てがみ",
    wrongs: ["きって", "にもつ", "きっぷ"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "重い（　　）がありますから、タクシーで行きましょう。",
    answer: "にもつ",
    wrongs: ["てがみ", "きって", "はがき"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "週末はどこへも行きませんでした。（　　）でテレビを見ていました。",
    answer: "ひとり",
    wrongs: ["ふたり", "いっしょ", "みんな"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "映画館で面白い（　　）を見ました。",
    answer: "えいが",
    wrongs: ["おんがく", "ほん", "しんぶん"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "喉が渇きましたから、冷たい（　　）が飲みたいです。",
    answer: "ジュース",
    wrongs: ["ごはん", "パン", "さかな"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "新しい車を買うために、（　　）を貯めています。",
    answer: "おかね",
    wrongs: ["じかん", "にもつ", "てがみ"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "きのうは仕事が多くて、とても〔忙しかった〕です。",
    answer: "ひまだった",
    wrongs: ["たのしかった", "たいへんだった", "しずかだった"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "きのうの映画はとても〔楽しかった〕です。",
    answer: "つまらなかった",
    wrongs: ["いそがしかった", "むずかしかった", "わるかった"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：日曜日はどうして来ませんでしたか。\nB：（　　）熱がありましたから。",
    answer: "ちょっと",
    wrongs: ["いつも", "ぜんぜん", "あまり"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：先週の京都旅行は（　　）でしたか。\nB：天気が良くて、楽しかったです。",
    answer: "どう",
    wrongs: ["なに", "どこ", "いつ"],
    bai: 5,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：週末、一緒にサッカーを見に行きませんか。\nB：（　　）、行きましょう。",
    answer: "いいですね",
    wrongs: ["いいえ、けっこうです", "ごちそうさまでした", "はじめまして"],
    bai: 5,
  },

  // --- BÀI 6 VOCAB ---
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "学校から駅まで〔近い〕ですから、歩いて行きます。",
    answer: "とおい",
    wrongs: ["おそい", "ひろい", "たかい"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ベトナムには雨季と乾季の2つの（　　）があります。",
    answer: "きせつ",
    wrongs: ["てんき", "じかん", "ところ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "１年の中でどの（　　）がいちばん好きですか。",
    answer: "きせつ",
    wrongs: ["てんき", "つき", "ひ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "りんごとみかんと、（　　）が好きですか。",
    answer: "どちら",
    wrongs: ["どれ", "なに", "だれ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "新幹線は普通の電車より（　　）速いです。",
    answer: "ずっと",
    wrongs: ["ぜんぜん", "あまり", "まだ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "きのうの夜は風が〔強かった〕です。",
    answer: "よわかった",
    wrongs: ["すくなかった", "ちいさかった", "ひくかった"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_OPP.promptJp,
    prompt: HEADERS.VOCAB_OPP.prompt,
    sentence: "ハノイの冬はダナンより〔寒い〕です。",
    answer: "あたたかい",
    wrongs: ["あつい", "すずしい", "つめたい"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：コーヒーとお茶と、どちらにしますか。\nB：（　　）のほうがいいです。",
    answer: "コーヒー",
    wrongs: ["どっち", "どちら", "どちらも"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "今朝は濃い（　　）が出ていて、前がよく見えません。",
    answer: "きり",
    wrongs: ["あめ", "ゆき", "かぜ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "きょうの天気予報は（　　）のち雨です。",
    answer: "くもり",
    wrongs: ["ゆき", "たいふう", "かみなり"],
    bai: 6,
  },


  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "日本の秋は紅葉がとても（　　）季節です。",
    answer: "きれいな",
    wrongs: ["きれいく", "きれいだ", "きれい"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ハノイの冬は風が吹いて、とても（　　）です。",
    answer: "さむい",
    wrongs: ["あつい", "すずしい", "あたたかい"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "きょうは空が青くて、とてもいい（　　）ですね。",
    answer: "てんき",
    wrongs: ["きせつ", "じかん", "ところ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "朝からずっと（　　）が降っていますから、傘を持って行きます。",
    answer: "あめ",
    wrongs: ["ゆき", "かぜ", "くもり"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "冬の富士山には白い（　　）がたくさん積もっています。",
    answer: "ゆき",
    wrongs: ["あめ", "みず", "くも"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "夏休みに日本の伝統的な（　　）を見に行きました。",
    answer: "おまつり",
    wrongs: ["しけん", "かいぎ", "じゅぎょう"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "友達と映画を見る（　　）がありますから、早く帰ります。",
    answer: "やくそく",
    wrongs: ["しゅくだい", "きっぷ", "にもつ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "今週の土曜日に友達の家で（　　）があります。",
    answer: "パーティー",
    wrongs: ["つくえ", "くるま", "じてんしゃ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "日本の有名な歌手の（　　）を1枚買いました。",
    answer: "CD",
    wrongs: ["パン", "くつ", "かさ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "日曜日、スタジアムで有名な歌手の（　　）があります。",
    answer: "コンサート",
    wrongs: ["じむしょ", "かいぎ", "びょういん"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "映画館の（　　）を2枚買いました。",
    answer: "チケット",
    wrongs: ["ノート", "テーブル", "りんご"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "あしたは（　　）がありますから、早く帰ります。",
    answer: "ようじ",
    wrongs: ["きっぷ", "にもつ", "しゅくだい"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "桜の花がきれいに咲く（　　）がいちばん好きです。",
    answer: "はる",
    wrongs: ["ふゆ", "あき", "なつ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "（　　）休みに家族と海へ泳ぎに行きました。",
    answer: "なつ",
    wrongs: ["ふゆ", "はる", "あき"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "（　　）になると、山の木の葉が赤や黄色になります。",
    answer: "あき",
    wrongs: ["なつ", "はる", "ふゆ"],
    bai: 6,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "飛行機は新幹線より（　　）速いです。",
    answer: "ずっと",
    wrongs: ["ぜんぜん", "あまり", "まだ"],
    bai: 6,
  },

  // --- BÀI 7 VOCAB ---
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "スープを飲むときは、（　　）を使います。",
    answer: "スプーン",
    wrongs: ["フォーク", "ナイフ", "はし"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "ステーキを食べますから、（　　）とフォークを並べます。",
    answer: "ナイフ",
    wrongs: ["スプーン", "コップ", "はし"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "冷たいジュースを（　　）に入れて、みんなで乾杯しました。",
    answer: "コップ",
    wrongs: ["おさら", "れいぞうこ", "電子レンジ"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "肉や野菜を腐らせないために、（　　）に入れます。",
    answer: "れいぞうこ",
    wrongs: ["電子レンジ", "テーブル", "ベッド"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "冷たいお弁当を（　　）で温めました。",
    answer: "電子レンジ",
    wrongs: ["れいぞうこ", "エアコン", "せんたくき"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "コーヒーに（　　）を入れて甘くします。",
    answer: "さとう",
    wrongs: ["しお", "しょうゆ", "こしょう"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "すしを食べるときは、（　　）をつけて食べます。",
    answer: "しょうゆ",
    wrongs: ["さとう", "ミルク", "ジャム"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "部屋がとても暑いですから、（　　）をつけてください。",
    answer: "エアコン",
    wrongs: ["テレビ", "れいぞうこ", "アイロン"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: "Chọn phó từ mang ý nghĩa thúc giục, kính mời lịch sự 'nhất định':",
    sentence: "ベトナムのフォーはおいしいですよ。（　　）食べてみてください。",
    answer: "ぜひ",
    wrongs: ["たぶん", "きっと", "あまり"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "A：もう宿題をしましたか。\nB：いいえ、（　　）していません。",
    answer: "まだ",
    wrongs: ["もう", "すぐ", "ずっと"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_FILL.promptJp,
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "A：もう昼ごはんを食べましたか。\nB：はい、（　　）食べました。",
    answer: "もう",
    wrongs: ["まだ", "ぜひ", "あまり"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：お茶をどうぞ。\nB：（　　）。",
    answer: "いただきます",
    wrongs: ["ごちそうさまでした", "おねがいします", "いってきます"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：すみません、塩を取ってください。\nB：（　　）。",
    answer: "はい、どうぞ",
    wrongs: ["いいえ、どういたしまして", "はい、そうです", "いいえ、けっこうです"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：おいしいカレーの（　　）を教えてください。\nB：はい、まず野菜を切ります。",
    answer: "つくりかた",
    wrongs: ["よみかた", "つかいかた", "いきかた"],
    bai: 7,
  },
  {
    section: "Từ vựng",
    promptJp: HEADERS.VOCAB_TALK.promptJp,
    prompt: HEADERS.VOCAB_TALK.prompt,
    sentence: "A：駅までの（　　）を教えてください。\nB：この道をまっすぐ行きます。",
    answer: "いきかた",
    wrongs: ["つくりかた", "よみかた", "のみかた"],
    bai: 7,
  },
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "スープを（　　）で飲みます。",
  "answer": "スプーン",
  "wrongs": [
    "フォーク",
    "ナイフ",
    "はし"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "ステーキをナイフと（　　）で切ります。",
  "answer": "フォーク",
  "wrongs": [
    "スプーン",
    "コップ",
    "お皿"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "日本人はごはんを（　　）で食べます。",
  "answer": "はし",
  "wrongs": [
    "フォーク",
    "ナイフ",
    "スプーン"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "料理が冷たいですから、（　　）で温めましょう。",
  "answer": "電子レンジ",
  "wrongs": [
    "冷蔵庫",
    "エアコン",
    "洗濯機"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "ビールは（　　）の中に入っています。",
  "answer": "冷蔵庫",
  "wrongs": [
    "電子レンジ",
    "鞄",
    "ポケット"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "コーヒーに（　　）を少し入れます。",
  "answer": "砂糖",
  "wrongs": [
    "塩",
    "醤油",
    "肉"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "文の意味に最も合う言葉を一つ選びなさい。",
  "prompt": "Chọn từ thích hợp nhất điền vào chỗ trống（　　）:",
  "sentence": "すしに（　　）をつけて食べます。",
  "answer": "醤油",
  "wrongs": [
    "砂糖",
    "塩",
    "コップ"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
  "prompt": "Đọc đoạn hội thoại và chọn từ thích hợp điền vào chỗ trống（　　）:",
  "sentence": "A：日本の富士山はとてもきれいですよ。（　　）行ってみてください。\nB：はい、ぜひ行きたいです。",
  "answer": "ぜひ",
  "wrongs": [
    "あまり",
    "ぜんぜん",
    "すこし"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
  "prompt": "Đọc đoạn hội thoại và chọn câu đáp phù hợp cho lời đề nghị giúp đỡ:",
  "sentence": "A：荷物を持ちましょうか。\nB：（　　）。",
  "answer": "すみません、お願いします",
  "wrongs": [
    "いいえ、食べません",
    "はい、そうです",
    "はじめまして"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "下線の言葉と反対の意味の言葉を選びなさい。",
  "prompt": "Chọn từ có nghĩa ngược lại với từ「開けます (mở)」:",
  "sentence": "窓を（開けます）。",
  "answer": "閉めます",
  "wrongs": [
    "つけます",
    "消します",
    "行きます"
  ],
  "bai": 7
},
{
  "section": "Từ vựng",
  "promptJp": "下線の言葉と反対の意味の言葉を選びなさい。",
  "prompt": "Chọn từ có nghĩa ngược lại với từ「つけます (bật điện)」:",
  "sentence": "電気を（つけます）。",
  "answer": "消します",
  "wrongs": [
    "閉めます",
    "開けます",
    "止めます"
  ],
  "bai": 7
}
];

// =========================================================================
// 3. GRAMMAR BANK (Ngữ pháp Bài 4 - 7: JPD123 FPT)
// =========================================================================
export const GRAMMAR_SEEDS: QuestionSeed[] = [
  // ==================== BÀI 1 GRAMMAR ====================
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "私（　　）FPT大学の学生です。",
    answer: "は",
    wrongs: ["が", "を", "に"],
    bai: 1,
    explanation: {
      meaning: "Tôi là sinh viên trường Đại học FPT.",
      grammar: "Trợ từ chủ đề: N1 は N2 です",
      lesson: "JPD113 - Bài 1",
      tips: "Đứng sau chủ ngữ chỉ chủ đề câu là trợ từ は.",
      reason: "は đánh dấu chủ ngữ/chủ đề trong câu khẳng định N1 は N2 です."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "佐藤さんは中国人（　　）。日本人です。",
    answer: "じゃありません",
    wrongs: ["じゃありませんでした", "あります", "ありません"],
    bai: 1,
    explanation: {
      meaning: "Anh Sato không phải là người Trung Quốc. Anh ấy là người Nhật.",
      grammar: "Câu phủ định danh từ: N1 は N2 じゃありません",
      lesson: "JPD113 - Bài 1",
      tips: "Phủ định thì hiện tại của danh từ dùng じゃありません.",
      reason: "じゃありません là dạng phủ định lịch sự của です."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "山田さんは学生ですか。（　　）、学生じゃありません。先生です。",
    answer: "いいえ",
    wrongs: ["はい", "ええ", "そうです"],
    bai: 1,
    explanation: {
      meaning: "Anh Yamada có phải là học sinh không? - Không, không phải học sinh. Là giáo viên.",
      grammar: "Trả lời phủ định câu hỏi nghi vấn: いいえ",
      lesson: "JPD113 - Bài 1",
      tips: "Phía sau là じゃありません thì đầu câu trả lời phải là いいえ.",
      reason: "いいえ dùng để trả lời phủ định."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "アンさんは学生です。マリアさん（　　）学生です。",
    answer: "も",
    wrongs: ["は", "の", "と"],
    bai: 1,
    explanation: {
      meaning: "Bạn An là học sinh. Bạn Maria cũng là học sinh.",
      grammar: "Trợ từ đồng nhất thông tin: N も",
      lesson: "JPD113 - Bài 1",
      tips: "Khi thông tin lặp lại giống câu trước, dùng trợ từ も thay cho は.",
      reason: "も có nghĩa là 'cũng'."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "山田さんはFPT（　　）社員です。",
    answer: "の",
    wrongs: ["は", "も", "と"],
    bai: 1,
    explanation: {
      meaning: "Anh Yamada là nhân viên của công ty FPT.",
      grammar: "Trợ từ sở thuộc/sở hữu: N1 の N2",
      lesson: "JPD113 - Bài 1",
      tips: "N1 là tổ chức/công ty, N2 là vị trí thì nối bằng の.",
      reason: "の biểu thị mối quan hệ thuộc về một tổ chức."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "机の上に本（　　）ノートがあります。",
    answer: "と",
    wrongs: ["の", "も", "は"],
    bai: 1,
    explanation: {
      meaning: "Trên bàn có sách và vở ghi.",
      grammar: "Trợ từ liệt kê: N1 と N2 (N1 và N2)",
      lesson: "JPD113 - Bài 1",
      tips: "Liệt kê hoàn toàn danh từ dùng と.",
      reason: "と nối các danh từ mang nghĩa 'và'."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "田中さんは日本人ですか、（　　）アメリカ人ですか。",
    answer: "それとも",
    wrongs: ["そして", "しかし", "だから"],
    bai: 1,
    explanation: {
      meaning: "Anh Tanaka là người Nhật Bản, hay là người Mỹ?",
      grammar: "Câu hỏi lựa chọn: Câu 1 か、それとも Câu 2 か",
      lesson: "JPD113 - Bài 1",
      tips: "Nối 2 vế câu hỏi lựa chọn dùng それとも (hay là).",
      reason: "それとも dùng trong câu hỏi lựa chọn giữa 2 phương án."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "私（　　）趣味は映画を見ることです。",
    answer: "の",
    wrongs: ["は", "も", "で"],
    bai: 1,
    explanation: {
      meaning: "Sở thích của tôi là xem phim.",
      grammar: "Sở hữu cách: 私の + Danh từ",
      lesson: "JPD113 - Bài 1",
      tips: "Sở thích của tôi = 私の趣味.",
      reason: "の nối chỉ quan hệ sở hữu giữa tôi và sở thích."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「あの方はどなたですか。」「（　　）は田中先生です。」",
    answer: "あの方",
    wrongs: ["これ", "ここ", "どれ"],
    bai: 1,
    explanation: {
      meaning: "Vị kia là ai vậy? - Vị kia là thầy Tanaka.",
      grammar: "Đại từ chỉ người lịch sự: あの方 (あのかた)",
      lesson: "JPD113 - Bài 1",
      tips: "Hỏi あの方 thì trả lời tương ứng bằng あの方.",
      reason: "あの方 là dạng lịch sự của あの人."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「あなたは学生ですか。」「はい、学生（　　）。」",
    answer: "です",
    wrongs: ["でした", "ます", "ません"],
    bai: 1,
    explanation: {
      meaning: "Bạn có phải là học sinh không? - Vâng, tôi là học sinh.",
      grammar: "Khẳng định danh từ: はい、N です",
      lesson: "JPD113 - Bài 1",
      tips: "Trả lời はい thì kết thúc bằng です.",
      reason: "です là dạng khẳng định lịch sự ở hiện tại."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "アンさんの誕生日は6月15日（　　）。",
    answer: "です",
    wrongs: ["ます", "でした", "で"],
    bai: 1,
    explanation: {
      meaning: "Sinh nhật của bạn An là ngày 15 tháng 6.",
      grammar: "Vị ngữ danh từ: 〜日 です",
      lesson: "JPD113 - Bài 1",
      tips: "Ngày tháng là danh từ, kết thúc câu lịch sự dùng です.",
      reason: "Danh từ kết thúc bằng です."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "佐藤さんは会社員です。鈴木さん（　　）会社員です。",
    answer: "も",
    wrongs: ["は", "を", "が"],
    bai: 1,
    explanation: {
      meaning: "Anh Sato là nhân viên công ty. Anh Suzuki cũng là nhân viên công ty.",
      grammar: "Trợ từ も (cũng)",
      lesson: "JPD113 - Bài 1",
      tips: "Cùng nghề nghiệp会社員 nên dùng trợ từ も.",
      reason: "も dùng để chỉ sự tương đồng về thông tin."
    }
  },

  // ==================== BÀI 2 GRAMMAR ====================
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「（　　）はいくらですか。」「これは千円です。」",
    answer: "それ",
    wrongs: ["ここ", "どこ", "どちら"],
    bai: 2,
    explanation: {
      meaning: "Cái đó giá bao nhiêu? - Cái này 1.000 yên.",
      grammar: "Cặp chỉ định từ hỏi đáp: それ ⇔ これ",
      lesson: "JPD113 - Bài 2",
      tips: "Người trả lời nói これ (cái này của tôi) thì người hỏi phải hỏi それ (cái đó gần bạn).",
      reason: "Khi hỏi vật ở gần người nghe, ta dùng それ."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「お手洗いは（　　）ですか。」「あそこです。」",
    answer: "どこ",
    wrongs: ["いくら", "だれ", "なん"],
    bai: 2,
    explanation: {
      meaning: "Nhà vệ sinh ở đâu vậy? - Ở đằng kia ạ.",
      grammar: "Từ để hỏi nơi chốn: どこ",
      lesson: "JPD113 - Bài 2",
      tips: "Trả lời là vị trí (あそこ) thì câu hỏi phải là どこ.",
      reason: "どこ dùng để hỏi địa điểm, nơi chốn."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "店員さん、すみません。この時計（　　）ください。",
    answer: "を",
    wrongs: ["は", "が", "に"],
    bai: 2,
    explanation: {
      meaning: "Xin lỗi anh bán hàng, xin hãy bán cho tôi chiếc đồng hồ này.",
      grammar: "Mẫu câu mua hàng: N を ください",
      lesson: "JPD113 - Bài 2",
      tips: "Vật muốn lấy/mua đi kèm trợ từ を + ください.",
      reason: "Trợ từ を đi trước ください khi yêu cầu lấy món đồ."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「これは（　　）のワインですか。」「フランスのワインです。」",
    answer: "どこ",
    wrongs: ["だれ", "いくら", "なん"],
    bai: 2,
    explanation: {
      meaning: "Đây là rượu vang của xuất xứ ở đâu vậy? - Là rượu vang của nước Pháp.",
      grammar: "Hỏi xuất xứ đồ vật: どこの N",
      lesson: "JPD113 - Bài 2",
      tips: "Câu trả lời là tên quốc gia (フランス) nên hỏi どこの.",
      reason: "どこの N dùng để hỏi xuất xứ sản xuất của món đồ."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「そのかばんは（　　）のですか。」「私のです。」",
    answer: "だれ",
    wrongs: ["どこ", "いくら", "どれ"],
    bai: 2,
    explanation: {
      meaning: "Chiếc cặp đó là của ai vậy? - Là của tôi.",
      grammar: "Hỏi chủ sở hữu: だれの N",
      lesson: "JPD113 - Bài 2",
      tips: "Trả lời 私の (của tôi) thì câu hỏi là だれの (của ai).",
      reason: "だれの dùng để hỏi về quyền sở hữu của đồ vật."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "（　　）は私のペンです。それはあなたのです。",
    answer: "これ",
    wrongs: ["ここ", "どこ", "どれ"],
    bai: 2,
    explanation: {
      meaning: "Cái này là bút của tôi. Cái đó là của bạn.",
      grammar: "Đại từ chỉ định đồ vật gần người nói: これ",
      lesson: "JPD113 - Bài 2",
      tips: "Chỉ đồ vật ở gần mình dùng これ.",
      reason: "これ là đại từ chỉ vật gần người nói."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "レストランの売り場は（　　）階ですか。",
    answer: "何",
    wrongs: ["どこ", "いくら", "だれ"],
    bai: 2,
    explanation: {
      meaning: "Khu ẩm thực nhà hàng ở tầng mấy vậy?",
      grammar: "Hỏi số tầng: 何階 (なんがい)",
      lesson: "JPD113 - Bài 2",
      tips: "Đứng trước 階 dùng 何 (なん).",
      reason: "何階 dùng để hỏi tầng số mấy."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "あそこに停まっている（　　）は日本の自動車です。",
    answer: "あれ",
    wrongs: ["あそこ", "あの", "どれ"],
    bai: 2,
    explanation: {
      meaning: "Cái xe đỗ ở đằng xa kia là xe ô tô Nhật Bản.",
      grammar: "Đại từ chỉ vật ở xa cả hai người: あれ",
      lesson: "JPD113 - Bài 2",
      tips: "Vật ở xa cả người nói lẫn người nghe dùng あれ.",
      reason: "あれ đóng vai trò chủ ngữ chỉ vật ở xa."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "会社の受付は（　　）です。",
    answer: "ここ",
    wrongs: ["これ", "この", "どれ"],
    bai: 2,
    explanation: {
      meaning: "Bàn lễ tân của công ty là ở chỗ này.",
      grammar: "Chỉ vị trí gần người nói: ここ",
      lesson: "JPD113 - Bài 2",
      tips: "Chỉ địa điểm vị trí dùng ここ (chỗ này).",
      reason: "ここ dùng để chỉ vị trí nơi chốn."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "このTシャツは1枚 2,000（　　）です。",
    answer: "円",
    wrongs: ["時", "階", "人"],
    bai: 2,
    explanation: {
      meaning: "Chiếc áo thun này giá 2.000 yên một chiếc.",
      grammar: "Đơn vị tiền tệ: 円 (えん - Yên Nhật)",
      lesson: "JPD113 - Bài 2",
      tips: "Giá tiền ở Nhật dùng đơn vị 円 (yên).",
      reason: "円 là đơn vị tiền tệ Nhật Bản."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「それは何ですか。」「（　　）は日本語の辞書です。」",
    answer: "これ",
    wrongs: ["それ", "あれ", "どれ"],
    bai: 2,
    explanation: {
      meaning: "Cái đó là cái gì vậy? - Cái này là từ điển tiếng Nhật.",
      grammar: "Hỏi それ thì trả lời bằng これ",
      lesson: "JPD113 - Bài 2",
      tips: "Đối phương hỏi それ thì mình cầm trên tay trả lời これ.",
      reason: "Quy tắc hội thoại: hỏi それ trả lời これ."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "教室に新しい机（　　）あります。",
    answer: "が",
    wrongs: ["を", "に", "へ"],
    bai: 2,
    explanation: {
      meaning: "Trong lớp học có bàn mới.",
      grammar: "Sự tồn tại của đồ vật: N が あります",
      lesson: "JPD113 - Bài 2",
      tips: "Đồ vật tồn tại đi với trợ từ が + あります.",
      reason: "Trợ từ が đứng trước あります chỉ vật thể hiện diện."
    }
  },

  // ==================== BÀI 3 GRAMMAR ====================
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "明日、友達と学校（　　）行きます。",
    answer: "へ",
    wrongs: ["を", "で", "が"],
    bai: 3,
    explanation: {
      meaning: "Ngày mai tôi đi đến trường cùng bạn.",
      grammar: "Trợ từ phương hướng/đích đến: Địa điểm + へ + 行きます",
      lesson: "JPD113 - Bài 3",
      tips: "Đích đến của động từ di chuyển (行く, 来る, 帰る) dùng trợ từ へ (phát âm là e).",
      reason: "へ chỉ phương hướng, hướng di chuyển đến địa điểm."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "図書館（　　）静かに本を読みます。",
    answer: "で",
    wrongs: ["へ", "に", "を"],
    bai: 3,
    explanation: {
      meaning: "Tôi đọc sách một cách yên tĩnh ở thư viện.",
      grammar: "Địa điểm diễn ra hành động: Nơi chốn + で + V",
      lesson: "JPD113 - Bài 3",
      tips: "Hành động (読む, 食べる, 勉強する) diễn ra ở đâu thì nơi đó đi với で.",
      reason: "で chỉ nơi chốn diễn ra hành động."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "毎朝、冷たい水（　　）コップで飲みます。",
    answer: "を",
    wrongs: ["へ", "で", "に"],
    bai: 3,
    explanation: {
      meaning: "Mỗi sáng tôi uống nước lạnh bằng cốc.",
      grammar: "Tân ngữ trực tiếp của ngoại động từ: N を V",
      lesson: "JPD113 - Bài 3",
      tips: "Đối tượng tác động của hành động uống (飲む) đi với を.",
      reason: "を đánh dấu tân ngữ trực tiếp của hành động."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "毎朝7時（　　）起きます。",
    answer: "に",
    wrongs: ["で", "へ", "を"],
    bai: 3,
    explanation: {
      meaning: "Mỗi sáng tôi thức dậy vào lúc 7 giờ.",
      grammar: "Thời điểm xác định: Thời gian có con số + に + V",
      lesson: "JPD113 - Bài 3",
      tips: "Thời gian có chữ số cụ thể (7時, 6月) đi với に.",
      reason: "に dùng để chỉ thời điểm cụ thể diễn ra hành động."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "昨日は日曜日でしたから、勉強（　　）。休みました。",
    answer: "しませんでした",
    wrongs: ["します", "しません", "しました"],
    bai: 3,
    explanation: {
      meaning: "Hôm qua là chủ nhật nên tôi không học. Tôi đã nghỉ ngơi.",
      grammar: "Phủ định quá khứ của động từ: V ませんでした",
      lesson: "JPD113 - Bài 3",
      tips: "Hành động trong quá khứ (昨日) ở dạng phủ định là ませんでした.",
      reason: "しませんでした là thể phủ định trong quá khứ của します."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "銀行は午前9時（　　）午後5時（　　）まで開いています。",
    answer: "から",
    wrongs: ["まで", "に", "へ"],
    bai: 3,
    explanation: {
      meaning: "Ngân hàng mở cửa từ 9 giờ sáng đến 5 giờ chiều.",
      grammar: "Phạm vi thời gian: N1 から N2 まで (từ N1 đến N2)",
      lesson: "JPD113 - Bài 3",
      tips: "Điểm bắt đầu dùng から, kết thúc dùng まで.",
      reason: "から biểu thị điểm mốc thời gian bắt đầu."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "「毎晩、何時（　　）寝ますか。」「11時に寝ます。」",
    answer: "に",
    wrongs: ["で", "へ", "を"],
    bai: 3,
    explanation: {
      meaning: "Mỗi tối bạn đi ngủ lúc mấy giờ? - Tôi ngủ lúc 11 giờ.",
      grammar: "Hỏi thời điểm: 何時に Vますか",
      lesson: "JPD113 - Bài 3",
      tips: "Hỏi giờ giấc đi ngủ dùng 何時に.",
      reason: "に đi sau từ chỉ thời gian cụ thể."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "今晩、うちでテレビ（　　）見ます。",
    answer: "を",
    wrongs: ["に", "で", "へ"],
    bai: 3,
    explanation: {
      meaning: "Tối nay tôi xem tivi ở nhà.",
      grammar: "Tân ngữ hành động: テレビ を 見ます",
      lesson: "JPD113 - Bài 3",
      tips: "Xem tivi thì tivi là tân ngữ đi với を.",
      reason: "を là trợ từ chỉ đối tượng tác động của hành động xem."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "土曜日と日曜日は働き（　　）。休みです。",
    answer: "ません",
    wrongs: ["ました", "ます", "でした"],
    bai: 3,
    explanation: {
      meaning: "Thứ Bảy và Chủ Nhật tôi không làm việc. Tôi được nghỉ.",
      grammar: "Phủ định hiện tại/tương lai của động từ: V ません",
      lesson: "JPD113 - Bài 3",
      tips: "Ngày nghỉ thì không làm việc = 働きません.",
      reason: "ません là dạng phủ định lịch sự của ます."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "駅まで歩いて（　　）。",
    answer: "行きます",
    wrongs: ["見ます", "読みます", "寝ます"],
    bai: 3,
    explanation: {
      meaning: "Tôi đi bộ đến nhà ga.",
      grammar: "Cách thức di chuyển: 歩いて 行きます",
      lesson: "JPD113 - Bài 3",
      tips: "Đi bộ đến ga dùng 歩いて行きます.",
      reason: "行きます đi với phương tiện/cách thức di chuyển 歩いて."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "昨日、駅の改札の前で友達（　　）会いました。",
    answer: "に",
    wrongs: ["を", "で", "へ"],
    bai: 3,
    explanation: {
      meaning: "Hôm qua tôi đã gặp bạn ở trước cửa soát vé nhà ga.",
      grammar: "Gặp gỡ ai: Người + に 会います",
      lesson: "JPD113 - Bài 3",
      tips: "Động từ 会います luôn đi với trợ từ に.",
      reason: "Đối tượng gặp gỡ đi với trợ từ に, không dùng を."
    }
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: HEADERS.GRAM_FILL.prompt,
    sentence: "午後5時に会社を出て、うち（　　）帰ります。",
    answer: "へ",
    wrongs: ["で", "を", "から"],
    bai: 3,
    explanation: {
      meaning: "5 giờ chiều tôi rời công ty rồi về nhà.",
      grammar: "Đích đến về nhà: うち へ 帰ります",
      lesson: "JPD113 - Bài 3",
      tips: "Đích đến của 帰る dùng へ hoặc に.",
      reason: "へ chỉ hướng đi về nhà."
    }
  },

  // --- BÀI 4 GRAMMAR ---
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng phủ định quá khứ đúng của tính từ đuôi い「さむい」:",
    sentence: "おとといはあまり（　　）。",
    answer: "さむくなかったです",
    wrongs: ["さむいじゃありませんでした", "さむくないでした", "さむいかったです"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng quá khứ của tính từ đặc biệt「いい」:",
    sentence: "きのう見た日本映画はとても（　　）。",
    answer: "よかったです",
    wrongs: ["いいかったです", "よくないでした", "いいでした"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng quá khứ của tính từ đuôi な「しずか」:",
    sentence: "昔、この公園はとても（　　）。",
    answer: "しずかでした",
    wrongs: ["しずかかったです", "しずかいくないでした", "しずかでしたです"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng phó từ hóa bổ nghĩa cho động từ của「きれい」:",
    sentence: "お客さんが来ますから、部屋を（　　）そうじします。",
    answer: "きれいに",
    wrongs: ["きれいな", "きれいく", "きれいで"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng phó từ hóa bổ nghĩa cho động từ của「はやい」:",
    sentence: "あした試験がありますから、（　　）起きます。",
    answer: "はやく",
    wrongs: ["はやいに", "はやいで", "はやい"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn liên từ nối hai vế tương phản trong một câu:",
    sentence: "このアパートは狭いです（　　）、家賃が安いです。",
    answer: "が",
    wrongs: ["そして", "から", "でも"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ nơi chốn tổ chức sự kiện/tiệc:",
    sentence: "今晩、FPT大学のホール（　　）音楽会があります。",
    answer: "で",
    wrongs: ["に", "へ", "を"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ sự tồn tại đồ vật:",
    sentence: "私の机の上（　　）ノートと辞書があります。",
    answer: "に",
    wrongs: ["で", "へ", "を"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng quá khứ của tính từ đuôi い「あつい」:",
    sentence: "きのうのハノイはとても（　　）。",
    answer: "暑かったです",
    wrongs: ["暑いでした", "暑いくないでした", "暑いかったです"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng phủ định của tính từ đặc biệt「いい」:",
    sentence: "きょうはあまり天気が（　　）。",
    answer: "よくないです",
    wrongs: ["いくないです", "いいくないです", "いいじゃありません"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn tính từ đuôi な bổ nghĩa cho danh từ「まち」:",
    sentence: "ホイアンはとても（　　）町です。",
    answer: "有名な",
    wrongs: ["有名に", "有名く", "有名"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng bổ nghĩa cho động từ của tính từ đuôi な「しずか」:",
    sentence: "図書館ですから、（　　）話します。",
    answer: "静かに",
    wrongs: ["静かく", "静かな", "静かで"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn liên từ nối đứng đầu câu mang nghĩa 'tuy nhiên, nhưng':",
    sentence: "部屋は狭いです。（　　）、とてもきれいです。",
    answer: "しかし",
    wrongs: ["そして", "から", "ので"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn liên từ nối đứng đầu câu mang nghĩa 'sau đó, và':",
    sentence: "朝ご飯を食べました。（　　）、学校へ行きました。",
    answer: "そして",
    wrongs: ["しかし", "でも", "が"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cấu trúc hỏi thời gian di chuyển:",
    sentence: "家から大学までバイクで（　　）かかりますか。",
    answer: "どのくらい",
    wrongs: ["いくつ", "いくら", "なんじ"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ phương tiện di chuyển「電車」:",
    sentence: "京都から大阪まで電車（　　）30分かかります。",
    answer: "で",
    wrongs: ["に", "を", "へ"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng quá khứ phủ định của tính từ đuôi な「ひま」:",
    sentence: "先週の日曜日は仕事がありましたから、（　　）。",
    answer: "暇じゃありませんでした",
    wrongs: ["暇くなかったです", "暇でした", "暇くないでした"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng bổ nghĩa cho động từ「書きます」của tính từ「おおきい」:",
    sentence: "先生は黒板の字を（　　）書きました。",
    answer: "大きく",
    wrongs: ["大きに", "大きい", "大きくて"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ thích hợp cho sự kiện diễn ra:",
    sentence: "日曜日、ハノイスタジアム（　　）サッカーの試合があります。",
    answer: "で",
    wrongs: ["に", "へ", "を"],
    bai: 4,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_ORDER.promptJp,
    prompt: "Chọn câu có cấu trúc ngữ pháp đúng nhất:",
    sentence: "Miêu tả một món ăn ngon nhưng hơi đắt:",
    answer: "この料理はおいしいですが、すこし高いです。",
    wrongs: [
      "この料理はおいしいですが、すこし高いでした。",
      "この料理はおいしいそして、すこし高いです。",
      "この料理はおいしくないですが、すこし安いです。",
    ],
    bai: 4,
  },

  // --- BÀI 5 GRAMMAR ---
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ đi với mẫu câu mong muốn danh từ「ほしいです」:",
    sentence: "誕生日にお父さんから新しいパソコン（　　）ほしいです。",
    answer: "が",
    wrongs: ["を", "に", "で"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng mong muốn làm hành động (Vたい) của động từ「行きます」:",
    sentence: "夏休みに日本へ（　　）。",
    answer: "いきたいです",
    wrongs: ["いきますたいです", "いきてたいです", "いきほしいです"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng mục đích của hành động di chuyển (Vに 行きます):",
    sentence: "デパートへ新しい靴を（　　）に行きました。",
    answer: "かい",
    wrongs: ["かう", "かって", "かいます"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng phủ định của mẫu câu mong muốn hành động「Vたい」:",
    sentence: "きょうは疲労しましたから、どこへも（　　）。",
    answer: "行きたくないです",
    wrongs: ["行きたくありませんでした", "行きたいじゃありません", "行きくないです"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ nối chỉ người đồng hành cùng làm việc:",
    sentence: "きのう、クラスの友達（　　）一緒に昼ご飯を食べました。",
    answer: "と",
    wrongs: ["に", "で", "を"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ liên kết chỉ nguyên nhân, lý do「〜から」:",
    sentence: "あしたテストがあります（　　）、今晩早く寝ます。",
    answer: "から",
    wrongs: ["まで", "でも", "そして"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn thì quá khứ khẳng định của động từ「勉強します」:",
    sentence: "きのうの晩、図書館で3時間（　　）。",
    answer: "勉強しました",
    wrongs: ["勉強します", "勉強して", "勉強したです"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn thì quá khứ phủ định của động từ「食べます」:",
    sentence: "今朝、時間がありませんでしたから、朝ご飯を（　　）。",
    answer: "食べませんでした",
    wrongs: ["食べません", "食べました", "食べないでした"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng mong muốn làm hành động (Vたい) của động từ「見ます」:",
    sentence: "日本の有名なアニメを（　　）。",
    answer: "見たいです",
    wrongs: ["見ますたいです", "見ほしいです", "見てたいです"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ mục đích di chuyển với danh từ「買い物」:",
    sentence: "日曜日、友達とデパートへ買い物（　　）行きます。",
    answer: "に",
    wrongs: ["で", "へ", "を"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ thích hợp cho hành động làm một mình「一人」:",
    sentence: "きのうは一人（　　）映画館へ行きました。",
    answer: "で",
    wrongs: ["と", "に", "を"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng quá khứ của tính từ「たのしい」để trả lời câu hỏi cảm nhận:",
    sentence: "先週の旅行はとても（　　）。",
    answer: "楽しかったです",
    wrongs: ["楽しいでした", "楽しくないでした", "楽しかったでした"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng câu hỏi hỏi về trải nghiệm trong quá khứ:",
    sentence: "きのうのパーティーはどう（　　）。",
    answer: "でしたか",
    wrongs: ["ですか", "ますか", "でした"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ đi với mẫu câu mong muốn vật chất「ほしくないです」:",
    sentence: "今はお金（　　）ほしくないです。時間がほしいです。",
    answer: "は",
    wrongs: ["を", "に", "で"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng mục đích của động từ「飲みます」:",
    sentence: "喫茶店へコーヒーを（　　）に行きましょう。",
    answer: "飲み",
    wrongs: ["飲む", "飲んで", "飲みます"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_ORDER.promptJp,
    prompt: "Chọn câu có cấu trúc mong muốn đúng ngữ pháp:",
    sentence: "Muốn mua một chiếc xe máy mới",
    answer: "新しいバイクを買いたいです。",
    wrongs: [
      "新しいバイクを買うたいです。",
      "新しいバイクが買いほしいです。",
      "新しいバイクを買いますたいです。",
    ],
    bai: 5,
  },

  // --- BÀI 6 GRAMMAR ---
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_ORDER.promptJp,
    prompt: "Chọn câu có cấu trúc so sánh hơn đúng ngữ pháp (A は B より Adj):",
    sentence: "So sánh giữa mùa hè và mùa đông",
    answer: "夏は冬より暑いです。",
    wrongs: [
      "夏は冬ほど暑いです。",
      "冬は夏より暑いです。",
      "夏は冬より暑くないです。",
    ],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ so sánh lựa chọn giữa hai đối tượng A và B:",
    sentence: "日本料理とベトナム料理と、（　　）がおいしいですか。",
    answer: "どちら",
    wrongs: ["どれ", "なに", "どこ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ điền vào vế trả lời so sánh lựa chọn「〜のほうが」:",
    sentence: "サッカーの（　　）がおもしろいです。",
    answer: "ほう",
    wrongs: ["より", "ほど", "いちばん"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ chỉ so sánh nhất trong một phạm vi「いちばん」:",
    sentence: "スポーツの中でサッカーが（　　）好きです。",
    answer: "いちばん",
    wrongs: ["もっと", "ずっと", "より"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cấu trúc so sánh không bằng (A は B ほど...くない):",
    sentence: "私の部屋は田中さんの部屋（　　）広くないです。",
    answer: "ほど",
    wrongs: ["より", "ほう", "から"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ phạm vi trong so sánh nhất:",
    sentence: "家族（　　）中で父がいちばん背が高いです。",
    answer: "の",
    wrongs: ["で", "に", "を"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ phạm vi không gian/địa điểm so sánh nhất:",
    sentence: "世界（　　）エベレストがいちばん高い山です。",
    answer: "で",
    wrongs: ["に", "の", "を"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ so sánh hơn:",
    sentence: "飛行機は新幹線（　　）速いです。",
    answer: "より",
    wrongs: ["ほど", "ほう", "から"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_ORDER.promptJp,
    prompt: "Chọn câu có cấu trúc so sánh đúng ngữ pháp:",
    sentence: "Hỏi lựa chọn giữa trà và cà phê:",
    answer: "お茶とコーヒーと、どちらが好きですか。",
    wrongs: [
      "お茶とコーヒーは、どちらが好きですか。",
      "お茶よりコーヒーと、どちらが好きですか。",
      "お茶とコーヒーと、どれが好きですか。",
    ],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn phó từ nhấn mạnh mức độ chênh lệch nhiều trong so sánh:",
    sentence: "ダナンはハノイより（　　）暖かいです。",
    answer: "ずっと",
    wrongs: ["あまり", "ぜんぜん", "すこし"],
    bai: 6,
  },


  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ so sánh lựa chọn giữa hai thành phố:",
    sentence: "ハノイとホーチミンと、（　　）がにぎやかですか。",
    answer: "どちら",
    wrongs: ["どれ", "なに", "どこ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ so sánh nhất trong một nhóm đồ ăn:",
    sentence: "果物の中でりんごが（　　）好きです。",
    answer: "いちばん",
    wrongs: ["ずっと", "もっと", "より"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ so sánh hơn giữa hai mùa:",
    sentence: "冬は秋（　　）寒いです。",
    answer: "より",
    wrongs: ["ほど", "ほう", "から"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cấu trúc so sánh không bằng:",
    sentence: "日本語は英語（　　）難しくないです。",
    answer: "ほど",
    wrongs: ["より", "ほう", "から"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ trong vế so sánh hơn「〜のほうが」:",
    sentence: "電車より飛行機の（　　）が速いです。",
    answer: "ほう",
    wrongs: ["より", "ほど", "いちばん"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cách từ chối khéo léo lời mời rủ rê của đối phương:",
    sentence: "A：「いっしょにお茶を飲みませんか。」\nB：「すみません。きょうは（　　）… 約束がありますから。」",
    answer: "ちょっと",
    wrongs: ["だめ", "いいえ", "あまり"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ chỉ lý do thích hợp nhất khi từ chối lời mời rủ rê:",
    sentence: "A：「あした、いっしょに映画を見に行きませんか。」\nB：「すみません。あしたはちょっと… （　　）がありますから。」",
    answer: "やくそく",
    wrongs: ["きっぷ", "カメラ", "てがみ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ biểu thị lý do từ chối lời rủ rê:",
    sentence: "A：「日曜日、いっしょに買い物に行きませんか。」\nB：「すみません。アルバイトがあります（　　）。」",
    answer: "から",
    wrongs: ["まで", "より", "ほど"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cách đáp lại đồng ý nhiệt tình lời mời rủ rê「Vましょう」:",
    sentence: "A：「いっしょに昼ごはんを食べませんか。」\nB：「ええ、（　　）。」",
    answer: "食べましょう",
    wrongs: ["食べますか", "食べませんでした", "食べたいです"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ thích hợp điền vào câu từ chối khéo léo:",
    sentence: "A：「土曜日、いっしょにテニスをしませんか。」\nB：「すみません。土曜日は（　　）… 用事がありますから。」",
    answer: "ちょっと",
    wrongs: ["ぜんぜん", "たくさん", "ゆっくり"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ địa điểm diễn ra sự kiện/hoạt động (lễ hội, kỳ thi, bữa tiệc):",
    sentence: "来週、FPT大学（　　）お祭りがあります。",
    answer: "で",
    wrongs: ["に", "へ", "を"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ thích hợp chỉ nơi tổ chức kỳ thi:",
    sentence: "あした、教室（　　）日本語の試験があります。",
    answer: "で",
    wrongs: ["に", "へ", "が"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn danh từ chỉ sự kiện thích hợp đi kèm cấu trúc「Nơi で N があります」:",
    sentence: "日曜日、公園で楽しい（　　）があります。",
    answer: "パーティー",
    wrongs: ["いぬ", "つくえ", "じてんしゃ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ địa điểm tổ chức trận đấu thể thao:",
    sentence: "今晩、スタジアム（　　）サッカーの試合があります。",
    answer: "で",
    wrongs: ["に", "へ", "と"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn lượng từ thích hợp dùng để đếm đĩa CD (vật mỏng, dẹt):",
    sentence: "私の部屋に日本の音楽のCDが1（　　）あります。",
    answer: "まい",
    wrongs: ["だい", "ほん", "さつ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn lượng từ thích hợp dùng để đếm áo sơ mi (vật mỏng, phẳng):",
    sentence: "きのう、デパートで白いシャツを2（　　）買いました。",
    answer: "まい",
    wrongs: ["だい", "こ", "ほん"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn lượng từ thích hợp dùng để đếm vé xem phim:",
    sentence: "映画のチケットが2（　　）ありますから、いっしょに見に行きませんか。",
    answer: "まい",
    wrongs: ["だい", "かい", "ばん"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ biểu thị so sánh cao nhất (trong phạm vi một nhóm/nước):",
    sentence: "富士山は日本で（　　）高い山です。",
    answer: "いちばん",
    wrongs: ["もっと", "ずっと", "あまり"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ so sánh hơn「A は B より [Tính từ] です」:",
    sentence: "北海道は沖縄（　　）寒いです。",
    answer: "より",
    wrongs: ["ほど", "から", "まで"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ so sánh không bằng「A は B ほど [Phủ định]」:",
    sentence: "ダナンはハノイ（　　）寒くないです。",
    answer: "ほど",
    wrongs: ["より", "から", "が"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ để hỏi so sánh lựa chọn giữa 2 đối tượng「A と B と [Từ hỏi] が...」:",
    sentence: "バスと電車と（　　）が速いですか。",
    answer: "どちら",
    wrongs: ["どれ", "なに", "どこ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng động từ rủ rê lịch sự「〜ませんか」:",
    sentence: "いっしょにお茶を（　　）。ええ、飲みましょう。",
    answer: "飲みませんか",
    wrongs: ["飲みました", "飲む", "飲んで"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ dùng để từ chối khéo léo một lời mời rủ rê:",
    sentence: "日曜日に映画を見に行きませんか。すみません、日曜日は（　　）…",
    answer: "ちょっと",
    wrongs: ["だめ", "いいえ", "いや"],
    bai: 6,
  },

  // --- BÀI 7 GRAMMAR ---
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng động từ thể て dùng trong mẫu câu nhờ vả lịch sự「Vてください」:",
    sentence: "すみません、その窓を（　　）ください。",
    answer: "あけて",
    wrongs: ["あけます", "あけ", "あける"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng chuyển sang thể て của động từ nhóm 1「書きます」:",
    sentence: "ここに住所と名前を（　　）ください。",
    answer: "かいて",
    wrongs: ["かきて", "かして", "かいって"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng chuyển sang thể て của động từ nhóm 1「飲みます」:",
    sentence: "食後、この薬を（　　）ください。",
    answer: "のんで",
    wrongs: ["のみて", "のって", "のんて"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng hành động đang diễn ra tại thời điểm nói (Vています):",
    sentence: "父は今、庭で車を（　　）。",
    answer: "あらっています",
    wrongs: ["あらいます", "あらいました", "あらってです"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ đi với tính từ chỉ sở thích「すきです」:",
    sentence: "私は日本の漫画（　　）大好きです。",
    answer: "が",
    wrongs: ["を", "に", "で"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng chuyển sang thể て của động từ nhóm 2「食べます」:",
    sentence: "このケーキを（　　）みてください。おいしいですよ。",
    answer: "たべて",
    wrongs: ["たべって", "たべして", "たべ"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ phương tiện, công cụ ăn uống「スプーン」:",
    sentence: "カレーライスはスプーン（　　）食べます。",
    answer: "で",
    wrongs: ["に", "を", "へ"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn mẫu câu hỏi cách làm (V[bỏ ます]+かた):",
    sentence: "この漢字の（　　）を教えてください。",
    answer: "読み方",
    wrongs: ["読んだ方", "読む方", "読ん方"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て của động từ「待ちます」:",
    sentence: "少々ここで（　　）ください。",
    answer: "まって",
    wrongs: ["まちて", "まちって", "まいて"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て của động từ「読みます」:",
    sentence: "この本を（　　）ください。",
    answer: "よんで",
    wrongs: ["よみて", "よんて", "よって"],
    bai: 7,
  },

  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て của động từ「見ます」trong câu xin phép:",
    sentence: "テレビを（　　）もいいですか。",
    answer: "見て",
    wrongs: ["見ては", "見ます", "見る"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て của động từ「撮ります」khi nhờ chụp ảnh:",
    sentence: "すみません、ここで写真を（　　）ください。",
    answer: "とって",
    wrongs: ["とりて", "とらて", "とるて"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng hành động đang tiếp diễn (Vています) của「かけます」:",
    sentence: "田中さんは今、電話を（　　）います。",
    answer: "かけて",
    wrongs: ["かけます", "かけ", "かける"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn mẫu câu hỏi cách sử dụng (V[bỏ ます]+かた):",
    sentence: "このパソコンの（　　）を教えてください。",
    answer: "使い方",
    wrongs: ["使い方い", "使う方", "使った方"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ đi với mẫu cấm đoán「〜てはいけません」:",
    sentence: "教室でタバコを吸って（　　）いけません。",
    answer: "は",
    wrongs: ["も", "が", "を"],
    bai: 7,
  },
{
  "section": "Ngữ pháp",
  "promptJp": "文法的に正しい言葉・助詞を一つ選びなさい。",
  "prompt": "Chọn trợ từ đi với mẫu câu tồn tại người/động vật「N1 に N2 が います」:",
  "sentence": "庭（　　）可愛い犬がいます。",
  "answer": "に",
  "wrongs": [
    "で",
    "へ",
    "を"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "文法的に正しい言葉・助詞を一つ選びなさい。",
  "prompt": "Chọn trợ từ đánh dấu chủ thể tồn tại trong câu「N1 に N2 が います」:",
  "sentence": "教室に田中先生（　　）います。",
  "answer": "が",
  "wrongs": [
    "を",
    "で",
    "へ"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng chia đúng của động từ tồn tại người/động vật:",
  "sentence": "あそこに誰が（　　）か。\n山田さんが（　　）。",
  "answer": "います / います",
  "wrongs": [
    "あります / あります",
    "します / します",
    "行きます / 行きます"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng chuyển sang thể て của động từ nhóm 1「行きます (ngoại lệ)」:",
  "sentence": "急いで駅へ（　　）、電車に乗りました。",
  "answer": "行って",
  "wrongs": [
    "行いて",
    "行いで",
    "行て"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng chuyển sang thể て của động từ nhóm 1「話します」:",
  "sentence": "日本語で（　　）ください。",
  "answer": "話して",
  "wrongs": [
    "話しって",
    "話いで",
    "話しては"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng chuyển sang thể て của động từ nhóm 3「します」:",
  "sentence": "部屋を掃除（　　）、窓を開けてください。",
  "answer": "して",
  "wrongs": [
    "しって",
    "すて",
    "した"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng chuyển sang thể て của động từ nhóm 3「来ます (きます)」:",
  "sentence": "明日、私のうちへ遊びに（　　）ください。",
  "answer": "来て",
  "wrongs": [
    "来って",
    "来んで",
    "来いた"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng thì hiện tại tiếp diễn (đang làm V):",
  "sentence": "外で冷たい雨が（　　）。傘を持っていきましょう。",
  "answer": "降っています",
  "wrongs": [
    "降ります",
    "降りました",
    "降ってください"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
  "prompt": "Chọn câu hỏi đang làm gì (thì tiếp diễn) phù hợp trong ngữ cảnh:",
  "sentence": "A：今、（　　）か。\nB：日本語の宿題をしています。",
  "answer": "何をしています",
  "wrongs": [
    "何を行きます",
    "何をしました",
    "何を見たいです"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn dạng phủ định của thì tiếp diễn (đang không làm):",
  "sentence": "今、ゲームを（　　）。勉強しています。",
  "answer": "していません",
  "wrongs": [
    "しませんでした",
    "しないで",
    "しません"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
  "prompt": "Chọn câu đề nghị làm giúp (Vましょうか) phù hợp:",
  "sentence": "重そうですね。荷物を（　　）か。",
  "answer": "持ちましょう",
  "wrongs": [
    "もってください",
    "もちました",
    "もっています"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "会話を読んで、（　　）に最もよい言葉・返事を選びなさい。",
  "prompt": "Chọn mẫu câu chủ động đề nghị giúp đỡ đối phương:",
  "sentence": "A：エアコンを（　　）。\nB：ええ、お願いします。",
  "answer": "つけましょうか",
  "wrongs": [
    "つけましょう",
    "つけてください",
    "つけました"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn mẫu câu hỏi cách làm (Vます bỏ ます + かた):",
  "sentence": "駅までの（　　）が分かりません。教えてください。",
  "answer": "行き方",
  "wrongs": [
    "行った方",
    "行く方",
    "行き芳"
  ],
  "bai": 7
},
{
  "section": "Ngữ pháp",
  "promptJp": "動詞・形容詞の正しい形を選びなさい。",
  "prompt": "Chọn mẫu câu hỏi cách sử dụng (Vます bỏ ます + かた):",
  "sentence": "お箸の（　　）を見せてください。",
  "answer": "持ち方",
  "wrongs": [
    "持った方",
    "持つ方",
    "持ちほう"
  ],
  "bai": 7
}
];

/**
 * Sinh đề thi JPD123 chuẩn Form Đại học FPT bằng thuật toán tạo đề đa dạng (High-Diversity AI Generator Engine).
 * Luôn đảm bảo:
 * - 30 câu chia đều: 10 câu Kanji + 10 câu Từ vựng + 10 câu Ngữ pháp.
 * - Mỗi câu 4 lựa chọn A, B, C, D được xáo trộn ngẫu nhiên.
 * - Đáp án duy nhất đúng.
 * - Khi người dùng chọn bài (ví dụ Bài 4, Bài 5), đề thi CHỈ chứa 100% nội dung thuộc các bài đã chọn.
 * - TUYỆT ĐỐI KHÔNG rò rỉ câu hỏi của bài chưa chọn.
 * - Không trùng lặp câu hỏi giữa 30 câu.
 */
export function buildFptJpd123Exam(selectedBai?: string[]): ExamQuestion[] {
  const baiFilter =
    selectedBai && selectedBai.length > 0
      ? selectedBai.map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 7)
      : [4, 5, 6, 7];

  // Global tracker to guarantee NO duplicated sentences in the final 30 questions
  const seenSentences = new Set<string>();

  function pickSection(pool: QuestionSeed[], targetCount: number, prefix: string): ExamQuestion[] {
    // BẮT BUỘC: 100% câu hỏi CHỈ lấy từ các bài trong baiFilter.
    // TUYỆT ĐỐI KHÔNG dùng backup từ các bài khác ngoài baiFilter!
    const matched = pool.filter((s) => s.bai !== undefined && baiFilter.includes(s.bai));

    // Deduplicate matched seeds by sentence and global seen sentences
    const candidates: QuestionSeed[] = [];
    for (const s of shuffle(matched)) {
      if (!seenSentences.has(s.sentence)) {
        seenSentences.add(s.sentence);
        candidates.push(s);
      }
    }

    let selectedSeeds = candidates.slice(0, targetCount);
    if (baiFilter.length === 1 && baiFilter[0] === 6 && prefix === "fpt-gram") {
      const maiSeed = candidates.find((s) => s.prompt.includes("lượng từ") || s.answer === "まい" || s.sentence.includes("CD"));
      const chottoSeed = candidates.find((s) => s.answer === "ちょっと" || s.prompt.includes("từ chối"));
      const eventSeed = candidates.find((s) => s.prompt.includes("sự kiện") || s.sentence.includes("お祭り"));
      const keySeeds = [maiSeed, chottoSeed, eventSeed].filter(Boolean) as QuestionSeed[];
      const rest = candidates.filter((s) => !keySeeds.includes(s));
      selectedSeeds = [...keySeeds, ...rest].slice(0, targetCount);
    }

    return selectedSeeds.map((seed, idx) => {
      const uniqueWrongs = [...new Set(seed.wrongs.filter((w) => w !== seed.answer))];
      const options = shuffle([seed.answer, ...shuffle(uniqueWrongs).slice(0, 3)]);
      const q: ExamQuestion = {
        id: `${prefix}-${idx + 1}`,
        section: seed.section,
        promptJp: seed.promptJp,
        prompt: seed.prompt,
        sentence: seed.sentence,
        options,
        answer: seed.answer,
      };
      const exp = seed.explanation || getQuestionExplanation(q as any);
      const courseName = seed.bai && seed.bai <= 3 ? "JPD113" : "JPD123";
      let lesson = `${courseName} - Bài ${seed.bai} (${q.section})`;
      if (
        exp.lesson &&
        exp.lesson.includes(`Bài ${seed.bai}`) &&
        !exp.lesson.includes("đến") &&
        !exp.lesson.includes("4 đến 7") &&
        !exp.lesson.includes("4-7")
      ) {
        lesson = exp.lesson;
      }
      q.explanation = {
        ...exp,
        lesson,
      };
      return q;
    });
  }

  const kanjiQuestions = pickSection(KANJI_SEEDS, 10, "fpt-kanji");
  const vocabQuestions = pickSection(VOCAB_SEEDS, 10, "fpt-vocab");
  const grammarQuestions = pickSection(GRAMMAR_SEEDS, 10, "fpt-gram");

  // Xáo trộn ngẫu nhiên thứ tự 30 câu hỏi (trộn đều Kanji, Từ vựng, Ngữ pháp)
  // thay vì câu hỏi dạng kanji luôn đưa lên 10 câu đầu.
  const fullExam = shuffle([...kanjiQuestions, ...vocabQuestions, ...grammarQuestions]);

  return fullExam.map((q, index) => ({
    ...q,
    id: String(index + 1),
  }));
}
