import test from "node:test";
import assert from "node:assert/strict";
import {
  hasKanji,
  toKana,
  getSentenceReading,
  getOptionReading,
} from "./kana-reading.ts";
import { buildGrammarDrill, type ExamQuestion } from "./exam.ts";

test("hasKanji correctly detects presence of Kanji", () => {
  assert.equal(hasKanji("日本語"), true);
  assert.equal(hasKanji("富士山"), true);
  assert.equal(hasKanji("A は B より Adj です"), false);
  assert.equal(hasKanji("にほんご"), false);
  assert.equal(hasKanji("ラーメン"), false);
  assert.equal(hasKanji(""), false);
});

test("toKana converts Kanji to Hiragana while preserving blanks and punctuation", () => {
  const sentence = "日本語は英語（　　）難しいです。";
  const reading = toKana(sentence);
  assert.equal(hasKanji(reading), false);
  assert.ok(reading.includes("にほんご"));
  assert.ok(reading.includes("えいご"));
  assert.ok(reading.includes("むずかしい"));
  assert.ok(reading.includes("（　　）"));
});

test("toKana converts comparative sentences in Bai 6 accurately", () => {
  const s1 = "東京は大阪より大きいです。";
  assert.equal(toKana(s1), "とうきょうはおおさかよりおおきいです。");

  const s2 = "一年で八月がいちばん暑いです。";
  const r2 = toKana(s2);
  assert.equal(hasKanji(r2), false);
  assert.ok(r2.includes("いちねん"));
  assert.ok(r2.includes("はちがつ"));
  assert.ok(r2.includes("あつい"));

  const s3 = "電車はバスより速いです。";
  assert.equal(toKana(s3), "でんしゃはバスよりはやいです。");
});

test("getSentenceReading prioritizes question.reading if present", () => {
  const mockQ: ExamQuestion = {
    id: "test-1",
    section: "Ngữ pháp",
    promptJp: "Chọn từ",
    prompt: "Chọn từ thích hợp",
    sentence: "日本語は英語より（　　）です。",
    reading: "にほんごはえいごより（　　）です。",
    options: ["A", "B", "C", "D"],
    answer: "A",
  };

  const reading = getSentenceReading(mockQ.sentence, mockQ);
  assert.equal(reading, "にほんごはえいごより（　　）です。");
});

test("getSentenceReading returns null for pure Vietnamese prompt sentences", () => {
  const viSentence = "Dịch sang tiếng Nhật: Tiếng Nhật khó hơn tiếng Anh.";
  assert.equal(getSentenceReading(viSentence), null);
});

test("getOptionReading returns Hiragana for options containing Kanji and null for pure Kana", () => {
  // Option containing Kanji
  const optKanji = "電車はバスより速いです。";
  const optReading = getOptionReading(optKanji);
  assert.ok(optReading !== null);
  assert.equal(hasKanji(optReading!), false);
  assert.ok(optReading!.includes("でんしゃ"));
  assert.ok(optReading!.includes("はやい"));

  // Option containing only Kana
  const optKana = "より";
  assert.equal(getOptionReading(optKana), null);

  const optKana2 = "ほど";
  assert.equal(getOptionReading(optKana2), null);
});

test("buildGrammarDrill questions provide valid readings for Kanji sentences", () => {
  // Test Bài 6 section 6_1 (So sánh hơn)
  const drill6_1 = buildGrammarDrill("6", "6_1");
  assert.ok(drill6_1.length > 0);

  for (const q of drill6_1) {
    if (hasKanji(q.sentence)) {
      const reading = getSentenceReading(q.sentence, q);
      assert.ok(reading !== null, `Failed to generate reading for: ${q.sentence}`);
      assert.equal(hasKanji(reading!), false, `Reading still contains Kanji: ${reading}`);
    }
  }

  // Test Bài 6 section 6_3 (So sánh nhất)
  const drill6_3 = buildGrammarDrill("6", "6_3");
  assert.ok(drill6_3.length > 0);

  for (const q of drill6_3) {
    if (hasKanji(q.sentence)) {
      const reading = getSentenceReading(q.sentence, q);
      assert.ok(reading !== null, `Failed to generate reading for: ${q.sentence}`);
      assert.equal(hasKanji(reading!), false, `Reading still contains Kanji: ${reading}`);
    }
  }
});
