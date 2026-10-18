import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
  Square,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressLine } from "@/components/progress-line";
import {
  EXAM_SECONDS,
  EXAM_SIZE,
  baiOf,
  buildExam,
  buildStarredExam,
  examUnits,
  type ExamQuestion,
} from "@/lib/study/exam";
import { findReading, vocabulary } from "@/lib/study/content";
import { useStudy } from "@/lib/study/store";
import type { ExamSearch } from "@/lib/study/types";
import { cn } from "@/lib/cn";
import {
  generateFptAiExam,
  getAiSettings,
  saveAiSettings,
  type AiProvider,
  type AiSettings,
} from "@/lib/study/ai-service";

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): ExamSearch => ({
    course:
      search.course === "JPD113" || search.course === "JPD123" || search.course === "starred"
        ? search.course
        : "",
    bai: typeof search.bai === "string" ? search.bai : "",
    ai: search.ai === true || search.ai === "true",
  }),
  component: ExamPage,
});

function ExamPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/exam" });
  const starred = useStudy((state) => state.starred);
  const setLast = useStudy((state) => state.setLast);
  const [paper, setPaper] = useState<ExamQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [left, setLeft] = useState(EXAM_SECONDS);
  const [closed, setClosed] = useState(false);
  const [note, setNote] = useState("");
  const nextRef = useRef<HTMLDivElement>(null);

  // AI Exam States
  const [isAiExam, setIsAiExam] = useState(false);
  const [isAiModeTab, setIsAiModeTab] = useState(search.ai || search.course === "JPD123");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [aiProviderName, setAiProviderName] = useState("");
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiSettings, setAiSettingsState] = useState<AiSettings>(() => getAiSettings());

  const selected = search.bai ? search.bai.split(",").filter(Boolean) : [];
  const starredWords = vocabulary.filter((word) => starred.includes(word.id));

  useEffect(() => {
    if (search.ai) {
      setIsAiModeTab(true);
    }
  }, [search.ai]);

  useEffect(() => {
    const label =
      search.course === "starred"
        ? selected.length
          ? `Từ đánh dấu · Bài ${selected.join(", ")}`
          : "Từ vựng đã đánh dấu"
        : search.course
          ? selected.length
            ? `${search.course} · Bài ${selected.join(", ")}`
            : search.course
          : "Kiểm tra";
    setLast({ to: "/exam", label, search });
  }, [search.course, search.bai, selected, setLast]);

  useEffect(() => {
    if (!paper || closed) return;
    const timer = window.setInterval(() => {
      setLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paper, closed]);

  useEffect(() => {
    if (paper && left === 0) setClosed(true);
  }, [paper, left]);

  useEffect(() => {
    if (!picked) return;
    nextRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [picked, index]);

  function setSearch(patch: Partial<ExamSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  function toggleBai(bai: string) {
    const next = selected.includes(bai) ? selected.filter((item) => item !== bai) : [...selected, bai];
    next.sort((leftBai, rightBai) => Number(leftBai) - Number(rightBai));
    setNote("");
    setSearch({ bai: next.join(",") });
  }

  function selectAllJpd123() {
    setSearch({ bai: "4,5,6,7" });
  }

  function startStandard() {
    if (!search.course) return;

    if (search.course === "starred") {
      const allStarredWords = vocabulary.filter((w) => starred.includes(w.id));
      const targetWords =
        selected.length === 0
          ? allStarredWords
          : allStarredWords.filter((w) => selected.includes(baiOf(w.lesson) ?? "khac"));

      if (targetWords.length === 0) {
        setNote("Chưa có từ nào được chọn. Hãy chọn bài hoặc đánh dấu thêm từ.");
        return;
      }

      const next = buildStarredExam(targetWords);
      if (next.length === 0) {
        setNote("Chưa đủ từ để tạo câu hỏi kiểm tra.");
        return;
      }

      setNote("");
      setIsAiExam(false);
      setPaper(next);
      setIndex(0);
      setPicked(null);
      setAnswers(Array(next.length).fill(null));
      setLeft(Math.max(next.length * 60, 300));
      setClosed(false);
      return;
    }

    if (selected.length === 0) {
      setNote("Vui lòng chọn ít nhất một bài để tạo đề.");
      return;
    }
    const next = buildExam(search.course, selected);
    if (next.length < EXAM_SIZE) {
      setNote("Bài này chưa đủ dữ liệu để lập đề 30 câu. Hãy gộp thêm bài.");
      return;
    }
    setNote("");
    setIsAiExam(false);
    setPaper(next);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(next.length).fill(null));
    setLeft(EXAM_SECONDS);
    setClosed(false);
  }

  async function startAiExam(targetBaiList?: string[]) {
    setIsGeneratingAi(true);
    setGenerationStep(0);
    setNote("");

    // Simulate animated AI drafting progression
    await new Promise((r) => setTimeout(r, 350));
    setGenerationStep(1); // Phân tích cấu trúc môn JPD123 FPT

    await new Promise((r) => setTimeout(r, 450));
    setGenerationStep(2); // Soạn câu hỏi Kanji, Từ vựng, Ngữ pháp

    const target =
      targetBaiList && targetBaiList.length > 0
        ? targetBaiList
        : selected.length > 0
          ? selected
          : ["4", "5", "6", "7"];

    const result = await generateFptAiExam(target);

    setGenerationStep(3); // Kiểm định và hoàn thiện bộ đề
    await new Promise((r) => setTimeout(r, 350));

    setAiProviderName(result.provider);
    if (result.error) {
      setNote(result.error);
    }

    setIsAiExam(true);
    setPaper(result.questions);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(result.questions.length).fill(null));
    setLeft(EXAM_SECONDS);
    setClosed(false);
    setIsGeneratingAi(false);
  }

  function handleSaveAiSettings(updated: AiSettings) {
    saveAiSettings(updated);
    setAiSettingsState(updated);
    setShowAiSettings(false);
  }

  // --- SCREEN 1: Choose Course or Exam Type ---
  if (!search.course) {
    return (
      <div>
        <p className="text-sm tracking-[0.18em] text-stone uppercase">Kiểm tra</p>
        <h1 className="display mt-2 text-4xl">Chọn nội dung kiểm tra.</h1>
        <p className="mt-2 text-stone">
          Đề thi trắc nghiệm A–D bám sát đề thi JLPT N5 và chuẩn môn học tiếng Nhật Đại học FPT.
        </p>

        {/* Highlight 1: AI EXAM GENERATOR (FPT JPD123 FORM) */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm tracking-wide text-stone uppercase flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              Đề thi Thông minh AI · Chuẩn Form FPT University
            </h2>
            <button
              type="button"
              onClick={() => setShowAiSettings(true)}
              className="text-xs text-stone hover:text-ink flex items-center gap-1 transition-colors"
            >
              <Settings className="size-3.5" />
              Cấu hình AI
            </button>
          </div>

          <div className="mt-2 rounded-xl border-2 border-ink/20 bg-sheet p-5 shadow-xs transition-all hover:border-ink/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-500/20">
                    <Bot className="size-3.5" />
                    AI POWERED · CHUẨN FORM FPTU
                  </span>
                  <span className="text-xs text-stone">30 câu · 30 phút · Bài 4 đến 7</span>
                </div>
                <h3 className="font-semibold text-ink text-lg">
                  JPD123 · Đề thi Thông minh AI
                </h3>
                <p className="text-sm text-stone max-w-xl leading-relaxed">
                  Mô phỏng 100% cấu trúc đề thi kết thúc môn <strong>JPD123 Đại học FPT</strong>:
                  Đúng <strong>10 câu Kanji</strong> + <strong>10 câu Từ vựng</strong> + <strong>10 câu Ngữ pháp</strong>.
                  Thuật toán AI tự động làm mới câu hỏi mỗi lượt thi, tạo sự đa dạng và ngữ cảnh thực tế phong phú.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-xs text-stone">
                  <span className="rounded bg-paper px-2 py-0.5 border border-line">✓ 10 Kanji (Đọc / Viết / Âm Hán)</span>
                  <span className="rounded bg-paper px-2 py-0.5 border border-line">✓ 10 Từ vựng (Điền từ / Trái nghĩa / Đàm thoại)</span>
                  <span className="rounded bg-paper px-2 py-0.5 border border-line">✓ 10 Ngữ pháp (Thể て / So sánh / Mong muốn)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <Button
                  tone="seal"
                  onClick={() => startAiExam(["4", "5", "6", "7"])}
                  className="flex items-center justify-center gap-2 font-medium"
                >
                  <Sparkles className="size-4" />
                  Làm đề thi AI ngay
                </Button>
                <Button
                  tone="ghost"
                  onClick={() => setSearch({ course: "JPD123", bai: "4,5,6,7", ai: true })}
                  className="flex items-center justify-center gap-1 text-sm"
                >
                  Tùy chỉnh bài thi
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight 2: Starred Words Exam Card */}
        <div className="mt-8">
          <h2 className="text-sm tracking-wide text-stone uppercase">Kiểm tra chuyên sâu</h2>
          <div className="mt-2 rounded-xl border border-line bg-sheet p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Star
                  className={cn(
                    "size-5 mt-0.5 shrink-0",
                    starred.length ? "fill-amber-500 text-amber-500" : "text-stone",
                  )}
                />
                <div>
                  <h3 className="font-semibold text-ink text-base">Từ vựng đã đánh dấu</h3>
                  <p className="mt-0.5 text-sm text-stone">
                    {starred.length
                      ? `Tự động tạo bộ đề trắc nghiệm A–D riêng từ ${starred.length} từ bạn đã lưu đánh dấu.`
                      : "Chưa có từ nào được đánh dấu. Vào phần Từ vựng để bấm biểu tượng ⭐ lưu các từ cần kiểm tra."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  tone="seal"
                  disabled={starred.length === 0}
                  onClick={() => setSearch({ course: "starred", bai: "" })}
                  className="flex items-center gap-1.5"
                >
                  <Play className="size-4" />
                  Làm kiểm tra ({starred.length})
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Course Exams */}
        <div className="mt-8">
          <h2 className="text-sm tracking-wide text-stone uppercase">Theo môn học Đại học FPT</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {(["JPD113", "JPD123"] as const).map((course) => (
              <li key={course}>
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between py-3 text-left transition-colors hover:text-ink"
                  onClick={() => setSearch({ course, bai: course === "JPD123" ? "4,5,6,7" : "", ai: course === "JPD123" })}
                >
                  <div>
                    <span className="font-medium text-base">{course}</span>
                    <span className="block text-sm text-stone">
                      {course === "JPD113"
                        ? "Tiếng Nhật 1 · Sơ cấp 1 (Bài 1–3)"
                        : "Tiếng Nhật 2 · Sơ cấp 2 (Bài 4–7) · Có hỗ trợ AI"}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-stone" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Settings Modal */}
        {showAiSettings && (
          <AiSettingsModal
            settings={aiSettings}
            onClose={() => setShowAiSettings(false)}
            onSave={handleSaveAiSettings}
          />
        )}

        {/* AI Generating Overlay */}
        {isGeneratingAi && <AiGeneratingOverlay step={generationStep} />}
      </div>
    );
  }

  // --- SCREEN 2: Unit / Lesson selection before starting exam ---
  if (!paper) {
    const units = examUnits(search.course, starred);
    const isStarred = search.course === "starred";
    const isJpd123 = search.course === "JPD123";

    return (
      <div>
        <button
          type="button"
          className="text-sm text-stone hover:text-ink"
          onClick={() => setSearch({ course: "", bai: "", ai: false })}
        >
          ← Đổi môn
        </button>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isStarred && <Star className="size-6 fill-amber-500 text-amber-500" />}
            <h1 className="display text-4xl">
              {isStarred ? "Từ vựng đã đánh dấu" : search.course}
            </h1>
          </div>

          {isJpd123 && (
            <button
              type="button"
              onClick={() => setShowAiSettings(true)}
              className="text-xs text-stone hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line bg-sheet transition-colors"
            >
              <Settings className="size-3.5" />
              Cấu hình AI
            </button>
          )}
        </div>

        <p className="mt-2 text-stone">
          {isStarred
            ? "Đề thi trắc nghiệm A–D được lập riêng từ các từ vựng bạn đã đánh dấu. Bạn có thể chọn tất cả hoặc chọn theo từng bài."
            : isJpd123
              ? "Chương trình Tiếng Nhật 2 (Bài 4 đến 7). Bạn có thể chọn làm Đề thi AI hoặc Đề thi Tiêu chuẩn."
              : "Chọn một bài hoặc gộp nhiều bài. Câu vẫn về từ vựng, kanji và ngữ pháp của các bài đó."}
        </p>

        {/* Mode Selector for JPD123 */}
        {isJpd123 && (
          <div className="mt-5 flex items-center gap-2 border-b border-line pb-3">
            <button
              type="button"
              onClick={() => {
                setIsAiModeTab(true);
                setSearch({ ai: true });
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                isAiModeTab
                  ? "bg-ink text-paper"
                  : "bg-sheet text-stone hover:text-ink border border-line",
              )}
            >
              <Sparkles className="size-3.5" />
              Đề thi AI FPT (Đa dạng)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAiModeTab(false);
                setSearch({ ai: false });
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                !isAiModeTab
                  ? "bg-ink text-paper"
                  : "bg-sheet text-stone hover:text-ink border border-line",
              )}
            >
              <Layers className="size-3.5" />
              Đề thi Tiêu chuẩn
            </button>
          </div>
        )}

        {/* AI Mode Banner for JPD123 */}
        {isJpd123 && isAiModeTab && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-ink space-y-2">
            <div className="flex items-center gap-2 font-medium text-amber-800">
              <Bot className="size-4" />
              Cấu trúc chuẩn Form Đề thi Kết thúc môn JPD123 (Đại học FPT)
            </div>
            <p className="text-stone text-xs leading-relaxed">
              Mỗi đề gồm đúng <strong>30 câu · 30 phút</strong>: 10 câu Chữ Hán + 10 câu Từ vựng + 10 câu Ngữ pháp.
              Hệ thống tự động xáo trộn và sinh mới câu hỏi theo giáo trình Minna / Marugoto Sơ cấp 2.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={selectAllJpd123}
                className="underline text-ink font-medium hover:text-seal"
              >
                Chọn trọn bộ (Bài 4, 5, 6, 7)
              </button>
            </div>
          </div>
        )}

        {isStarred && starredWords.length === 0 ? (
          <div className="mt-6 rounded-lg border border-line bg-sheet p-6 text-center">
            <p className="text-stone">Bạn chưa đánh dấu từ nào.</p>
            <Button
              className="mt-4"
              tone="seal"
              onClick={() => navigate({ to: "/words", search: { lesson: "", mode: "list", at: 0 } })}
            >
              Đến phần Từ vựng để đánh dấu ⭐
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {units.map((unit) => {
                const on = selected.includes(unit.bai);
                return (
                  <li key={unit.bai}>
                    <button
                      type="button"
                      aria-pressed={on}
                      className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left transition-colors"
                      onClick={() => toggleBai(unit.bai)}
                    >
                      <span className={cn("font-medium", on ? "text-ink" : "text-stone")}>{unit.label}</span>
                      <span className="text-sm text-stone tabular-nums">{on ? "Đã chọn" : `${unit.count} từ`}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 space-y-2">
              {isJpd123 && isAiModeTab ? (
                <Button
                  className="w-full flex items-center justify-center gap-2 py-3"
                  tone="seal"
                  onClick={() => startAiExam(selected.length ? selected : ["4", "5", "6", "7"])}
                >
                  <Sparkles className="size-4" />
                  Bắt đầu làm đề thi AI (30 câu chuẩn Form FPT)
                </Button>
              ) : (
                <Button
                  className="w-full"
                  tone="seal"
                  disabled={isStarred ? starredWords.length === 0 : selected.length === 0}
                  onClick={startStandard}
                >
                  {isStarred
                    ? selected.length
                      ? `Bắt đầu làm bài · Bài ${selected.join(" + ")}`
                      : `Bắt đầu làm bài · Tất cả ${starredWords.length} từ`
                    : `Làm ${EXAM_SIZE} câu ${selected.length ? `· Bài ${selected.join(" + ")}` : ""}`}
                </Button>
              )}
            </div>

            {note ? <p className="mt-3 text-sm text-seal">{note}</p> : null}
          </>
        )}

        {/* AI Settings Modal */}
        {showAiSettings && (
          <AiSettingsModal
            settings={aiSettings}
            onClose={() => setShowAiSettings(false)}
            onSave={handleSaveAiSettings}
          />
        )}

        {/* AI Generating Overlay */}
        {isGeneratingAi && <AiGeneratingOverlay step={generationStep} />}
      </div>
    );
  }

  // --- SCREEN 3: Exam in progress or Exam Results ---
  const done = closed || index >= paper.length;
  const correct = answers.filter((answer, answerIndex) => answer === paper[answerIndex]?.answer).length;

  if (done) {
    const missed = paper.filter((question, questionIndex) => answers[questionIndex] !== question.answer);
    return (
      <div>
        <p className="text-sm tracking-wide text-stone uppercase">Kết quả bài kiểm tra</p>
        <p className="display mt-2 text-5xl tabular-nums">
          {correct}
          <span className="text-2xl text-stone">/{paper.length}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-stone text-sm">
          {isAiExam && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 font-medium text-xs border border-amber-500/20">
              <Bot className="size-3" />
              Đề thi AI JPD123 FPT
            </span>
          )}
          <span>
            {search.course === "starred"
              ? `Từ vựng đã đánh dấu${selected.length ? ` · Bài ${selected.join(", ")}` : " · Tất cả"}`
              : `${search.course} · Bài ${selected.join(", ")}`}
            {left === 0 ? " · Hết giờ" : ""}
          </span>
        </div>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {(["Kanji", "Từ vựng", "Ngữ pháp"] as const).map((section) => {
            const rows = paper
              .map((question, questionIndex) => ({ question, questionIndex }))
              .filter(({ question }) => question.section === section);
            if (!rows.length) return null;
            const hit = rows.filter(({ question, questionIndex }) => answers[questionIndex] === question.answer).length;
            return (
              <li key={section} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium">{section}</span>
                <span className="tabular-nums text-stone">
                  {hit}/{rows.length}
                </span>
              </li>
            );
          })}
        </ul>

        {missed.length ? (
          <div className="mt-8">
            <h2 className="text-sm font-semibold tracking-wide text-stone uppercase">Các câu cần xem lại ({missed.length})</h2>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {missed.map((question) => {
                const isMissedReadingQ =
                  question.section === "Kanji" &&
                  (question.prompt.includes("cách đọc") ||
                    question.prompt.includes("読み方") ||
                    question.prompt.includes("âm Hán") ||
                    question.prompt.includes("âm thuần Nhật"));
                const answerReading = !isMissedReadingQ ? findReading(question.answer) : null;
                return (
                  <li key={question.id} className="py-3">
                    <p className="text-sm text-stone">
                      Câu {question.id} · {question.section}
                    </p>
                    <p className="mt-1 text-sm">{question.prompt}</p>
                    <div className="mt-2">
                      <Sentence text={question.sentence} compact isReadingQuestion={isMissedReadingQ} />
                    </div>
                    <p className="mt-1 text-sm">
                      Đáp án đúng: <span className="font-semibold text-seal">{question.answer}</span>
                      {answerReading ? (
                        <span className="text-stone font-normal ml-1.5">
                          ({answerReading})
                        </span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-stone">Xuất sắc! Bạn đã trả lời đúng tất cả các câu.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button tone="ghost" onClick={() => setPaper(null)}>
            Đổi bài
          </Button>
          {isAiExam ? (
            <Button
              tone="seal"
              onClick={() => startAiExam(selected.length ? selected : ["4", "5", "6", "7"])}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="size-4" />
              Tạo đề AI mới (30 câu)
            </Button>
          ) : (
            <Button tone="seal" onClick={startStandard}>
              Làm lại đề này
            </Button>
          )}
        </div>

        {/* AI Settings Modal */}
        {showAiSettings && (
          <AiSettingsModal
            settings={aiSettings}
            onClose={() => setShowAiSettings(false)}
            onSave={handleSaveAiSettings}
          />
        )}

        {/* AI Generating Overlay */}
        {isGeneratingAi && <AiGeneratingOverlay step={generationStep} />}
      </div>
    );
  }

  const current = paper[index];
  if (!current) return null;

  const isReadingQuestion =
    current.section === "Kanji" &&
    (current.prompt.includes("cách đọc") ||
      current.prompt.includes("読み方") ||
      current.prompt.includes("âm Hán") ||
      current.prompt.includes("âm thuần Nhật") ||
      current.prompt.includes("onyomi") ||
      current.prompt.includes("kunyomi"));

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, answerIndex) => (answerIndex === index ? option : answer)),
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-stone">
        <div className="flex items-center gap-2">
          <span className="tabular-nums font-medium text-ink">
            Câu {index + 1} / {paper.length}
          </span>
          {isAiExam && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-700 border border-amber-500/20">
              <Bot className="size-3" />
              Đề thi AI JPD123 FPT
            </span>
          )}
        </div>
        <span className={cn("tabular-nums font-medium", left < 300 && "text-seal")}>{formatTime(left)}</span>
      </div>
      <ProgressLine value={index} max={paper.length} />

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-medium text-stone tracking-wide uppercase">{current.section}</p>
        <span className="text-xs text-stone">Chuẩn Form JPD123</span>
      </div>

      {current.promptJp ? <p className="jp mt-3 text-base leading-relaxed text-ink">{current.promptJp}</p> : null}
      <h1 className="mt-2 text-lg font-medium leading-snug text-ink">{current.prompt}</h1>
      <div className="mt-4 rounded-md border border-line bg-sheet px-5 py-6">
        <Sentence text={current.sentence} isReadingQuestion={isReadingQuestion} />
      </div>
      <div className="mt-3 grid gap-2">
        {current.options.map((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const isAnswer = option === current.answer;
          const selectedOption = picked === option;
          let tone = "border-line bg-sheet text-ink hover:border-stone";
          if (picked && isAnswer) tone = "border-ink bg-ink text-paper";
          else if (selectedOption) tone = "border-seal bg-seal/10 text-seal";

          const reading = !isReadingQuestion ? findReading(option) : null;
          const readingTone =
            picked && isAnswer
              ? "text-paper/80"
              : selectedOption
                ? "text-seal"
                : "text-stone";

          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(option)}
              className={cn(
                "flex min-h-12 items-start gap-3 rounded-md border px-4 py-3 text-left text-base transition-colors",
                tone,
              )}
            >
              <span className="mt-0.5 w-6 shrink-0 font-medium">{letter}.</span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "break-words block font-medium",
                    /[ぁ-んァ-ヶ一-龯]/.test(option) && "jp text-lg leading-tight",
                  )}
                >
                  {option}
                </span>
                {reading ? (
                  <span className={cn("block text-xs mt-0.5 tracking-wide", readingTone)}>
                    {reading}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <div ref={nextRef} className="mt-4 flex min-h-10 items-center justify-between">
        {picked ? (
          <p className="text-sm text-stone">
            {picked === current.answer ? "Chính xác." : `Chưa đúng. Đáp án: ${current.answer}`}
          </p>
        ) : (
          <span />
        )}
        {picked ? (
          <Button
            tone="seal"
            onClick={() => {
              setIndex((value) => value + 1);
              setPicked(null);
            }}
          >
            {index + 1 >= paper.length ? "Xem kết quả" : "Câu tiếp theo →"}
          </Button>
        ) : null}
      </div>

      {/* AI Generating Overlay */}
      {isGeneratingAi && <AiGeneratingOverlay step={generationStep} />}
    </div>
  );
}

function Sentence({
  text,
  compact = false,
  isReadingQuestion = false,
}: {
  text: string;
  compact?: boolean;
  isReadingQuestion?: boolean;
}) {
  const trimmed = text.trim();
  if (/^〔[^〕]+〕$/.test(trimmed)) {
    const target = trimmed.slice(1, -1);
    const reading = !isReadingQuestion ? findReading(target) : null;
    return (
      <div className={cn("text-center", compact ? "py-1" : "py-2")}>
        <span
          className={cn(
            "jp block font-medium text-ink break-words",
            compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl",
          )}
        >
          {target}
        </span>
        {reading ? (
          <span
            className={cn(
              "jp block text-stone font-normal tracking-wide break-words",
              compact ? "text-sm mt-0.5" : "text-base sm:text-lg mt-1.5",
            )}
          >
            {reading}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("jp leading-loose text-ink", compact ? "text-base leading-relaxed" : "text-xl")}>
      {text.split("\n").map((line, lineIndex) => (
        <p key={lineIndex}>{renderLine(line, isReadingQuestion)}</p>
      ))}
    </div>
  );
}

function renderLine(line: string, isReadingQuestion: boolean) {
  const chunks = line.split(/(〔[^〕]*〕)/);
  return chunks.map((chunk, index) => {
    if (!chunk.startsWith("〔")) return <span key={index}>{chunk}</span>;
    const target = chunk.slice(1, -1);
    const reading = !isReadingQuestion ? findReading(target) : null;
    return (
      <span key={index} className="inline-block mx-1">
        （　
        <span className="underline decoration-seal underline-offset-4 font-medium text-ink">
          {target}
        </span>
        {reading ? <span className="text-sm font-normal text-stone ml-1">({reading})</span> : null}
        　）
      </span>
    );
  });
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Overlay hiển thị tiến trình AI biên soạn đề thi JPD123 FPT
 */
function AiGeneratingOverlay({ step }: { step: number }) {
  const steps = [
    "Khởi tạo ma trận đề thi JPD123 Đại học FPT...",
    "Phân tích chuẩn môn học: 10 Kanji · 10 Từ vựng · 10 Ngữ pháp...",
    "Soạn câu hỏi & ngữ cảnh Minna / Marugoto Sơ cấp 2 (Bài 4–7)...",
    "Thẩm định 4 đáp án A–B–C–D và chuẩn hoá Hiragana/Katakana...",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-sheet p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
            <Bot className="size-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-ink text-base">
              Trợ lý AI đang tạo đề thi JPD123 FPT
            </h3>
            <p className="text-xs text-stone">Mô phỏng 100% đề thi kết thúc môn</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {steps.map((text, idx) => {
            const isDone = step > idx;
            const isCurrent = step === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 text-sm transition-all",
                  isDone ? "text-ink font-medium" : isCurrent ? "text-amber-700 font-medium" : "text-stone/60",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-amber-600" />
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-stone/30" />
                )}
                <span className="text-xs leading-normal">{text}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-line text-center">
          <span className="text-xs text-stone">Chuẩn bị bước vào bài thi 30 câu (30 phút)...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal cấu hình nhà cung cấp AI (Google Gemini, xAI Grok, OpenAI, Groq)
 */
function AiSettingsModal({
  settings,
  onClose,
  onSave,
}: {
  settings: AiSettings;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
}) {
  const [provider, setProvider] = useState<AiProvider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || "");

  function handleSave() {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-line bg-sheet p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-amber-600" />
            <h2 className="font-semibold text-ink text-lg">Cấu hình Trợ lý AI (Exam Generator)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone hover:text-ink p-1 rounded-md"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-ink mb-1.5">Mô hình AI / Nhà cung cấp</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm focus:outline-hidden focus:ring-1 focus:ring-ink"
            >
              <option value="built-in">🧠 AI Engine Tích hợp (Mặc định - Miễn phí 100%, không cần API Key)</option>
              <option value="gemini">⚡ Google Gemini (Khuyên dùng - Hỗ trợ Key miễn phí Google AI Studio)</option>
              <option value="xai">🚀 xAI Grok (Grok-4.5 / Grok Beta)</option>
              <option value="openai">🌐 OpenAI (GPT-4o Mini)</option>
              <option value="groq">⚡ Groq (Llama 3.3 70B Siêu tốc)</option>
            </select>
          </div>

          {provider === "built-in" ? (
            <div className="rounded-md bg-paper border border-line p-3 text-xs text-stone space-y-1">
              <p className="font-medium text-ink">Chế độ AI Tích hợp sẵn (Sumi FPT Engine):</p>
              <p>• Hoàn toàn miễn phí, chạy trực tiếp không cần đăng ký tài khoản hay API Key.</p>
              <p>• Thuật toán sinh đề mô phỏng chuẩn 100% form đề thi kết thúc môn JPD123 Đại học FPT.</p>
              <p>• Mỗi lượt thi được làm mới câu hỏi, hỗ trợ đầy đủ Furigana và bảng đối chiếu đáp án.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-ink mb-1">
                  API Key của bạn ({provider.toUpperCase()})
                </label>
                <input
                  type="password"
                  placeholder="Dán API Key vào đây..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm font-mono placeholder:text-stone/50 focus:outline-hidden focus:ring-1 focus:ring-ink"
                />
                <p className="mt-1 text-xs text-stone">
                  {provider === "gemini" && (
                    <>
                      Lấy API key Google Gemini miễn phí tại{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-ink font-medium"
                      >
                        Google AI Studio
                      </a>
                    </>
                  )}
                  {provider === "xai" && "Lấy API key tại console.x.ai."}
                  {provider === "openai" && "Lấy API key tại platform.openai.com."}
                  {provider === "groq" && "Lấy API key tại console.groq.com."}
                </p>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">
                  Model (Tuỳ chọn - để trống sẽ dùng model mặc định)
                </label>
                <input
                  type="text"
                  placeholder={
                    provider === "gemini"
                      ? "gemini-1.5-flash"
                      : provider === "xai"
                        ? "grok-4.5"
                        : provider === "openai"
                          ? "gpt-4o-mini"
                          : "llama-3.3-70b-versatile"
                  }
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink text-sm placeholder:text-stone/50 focus:outline-hidden focus:ring-1 focus:ring-ink"
                />
              </div>

              <div className="rounded-md bg-paper border border-line p-3 text-xs text-stone">
                🔒 API Key được lưu an toàn trực tiếp trên trình duyệt máy bạn (localStorage), không gửi về máy chủ thứ ba nào khác.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
          <Button tone="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button tone="seal" onClick={handleSave}>
            Lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  );
}
