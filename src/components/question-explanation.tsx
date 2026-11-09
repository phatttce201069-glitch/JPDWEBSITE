import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Tag,
  Target,
  Zap,
  XCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import type { ExamQuestion } from "@/lib/study/exam";
import {
  getCompletedSentence,
  getQuestionExplanation,
  getAnswerMeaning,
  getFullSentenceTranslation,
  type QuestionExplanation,
} from "@/lib/study/explanation";
import {
  explainQuestionWithAi,
  type QuestionAiExplanation,
} from "@/lib/study/ai-service";
import { cn } from "@/lib/cn";

export function QuestionExplanationPanel({
  question,
  defaultOpen = false,
  compact = false,
  userSelectedOption,
}: {
  question: ExamQuestion;
  defaultOpen?: boolean;
  compact?: boolean;
  userSelectedOption?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [aiData, setAiData] = useState<QuestionAiExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const explanation: QuestionExplanation = getQuestionExplanation(question);
  const completedSentence = getCompletedSentence(question);
  const fullSentenceVi = getFullSentenceTranslation(question) || explanation.meaning;
  const answerMeaning = getAnswerMeaning(question.answer, question);

  async function handleAiExplain() {
    if (aiData) {
      setShowAi((prev) => !prev);
      return;
    }
    setShowAi(true);
    setAiLoading(true);
    try {
      const res = await explainQuestionWithAi(question, userSelectedOption);
      setAiData(res);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="mt-3 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
            isOpen
              ? "bg-amber-500/15 text-amber-900 border border-amber-500/30 px-3.5 py-1.5"
              : "bg-sheet hover:bg-stone/5 text-stone hover:text-ink border border-line px-3 py-1.5",
          )}
        >
          <Lightbulb className={cn("size-3.5 shrink-0", isOpen ? "fill-amber-500 text-amber-500" : "text-amber-600")} />
          <span>{isOpen ? "Thu gọn lời giải chi tiết" : "💡 Xem lời giải & Phân tích đáp án sai"}</span>
          {isOpen ? <ChevronUp className="size-3.5 opacity-70" /> : <ChevronDown className="size-3.5 opacity-70" />}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isOpen) setIsOpen(true);
            handleAiExplain();
          }}
          disabled={aiLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-seal/30 bg-seal/10 px-3 py-1.5 text-xs font-semibold text-seal hover:bg-seal/15 cursor-pointer transition shadow-xs"
        >
          {aiLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>AI Giảng viên đang phân tích...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 text-seal" />
              <span>{showAi && aiData ? "Ẩn AI Gia sư" : "✨ AI Gia sư giải thích chuyên sâu"}</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs leading-relaxed space-y-3.5 shadow-xs animate-in fade-in-50 duration-200">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 pb-2 text-ink">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Sparkles className="size-3.5 text-amber-600" />
              <span>Phân tích & Lời giải câu hỏi</span>
            </div>
            {explanation.lesson && (
              <span className="inline-flex items-center gap-1 rounded bg-paper px-2 py-0.5 text-[11px] font-medium text-stone border border-line">
                <Tag className="size-3" />
                {explanation.lesson}
              </span>
            )}
          </div>

          {/* Hộp hiển thị câu hỏi & câu hoàn chỉnh */}
          <div className="rounded-lg bg-paper p-3 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950 text-xs">
                <FileQuestion className="size-3.5 text-amber-600" />
                <span>Nội dung câu hỏi:</span>
              </div>
              {question.section && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Phần {question.section}
                </span>
              )}
            </div>

            {/* Yêu cầu đề bài */}
            {question.prompt && (
              <p className="text-stone text-[11px] leading-relaxed italic">
                {question.prompt}
              </p>
            )}

            {/* Đề bài & Câu đúng & Dịch câu hoàn chỉnh */}
            <div className="rounded bg-sheet/80 p-2.5 border border-line space-y-2 text-xs">
              <div className="text-stone">
                <span className="font-semibold text-stone">Đề bài: </span>
                <span className="jp font-medium text-ink">{question.sentence}</span>
              </div>
              <div className="text-ink">
                <span className="font-semibold text-emerald-800">Câu hoàn chỉnh: </span>
                <span className="jp font-semibold text-emerald-950 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {completedSentence}
                </span>
              </div>
              {fullSentenceVi && (
                <div className="text-ink pt-2 border-t border-line/60">
                  <span className="font-semibold text-emerald-800 block mb-0.5">Dịch cả câu hoàn chỉnh: </span>
                  <p className="font-medium text-ink italic bg-emerald-500/10 p-2 rounded border border-emerald-500/20 leading-relaxed text-[12.5px]">
                    &quot;{fullSentenceVi}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Badge đáp án đúng kèm nghĩa từ vựng */}
            <div className="pt-0.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-900 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Đáp án đúng: <strong>{question.answer}</strong></span>
              </span>
              {answerMeaning && (
                <span className="text-stone text-[11px] font-medium bg-mist/60 px-2 py-0.5 rounded border border-line">
                  Ý nghĩa: <strong>{answerMeaning}</strong>
                </span>
              )}
            </div>
          </div>

          {/* 1. Bản chất kiến thức cốt lõi & Cấu trúc ngữ pháp */}
          {explanation.grammar && (
            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-950 dark:text-indigo-200">
                <Target className="size-3.5 text-indigo-600" />
                <span>Cấu trúc ngữ pháp & Quy tắc áp dụng:</span>
              </div>
              <p className="text-ink font-semibold pl-5 text-[12.5px] jp leading-relaxed">
                {explanation.grammar}
              </p>
            </div>
          )}

          {/* 2. Phân tích chi tiết lý do chọn đáp án đúng */}
          {explanation.reason && (
            <div className="rounded-lg bg-paper p-3 border border-amber-500/20 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                <HelpCircle className="size-3.5 text-amber-600" />
                <span>Phân tích chi tiết bản chất câu hỏi:</span>
              </div>
              <div className="text-stone pl-5 text-xs leading-relaxed space-y-1 font-normal whitespace-pre-line">
                {explanation.reason}
              </div>
            </div>
          )}

          {/* 3. Phân tích lý do tại sao các phương án khác bị sai & Cảnh báo bẫy */}
          {explanation.wrongOptions && explanation.wrongOptions.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-amber-500/15">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-rose-900 text-xs">
                  <XCircle className="size-3.5 text-rose-500" />
                  <span>Phân tích lý do các đáp án còn lại bị sai (Tránh bẫy đề thi):</span>
                </div>
                <span className="text-[10px] text-stone">Phân tích chuyên sâu 3 phương án nhiễu</span>
              </div>
              <div className="grid gap-2 pl-1">
                {explanation.wrongOptions.map((item, idx) => {
                  const isUserMistake = userSelectedOption && userSelectedOption === item.option;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg p-2.5 text-xs flex items-start gap-2.5 shadow-2xs border transition-all",
                        isUserMistake
                          ? "bg-rose-50 border-rose-400 ring-1 ring-rose-400/50"
                          : "bg-paper border-rose-500/20",
                      )}
                    >
                      <div className="shrink-0 flex flex-col gap-1 items-start">
                        <span className="font-bold text-rose-700 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono text-[11px]">
                          {item.option}
                        </span>
                        {isUserMistake && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-200/80 px-1 py-0.2 rounded border border-rose-300">
                            ⚠️ Bạn đã chọn
                          </span>
                        )}
                      </div>
                      <span className="text-stone leading-relaxed text-[11.5px]">
                        {item.reason}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Mẹo phản xạ nhanh từ Giảng viên FPT */}
          {explanation.tips && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                <span>Mẹo phản xạ nhanh 1 giây trong phòng thi FPT:</span>
              </div>
              <p className="text-amber-950 dark:text-amber-100 pl-5 text-xs leading-relaxed font-medium">
                {explanation.tips}
              </p>
            </div>
          )}

          {/* 6. AI Tutor Card */}
          {showAi && (
            <div className="rounded-xl border-2 border-seal/30 bg-sheet p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-seal text-paper text-xs font-bold">
                    <GraduationCap className="size-3.5" />
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-ink">AI Gia sư Đại học FPT</h5>
                    <p className="text-[10px] text-stone">Phân tích chuyên sâu 1-1 cho câu hỏi này</p>
                  </div>
                </div>
                {aiData?.isAiGenerated ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                    Live AI
                  </span>
                ) : (
                  <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-stone">
                    FPT Sensei Knowledge
                  </span>
                )}
              </div>

              {aiLoading ? (
                <div className="py-6 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-seal" />
                  <p className="mt-2 text-xs text-stone">AI Giảng viên đang phân tích bản chất câu hỏi và dịch toàn câu...</p>
                </div>
              ) : aiData ? (
                <div className="space-y-3 text-xs">
                  {aiData.fullSentenceTranslation && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-2.5">
                      <span className="font-bold text-emerald-900 block mb-1">
                        📖 Dịch nghĩa câu hoàn chỉnh từ AI Gia sư:
                      </span>
                      <p className="text-ink font-medium leading-relaxed italic">
                        &quot;{aiData.fullSentenceTranslation}&quot;
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg bg-mist/60 p-2.5">
                    <span className="font-bold text-ink block mb-1">🔍 Phân tích chuyên sâu:</span>
                    <p className="text-stone leading-relaxed">{aiData.deepDive}</p>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-950 dark:text-amber-100">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      💡 Lời khuyên phản xạ trong phòng thi FPT:
                    </span>
                    <p className="leading-relaxed font-medium">{aiData.senseiTip}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
