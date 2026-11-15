import { useState, useEffect } from "react";
import {
  FolderOpen,
  X,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Bot,
  AlertTriangle,
} from "lucide-react";
import type { SpeakingExam } from "@/lib/study/speaking-types";
import {
  getSavedSpeakingExams,
  deleteSpeakingExam,
  clearAllSavedSpeakingExams,
} from "@/lib/study/speaking-storage";

export interface SavedSpeakingExamsModalProps {
  currentExamId?: string;
  onClose: () => void;
  onSelectExam: (exam: SpeakingExam) => void;
}

export function SavedSpeakingExamsModal({
  currentExamId,
  onClose,
  onSelectExam,
}: SavedSpeakingExamsModalProps) {
  const [exams, setExams] = useState<SpeakingExam[]>(() => getSavedSpeakingExams());
  const [selectedCourse, setSelectedCourse] = useState<"ALL" | "JPD113" | "JPD123">("ALL");

  useEffect(() => {
    setExams(getSavedSpeakingExams());
  }, []);

  function handleDelete(examId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa đề thi nói này khỏi danh sách lưu trữ?")) {
      deleteSpeakingExam(examId);
      setExams(getSavedSpeakingExams());
    }
  }

  function handleClearAll() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách đề thi nói đã lưu?")) {
      clearAllSavedSpeakingExams();
      setExams([]);
    }
  }

  const filteredExams = exams.filter((e) => {
    if (selectedCourse === "ALL") return true;
    return e.course === selectedCourse;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-line bg-sheet shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base sm:text-lg">
                Đề thi nói đã tạo & lưu trữ ({exams.length})
              </h2>
              <p className="text-xs text-stone">
                Xem lại các đề đã luyện tập hoặc xóa đề khi không cần thiết.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone hover:text-ink hover:bg-paper transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-paper/50 px-5 py-3 border-b border-line/60">
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-paper p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCourse("ALL")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                selectedCourse === "ALL" ? "bg-ink text-paper" : "text-stone hover:text-ink"
              }`}
            >
              Tất cả ({exams.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCourse("JPD113")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                selectedCourse === "JPD113" ? "bg-ink text-paper" : "text-stone hover:text-ink"
              }`}
            >
              JPD113
            </button>
            <button
              type="button"
              onClick={() => setSelectedCourse("JPD123")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                selectedCourse === "JPD123" ? "bg-ink text-paper" : "text-stone hover:text-ink"
              }`}
            >
              JPD123
            </button>
          </div>

          {exams.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-stone hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Xóa toàn bộ</span>
            </button>
          )}
        </div>

        {/* Danh sách đề thi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
          {filteredExams.length === 0 ? (
            <div className="py-12 text-center text-stone space-y-2">
              <FolderOpen className="size-12 mx-auto stroke-1 opacity-40 text-stone" />
              <p className="text-sm font-medium">Chưa có đề thi nói nào được lưu.</p>
              <p className="text-xs max-w-sm mx-auto">
                Mỗi khi bạn tạo một đề mới hoặc dùng AI tạo đề, hệ thống sẽ tự động lưu lại ở đây để bạn xem lại bất cứ lúc nào!
              </p>
            </div>
          ) : (
            filteredExams.map((item) => {
              const isCurrent = item.id === currentExamId;
              const dateStr = new Date(item.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectExam(item);
                    onClose();
                  }}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                    isCurrent
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20"
                      : "border-line/70 bg-paper hover:border-ink/40 hover:shadow-sm"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-paper">
                        {item.course}
                      </span>
                      {isCurrent && (
                        <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                          Đang luyện tập
                        </span>
                      )}
                      {item.isAiGenerated && (
                        <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Sparkles className="size-3" />
                          <span>AI sinh</span>
                        </span>
                      )}
                      <span className="text-[11px] text-stone flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{dateStr}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone line-clamp-1">
                      {item.titleVi} · {item.scene?.location}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone">
                      <span>{item.pictureQuestions.length} câu trong tranh</span>
                      <span>•</span>
                      <span>{item.extensionQuestions.length} câu mở rộng</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="rounded-lg p-2 text-stone hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Xóa đề này"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <span className="flex items-center gap-1 text-xs font-semibold text-ink group-hover:translate-x-0.5 transition-transform">
                      <span>Mở đề</span>
                      <ChevronRight className="size-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line p-4 bg-paper/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-ink/90 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
