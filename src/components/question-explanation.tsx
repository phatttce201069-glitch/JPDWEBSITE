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
} from "lucide-react";
import type { ExamQuestion } from "@/lib/study/exam";
import {
  getCompletedSentence,
  getQuestionExplanation,
  type QuestionExplanation,
} from "@/lib/study/explanation";
import { cn } from "@/lib/cn";

export function QuestionExplanationPanel({
  question,
  defaultOpen = false,
  compact = false,
}: {
  question: ExamQuestion;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const explanation: QuestionExplanation = getQuestionExplanation(question);
  const completedSentence = getCompletedSentence(question);

  return (
    <div className="mt-3 w-full">
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
        <span>{isOpen ? "Thu gọn lời giải chi tiết" : "💡 Xem lời giải chi tiết (Nghĩa, ngữ pháp, mẹo giải)"}</span>
        {isOpen ? <ChevronUp className="size-3.5 opacity-70" /> : <ChevronDown className="size-3.5 opacity-70" />}
      </button>

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

          {/* Hộp hiển thị câu hỏi & câu hoàn chỉnh (User request: có cả câu hỏi để dễ hình dung) */}
          <div className="rounded-lg bg-paper p-3 border border-amber-500/20 space-y-2">
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

            {/* Đề bài & Câu đúng */}
            <div className="rounded bg-sheet/80 p-2.5 border border-line space-y-1.5 text-xs">
              <div className="text-stone">
                <span className="font-semibold text-stone">Đề bài: </span>
                <span className="jp font-medium text-ink">{question.sentence}</span>
              </div>
              <div className="text-ink">
                <span className="font-semibold text-emerald-800">Câu hoàn chỉnh: </span>
                <span className="jp font-semibold text-emerald-950 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                  {completedSentence}
                </span>
              </div>
            </div>

            {/* Badge đáp án đúng */}
            <div className="pt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-900 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Đáp án đúng: <strong>{question.answer}</strong></span>
              </span>
            </div>
          </div>

          {/* 1. Dịch nghĩa */}
          {explanation.meaning && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-stone">
                <BookOpen className="size-3 text-stone" />
                <span>Dịch nghĩa câu / từ:</span>
              </div>
              <p className="text-ink pl-4 font-normal leading-normal text-[13px]">
                {explanation.meaning}
              </p>
            </div>
          )}

          {/* 2. Cấu trúc ngữ pháp */}
          {explanation.grammar && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-stone">
                <Target className="size-3 text-stone" />
                <span>Cấu trúc ngữ pháp / Điểm ngữ pháp:</span>
              </div>
              <p className="text-ink pl-4 font-medium text-[13px] jp">
                {explanation.grammar}
              </p>
            </div>
          )}

          {/* 3. Mẹo giải nhanh */}
          {explanation.tips && (
            <div className="rounded-lg bg-paper/90 border border-amber-500/20 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-amber-800">
                <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                <span>Mẹo giải nhanh & Dấu hiệu nhận biết:</span>
              </div>
              <p className="text-stone pl-5 text-xs leading-relaxed">
                {explanation.tips}
              </p>
            </div>
          )}

          {/* 4. Lý do chọn đáp án này */}
          {explanation.reason && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-stone">
                <HelpCircle className="size-3 text-stone" />
                <span>Lý do chọn đáp án đúng:</span>
              </div>
              <p className="text-ink pl-4 text-xs leading-relaxed font-normal">
                {explanation.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
