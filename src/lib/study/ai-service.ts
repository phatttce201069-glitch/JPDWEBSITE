import type { ExamQuestion } from "./exam.ts";
import { buildFptJpd123Exam } from "./fpt-jpd123-engine.ts";

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
    kanji: "今, 来, 帰, 会, 社, 聞, 読, 書, 話, 寺, 言, 具, 田, 力, 門",
    vocab: "Thời tiết & các mùa (春, 夏, 秋, 冬, 雨, 雪, 風, くもり, きり, 季節), so sánh & lựa chọn (どちら, ずっと)",
    grammar: "Cấu trúc so sánh hơn (A は B より Adj です), so sánh lựa chọn (A と B と どちらが...), trả lời so sánh (A のほうが...), so sánh nhất (N の中で A が いちばん...), so sánh không bằng (A は B ほど...くない)",
  },
  7: {
    kanji: "肉, 料, 理, 野, 半, 大, 小, 病, 院, 電, 気, 開, 閉",
    vocab: "Dụng cụ ăn uống (スプーン, フォーク, ナイフ, はし, コップ, お皿, 冷蔵庫, 電子レンジ), gia vị & nấu ăn (砂糖, 塩, 醤油, 肉, 野菜), phó từ (もう, まだ, ぜひ)",
    grammar: "Động từ thể て (Vてください - yêu cầu lịch sự, Vています - đang diễn ra), cách làm V[bỏ ます]+かた (作り方, 使い方, 読み方), trợ từ で (công cụ/phương tiện)",
  },
};

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
      ? selectedBai.map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 7)
      : [4, 5, 6, 7];

  const lessonNames = allowedBai.map((b) => `Bài ${b}`).join(", ");

  let lessonScopeText = "";
  for (const b of allowedBai) {
    const info = LESSON_OUTLINES[b];
    if (info) {
      lessonScopeText += `
--- NỘI DUNG BÀI ${b} ---
+ Chữ Hán (Kanji): ${info.kanji}
+ Từ vựng: ${info.vocab}
+ Ngữ pháp: ${info.grammar}
`;
    }
  }

  let negativeConstraints = "";
  if (!allowedBai.includes(6)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi hay cấu trúc so sánh nào của Bài 6 (như より, ほど, どちら, 一番).\n";
  }
  if (!allowedBai.includes(7)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi nào về Thể て (Vてください, Vています, Cách làm 〜かた) hay dụng cụ ăn uống (スプーン, フォーク, ナイフ, 電子レンジ) của Bài 7.\n";
  }
  if (!allowedBai.includes(4)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG lấy từ vựng hay kiến thức riêng của Bài 4.\n";
  }
  if (!allowedBai.includes(5)) {
    negativeConstraints += "  * TUYỆT ĐỐI KHÔNG lấy từ vựng hay kiến thức riêng của Bài 5.\n";
  }

  const systemPrompt = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn đề thi môn JPD123 (Tiếng Nhật 2).
Nhiệm vụ: Tạo một đề thi trắc nghiệm A-D gồm đúng 30 câu chuẩn cấu trúc đề thi kết thúc môn (Final Exam) JPD123 FPT.

QUY TẮC BẮT BUỘC VỀ PHẠM VI BÀI HỌC (CRITICAL CONSTRAINT - TUÂN THỦ 100%):
- Người dùng CHỈ YÊU CẦU KIỂM TRA CÁC BÀI: [${lessonNames}].
- 100% CẢ 30 CÂU HỎI (10 Kanji + 10 Từ vựng + 10 Ngữ pháp) BẮT BUỘC PHẢI THUỘC VỀ CÁC BÀI ĐÃ CHỌN TRÊN.
- TUYỆT ĐỐI NGHIÊM CẤM đưa vào bất kỳ câu hỏi, từ vựng hay cấu trúc ngữ pháp nào của các bài KHÔNG ĐƯỢC CHỌN:
${negativeConstraints}
- Tất cả 30 câu hỏi phải hoàn toàn khác biệt nhau, KHÔNG ĐƯỢC TRÙNG LẶP bất kỳ câu văn nào.

PHẠM VI NỘI DUNG ĐƯỢC PHÉP SỬ DỤNG TRONG ĐỀ THI:
${lessonScopeText}

CẤU TRÚC ĐỀ THI BẮT BUỘC (30 CÂU):
1. 10 câu Chữ Hán (section: "Kanji"):
   - Đọc chữ Hán trong câu sang Hiragana (dùng các chữ Hán của ${lessonNames}).
   - Chọn chữ Hán đúng từ Hiragana.
   - Âm Hán Việt hoặc ý nghĩa chữ Hán.
2. 10 câu Từ vựng (section: "Từ vựng"):
   - Điền từ ngữ cảnh phù hợp theo từ vựng của ${lessonNames}.
   - Từ trái nghĩa / tương đương theo từ vựng của ${lessonNames}.
   - Phó từ mức độ hoặc hội thoại giao tiếp A-B của ${lessonNames}.
3. 10 câu Ngữ pháp (section: "Ngữ pháp"):
   - Các cấu trúc ngữ pháp thuộc phạm vi ${lessonNames}.

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
- Mỗi câu phải có chính xác 4 options phân biệt.
- Đáp án answer phải chính xác, không nhầm lẫn.
- Đảm bảo 100% các câu hỏi đều nằm trong phạm vi: ${lessonNames}.`;

  const userPrompt = `Hãy tạo trọn bộ 30 câu hỏi trắc nghiệm JPD123 Đại học FPT cho các bài: ${lessonNames}.
BẮT BUỘC: 100% nội dung (10 Kanji, 10 Từ vựng, 10 Ngữ pháp) CHỈ LẤY TRONG ${lessonNames}. Không trùng lặp câu hỏi. Xuất ra JSON mảng 30 đối tượng.`;

  return { systemPrompt, userPrompt, allowedBai };
}

/**
 * Kiểm tra xem một câu hỏi từ AI có tuân thủ đúng danh sách bài học được chọn hay không
 */
function isQuestionAllowedForLessons(q: ExamQuestion, allowedBai: number[]): boolean {
  // 1. Kiểm tra lesson trong explanation nếu có
  if (q.explanation?.lesson) {
    for (let b = 1; b <= 7; b++) {
      if (!allowedBai.includes(b) && q.explanation.lesson.includes(`Bài ${b}`)) {
        return false;
      }
    }
  }

  // 2. Nếu Bài 6 không được chọn: loại bỏ từ khóa so sánh
  if (!allowedBai.includes(6)) {
    if (
      q.sentence.includes("より") ||
      q.sentence.includes("ほど") ||
      q.sentence.includes("どちらが") ||
      q.sentence.includes("いちばん") ||
      q.prompt.includes("So sánh") ||
      q.prompt.includes("so sánh")
    ) {
      return false;
    }
  }

  // 3. Nếu Bài 7 không được chọn: loại bỏ thể て và dụng cụ ăn uống
  if (!allowedBai.includes(7)) {
    if (
      q.sentence.includes("てください") ||
      q.sentence.includes("ています") ||
      q.sentence.includes("スプーン") ||
      q.sentence.includes("フォーク") ||
      q.sentence.includes("ナイフ") ||
      q.sentence.includes("電子レンジ") ||
      q.prompt.includes("thể て") ||
      q.prompt.includes("Thể て")
    ) {
      return false;
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

        const explanation = expRaw
          ? {
              meaning: String(expRaw.meaning || ""),
              grammar: expRaw.grammar ? String(expRaw.grammar) : undefined,
              lesson: expRaw.lesson ? String(expRaw.lesson) : undefined,
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

    return {
      questions: validQuestions.slice(0, 30).map((q, idx) => ({ ...q, id: String(idx + 1) })),
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
