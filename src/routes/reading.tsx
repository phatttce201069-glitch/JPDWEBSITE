import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Layers,
  CheckCircle2,
  Award,
  ChevronRight,
  RotateCcw,
  Trophy,
  Check,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import {
  generateReadingExamSet,
} from "@/lib/study/reading-engine";
import { generateAiReadingExamSet } from "@/lib/study/reading-ai";
import { ReadingViewer } from "@/components/reading-viewer";
import { ReadingQuiz } from "@/components/reading-quiz";
import { useStudy } from "@/lib/study/store";
import type {
  ReadingCourse,
  ReadingPassageSet,
} from "@/lib/study/reading-types";

interface ReadingSearch {
  course?: ReadingCourse;
}

function cleanReadingSearch(search: Record<string, unknown>): ReadingSearch {
  if (search.course === "JPD123") return { course: "JPD123" };
  return {};
}

export const Route = createFileRoute("/reading")({
  validateSearch: cleanReadingSearch,
  component: ReadingPage,
});

function ReadingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/reading" });
  const setLast = useStudy((state) => state.setLast);
  const course: ReadingCourse = search.course === "JPD123" ? "JPD123" : "JPD113";

  // Quản lý bộ 4 đề thi
  const [examSet, setExamSet] = useState<ReadingPassageSet>(() =>
    generateReadingExamSet(course),
  );
  const [activeExamIndex, setActiveExamIndex] = useState(0);
  const [completedPassages, setCompletedPassages] = useState<
    Record<string, { correctCount: number; totalCount: number }>
  >({});
  const [showKanjiList, setShowKanjiList] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const prevCourseRef = useRef<ReadingCourse>(course);
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

  // Cập nhật bộ đề khi URL course đổi
  useEffect(() => {
    if (prevCourseRef.current !== course) {
      prevCourseRef.current = course;
      const newSet = generateReadingExamSet(course);
      setExamSet(newSet);
      setActiveExamIndex(0);
      setCompletedPassages({});
      setNotification(null);
    }
    setLast({
      to: "/reading",
      label: `Luyện đọc · ${course}`,
      search: course === "JPD123" ? { course: "JPD123" } : {},
    });
  }, [course, setLast]);

  function handleSelectCourse(nextCourse: ReadingCourse) {
    if (nextCourse === course) return;
    void navigate({ search: nextCourse === "JPD123" ? { course: "JPD123" } : {} });
  }

  // Đổi sang bộ 4 đề khác (chống trùng lặp từ kho đề kiểm định)
  function handleGenerateNewSet() {
    const nextSet = generateReadingExamSet(course, { excludeSetId: examSet.id });
    setExamSet(nextSet);
    setActiveExamIndex(0);
    setCompletedPassages({});
    showToast("Đã tải bộ 4 đề đọc hiểu mới chuẩn FPT phủ 100% chữ Hán!", 3000);
  }

  // Gọi AI sinh trọn bộ 4 đề đọc hiểu mới với 100% độ phủ chữ Hán
  async function handleGenerateAiSet() {
    setIsGenerating(true);
    setNotification(null);
    try {
      const result = await generateAiReadingExamSet(course);
      setExamSet(result.set);
      setActiveExamIndex(0);
      setCompletedPassages({});
      if (result.error) {
        showToast(result.error, 4000);
      } else {
        showToast(
          `AI (${result.provider}) đã soạn thành công bộ 4 đề mới với độ phủ chữ Hán ${result.set.coveragePercentage}%!`,
          3500,
        );
      }
    } catch {
      const fallback = generateReadingExamSet(course, { excludeSetId: examSet.id });
      setExamSet(fallback);
      setActiveExamIndex(0);
      setCompletedPassages({});
      showToast("Đã kích hoạt bộ 4 đề thay thế chuẩn FPT (100% độ phủ chữ Hán).", 3000);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleQuizComplete(passageId: string, result: { correctCount: number; totalCount: number }) {
    setCompletedPassages((prev) => ({
      ...prev,
      [passageId]: result,
    }));
  }

  function handleNextExam() {
    if (activeExamIndex < examSet.passages.length - 1) {
      setActiveExamIndex((prev) => prev + 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  }

  function handleResetCurrentSet() {
    setCompletedPassages({});
    setActiveExamIndex(0);
    showToast("Đã đặt lại tiến độ bộ đề để bạn làm lại từ đầu!", 2500);
  }

  const currentPassage = examSet.passages[activeExamIndex] || examSet.passages[0];
  const completedCount = Object.keys(completedPassages).length;
  const totalExams = examSet.passages.length;
  const isAllCompleted = completedCount >= totalExams && totalExams > 0;

  // Tính tổng số câu đúng nếu hoàn thành hết
  const totalCorrect = Object.values(completedPassages).reduce((sum, r) => sum + r.correctCount, 0);
  const totalQuestions = Object.values(completedPassages).reduce((sum, r) => sum + r.totalCount, 0);

  return (
    <div className="space-y-8">
      {/* Phần tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-stone uppercase">
              Luyện thi đọc hiểu
            </span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Đọc hiểu FPT · Bộ 4 đề
            </span>
          </div>
          <h1 className="display mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Luyện thi đọc (読解)
          </h1>
          <p className="mt-1 text-sm text-stone max-w-xl">
            Mỗi lượt gồm bộ 4 đề thi đọc hiểu chuyên sâu. Đảm bảo phủ đủ 100% toàn bộ chữ Hán,
            từ vựng và ngữ pháp của môn học. Tích hợp audio giọng đọc, Romaji và nhấp đúp tra chữ.
          </p>
        </div>

        {/* Nút chọn môn học JPD113 / JPD123 */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper p-1 self-start sm:self-center shadow-xs">
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
      </div>

      {/* Thông tin chuẩn đầu ra môn học */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-sheet p-3.5">
          <Layers className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Độ dài & độ khó chuẩn đề thi FPT</span>
            <span className="text-stone">
              {course === "JPD113"
                ? "Bài ngắn (80–130 chữ, 3–5 câu) phù hợp sơ cấp"
                : "Dài hơn, nhiều Kanji & Katakana (200–280 chữ, 6–9 câu) chuẩn đề thi kết thúc môn JPD123"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-sheet p-3.5">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Độ phủ chữ Hán trọn vẹn</span>
            <span className="text-stone">
              {course === "JPD123"
                ? "Bộ 4 đề bao quát đủ 100% (43/43 chữ Hán Bài 4 đến 7)"
                : "Bộ 4 đề bao quát đủ 100% (34/34 chữ Hán Bài 1 đến 3)"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-sheet p-3.5">
          <BookOpen className="size-4 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Hỗ trợ phát âm & Romaji</span>
            <span className="text-stone">
              Nghe audio chuẩn, bật/tắt Romaji hoặc nhấp đúp chữ để tra cứu tức thì.
            </span>
          </div>
        </div>
      </div>

      {/* Bảng điều khiển bộ 4 đề: Tiến độ & Độ phủ Kanji */}
      <div className="rounded-2xl border border-line/80 bg-sheet p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone uppercase tracking-wider">
                Bộ đề đang luyện
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                {examSet.isCompleteCoverage ? "✓ Đủ 100% Kanji" : `${examSet.coveragePercentage}% Kanji`}
              </span>
            </div>
            <h2 className="display mt-0.5 text-lg font-bold text-ink sm:text-xl">
              {examSet.titleVi}
            </h2>
          </div>

          {/* Huy hiệu độ phủ chữ Hán và tiến độ */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKanjiList(!showKanjiList)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="size-3.5" />
              <span>
                Độ phủ chữ Hán: {examSet.coveredKanji.length}/{examSet.targetKanjiCount} chữ ({examSet.coveragePercentage}%)
              </span>
              {showKanjiList ? <EyeOff className="size-3.5 ml-1" /> : <Eye className="size-3.5 ml-1" />}
            </button>

            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-xs">
              <Flame className="size-3.5 text-amber-500" />
              <span>
                Tiến độ: {completedCount}/{totalExams} đề đã làm
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách chip các chữ Hán trong bộ đề khi người dùng bật xem */}
        {showKanjiList && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 animate-in fade-in space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span>
                Danh sách {examSet.coveredKanji.length} chữ Hán mục tiêu xuất hiện trong 4 đề thi:
              </span>
              <span className="text-emerald-700 font-normal">
                (Tất cả đều nằm trong giáo trình chính thức {course})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {examSet.coveredKanji.map((kanji) => (
                <span
                  key={kanji}
                  className="inline-flex size-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-paper text-sm font-bold text-ink shadow-2xs hover:border-emerald-600 transition-all"
                  title={`Chữ Hán: ${kanji}`}
                >
                  {kanji}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Thanh chuyển đổi 4 ĐỀ THI ĐỌC HIỂU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {examSet.passages.map((p, idx) => {
            const isActive = idx === activeExamIndex;
            const completed = completedPassages[p.id];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveExamIndex(idx)}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-ink bg-paper shadow-sm ring-2 ring-ink/10"
                    : "border-line/70 bg-paper/60 hover:bg-paper hover:border-line"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? "bg-ink text-paper"
                          : "bg-stone/10 text-stone"
                      }`}
                    >
                      Đề {idx + 1}
                    </span>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="size-3" />
                        <span>{completed.correctCount}/{completed.totalCount} câu</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone">Chưa làm</span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-ink line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone line-clamp-1">
                    {p.titleVi}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-stone border-t border-line/40 pt-2">
                  <span>{p.questions.length} câu hỏi</span>
                  <span className="flex items-center gap-0.5 font-medium text-ink">
                    {isActive ? "Đang chọn" : "Bấm để làm"}
                    <ChevronRight className="size-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thông báo cập nhật */}
      {notification && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-800 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Banner chúc mừng khi hoàn thành trọn bộ 4 đề */}
      {isAllCompleted && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 p-6 sm:p-7 shadow-sm text-ink animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-paper shadow-md">
                <Trophy className="size-6 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Xuất sắc hoàn thành
                </span>
                <h3 className="text-xl font-extrabold text-ink sm:text-2xl">
                  Chúc mừng! Bạn đã hoàn thành trọn vẹn cả 4 đề đọc hiểu!
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-stone max-w-xl">
                  Bạn đã luyện tập toàn diện cả 4 đề thi, bao quát 100% chữ Hán của môn học với tổng điểm{" "}
                  <strong className="text-emerald-700 font-bold">{totalCorrect}/{totalQuestions} câu đúng ({Math.round((totalCorrect / totalQuestions) * 100)}%)</strong>.
                  Hãy tạo bộ 4 đề khác để tiếp tục nâng cao phản xạ đọc nhé!
                </p>
              </div>
            </div>

            {/* Các nút hành động tạo bộ đề khác */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateNewSet}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-paper hover:bg-ink/90 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Tạo bộ 4 đề khác</span>
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateAiSet}
                className={`flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-paper px-4 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition-all cursor-pointer ${
                  isGenerating ? "animate-pulse" : "hover:border-amber-600"
                }`}
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{isGenerating ? "AI đang tạo..." : "AI tạo 4 đề mới"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetCurrentSet}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-medium text-stone hover:text-ink transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Làm lại bộ này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Khung chức năng bài đọc và câu hỏi */}
      <div className="space-y-6">
        {/* Component Hiển thị bài đọc tương tác */}
        <ReadingViewer passage={currentPassage} />

        {/* Thanh công cụ sinh bộ đề mới */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/80 bg-paper/60 p-4 shadow-2xs">
          <div className="text-xs text-stone">
            Đang xem: <strong className="text-ink">Đề {activeExamIndex + 1}/{totalExams} · {currentPassage.title}</strong> ({currentPassage.titleVi})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateNewSet}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-stone hover:text-ink hover:border-ink/40 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Đổi bộ 4 đề khác</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAiSet}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-paper shadow-xs transition-all cursor-pointer ${
                isGenerating ? "bg-ink/70 animate-pulse" : "bg-ink hover:bg-ink/90"
              }`}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>{isGenerating ? "AI đang soạn 4 đề..." : "AI tạo 4 đề mới"}</span>
            </button>
          </div>
        </div>

        {/* Component Câu hỏi trắc nghiệm đọc hiểu A-D */}
        <ReadingQuiz
          key={currentPassage.id}
          passage={currentPassage}
          nextPassageLabel={
            activeExamIndex < totalExams - 1
              ? `Sang Đề ${activeExamIndex + 2} (Tiếp tục)`
              : (completedCount >= totalExams - 1 ? "Xem kết quả toàn bộ 4 đề" : "Chuyển đề khác")
          }
          onComplete={(result) => {
            handleQuizComplete(currentPassage.id, result);
          }}
          onNextPassage={handleNextExam}
        />
      </div>
    </div>
  );
}
