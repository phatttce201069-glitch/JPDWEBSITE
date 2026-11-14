import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Award } from "lucide-react";
import type { ReadingPassage, ReadingQuestion } from "@/lib/study/reading-types";

interface ReadingQuizProps {
  passage: ReadingPassage;
  onNextPassage?: () => void;
  onComplete?: (result: { correctCount: number; totalCount: number }) => void;
  nextPassageLabel?: string;
}

export function ReadingQuiz({ passage, onNextPassage, onComplete, nextPassageLabel }: ReadingQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  }, [passage.id]);

  const questions = passage.questions;

  function handleSelect(questionId: string, option: string) {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  }

  function handleSubmit() {
    setIsSubmitted(true);
    if (onComplete) {
      const correct = questions.filter((q) => selectedAnswers[q.id] === q.answer).length;
      onComplete({ correctCount: correct, totalCount: questions.length });
    }
  }

  function handleReset() {
    setSelectedAnswers({});
    setIsSubmitted(false);
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.answer,
  ).length;

  const scorePercent = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="rounded-2xl border border-line bg-sheet p-5 sm:p-7 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-stone uppercase">
            Phần thi đọc hiểu (読解 - Dokkai)
          </span>
          <h3 className="display mt-0.5 text-xl font-bold text-ink sm:text-2xl">
            Câu hỏi trắc nghiệm A-D
          </h3>
          <p className="text-xs text-stone">
            Chọn câu trả lời chính xác nhất dựa theo thông tin trong bài đọc trên.
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2 rounded-xl bg-ink px-3 py-1.5 text-paper">
            <Award className="size-4 text-amber-400" />
            <span className="text-sm font-bold">
              {correctCount} / {questions.length} câu đúng ({scorePercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Danh sách câu hỏi đọc hiểu */}
      <div className="mt-6 space-y-6">
        {questions.map((q: ReadingQuestion, qIdx: number) => {
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.answer;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 sm:p-5 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-rose-500/40 bg-rose-500/5"
                  : "border-line/70 bg-paper/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
                    {qIdx + 1}
                  </span>
                  <div>
                    <h4 className="jp text-base font-semibold text-ink sm:text-lg">
                      {q.prompt}
                    </h4>
                  </div>
                </div>

                {isSubmitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3.5" /> Đúng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-700">
                        <XCircle className="size-3.5" /> Sai
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Danh sách 4 phương án A, B, C, D */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {q.options.map((opt: string, optIdx: number) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isPicked = userChoice === opt;
                  const isTheAnswer = opt === q.answer;

                  let optionStyle =
                    "border-line bg-paper text-ink hover:border-ink/40";

                  if (isSubmitted) {
                    if (isTheAnswer) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-500/15 text-emerald-950 font-semibold ring-1 ring-emerald-500";
                    } else if (isPicked && !isTheAnswer) {
                      optionStyle =
                        "border-rose-500 bg-rose-500/15 text-rose-950 line-through";
                    } else {
                      optionStyle = "border-line/40 bg-paper/40 text-stone/70";
                    }
                  } else if (isPicked) {
                    optionStyle =
                      "border-ink bg-ink text-paper shadow-sm font-medium";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, opt)}
                      className={`flex items-start gap-2.5 rounded-lg border p-3 text-left text-sm transition-all ${optionStyle}`}
                    >
                      <span
                        className={`inline-flex size-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                          isPicked && !isSubmitted
                            ? "bg-paper text-ink"
                            : "bg-line/40 text-stone"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="jp flex-1 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Giải thích chi tiết sau khi nộp bài */}
              {isSubmitted && q.explanation && (
                <div className="mt-4 space-y-2 rounded-lg border border-line/60 bg-paper/80 p-3.5 text-xs leading-relaxed text-ink">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span>Đáp án đúng:「{q.answer}」</span>
                  </div>
                  <p className="text-stone">
                    <strong>Ý nghĩa:</strong> {q.explanation.meaning}
                  </p>
                  <p>
                    <strong>Dẫn chứng từ bài đọc:</strong> {q.explanation.reason}
                  </p>

                  {/* Phân tích lý do các phương án còn lại sai */}
                  {q.explanation.wrongOptions && q.explanation.wrongOptions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-line/60 space-y-1">
                      <span className="font-semibold text-stone block">
                        Phân tích các phương án khác:
                      </span>
                      {q.explanation.wrongOptions.map((wo, wIdx) => (
                        <div key={wIdx} className="text-stone flex items-start gap-1">
                          <span className="text-rose-500 font-bold shrink-0">✕</span>
                          <span>
                            <strong>「{wo.option}」:</strong> {wo.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nút hành động chấm bài / làm bài tiếp theo */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
        {!isSubmitted ? (
          <button
            type="button"
            disabled={!isAllAnswered}
            onClick={handleSubmit}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              isAllAnswered
                ? "bg-ink text-paper hover:bg-ink/90 cursor-pointer"
                : "bg-stone/20 text-stone cursor-not-allowed"
            }`}
          >
            <span>Chấm điểm ({answeredCount}/{questions.length})</span>
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-medium text-stone hover:text-ink hover:border-ink/30"
            >
              <RotateCcw className="size-4" />
              <span>Làm lại bài này</span>
            </button>

            {onNextPassage && (
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onNextPassage();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ink/90 shadow-sm cursor-pointer"
              >
                <span>{nextPassageLabel || "Luyện bài đọc tiếp theo"}</span>
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        )}

        <span className="text-xs text-stone">
          Mỗi bài đọc gồm {questions.length} câu trắc nghiệm chuẩn FPT
        </span>
      </div>
    </div>
  );
}
