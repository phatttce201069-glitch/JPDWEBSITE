import type { ExamQuestion } from "./exam.ts";
import { buildFptJpd123Exam, shuffle } from "./fpt-jpd123-engine.ts";
import { grammar, vocabulary } from "./content.ts";

export type AiProvider = "built-in" | "gemini" | "xai" | "openai" | "groq";

export type AiSettings = {
  provider: AiProvider;
  apiKey: string;
  model?: string;
};

const STORAGE_KEY = "sumi_ai_exam_settings";

export function getAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return { provider: "built-in", apiKey: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { provider: "built-in", apiKey: "" };
    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || "built-in",
      apiKey: parsed.apiKey || "",
      model: parsed.model || "",
    };
  } catch {
    return { provider: "built-in", apiKey: "" };
  }
}

export function saveAiSettings(settings: AiSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Ma trận kiến thức theo từng bài chuẩn môn JPD123 Đại học FPT
 */
const LESSON_OUTLINES: Record<number, { kanji: string; vocab: string; grammar: string }> = {
  1: {
    kanji: "私, 人, 学, 生, 先, 輩, 友, 達, 本, 日",
    vocab: "Chào hỏi, nghề nghiệp (学生, 先生, 会社員, 医者, エンジニア), quốc tịch (ベトナム人, 日本人, アメリカ人), tuổi tác (〜歳, はたち)",
    grammar: "Câu danh từ (N1 は N2 です / じゃありません / ですか), trợ từ の (sở hữu, trực thuộc), trợ từ も (cũng), trợ từ と (và)",
  },
  2: {
    kanji: "何, 階, 円, 百, 千, 万, 店, 買, 車, 語",
    vocab: "Địa điểm trong trường/công ty (教室, 食堂, 事務所, 会議室, 受付, トイレ), đồ vật (ペン, 本, 傘, 時計, 鞄), số đếm tiền tệ & số tầng (何階, いくら, 円)",
    grammar: "Chỉ định từ (これ, それ, あれ, この, その, あの), hỏi vị trí (どこ, どちら), hỏi nguồn gốc xuất xứ (どこの), hỏi giá tiền (いくら), gọi món/mua sắm (N を ください)",
  },
  3: {
    kanji: "行, 来, 帰, 食, 飲, 見, 聞, 読, 書, 時, 分, 半",
    vocab: "Thời gian (今, 〜時, 〜分, 午前, 午後, 毎日, 朝, 昼, 晩), các thứ trong tuần (月〜日曜日), động từ sinh hoạt (起きます, 寝ます, 働きます, 休みます, 勉強します, 食べます, 飲みます)",
    grammar: "Động từ lịch sự (Vます / Vません), trợ từ へ (nơi đến: 行きます/来ます/帰ります), trợ từ を (tân ngữ tác động), trợ từ で (nơi diễn ra hành động), trợ từ に (thời điểm cụ thể), trợ từ から〜まで (từ... đến...)",
  },
  4: {
    kanji: "東, 京, 名, 前, 国, 男, 女, 区, 市, 料理, 映画, 暑い, 新しい, 広い, 狭い, 近い, 遠い, 古い, 買う, 難",
    vocab: "Phương hướng (北, 南, 東, 西), phương tiện & giao thông (車, 新幹線, 電車, 飛行機, 駅, 町, 歩いて), thời gian/khoảng cách (〜時間, どのくらい), địa điểm du lịch (温泉, 川, 山, 寺, 神社, 桜, 建物), tính từ miêu tả (暑い, 寒い, 暖かい, 涼しい, 遠い, 近い, 大きい, 小さい, 高い, 安い, 新しい, 古い, 広い, 狭い, いい/よい, きれい, 静か, 賑やか, 有名), phó từ & liên từ (とても, すこし, あまり, ぜんぜん, が, しかし, そして)",
    grammar: "Tính từ đuôi い và な (khẳng định, phủ định 〜くない / 〜じゃありません, quá khứ 〜かった / 〜でした, phủ định quá khứ 〜くなかった / 〜じゃありませんでした), tính từ bổ nghĩa danh từ (新しい車, きれいな町), tính từ bổ nghĩa động từ (早く起きます, きれいにします), phó từ mức độ (とても, あまり + phủ định), liên từ (〜が〜, しかし, そして), vị trí sự kiện (で vs に), hỏi thời gian di chuyển (〜から〜まで どのくらい)",
  },
  5: {
    kanji: "先, 週, 毎, 午, 後, 見, 食, 飲, 買, 物, 行, 休, 家, 本, 水, 友, 達, 私",
    vocab: "Đời sống & đồ vật (パソコン, 車, 自転車, カメラ, お金, 時間, 友達, 家族, 部屋), động từ sinh hoạt & di chuyển (買います, 待ちます, 行きます, 来ます, 帰ります, 会います, 勉強します, 働きます, 休みます, 見ます, 食べます, 飲みます, 散歩します, 買い物します), từ chỉ thời gian quá khứ (おととい, きのう, 先週, 先月, 去年), bưu điện & thư tín (郵便局, 手紙, 切手, 荷物), tính từ quá khứ (楽しかった, 面白かった, 忙しかった, 大変でした), phó từ (一緒に, 一人で, どうして, どうでしたか)",
    grammar: "Động từ quá khứ (Vました / Vませんでした), tính từ quá khứ (Aかったです / Aでした), mong muốn sở hữu (N が ほしいです / ほしくないです), mong muốn làm việc (Vたいです / Vたくないです), mục đích di chuyển (V/N に 行きます/来ます/帰ります), trợ từ と (cùng với ai), trợ từ から (chỉ nguyên nhân: 〜から、〜), câu hỏi trải nghiệm quá khứ (どうでしたか)",
  },
  6: {
    kanji: "今, 来, 帰, 会, 社, 聞, 読, 書, 話, 寺, 言, 具, 田, 力, 門, 枚, 約, 束, 祭",
    vocab: "Thời tiết & các mùa (春, 夏, 秋, 冬, 雨, 雪, 風, くもり, 季節), sự kiện & hoạt động (お祭り, パーティー, 試験, コンサート, 試合, 約束 - やくそく, 用事 - ようじ, アルバイト), vật mỏng đếm 枚 (CD, シャツ, チケット, 切手), so sánh & lựa chọn (どちら, ずっと, ほう, いちばん)",
    grammar: "1. So sánh hơn (A は B より Adj です), so sánh lựa chọn (A と B と どちらが...), trả lời so sánh (A のほうが...), so sánh nhất (N の中で A が いちばん...), so sánh không bằng (A は B ほど...くない). 2. Rủ rê & Đáp lại / Từ chối khéo: rủ rê (いっしょに Vませんか), đồng ý (Vましょう), từ chối khéo (すみません。〜はちょっと…), đưa ra lý do từ chối (N がありますから / やくそくがありますから). 3. Nơi diễn ra sự kiện: [Địa điểm] で [Sự kiện: お祭り/パーティー/試験] があります. 4. Đếm số lượng vật mỏng: Lượng từ 枚 (まい) - N が/を 〜まい あります/買いました (CDが1まいあります, シャツを2枚買いました).",
  },
  7: {
    kanji: "肉, 料, 理, 野, 半, 大, 小, 病, 院, 電, 気, 開, 閉, 待, 書, 読, 話, 泳, 行, 来",
    vocab: "Quy tắc chia động từ thể て (Nhóm 1, 2, 3), dụng cụ ăn uống (スプーン, フォーク, ナイフ, はし, コップ, お皿, 冷蔵庫, 電子レンジ), gia vị & nấu ăn (砂糖, 塩, 醤油, 肉, 野菜), phó từ (もう, まだ, ぜひ), từ vựng giao tiếp",
    grammar: "1. Quy tắc chia thể て (Vて: Nhóm 1, 2, 3 và ngoại lệ 行く→行って). 2. Sự tồn tại người/động vật (N1 に N2 が います). 3. Yêu cầu lịch sự (Vてください). 4. Thì hiện tại tiếp diễn (Vています / Vていません / 何をしていますか). 5. Đề nghị giúp đỡ (Vましょうか). 6. Cách làm (V[bỏ ます]+かた: 作り方, 使い方, 読み方, 行き方).",
  },
};

export type DynamicLessonOutline = {
  kanji: string;
  vocab: string;
  grammar: string;
};

/**
 * Trích xuất động nội dung bài học từ dữ liệu nguồn (grammar.ts và vocabulary.ts)
 * Đảm bảo hệ thống bắt chính xác 100% nội dung bài được chọn kể cả khi có thêm bài mới.
 */
export function getDynamicLessonOutline(bai: number | string): DynamicLessonOutline {
  const baiStr = String(bai);
  const baiNum = Number(bai);

  // 1. Trích xuất ngữ pháp chi tiết từ grammar.ts
  const gLesson = grammar.find((l) => l.id === baiStr);
  let grammarText = "";
  if (gLesson) {
    const pointsText = gLesson.points
      .map(
        (p) =>
          `* ${p.structure_jp} (${p.structure_vi}): ${p.formula}. Lưu ý: ${p.note || p.explanation}. Ví dụ: ${p.examples.map((ex) => ex.jp).join(" / ")}`,
      )
      .join("\n");
    grammarText = `${gLesson.title} - ${gLesson.description}\n${pointsText}`;
  } else if (LESSON_OUTLINES[baiNum]?.grammar) {
    grammarText = LESSON_OUTLINES[baiNum].grammar;
  }

  // 2. Trích xuất từ vựng từ vocabulary.ts
  const words = vocabulary.filter(
    (w) => w.lesson && (w.lesson.includes(`Bài ${baiStr}`) || w.lesson.includes(`第${baiStr}課`)),
  );
  let vocabText = "";
  if (words.length > 0) {
    vocabText = words
      .map((w) => `${w.word} (${w.reading}: ${w.meaning})`)
      .slice(0, 50)
      .join(", ");
  }
  if (LESSON_OUTLINES[baiNum]?.vocab) {
    vocabText = vocabText
      ? `${LESSON_OUTLINES[baiNum].vocab}; Các từ bổ sung: ${vocabText}`
      : LESSON_OUTLINES[baiNum].vocab;
  }

  // 3. Trích xuất chữ Hán (Kanji) từ từ vựng và câu ví dụ ngữ pháp
  const kanjiSet = new Set<string>();
  if (LESSON_OUTLINES[baiNum]?.kanji) {
    for (const char of LESSON_OUTLINES[baiNum].kanji.split(/[,\s]+/)) {
      if (char.trim()) kanjiSet.add(char.trim());
    }
  }
  for (const w of words) {
    for (const char of w.word) {
      if (/[一-龯]/.test(char)) kanjiSet.add(char);
    }
  }
  if (gLesson) {
    for (const p of gLesson.points) {
      for (const ex of p.examples) {
        for (const char of ex.jp) {
          if (/[一-龯]/.test(char)) kanjiSet.add(char);
        }
      }
    }
  }
  const kanjiText = [...kanjiSet].slice(0, 45).join(", ");

  return {
    kanji: kanjiText || LESSON_OUTLINES[baiNum]?.kanji || "Chữ Hán thuộc phạm vi bài học",
    vocab: vocabText || LESSON_OUTLINES[baiNum]?.vocab || "Từ vựng thuộc phạm vi bài học",
    grammar: grammarText || LESSON_OUTLINES[baiNum]?.grammar || "Ngữ pháp thuộc phạm vi bài học",
  };
}

/**
 * Tạo Dynamic Prompt dựa chính xác theo các bài được chọn
 */
export function buildAiPrompt(selectedBai?: string[]): {
  systemPrompt: string;
  userPrompt: string;
  allowedBai: number[];
} {
  const allowedBai =
    selectedBai && selectedBai.length > 0
      ? selectedBai.map(Number).filter((n) => !isNaN(n) && n >= 1)
      : [4, 5, 6, 7];

  const lessonNames = allowedBai.map((b) => `Bài ${b}`).join(", ");

  let lessonScopeText = "";
  for (const b of allowedBai) {
    const info = getDynamicLessonOutline(b);
    lessonScopeText += `
--- NỘI DUNG BÀI ${b} ---
+ Chữ Hán (Kanji): ${info.kanji}
+ Từ vựng: ${info.vocab}
+ Ngữ pháp: ${info.grammar}
`;
  }

  let negativeConstraints = "";
  if (!allowedBai.includes(1)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về ngữ pháp/từ vựng riêng của Bài 1 (Câu danh từ N1 は N2 です/じゃありません, quốc tịch, nghề nghiệp cơ bản).\n";
  }
  if (!allowedBai.includes(2)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về ngữ pháp/từ vựng riêng của Bài 2 (Chỉ định từ これ, それ, あれ, どこ, どちら, 何階, いくら, をください).\n";
  }
  if (!allowedBai.includes(3)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về ngữ pháp/từ vựng riêng của Bài 3 (Thời gian に, đích đến へ行きます, nơi làm việc で, から〜まで).\n";
  }
  if (!allowedBai.includes(4)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về tính từ chia quá khứ (〜かった, 〜でした), phó từ (ぜんぜん, あまり), liên từ (しかし, そして), hoặc khoảng cách (どのくらい) của Bài 4.\n";
  }
  if (!allowedBai.includes(5)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về mong muốn (ほしい, たい), mục đích di chuyển (〜に行きます), quá khứ (ました, ませんでした), hoặc giải thích lý do (どうして, 〜から) của Bài 5.\n";
  }
  if (!allowedBai.includes(6)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi nào về So sánh (より, ほど, どちら, 一番), Rủ rê & Từ chối khéo (〜はちょっと…, やくそくがありますから), Nơi diễn ra sự kiện (Địa điểm で Sự kiện があります), hay Đếm vật mỏng (枚 - まい) của Bài 6.\n";
  }
  if (!allowedBai.includes(7)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi nào về Thể て (chia 3 nhóm, Vてください, Vています, Vましょうか, Cách làm 〜かた), sự tồn tại người/động vật (N1 に N2 がいます), hay dụng cụ ăn uống của Bài 7.\n";
  }

  const entropySeed = Math.random().toString(36).slice(2, 8).toUpperCase();

  const systemPrompt = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn đề thi môn JPD123 (Tiếng Nhật 2).
Nhiệm vụ: Tạo một đề thi trắc nghiệm A-D gồm đúng 30 câu chuẩn cấu trúc đề thi kết thúc môn (Final Exam) JPD123 FPT.
Mã phiên đề thi ngẫu nhiên: #${entropySeed}.

QUY TẮC BẮT BUỘC VỀ PHẠM VI BÀI HỌC (CRITICAL CONSTRAINT - TUÂN THỦ 100%):
- Người dùng CHỈ YÊU CẦU KIỂM TRA CÁC BÀI: [${lessonNames}].
- 100% CẢ 30 CÂU HỎI (10 Kanji + 10 Từ vựng + 10 Ngữ pháp) BẮT BUỘC PHẢI THUỘC VỀ CÁC BÀI ĐÃ CHỌN TRÊN.
- TUYỆT ĐỐI NGHIÊM CẤM đưa vào bất kỳ câu hỏi, từ vựng hay cấu trúc ngữ pháp nào của các bài KHÔNG ĐƯỢC CHỌN:
${negativeConstraints}
- Tất cả 30 câu hỏi phải hoàn toàn khác biệt nhau, KHÔNG ĐƯỢC TRÙNG LẶP bất kỳ câu văn nào.

YÊU CẦU VỀ ĐỘ ĐA DẠNG CAO (HIGH DIVERSITY & REAL-WORLD CONTEXTS):
- Đa dạng hóa ngữ cảnh thực tế: trường học, siêu thị, mua sắm, du lịch, ga tàu điện, công sở, cuộc sống gia đình, ẩm thực, hẹn hò, thời tiết, sở thích.
- Đa dạng hóa các dạng câu hỏi:
  + Kanji (10 câu): Chọn cách đọc Hiragana đúng, Chọn chữ Hán đúng từ Hiragana, Âm Hán Việt hoặc phân tích bộ chữ.
  + Từ vựng (10 câu): Điền từ ngữ cảnh, Từ trái nghĩa/đồng nghĩa, Lượng từ số đếm, Phản xạ đối thoại hội thoại A-B.
  + Ngữ pháp (10 câu): Điền trợ từ chính xác, Chia dạng động từ/tính từ đúng thể, Chọn câu đúng ngữ pháp, Hoàn thành câu theo ý nghĩa tiếng Việt.
- Sắp xếp thứ tự câu hỏi ngẫu nhiên đan xen giữa Kanji, Từ vựng và Ngữ pháp để tăng tính hấp dẫn khi làm bài (không dồn 10 câu Kanji lên đầu).

PHẠM VI NỘI DUNG ĐƯỢC PHÉP SỬ DỤNG TRONG ĐỀ THI:
${lessonScopeText}

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Chỉ trả về duy nhất một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json, không có chú thích bên ngoài) là một mảng 30 đối tượng với định dạng:
[
  {
    "id": "1",
    "section": "Kanji" | "Từ vựng" | "Ngữ pháp",
    "promptJp": "Chỉ dẫn bằng tiếng Nhật",
    "prompt": "Chỉ dẫn bằng tiếng Việt",
    "sentence": "Câu tiếng Nhật ngữ cảnh",
    "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
    "answer": "Đáp án đúng (phải trùng khớp chính xác 100% với 1 trong 4 lựa chọn trong options)",
    "explanation": {
      "meaning": "Dịch nghĩa câu tiếng Nhật sang tiếng Việt",
      "grammar": "Cấu trúc ngữ pháp áp dụng",
      "lesson": "Thuộc bài nào (Ví dụ: JPD123 - Bài 4 hoặc JPD123 - Bài 5)",
      "tips": "Mẹo giải nhanh hoặc dấu hiệu nhận biết từ khóa",
      "reason": "Lý do chọn đáp án này và giải thích vì sao các đáp án khác sai"
    }
  }
]
Chú ý:
- Mỗi câu phải có chính xác 4 options phân biệt, không được trùng lặp đáp án.
- Đáp án answer phải chính xác, không nhầm lẫn.
- Đảm bảo 100% các câu hỏi đều nằm trong phạm vi: ${lessonNames}.`;

  const userPrompt = `Hãy tạo trọn bộ 30 câu hỏi trắc nghiệm JPD123 Đại học FPT cho các bài: ${lessonNames} (Mã phiên #${entropySeed}).
BẮT BUỘC:
1. 100% nội dung (10 Kanji, 10 Từ vựng, 10 Ngữ pháp) CHỈ LẤY TRONG ${lessonNames}.
2. Đa dạng hóa tối đa ngữ cảnh câu hỏi và thứ tự câu hỏi. Không trùng lặp câu hỏi.
3. Xuất ra duy nhất JSON mảng 30 đối tượng.`;

  return { systemPrompt, userPrompt, allowedBai };
}

/**
 * Kiểm tra xem một câu hỏi từ AI có tuân thủ đúng danh sách bài học được chọn hay không
 */
function isQuestionAllowedForLessons(q: ExamQuestion, allowedBai: number[]): boolean {
  // 1. Kiểm tra lesson trong explanation nếu có
  if (q.explanation?.lesson) {
    if (
      q.explanation.lesson.includes("đến") ||
      q.explanation.lesson.includes("4 đến 7") ||
      q.explanation.lesson.includes("4-7")
    ) {
      return false;
    }
    for (let b = 1; b <= 10; b++) {
      if (!allowedBai.includes(b) && q.explanation.lesson.includes(`Bài ${b}`)) {
        return false;
      }
    }
  }

  // 2. Nếu Bài 1 không được chọn
  if (!allowedBai.includes(1)) {
    if (q.prompt.includes("Bài 1")) return false;
  }

  // 3. Nếu Bài 2 không được chọn
  if (!allowedBai.includes(2)) {
    if (q.sentence.includes("何階") || q.sentence.includes("いくらですか") || q.prompt.includes("Bài 2")) {
      return false;
    }
  }

  // 4. Nếu Bài 3 không được chọn
  if (!allowedBai.includes(3)) {
    if (q.sentence.includes("へ行きます") || q.prompt.includes("Bài 3")) {
      return false;
    }
  }

  // 5. Nếu Bài 4 không được chọn: loại bỏ từ ngữ và ngữ pháp đặc thù Bài 4
  if (!allowedBai.includes(4)) {
    if (
      q.sentence.includes("どのくらい") ||
      q.sentence.includes("そして") ||
      q.sentence.includes("しかし") ||
      q.sentence.includes("ぜんぜん") ||
      q.sentence.includes("暑いですが") ||
      q.sentence.includes("おいしかった") ||
      q.sentence.includes("静かでした") ||
      q.prompt.includes("Bài 4")
    ) {
      return false;
    }
  }

  // 6. Nếu Bài 5 không được chọn: loại bỏ cấu trúc mong muốn và mục đích Bài 5
  if (!allowedBai.includes(5)) {
    if (
      q.sentence.includes("ほしい") ||
      q.sentence.includes("たいです") ||
      q.sentence.includes("買いに行きます") ||
      q.sentence.includes("見に行きます") ||
      q.sentence.includes("どうして") ||
      q.prompt.includes("Bài 5")
    ) {
      return false;
    }
  }

  // 7. Nếu Bài 6 không được chọn: loại bỏ từ khóa so sánh, rủ rê/từ chối khéo, sự kiện, đếm vật mỏng
  if (!allowedBai.includes(6)) {
    if (
      q.sentence.includes("より") ||
      q.sentence.includes("ほど") ||
      q.sentence.includes("どちらが") ||
      q.sentence.includes("どちら") ||
      q.sentence.includes("いちばん") ||
      q.sentence.includes("一番") ||
      q.sentence.includes("ちょっと…") ||
      q.sentence.includes("ちょっと") ||
      q.sentence.includes("やくそくがあります") ||
      q.sentence.includes("約束があります") ||
      q.sentence.includes("お祭りがあります") ||
      q.sentence.includes("まいあります") ||
      q.sentence.includes("枚あります") ||
      q.sentence.includes("2枚") ||
      q.sentence.includes("1枚") ||
      q.sentence.includes("3枚") ||
      q.sentence.includes("枚") ||
      q.prompt.includes("So sánh") ||
      q.prompt.includes("so sánh") ||
      q.prompt.includes("từ chối khéo") ||
      q.prompt.includes("vật mỏng") ||
      q.prompt.includes("Bài 6")
    ) {
      return false;
    }
  }

  // 8. Nếu Bài 7 không được chọn: loại bỏ thể て, chia động từ, tiếp diễn và dụng cụ ăn uống
  if (!allowedBai.includes(7)) {
    if (
      q.sentence.includes("てください") ||
      q.sentence.includes("ています") ||
      q.sentence.includes("ていません") ||
      q.sentence.includes("てはいけません") ||
      q.sentence.includes("てもいいです") ||
      q.sentence.includes("ましょうか") ||
      q.sentence.includes("スプーン") ||
      q.sentence.includes("フォーク") ||
      q.sentence.includes("ナイフ") ||
      q.sentence.includes("電子レンジ") ||
      q.sentence.includes("お箸") ||
      q.sentence.includes("読み方") ||
      q.sentence.includes("使い方") ||
      q.sentence.includes("作り方") ||
      q.sentence.includes("行き方") ||
      q.sentence.includes("持ち方") ||
      q.prompt.includes("thể て") ||
      q.prompt.includes("Thể て") ||
      q.prompt.includes("tiếp diễn") ||
      q.prompt.includes("Bài 7")
    ) {
      return false;
    }
  }

  // 9. Nếu chỉ chọn duy nhất 1 bài: đảm bảo câu hỏi khớp 100% phạm vi bài đó
  if (allowedBai.length === 1) {
    const singleBai = allowedBai[0];
    if (singleBai === 6) {
      const isBai6Kanji = /[雨町春夏秋冬雪風海山川天気旅空港魚肉菜枚約束祭]/.test(q.sentence + q.answer);
      const isBai6GrammarOrVocab =
        q.sentence.includes("より") ||
        q.sentence.includes("ほど") ||
        q.sentence.includes("どちら") ||
        q.sentence.includes("いちばん") ||
        q.sentence.includes("一番") ||
        q.sentence.includes("ちょっと") ||
        q.sentence.includes("やくそく") ||
        q.sentence.includes("約束") ||
        q.sentence.includes("用事") ||
        q.sentence.includes("お祭り") ||
        q.sentence.includes("まつり") ||
        q.sentence.includes("パーティー") ||
        q.sentence.includes("コンサート") ||
        q.sentence.includes("まい") ||
        q.sentence.includes("枚") ||
        q.sentence.includes("季節") ||
        q.sentence.includes("春") ||
        q.sentence.includes("夏") ||
        q.sentence.includes("秋") ||
        q.sentence.includes("冬") ||
        q.sentence.includes("雪") ||
        q.sentence.includes("雨") ||
        q.sentence.includes("チケット") ||
        q.sentence.includes("CD") ||
        q.sentence.includes("シャツ") ||
        q.prompt.includes("so sánh") ||
        q.prompt.includes("So sánh") ||
        q.prompt.includes("từ chối") ||
        q.prompt.includes("rủ rê") ||
        q.prompt.includes("sự kiện") ||
        q.prompt.includes("lượng từ");

      if (!isBai6Kanji && !isBai6GrammarOrVocab) {
        return false;
      }
    } else if (singleBai === 7) {
      const isBai7Kanji = /[肉料理野半大小病院電気開閉待書読話泳行来]/.test(q.sentence + q.answer);
      const isBai7GrammarOrVocab =
        q.sentence.includes("て") ||
        q.sentence.includes("てください") ||
        q.sentence.includes("ています") ||
        q.sentence.includes("ていません") ||
        q.sentence.includes("ましょうか") ||
        q.sentence.includes("方") ||
        q.sentence.includes("かた") ||
        q.sentence.includes("います") ||
        q.sentence.includes("スプーン") ||
        q.sentence.includes("フォーク") ||
        q.sentence.includes("ナイフ") ||
        q.sentence.includes("はし") ||
        q.sentence.includes("コップ") ||
        q.sentence.includes("お皿") ||
        q.sentence.includes("冷蔵庫") ||
        q.sentence.includes("電子レンジ") ||
        q.sentence.includes("砂糖") ||
        q.sentence.includes("塩") ||
        q.sentence.includes("醤油") ||
        q.prompt.includes("て形") ||
        q.prompt.includes("thể て") ||
        q.prompt.includes("Thể て") ||
        q.prompt.includes("tiếp diễn") ||
        q.prompt.includes("cách làm") ||
        q.prompt.includes("đề nghị") ||
        q.prompt.includes("yêu cầu");

      if (!isBai7Kanji && !isBai7GrammarOrVocab) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gọi AI LLM trực tiếp hoặc fallback sang bộ Engine JPD123 FPT
 */
export async function generateFptAiExam(selectedBai?: string[]): Promise<{
  questions: ExamQuestion[];
  isRealAi: boolean;
  provider: string;
  error?: string;
}> {
  const settings = getAiSettings();
  const { systemPrompt, userPrompt, allowedBai } = buildAiPrompt(selectedBai);

  // 1. Chế độ Built-in High Diversity (hoặc khi chưa nhập key)
  if (settings.provider === "built-in" || !settings.apiKey.trim()) {
    const questions = buildFptJpd123Exam(selectedBai);
    return {
      questions,
      isRealAi: false,
      provider: "AI Engine (FPT JPD123 Form)",
    };
  }

  // 2. Chế độ gọi API LLM thực tế
  try {
    let rawText = "";

    if (settings.provider === "gemini") {
      const model = settings.model || "gemini-1.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\n${userPrompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        },
      );
      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } else if (settings.provider === "xai") {
      const model = settings.model || "grok-4.5";
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        throw new Error(`xAI API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content ?? "";
    } else if (settings.provider === "openai" || settings.provider === "groq") {
      const endpoint =
        settings.provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const model =
        settings.model || (settings.provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        throw new Error(`${settings.provider} API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content ?? "";
    }

    // Làm sạch và phân tích chuỗi JSON trả về
    const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      // Có thể model bọc trong { "questions": [...] }
      const match = cleanedJson.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "questions" in parsed && Array.isArray((parsed as Record<string, unknown>).questions)
        ? (parsed as Record<string, unknown>).questions
        : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Không nhận diện được danh sách câu hỏi hợp lệ từ AI.");
    }

    // Validate và chuẩn hóa danh sách câu hỏi
    const validQuestions: ExamQuestion[] = [];
    const seenSentences = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const raw = items[i];
      if (
        raw &&
        typeof raw === "object" &&
        typeof raw.prompt === "string" &&
        typeof raw.sentence === "string" &&
        typeof raw.answer === "string" &&
        Array.isArray(raw.options) &&
        raw.options.length === 4 &&
        raw.options.includes(raw.answer)
      ) {
        const expRaw =
          "explanation" in raw && typeof raw.explanation === "object" && raw.explanation !== null
            ? (raw.explanation as Record<string, unknown>)
            : null;

        const rawLesson = expRaw && expRaw.lesson ? String(expRaw.lesson) : undefined;
        const cleanedLesson =
          rawLesson &&
          (rawLesson.includes("đến") || rawLesson.includes("4 đến 7") || rawLesson.includes("4-7"))
            ? undefined
            : rawLesson;

        const explanation = expRaw
          ? {
              meaning: String(expRaw.meaning || ""),
              grammar: expRaw.grammar ? String(expRaw.grammar) : undefined,
              lesson: cleanedLesson,
              tips: expRaw.tips ? String(expRaw.tips) : undefined,
              reason: String(expRaw.reason || ""),
            }
          : undefined;

        const candidate: ExamQuestion = {
          id: String(validQuestions.length + 1),
          section:
            raw.section === "Kanji" || raw.section === "Ngữ pháp" ? raw.section : "Từ vựng",
          promptJp: raw.promptJp || "適切なものを選びなさい。",
          prompt: raw.prompt,
          sentence: raw.sentence,
          options: raw.options,
          answer: raw.answer,
          explanation,
        };

        // Kiểm tra xem câu hỏi có nằm đúng các bài được chọn hay không và không trùng câu
        if (
          isQuestionAllowedForLessons(candidate, allowedBai) &&
          !seenSentences.has(candidate.sentence)
        ) {
          seenSentences.add(candidate.sentence);
          validQuestions.push(candidate);
        }
      }
    }

    if (validQuestions.length < 15) {
      throw new Error("Số câu hỏi hợp lệ tạo bởi AI chưa đạt chuẩn (< 15 câu).");
    }

    // Nếu AI sinh thiếu hoặc một số câu bị loại để tròn 30 câu, bù từ FPT engine (vốn đã được giới hạn đúng bài)
    if (validQuestions.length < 30) {
      const backup = buildFptJpd123Exam(selectedBai);
      for (const b of backup) {
        if (validQuestions.length >= 30) break;
        if (!seenSentences.has(b.sentence)) {
          seenSentences.add(b.sentence);
          validQuestions.push({
            ...b,
            id: String(validQuestions.length + 1),
          });
        }
      }
    }

    const randomizedQuestions = shuffle(validQuestions.slice(0, 30)).map((q, idx) => ({
      ...q,
      id: String(idx + 1),
    }));

    return {
      questions: randomizedQuestions,
      isRealAi: true,
      provider: `${settings.provider.toUpperCase()} (${settings.model || "Default"})`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[AI Exam Generator] Error calling LLM, fallback to Built-in Engine:", message);
    const fallback = buildFptJpd123Exam(selectedBai);
    return {
      questions: fallback,
      isRealAi: false,
      provider: "AI Engine (FPT Fallback)",
      error: `Không thể kết nối AI (${message}). Hệ thống đã tự động kích hoạt bộ đề thi chuẩn JPD123 FPT thay thế.`,
    };
  }
}
