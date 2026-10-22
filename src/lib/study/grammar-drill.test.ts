import test from "node:test";
import assert from "node:assert/strict";
import { buildGrammarDrill } from "./exam.ts";

test("buildGrammarDrill produces full 10-question drills for all Lessons 1 to 7", () => {
  for (let bai = 1; bai <= 7; bai++) {
    const paper = buildGrammarDrill(String(bai));
    assert.equal(paper.length, 10, `Bài ${bai} phải tạo ra đủ 10 câu hỏi trắc nghiệm`);

    for (const q of paper) {
      assert.ok(q.id.trim().length > 0, `Bài ${bai}: ID câu hỏi không được rỗng`);
      assert.ok(q.sentence.trim().length > 0, `Bài ${bai}: Nội dung câu hỏi không được rỗng`);
      assert.ok(q.answer.trim().length > 0, `Bài ${bai}: Đáp án không được rỗng`);
      assert.equal(q.options.length, 4, `Bài ${bai} câu ${q.id}: Phải có đúng 4 phương án A-D`);
      assert.equal(new Set(q.options).size, 4, `Bài ${bai} câu ${q.id}: 4 phương án không được trùng`);
      assert.ok(q.options.includes(q.answer), `Bài ${bai} câu ${q.id}: Phương án phải chứa đáp án đúng`);
    }
  }
});

test("buildGrammarDrill isolates section-specific questions for Bai 6", () => {
  // 1. So sánh hơn (6_1)
  const q61 = buildGrammarDrill("6", "6_1");
  assert.ok(q61.length >= 5, "Phần 6_1 phải có ít nhất 5 câu hỏi");
  for (const q of q61) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("より") || text.includes("hơn") || text.includes("So sánh") || text.includes("so sánh"),
      `Câu ${q.id} phải thuộc chuyên đề So sánh hơn: ${text}`,
    );
  }

  // 2. So sánh kém (6_2)
  const q62 = buildGrammarDrill("6", "6_2");
  assert.ok(q62.length >= 4, "Phần 6_2 phải có ít nhất 4 câu hỏi");

  // 3. So sánh nhất (6_3)
  const q63 = buildGrammarDrill("6", "6_3");
  assert.ok(q63.length >= 4, "Phần 6_3 phải có ít nhất 4 câu hỏi");

  // 4. Lượng từ mai (6_7)
  const q67 = buildGrammarDrill("6", "6_7");
  assert.ok(q67.length >= 4, "Phần 6_7 phải có ít nhất 4 câu hỏi");
  for (const q of q67) {
    const text = `${q.prompt} ${q.sentence} ${q.answer}`;
    assert.ok(
      text.includes("まい") || text.includes("枚") || text.includes("mỏng") || text.includes("CD") || text.includes("シャツ"),
      `Câu ${q.id} phải thuộc lượng từ đếm vật mỏng: ${text}`,
    );
  }
});

test("buildGrammarDrill supports multi-section selection", () => {
  const paper = buildGrammarDrill("6", "6_1,6_2");
  assert.ok(paper.length >= 8, "Luyện 2 phần 6_1 và 6_2 phải tạo ra ít nhất 8 câu hỏi");
  for (const q of paper) {
    assert.equal(q.options.length, 4);
    assert.ok(q.options.includes(q.answer));
  }
});

test("buildGrammarDrill returns empty array for invalid inputs", () => {
  assert.deepEqual(buildGrammarDrill("0"), []);
  assert.deepEqual(buildGrammarDrill("8"), []);
  assert.deepEqual(buildGrammarDrill("abc"), []);
});
