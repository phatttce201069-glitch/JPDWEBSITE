import { getAiSettings } from "./ai-service.ts";
import {
  generateSpeakingExam,
  buildDynamicSpeakingExam,
} from "./speaking-engine.ts";
import type {
  SpeakingCourse,
  SpeakingExam,
  SpeakingQuestion,
  SpeakingScene,
} from "./speaking-types.ts";
import { saveSpeakingExam } from "./speaking-storage.ts";
import { toKana } from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";

/**
 * Xây dựng prompt cho AI tạo đề thi nói FPT (1 bức tranh + 4-5 câu hỏi trong tranh + 2 câu hỏi ngoài tranh)
 */
export function buildSpeakingAiPrompt(course: SpeakingCourse): {
  systemPrompt: string;
  userPrompt: string;
} {
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];
  const entropy = Math.random().toString(36).slice(2, 8).toUpperCase();

  const rulesText =
    course === "JPD113"
      ? `- PHẠM VI NGỮ PHÁP & TỪ VỰNG: CHỈ DÙNG 100% kiến thức Bài 1, 2, 3 (Câu danh từ N1 は N2 です/じゃありません/ですか/も/の/と; chỉ định từ これ・それ・あれ・どれ・ここ・そこ・あそこ・どこ; hỏi giá tiền いくら; thời gian 〜時〜分; ngày tháng thứ; động từ sơ cấp 行きます・来ます・帰ります・食べます・飲みます・勉強します).
- CẤM TUYỆT ĐỐI: Không dùng thể て (chưa học), không dùng thể từ điển Vる, không dùng mệnh đề định ngữ Vる/Vている N, không dùng từ ngoài Bài 1-3.
- CHỮ HÁN: Chỉ dùng 34 chữ Hán của Bài 1-3. Bất kỳ chữ nào ngoài danh sách phải viết bằng Hiragana.`
      : `- PHẠM VI NGỮ PHÁP & TỪ VỰNG: CHỈ DÙNG 100% kiến thức Bài 4, 5, 6, 7 giáo trình FPT:
  + Bài 4: Tính từ đuôi い / な và cách chia quá khứ / phủ định; nối tính từ; thời gian di chuyển 〜から〜まで どのくらい.
  + Bài 5: Mong muốn Vたいです / N が ほしいです; mục đích di chuyển V/N に 行きます/来ます; lý do 〜から.
  + Bài 6: So sánh hơn A は B より, so sánh lựa chọn A と B と どちらが, so sánh nhất A の中で何がいちばん; rủ rê Vませんか / Vましょう; lượng từ đếm vật mỏng 枚, xe cộ 台.
  + Bài 7: Thể て (chia thể て, nối hành động, tiếp diễn Vています, cách làm Vかた). Chỉ dùng 23 động từ chuẩn Bài 7.
- CẤM TUYỆT ĐỐI CÁC CẤU TRÚC NGOÀI BÀI 4-7:
  + CẤM dùng 『〜たり〜たり』(Bài 19) -> dùng 『〜ます。そして、〜ます』hoặc 『〜て、〜ます』.
  + CẤM dùng 『〜ながら』(Bài 28).
  + CẤM dùng 『〜てあります』(Bài 30) -> dùng 『〜が あります』.
  + CẤM dùng mệnh đề định ngữ 『Vる / Vている + Danh từ』(Bài 22, ví dụ: 走っている男性, 飲んでいる人) trong câu hỏi. Dùng 『男の人/あの人は いま 何を していますか』.
  + CẤM dùng cấu trúc N3 như 『〜として』, 『〜と比べて』.
  + CẤM dùng từ vựng lạ ngoài bài như 『新鮮な』, 『ソフトウェア』, 『挑戦』.
- CHỮ HÁN: Chỉ dùng 77 chữ Hán của Bài 1-7. Chữ Hán chưa học bắt buộc viết bằng Hiragana.
- TỪ VỰNG KATAKANA: Ưu tiên từ mượn trong bài (レストラン, カレー, ラーメン, ジュース, コーヒー, パソコン, アニメ...).`;

  const systemPrompt = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn ĐỀ THI NÓI (口頭試験 - Speaking Oral Exam) môn ${course} (Tiếng Nhật ${course === "JPD113" ? "1" : "2"}).
Nhiệm vụ: Tạo một đề thi nói hoàn chỉnh gồm:
1. MÔ TẢ MỘT BỨC TRANH SINH ĐỘNG (Scene) tại trường học FPT, ký túc xá, nhà ăn, siêu thị, công viên, nhà hàng Nhật, hoặc du lịch.
2. ĐÚNG 4 ĐẾN 5 CÂU HỎI VỀ BỨC TRANH (type: "in_picture") hỏi về các nhân vật, đồ vật, vị trí, giá tiền, số lượng hoặc hành động (Vています).
3. ĐÚNG 2 CÂU HỎI MỞ RỘNG NGOÀI TRANH (type: "extension") phỏng vấn tự do liên hệ thực tế bản thân học viên dựa trên ngữ pháp của bài học.
Mỗi câu hỏi BẮT BUỘC có 2 BẢN TRẢ LỜI:
1. BẢN CHUẨN (Chuẩn chỉnh & đầy đủ, lịch sự です・ます):
- sampleAnswerJp (câu trả lời mẫu tiếng Nhật chuẩn, lịch sự です・ます)
- sampleAnswerRomaji (Romaji câu trả lời mẫu)
- sampleAnswerVi (dịch nghĩa câu trả lời mẫu)
2. BẢN NGẮN GỌN (Dành cho người học yếu nhưng vẫn muốn học phản xạ đúng ngữ pháp & từ vựng trong bài, câu ngắn, dễ nhớ, không dùng từ ngoài bài):
- shortAnswerJp (câu trả lời ngắn gọn, chuẩn ngữ pháp bài học)
- shortAnswerRomaji (Romaji câu ngắn gọn)
- shortAnswerVi (dịch nghĩa câu ngắn gọn)

Kèm theo:
- questionJp (tiếng Nhật)
- questionRomaji (phiên âm Romaji)
- questionVi (dịch nghĩa tiếng Việt)
- grammarPoint (tên ngữ pháp áp dụng)
- answerGuide (hướng dẫn cách trả lời hoặc các biến thể)

Mã phiên ngẫu nhiên: #${entropy}.

QUY TẮC BẮT BUỘC (CRITICAL):
${rulesText}

ĐỊNH DẠNG ĐẦU RA:
Chỉ xuất ra duy nhất JSON (không kèm markdown \`\`\`json) theo cấu trúc:
{
  "id": "ai-sp-${course.toLowerCase()}-${entropy}",
  "course": "${course}",
  "title": "Tiêu đề tiếng Nhật",
  "titleVi": "Tiêu đề tiếng Việt",
  "scene": {
    "id": "scene-ai-${entropy}",
    "type": "classroom" | "station" | "cafeteria" | "convenience_store" | "fpt_campus" | "restaurant" | "dormitory" | "park" | "asakusa" | "supermarket" | "cafe",
    "title": "Tên bối cảnh tiếng Nhật",
    "titleVi": "Tên bối cảnh tiếng Việt",
    "location": "Địa điểm cụ thể",
    "description": "Mô tả chi tiết những gì nhìn thấy trong tranh bằng tiếng Việt",
    "descriptionJp": "Mô tả bằng tiếng Nhật",
    "hotspots": [
      { "id": "hs-1", "labelJp": "Nhãn Nhật 1", "labelVi": "Nhãn Việt 1", "xPercent": 30, "yPercent": 40 },
      { "id": "hs-2", "labelJp": "Nhãn Nhật 2", "labelVi": "Nhãn Việt 2", "xPercent": 70, "yPercent": 50 }
    ]
  },
  "pictureQuestions": [
    {
      "id": "pq1",
      "type": "in_picture",
      "order": 1,
      "questionJp": "...",
      "questionRomaji": "...",
      "questionVi": "...",
      "grammarPoint": "...",
      "sampleAnswerJp": "...",
      "sampleAnswerRomaji": "...",
      "sampleAnswerVi": "...",
      "shortAnswerJp": "...",
      "shortAnswerRomaji": "...",
      "shortAnswerVi": "...",
      "answerGuide": "..."
    }
  ],
  "extensionQuestions": [
    {
      "id": "eq1",
      "type": "extension",
      "order": 5,
      "questionJp": "...",
      "questionRomaji": "...",
      "questionVi": "...",
      "grammarPoint": "...",
      "sampleAnswerJp": "...",
      "sampleAnswerRomaji": "...",
      "sampleAnswerVi": "...",
      "shortAnswerJp": "...",
      "shortAnswerRomaji": "...",
      "shortAnswerVi": "...",
      "answerGuide": "..."
    }
  ]
}`;

  const userPrompt = `Hãy tạo một đề thi nói mới hoàn chỉnh môn ${course} Đại học FPT (Mã #${entropy}).
Lưu ý:
- Đúng 4 đến 5 câu hỏi trong tranh + 2 câu hỏi mở rộng ngoài tranh.
- 100% bám sát từ vựng và ngữ pháp của ${course === "JPD113" ? "Bài 1 đến 3" : "Bài 4 đến 7"}.
- Xuất ra JSON hợp lệ.`;

  return { systemPrompt, userPrompt };
}

/**
 * Gọi AI sinh một đề thi nói mới hoặc tự động fallback sang Engine FPT đa dạng
 */
export async function generateAiSpeakingExam(course: SpeakingCourse): Promise<{
  exam: SpeakingExam;
  isRealAi: boolean;
  provider: string;
  error?: string;
}> {
  const settings = getAiSettings();

  // 1. Chế độ Engine FPT tích hợp (Built-in)
  if (settings.provider === "built-in" || !settings.apiKey.trim()) {
    const exam = buildDynamicSpeakingExam(course);
    saveSpeakingExam(exam);
    return {
      exam,
      isRealAi: true,
      provider: "Sumi FPT Speaking Dynamic Engine (Tích hợp)",
    };
  }

  // 2. Chế độ AI trực tuyến (Gemini, Grok, OpenAI, Groq)
  try {
    const { systemPrompt, userPrompt } = buildSpeakingAiPrompt(course);
    let rawText = "";

    if (settings.provider === "gemini") {
      const model = settings.model || "gemini-2.0-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
          }),
        },
      );
      if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } else {
      const endpoint =
        settings.provider === "xai"
          ? "https://api.x.ai/v1/chat/completions"
          : settings.provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const model =
        settings.model ||
        (settings.provider === "xai"
          ? "grok-4.5"
          : settings.provider === "groq"
          ? "llama-3.3-70b-versatile"
          : "gpt-4o-mini");

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
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        }),
      });
      if (!res.ok) throw new Error(`${settings.provider} error: ${res.statusText}`);
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content ?? "";
    }

    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned) as SpeakingExam;

    if (
      !parsed ||
      !parsed.scene ||
      !Array.isArray(parsed.pictureQuestions) ||
      parsed.pictureQuestions.length < 3
    ) {
      throw new Error("Dữ liệu đề thi nói trả về từ AI không đúng cấu trúc.");
    }

    // Đảm bảo có romaji cho câu hỏi và câu trả lời (cả bản chuẩn và bản ngắn gọn)
    const ensureQuestionRomaji = (
      q: Partial<Omit<SpeakingQuestion, "type">> & { type?: string },
      idx: number,
      type: "in_picture" | "extension",
    ): SpeakingQuestion => {
      const sampleAnswerJp = q.sampleAnswerJp || "";
      const shortAnswerJp = q.shortAnswerJp || sampleAnswerJp;
      return {
        id: q.id || `q-${type}-${idx + 1}-${Date.now()}`,
        type,
        order: q.order || idx + 1,
        questionJp: q.questionJp || "",
        questionRomaji: q.questionRomaji || toRomaji(toKana(q.questionJp || "")),
        questionVi: q.questionVi || "",
        grammarPoint: q.grammarPoint,
        sampleAnswerJp,
        sampleAnswerRomaji: q.sampleAnswerRomaji || toRomaji(toKana(sampleAnswerJp)),
        sampleAnswerVi: q.sampleAnswerVi || "",
        shortAnswerJp,
        shortAnswerRomaji: q.shortAnswerRomaji || toRomaji(toKana(shortAnswerJp)),
        shortAnswerVi: q.shortAnswerVi || q.sampleAnswerVi || "",
        answerGuide: q.answerGuide,
      };
    };

    const fullExam: SpeakingExam = {
      id: parsed.id || `ai-sp-${course.toLowerCase()}-${Date.now()}`,
      course,
      title: parsed.title || `${course} 口頭試験`,
      titleVi: parsed.titleVi || `Đề thi nói ${course} FPT`,
      createdAt: new Date().toISOString(),
      scene: {
        ...parsed.scene,
        id: parsed.scene.id || `scene-ai-${Date.now()}`,
        hotspots: Array.isArray(parsed.scene.hotspots) ? parsed.scene.hotspots : [],
        imageUrl: parsed.scene.imageUrl || `/images/scenes/${parsed.scene.type || "classroom"}.jpg`,
      },
      pictureQuestions: parsed.pictureQuestions.map((q, idx) =>
        ensureQuestionRomaji(q, idx, "in_picture"),
      ),
      extensionQuestions: (Array.isArray(parsed.extensionQuestions) && parsed.extensionQuestions.length >= 2
        ? parsed.extensionQuestions
        : [
            {
              id: "eq1",
              type: "extension",
              order: parsed.pictureQuestions.length + 1,
              questionJp: "あなたは 毎朝、何時に 起きますか。",
              questionRomaji: "Anata wa maiasa, nan-ji ni okimasu ka.",
              questionVi: "Mỗi sáng bạn thức dậy lúc mấy giờ?",
              grammarPoint: "Thời gian (Bài 3)",
              sampleAnswerJp: "午前六時半に 起きます。",
              sampleAnswerRomaji: "Gozen roku-ji-han ni okimasu.",
              sampleAnswerVi: "Tôi thức dậy lúc 6 giờ rưỡi sáng.",
              answerGuide: "Nêu mốc thời gian bạn thường thức dậy.",
            },
            {
              id: "eq2",
              type: "extension",
              order: parsed.pictureQuestions.length + 2,
              questionJp: "週末、何を するのが 好きですか。",
              questionRomaji: "Shuumatsu, nani o suru no ga suki desu ka.",
              questionVi: "Cuối tuần bạn thích làm việc gì?",
              grammarPoint: "Sở thích (Bài 5 & 6)",
              sampleAnswerJp: "友達と カフェで 話すのが 好きです。",
              sampleAnswerRomaji: "Tomodachi to kafe de hanasu no ga suki desu.",
              sampleAnswerVi: "Tôi thích trò chuyện cùng bạn bè ở quán cà phê.",
              answerGuide: "Nêu hoạt động bạn yêu thích vào cuối tuần.",
            },
          ]
      ).map((q, idx) => ensureQuestionRomaji(q, parsed.pictureQuestions.length + idx, "extension")),
      isAiGenerated: true,
      provider: `${settings.provider.toUpperCase()} (${settings.model || "Default"})`,
    };

    saveSpeakingExam(fullExam);

    return {
      exam: fullExam,
      isRealAi: true,
      provider: fullExam.provider || "AI Model",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Speaking AI] Error calling LLM, fallback to Engine:", message);
    const fallback = buildDynamicSpeakingExam(course);
    saveSpeakingExam(fallback);
    return {
      exam: fallback,
      isRealAi: false,
      provider: "Sumi FPT Speaking Dynamic Engine (Fallback)",
      error: `Không thể kết nối API AI (${message}). Đã tự động tạo đề thi nói chuẩn FPT đa dạng.`,
    };
  }
}
