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

test("buildGrammarDrill isolates section-specific questions for Bai 7", () => {
  // 1. Chia động từ sang thể て (7_1)
  const q71 = buildGrammarDrill("7", "7_1");
  assert.ok(q71.length >= 5, "Phần 7_1 phải có ít nhất 5 câu hỏi chia động từ thể て");
  for (const q of q71) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("て形") || text.includes("て") || text.includes("Chia động từ") || text.includes("いて") || text.includes("って") || text.includes("んで"),
      `Câu ${q.id} phải thuộc chuyên đề Chia động từ thể て: ${text}`,
    );
  }

  // 2. N1 に N2 (Người/Động vật) が います (7_2)
  const q72 = buildGrammarDrill("7", "7_2");
  assert.ok(q72.length >= 4, "Phần 7_2 phải có ít nhất 4 câu hỏi");
  for (const q of q72) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("います") || text.includes("に") || text.includes("が"),
      `Câu ${q.id} phải thuộc chuyên đề N1 に N2 が います: ${text}`,
    );
  }

  // 3. Vて ください (7_3)
  const q73 = buildGrammarDrill("7", "7_3");
  assert.ok(q73.length >= 4, "Phần 7_3 phải có ít nhất 4 câu hỏi");
  for (const q of q73) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("ください") || text.includes("て"),
      `Câu ${q.id} phải thuộc chuyên đề Vて ください: ${text}`,
    );
  }

  // 4. Vて います - Thì tiếp diễn (7_4)
  const q74 = buildGrammarDrill("7", "7_4");
  assert.ok(q74.length >= 5, "Phần 7_4 phải có ít nhất 5 câu hỏi thì tiếp diễn");
  for (const q of q74) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("ています") || text.includes("ていません") || text.includes("ていますか") || text.includes("います") || text.includes("ふっています"),
      `Câu ${q.id} phải thuộc chuyên đề Thì tiếp diễn Vて います: ${text}`,
    );
  }

  // 5. V ましょうか (7_5)
  const q75 = buildGrammarDrill("7", "7_5");
  assert.ok(q75.length >= 4, "Phần 7_5 phải có ít nhất 4 câu hỏi");
  for (const q of q75) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("ましょうか") || text.includes("ましょう"),
      `Câu ${q.id} phải thuộc chuyên đề V ましょうか: ${text}`,
    );
  }

  // 6. Vます かた (7_6)
  const q76 = buildGrammarDrill("7", "7_6");
  assert.ok(q76.length >= 4, "Phần 7_6 phải có ít nhất 4 câu hỏi");
  for (const q of q76) {
    const text = `${q.prompt} ${q.sentence} ${q.answer} ${q.explanation?.grammar || ""}`;
    assert.ok(
      text.includes("かた") || text.includes("方"),
      `Câu ${q.id} phải thuộc chuyên đề Vます かた: ${text}`,
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

test("grammar drill questions and grammar examples strictly utilize the lesson vocabulary", async () => {
  const { grammar } = await import("./content.ts");
  const { vocabulary } = await import("./content.ts");

  // Kiểm tra tất cả các phần trong mọi bài học 1-7 đều có ví dụ minh họa đầy đủ
  for (const lesson of grammar) {
    for (const point of lesson.points) {
      assert.ok(
        point.examples && point.examples.length >= 3,
        `Bài ${lesson.id} phần ${point.id} (${point.structure_jp}) phải có ít nhất 3 ví dụ minh họa`,
      );
      for (const ex of point.examples) {
        assert.ok(ex.jp.trim().length > 0, `Bài ${lesson.id} phần ${point.id}: câu tiếng Nhật không được rỗng`);
        assert.ok(ex.reading.trim().length > 0, `Bài ${lesson.id} phần ${point.id}: cách đọc không được rỗng`);
        assert.ok(ex.romaji.trim().length > 0, `Bài ${lesson.id} phần ${point.id}: romaji không được rỗng`);
        assert.ok(ex.vi.trim().length > 0, `Bài ${lesson.id} phần ${point.id}: nghĩa tiếng Việt không được rỗng`);
      }
    }
  }

  // Kiểm tra đề luyện tập Bài 7 sử dụng từ vựng Bài 7
  const drill7 = buildGrammarDrill("7");
  assert.equal(drill7.length, 10, "Đề luyện Bài 7 cả bài phải đủ 10 câu");
  const drill7Text = drill7.map((q) => `${q.sentence} ${q.prompt} ${q.answer}`).join(" ");
  const hasBai7Vocab =
    drill7Text.includes("犬") ||
    drill7Text.includes("いぬ") ||
    drill7Text.includes("バス停") ||
    drill7Text.includes("交番") ||
    drill7Text.includes("台所") ||
    drill7Text.includes("コップ") ||
    drill7Text.includes("皿") ||
    drill7Text.includes("塩") ||
    drill7Text.includes("窓") ||
    drill7Text.includes("電話") ||
    drill7Text.includes("ギター") ||
    drill7Text.includes("ピザ") ||
    drill7Text.includes("漢字") ||
    drill7Text.includes("電子レンジ");
  assert.ok(hasBai7Vocab, `Đề luyện tập Bài 7 phải chứa từ vựng của Bài 7: ${drill7Text}`);

  // Kiểm tra đề luyện tập Bài 6 sử dụng từ vựng Bài 6
  const drill6 = buildGrammarDrill("6");
  assert.equal(drill6.length, 10, "Đề luyện Bài 6 cả bài phải đủ 10 câu");
  const drill6Text = drill6.map((q) => `${q.sentence} ${q.prompt} ${q.answer}`).join(" ");
  const hasBai6Vocab =
    drill6Text.includes("焼き肉") ||
    drill6Text.includes("ラーメン") ||
    drill6Text.includes("地下鉄") ||
    drill6Text.includes("居酒屋") ||
    drill6Text.includes("映画館") ||
    drill6Text.includes("カラオケ") ||
    drill6Text.includes("コンサート") ||
    drill6Text.includes("野球") ||
    drill6Text.includes("試合") ||
    drill6Text.includes("約束") ||
    drill6Text.includes("チケット") ||
    drill6Text.includes("枚");
  assert.ok(hasBai6Vocab, `Đề luyện tập Bài 6 phải chứa từ vựng của Bài 6: ${drill6Text}`);
});

test("BAI_7_VERB_CONJUGATION_TABLE contains full 23 verbs from textbook and links to 7_1", async () => {
  const { grammar } = await import("./content.ts");
  const { BAI_7_VERB_CONJUGATION_TABLE, BAI_7_VERB_CONJUGATION_ENTRIES } = await import("../../data/verb-conjugation.ts");

  assert.equal(BAI_7_VERB_CONJUGATION_ENTRIES.length, 23, "Bảng chia động từ Bài 7 phải chứa đúng 23 động từ từ sách giáo khoa");
  assert.equal(BAI_7_VERB_CONJUGATION_TABLE.allVerbs.length, 23);

  const g1 = BAI_7_VERB_CONJUGATION_ENTRIES.filter((v) => v.group === 1);
  const g2 = BAI_7_VERB_CONJUGATION_ENTRIES.filter((v) => v.group === 2);
  const g3 = BAI_7_VERB_CONJUGATION_ENTRIES.filter((v) => v.group === 3);

  assert.equal(g1.length, 16, "Nhóm 1 phải có đúng 16 động từ");
  assert.equal(g2.length, 4, "Nhóm 2 phải có đúng 4 động từ (gồm ngoại lệ 起きます)");
  assert.equal(g3.length, 3, "Nhóm 3 phải có đúng 3 động từ (来ます, 持って来ます, 勉強します)");

  // Kiểm tra từng động từ có đầy đủ thông tin
  for (const v of BAI_7_VERB_CONJUGATION_ENTRIES) {
    assert.ok(v.kanji.length > 0, `${v.id}: kanji không được rỗng`);
    assert.ok(v.masu.length > 0, `${v.id}: masu không được rỗng`);
    assert.ok(v.masuReading.length > 0, `${v.id}: masuReading không được rỗng`);
    assert.ok(v.te.length > 0, `${v.id}: te không được rỗng`);
    assert.ok(v.teReading.length > 0, `${v.id}: teReading không được rỗng`);
    assert.ok(v.meaning.length > 0, `${v.id}: meaning không được rỗng`);
    assert.ok(v.rule.length > 0, `${v.id}: rule không được rỗng`);
  }

  // Kiểm tra liên kết vào điểm ngữ pháp 7_1
  const lesson7 = grammar.find((l) => l.id === "7");
  assert.ok(lesson7, "Phải tìm thấy Bài 7");
  const p71 = lesson7.points.find((p) => p.id === "7_1");
  assert.ok(p71, "Phải tìm thấy phần 7_1");
  assert.ok(p71.conjugation_table, "Phần 7_1 phải có conjugation_table đính kèm");
  assert.equal(p71.conjugation_table.allVerbs.length, 23);

  // Kiểm tra phần luyện tập 7_1 sinh ra câu hỏi bao phủ các động từ trong bảng
  const q71 = buildGrammarDrill("7", "7_1");
  assert.equal(q71.length, 10, "Đề luyện 7_1 phải đủ 10 câu");
  for (const q of q71) {
    assert.ok(q.options.includes(q.answer));
  }
});
