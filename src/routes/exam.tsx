import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckSquare, Play, Sparkles, Square, Star } from "lucide-react";
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

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): ExamSearch => ({
    course:
      search.course === "JPD113" || search.course === "JPD123" || search.course === "starred"
        ? search.course
        : "",
    bai: typeof search.bai === "string" ? search.bai : "",
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

  const selected = search.bai ? search.bai.split(",").filter(Boolean) : [];
  const starredWords = vocabulary.filter((word) => starred.includes(word.id));

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

  function start() {
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
      setPaper(next);
      setIndex(0);
      setPicked(null);
      setAnswers(Array(next.length).fill(null));
      setLeft(Math.max(next.length * 60, 300));
      setClosed(false);
      return;
    }

    if (selected.length === 0) return;
    const next = buildExam(search.course, selected);
    if (next.length < EXAM_SIZE) {
      setNote("Bài này chưa đủ dữ liệu để lập đề 30 câu. Hãy gộp thêm bài.");
      return;
    }
    setNote("");
    setPaper(next);
    setIndex(0);
    setPicked(null);
    setAnswers(Array(next.length).fill(null));
    setLeft(EXAM_SECONDS);
    setClosed(false);
  }

  // --- SCREEN 1: Choose Course or Starred Words Exam ---
  if (!search.course) {
    return (
      <div>
        <p className="text-sm tracking-[0.18em] text-stone uppercase">Kiểm tra</p>
        <h1 className="display mt-2 text-4xl">Chọn nội dung kiểm tra.</h1>
        <p className="mt-2 text-stone">
          Đề thi trắc nghiệm A–D. Vẫn là kanji, từ vựng và ngữ pháp — cách hỏi đa dạng: âm on/kun, nghĩa chữ,
          nhóm từ, dịch câu, điền từ vào chỗ trống và tình huống.
        </p>

        {/* Highlighted Starred Words Exam Card */}
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
          <h2 className="text-sm tracking-wide text-stone uppercase">Theo môn học</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {(["JPD113", "JPD123"] as const).map((course) => (
              <li key={course}>
                <button
                  type="button"
                  className="flex min-h-14 w-full flex-col items-start justify-center py-3 text-left transition-colors hover:text-ink"
                  onClick={() => setSearch({ course, bai: "" })}
                >
                  <span className="font-medium">{course}</span>
                  <span className="text-sm text-stone">{course === "JPD113" ? "Sơ cấp 1" : "Sơ cấp 2 · bài 4–7"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: Unit / Lesson selection before starting exam ---
  if (!paper) {
    const units = examUnits(search.course, starred);
    const isStarred = search.course === "starred";

    return (
      <div>
        <button
          type="button"
          className="text-sm text-stone hover:text-ink"
          onClick={() => setSearch({ course: "", bai: "" })}
        >
          ← Đổi môn
        </button>
        <div className="mt-2 flex items-center gap-2">
          {isStarred && <Star className="size-6 fill-amber-500 text-amber-500" />}
          <h1 className="display text-4xl">
            {isStarred ? "Từ vựng đã đánh dấu" : search.course}
          </h1>
        </div>

        <p className="mt-2 text-stone">
          {isStarred
            ? "Đề thi trắc nghiệm A–D được lập riêng từ các từ vựng bạn đã đánh dấu. Bạn có thể chọn tất cả hoặc chọn theo từng bài."
            : "Chọn một bài hoặc gộp nhiều bài. Câu vẫn về từ vựng, kanji và ngữ pháp của các bài đó, nhưng cách hỏi sẽ khác nhau."}
        </p>

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

            <Button
              className="mt-6 w-full"
              tone="seal"
              disabled={isStarred ? starredWords.length === 0 : selected.length === 0}
              onClick={start}
            >
              {isStarred
                ? selected.length
                  ? `Bắt đầu làm bài · Bài ${selected.join(" + ")}`
                  : `Bắt đầu làm bài · Tất cả ${starredWords.length} từ`
                : `Làm ${EXAM_SIZE} câu ${selected.length ? `· Bài ${selected.join(" + ")}` : ""}`}
            </Button>

            {note ? <p className="mt-3 text-sm text-seal">{note}</p> : null}
          </>
        )}
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
        <p className="mt-2 text-stone">
          {search.course === "starred"
            ? `Từ vựng đã đánh dấu${selected.length ? ` · Bài ${selected.join(", ")}` : " · Tất cả"}`
            : `${search.course} · Bài ${selected.join(", ")}`}
          {left === 0 ? " · Hết giờ" : ""}
        </p>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {(["Kanji", "Từ vựng", "Ngữ pháp"] as const).map((section) => {
            const rows = paper
              .map((question, questionIndex) => ({ question, questionIndex }))
              .filter(({ question }) => question.section === section);
            if (!rows.length) return null;
            const hit = rows.filter(({ question, questionIndex }) => answers[questionIndex] === question.answer).length;
            return (
              <li key={section} className="flex items-center justify-between py-3 text-sm">
                <span>{section}</span>
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

        <div className="mt-6 flex gap-2">
          <Button tone="ghost" onClick={() => setPaper(null)}>
            Đổi bài
          </Button>
          <Button tone="seal" onClick={start}>
            Làm lại đề này
          </Button>
        </div>
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
        <span className="tabular-nums">
          Câu {index + 1} / {paper.length}
        </span>
        <span className={cn("tabular-nums font-medium", left < 300 && "text-seal")}>{formatTime(left)}</span>
      </div>
      <ProgressLine value={index} max={paper.length} />
      <p className="mt-5 text-sm font-medium text-stone tracking-wide uppercase">{current.section}</p>
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
      {picked ? (
        <div ref={nextRef} className="mt-4 scroll-mb-36">
          <Button
            className="w-full"
            tone="seal"
            onClick={() => {
              setPicked(null);
              setIndex((value) => value + 1);
            }}
          >
            {index + 1 === paper.length ? "Nộp bài" : "Tiếp theo"}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-4 text-sm text-stone hover:text-ink"
          onClick={() => setClosed(true)}
        >
          Nộp bài sớm
        </button>
      )}
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
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
