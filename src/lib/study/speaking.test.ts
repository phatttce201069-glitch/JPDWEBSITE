import test from "node:test";
import assert from "node:assert/strict";
import {
  SPEAKING_EXAMS_JPD113,
  SPEAKING_EXAMS_JPD123,
} from "./speaking-data.ts";
import {
  generateSpeakingExam,
  buildDynamicSpeakingExam,
  clearRecentSpeakingExamIds,
} from "./speaking-engine.ts";
import {
  getSavedSpeakingExams,
  saveSpeakingExam,
  deleteSpeakingExam,
  isSpeakingExamSaved,
  clearAllSavedSpeakingExams,
} from "./speaking-storage.ts";
import { buildSpeakingAiPrompt } from "./speaking-ai.ts";

test("SPEAKING_EXAMS_JPD113 contains verified speaking exams with valid scene and questions", () => {
  assert.ok(SPEAKING_EXAMS_JPD113.length >= 2, "JPD113 phải có ít nhất 2 đề mẫu");

  for (const exam of SPEAKING_EXAMS_JPD113) {
    assert.equal(exam.course, "JPD113");
    assert.ok(exam.id.length > 0);
    assert.ok(exam.title.length > 0);
    assert.ok(exam.titleVi.length > 0);

    // Scene
    assert.ok(exam.scene.location.length > 0);
    assert.ok(exam.scene.description.length > 0);
    assert.ok(exam.scene.hotspots.length >= 3, "Tranh phải có ít nhất 3 điểm chú thích");

    // Questions
    assert.ok(
      exam.pictureQuestions.length >= 4 && exam.pictureQuestions.length <= 5,
      `Đề ${exam.id} phải có đúng 4-5 câu hỏi trong tranh, nhận được: ${exam.pictureQuestions.length}`,
    );
    assert.equal(
      exam.extensionQuestions.length,
      2,
      `Đề ${exam.id} phải có đúng 2 câu hỏi mở rộng ngoài tranh`,
    );

    const allQ = [...exam.pictureQuestions, ...exam.extensionQuestions];
    for (const q of allQ) {
      assert.ok(q.questionJp.length > 0);
      assert.ok(q.questionRomaji.length > 0);
      assert.ok(q.questionVi.length > 0);
      assert.ok(q.sampleAnswerJp.length > 0);
      assert.ok(q.sampleAnswerRomaji.length > 0);
      assert.ok(q.sampleAnswerVi.length > 0);
    }
  }
});

test("SPEAKING_EXAMS_JPD123 contains verified speaking exams with valid scene and questions", () => {
  assert.ok(SPEAKING_EXAMS_JPD123.length >= 3, "JPD123 phải có ít nhất 3 đề mẫu");

  for (const exam of SPEAKING_EXAMS_JPD123) {
    assert.equal(exam.course, "JPD123");
    assert.ok(exam.id.length > 0);
    assert.ok(exam.title.length > 0);
    assert.ok(exam.titleVi.length > 0);

    // Scene
    assert.ok(exam.scene.location.length > 0);
    assert.ok(exam.scene.description.length > 0);
    assert.ok(exam.scene.hotspots.length >= 3, "Tranh phải có ít nhất 3 điểm chú thích");

    // Questions
    assert.ok(
      exam.pictureQuestions.length >= 4 && exam.pictureQuestions.length <= 5,
      `Đề ${exam.id} phải có đúng 4-5 câu hỏi trong tranh, nhận được: ${exam.pictureQuestions.length}`,
    );
    assert.equal(
      exam.extensionQuestions.length,
      2,
      `Đề ${exam.id} phải có đúng 2 câu hỏi mở rộng ngoài tranh`,
    );

    const allQ = [...exam.pictureQuestions, ...exam.extensionQuestions];
    for (const q of allQ) {
      assert.ok(q.questionJp.length > 0);
      assert.ok(q.questionRomaji.length > 0);
      assert.ok(q.questionVi.length > 0);
      assert.ok(q.sampleAnswerJp.length > 0);
      assert.ok(q.sampleAnswerRomaji.length > 0);
      assert.ok(q.sampleAnswerVi.length > 0);
    }
  }
});

test("generateSpeakingExam rotates exams and prevents duplicate consecutive generations", () => {
  clearRecentSpeakingExamIds();

  const e1 = generateSpeakingExam("JPD123");
  assert.ok(e1 && e1.id);

  const e2 = generateSpeakingExam("JPD123", { excludeId: e1.id });
  assert.ok(e2 && e2.id);
  assert.notEqual(e1.id, e2.id, "Đề thứ 2 không được trùng lặp với đề thứ 1");

  const e3 = generateSpeakingExam("JPD123", { excludeId: e2.id });
  assert.ok(e3 && e3.id);
  assert.notEqual(e2.id, e3.id, "Đề thứ 3 không được trùng lặp với đề thứ 2");
});

test("buildDynamicSpeakingExam generates fresh non-repeating exams with 4-5 picture and 2 extension questions", () => {
  // Test JPD113
  const d113 = buildDynamicSpeakingExam("JPD113");
  assert.equal(d113.course, "JPD113");
  assert.ok(d113.id.startsWith("dyn-sp-jpd113-"));
  assert.ok(d113.pictureQuestions.length >= 4 && d113.pictureQuestions.length <= 5);
  assert.equal(d113.extensionQuestions.length, 2);

  const all113 = [...d113.pictureQuestions, ...d113.extensionQuestions];
  for (const q of all113) {
    assert.ok(q.sampleAnswerRomaji.length > 0);
    assert.ok(!q.sampleAnswerRomaji.includes("action"), "Romaji không được chứa placeholder action");
    assert.ok(!/[\u4e00-\u9faf]/.test(q.sampleAnswerRomaji), "Romaji không được chứa chữ Hán chưa chuyển đổi");
  }

  // Test JPD123
  const d123 = buildDynamicSpeakingExam("JPD123");
  assert.equal(d123.course, "JPD123");
  assert.ok(d123.id.startsWith("dyn-sp-jpd123-"));
  assert.ok(d123.pictureQuestions.length >= 4 && d123.pictureQuestions.length <= 5);
  assert.equal(d123.extensionQuestions.length, 2);

  const all123 = [...d123.pictureQuestions, ...d123.extensionQuestions];
  for (const q of all123) {
    assert.ok(q.sampleAnswerRomaji.length > 0);
    assert.ok(!q.sampleAnswerRomaji.includes("action"), "Romaji không được chứa placeholder action");
    assert.ok(!/[\u4e00-\u9faf]/.test(q.sampleAnswerRomaji), "Romaji không được chứa chữ Hán chưa chuyển đổi");
  }

  // Lần sinh tiếp theo phải có ID phân biệt
  const d123Second = buildDynamicSpeakingExam("JPD123");
  assert.notEqual(d123.id, d123Second.id, "Các lần sinh đề động liên tiếp phải có ID duy nhất");
});

test("Speaking Storage saves, retrieves, and deletes speaking exams properly", () => {
  clearAllSavedSpeakingExams();
  assert.equal(getSavedSpeakingExams().length, 0);

  const mockExam1 = buildDynamicSpeakingExam("JPD113");
  const mockExam2 = buildDynamicSpeakingExam("JPD123");

  // Save exams
  saveSpeakingExam(mockExam1);
  assert.equal(getSavedSpeakingExams().length, 1);
  assert.equal(isSpeakingExamSaved(mockExam1.id), true);

  saveSpeakingExam(mockExam2);
  assert.equal(getSavedSpeakingExams().length, 2);
  assert.equal(isSpeakingExamSaved(mockExam2.id), true);

  // Delete exam 1
  deleteSpeakingExam(mockExam1.id);
  assert.equal(getSavedSpeakingExams().length, 1);
  assert.equal(isSpeakingExamSaved(mockExam1.id), false);
  assert.equal(isSpeakingExamSaved(mockExam2.id), true);

  // Clear all
  clearAllSavedSpeakingExams();
  assert.equal(getSavedSpeakingExams().length, 0);
  assert.equal(isSpeakingExamSaved(mockExam2.id), false);
});

test("buildSpeakingAiPrompt enforces 4-5 picture and 2 extension questions and syllabus constraints", () => {
  const p113 = buildSpeakingAiPrompt("JPD113");
  assert.ok(p113.systemPrompt.includes("JPD113"));
  assert.ok(p113.systemPrompt.includes("4 ĐẾN 5 CÂU HỎI VỀ BỨC TRANH"));
  assert.ok(p113.systemPrompt.includes("2 CÂU HỎI MỞ RỘNG NGOÀI TRANH"));
  assert.ok(p113.systemPrompt.includes("Bài 1, 2, 3"));

  const p123 = buildSpeakingAiPrompt("JPD123");
  assert.ok(p123.systemPrompt.includes("JPD123"));
  assert.ok(p123.systemPrompt.includes("4 ĐẾN 5 CÂU HỎI VỀ BỨC TRANH"));
  assert.ok(p123.systemPrompt.includes("2 CÂU HỎI MỞ RỘNG NGOÀI TRANH"));
  assert.ok(p123.systemPrompt.includes("Bài 4, 5, 6, 7"));
});
