import test from "node:test";
import assert from "node:assert/strict";
import { buildFptJpd123Exam } from "./fpt-jpd123-engine.ts";
import { buildAiPrompt } from "./ai-service.ts";

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

    // Không chứa kiến thức đặc trưng Bài 6 (so sánh)
    assert.ok(!q.sentence.includes("より"), `Câu ${q.id} chứa 'より' của Bài 6`);
    assert.ok(!q.sentence.includes("ほど"), `Câu ${q.id} chứa 'ほど' của Bài 6`);

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
  assert.ok(systemPrompt.includes("TUYỆT ĐỐI KHÔNG xuất hiện bất kỳ câu hỏi hay cấu trúc so sánh nào của Bài 6"));
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
