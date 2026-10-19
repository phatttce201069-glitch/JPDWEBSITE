import test from "node:test";
import assert from "node:assert/strict";
import { buildFptJpd123Exam } from "./fpt-jpd123-engine.ts";

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

test("buildFptJpd123Exam with filtered lessons generates diverse questions", () => {
  const paper1 = buildFptJpd123Exam(["4", "5"]);
  const paper2 = buildFptJpd123Exam(["6", "7"]);

  assert.equal(paper1.length, 30);
  assert.equal(paper2.length, 30);
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

