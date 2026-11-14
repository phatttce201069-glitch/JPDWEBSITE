import { getAiSettings } from "./ai-service.ts";
import {
  generateReadingPassage,
  generateReadingExamSet,
  computePassageSetKanjiCoverage,
  sanitizeReadingPassageKanji,
} from "./reading-engine.ts";
import type { ReadingCourse, ReadingPassage, ReadingPassageSet } from "./reading-types.ts";
import { toKana } from "./kana-reading.ts";
import { toRomaji } from "./romaji.ts";

/**
 * Xây dựng AI Prompt chuyên biệt cho việc tạo đề thi đọc hiểu FPT
 */
export function buildReadingAiPrompt(course: ReadingCourse): {
  systemPrompt: string;
  userPrompt: string;
  allowedBai: number[];
} {
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];
  const entropySeed = Math.random().toString(36).slice(2, 8).toUpperCase();

  const lengthRule =
    course === "JPD113"
      ? "- ĐỘ DÀI: Ngắn gọn (khoảng 3 đến 5 câu, từ 80 đến 130 ký tự tiếng Nhật). Cấu trúc ngữ pháp sơ cấp (câu danh từ, chỉ định từ, địa điểm, thời gian)."
      : "- ĐỘ DÀI VÀ ĐỘ KHÓ: Dài hơn và thách thức hơn (khoảng 6 đến 9 câu, từ 200 đến 280 ký tự tiếng Nhật) đúng chuẩn cấu trúc bài thi đọc hiểu JPD123 tại Đại học FPT (câu ghép đa mệnh đề, so sánh hơn/chọn lựa, mong muốn たい, thể て nối hành động / てから, lý do から, từ chối khéo はちょっと…).";

  const katakanaRule =
    course === "JPD113"
      ? ""
      : "\n4. TỪ VỰNG KATAKANA CHUẨN GIÁO TRÌNH:\n   - Bắt buộc lồng ghép tự nhiên từ 4 đến 8 từ Katakana đã học (ví dụ: レストラン, ホテル, デパート, スーパー, コンビニ, バス, タクシー, パーティー, コンサート, カラオケ, ピザ, カレー, スープ, ハンバーグ, サラダ, パン, コーヒー, ジュース, スプーン, フォーク, ナイフ, Tシャツ, パソコン, カメラ, チケット, アニメ, ゲーム, アルバイト, テスト, ルームメイト).";

  const kanjiRule =
    course === "JPD113"
      ? "- CHỮ HÁN CHO PHÉP: CHỈ dùng 34 chữ Hán của Bài 1, 2, 3: [私, 人, 才, 学, 生, 校, 日, 本, 語, 一, 二, 三, 四, 五, 六, 七, 八, 九, 十, 百, 千, 万, 円, 月, 火, 水, 木, 土, 曜, 何, 年, 時, 間, 分]. Bất kỳ chữ Hán nào khác ngoài danh sách này BẮT BUỘC PHẢI VIẾT BẰNG HIRAGANA HOẶC KATAKANA."
      : "- MẬT ĐỘ VÀ PHẠM VI CHỮ HÁN: Tối đa hóa việc dùng 77 chữ Hán chính thức đã học đến Bài 7 (tối thiểu 15-30 chữ Hán trong bài): [私, 人, 才, 学, 生, 校, 日, 本, 語, 一, 二, 三, 四, 五, 六, 七, 八, 九, 十, 百, 千, 万, 円, 月, 火, 水, 木, 土, 曜, 何, 年, 時, 間, 分, 東, 京, 名, 前, 国, 男, 女, 区, 市, 先, 週, 毎, 午, 後, 見, 食, 飲, 買, 物, 行, 休, 今, 来, 帰, 会, 社, 聞, 読, 書, 話, 寺, 言, 具, 田, 力, 門, 肉, 料, 理, 野, 半, 大, 小]. Bất kỳ chữ Hán nào chưa học (như 開, 閉, 待, 泳, 暑, 寒, 楽, 撮, 友, 車, 新, 安, 高...) BẮT BUỘC PHẢI VIẾT BẰNG HIRAGANA (ví dụ: viết あけて, まって, あつい, さむい, たのしい, とりたい, ともだち, あたらしい, やすい, たかい).";

  const systemPrompt = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn phần thi ĐỌC HIỂU (読解 - Dokkai) môn ${course} (Tiếng Nhật ${course === "JPD113" ? "1" : "2"}).
Nhiệm vụ: Soạn một bài đọc hiểu mới mẻ, tự nhiên kèm 3-4 câu hỏi trắc nghiệm A-D chuẩn đề thi kết thúc môn FPT.
Mã phiên ngẫu nhiên: #${entropySeed}.

QUY TẮC BẮT BUỘC (CRITICAL CONSTRAINTS - TUÂN THỦ 100%):
1. PHẠM VI TỪ VỰNG:
   - 100% từ vựng BẮT BUỘC phải lấy từ danh sách từ vựng chính thức của môn ${course} (Bài ${allowedBai.join(", ")}).
   - TUYỆT ĐỐI KHÔNG dùng từ vựng ngoài bài học.
2. PHẠM VI CHỮ HÁN:
   ${kanjiRule}
3. ĐỘ DÀI VÀ CẤU TRÚC ĐỀ THI:
   ${lengthRule}${katakanaRule}
4. CÂU HỎI TRẮC NGHIỆM ĐỌC HIỂU (3 đến 4 câu):
   - Mỗi câu hỏi có đúng 4 lựa chọn (A, B, C, D).
   - Đáp án đúng duy nhất, giải thích chi tiết tại sao đúng và tại sao các lựa chọn còn lại sai.
   - Bám sát thông tin trong bài đọc (câu hỏi về thời gian, địa điểm, lý do, hành động hoặc ý kiến nhân vật).
5. TÍNH ĐA DẠNG:
   - Không lặp lại các bài đọc cũ, đổi mới ngữ cảnh (đời sống sinh viên FPT, ký túc xá, thư viện, đi chợ, nấu ăn, du lịch, hẹn gặp bạn bè).

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Chỉ xuất ra duy nhất JSON (không kèm markdown \`\`\`json) với định dạng:
{
  "id": "ai-${course.toLowerCase()}-${entropySeed}",
  "course": "${course}",
  "title": "Tiêu đề tiếng Nhật",
  "titleVi": "Tiêu đề tiếng Việt",
  "theme": "Chủ đề bài đọc",
  "content": "Toàn bộ đoạn văn tiếng Nhật",
  "sentences": [
    { "jp": "Câu 1 tiếng Nhật", "vi": "Bản dịch câu 1", "romaji": "Romaji câu 1" }
  ],
  "translation": "Bản dịch toàn bộ bài đọc sang tiếng Việt",
  "romaji": "Toàn bộ Romaji của bài đọc",
  "questions": [
    {
      "id": "q1",
      "prompt": "Câu hỏi đọc hiểu bằng tiếng Nhật hoặc tiếng Việt",
      "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
      "answer": "Đáp án đúng",
      "explanation": {
        "meaning": "Ý nghĩa câu hỏi và đáp án",
        "reason": "Giải thích chi tiết dẫn chứng từ bài đọc",
        "wrongOptions": [
          { "option": "Phương án sai 1", "reason": "Lý do sai" },
          { "option": "Phương án sai 2", "reason": "Lý do sai" },
          { "option": "Phương án sai 3", "reason": "Lý do sai" }
        ]
      }
    }
  ]
}`;

  const userPrompt = `Hãy tạo một bài đọc hiểu mới hoàn chỉnh cho môn ${course} Đại học FPT (Mã #${entropySeed}).
Lưu ý:
- ${course === "JPD113" ? "Bài ngắn (~80-130 ký tự, 3-5 câu), chỉ dùng 34 Kanji Bài 1-3" : "Bài dài chuẩn đề thi FPT (~200-280 ký tự, 6-9 câu), tăng cường mật độ Katakana và Kanji Bài 1-7"}.
- Chữ Hán chưa học bắt buộc viết bằng Hiragana/Katakana.
- Xuất ra JSON hợp lệ.`;

  return { systemPrompt, userPrompt, allowedBai };
}

/**
 * Sinh bài đọc hiểu qua AI hoặc tự động fallback sang Engine FPT đa dạng
 */
export async function generateAiReadingPassage(course: ReadingCourse): Promise<{
  passage: ReadingPassage;
  isRealAi: boolean;
  provider: string;
  error?: string;
}> {
  const settings = getAiSettings();
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];

  // 1. Chế độ Engine FPT tích hợp (Built-in)
  if (settings.provider === "built-in" || !settings.apiKey.trim()) {
    const passage = generateReadingPassage(course);
    return {
      passage,
      isRealAi: false,
      provider: "FPT Reading Engine (Offline)",
    };
  }

  // 2. Chế độ AI trực tuyến (Gemini, Grok, OpenAI)
  try {
    const { systemPrompt, userPrompt } = buildReadingAiPrompt(course);
    let rawText = "";

    if (settings.provider === "gemini") {
      const model = settings.model || "gemini-1.5-flash";
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
          : "https://api.openai.com/v1/chat/completions";
      const model =
        settings.model || (settings.provider === "xai" ? "grok-4.5" : "gpt-4o-mini");

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
    const parsed = JSON.parse(cleaned) as ReadingPassage;

    if (!parsed || !parsed.content || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("Dữ liệu bài đọc trả về từ AI không đúng cấu trúc.");
    }

    // Đảm bảo có romaji và câu tách biệt
    if (!parsed.sentences || parsed.sentences.length === 0) {
      parsed.sentences = parsed.content
        .split(/(?<=[。！？\n])/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({
          jp: s,
          vi: "",
          romaji: toRomaji(toKana(s)),
        }));
    }

    if (!parsed.romaji) {
      parsed.romaji = toRomaji(toKana(parsed.content));
    }

    const sanitized = sanitizeReadingPassageKanji(parsed, allowedBai);

    return {
      passage: { ...sanitized, isAiGenerated: true },
      isRealAi: true,
      provider: `${settings.provider.toUpperCase()} (${settings.model || "Default"})`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Reading AI] Error calling LLM, fallback to Engine:", message);
    const fallback = generateReadingPassage(course);
    return {
      passage: fallback,
      isRealAi: false,
      provider: "FPT Reading Engine (Fallback)",
      error: `Không thể kết nối AI (${message}). Đã chuyển sang bộ bài đọc chuẩn FPT.`,
    };
  }
}

/**
 * Xây dựng prompt cho AI để tạo trọn bộ 4 đề đọc hiểu phủ 100% Kanji Bài 4-7
 */
export function buildReadingAiSetPrompt(course: ReadingCourse): {
  systemPrompt: string;
  userPrompt: string;
  allowedBai: number[];
} {
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];
  const entropySeed = Math.random().toString(36).slice(2, 8).toUpperCase();

  const coverageInstruction =
    course === "JPD123"
      ? `QUY TẮC PHỦ TOÀN BỘ 43 CHỮ HÁN BÀI 4 ĐẾN 7:
Trong 4 đề đọc hiểu này, bạn BẮT BUỘC phải phân bổ sao cho TỔNG HỢP CẢ 4 ĐỀ PHẢI XUẤT HIỆN ĐỦ TOÀN BỘ 43 CHỮ HÁN sau:
[東, 京, 名, 前, 国, 男, 女, 区, 市, 先, 週, 毎, 午, 後, 見, 食, 飲, 買, 物, 行, 休, 今, 来, 帰, 会, 社, 聞, 読, 書, 話, 寺, 言, 具, 田, 力, 門, 肉, 料, 理, 野, 半, 大, 小].
- Mỗi bài đọc nên dùng từ 15 đến 30 chữ Hán trong danh sách trên.
- TUYỆT ĐỐI KHÔNG dùng bất kỳ chữ Hán nào chưa học (như 開, 閉, 暑, 寒, 楽, 撮...). Chữ Hán chưa học bắt buộc viết bằng Hiragana/Katakana (ví dụ: あけて, あつい, さむい, たのしい, とりたい).
- Mỗi bài đọc dài khoảng 200 đến 280 ký tự tiếng Nhật (6 đến 9 câu).
- Lồng ghép tự nhiên từ 4 đến 8 từ mượn Katakana trong giáo trình Bài 1-7 (ví dụ: レストラン, ホテル, デパート, スーパー, コンビニ, バス, タクシー, パーティー, コンサート, カラオケ, ピザ, カレー, スープ, ハンバーグ, サラダ, パン, コーヒー, ジュース, スプーン, フォーク, ナイフ, Tシャツ, パソコン, カメラ, チケット, アニメ, ゲーム, アルバイト, テスト, ルームメイト).`
      : `QUY TẮC CHO JPD113:
Tạo 4 bài đọc ngắn gọn (80-130 ký tự, 3-5 câu), chỉ dùng 34 chữ Hán của Bài 1-3.`;

  const systemPrompt = `Bạn là giảng viên tiếng Nhật trường Đại học FPT chuyên biên soạn BỘ ĐỀ THI ĐỌC HIỂU (読解 - Dokkai) môn ${course}.
Nhiệm vụ: Soạn một bộ gồm ĐÚNG 4 BÀI ĐỌC HIỂU (Đề 1, Đề 2, Đề 3, Đề 4) chuẩn đề thi kết thúc môn FPT.
Mã phiên ngẫu nhiên: #${entropySeed}.

${coverageInstruction}

Mỗi bài đọc trong bộ đề phải đi kèm ĐÚNG 4 CÂU HỎI TRẮC NGHIỆM A-D có đáp án và giải thích chi tiết vì sao đúng, vì sao các phương án còn lại sai.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Chỉ xuất ra duy nhất JSON (không kèm markdown \`\`\`json) với định dạng:
{
  "id": "ai-set-${course.toLowerCase()}-${entropySeed}",
  "course": "${course}",
  "title": "JPD123 読解4題セット",
  "titleVi": "Bộ 4 đề đọc hiểu JPD123 FPT (Phủ toàn diện Bài 4–7)",
  "passages": [
    {
      "id": "ai-${course.toLowerCase()}-${entropySeed}-1",
      "course": "${course}",
      "title": "Tiêu đề tiếng Nhật Đề 1",
      "titleVi": "Tiêu đề tiếng Việt Đề 1",
      "theme": "Chủ đề Đề 1",
      "content": "Toàn bộ đoạn văn tiếng Nhật Đề 1",
      "sentences": [
        { "jp": "Câu 1 tiếng Nhật", "vi": "Bản dịch câu 1", "romaji": "Romaji câu 1" }
      ],
      "translation": "Bản dịch toàn bộ Đề 1",
      "romaji": "Toàn bộ Romaji Đề 1",
      "questions": [
        {
          "id": "q1",
          "prompt": "Câu hỏi trắc nghiệm tiếng Nhật",
          "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          "answer": "Đáp án đúng",
          "explanation": {
            "meaning": "Ý nghĩa câu hỏi và đáp án",
            "reason": "Dẫn chứng từ bài đọc",
            "wrongOptions": [
              { "option": "Phương án sai 1", "reason": "Lý do sai" },
              { "option": "Phương án sai 2", "reason": "Lý do sai" },
              { "option": "Phương án sai 3", "reason": "Lý do sai" }
            ]
          }
        }
      ]
    }
  ]
}`;

  const userPrompt = `Hãy tạo một bộ gồm đúng 4 đề đọc hiểu môn ${course} Đại học FPT (Mã #${entropySeed}).
Lưu ý:
- Tổng hợp cả 4 đề phải phủ đủ toàn bộ 43 chữ Hán của Bài 4 đến 7.
- Không dùng chữ Hán ngoài giáo trình.
- Mỗi đề có 4 câu hỏi trắc nghiệm A-D phân hóa.
- Xuất ra JSON hợp lệ.`;

  return { systemPrompt, userPrompt, allowedBai };
}

/**
 * Gọi AI sinh một bộ gồm 4 đề đọc hiểu hoặc tự động fallback sang Engine FPT đã xác thực
 */
export async function generateAiReadingExamSet(course: ReadingCourse): Promise<{
  set: ReadingPassageSet;
  isRealAi: boolean;
  provider: string;
  error?: string;
}> {
  const settings = getAiSettings();
  const allowedBai = course === "JPD113" ? [1, 2, 3] : [4, 5, 6, 7];

  // 1. Chế độ Engine FPT tích hợp (Built-in)
  if (settings.provider === "built-in" || !settings.apiKey.trim()) {
    const set = generateReadingExamSet(course);
    return {
      set,
      isRealAi: false,
      provider: "FPT Reading Engine (Offline)",
    };
  }

  // 2. Chế độ AI trực tuyến (Gemini, Grok, OpenAI)
  try {
    const { systemPrompt, userPrompt } = buildReadingAiSetPrompt(course);
    let rawText = "";

    if (settings.provider === "gemini") {
      const model = settings.model || "gemini-1.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
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
          : "https://api.openai.com/v1/chat/completions";
      const model =
        settings.model || (settings.provider === "xai" ? "grok-4.5" : "gpt-4o-mini");

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
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`${settings.provider} error: ${res.statusText}`);
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content ?? "";
    }

    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned) as {
      id?: string;
      title?: string;
      titleVi?: string;
      passages?: ReadingPassage[];
    };

    if (!parsed || !Array.isArray(parsed.passages) || parsed.passages.length < 2) {
      throw new Error("Dữ liệu bộ 4 đề trả về từ AI không đúng cấu trúc.");
    }

    const sanitizedPassages = parsed.passages.slice(0, 4).map((p, idx) => {
      const ensured: ReadingPassage = {
        ...p,
        id: p.id || `ai-${course.toLowerCase()}-${Date.now()}-${idx + 1}`,
        course,
        sentences:
          Array.isArray(p.sentences) && p.sentences.length > 0
            ? p.sentences
            : (p.content || "")
                .split(/(?<=[。！？\n])/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => ({
                  jp: s,
                  vi: "",
                  romaji: toRomaji(toKana(s)),
                })),
        romaji: p.romaji || toRomaji(toKana(p.content || "")),
        isAiGenerated: true,
      };
      return sanitizeReadingPassageKanji(ensured, allowedBai);
    });

    const coverage = computePassageSetKanjiCoverage(sanitizedPassages, course);

    const fullSet: ReadingPassageSet = {
      id: parsed.id || `ai-set-${course.toLowerCase()}-${Date.now()}`,
      course,
      title: parsed.title || `${course} 読解4題セット`,
      titleVi: parsed.titleVi || `Bộ 4 đề đọc hiểu ${course} FPT`,
      passages: sanitizedPassages,
      coveredKanji: coverage.coveredKanji,
      targetKanjiCount: coverage.targetKanjiCount,
      coveragePercentage: coverage.coveragePercentage,
      isCompleteCoverage: coverage.isCompleteCoverage,
    };

    return {
      set: fullSet,
      isRealAi: true,
      provider: `${settings.provider.toUpperCase()} (${settings.model || "Default"})`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Reading AI Set] Error calling LLM, fallback to Engine:", message);
    const fallback = generateReadingExamSet(course);
    return {
      set: fallback,
      isRealAi: false,
      provider: "FPT Reading Engine (Fallback)",
      error: `Không thể kết nối AI (${message}). Đã kích hoạt bộ 4 đề chuẩn FPT phủ 100% chữ Hán.`,
    };
  }
}
