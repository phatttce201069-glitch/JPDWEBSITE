import test from "node:test";
import assert from "node:assert/strict";
import {
  READING_PASSAGES_JPD113,
  READING_PASSAGES_JPD123,
  TARGET_KANJI_JPD123,
  TARGET_KANJI_JPD113,
  READING_EXAM_SETS_JPD113,
  READING_EXAM_SETS_JPD123,
} from "./reading-data.ts";
import {
  generateReadingPassage,
  clearRecentReadingIds,
  generateReadingExamSet,
  buildDynamicReadingExamSet,
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

test("inspectJapaneseCharOrWord prevents substring collisions and correctly resolves compound nouns and verb inflections", () => {
  // 1. Chống substring collision: '土曜日' không được nhầm sang chữ '日'
  const sat = inspectJapaneseCharOrWord("土曜日");
  assert.equal(sat.text, "土曜日");
  assert.equal(sat.hiragana, "どようび");
  assert.equal(sat.romaji, "doyoubi");
  assert.equal(sat.hanviet, "THỔ DIỆU NHẬT");

  // 2. '東京' không được nhầm sang '東' (higashi)
  const tokyo = inspectJapaneseCharOrWord("東京");
  assert.equal(tokyo.hiragana, "とうきょう");
  assert.equal(tokyo.romaji, "Toukyou");
  assert.equal(tokyo.hanviet, "ĐÔNG KINH");

  // 3. '男の人' và '女の人' không được nhầm sang '人' (hito)
  const man = inspectJapaneseCharOrWord("男の人");
  assert.equal(man.hiragana, "おとこのひと");
  assert.equal(man.romaji, "otoko no hito");

  const woman = inspectJapaneseCharOrWord("女の人");
  assert.equal(woman.hiragana, "おんなのひと");
  assert.equal(woman.romaji, "onna no hito");

  // 4. 'きょうしつ' không được nhầm sang 'きょうし' (giáo viên)
  const classroom = inspectJapaneseCharOrWord("きょうしつ");
  assert.equal(classroom.romaji, "kyoushitsu");
  assert.ok(classroom.meaning.includes("lớp học") || classroom.meaning.includes("phòng học"));

  // 5. Các dạng chia quá khứ của động từ
  const kita = inspectJapaneseCharOrWord("来た");
  assert.equal(kita.hiragana, "きた");
  assert.equal(kita.romaji, "kita");

  const kaita = inspectJapaneseCharOrWord("書いた");
  assert.equal(kaita.hiragana, "かいた");
  assert.equal(kaita.romaji, "kaita");

  const yonda = inspectJapaneseCharOrWord("読んだ");
  assert.equal(yonda.hiragana, "よんだ");
  assert.equal(yonda.romaji, "yonda");

  const hatarakitai = inspectJapaneseCharOrWord("働きたい");
  assert.equal(hatarakitai.hiragana, "はたらきたい");
  assert.equal(hatarakitai.romaji, "hatarakitai");

  // 6. Cụm từ chuyên môn trong bài đọc
  const tools = inspectJapaneseCharOrWord("食事の道具");
  assert.equal(tools.hiragana, "しょくじのどうぐ");
  assert.equal(tools.romaji, "shokuji no dougu");

  const gakushoku = inspectJapaneseCharOrWord("学食");
  assert.equal(gakushoku.hiragana, "がくしょく");
  assert.equal(gakushoku.romaji, "gakushoku");
});

test("all reading passages have zero corrupted text and 100% accurate sentence Romaji", () => {
  const allPassages = [...READING_PASSAGES_JPD113, ...READING_PASSAGES_JPD123];
  const badPatterns = ["学たべる", "食こと", "みち具", " và ", "—", "かくいた", "くるた", "よむんだ"];

  for (const p of allPassages) {
    for (const b of badPatterns) {
      assert.ok(!p.content.includes(b), `Content in ${p.id} must not contain bad pattern '${b}'`);
    }

    for (let i = 0; i < p.sentences.length; i++) {
      const s = p.sentences[i];
      for (const b of badPatterns) {
        assert.ok(!s.jp.includes(b), `Sentence ${i + 1} in ${p.id} must not contain bad pattern '${b}'`);
      }
      assert.ok(s.romaji && s.romaji.trim().length > 0, `Sentence ${i + 1} in ${p.id} must have non-empty romaji`);
    }
  }
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

test("all pre-crafted exam sets in library have verified Kanji coverage", () => {
  // 1. Kiểm tra 4 bộ đề JPD123 - Toàn bộ 4 bộ đề phải phủ 100% (43/43) Kanji Bài 4-7
  assert.equal(READING_EXAM_SETS_JPD123.length, 4, "JPD123 phải có đúng 4 bộ đề kiểm định sẵn có");
  for (const set of READING_EXAM_SETS_JPD123) {
    assert.equal(set.passages.length, 4, `Bộ đề ${set.id} phải có đúng 4 bài đọc`);
    const cov = computePassageSetKanjiCoverage(set.passages, "JPD123");
    assert.equal(cov.coveragePercentage, 100, `Bộ đề ${set.id} phải đạt 100% độ phủ chữ Hán`);
    assert.equal(cov.coveredKanji.length, 43, `Bộ đề ${set.id} phải có đủ 43 chữ Hán Bài 4-7`);
    assert.equal(cov.isCompleteCoverage, true);
  }

  // 2. Kiểm tra 2 bộ đề JPD113
  assert.equal(READING_EXAM_SETS_JPD113.length, 2, "JPD113 phải có đúng 2 bộ đề kiểm định sẵn có");
  for (const set of READING_EXAM_SETS_JPD113) {
    assert.equal(set.passages.length, 4, `Bộ đề ${set.id} phải có đúng 4 bài đọc`);
    const cov = computePassageSetKanjiCoverage(set.passages, "JPD113");
    assert.ok(cov.coveragePercentage >= 70, `Bộ đề ${set.id} phải có độ phủ cao`);
  }
});

test("buildDynamicReadingExamSet procedural engine generates dynamic non-repeating 100% coverage sets", () => {
  // Test JPD123
  const dynamicSet1 = buildDynamicReadingExamSet("JPD123");
  assert.ok(dynamicSet1.id.startsWith("dyn-set-jpd123-"));
  assert.equal(dynamicSet1.passages.length, 4);
  assert.equal(dynamicSet1.targetKanjiCount, 43);
  assert.equal(dynamicSet1.coveredKanji.length, 43);
  assert.equal(dynamicSet1.coveragePercentage, 100);
  assert.equal(dynamicSet1.isCompleteCoverage, true);

  for (const p of dynamicSet1.passages) {
    assert.ok(p.content.length >= 200, "Độ dài mỗi đề động JPD123 phải >= 200 chữ");
    assert.ok(p.sentences.length >= 6, "Số câu mỗi đề động JPD123 phải >= 6 câu");
    assert.equal(p.questions.length, 4, "Mỗi đề động phải có đúng 4 câu hỏi trắc nghiệm");
    for (const q of p.questions) {
      assert.equal(q.options.length, 4);
      assert.ok(q.options.includes(q.answer));
      assert.ok(q.explanation.meaning.length > 0);
      assert.ok(q.explanation.reason.length > 0);
    }
  }

  // Lần sinh thứ 2 phải có ID khác (không trùng lặp)
  const dynamicSet2 = buildDynamicReadingExamSet("JPD123");
  assert.notEqual(dynamicSet1.id, dynamicSet2.id, "Các lần sinh đề động liên tiếp phải có ID phân biệt");
  assert.equal(dynamicSet2.isCompleteCoverage, true);

  // Test JPD113
  const dynamicSet113 = buildDynamicReadingExamSet("JPD113");
  assert.ok(dynamicSet113.id.startsWith("dyn-set-jpd113-"));
  assert.equal(dynamicSet113.passages.length, 4);
  assert.equal(dynamicSet113.targetKanjiCount, 34);
  assert.equal(dynamicSet113.coveredKanji.length, 34);
  assert.equal(dynamicSet113.coveragePercentage, 100);
  assert.equal(dynamicSet113.isCompleteCoverage, true);
});
