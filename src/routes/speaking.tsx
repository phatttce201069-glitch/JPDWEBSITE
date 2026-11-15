import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  Sparkles,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Trophy,
  Bot,
  Layers,
  Volume2,
  ChevronRight,
  RotateCcw,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import type {
  SpeakingCourse,
  SpeakingExam,
} from "@/lib/study/speaking-types";
import {
  generateSpeakingExam,
} from "@/lib/study/speaking-engine";
import { generateAiSpeakingExam } from "@/lib/study/speaking-ai";
import {
  getSavedSpeakingExams,
  saveSpeakingExam,
} from "@/lib/study/speaking-storage";
import { SpeakingSceneViewer } from "@/components/speaking-scene-viewer";
import { SpeakingQuestionCard } from "@/components/speaking-question-card";
import { SavedSpeakingExamsModal } from "@/components/saved-speaking-exams-modal";
import { AiSettingsModal } from "@/components/ai-settings-modal";
import { getAiSettings, saveAiSettings, type AiSettings } from "@/lib/study/ai-service";
import { useStudy } from "@/lib/study/store";

interface SpeakingSearch {
  course?: SpeakingCourse;
}

function cleanSpeakingSearch(search: Record<string, unknown>): SpeakingSearch {
  if (search.course === "JPD113") return { course: "JPD113" };
  return { course: "JPD123" };
}

export const Route = createFileRoute("/speaking")({
  validateSearch: cleanSpeakingSearch,
  component: SpeakingPage,
});

function SpeakingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/speaking" });
  const setLast = useStudy((state) => state.setLast);
  const course: SpeakingCourse = search.course === "JPD113" ? "JPD113" : "JPD123";

  // Quản lý đề thi nói hiện tại
  const [exam, setExam] = useState<SpeakingExam>(() => generateSpeakingExam(course));
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => getSavedSpeakingExams().length);
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => getAiSettings());

  const prevCourseRef = useRef<SpeakingCourse>(course);
  const toastTimerRef = useRef<number | null>(null);

  function showToast(msg: string, ms = 3000) {
    setNotification(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      toastTimerRef.current = null;
    }, ms);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Cập nhật khi URL course đổi
  useEffect(() => {
    if (prevCourseRef.current !== course) {
      prevCourseRef.current = course;
      const next = generateSpeakingExam(course);
      setExam(next);
      setCompletedQuestions({});
      setNotification(null);
      setSavedCount(getSavedSpeakingExams().length);
    }
    setLast({
      to: "/speaking",
      label: `Luyện thi nói · ${course}`,
      search: course === "JPD113" ? { course: "JPD113" } : { course: "JPD123" },
    });
  }, [course, setLast]);

  function handleSelectCourse(nextCourse: SpeakingCourse) {
    if (nextCourse === course) return;
    void navigate({ search: nextCourse === "JPD113" ? { course: "JPD113" } : { course: "JPD123" } });
  }

  // Đổi sang đề thi nói khác (chống trùng lặp)
  function handleGenerateNewExam() {
    const nextExam = generateSpeakingExam(course, { excludeId: exam.id });
    setExam(nextExam);
    setCompletedQuestions({});
    setSavedCount(getSavedSpeakingExams().length);
    showToast("Đã tải đề thi nói mới, không trùng lặp!", 2500);
  }

  // Gọi AI sinh đề thi nói mới
  async function handleGenerateAiExam() {
    setIsGenerating(true);
    setNotification(null);
    try {
      const result = await generateAiSpeakingExam(course);
      setExam(result.exam);
      setCompletedQuestions({});
      setSavedCount(getSavedSpeakingExams().length);
      if (result.error) {
        showToast(result.error, 4000);
      } else {
        showToast(`AI (${result.provider}) đã tạo thành công đề thi nói mới!`, 3000);
      }
    } catch {
      const fallback = generateSpeakingExam(course, { excludeId: exam.id });
      setExam(fallback);
      setCompletedQuestions({});
      setSavedCount(getSavedSpeakingExams().length);
      showToast("Đã kích hoạt đề thi nói chuẩn FPT thay thế.", 2500);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToggleComplete(qId: string) {
    setCompletedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  }

  const allQuestions = useMemo(
    () => [...exam.pictureQuestions, ...exam.extensionQuestions],
    [exam],
  );
  const totalQuestions = allQuestions.length;
  const completedCount = Object.values(completedQuestions).filter(Boolean).length;
  const isAllCompleted = completedCount >= totalQuestions && totalQuestions > 0;

  const aiEngineLabel = useMemo(() => {
    if (aiSettings.provider === "built-in" || !aiSettings.apiKey.trim()) {
      return { text: "Sumi FPT Engine (Tích hợp)", icon: "🧠" };
    }
    if (aiSettings.provider === "gemini") {
      return { text: `Google Gemini (${aiSettings.model || "gemini-2.0-flash"})`, icon: "⚡" };
    }
    if (aiSettings.provider === "xai") {
      return { text: `xAI Grok (${aiSettings.model || "grok-4.5"})`, icon: "🚀" };
    }
    if (aiSettings.provider === "openai") {
      return { text: `OpenAI (${aiSettings.model || "gpt-4o-mini"})`, icon: "🌐" };
    }
    if (aiSettings.provider === "groq") {
      return { text: `Groq (${aiSettings.model || "llama-3.3-70b"})`, icon: "⚡" };
    }
    return { text: "Sumi FPT Engine", icon: "🧠" };
  }, [aiSettings]);

  return (
    <div className="space-y-8">
      {/* Tiêu đề trang & Chọn môn học */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-stone uppercase">
              Luyện thi vấn đáp
            </span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Thi nói FPT · Tranh & Mở rộng
            </span>
          </div>
          <h1 className="display mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Luyện thi nói (口頭試験)
          </h1>
          <p className="mt-1 text-sm text-stone max-w-xl">
            Mỗi đề gồm 1 bức tranh sinh động kèm 4–5 câu hỏi trong tranh và 2 câu hỏi mở rộng ngoài tranh.
            Tích hợp audio giọng đọc, nút hiện câu hỏi và gợi ý câu trả lời mẫu chuẩn ngữ pháp FPT.
          </p>
        </div>

        {/* Nút chuyển môn JPD113 / JPD123 & Cài đặt AI */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleSelectCourse("JPD113")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                course === "JPD113"
                  ? "bg-ink text-paper shadow-xs"
                  : "text-stone hover:text-ink"
              }`}
            >
              <span>JPD113 (Bài 1–3)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectCourse("JPD123")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                course === "JPD123"
                  ? "bg-ink text-paper shadow-xs"
                  : "text-stone hover:text-ink"
              }`}
            >
              <span>JPD123 (Bài 4–7)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-stone hover:text-ink hover:border-ink/40 shadow-xs transition-all cursor-pointer"
            title={`Cấu hình nhà cung cấp AI: ${aiEngineLabel.text}`}
          >
            <Bot className="size-4 text-amber-600" />
            <span className="hidden sm:inline">Cài đặt AI</span>
          </button>
        </div>
      </div>

      {/* Thông báo toast */}
      {notification && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-800 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Thanh công cụ tạo đề & Đề đã lưu */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/80 bg-sheet p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-ink">Đề đang luyện:</span>
          <span className="font-semibold text-stone">{exam.titleVi}</span>
          <span className="rounded-full bg-stone/10 px-2 py-0.5 text-[11px] font-medium text-stone">
            {completedCount}/{totalQuestions} câu xong
          </span>
          {exam.isAiGenerated && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <Sparkles className="size-3" />
              <span>{exam.provider || "AI sinh"}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-stone hover:text-ink hover:border-ink/40 transition-all shadow-xs cursor-pointer"
            title="Xem lại các đề đã tạo và lưu"
          >
            <FolderOpen className="size-3.5 text-amber-600" />
            <span>Đề đã lưu ({savedCount})</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateNewExam}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-stone hover:text-ink hover:border-ink/40 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Tạo đề khác</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateAiExam}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-paper shadow-xs transition-all cursor-pointer ${
              isGenerating ? "bg-ink/70 animate-pulse" : "bg-ink hover:bg-ink/90"
            }`}
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>{isGenerating ? "AI đang tạo đề..." : "AI tạo đề nói mới"}</span>
          </button>
        </div>
      </div>

      {/* Banner chúc mừng khi luyện xong tất cả các câu trong đề */}
      {isAllCompleted && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 p-6 shadow-sm text-ink animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-paper shadow-md">
                <Trophy className="size-6 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Hoàn thành xuất sắc
                </span>
                <h3 className="text-xl font-extrabold text-ink sm:text-2xl">
                  Chúc mừng! Bạn đã hoàn thành toàn bộ câu hỏi thi nói của đề này!
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-stone max-w-xl">
                  Bạn đã luyện tập đủ {exam.pictureQuestions.length} câu hỏi về bức tranh và {exam.extensionQuestions.length} câu hỏi mở rộng thực tế.
                  Hãy tạo đề nói tiếp theo để tăng cường phản xạ nói tự nhiên nhé!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleGenerateNewExam}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-paper hover:bg-ink/90 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Luyện đề thi tiếp theo</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedQuestions({})}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-medium text-stone hover:text-ink transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Luyện lại từ đầu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Khung Bức tranh chủ đề */}
      <SpeakingSceneViewer scene={exam.scene} />

      {/* Phần 1: Câu hỏi về bức tranh (4 đến 5 câu hỏi) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="font-bold text-ink text-base sm:text-lg">
                Phần 1: Câu hỏi về bức tranh ({exam.pictureQuestions.length} câu)
              </h2>
              <p className="text-xs text-stone">
                Giảng viên hỏi về những chi tiết, nhân vật, đồ vật, vị trí hoặc hành động trong tranh.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {exam.pictureQuestions.map((q, idx) => (
            <SpeakingQuestionCard
              key={q.id}
              question={q}
              index={idx}
              isCompleted={Boolean(completedQuestions[q.id])}
              onToggleComplete={() => handleToggleComplete(q.id)}
            />
          ))}
        </div>
      </div>

      {/* Phần 2: Câu hỏi mở rộng ngoài bức tranh (2 câu hỏi) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-700 font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="font-bold text-ink text-base sm:text-lg">
                Phần 2: Câu hỏi mở rộng ngoài bức tranh ({exam.extensionQuestions.length} câu)
              </h2>
              <p className="text-xs text-stone">
                Phỏng vấn tự do liên hệ thực tế bản thân dựa trên ngữ pháp và từ vựng của môn học.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {exam.extensionQuestions.map((q, idx) => (
            <SpeakingQuestionCard
              key={q.id}
              question={q}
              index={exam.pictureQuestions.length + idx}
              isCompleted={Boolean(completedQuestions[q.id])}
              onToggleComplete={() => handleToggleComplete(q.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal Xem lại đề đã tạo */}
      {showSavedModal && (
        <SavedSpeakingExamsModal
          currentExamId={exam.id}
          onClose={() => {
            setShowSavedModal(false);
            setSavedCount(getSavedSpeakingExams().length);
          }}
          onSelectExam={(selected) => {
            setExam(selected);
            setCompletedQuestions({});
            showToast(`Đã mở đề thi nói: ${selected.titleVi}`, 2500);
          }}
        />
      )}

      {/* Modal Cài đặt AI */}
      {showAiModal && (
        <AiSettingsModal
          settings={aiSettings}
          title="Cấu hình AI Thi Nói & Luyện Giao Tiếp"
          description="Lựa chọn AI Engine tích hợp miễn phí hoặc sử dụng API Key Google Gemini, Grok, OpenAI, Groq để sinh đề thi nói không giới hạn."
          onClose={() => setShowAiModal(false)}
          onSave={(next) => {
            saveAiSettings(next);
            setAiSettings(next);
            setShowAiModal(false);
            showToast("Đã lưu cấu hình AI thành công!", 2500);
          }}
        />
      )}
    </div>
  );
}
