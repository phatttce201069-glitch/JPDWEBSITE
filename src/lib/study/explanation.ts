import type { ExamQuestion, ExamSection } from "@/lib/study/exam";
import { findReading, vocabulary } from "@/lib/study/content";

export type QuestionExplanation = {
  meaning: string;    // Dịch nghĩa câu & từ
  grammar?: string;   // Cấu trúc ngữ pháp áp dụng
  lesson?: string;    // Thuộc bài nào (Ví dụ: JPD123 - Bài 5)
  tips?: string;      // Mẹo giải nhanh / Dấu hiệu nhận biết
  reason: string;     // Lý do chọn đáp án đúng & phân tích đáp án gây nhiễu
};

/**
 * Ngân hàng lời giải chi tiết cho các mẫu câu đặc trưng của môn JPD123 (Bài 4 - 7) Đại học FPT
 */
const PATTERN_EXPLANATIONS: Record<string, Partial<QuestionExplanation>> = {
  // --- BÀI 4: TÍNH TỪ VÀ LIÊN TỪ ---
  "totemo": {
    meaning: "Bát mì ramen này rất ngon.",
    grammar: "Phó từ chỉ mức độ: とても + Tính từ khẳng định (Rất...)",
    lesson: "JPD123 - Bài 4 (Tính từ và Liên từ)",
    tips: "Thấy đuôi khẳng định「おいしいです」thì chọn「とても」.「あまり」và「ぜんぜん」bắt buộc phải đi với câu phủ định.",
    reason: "「とても」dùng để tăng mức độ trong câu khẳng định mang nghĩa 'rất'.「あまり」nghĩa là 'không... lắm' và「ぜんぜん」nghĩa là 'hoàn toàn không' chỉ đi với đuôi phủ định (〜くない / 〜じゃありません).",
  },
  "amari": {
    meaning: "Hôm nay trời không lạnh lắm.",
    grammar: "Phó từ mức độ: あまり + Phủ định (Không... lắm)",
    lesson: "JPD123 - Bài 4 (Tính từ và Liên từ)",
    tips: "Nhìn đuôi tính từ「さむくないです」là thể phủ định → Điền ngay「あまり」.",
    reason: "Trong câu phủ định,「あまり」được dùng để diễn tả mức độ 'không... lắm'.「とても」và「すこし」chỉ dùng cho câu khẳng định.",
  },
  "ga": {
    meaning: "Căn phòng này nhỏ, nhưng sạch sẽ.",
    grammar: "Liên từ nối tương phản trong một câu: [Vế 1] が、[Vế 2]",
    lesson: "JPD123 - Bài 4 (Tính từ và Liên từ)",
    tips: "Nối 2 vế trái ngược tính chất trong CÙNG một câu thì dùng「が」.",
    reason: "「が」đóng vai trò liên từ nối hai vế câu có ý nghĩa tương phản (nhỏ >< sạch).「でも」và「しかし」chỉ đứng ở đầu câu mới sau dấu chấm.",
  },
  "soshite": {
    meaning: "Tôi ăn sáng. Và sau đó tôi đi đến trường.",
    grammar: "Liên từ nối tiếp: そして (Và, sau đó...)",
    lesson: "JPD123 - Bài 4 (Tính từ và Liên từ)",
    tips: "Đứng đầu câu sau dấu chấm kể sự việc kế tiếp theo trình tự thời gian → Chọn「そして」.",
    reason: "「そして」được dùng để nối hai câu độc lập diễn tả hành động xảy ra tiếp theo.",
  },
  "niaru": {
    meaning: "Trong phòng có sách.",
    grammar: "Địa điểm + に + Vật + があります (Tồn tại ở đâu)",
    lesson: "JPD123 - Bài 4 (Sự tồn tại của đồ vật)",
    tips: "Có đồ vật tồn tại ở vị trí nào dùng trợ từ「に」. Sự kiện/hoạt động diễn ra dùng「で」.",
    reason: "Đồ vật「ほん」tồn tại cố định trong phòng nên dùng「にあります」.",
  },
  "dearu": {
    meaning: "Ở trường đại học có buổi tiệc.",
    grammar: "Địa điểm + で + Sự kiện + があります (Sự kiện diễn ra ở đâu)",
    lesson: "JPD123 - Bài 4 (Nơi diễn ra sự kiện)",
    tips: "Bẫy kinh điển: Nếu là sự kiện, bữa tiệc, lễ hội (パーティー, お祭り) thì nơi chốn đi với「で」, KHÔNG dùng「に」.",
    reason: "「パーティー」là sự kiện/hoạt động nên nơi tổ chức dùng trợ từ「で」.",
  },

  // --- BÀI 5: MONG MUỐN & MỤC ĐÍCH ---
  "hoshii": {
    meaning: "Tôi muốn có máy tính.",
    grammar: "Danh từ + が + ほしいです (Muốn sở hữu danh từ)",
    lesson: "JPD123 - Bài 5 (Mong muốn và Mục đích)",
    tips: "Bẫy trợ từ số 1 thi FPT: Muốn có DANH TỪ dùng「N が ほしい」, tuyệt đối KHÔNG dùng trợ từ「を」.",
    reason: "「ほしい」là tính từ đuôi い biểu thị mong muốn sở hữu của người nói, đối tượng được muốn phải đi kèm trợ từ「が」.",
  },
  "tai": {
    meaning: "Tôi muốn đi Nhật Bản.",
    grammar: "Động từ [bỏ ます] + たいです (Muốn làm hành động)",
    lesson: "JPD123 - Bài 5 (Mong muốn và Mục đích)",
    tips: "Động từ di chuyển「行きます」chuyển sang thể muốn làm: bỏ ます thêm たい →「行きたいです」. Đích đến vẫn giữ「へ」hoặc「に」.",
    reason: "Muốn thực hiện hành động gì thì bỏ đuôi ます thay bằng たいです.",
  },
  "purpose": {
    meaning: "Tôi đi xem phim.",
    grammar: "Địa điểm + へ + V[bỏ ます] / N + に + 行きます/来ます/帰ります (Đi/đến để làm gì)",
    lesson: "JPD123 - Bài 5 (Mục đích di chuyển)",
    tips: "Động từ chỉ mục đích trước「行きます」phải bỏ ます và đi với trợ từ「に」:「見に行きます」.",
    reason: "Mẫu câu chỉ mục đích di chuyển: Động từ bỏ ます + に + 行きます (Đi để xem phim).",
  },
  "kara": {
    meaning: "Vì trời mưa nên tôi ở nhà.",
    grammar: "[Lý do] から、[Hệ quả] (Vì... nên...)",
    lesson: "JPD123 - Bài 5 (Mệnh đề chỉ nguyên nhân)",
    tips: "Trả lời cho câu hỏi「どうして (Tại sao)」hoặc nối câu chỉ nguyên nhân kết quả dùng「から」.",
    reason: "「から」đứng sau mệnh đề giải thích lý do (Trời mưaですから).",
  },

  // --- BÀI 6: SO SÁNH ---
  "yori": {
    meaning: "Tàu điện nhanh hơn xe buýt.",
    grammar: "A は B より Tính từ です (A ... hơn B)",
    lesson: "JPD123 - Bài 6 (So sánh hơn)",
    tips: "Cấu trúc so sánh hơn: Đứng sau đối tượng đem ra so sánh luôn là「より」(So với).",
    reason: "Trong mẫu câu so sánh hơn, từ đứng sau danh từ chuẩn so sánh là「より」(Xe buýt より = so với xe buýt).",
  },
  "hodo": {
    meaning: "Tiếng Anh không khó bằng tiếng Nhật.",
    grammar: "A は B ほど Tính từ [phủ định] (A không ... bằng B)",
    lesson: "JPD123 - Bài 6 (So sánh kém / không bằng)",
    tips: "Dấu hiệu vàng: Thấy tính từ vế sau chia PHỦ ĐỊNH (〜くない / 〜じゃありません) thì chọn「ほど」, KHÔNG chọn「より」.",
    reason: "「ほど」đi với tính từ phủ định biểu thị ý nghĩa 'không bằng'. Trong khi「より」chỉ đi với câu khẳng định.",
  },
  "dochira": {
    meaning: "Mùa hè và mùa đông, bên nào nóng hơn?",
    grammar: "A と B と どちらが Tính từ ですか (So sánh lựa chọn giữa 2 đối tượng)",
    lesson: "JPD123 - Bài 6 (So sánh lựa chọn)",
    tips: "So sánh giữa 2 đối tượng dùng từ để hỏi「どちら」(Bên nào/cái nào). Nếu 3 đối tượng trở lên mới dùng「どれ」.",
    reason: "Quy tắc so sánh: Khi chỉ có 2 sự vật đem so sánh thì bắt buộc dùng「どちら」. Câu trả lời chuẩn là「〜のほうが...」.",
  },
  "hou": {
    meaning: "Giữa mùa đông và mùa hè, mùa hè nóng hơn.",
    grammar: "A のほうが Tính từ です (Phía A / Bên A ... hơn)",
    lesson: "JPD123 - Bài 6 (Câu trả lời so sánh)",
    tips: "Trả lời cho câu hỏi どちら: Luôn dùng「[Danh từ] + のほうが...」.",
    reason: "「〜のほうが」dùng để chỉ rõ đối tượng được lựa chọn có tính chất vượt trội hơn.",
  },
  "ichiban": {
    meaning: "Trong các môn thể thao, bóng đá là môn thú vị nhất.",
    grammar: "N の中で A が いちばん Tính từ です (Trong số N thì A là nhất)",
    lesson: "JPD123 - Bài 6 (So sánh nhất)",
    tips: "Trong phạm vi tập thể「Nの中で」, tính từ đứng sau「いちばん」(nhất) và đi kèm trợ từ「が」.",
    reason: "「いちばん」mang ý nghĩa 'nhất'. Cấu trúc: [Phạm vi] の中で [Chủ ngữ] が いちばん [Tính từ] です.",
  },
  "mai": {
    meaning: "Hãy lấy cho tôi 3 chiếc đĩa / CD.",
    grammar: "Số đếm đồ vật mỏng, phẳng: Số từ + 枚 (まい)",
    lesson: "JPD123 - Bài 6 (Lượng từ số đếm)",
    tips: "Đĩa CD, giấy tờ, tem thư, áo sơ mi là đồ mỏng phẳng dẹt → Đếm bằng「枚 (まい)」.",
    reason: "「まい」dùng đếm các vật mỏng phẳng.「だい」dùng đếm máy móc xe cộ.「ほん」dùng đếm vật thon dài.",
  },
  "dai": {
    meaning: "Trong phòng nghiên cứu có 10 chiếc máy tính.",
    grammar: "Số đếm máy móc, xe cộ: Số từ + 台 (だい)",
    lesson: "JPD123 - Bài 6 (Lượng từ số đếm)",
    tips: "Máy tính, ô tô, xe máy, máy giặt, tivi → Đếm bằng「台 (だい)」.",
    reason: "「だい」là lượng từ chuyên dụng để đếm máy móc, thiết bị điện tử và phương tiện cơ giới.",
  },

  // --- BÀI 7: THỂ て, GIAO TIẾP VÀ MẪU CÂU ---
  "te": {
    meaning: "Xin vui lòng viết tên và địa chỉ vào đây.",
    grammar: "Động từ thể て + ください (Xin hãy / Vui lòng làm V)",
    lesson: "JPD123 - Bài 7 (Mẫu câu yêu cầu lịch sự)",
    tips: "Nhờ vả lịch sự「〜てください」: Động từ nhóm 1 đuôi「き」chuyển thành「いて」→ かいて (viết).",
    reason: "Mẫu câu nhờ ai làm việc gì: Vてください. Động từ「書きます」thuộc nhóm 1, hàng き đổi thành いて →「書いてください」.",
  },
  "teiru": {
    meaning: "Yamaguchi-san bây giờ đang đọc sách ở đằng kia.",
    grammar: "Động từ thể て + います (Hành động đang tiếp diễn)",
    lesson: "JPD123 - Bài 7 (Thì hiện tại tiếp diễn)",
    tips: "Thấy có từ「今 (bây giờ)」diễn tả hành động đang xảy ra tại thời điểm nói → Dùng thể tiếp diễn「Vています」.",
    reason: "Hành động đọc sách đang diễn ra ngay lúc nói nên chia thể tiếp diễn: 読んでいます.",
  },
  "kata": {
    meaning: "Xin hãy chỉ cho tôi cách làm món cà ri.",
    grammar: "V[bỏ ます] + 方 (かた) = Cách làm V",
    lesson: "JPD123 - Bài 7 (Cách thức thực hiện)",
    tips: "Cách làm: 作り方 (cách làm), 読み方 (cách đọc), 使い方 (cách dùng), 行き方 (cách đi). Động từ trước 方 luôn bỏ ます.",
    reason: "Mẫu câu hỏi cách làm: Động từ bỏ ます ghép với 方 (かた) tạo thành danh từ chỉ cách thức.",
  },
  "suki": {
    meaning: "Tôi thích chó / Tôi rất thích truyện tranh Nhật Bản.",
    grammar: "N が すきです / だいすきです (Thích N)",
    lesson: "JPD123 - Bài 7 (Sở thích cá nhân)",
    tips: "Bẫy trợ từ: Thích (すき), Ghét (きらい), Giỏi (じょうず), Kém (へた) đều đi với trợ từ「が」, không đi với「を」.",
    reason: "「すき」là tính từ đuôi な thể hiện cảm xúc, sở thích, danh từ đối tượng đi kèm luôn dùng trợ từ「が」.",
  },
  "mou": {
    meaning: "Tôi đã ăn cơm rồi.",
    grammar: "もう + Động từ quá khứ (Đã làm gì rồi)",
    lesson: "JPD123 - Bài 7 (Trạng thái đã hoàn tất)",
    tips: "Phân biệt:「もう」đi với câu KHẲNG ĐỊNH QUÁ KHỨ (đã làm rồi).「まだ」đi với câu PHỦ ĐỊNH TIẾP DIỄN (vẫn chưa làm).",
    reason: "「もう」biểu thị hành động đã hoàn tất, đi với động từ thể quá khứ「たべました」.",
  },
  "mada": {
    meaning: "Tôi vẫn chưa ăn cơm.",
    grammar: "まだ + Vていません (Vẫn chưa làm gì)",
    lesson: "JPD123 - Bài 7 (Trạng thái chưa hoàn thành)",
    tips: "Thấy có「まだ」(chưa) → Bắt buộc chọn dạng「〜ていません」.",
    reason: "Để trả lời hành động chưa hoàn thành, Minna Bài 7 quy định cấu trúc「まだ Vていません」, không dùng まだ Vませんでした.",
  },
  "zehi": {
    meaning: "Món này rất ngon đấy, bạn nhất định hãy ăn thử nhé.",
    grammar: "ぜひ + Vてください / Vたいです (Nhất định muốn / mời làm)",
    lesson: "JPD123 - Bài 7 (Phó từ nhấn mạnh sự tha thiết)",
    tips: "Phó từ「ぜひ」(nhất định) luôn đi cùng các mẫu câu mời mọc「〜てください」hoặc mong muốn tha thiết「〜たいです」.",
    reason: "「ぜひ」dùng để nhấn mạnh lời mời mọc tha thiết, trang trọng và nhiệt tình đối với người nghe.",
  },
};

/**
 * Tự động tạo lời giải chi tiết thông minh cho bất kỳ câu hỏi nào
 */
export function getQuestionExplanation(question: ExamQuestion): QuestionExplanation {
  // 1. Nếu câu hỏi đã có sẵn explanation tùy biến, trả về ngay
  if (question.explanation && question.explanation.meaning && question.explanation.reason) {
    return question.explanation;
  }

  // 2. Tra cứu theo từ khóa mẫu câu đặc trưng của đề thi FPT JPD123
  for (const [key, pattern] of Object.entries(PATTERN_EXPLANATIONS)) {
    if (
      question.id.includes(key) ||
      (pattern.tips && question.prompt.includes(key)) ||
      question.sentence.includes(key)
    ) {
      return {
        meaning: pattern.meaning || synthesizeMeaning(question),
        grammar: pattern.grammar || determineGrammarPoint(question),
        lesson: pattern.lesson || determineLesson(question),
        tips: pattern.tips || "Đọc kỹ từ khóa trước và sau chỗ trống để xác định trợ từ hoặc thể chia tương ứng.",
        reason: pattern.reason || synthesizeReason(question),
      };
    }
  }

  // 3. Xây dựng lời giải theo từng phần chuyên biệt (Kanji, Từ vựng, Ngữ pháp)
  if (question.section === "Kanji") {
    return buildKanjiExplanation(question);
  }
  if (question.section === "Ngữ pháp") {
    return buildGrammarExplanation(question);
  }
  return buildVocabExplanation(question);
}

/**
 * Lời giải cho câu hỏi Chữ Hán (Kanji)
 */
function buildKanjiExplanation(q: ExamQuestion): QuestionExplanation {
  const isReading =
    q.prompt.includes("cách đọc") ||
    q.prompt.includes("読み方") ||
    q.prompt.includes("Hiragana");
  const isWriting =
    q.prompt.includes("chữ Hán") ||
    q.prompt.includes("漢字") ||
    q.prompt.includes("Kanji");
  const isHanViet =
    q.prompt.includes("Hán Việt") ||
    q.prompt.includes("ý nghĩa");

  // Tìm từ vựng gốc trong từ điển
  const cleanTarget = q.sentence.replace(/^[（(〔]\s*|\s*[)）〕]$/g, "").trim();
  const matchedWord = vocabulary.find(
    (w) => w.word === cleanTarget || w.reading === cleanTarget || q.sentence.includes(w.word),
  );

  const lessonInfo = matchedWord?.lesson
    ? `JPD123 - ${matchedWord.lesson}`
    : "JPD123 - Bài 4 đến Bài 7 (Chữ Hán N5 FPT)";

  if (isReading) {
    return {
      meaning: matchedWord
        ? `Từ vựng「${matchedWord.word}」nghĩa là: "${matchedWord.meaning}". Câu hoàn chỉnh: ${q.sentence}`
        : `Dịch nghĩa câu: ${q.sentence}`,
      grammar: "Chữ Hán sơ cấp N5 - Cách đọc Hiragana theo âm Kun/On",
      lesson: lessonInfo,
      tips: `Nhớ chính xác trường âm (âm dài như りょう vs りょ, えい vs え) và các biến âm (đục / bán đục) của chữ.`,
      reason: `Đáp án đúng là "${q.answer}". Chữ Hán trong ngoặc có cách đọc chuẩn xác trong ngữ cảnh này là "${q.answer}". Các phương án còn lại là bẫy sai trường âm hoặc cố ý đổi phụ âm gây nhầm lẫn.`,
    };
  }

  if (isWriting) {
    return {
      meaning: matchedWord
        ? `Nghĩa của từ: "${matchedWord.meaning}". Câu hoàn chỉnh: ${q.sentence}`
        : `Dịch nghĩa câu: ${q.sentence}`,
      grammar: "Chữ Hán sơ cấp N5 - Nhận diện mặt chữ Hán tương ứng với Hiragana",
      lesson: lessonInfo,
      tips: "Quan sát kỹ các bộ thủ đặc trưng (bộ Mộc 木, Thủy 水, Kim 金, Môn 門, Nhật 日) để tránh chọn nhầm chữ gần giống.",
      reason: `Đáp án đúng là "${q.answer}". Đây là chữ Hán tương ứng chính xác với âm Hiragana được gạch chân. Các lựa chọn khác là những chữ Hán có nét tương tự hoặc mang ý nghĩa khác hoàn toàn.`,
    };
  }

  return {
    meaning: matchedWord ? `Ý nghĩa: "${matchedWord.meaning}".` : `Dịch câu: ${q.sentence}`,
    grammar: "Âm Hán Việt và cấu tạo chữ Hán N5",
    lesson: lessonInfo,
    tips: "Âm Hán Việt là cầu nối tuyệt vời giúp sinh viên Việt Nam nhớ nhanh nghĩa của chữ Hán.",
    reason: `Đáp án đúng là "${q.answer}". Đây là âm Hán Việt chuẩn xác của chữ Hán được cho, giúp người học dễ dàng liên tưởng đến nghĩa của từ trong tiếng Việt.`,
  };
}

/**
 * Lời giải cho câu hỏi Ngữ pháp (Grammar)
 */
function buildGrammarExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);
  const grammarPoint = determineGrammarPoint(q);

  let tips = "Đọc kỹ các từ xung quanh chỗ trống: nếu là động từ thì chú ý trợ từ đi kèm; nếu là tính từ chú ý thời quá khứ hay hiện tại.";
  if (q.sentence.includes("ほしい")) {
    tips = "Ghi nhớ: Danh từ + が + ほしいです (Muốn sở hữu danh từ luôn đi với trợ từ が).";
  } else if (q.sentence.includes("より") || q.sentence.includes("ほど")) {
    tips = "So sánh hơn: A は B より (A hơn B). So sánh kém: A は B ほど [Phủ định] (A không bằng B).";
  } else if (q.sentence.includes("ください")) {
    tips = "Động từ đi trước ください luôn chia ở THỂ て (Vてください).";
  } else if (q.sentence.includes("あまり") || q.sentence.includes("ぜんぜん")) {
    tips = "Phó từ あまり / ぜんぜん bắt buộc phải đi với thể phủ định (〜くない / 〜じゃありません).";
  }

  return {
    meaning: `Dịch nghĩa: ${synthesizeMeaning(q)}`,
    grammar: grammarPoint,
    lesson,
    tips,
    reason: `Đáp án đúng là "${q.answer}". Theo quy tắc ngữ pháp của ${lesson}, cấu trúc "${grammarPoint}" yêu cầu dạng thức "${q.answer}" để tạo thành câu hoàn chỉnh, đúng ngữ pháp. Các phương án còn lại bị sai dạng chia hoặc sai quy tắc kết hợp trợ từ.`,
  };
}

/**
 * Lời giải cho câu hỏi Từ vựng (Vocabulary)
 */
function buildVocabExplanation(q: ExamQuestion): QuestionExplanation {
  const lesson = determineLesson(q);
  const matchedWord = vocabulary.find((w) => w.word === q.answer || w.reading === q.answer);

  return {
    meaning: `Dịch câu: ${synthesizeMeaning(q)}${matchedWord ? ` (Đáp án「${q.answer}」nghĩa là: ${matchedWord.meaning})` : ""}`,
    grammar: "Từ vựng chuyên đề & Ngữ cảnh giao tiếp thực tế",
    lesson,
    tips: "Liên hệ ngữ cảnh sinh hoạt hàng ngày (đồ dùng ăn uống, đồ đạc trong nhà, thời tiết, giao tiếp hỏi đáp) để loại trừ phương án sai.",
    reason: `Đáp án đúng là "${q.answer}". Từ vựng này phù hợp nhất với ngữ cảnh và ngữ nghĩa của câu văn. Các phương án còn lại không hợp lý về mặt logic hoặc ngữ cảnh tình huống.`,
  };
}

function determineLesson(q: ExamQuestion): string {
  if (q.sentence.includes("より") || q.sentence.includes("ほど") || q.sentence.includes("どちら") || q.sentence.includes("いちばん")) {
    return "JPD123 - Bài 6 (So sánh và Lượng từ)";
  }
  if (q.sentence.includes("て") || q.sentence.includes("ください") || q.sentence.includes("かた") || q.sentence.includes("すき") || q.sentence.includes("スプーン")) {
    return "JPD123 - Bài 7 (Động từ thể て và Mẫu câu giao tiếp)";
  }
  if (q.sentence.includes("ほしい") || q.sentence.includes("たい") || q.sentence.includes("ました") || q.sentence.includes("から") || q.sentence.includes("どうして")) {
    return "JPD123 - Bài 5 (Quá khứ, Mong muốn và Mục đích)";
  }
  if (q.sentence.includes("おいしい") || q.sentence.includes("さむい") || q.sentence.includes("きれい") || q.sentence.includes("とても") || q.sentence.includes("あまり") || q.sentence.includes("が")) {
    return "JPD123 - Bài 4 (Tính từ và Liên từ)";
  }
  return "JPD123 - Giáo trình Sơ cấp 2 (Bài 4 đến 7)";
}

function determineGrammarPoint(q: ExamQuestion): string {
  if (q.sentence.includes("ほしい")) return "Mẫu câu mong muốn sở hữu: Danh từ + が + ほしいです";
  if (q.sentence.includes("たい")) return "Mẫu câu muốn thực hiện hành động: V[bỏ ます] + たいです";
  if (q.sentence.includes("より")) return "Cấu trúc so sánh hơn: A は B より Tính từ です";
  if (q.sentence.includes("ほど")) return "Cấu trúc so sánh kém (không bằng): A は B ほど Tính từ [phủ định]";
  if (q.sentence.includes("どちら")) return "So sánh lựa chọn: A と B と どちらが Tính từ ですか";
  if (q.sentence.includes("いちばん")) return "So sánh nhất: [Phạm vi] の中で [Chủ ngữ] が いちばん [Tính từ] です";
  if (q.sentence.includes("ください")) return "Mẫu câu yêu cầu, nhờ vả lịch sự: Vてください";
  if (q.sentence.includes("かた")) return "Mẫu câu cách thức làm: V[bỏ ます] + 方 (かた)";
  if (q.sentence.includes("すき")) return "Mẫu câu nói về sở thích: Danh từ + が + すきです";
  if (q.sentence.includes("ました")) return "Thì quá khứ của động từ: Vました / Vませんでした";
  if (q.sentence.includes("かった") || q.sentence.includes("くない")) return "Chia tính từ đuôi い: Quá khứ かったです, Phủ định くないです";
  if (q.sentence.includes("でした") || q.sentence.includes("じゃありません")) return "Chia tính từ đuôi な: Quá khứ でした, Phủ định じゃありません";
  return "Cấu trúc câu ngữ pháp tiếng Nhật sơ cấp";
}

function synthesizeMeaning(q: ExamQuestion): string {
  const clean = q.sentence.replace(/（\s*）/g, `【${q.answer}】`).replace(/〔([^〕]+)〕/g, "$1");
  return clean;
}

function synthesizeReason(q: ExamQuestion): string {
  return `Lựa chọn "${q.answer}" là phương án chính xác nhất để hoàn thiện câu văn theo chuẩn ngữ pháp và ngữ nghĩa tiếng Nhật.`;
}
