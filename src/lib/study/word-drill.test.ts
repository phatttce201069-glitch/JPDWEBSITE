import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWordQuizQuestions,
  buildMatchRounds,
  questionForWord,
  optionsFor,
  shownReading,
  WORD_QUIZ_FORMS,
} from "./word-drill.ts";
import { vocabulary } from "./content.ts";

test("word-drill: buildWordQuizQuestions generates distinct questions and does not repeat", () => {
  const lesson1Words = vocabulary.filter((w) => w.lesson === "JPD113 - Bài 1");
  assert.ok(lesson1Words.length >= 20, "Lesson 1 should have plenty of words");

  // Round 1: 10 questions
  const round1 = buildWordQuizQuestions(lesson1Words, "meaning", { count: 10 });
  assert.equal(round1.questions.length, 10);
  assert.equal(round1.updatedUsedIds.length, 10);

  // Check unique questions in round 1
  const round1Ids = round1.questions.map((q) => q.wordId);
  assert.equal(new Set(round1Ids).size, 10, "All 10 questions in round 1 should have unique words");

  // Round 2: next 10 questions using updatedUsedIds
  const round2 = buildWordQuizQuestions(lesson1Words, "meaning", {
    count: 10,
    usedIds: round1.updatedUsedIds,
  });
  assert.equal(round2.questions.length, 10);
  const round2Ids = round2.questions.map((q) => q.wordId);

  // Round 2 should have DIFFERENT words from Round 1!
  const overlap = round2Ids.filter((id) => round1Ids.includes(id));
  assert.equal(
    overlap.length,
    0,
    `Round 2 must not repeat words from Round 1. Overlap found: ${overlap.join(",")}`,
  );
});

test("word-drill: handles small word pools (e.g. JPD123 with 3 words) with rich distractors", () => {
  const smallWords = vocabulary.filter((w) => w.lesson === "JPD123 - Bài 5 · Hội thoại");
  assert.ok(smallWords.length > 0 && smallWords.length <= 4, "Small lesson test");

  const result = buildWordQuizQuestions(smallWords, "word", { count: 3 });
  assert.ok(result.questions.length > 0);

  // Every choice question must have 4 options even if the lesson only has 3 words!
  for (const q of result.questions) {
    if (q.kind === "choice") {
      assert.equal(q.options.length, 4, "Question must have 4 options through fallback pool");
      const texts = q.options.map((o) => o.text);
      assert.equal(new Set(texts).size, 4, "Options must be unique");
      assert.ok(texts.includes(q.answer), "Options must contain correct answer");
    }
  }
});

test("word-drill: creates varied question formats across forms", () => {
  const lesson1Words = vocabulary.filter((w) => w.lesson === "JPD113 - Bài 1");

  // meaning
  const meaningQuestions = buildWordQuizQuestions(lesson1Words, "meaning", { count: 5 });
  assert.equal(meaningQuestions.questions.length, 5);
  assert.ok(meaningQuestions.questions.every((q) => q.kind === "choice"));

  // word
  const wordQuestions = buildWordQuizQuestions(lesson1Words, "word", { count: 5 });
  assert.equal(wordQuestions.questions.length, 5);
  assert.ok(wordQuestions.questions.every((q) => q.kind === "choice"));

  // reading
  const readingQuestions = buildWordQuizQuestions(lesson1Words, "reading", { count: 5 });
  assert.equal(readingQuestions.questions.length, 5);
  assert.ok(readingQuestions.questions.every((q) => q.kind === "type"));
  const firstQ = readingQuestions.questions[0];
  if (firstQ.kind === "type") {
    const primaryReading = firstQ.reveal.split(" · ")[0];
    assert.ok(firstQ.accept(primaryReading), `Should accept primary reading ${primaryReading}`);
  }

  // write
  const writeQuestions = buildWordQuizQuestions(lesson1Words, "write", { count: 5 });
  assert.equal(writeQuestions.questions.length, 5);
  assert.ok(writeQuestions.questions.every((q) => q.kind === "type"));

  // mix
  const mixQuestions = buildWordQuizQuestions(lesson1Words, "mix", { count: 8 });
  assert.equal(mixQuestions.questions.length, 8);
  const kinds = new Set(mixQuestions.questions.map((q) => q.kind));
  assert.ok(kinds.has("choice"), "Mix should include choice questions");
  assert.ok(kinds.has("type"), "Mix should include typing questions");
});

test("word-drill: buildMatchRounds rotates words and shuffles", () => {
  const lesson1Words = vocabulary.filter((w) => w.lesson === "JPD113 - Bài 1");
  const match1 = buildMatchRounds(lesson1Words);
  assert.ok(match1.rounds.length >= 1);
  assert.ok(match1.rounds[0].length >= 2);

  const match2 = buildMatchRounds(lesson1Words, match1.updatedUsedIds);
  assert.ok(match2.rounds.length >= 1);
});
