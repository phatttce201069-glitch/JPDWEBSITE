import type { ExamQuestion } from "./exam";
import { buildFptJpd123Exam } from "./fpt-jpd123-engine";

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
 * Prompt chuẩn môn JPD123 Đại học FPT
 */
const SYSTEM_PROMPT = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn đề thi môn JPD123 (Tiếng Nhật 2: Minna no Nihongo / Marugoto Bài 4, Bài 5, Bài 6, Bài 7).
Nhiệm vụ: Tạo một đề thi trắc nghiệm A-D gồm đúng 30 câu chuẩn cấu trúc đề thi kết thúc môn (Final Exam) JPD123 FPT:
- 10 câu Chữ Hán (section: "Kanji"):
  + 4-5 câu đọc chữ Hán trong câu sang Hiragana (yêu cầu từ vựng bài 4-7: 料理, 映画, 暑い, 新しい, 広い, 狭い, 近い, 病院, 薬, 飲む, 食べる, 行く, 来る, 帰る, 本, 水, 雨...).
  + 3-4 câu chọn chữ Hán đúng từ Hiragana.
  + 1-2 câu âm Hán Việt hoặc ý nghĩa chữ Hán.
- 10 câu Từ vựng (section: "Từ vựng"):
  + 4-5 câu điền từ ngữ cảnh phù hợp: đồ vật trong nhà, dụng cụ ăn uống (スプーン, フォーク, ナイフ, はし, コップ, お皿, 冷蔵庫, 電子レンジ), gia vị (砂糖, 塩, 醤油), thời tiết, phương tiện.
  + 2-3 câu phó từ mức độ & thời gian: とても, あまり (+ phủ định), ぜんぜん (+ phủ định), すこし, もう (+ quá khứ), まだ (+ chưa làm), ぜひ (+ kudasai/tai).
  + 2-3 câu từ trái nghĩa hoặc hội thoại giao tiếp (A nói - B đáp).
- 10 câu Ngữ pháp (section: "Ngữ pháp"):
  + Tính từ đuôi い và な: quá khứ (〜かった / 〜でした), phủ định (〜くない / 〜じゃありません), phó từ hóa (〜く / 〜に).
  + Mong muốn & mục đích: N が ほしいです, V たいです, V/N に 行きます.
  + So sánh: A は B より Adj です, A と B と どちらが..., A のほうが..., N の中で A が いちばん..., A は B ほど...くない.
  + Thể て: Vてください, Vています, Cách làm V[bỏ ます]+かた (作り方, 使い方, 行き方, 読み方).
  + Trợ từ chuẩn xác: は, が, を, に, で, へ, と, から, まで, より, ほど.

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
    "answer": "Đáp án đúng (phải trùng khớp chính xác 100% với 1 trong 4 lựa chọn trong options)"
  }
]
Chú ý:
- Mỗi câu phải có chính xác 4 options phân biệt.
- Đáp án answer phải chính xác, không nhầm lẫn.`;

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
                    text: `${SYSTEM_PROMPT}\n\nHãy tạo đề thi môn JPD123 gồm các bài: ${(selectedBai ?? ["4", "5", "6", "7"]).join(", ")}.`,
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
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Hãy tạo đề thi môn JPD123 Đại học FPT gồm các bài: ${(selectedBai ?? ["4", "5", "6", "7"]).join(", ")}. Nhớ chỉ xuất JSON mảng 30 câu hỏi.`,
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
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Hãy tạo đề thi môn JPD123 Đại học FPT gồm các bài: ${(selectedBai ?? ["4", "5", "6", "7"]).join(", ")}. Nhớ chỉ xuất JSON mảng 30 câu hỏi.`,
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
        validQuestions.push({
          id: String(validQuestions.length + 1),
          section:
            raw.section === "Kanji" || raw.section === "Ngữ pháp" ? raw.section : "Từ vựng",
          promptJp: raw.promptJp || "適切なものを選びなさい。",
          prompt: raw.prompt,
          sentence: raw.sentence,
          options: raw.options,
          answer: raw.answer,
        });
      }
    }

    if (validQuestions.length < 15) {
      throw new Error("Số câu hỏi hợp lệ tạo bởi AI chưa đạt chuẩn (< 15 câu).");
    }

    // Nếu AI sinh thiếu một vài câu để tròn 30 câu, bù từ FPT engine
    if (validQuestions.length < 30) {
      const backup = buildFptJpd123Exam(selectedBai);
      for (const b of backup) {
        if (validQuestions.length >= 30) break;
        if (!validQuestions.some((v) => v.sentence === b.sentence)) {
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
