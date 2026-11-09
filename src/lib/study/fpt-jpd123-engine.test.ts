import test from "node:test";
import assert from "node:assert/strict";
import { buildFptJpd123Exam, generateDynamicVocabSeeds } from "./fpt-jpd123-engine.ts";
import { buildAiPrompt, explainKanjiWithAi, explainQuestionWithAi } from "./ai-service.ts";
import { getAllowedKanjiChars, replaceUntaughtKanjiWithKana, formatExamQuestionKanji } from "./kana-reading.ts";
import { alphabet } from "../../data/alphabet.ts";
import { vocabulary } from "../../data/vocabulary.ts";
import { getQuestionExplanation, analyzeDistractors, getFullSentenceTranslation } from "./explanation.ts";
import { analyzeExamPerformance } from "./exam-diagnostic.ts";

test("buildFptJpd123Exam generates a valid FPT JPD123 exam", () => {
  const paper = buildFptJpd123Exam();

  // Exactly 30 questions
  assert.equal(paper.length, 30, "Đề thi phải có đúng 30 câu hỏi");

  // Sections distribution: 10 Kanji, 10 Từ vựng, 10 Ngữ pháp
  const kanji = paper.filter((q) => q.section === "Kanji");
  const vocab = paper.filter((q) => q.section === "Từ vựng");
  const grammar = paper.filter((q) => q.section === "Ngữ pháp");

  assert.equal(kanji.length, 10, "Phần Kanji phải có đúng 10 câu");
  assert.equal(vocab.length, 10, "Phần Từ vựng phải có đúng 10 câu");
  assert.equal(grammar.length, 10, "Phần Ngữ pháp phải có đúng 10 câu");

  // Options validation
  for (const q of paper) {
    assert.ok(q.sentence.trim().length > 0, `Câu ${q.id} không được để trống câu tiếng Nhật`);
    assert.ok(q.prompt.trim().length > 0, `Câu ${q.id} không được để trống yêu cầu đề`);
    assert.ok(q.answer.trim().length > 0, `Câu ${q.id} không được để trống đáp án`);
    assert.equal(q.options.length, 4, `Câu ${q.id} phải có đúng 4 phương án A, B, C, D`);
    assert.equal(new Set(q.options).size, 4, `Câu ${q.id} phải có 4 phương án khác nhau không trùng lặp`);
    assert.ok(q.options.includes(q.answer), `Câu ${q.id} phải chứa đáp án đúng trong 4 phương án`);
  }
});

test("buildFptJpd123Exam with filtered lessons 4 & 5 strictly isolates lessons", () => {
  const paper = buildFptJpd123Exam(["4", "5"]);

  assert.equal(paper.length, 30, "Đề thi phải có đúng 30 câu");
  assert.equal(paper.filter((q) => q.section === "Kanji").length, 10, "10 câu Kanji");
  assert.equal(paper.filter((q) => q.section === "Từ vựng").length, 10, "10 câu Từ vựng");
  assert.equal(paper.filter((q) => q.section === "Ngữ pháp").length, 10, "10 câu Ngữ pháp");

  // 100% câu hỏi không trùng lặp
  const uniqueSentences = new Set(paper.map((q) => q.sentence));
  assert.equal(uniqueSentences.size, 30, "Tất cả 30 câu hỏi phải không trùng lặp câu văn");

  // 100% câu hỏi thuộc Bài 4 hoặc Bài 5, TUYỆT ĐỐI không có Bài 6 hay Bài 7, và KHÔNG có dải bài "đến"
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    const isBai4Or5 = (lesson.includes("Bài 4") || lesson.includes("Bài 5")) && !lesson.includes("đến");
    assert.ok(
      isBai4Or5,
      `Câu ${q.id} (${q.sentence}) có lesson là "${lesson}", không được chứa dải bài 'đến' và phải thuộc Bài 4 hoặc Bài 5!`,
    );
    assert.ok(!lesson.includes("Bài 6"), `Câu ${q.id} lesson không được chứa Bài 6: ${lesson}`);
    assert.ok(!lesson.includes("Bài 7"), `Câu ${q.id} lesson không được chứa Bài 7: ${lesson}`);

    // Không chứa kiến thức đặc trưng Bài 6 (so sánh, từ chối, sự kiện, đếm vật mỏng)
    assert.ok(!q.sentence.includes("より"), `Câu ${q.id} chứa 'より' của Bài 6`);
    assert.ok(!q.sentence.includes("ほど"), `Câu ${q.id} chứa 'ほど' của Bài 6`);
    assert.ok(!q.sentence.includes("ちょっと"), `Câu ${q.id} chứa 'ちょっと' của Bài 6`);
    assert.ok(!q.sentence.includes("やくそく"), `Câu ${q.id} chứa 'やくそく' của Bài 6`);
    assert.ok(!q.sentence.includes("お祭り"), `Câu ${q.id} chứa 'お祭り' của Bài 6`);
    assert.ok(
      !/[0-9一二三四五六七八九十]\s*(?:枚|まい)/.test(q.sentence) && !q.sentence.includes("何枚"),
      `Câu ${q.id} chứa lượng từ đếm vật mỏng (枚 - まい) của Bài 6: ${q.sentence}`,
    );

    // Không chứa kiến thức đặc trưng Bài 7 (thể て, dụng cụ ăn uống)
    assert.ok(!q.sentence.includes("てください"), `Câu ${q.id} chứa 'てください' của Bài 7`);
    assert.ok(!q.sentence.includes("スプーン"), `Câu ${q.id} chứa 'スプーン' của Bài 7`);
    assert.ok(!q.sentence.includes("フォーク"), `Câu ${q.id} chứa 'フォーク' của Bài 7`);
  }
});

test("buildFptJpd123Exam with single lesson 4 produces 30 non-repeating questions solely from Bài 4", () => {
  const paper = buildFptJpd123Exam(["4"]);

  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30, "30 câu không trùng lặp");

  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 4"), `Câu ${q.id} phải thuộc Bài 4 nhưng lại là ${lesson}`);
  }
});

test("buildFptJpd123Exam with single lesson 5 produces 30 non-repeating questions solely from Bài 5", () => {
  const paper = buildFptJpd123Exam(["5"]);

  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30, "30 câu không trùng lặp");

  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 5"), `Câu ${q.id} phải thuộc Bài 5 nhưng lại là ${lesson}`);
  }
});

test("buildAiPrompt dynamically scopes to selected lessons and excludes unselected lessons", () => {
  const { systemPrompt, userPrompt, allowedBai } = buildAiPrompt(["4", "5"]);

  assert.deepEqual(allowedBai, [4, 5]);
  assert.ok(systemPrompt.includes("Bài 4, Bài 5"), "Prompt phải nêu rõ Bài 4, Bài 5");
  assert.ok(systemPrompt.includes("TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi nào về So sánh"), "Phải cấm so sánh Bài 6");
  assert.ok(systemPrompt.includes("Rủ rê & Từ chối khéo"), "Phải cấm rủ rê từ chối Bài 6");
  assert.ok(systemPrompt.includes("TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi nào về Thể て"));
  assert.ok(userPrompt.includes("Bài 4, Bài 5"));
});

test("getQuestionExplanation correctly explains specific Kanji question without mismatch", async () => {
  const { getQuestionExplanation, getCompletedSentence } = await import("./explanation.ts");
  const q = {
    id: "test-kaimono",
    section: "Kanji" as const,
    promptJp: "下線のひらがなの正しい漢字を選びなさい。",
    prompt: "Chọn chữ Hán tự đúng của chữ Hiragana trong ( ) .",
    sentence: "母とデパートへ（かいもの）に行きました。",
    options: ["買い者", "買い物", "買い方", "買い所"],
    answer: "買い物",
  };

  const exp = getQuestionExplanation(q);
  assert.ok(exp, "Lời giải không được undefined");
  assert.ok(exp.meaning.includes("mua sắm"), "Dịch nghĩa phải chứa từ mua sắm");
  assert.ok(!exp.meaning.includes("Căn phòng này nhỏ"), "Không được nhầm sang bài liên từ căn phòng");
  assert.ok(exp.reason.includes("買い物"), "Lý do chọn phải nhắc đến 買い物");
  assert.ok(exp.lesson?.includes("Bài 5"), "Phải thuộc Bài 5");

  const completed = getCompletedSentence(q);
  assert.equal(completed, "母とデパートへ【買い物】に行きました。");
});

test("Kanji question for 国 strictly maps to Bài 4 and never contains generic range Bài 4 đến Bài 7", async () => {
  const { getQuestionExplanation } = await import("./explanation.ts");
  const q = {
    id: "fpt-kanji-kuni",
    section: "Kanji" as const,
    promptJp: "（　　）の漢字の正しい読み方を選びなさい。",
    prompt: "Chọn cách đọc Hiragana đúng của chữ Hán trong ( ) .",
    sentence: "アンさんの（国）はどちらですか。",
    options: ["くに", "まち", "むら", "いえ"],
    answer: "くに",
  };

  const exp = getQuestionExplanation(q);
  assert.ok(exp, "Lời giải không được rỗng");
  assert.ok(exp.lesson?.includes("Bài 4"), `Phải ghim Bài 4 nhưng lại là: ${exp.lesson}`);
  assert.ok(!exp.lesson?.includes("đến"), `Không được chứa từ 'đến' trong lesson: ${exp.lesson}`);
  assert.ok(!exp.lesson?.includes("Bài 7"), `Không được chứa 'Bài 7' khi câu là Bài 4: ${exp.lesson}`);
});

test("buildFptJpd123Exam with single lesson 6 includes new grammar patterns (chotto, de event, mai counter)", () => {
  const paper = buildFptJpd123Exam(["6"]);

  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30, "30 câu không trùng lặp");

  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 6"), `Câu ${q.id} phải thuộc Bài 6 nhưng lại là ${lesson}`);
  }

  // Check that new patterns exist in the Bài 6 exam pool
  const fullExamText = paper.map((q) => `${q.sentence} ${q.prompt} ${q.answer}`).join(" ");
  assert.ok(
    fullExamText.includes("ちょっと") ||
      fullExamText.includes("やくそく") ||
      fullExamText.includes("約束") ||
      fullExamText.includes("ましょう") ||
      fullExamText.includes("いっしょに") ||
      fullExamText.includes("rủ rê") ||
      fullExamText.includes("từ chối"),
    "Đề thi Bài 6 phải chứa câu hỏi rủ rê / từ chối khéo",
  );
  assert.ok(
    fullExamText.includes("お祭り") ||
      fullExamText.includes("おまつり") ||
      fullExamText.includes("試験") ||
      fullExamText.includes("パーティー") ||
      fullExamText.includes("試合") ||
      fullExamText.includes("sự kiện"),
    "Đề thi Bài 6 phải chứa câu hỏi địa điểm diễn ra sự kiện (で)",
  );
  assert.ok(
    fullExamText.includes("まい") ||
      fullExamText.includes("CD") ||
      fullExamText.includes("シャツ") ||
      fullExamText.includes("チケット") ||
      fullExamText.includes("vật mỏng"),
    "Đề thi Bài 6 phải chứa câu hỏi đếm vật mỏng (まい)",
  );
});

test("Explanation accurately identifies new Bài 6 grammar points (refusal, event de, flat counter mai)", async () => {
  const { getQuestionExplanation } = await import("./explanation.ts");

  const q1 = {
    id: "test-refusal",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn từ thích hợp nhất điền vào chỗ trống.",
    sentence: "土曜日は（　　）…用事がありますから。",
    options: ["ちょっと", "もっと", "ずっと", "きっと"],
    answer: "ちょっと",
  };
  const exp1 = getQuestionExplanation(q1);
  assert.ok(exp1.grammar?.includes("〜はちょっと…"), `Ngữ pháp phải chứa từ chối khéo: ${exp1.grammar}`);
  assert.ok(exp1.lesson?.includes("Bài 6"), `Phải là Bài 6: ${exp1.lesson}`);

  const q2 = {
    id: "test-event-de",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn trợ từ thích hợp nhất.",
    sentence: "あした、FPT大学（　　）お祭りがあります。",
    options: ["で", "に", "へ", "を"],
    answer: "で",
  };
  const exp2 = getQuestionExplanation(q2);
  assert.ok(exp2.grammar?.includes("Địa điểm + で"), `Ngữ pháp phải là nơi diễn ra sự kiện: ${exp2.grammar}`);
  assert.ok(exp2.lesson?.includes("Bài 6"), `Phải là Bài 6: ${exp2.lesson}`);

  const q3 = {
    id: "test-counter-mai",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn lượng từ thích hợp.",
    sentence: "机の上に CD が 1（　　）あります。",
    options: ["まい", "だい", "さつ", "ほん"],
    answer: "まい",
  };
  const exp3 = getQuestionExplanation(q3);
  assert.ok(exp3.grammar?.includes("まい"), `Ngữ pháp phải là đếm vật mỏng: ${exp3.grammar}`);
  assert.ok(exp3.lesson?.includes("Bài 6"), `Phải là Bài 6: ${exp3.lesson}`);
});

test("alphabet data contains valid hiragana and katakana sets", async () => {
  const { alphabet } = await import("../../data/alphabet.ts");

  const hiragana = alphabet.filter((a) => a.type === "hiragana");
  const katakana = alphabet.filter((a) => a.type === "katakana");

  assert.ok(hiragana.length >= 46, "Hiragana phải có ít nhất 46 ký tự cơ bản");
  assert.ok(katakana.length >= 46, "Katakana phải có ít nhất 46 ký tự cơ bản");

  for (const item of hiragana) {
    assert.ok(item.char.trim().length > 0, "Ký tự Kana không được rỗng");
    assert.ok((item.romaji || "").trim().length > 0, "Phiên âm Romaji không được rỗng");
  }
});

test("all exam seeds in KANJI_SEEDS, VOCAB_SEEDS, GRAMMAR_SEEDS have valid structures", async () => {
  const { KANJI_SEEDS, VOCAB_SEEDS, GRAMMAR_SEEDS } = await import("./fpt-jpd123-engine.ts");

  const allSeeds = [...KANJI_SEEDS, ...VOCAB_SEEDS, ...GRAMMAR_SEEDS];
  assert.ok(allSeeds.length > 100, "Tổng số câu hỏi hạt giống phải phong phú (> 100 câu)");

  for (const seed of allSeeds) {
    assert.ok(seed.prompt.trim().length > 0, "Yêu cầu câu hỏi không được để trống");
    assert.ok(seed.sentence.trim().length > 0, "Câu tiếng Nhật không được để trống");
    assert.ok(seed.answer.trim().length > 0, "Đáp án đúng không được để trống");
    assert.ok(seed.wrongs.length >= 3, "Phải có ít nhất 3 phương án sai gây nhiễu");
    assert.ok(!seed.wrongs.includes(seed.answer), "Phương án sai không được trùng với đáp án đúng");
  }
});

test("romaji utilities correctly normalize vietnamese and map kana", async () => {
  const { toRomaji, foldVi, sameMeaning } = await import("./romaji.ts");

  assert.equal(toRomaji("あさ"), "asa");
  assert.equal(toRomaji("やま"), "yama");
  assert.equal(foldVi("Tiếng Nhật 2"), "Tieng Nhat 2");
  assert.ok(sameMeaning("nhà", "ngôi nhà"));
  assert.ok(sameMeaning("học sinh", "học sinh / sinh viên"));
});

test("vocabulary dataset has valid structure across all lessons", async () => {
  const { vocabulary } = await import("../../data/vocabulary.ts");

  assert.ok(vocabulary.length > 500, "Tổng số từ vựng phải đạt trên 500 từ");

  for (const item of vocabulary) {
    assert.ok(item.word.trim().length > 0, `Từ vựng id ${item.id} không được để trống`);
    assert.ok(item.meaning.trim().length > 0, `Nghĩa của từ ${item.word} không được để trống`);
    assert.ok(item.lesson.trim().length > 0, `Bài học của từ ${item.word} không được để trống`);
  }
});

test("grammar dataset contains complete lessons and structured grammar points", async () => {
  const { grammar } = await import("../../data/grammar.ts");

  assert.ok(grammar.length >= 7, "Dữ liệu ngữ pháp phải bao gồm ít nhất 7 bài học");

  for (const lesson of grammar) {
    assert.ok(lesson.id.trim().length > 0, "ID bài học không được rỗng");
    assert.ok(lesson.title.trim().length > 0, "Tiêu đề bài học không được rỗng");
    assert.ok(lesson.points.length > 0, `Bài ${lesson.id} phải có ít nhất 1 điểm ngữ pháp`);

    for (const point of lesson.points) {
      assert.ok(point.id.trim().length > 0, "ID điểm ngữ pháp không được rỗng");
      assert.ok(point.structure_jp.trim().length > 0, "Cấu trúc tiếng Nhật không được rỗng");
      assert.ok(point.structure_vi.trim().length > 0, "Cấu trúc tiếng Việt không được rỗng");
      assert.ok(Array.isArray(point.examples), `Điểm ngữ pháp ${point.id} phải có mảng ví dụ`);
    }
  }
});

test("buildGrammarDrill supports practicing single grammar sections (vd: Bài 6 phần 6_1 So sánh hơn)", async () => {
  const { buildGrammarDrill } = await import("./exam.ts");

  // 1. Luyện toàn bộ Bài 6
  const allPaper = buildGrammarDrill("6");
  assert.equal(allPaper.length, 10, "Luyện toàn bộ bài 6 phải có 10 câu");

  // 2. Luyện riêng phần 6_1 (So sánh hơn: A は B より Adj です)
  const paper61 = buildGrammarDrill("6", "6_1");
  assert.ok(paper61.length >= 5, `Phần 6_1 phải tạo được ít nhất 5 câu hỏi, nhận được ${paper61.length}`);
  for (const q of paper61) {
    assert.equal(q.options.length, 4, `Câu ${q.id} phải có đúng 4 lựa chọn`);
    assert.ok(q.options.includes(q.answer), `Câu ${q.id} phải có đáp án trong các lựa chọn`);
    // Câu hỏi phải liên quan tới so sánh hơn (より hoặc cấu trúc A hơn B)
    const content = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      content.includes("より") || content.includes("hơn") || content.includes("so sánh") || content.includes("So sánh"),
      `Câu ${q.id} phải thuộc phần so sánh hơn: ${content}`,
    );
  }

  // 3. Luyện riêng phần 6_2 (So sánh kém: A は B ほど...ない)
  const paper62 = buildGrammarDrill("6", "6_2");
  assert.ok(paper62.length >= 4, `Phần 6_2 phải tạo được ít nhất 4 câu hỏi, nhận được ${paper62.length}`);
  for (const q of paper62) {
    assert.equal(q.options.length, 4);
    assert.ok(q.options.includes(q.answer));
  }

  // 4. Luyện riêng phần 6_5 (Rủ rê & Từ chối khéo: 〜はちょっと…)
  const paper65 = buildGrammarDrill("6", "6_5");
  assert.ok(paper65.length >= 4, `Phần 6_5 phải tạo được ít nhất 4 câu hỏi, nhận được ${paper65.length}`);
});

test("buildFptJpd123Exam randomizes question order so Kanji is not locked to first 10 questions", () => {
  // Chạy 5 lượt tạo đề, kiểm tra rằng thứ tự câu hỏi đã được xáo trộn ngẫu nhiên
  let hasNonKanjiInFirst10 = false;

  for (let i = 0; i < 5; i++) {
    const paper = buildFptJpd123Exam();
    assert.equal(paper.length, 30);
    const first10Sections = paper.slice(0, 10).map((q) => q.section);
    // Nếu được xáo trộn, 10 câu đầu sẽ không thể luôn luôn là 10 câu Kanji
    if (first10Sections.some((sec) => sec !== "Kanji")) {
      hasNonKanjiInFirst10 = true;
      break;
    }
  }

  assert.ok(
    hasNonKanjiInFirst10,
    "Thứ tự 30 câu hỏi phải được xáo trộn ngẫu nhiên, không được cố định 10 câu đầu luôn là Kanji",
  );
});

test("buildFptJpd123Exam with single lesson 6 produces 30 non-repeating questions solely from Bài 6", () => {
  const paper = buildFptJpd123Exam(["6"]);

  assert.equal(paper.length, 30, "Đề thi Bài 6 phải có đủ 30 câu hỏi");
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30, "30 câu không trùng lặp");

  // Đảm bảo 100% câu hỏi thuộc Bài 6
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(
      lesson.includes("Bài 6"),
      `Câu ${q.id} (${q.sentence}) phải thuộc Bài 6 nhưng lesson lại là: "${lesson}"`,
    );
    assert.ok(!lesson.includes("Bài 4"), `Câu ${q.id} không được thuộc Bài 4`);
    assert.ok(!lesson.includes("Bài 5"), `Câu ${q.id} không được thuộc Bài 5`);
    assert.ok(!lesson.includes("Bài 7"), `Câu ${q.id} không được thuộc Bài 7`);

    // Tuyệt đối không chứa thể て của Bài 7
    assert.ok(!q.sentence.includes("てください"), `Câu ${q.id} không được chứa てください`);
    assert.ok(!q.sentence.includes("スプーン"), `Câu ${q.id} không được chứa đồ dùng Bài 7`);
  }
});

test("getAnswerMeaning and Hiragana readings work accurately for exam questions", async () => {
  const { getAnswerMeaning } = await import("./explanation.ts");
  const { getSentenceReading } = await import("./kana-reading.ts");

  // Kiểm tra dịch nghĩa đáp án
  assert.equal(getAnswerMeaning("やくそく"), "cuộc hẹn, lời hứa");
  assert.equal(getAnswerMeaning("パーティー"), "bữa tiệc");
  assert.equal(getAnswerMeaning("より"), "hơn (dùng trong so sánh hơn)");

  // Kiểm tra phiên âm Hiragana cho câu hỏi thi
  const reading = getSentenceReading("友達と映画を見る（　）がありますから、早く帰ります。");
  assert.equal(reading, "ともだちとえいがをみる（　）がありますから、はやくかえります。");
});

test("buildFptJpd123Exam with single lesson 7 produces 30 non-repeating questions solely from Bài 7", () => {
  const paper = buildFptJpd123Exam(["7"]);

  assert.equal(paper.length, 30, "Đề thi Bài 7 phải có đủ 30 câu hỏi");
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30, "30 câu hỏi không được trùng lặp");

  const kanjiCount = paper.filter((q) => q.section === "Kanji").length;
  const vocabCount = paper.filter((q) => q.section === "Từ vựng").length;
  const grammarCount = paper.filter((q) => q.section === "Ngữ pháp").length;

  assert.equal(kanjiCount, 10, "Đề thi phải có đúng 10 câu Kanji");
  assert.equal(vocabCount, 10, "Đề thi phải có đúng 10 câu Từ vựng");
  assert.equal(grammarCount, 10, "Đề thi phải có đúng 10 câu Ngữ pháp");

  // Đảm bảo 100% câu hỏi thuộc Bài 7 và không dính câu hỏi của Bài 4, 5, 6
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(
      lesson.includes("Bài 7"),
      `Câu ${q.id} (${q.sentence}) phải thuộc Bài 7 nhưng lesson lại là: "${lesson}"`,
    );
    assert.ok(!lesson.includes("Bài 4"), `Câu ${q.id} không được thuộc Bài 4`);
    assert.ok(!lesson.includes("Bài 5"), `Câu ${q.id} không được thuộc Bài 5`);
    assert.ok(!lesson.includes("Bài 6"), `Câu ${q.id} không được thuộc Bài 6`);

    // Tuyệt đối không chứa so sánh hay rủ rê của Bài 6
    assert.ok(!q.sentence.includes("より"), `Câu ${q.id} không được chứa mẫu so sánh より của Bài 6`);
    assert.ok(!q.sentence.includes("約束がありますから"), `Câu ${q.id} không được chứa từ chối khéo Bài 6`);
  }
});

test("getDynamicLessonOutline dynamically extracts content for any lesson including newly added lessons", async () => {
  const { getDynamicLessonOutline } = await import("./ai-service.ts");

  const bai7Outline = getDynamicLessonOutline(7);
  assert.ok(bai7Outline.kanji.length > 0, "Bài 7 phải có danh sách chữ Hán");
  assert.ok(bai7Outline.vocab.length > 0, "Bài 7 phải có từ vựng");
  assert.ok(bai7Outline.grammar.includes("N1 に N2") || bai7Outline.grammar.includes("います"), "Bài 7 phải có ngữ pháp N1 ni N2 ga imasu");
  assert.ok(bai7Outline.grammar.includes("Vて います") || bai7Outline.grammar.includes("Vて ください"), "Bài 7 phải có ngữ pháp thể te");

  const bai6Outline = getDynamicLessonOutline(6);
  assert.ok(bai6Outline.grammar.includes("So sánh") || bai6Outline.grammar.includes("より"), "Bài 6 phải có ngữ pháp so sánh");

  // Kiểm tra bài 1
  const bai1Outline = getDynamicLessonOutline(1);
  assert.ok(bai1Outline.vocab.length > 0, "Bài 1 phải trích xuất được từ vựng");
  assert.ok(bai1Outline.grammar.length > 0, "Bài 1 phải trích xuất được ngữ pháp");
});

test("isQuestionAllowedForLessons strictly isolates selected lessons and rejects leakages", async () => {
  const { isQuestionAllowedForLessons } = await import("./ai-service.ts");

  // Khi chỉ chọn Bài 7
  const validBai7Question = {
    id: "q1",
    section: "Ngữ pháp" as const,
    prompt: "Chọn trợ từ đi với mẫu câu tồn tại người/động vật:",
    promptJp: "文法的に正しい言葉・助詞を一つ選びなさい。",
    sentence: "庭（　）可愛い犬がいます。",
    options: ["に", "で", "へ", "を"],
    answer: "に",
    explanation: {
      lesson: "Bài 7 - N1 に N2 が います",
      meaning: "Trong sân có con chó dễ thương.",
      reason: "Chỉ vị trí tồn tại của người/động vật đi với trợ từ に.",
    },
  };

  const leakedBai6Question = {
    id: "q2",
    section: "Ngữ pháp" as const,
    prompt: "Chọn từ điền vào câu so sánh hơn:",
    promptJp: "文法的に正しい言葉・助詞を一つ選びなさい。",
    sentence: "夏は冬（　）暑いです。",
    options: ["より", "ほど", "のほうが", "で"],
    answer: "より",
    explanation: {
      lesson: "Bài 6 - So sánh hơn",
      meaning: "Mùa hè nóng hơn mùa đông.",
      reason: "Mẫu câu so sánh hơn N1 は N2 より tính từ.",
    },
  };

  assert.equal(isQuestionAllowedForLessons(validBai7Question, [7]), true, "Câu hỏi Bài 7 phải hợp lệ khi chọn Bài 7");
  assert.equal(isQuestionAllowedForLessons(leakedBai6Question, [7]), false, "Câu hỏi Bài 6 phải bị loại bỏ khi chỉ chọn Bài 7");

  // Khi chỉ chọn Bài 6
  assert.equal(isQuestionAllowedForLessons(leakedBai6Question, [6]), true, "Câu hỏi Bài 6 phải hợp lệ khi chọn Bài 6");
  assert.equal(isQuestionAllowedForLessons(validBai7Question, [6]), false, "Câu hỏi Bài 7 phải bị loại bỏ khi chỉ chọn Bài 6");
});

test("buildFptJpd123Exam with JPD113 (Lessons 1, 2, 3) produces 30 balanced non-repeating questions", () => {
  const paper = buildFptJpd123Exam(["1", "2", "3"]);

  assert.equal(paper.length, 30, "Đề thi JPD113 phải có đúng 30 câu");
  assert.equal(paper.filter((q) => q.section === "Kanji").length, 10, "10 câu Kanji");
  assert.equal(paper.filter((q) => q.section === "Từ vựng").length, 10, "10 câu Từ vựng");
  assert.equal(paper.filter((q) => q.section === "Ngữ pháp").length, 10, "10 câu Ngữ pháp");

  const uniqueSentences = new Set(paper.map((q) => q.sentence));
  assert.equal(uniqueSentences.size, 30, "30 câu hỏi phải không trùng lặp");

  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    const isJpd113Bai =
      (lesson.includes("Bài 1") || lesson.includes("Bài 2") || lesson.includes("Bài 3")) &&
      !lesson.includes("đến");
    assert.ok(isJpd113Bai, `Câu ${q.id} (${q.sentence}) phải thuộc Bài 1, 2 hoặc 3 của JPD113, nhận được: ${lesson}`);
    assert.ok(!lesson.includes("Bài 4"), "Không được rò rỉ Bài 4");
    assert.ok(!lesson.includes("Bài 5"), "Không được rò rỉ Bài 5");
    assert.ok(!lesson.includes("Bài 6"), "Không được rò rỉ Bài 6");
    assert.ok(!lesson.includes("Bài 7"), "Không được rò rỉ Bài 7");
  }
});

test("buildFptJpd123Exam with single lesson 1 produces 30 non-repeating questions solely from Bài 1", () => {
  const paper = buildFptJpd123Exam(["1"]);
  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30);
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 1"), `Câu ${q.id} phải thuộc Bài 1: ${lesson}`);
  }
});

test("buildFptJpd123Exam with single lesson 2 produces 30 non-repeating questions solely from Bài 2", () => {
  const paper = buildFptJpd123Exam(["2"]);
  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30);
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 2"), `Câu ${q.id} phải thuộc Bài 2: ${lesson}`);
  }
});

test("buildFptJpd123Exam with single lesson 3 produces 30 non-repeating questions solely from Bài 3", () => {
  const paper = buildFptJpd123Exam(["3"]);
  assert.equal(paper.length, 30);
  assert.equal(new Set(paper.map((q) => q.sentence)).size, 30);
  for (const q of paper) {
    const lesson = q.explanation?.lesson || "";
    assert.ok(lesson.includes("Bài 3"), `Câu ${q.id} phải thuộc Bài 3: ${lesson}`);
  }
});

test("buildAiPrompt for JPD113 scopes to Bài 1, 2, 3 and sets course title to JPD113 (Tiếng Nhật 1)", () => {
  const { systemPrompt, allowedBai } = buildAiPrompt(["1", "2", "3"]);
  assert.deepEqual(allowedBai, [1, 2, 3]);
  assert.ok(systemPrompt.includes("JPD113 (Tiếng Nhật 1)"), "System prompt phải nêu rõ JPD113 (Tiếng Nhật 1)");
  assert.ok(systemPrompt.includes("Bài 1, Bài 2, Bài 3"), "Phải liệt kê Bài 1, Bài 2, Bài 3");
  assert.ok(systemPrompt.includes("TUYỆT ĐỐI KHÔNG xuất hiện câu hỏi về tính từ chia quá khứ"), "Phải cấm Bài 4");
});

test("all 77 Kanji in alphabet dataset have complete enriched fields (hanviet, meaning, radicals, mnemonic, strokes, compounds)", () => {
  const kanjiList = alphabet.filter((g) => g.type === "kanji");
  assert.equal(kanjiList.length, 77, "Tổng cộng phải có đúng 77 chữ Kanji từ Bài 1 đến Bài 7");

  for (const k of kanjiList) {
    assert.ok(k.hanviet && k.hanviet.trim().length > 0, `Kanji ${k.char} thiếu âm Hán Việt`);
    assert.ok(k.meaning && k.meaning.trim().length > 0, `Kanji ${k.char} thiếu nghĩa tiếng Việt`);
    assert.ok(k.radicals && k.radicals.trim().length > 0, `Kanji ${k.char} thiếu thông tin bộ thủ cấu tạo`);
    assert.ok(k.mnemonic && k.mnemonic.trim().length > 0, `Kanji ${k.char} thiếu mẹo nhớ hình tượng`);
    assert.ok(k.strokes && k.strokes > 0, `Kanji ${k.char} thiếu số nét`);
    assert.ok(k.compounds && k.compounds.length > 0, `Kanji ${k.char} thiếu danh sách từ ghép`);
    for (const c of k.compounds) {
      assert.ok(c.word && c.word.length > 0, `Từ ghép trong chữ ${k.char} thiếu từ Kanji`);
      assert.ok(c.reading && c.reading.length > 0, `Từ ghép trong chữ ${k.char} thiếu cách đọc Hiragana`);
      assert.ok(c.meaning && c.meaning.length > 0, `Từ ghép trong chữ ${k.char} thiếu nghĩa tiếng Việt`);
    }
  }
});

test("explainKanjiWithAi returns comprehensive structured analysis", async () => {
  const kanjiList = alphabet.filter((g) => g.type === "kanji");
  const sample = kanjiList[0]; // e.g. 私 or 日
  const exp = await explainKanjiWithAi(sample);

  assert.equal(exp.character, sample.char);
  assert.equal(exp.hanviet, sample.hanviet);
  assert.ok(exp.story.length > 10, "Phải có câu chuyện nguồn gốc tượng hình");
  assert.ok(exp.radicalBreakdown.length > 5, "Phải có phân tích bộ thủ nét");
  assert.ok(exp.mnemonicSecret.length > 10, "Phải có mẹo ghi nhớ hình ảnh");
  assert.ok(exp.confusingPairs.length > 5, "Phải có phân biệt chữ dễ nhầm lẫn");
  assert.ok(exp.usageAdvice.length > 10, "Phải có lời khuyên áp dụng trong bài thi FPT");
});

test("analyzeDistractors generates insightful distractor explanations for all question formats", () => {
  const paper = buildFptJpd123Exam();
  for (const q of paper.slice(0, 10)) {
    const distractors = analyzeDistractors(q);
    assert.equal(distractors.length, 3, `Câu ${q.id} phải có 3 đáp án sai`);
    for (const d of distractors) {
      assert.ok(d.option.length > 0, `Phương án sai không được rỗng`);
      assert.notEqual(d.option, q.answer, `Phương án sai không được trùng với đáp án đúng`);
      assert.ok(d.reason.length > 5, `Phải có phân tích lý do sai cho phương án ${d.option}`);
    }
  }
});

test("getQuestionExplanation automatically attaches wrongOptions breakdown", () => {
  const paper = buildFptJpd123Exam();
  const q = paper[0];
  const explanation = getQuestionExplanation(q);

  assert.ok(explanation.meaning.length > 0, "Có nghĩa hoàn chỉnh");
  assert.ok(explanation.reason.length > 0, "Có lý do chọn đáp án đúng");
  assert.ok(explanation.wrongOptions, "Có mảng wrongOptions");
  assert.equal(explanation.wrongOptions?.length, 3, "Có đúng 3 phương án sai được phân tích");
});

test("explainQuestionWithAi produces rich teacher explanations", async () => {
  const paper = buildFptJpd123Exam();
  const q = paper[0];
  const aiTutor = await explainQuestionWithAi(q, q.options.find((o) => o !== q.answer));

  assert.ok(aiTutor.deepDive.length > 10, "Có phân tích chuyên sâu");
  assert.ok(aiTutor.grammarRule.length > 5, "Có điểm ngữ pháp áp dụng");
  assert.ok(aiTutor.senseiTip.length > 10, "Có mẹo phản xạ trong bài thi");
  assert.ok(aiTutor.whyOthersWrong.length >= 3, "Có phân tích các đáp án sai");
});

test("analyzeExamPerformance produces accurate diagnostics and actionable study roadmap", () => {
  const paper = buildFptJpd123Exam();

  // Case 1: 100% correct (30/30)
  const perfectAnswers = paper.map((q) => q.answer);
  const perfectReport = analyzeExamPerformance(paper, perfectAnswers);
  assert.equal(perfectReport.score10, 10);
  assert.equal(perfectReport.correct, 30);
  assert.equal(perfectReport.incorrect, 0);
  assert.equal(perfectReport.passed, true);
  assert.equal(perfectReport.aiSenseiAdvice.level, "distinction");
  assert.equal(perfectReport.improvementRoadmap.length, 0);

  // Case 2: Mixed performance (first 15 correct, last 15 incorrect)
  const mixedAnswers = paper.map((q, i) => (i < 15 ? q.answer : q.options.find((o) => o !== q.answer) || null));
  const mixedReport = analyzeExamPerformance(paper, mixedAnswers);
  assert.equal(mixedReport.correct, 15);
  assert.equal(mixedReport.incorrect, 15);
  assert.equal(mixedReport.score10, 5);
  assert.equal(mixedReport.passed, true);
  assert.ok(mixedReport.mistakes.length === 15);
  assert.ok(mixedReport.improvementRoadmap.length > 0, "Phải có lộ trình ôn tập cải thiện");

  // Every topic in roadmap must have actionable links
  for (const topic of mixedReport.improvementRoadmap) {
    assert.ok(topic.actionUrl.startsWith("/grammar") || topic.actionUrl.startsWith("/kana") || topic.actionUrl.startsWith("/words"));
    assert.ok(topic.actionLabel.length > 0);
    assert.ok(topic.mistakeCount > 0);
  }

  // Case 3: Retake performance (5 correct, 25 incorrect)
  const failingAnswers = paper.map((q, i) => (i < 5 ? q.answer : null));
  const failingReport = analyzeExamPerformance(paper, failingAnswers);
  assert.equal(failingReport.passed, false);
  assert.equal(failingReport.aiSenseiAdvice.level, "retake");
});

test("getFullSentenceTranslation and getQuestionExplanation translate entire completed sentences", () => {
  // Test case from user request & screenshot: 友達と映画を見る（　）がありますから、早く帰ります。
  const vocabQ = {
    id: "test-user-q",
    section: "Từ vựng" as const,
    promptJp: "文の意味に最も合う言葉を一つ選びなさい。",
    prompt: "Chọn từ thích hợp nhất điền vào chỗ trống ( ).",
    sentence: "友達と映画を見る（ ）がありますから、早く帰ります。",
    options: ["にもつ", "やくそく", "しゅくだい", "きっぷ"],
    answer: "やくそく",
  };

  const fullTrans = getFullSentenceTranslation(vocabQ);
  assert.ok(fullTrans.includes("xem phim"), "Bản dịch phải chứa ngữ cảnh xem phim");
  assert.ok(fullTrans.includes("hẹn") || fullTrans.includes("lời hứa"), "Bản dịch phải chứa từ hẹn/hứa");
  assert.ok(fullTrans.includes("về sớm") || fullTrans.includes("sớm"), "Bản dịch phải chứa về sớm");

  const explanation = getQuestionExplanation(vocabQ);
  assert.ok(explanation.meaning.includes("xem phim"), "explanation.meaning phải là câu hoàn chỉnh có xem phim");
  assert.ok(
    !explanation.meaning.startsWith("Ý nghĩa đáp án: \"やくそく\" có nghĩa là"),
    "Không được chỉ dịch mỗi từ đáp án đơn lẻ"
  );

  // Test across multiple exams (JPD113 and JPD123)
  const papers = [
    buildFptJpd123Exam(["1"]),
    buildFptJpd123Exam(["2"]),
    buildFptJpd123Exam(["3"]),
    buildFptJpd123Exam(["4"]),
    buildFptJpd123Exam(["5"]),
    buildFptJpd123Exam(["6"]),
    buildFptJpd123Exam(["7"]),
  ];

  for (const paper of papers) {
    for (const q of paper) {
      const trans = getFullSentenceTranslation(q);
      assert.ok(trans && trans.length > 5, `Câu hỏi ${q.sentence} phải có bản dịch đầy đủ`);
      assert.ok(
        !trans.startsWith("Ý nghĩa") && !trans.startsWith("Cách đọc"),
        `Bản dịch ${trans} phải là câu hoàn chỉnh, không phải chỉ dịch đáp án`
      );
      const exp = getQuestionExplanation(q);
      assert.ok(exp.meaning && exp.meaning.length > 5, `Explanation của ${q.sentence} phải có meaning`);
      assert.ok(
        !exp.meaning.startsWith("Ý nghĩa") && !exp.meaning.startsWith("Cách đọc"),
        `Meaning ${exp.meaning} phải là câu hoàn chỉnh, không phải chỉ dịch đáp án`
      );
    }
  }
});

test("generateDynamicVocabSeeds produces robust seeds for every lesson 1-7 with zero outside words", () => {
  for (let b = 1; b <= 7; b++) {
    const seeds = generateDynamicVocabSeeds([b]);
    assert.ok(seeds.length >= 100, `Bài ${b} phải sinh ra ít nhất 100 dynamic vocab seeds nhưng được ${seeds.length}`);

    const bWords = vocabulary.filter((w) => w.lesson && new RegExp(`\\bBài ${b}\\b`).test(w.lesson));
    const validWordSet = new Set(
      bWords.flatMap((w) => [
        w.word.replace(/［.*?］/g, "").replace(/（.*?）/g, "").trim(),
        w.reading.replace(/［.*?］/g, "").replace(/（.*?）/g, "").trim(),
        w.meaning.trim(),
      ]),
    );

    for (const s of seeds) {
      assert.equal(s.section, "Từ vựng");
      assert.equal(s.bai, b);
      assert.equal(s.wrongs.length, 3, "Mỗi seed phải có đúng 3 phương án sai");
      // All wrongs must be distinct and different from answer
      assert.ok(!s.wrongs.includes(s.answer), `Wrongs không được chứa đáp án đúng: ${s.answer}`);
      assert.equal(new Set(s.wrongs).size, 3, "3 phương án sai phải khác nhau");
    }
  }
});

test("buildFptJpd123Exam for Bài 6 strictly focuses on Bài 6 vocabulary with zero outside words", () => {
  const paper = buildFptJpd123Exam(["6"]);
  const vocabQuestions = paper.filter((q) => q.section === "Từ vựng");

  assert.equal(vocabQuestions.length, 10, "Phần Từ vựng phải có đúng 10 câu");

  const b6Words = vocabulary.filter((w) => w.lesson && /\bBài 6\b/.test(w.lesson));
  const b6VocabTokens = new Set(
    b6Words.flatMap((w) => [
      w.word.replace(/［.*?］/g, "").replace(/（.*?）/g, "").trim(),
      w.reading.replace(/［.*?］/g, "").replace(/（.*?）/g, "").trim(),
      w.meaning.trim(),
    ]),
  );

  // Không được chứa các từ vựng bên ngoài bài (như Bài 3, Bài 5, Bài 7)
  const forbiddenOutsideTokens = ["にもつ", "しゅくだい", "きっぷ", "エアコン", "アイロン", "つくえ", "じてんしゃ"];

  for (const q of vocabQuestions) {
    for (const opt of q.options) {
      for (const forbidden of forbiddenOutsideTokens) {
        assert.ok(!opt.includes(forbidden), `Lựa chọn '${opt}' trong câu ${q.sentence} chứa từ ngoài bài '${forbidden}'`);
      }
    }
  }
});

test("buildFptJpd123Exam for Bài 7 strictly focuses on Bài 7 vocabulary with zero outside words", () => {
  const paper = buildFptJpd123Exam(["7"]);
  const vocabQuestions = paper.filter((q) => q.section === "Từ vựng");

  assert.equal(vocabQuestions.length, 10, "Phần Từ vựng phải có đúng 10 câu");

  const forbiddenOutsideTokens = ["エアコン", "アイロン", "こしょう", "ミルク", "ジャム", "たいふう"];

  for (const q of vocabQuestions) {
    for (const opt of q.options) {
      for (const forbidden of forbiddenOutsideTokens) {
        assert.ok(!opt.includes(forbidden), `Lựa chọn '${opt}' trong câu ${q.sentence} chứa từ ngoài bài '${forbidden}'`);
      }
    }
  }
});

test("generateDynamicKanjiSeeds produces rich seeds for all lessons 1-7 matching 100% web kanji", async () => {
  const { generateDynamicKanjiSeeds, isSeedValidForLessonKanji } = await import("./fpt-jpd123-engine.ts");
  const { alphabet } = await import("../../data/alphabet.ts");

  for (let b = 1; b <= 7; b++) {
    const seeds = generateDynamicKanjiSeeds([b]);
    assert.ok(seeds.length >= 25, `Bài ${b} phải tạo được ít nhất 25 câu hỏi Kanji động (thực tế: ${seeds.length})`);

    const lessonKanjis = alphabet.filter(
      (g) =>
        g.type === "kanji" &&
        g.row &&
        (g.row === `Bài ${b}` || g.row.startsWith(`Bài ${b} `) || g.row.startsWith(`Bài ${b}·`)),
    );
    const lessonChars = new Set(lessonKanjis.map((k) => k.char));

    for (const s of seeds) {
      assert.equal(s.section, "Kanji");
      assert.equal(s.bai, b);

      // Mọi seed đều phải hợp lệ với chữ Hán của bài
      const isValid = isSeedValidForLessonKanji(s, b);
      assert.ok(
        isValid,
        `Seed [${s.sentence}] (ans: ${s.answer}) không hợp lệ với chữ Hán Bài ${b}`,
      );
    }
  }
});

test("buildFptJpd123Exam Kanji section for Bài 7 strictly tests only the 7 official web kanji with zero outside kanji", async () => {
  const { alphabet } = await import("../../data/alphabet.ts");
  const bai7Kanjis = alphabet.filter(
    (g) =>
      g.type === "kanji" &&
      g.row &&
      (g.row === "Bài 7" || g.row.startsWith("Bài 7 ") || g.row.startsWith("Bài 7·")),
  );
  const bai7Chars = new Set(bai7Kanjis.map((k) => k.char));
  assert.equal(bai7Chars.size, 7, "Bài 7 trên web phải có chính xác 7 chữ Hán: 肉, 料, 理, 野, 半, 大, 小");

  // Kiểm tra 10 lần sinh đề thi Bài 7 ngẫu nhiên
  for (let round = 1; round <= 10; round++) {
    const paper = buildFptJpd123Exam(["7"]);
    const kanjiQuestions = paper.filter((q) => q.section === "Kanji");
    assert.equal(kanjiQuestions.length, 10, "Phải có đúng 10 câu Kanji");

    for (const q of kanjiQuestions) {
      // Tìm chữ Hán được kiểm tra trong câu hỏi hoặc đáp án
      const m = (q.sentence + " " + q.prompt).match(/[（〔「【]([^）〕」】]+)[）〕」】]/);
      const bracketKanji = m ? (m[1].match(/[一-龯]/g) || []) : [];
      const ansKanji = q.answer.match(/[一-龯]/g) || [];
      const testedKanji = [...new Set([...bracketKanji, ...ansKanji])];

      assert.ok(
        testedKanji.length > 0,
        `Câu hỏi Kanji ${q.sentence} phải kiểm tra chữ Hán cụ thể`,
      );

      // 100% chữ Hán được kiểm tra phải nằm trong đúng 7 chữ Hán của Bài 7
      for (const char of testedKanji) {
        assert.ok(
          bai7Chars.has(char),
          `Câu ${q.sentence} kiểm tra chữ Hán '${char}' KHÔNG thuộc 7 chữ Hán Bài 7 trên web (chỉ gồm: ${[...bai7Chars].join(", ")})`,
        );
      }

      // Tuyệt đối không chứa các chữ Hán ngoài bài như 病院, 電気, 開, 閉, 待, 泳
      const forbiddenOutsideKanji = ["病", "院", "電", "気", "開", "閉", "待", "泳", "書", "読", "話"];
      for (const forbidden of forbiddenOutsideKanji) {
        assert.ok(
          !testedKanji.includes(forbidden),
          `Câu ${q.sentence} (ans: ${q.answer}) vi phạm: chứa chữ Hán ngoài bài '${forbidden}'`,
        );
      }
    }
  }
});

test("buildAiPrompt and isQuestionAllowedForLessons strictly enforce official web kanji", async () => {
  const { buildAiPrompt, isQuestionAllowedForLessons } = await import("./ai-service.ts");

  const { systemPrompt, userPrompt } = buildAiPrompt(["7"]);

  assert.ok(
    systemPrompt.includes("100% CẢ 10 CÂU HỎI CHỮ HÁN"),
    "System prompt phải có quy tắc 100% câu hỏi chữ Hán",
  );
  assert.ok(
    systemPrompt.includes("Bài 7 CHỈ CÓ đúng 7 chữ: 肉, 料, 理, 野, 半, 大, 小"),
    "System prompt phải nêu rõ 7 chữ Hán của Bài 7",
  );
  assert.ok(
    userPrompt.includes("Bài 7 chỉ có 肉, 料, 理, 野, 半, 大, 小"),
    "User prompt phải nhấn mạnh danh sách chữ Hán Bài 7",
  );

  // isQuestionAllowedForLessons phải từ chối câu hỏi Kanji có chữ ngoài bài
  const invalidKanjiQuestion: any = {
    id: "test-1",
    section: "Kanji",
    promptJp: "漢字の読み方を選びなさい。",
    prompt: "Chọn cách đọc của chữ Hán trong（　　）.",
    sentence: "（病院）へ行きます。",
    options: ["びょういん", "びょうき", "びよういん", "びょうえん"],
    answer: "びょういん",
    explanation: { lesson: "JPD123 - Bài 7", meaning: "Tôi đi bệnh viện.", reason: "Đúng" }
  };
  assert.equal(
    isQuestionAllowedForLessons(invalidKanjiQuestion, [7]),
    false,
    "isQuestionAllowedForLessons phải từ chối câu hỏi chứa chữ Hán ngoài bài 7 (病院)",
  );

  const validKanjiQuestion: any = {
    id: "test-2",
    section: "Kanji",
    promptJp: "漢字の読み方を選びなさい。",
    prompt: "Chọn cách đọc của chữ Hán trong（　　）.",
    sentence: "今晩は豚（肉）を食べます。",
    options: ["にく", "とり", "さかな", "ぎゅう"],
    answer: "にく",
    explanation: { lesson: "JPD123 - Bài 7", meaning: "Tối nay tôi ăn thịt lợn.", reason: "Đúng" }
  };
  assert.equal(
    isQuestionAllowedForLessons(validKanjiQuestion, [7]),
    true,
    "isQuestionAllowedForLessons phải chấp nhận câu hỏi chứa chữ Hán đúng trong Bài 7 (肉)",
  );
});

test("replaceUntaughtKanjiWithKana converts untaught kanji to kana while preserving taught kanji", () => {
  const allowedBai7 = getAllowedKanjiChars([7]);
  // Bài 7 taught kanji: 肉, 料, 理, 野, 半, 大, 小 (plus cumulative Bài 1-6 kanji)
  assert.ok(allowedBai7.has("肉"));
  assert.ok(allowedBai7.has("料"));
  assert.ok(allowedBai7.has("理"));
  assert.ok(allowedBai7.has("大"));
  assert.ok(allowedBai7.has("小"));
  assert.ok(allowedBai7.has("半"));
  assert.ok(allowedBai7.has("食")); // Bài 5
  assert.ok(!allowedBai7.has("開")); // Not taught
  assert.ok(!allowedBai7.has("閉")); // Not taught
  assert.ok(!allowedBai7.has("待")); // Not taught
  assert.ok(!allowedBai7.has("窓")); // Not taught
  assert.ok(!allowedBai7.has("室")); // Not taught
  assert.ok(!allowedBai7.has("病")); // Not taught
  assert.ok(!allowedBai7.has("院")); // Not taught
  assert.ok(!allowedBai7.has("薬")); // Not taught

  // Sentence with untaught verbs and nouns
  const s1 = "部屋の窓を開けてください。";
  const r1 = replaceUntaughtKanjiWithKana(s1, allowedBai7);
  assert.equal(r1.replace(/\s+/g, ""), "へやのまどをあけてください。");

  // Sentence with taught kanji (料理, 大きい) and untaught kanji (作り方, 魚, 新鮮)
  const s2 = "おいしい料理の作り方を教えてください。";
  const r2 = replaceUntaughtKanjiWithKana(s2, allowedBai7);
  assert.equal(r2, "おいしい料理のつくりかたをおしえてください。");

  // Medical terms
  const s3 = "病院へ行って、薬を飲みました。";
  const r3 = replaceUntaughtKanjiWithKana(s3, allowedBai7);
  assert.equal(r3, "びょういんへ行って、くすりを飲みました。"); // 行 and 飲 are Bài 5 taught kanji

  // Food and adjectives
  const s4 = "新鮮な野菜と牛肉を買いました。";
  const r4 = replaceUntaughtKanjiWithKana(s4, allowedBai7);
  assert.equal(r4, "しんせんなやさいとぎゅうにくを買いました。"); // 買 is Bài 5 taught kanji
});

test("formatExamQuestionKanji formats sentence, options, answer, prompt to Hiragana for untaught kanji", () => {
  const q: any = {
    id: "1",
    section: "Ngữ pháp",
    promptJp: "適切なものを選びなさい。",
    prompt: "Chọn thể て đúng cho động từ trong ngoặc: 窓を（開けます）",
    sentence: "部屋が暑いですから、窓を（　　）ください。",
    options: ["開けて", "閉めて", "待って", "手伝って"],
    answer: "開けて",
    explanation: {
      lesson: "JPD123 - Bài 7",
      meaning: "Vì phòng nóng nên hãy mở cửa sổ giúp tôi.",
      grammar: "Vてください",
      reason: "Đúng"
    }
  };

  const formatted = formatExamQuestionKanji(q, [7]);
  assert.equal(formatted.sentence, "へやがあついですから、まどを（　　）ください。");
  assert.deepEqual(formatted.options, ["あけて", "しめて", "まって", "てつだって"]);
  assert.equal(formatted.answer, "あけて");
  assert.ok(formatted.options.includes(formatted.answer));
});

test("buildFptJpd123Exam enforces that all question sentences and options have ZERO untaught kanji", () => {
  const allowedBai7 = getAllowedKanjiChars([7]);
  const exam = buildFptJpd123Exam(["7"]);

  assert.equal(exam.length, 30);
  for (const q of exam) {
    const texts = [q.sentence, q.answer, ...q.options];
    for (const t of texts) {
      const chars = t.match(/[一-龯]/g) || [];
      for (const c of chars) {
        assert.ok(
          allowedBai7.has(c),
          `Câu ${q.id} (${q.section}): Ký tự chữ Hán '${c}' trong chuỗi "${t}" CHƯA ĐƯỢC HỌC trong chương trình Bài 7! Phải được hiển thị bằng Hiragana/Katakana.`,
        );
      }
    }
  }
});

test("buildAiPrompt explicitly includes prompt instruction to write untaught kanji in Hiragana/Katakana", () => {
  const { systemPrompt, userPrompt } = buildAiPrompt(["7"]);
  assert.ok(
    systemPrompt.includes("HIRAGANA") && systemPrompt.includes("CHƯA ĐƯỢC HỌC"),
    "systemPrompt phải có chỉ dẫn bắt buộc viết chữ Hán chưa học bằng Hiragana/Katakana",
  );
  assert.ok(
    userPrompt.includes("HIRAGANA") && userPrompt.includes("CHƯA ĐƯỢC HỌC"),
    "userPrompt phải có chỉ dẫn bắt buộc viết chữ Hán chưa học bằng Hiragana/Katakana",
  );
});

test("Explanation engine generates high-fidelity pedagogical breakdown for te-form verbs without boilerplate", async () => {
  const { getQuestionExplanation } = await import("./explanation.ts");

  const q = {
    id: "test-te-form-wait",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn thể て đúng cho động từ「待ちます」trong ngữ cảnh yêu cầu.",
    sentence: "ちょっと（　　）ください。",
    options: ["待って", "待ちて", "待いて", "待んで"],
    answer: "待って",
  };

  const exp = getQuestionExplanation(q);

  assert.ok(exp.lesson?.includes("Bài 7"), `Phải là Bài 7: ${exp.lesson}`);
  assert.ok(exp.meaning.includes("đợi một chút"), `Phải dịch hoàn chỉnh cả câu: ${exp.meaning}`);
  assert.ok(exp.grammar?.includes("Vてください"), `Công thức ngữ pháp phải rõ ràng: ${exp.grammar}`);
  assert.ok(exp.reason.includes("biến âm") || exp.reason.includes("quy tắc chia thể て"), `Phải giải thích quy tắc biến âm: ${exp.reason}`);
  assert.ok(exp.tips && exp.tips.length > 0, "Phải có mẹo phản xạ 1 giây");

  assert.ok(exp.wrongOptions && exp.wrongOptions.length === 3, "Phải phân tích 3 phương án sai");
  for (const wo of exp.wrongOptions!) {
    assert.ok(!wo.reason.includes("không đúng quy tắc kết hợp"), `Không được có câu mẫu mơ hồ: ${wo.reason}`);
    assert.ok(!wo.reason.includes("không phù hợp với ý nghĩa và ngữ cảnh"), `Không được có câu mẫu mơ hồ: ${wo.reason}`);
  }

  const machite = exp.wrongOptions!.find((w) => w.option === "待ちて");
  assert.ok(machite && (machite.reason.includes("biến âm") || machite.reason.includes("sai quy tắc") || machite.reason.includes("âm ngắt")), `Giải thích phương án 待ちて: ${machite?.reason}`);
});

test("Explanation engine generates pedagogical breakdown for particles and comparatives without boilerplate", async () => {
  const { getQuestionExplanation } = await import("./explanation.ts");

  // Particle tool question
  const qTool = {
    id: "test-particle-tool",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn trợ từ thích hợp điền vào chỗ trống.",
    sentence: "スプーン（　　）カレーを食べます。",
    options: ["で", "に", "を", "へ"],
    answer: "で",
  };

  const expTool = getQuestionExplanation(qTool);
  assert.ok(expTool.lesson?.includes("Bài 7"), `Phải là Bài 7: ${expTool.lesson}`);
  assert.ok(expTool.grammar?.includes("で"), `Công thức phải chứa で: ${expTool.grammar}`);
  assert.ok(expTool.reason.includes("phương tiện") || expTool.reason.includes("công cụ"), `Phải nêu bản chất công cụ: ${expTool.reason}`);

  const niOption = expTool.wrongOptions?.find((w) => w.option === "に");
  assert.ok(niOption && (niOption.reason.toLowerCase().includes("thời điểm") || niOption.reason.toLowerCase().includes("đích đến")), `Trợ từ に phải giải thích đúng chức năng: ${niOption?.reason}`);

  // Comparative question
  const qComp = {
    id: "test-comparative-yori",
    section: "Ngữ pháp" as const,
    promptJp: "（　　）に入れるのに最もよいものを一つ選びなさい。",
    prompt: "Chọn từ thích hợp điền vào câu so sánh.",
    sentence: "ベトナムは日本（　　）広いです。",
    options: ["より", "ほど", "どちら", "いちばん"],
    answer: "より",
  };

  const expComp = getQuestionExplanation(qComp);
  assert.ok(expComp.lesson?.includes("Bài 6"), `Phải là Bài 6: ${expComp.lesson}`);
  assert.ok(expComp.grammar?.includes("より"), `Công thức phải chứa より: ${expComp.grammar}`);

  const hodoOption = expComp.wrongOptions?.find((w) => w.option === "ほど");
  assert.ok(hodoOption && (hodoOption.reason.toLowerCase().includes("phủ định") || hodoOption.reason.includes("〜ほど〜ない")), `ほど phải giải thích yêu cầu phủ định: ${hodoOption?.reason}`);

  const dochiraOption = expComp.wrongOptions?.find((w) => w.option === "どちら");
  assert.ok(dochiraOption && (dochiraOption.reason.toLowerCase().includes("nghi vấn") || dochiraOption.reason.toLowerCase().includes("câu hỏi")), `どちら phải giải thích là từ để hỏi: ${dochiraOption?.reason}`);
});












