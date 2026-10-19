export type ExamSection = "Kanji" | "Từ vựng" | "Ngữ pháp";

export type ExamQuestion = {
  id: string;
  section: ExamSection;
  promptJp: string;
  prompt: string;
  sentence: string;
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

function shuffle<T>(items: T[]): T[] {
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

type QuestionSeed = {
  section: ExamSection;
  promptJp: string;
  prompt: string;
  sentence: string;
  answer: string;
  wrongs: string[];
  bai?: number; // 4, 5, 6, 7
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
const KANJI_SEEDS: QuestionSeed[] = [
  // Đọc Kanji sang Hiragana (Bài 4 - 7)
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

  // Chọn chữ Hán từ Hiragana
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

  // Âm Hán Việt & Ý nghĩa chữ Hán
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
    prompt: "Chữ Hán「料」trong từ「料理 (りょうり)」có âm Hán Việt là gì?",
    sentence: "〔料〕理",
    answer: "LIỆU",
    wrongs: ["LÝ", "KHOA", "TIỆM"],
    bai: 4,
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
    prompt: "Chữ Hán「新」trong「新しい (あたらしい)」mang ý nghĩa gì?",
    sentence: "〔新〕しい",
    answer: "Tân (Mới)",
    wrongs: ["Cổ (Cũ)", "Bạch (Trắng)", "Thân (Gần gũi)"],
    bai: 4,
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
];

// =========================================================================
// 2. VOCABULARY BANK (Từ vựng Bài 4 - 7: JPD123 FPT)
// =========================================================================
const VOCAB_SEEDS: QuestionSeed[] = [
  // Điền từ vào chỗ trống theo ngữ cảnh
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
    sentence: "おなかがすきましたから、何か（　　）を食べたいです。",
    answer: "おいしいもの",
    wrongs: ["おいしくもの", "おいしさ", "おいしいこと"],
    bai: 5,
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
    prompt: HEADERS.VOCAB_FILL.prompt,
    sentence: "家族に手紙を書きましたから、郵便局へ（　　）を買いに行きます。",
    answer: "きって",
    wrongs: ["きっぷ", "はがき", "ふうとう"],
    bai: 5,
  },

  // Phó từ mức độ & thời gian (Bài 4 - 7)
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

  // Từ trái nghĩa (Antonyms - JPD123)
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
    sentence: "学校から駅まで〔近い〕ですから、歩いて行きます。",
    answer: "とおい",
    wrongs: ["おそい", "ひろい", "たかい"],
    bai: 6,
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

  // Hội thoại giao tiếp ngắn (FPT Campus Context & Minna)
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
    sentence: "A：昨日の試験はどうでしたか。\nB：（　　）。",
    answer: "とても難しかったです",
    wrongs: ["難しくないでした", "難しかったですない", "難しかったじゃありません"],
    bai: 5,
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
];

// =========================================================================
// 3. GRAMMAR BANK (Ngữ pháp Bài 4 - 7: JPD123 FPT)
// =========================================================================
const GRAMMAR_SEEDS: QuestionSeed[] = [
  // Bài 4: Chia tính từ đuôi い & な
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
    sentence: "お客さんが来ますから、部屋を（　　）そうじしてください。",
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

  // Bài 5: Mong muốn & Mục đích
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
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ mục đích của hành động di chuyển (V/N に 行きます):",
    sentence: "スーパーへ晩ごはんの材料を買い（　　）行きます。",
    answer: "に",
    wrongs: ["で", "へ", "を"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ nối trả lời cho câu hỏi lý do「どうして」:",
    sentence: "A：どうして学校を休みましたか。\nB：頭が痛かった（　　）です。",
    answer: "から",
    wrongs: ["まで", "のではありません", "けれど"],
    bai: 5,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn trợ từ chỉ người cùng thực hiện hành động:",
    sentence: "日曜日、ハノイで友達（　　）テニスをしました。",
    answer: "と",
    wrongs: ["で", "に", "へ"],
    bai: 5,
  },

  // Bài 6: So sánh (Comparatives)
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ điền vào cấu trúc so sánh hơn: A は B より Adj です:",
    sentence: "飛行機は新幹線（　　）速いです。",
    answer: "より",
    wrongs: ["ほど", "から", "だけ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ điền vào cấu trúc so sánh kém (không bằng): A は B ほど Adj くない:",
    sentence: "バスは電車（　　）速くないです。",
    answer: "ほど",
    wrongs: ["より", "ほう", "しか"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ để hỏi trong câu so sánh lựa chọn giữa 2 đối tượng:",
    sentence: "日本料理とベトナム料理と（　　）が好きですか。",
    answer: "どちら",
    wrongs: ["どれ", "どこ", "だれ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn cụm từ trả lời câu so sánh lựa chọn: A のほうが...",
    sentence: "夏と冬では、夏（　　）暑いです。",
    answer: "のほうが",
    wrongs: ["より", "ほど", "がいちばん"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn từ mang ý nghĩa 'nhất' trong phạm vi nhóm:",
    sentence: "スポーツの中でサッカーが（　　）おもしろいです。",
    answer: "いちばん",
    wrongs: ["とても", "あまり", "すこし"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn lượng từ đếm giấy, tem, áo mỏng (đồ vật mỏng dẹt):",
    sentence: "郵便局で80円の切手を5（　　）買いました。",
    answer: "まい",
    wrongs: ["ほん", "だい", "つ"],
    bai: 6,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FILL.promptJp,
    prompt: "Chọn lượng từ đếm xe ô tô, máy tính, máy móc:",
    sentence: "研究室にパソコンが10（　　）あります。",
    answer: "だい",
    wrongs: ["まい", "ほん", "こ"],
    bai: 6,
  },

  // Bài 7: Thể て, nhờ vả, trạng thái tiếp diễn
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て đúng của động từ nhóm 1「書きます (かきます)」:",
    sentence: "ここに名前と住所を（　　）ください。",
    answer: "かいて",
    wrongs: ["かきて", "かいた", "かきって"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て đúng của động từ nhóm 1 đặc biệt「行きます (いきます)」:",
    sentence: "駅へ（　　）、切符を買いました。",
    answer: "いって",
    wrongs: ["いきて", "いいた", "いで"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て đúng của động từ「飲みます (のみます)」:",
    sentence: "薬を（　　）、早く寝てください。",
    answer: "のんで",
    wrongs: ["のみて", "のんでて", "のんだ"],
    bai: 7,
  },
  {
    section: "Ngữ pháp",
    promptJp: HEADERS.GRAM_FORM.promptJp,
    prompt: "Chọn dạng thể て đúng của động từ nhóm 2「食べます (たべます)」:",
    sentence: "朝ごはんを（　　）から学校へ行きます。",
    answer: "たべて",
    wrongs: ["たべって", "たべして", "たべた"],
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
    promptJp: HEADERS.GRAM_ORDER.promptJp,
    prompt: "Chọn câu có cấu trúc so sánh đúng ngữ pháp:",
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
];

/**
 * Sinh đề thi JPD123 chuẩn Form Đại học FPT bằng thuật toán tạo đề đa dạng (High-Diversity AI Generator Engine).
 * Luôn đảm bảo:
 * - 30 câu chia đều: 10 câu Kanji + 10 câu Từ vựng + 10 câu Ngữ pháp.
 * - Mỗi câu 4 lựa chọn A, B, C, D được xáo trộn ngẫu nhiên.
 * - Đáp án duy nhất đúng.
 * - Nếu người dùng chỉ định bài (ví dụ Bài 4, 5, 6, 7), thuật toán sẽ ưu tiên câu hỏi theo các bài đó.
 */
export function buildFptJpd123Exam(selectedBai?: string[]): ExamQuestion[] {
  const baiFilter = selectedBai && selectedBai.length > 0 ? selectedBai.map(Number) : [4, 5, 6, 7];

  function pickSection(pool: QuestionSeed[], targetCount: number, prefix: string): ExamQuestion[] {
    // Ưu tiên câu thuộc các bài đã chọn
    const matched = pool.filter((s) => !s.bai || baiFilter.includes(s.bai));
    const backup = pool.filter((s) => s.bai && !baiFilter.includes(s.bai));
    const ordered = [...shuffle(matched), ...shuffle(backup)];

    const selectedSeeds = ordered.slice(0, targetCount);
    return selectedSeeds.map((seed, idx) => {
      const uniqueWrongs = [...new Set(seed.wrongs.filter((w) => w !== seed.answer))];
      const options = shuffle([seed.answer, ...shuffle(uniqueWrongs).slice(0, 3)]);
      return {
        id: `${prefix}-${idx + 1}`,
        section: seed.section,
        promptJp: seed.promptJp,
        prompt: seed.prompt,
        sentence: seed.sentence,
        options,
        answer: seed.answer,
        explanation: seed.explanation,
      };
    });
  }

  const kanjiQuestions = pickSection(KANJI_SEEDS, 10, "fpt-kanji");
  const vocabQuestions = pickSection(VOCAB_SEEDS, 10, "fpt-vocab");
  const grammarQuestions = pickSection(GRAMMAR_SEEDS, 10, "fpt-gram");

  // Giữ cấu trúc đề thi chuẩn FPT: Phần 1 (Kanji 1-10) -> Phần 2 (Từ vựng 11-20) -> Phần 3 (Ngữ pháp 21-30)
  // hoặc xáo trộn trong từng phần để vừa giữ cấu trúc module vừa tăng tính ngẫu nhiên.
  const fullExam = [...kanjiQuestions, ...vocabQuestions, ...grammarQuestions];

  return fullExam.map((q, index) => ({
    ...q,
    id: String(index + 1),
  }));
}
