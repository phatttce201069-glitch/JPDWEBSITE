import { getAiSettings } from "./ai-service.ts";
import { generateReadingPassage, sanitizeReadingPassageKanji } from "./reading-engine.ts";
import type { ReadingCourse, ReadingPassage } from "./reading-types.ts";
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
