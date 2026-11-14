import test from "node:test";
import assert from "node:assert/strict";
import {
  READING_PASSAGES_JPD113,
  READING_PASSAGES_JPD123,
  TARGET_KANJI_JPD123,
  READING_EXAM_SETS_JPD123,
} from "./reading-data.ts";
import {
  generateReadingPassage,
  clearRecentReadingIds,
  generateReadingExamSet,
  clearRecentReadingSetIds,
  computePassageSetKanjiCoverage,
  sanitizeReadingPassageKanji,
} from "./reading-engine.ts";
import {
  inspectJapaneseCharOrWord,
  passageToRomaji,
} from "./reading-inspector.ts";
import { buildReadingAiPrompt, buildReadingAiSetPrompt } from "./reading-ai.ts";
import { getAllowedKanjiChars } from "./kana-reading.ts";

test("JPD113 reading passages strictly use only official JPD113 Kanji and vocabulary", () => {
  const allowedKanji113 = getAllowedKanjiChars([1, 2, 3]);

  for (const passage of READING_PASSAGES_JPD113) {
    assert.equal(passage.course, "JPD113");
    assert.ok(passage.title.trim().length > 0);
    assert.ok(passage.content.trim().length > 0);
    assert.ok(passage.sentences.length >= 3, "Bài đọc JPD113 phải có ít nhất 3 câu");

    // Kiểm tra độ dài: JPD113 ngắn hơn JPD123
    assert.ok(
      passage.content.length <= 160,
      `Bài đọc JPD113 (${passage.title}) phải ngắn gọn (dưới 160 ký tự), nhận được: ${passage.content.length}`,
    );

    // Kiểm tra 100% chữ Hán trong bài đọc phải thuộc danh sách cho phép của Bài 1, 2, 3
    const kanjiChars = passage.content.match(/[一-龯]/g) || [];
    for (const c of kanjiChars) {
      assert.ok(
        allowedKanji113.has(c),
        `Bài đọc JPD113 "${passage.title}" chứa chữ Hán '${c}' chưa học trong Bài 1-3!`,
      );
    }

    // Kiểm tra câu hỏi đọc hiểu
    assert.ok(passage.questions.length >= 3, "Phải có ít nhất 3 câu hỏi đọc hiểu");
    for (const q of passage.questions) {
      assert.equal(q.options.length, 4, "Mỗi câu hỏi phải có đúng 4 lựa chọn");
      assert.ok(q.options.includes(q.answer), "Đáp án đúng phải nằm trong 4 lựa chọn");
      assert.ok(q.explanation.meaning.trim().length > 0);
      assert.ok(q.explanation.reason.trim().length > 0);
    }
  }
});

test("JPD123 reading passages are longer and strictly use only official JPD123 Kanji and vocabulary", () => {
  const allowedKanji123 = getAllowedKanjiChars([1, 2, 3, 4, 5, 6, 7]);

  for (const passage of READING_PASSAGES_JPD123) {
    assert.equal(passage.course, "JPD123");
    assert.ok(passage.title.trim().length > 0);
    assert.ok(passage.content.trim().length > 0);
    assert.ok(passage.sentences.length >= 6, "Bài đọc JPD123 chuẩn đề thi FPT phải có ít nhất 6 câu");

    // Kiểm tra độ dài: JPD123 thực tế dài và giàu ngữ cảnh (200-280 ký tự)
    assert.ok(
      passage.content.length >= 200,
      `Bài đọc JPD123 (${passage.title}) phải đạt độ dài chuẩn đề thi FPT (ít nhất 200 ký tự), nhận được: ${passage.content.length}`,
    );

    // Kiểm tra mật độ Katakana: Mỗi bài đọc JPD123 phải chứa ít nhất 3 từ mượn Katakana từ giáo trình Bài 1-7
    const katakanaMatches = passage.content.match(/[\u30A0-\u30FF]+/g) || [];
    assert.ok(
      katakanaMatches.length >= 3,
      `Bài đọc JPD123 (${passage.title}) phải chứa ít nhất 3 từ Katakana, nhận được: ${katakanaMatches.length}`,
    );

    // Kiểm tra 100% chữ Hán trong bài đọc phải thuộc danh sách cho phép của Bài 1-7
    const kanjiChars = passage.content.match(/[一-龯]/g) || [];
    assert.ok(
      kanjiChars.length >= 15,
      `Bài đọc JPD123 (${passage.title}) phải có mật độ chữ Hán cao (ít nhất 15 chữ Hán), nhận được: ${kanjiChars.length}`,
    );
    for (const c of kanjiChars) {
      assert.ok(
        allowedKanji123.has(c),
        `Bài đọc JPD123 "${passage.title}" chứa chữ Hán '${c}' chưa học trong Bài 1-7!`,
      );
    }

    // Kiểm tra câu hỏi đọc hiểu
    assert.ok(passage.questions.length >= 4, "Phải có ít nhất 4 câu hỏi đọc hiểu phân hóa");
    for (const q of passage.questions) {
      assert.equal(q.options.length, 4, "Mỗi câu hỏi phải có đúng 4 lựa chọn");
      assert.ok(q.options.includes(q.answer), "Đáp án đúng phải nằm trong 4 lựa chọn");
      assert.ok(q.explanation.meaning.trim().length > 0);
      assert.ok(q.explanation.reason.trim().length > 0);
      assert.ok(q.explanation.wrongOptions);
      assert.equal(q.explanation.wrongOptions.length, 3, "Phải giải thích rõ ràng 3 phương án sai");
    }
  }
});

test("generateReadingPassage respects anti-repetition session cache and rotates passages", () => {
  clearRecentReadingIds();

  // Lượt 1
  const p1 = generateReadingPassage("JPD113");
  assert.ok(p1 && p1.id);

  // Lượt 2: không được trùng với p1
  const p2 = generateReadingPassage("JPD113");
  assert.ok(p2 && p2.id);
  assert.notEqual(p1.id, p2.id, "Lượt 2 không được lặp lại bài đọc của lượt 1");

  // Lượt 3: không được trùng với p2
  const p3 = generateReadingPassage("JPD113");
  assert.ok(p3 && p3.id);
  assert.notEqual(p2.id, p3.id, "Lượt 3 không được lặp lại bài đọc của lượt 2");
});

test("inspectJapaneseCharOrWord correctly returns Romaji, Hiragana and Hanviet for double-click", () => {
  // Tra chữ Hán đơn lẻ
  const k1 = inspectJapaneseCharOrWord("日");
  assert.equal(k1.isKanji, true);
  assert.ok(k1.romaji.length > 0);
  assert.equal(k1.hanviet, "NHẬT");

  // Tra từ vựng có trong bài
  const w1 = inspectJapaneseCharOrWord("料理");
  assert.equal(w1.isKanji, true);
  assert.equal(w1.hiragana, "りょうり");
  assert.equal(w1.romaji, "ryouri");
  assert.ok(w1.meaning.toLowerCase().includes("món ăn") || w1.meaning.toLowerCase().includes("nấu") || w1.meaning.toLowerCase().includes("ẩm thực"));

  // Tra Kana
  const kana = inspectJapaneseCharOrWord("あした");
  assert.equal(kana.isKanji, false);
  assert.equal(kana.romaji, "ashita");
});

test("passageToRomaji transliterates full Japanese text into clean Romaji", () => {
  const romaji = passageToRomaji("わたしはナムです。");
  assert.ok(romaji.includes("watashi") && romaji.includes("namu") && romaji.includes("desu"));
});

test("buildReadingAiPrompt correctly configures length and kanji constraints for both courses", () => {
  const p113 = buildReadingAiPrompt("JPD113");
  assert.ok(p113.systemPrompt.includes("Ngắn gọn") && p113.systemPrompt.includes("80 đến 130"));
  assert.ok(p113.systemPrompt.includes("34 chữ Hán"));

  const p123 = buildReadingAiPrompt("JPD123");
  assert.ok(p123.systemPrompt.includes("Dài hơn") && p123.systemPrompt.includes("200 đến 280"));
  assert.ok(p123.systemPrompt.includes("KATAKANA"));
  assert.ok(p123.systemPrompt.includes("Bài 7"));
});

test("generateReadingExamSet creates 4-exam sets covering 100% of Bài 4-7 Kanji for JPD123", () => {
  clearRecentReadingSetIds();

  // Tạo bộ 4 đề JPD123
  const examSet = generateReadingExamSet("JPD123");
  assert.ok(examSet.id);
  assert.equal(examSet.course, "JPD123");
  assert.equal(examSet.passages.length, 4, "Bộ đề thi phải có đúng 4 đề");

  // Kiểm tra từng đề trong bộ 4 đề
  for (let i = 0; i < examSet.passages.length; i++) {
    const p = examSet.passages[i];
    assert.ok(p.content.length >= 200, `Đề ${i + 1} phải đạt độ dài chuẩn FPT (>= 200 chữ)`);
    assert.ok(p.questions.length >= 4, `Đề ${i + 1} phải có ít nhất 4 câu hỏi trắc nghiệm`);
  }

  // Kiểm tra độ phủ chữ Hán: Bắt buộc phủ 100% (43/43 chữ Hán Bài 4 đến 7)
  assert.equal(examSet.targetKanjiCount, 43, "Tổng số chữ Hán mục tiêu Bài 4-7 là 43");
  assert.equal(examSet.coveredKanji.length, 43, "Bộ 4 đề phải phủ đủ 43 chữ Hán Bài 4-7");
  assert.equal(examSet.coveragePercentage, 100, "Tỷ lệ phủ chữ Hán phải đạt 100%");
  assert.equal(examSet.isCompleteCoverage, true, "Đạt chuẩn hoàn chỉnh 100% độ phủ chữ Hán");

  // Kiểm tra xoay vòng bộ đề (excludeSetId)
  const nextSet = generateReadingExamSet("JPD123", { excludeSetId: examSet.id });
  assert.ok(nextSet.id);
  assert.notEqual(nextSet.id, examSet.id, "Bộ đề tiếp theo phải khác bộ đề hiện tại");
  assert.equal(nextSet.isCompleteCoverage, true);
  assert.equal(nextSet.coveredKanji.length, 43);
});

test("buildReadingAiSetPrompt requires 4 exams and complete 43/43 kanji coverage for JPD123", () => {
  const promptData = buildReadingAiSetPrompt("JPD123");
  const upper = promptData.systemPrompt.toUpperCase();
  assert.ok(upper.includes("4 BÀI ĐỌC") || upper.includes("4 ĐỀ"));
  assert.ok(upper.includes("43"));
  assert.ok(upper.includes("BÀI 4"));
  assert.ok(upper.includes("KATAKANA"));
});
